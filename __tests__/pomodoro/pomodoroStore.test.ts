import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'

// ---- Mocks (must be hoisted before importing the store) ----

// Mock Supabase server actions invoked by the store. These are 'use server'
// modules in production; we never want a real network call inside unit tests.
vi.mock('@/features/pomodoro/actions', () => ({
  createPomodoroTask: vi.fn(async () => ({})),
  deletePomodoroTask: vi.fn(async () => ({})),
  listPomodoroTasks: vi.fn(async () => []),
  reorderPomodoroTasks: vi.fn(async () => ({})),
  updatePomodoroTask: vi.fn(async () => ({})),
  getPomodoroSettings: vi.fn(async () => null),
  upsertPomodoroSettings: vi.fn(async () => ({})),
}))

// Mock the browser supabase client too — defensive in case anything indirectly imports it.
vi.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    rpc: vi.fn(async () => ({ data: null, error: null })),
    auth: { getUser: vi.fn(async () => ({ data: { user: null } })) },
  }),
}))

import { usePomodoroStore } from '@/store/pomodoroStore'

const DEFAULT_WORK = 1500
const DEFAULT_SHORT = 300
const DEFAULT_LONG = 900

function resetStore() {
  // Reset Zustand store to its initial values between tests.
  usePomodoroStore.setState({
    phase: 'work',
    timeLeft: DEFAULT_WORK,
    isRunning: false,
    sessionCount: 0,
    tasks: [],
    activeTaskId: null,
    settings: {
      workDuration: DEFAULT_WORK,
      shortDuration: DEFAULT_SHORT,
      longDuration: DEFAULT_LONG,
      sessionsUntilLong: 4,
      soundscape: 'silent',
      volume: 0.5,
      blockedSites: [],
      focusBlockerEnabled: false,
    },
    startedAt: null,
    pausedAt: null,
    interruptions: 0,
    hydrated: false,
  })
}

describe('usePomodoroStore', () => {
  beforeEach(() => {
    resetStore()
    // Stub fetch so onSessionComplete's POST doesn't hit the network.
    vi.stubGlobal(
      'fetch',
      vi.fn(async () =>
        new Response(JSON.stringify({ xpAwarded: undefined, leveledUp: false }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      )
    )
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  describe('initial state', () => {
    it('starts in idle work phase with the default work duration', () => {
      const s = usePomodoroStore.getState()
      expect(s.phase).toBe('work')
      expect(s.timeLeft).toBe(DEFAULT_WORK)
      expect(s.isRunning).toBe(false)
      expect(s.sessionCount).toBe(0)
      expect(s.interruptions).toBe(0)
      expect(s.startedAt).toBeNull()
      expect(s.pausedAt).toBeNull()
    })
  })

  describe('startTimer', () => {
    it('flips isRunning to true and captures startedAt', () => {
      const before = Date.now()
      usePomodoroStore.getState().startTimer()
      const s = usePomodoroStore.getState()
      expect(s.isRunning).toBe(true)
      expect(s.startedAt).not.toBeNull()
      expect(s.startedAt!).toBeGreaterThanOrEqual(before)
      expect(s.pausedAt).toBeNull()
    })
  })

  describe('pauseTimer', () => {
    it('sets isRunning false, records pausedAt, and increments interruptions', () => {
      usePomodoroStore.getState().startTimer()
      expect(usePomodoroStore.getState().interruptions).toBe(0)

      usePomodoroStore.getState().pauseTimer()
      const s = usePomodoroStore.getState()
      expect(s.isRunning).toBe(false)
      expect(s.pausedAt).not.toBeNull()
      expect(s.interruptions).toBe(1)
    })

    it('accumulates interruptions on repeated pauses', () => {
      const { pauseTimer } = usePomodoroStore.getState()
      pauseTimer()
      pauseTimer()
      pauseTimer()
      expect(usePomodoroStore.getState().interruptions).toBe(3)
    })
  })

  describe('resetTimer', () => {
    it('returns to a clean idle state at the phase duration', () => {
      const { startTimer, pauseTimer, resetTimer } = usePomodoroStore.getState()
      startTimer()
      // simulate some elapsed work
      usePomodoroStore.setState({ timeLeft: 300 })
      pauseTimer()

      resetTimer()
      const s = usePomodoroStore.getState()
      expect(s.timeLeft).toBe(DEFAULT_WORK)
      expect(s.isRunning).toBe(false)
      expect(s.startedAt).toBeNull()
      expect(s.pausedAt).toBeNull()
      // NOTE: resetTimer intentionally does NOT clear interruptions
      // (only skipPhase / onSessionComplete do). See current source.
    })
  })

  describe('onSessionComplete — XP grant', () => {
    it('dispatches jl:xp-gain with base 10 + clean bonus 5 when interruptions === 0', async () => {
      const dispatchSpy = vi.spyOn(window, 'dispatchEvent')
      // Force fetch to throw so we hit the catch branch and use the local xpAwarded value.
      vi.stubGlobal('fetch', vi.fn(async () => { throw new Error('offline') }))

      await usePomodoroStore.getState().onSessionComplete()

      const xpEvents = dispatchSpy.mock.calls
        .map(c => c[0])
        .filter(e => (e as CustomEvent).type === 'jl:xp-gain') as CustomEvent[]
      expect(xpEvents.length).toBeGreaterThan(0)
      const detail = xpEvents[0].detail as { amount: number }
      expect(detail.amount).toBe(15) // 10 base + 5 clean bonus
    })

    it('dispatches jl:xp-gain with only base 10 when interruptions > 0', async () => {
      const dispatchSpy = vi.spyOn(window, 'dispatchEvent')
      vi.stubGlobal('fetch', vi.fn(async () => { throw new Error('offline') }))

      usePomodoroStore.setState({ interruptions: 2 })
      await usePomodoroStore.getState().onSessionComplete()

      const xpEvents = dispatchSpy.mock.calls
        .map(c => c[0])
        .filter(e => (e as CustomEvent).type === 'jl:xp-gain') as CustomEvent[]
      expect(xpEvents.length).toBeGreaterThan(0)
      const detail = xpEvents[0].detail as { amount: number }
      expect(detail.amount).toBe(10)
    })

    it('clears interruptions after a session completes', async () => {
      usePomodoroStore.setState({ interruptions: 3 })
      await usePomodoroStore.getState().onSessionComplete()
      expect(usePomodoroStore.getState().interruptions).toBe(0)
    })
  })

  describe('isClean (interruptions semantics)', () => {
    it('is "clean" (true) when interruptions === 0', () => {
      const s = usePomodoroStore.getState()
      expect(s.interruptions === 0).toBe(true)
    })

    it('is not clean (false) once interruptions > 0', () => {
      usePomodoroStore.getState().pauseTimer()
      const s = usePomodoroStore.getState()
      expect(s.interruptions === 0).toBe(false)
    })
  })

  describe('phase rotation', () => {
    it('rotates work -> short break for non-Nth completion', () => {
      // sessionCount = 0 → after one work, becomes 1, 1 % 4 !== 0 → short
      usePomodoroStore.getState().skipPhase()
      const s = usePomodoroStore.getState()
      expect(s.phase).toBe('short')
      expect(s.sessionCount).toBe(1)
      expect(s.timeLeft).toBe(DEFAULT_SHORT)
    })

    it('rotates work -> long break on the Nth (4th) work session', () => {
      // Simulate 3 completed work sessions already; next work → long break.
      usePomodoroStore.setState({ sessionCount: 3, phase: 'work' })
      usePomodoroStore.getState().skipPhase()
      const s = usePomodoroStore.getState()
      expect(s.phase).toBe('long')
      expect(s.sessionCount).toBe(4)
      expect(s.timeLeft).toBe(DEFAULT_LONG)
    })

    it('rotates break -> work', () => {
      usePomodoroStore.setState({ phase: 'short', sessionCount: 1 })
      usePomodoroStore.getState().skipPhase()
      const s = usePomodoroStore.getState()
      expect(s.phase).toBe('work')
      // sessionCount only bumps when leaving a work phase.
      expect(s.sessionCount).toBe(1)
      expect(s.timeLeft).toBe(DEFAULT_WORK)
    })

    it('respects a custom sessionsUntilLong setting', () => {
      usePomodoroStore.setState({
        sessionCount: 1,
        phase: 'work',
        settings: {
          ...usePomodoroStore.getState().settings,
          sessionsUntilLong: 2,
        },
      })
      usePomodoroStore.getState().skipPhase()
      // sessionCount becomes 2; 2 % 2 === 0 → long break
      expect(usePomodoroStore.getState().phase).toBe('long')
    })
  })

  describe('Supabase RPC isolation', () => {
    it('does not call the real Supabase client during a session complete cycle', async () => {
      // Just confirm onSessionComplete runs to completion under our mocks.
      await expect(usePomodoroStore.getState().onSessionComplete()).resolves.toBeUndefined()
      expect(usePomodoroStore.getState().interruptions).toBe(0)
    })
  })
})
