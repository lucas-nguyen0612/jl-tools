import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'

// Mock store action layer so importing the store doesn't pull in 'use server' modules.
vi.mock('@/features/pomodoro/actions', () => ({
  createPomodoroTask: vi.fn(async () => ({})),
  deletePomodoroTask: vi.fn(async () => ({})),
  listPomodoroTasks: vi.fn(async () => []),
  reorderPomodoroTasks: vi.fn(async () => ({})),
  updatePomodoroTask: vi.fn(async () => ({})),
  getPomodoroSettings: vi.fn(async () => null),
  upsertPomodoroSettings: vi.fn(async () => ({})),
}))

vi.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    rpc: vi.fn(async () => ({ data: null, error: null })),
    auth: { getUser: vi.fn(async () => ({ data: { user: null } })) },
  }),
}))

import { useTimer } from '@/hooks/useTimer'
import { usePomodoroStore } from '@/store/pomodoroStore'

const DEFAULT_WORK = 1500

function resetStore() {
  usePomodoroStore.setState({
    phase: 'work',
    timeLeft: DEFAULT_WORK,
    isRunning: false,
    sessionCount: 0,
    tasks: [],
    activeTaskId: null,
    settings: {
      workDuration: DEFAULT_WORK,
      shortDuration: 300,
      longDuration: 900,
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

// Drive RAF with fake timers. The hook's loop schedules itself via
// requestAnimationFrame; we polyfill that to a setTimeout so vi.advanceTimersByTime
// can deterministically progress frames.
function installRafPolyfill() {
  let id = 0
  const handles = new Map<number, ReturnType<typeof setTimeout>>()
  vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => {
    const myId = ++id
    const t = setTimeout(() => cb(performance.now()), 16)
    handles.set(myId, t)
    return myId
  })
  vi.stubGlobal('cancelAnimationFrame', (handleId: number) => {
    const t = handles.get(handleId)
    if (t) {
      clearTimeout(t)
      handles.delete(handleId)
    }
  })
}

describe('useTimer', () => {
  beforeEach(() => {
    resetStore()
    vi.useFakeTimers()
    installRafPolyfill()
    // Stub fetch in case onSessionComplete fires.
    vi.stubGlobal(
      'fetch',
      vi.fn(async () =>
        new Response(JSON.stringify({ xpAwarded: 15, leveledUp: false }), {
          status: 200,
        })
      )
    )
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  it('does not tick while isRunning is false', () => {
    renderHook(() => useTimer())
    const before = usePomodoroStore.getState().timeLeft

    act(() => {
      vi.advanceTimersByTime(5_000)
    })

    expect(usePomodoroStore.getState().timeLeft).toBe(before)
  })

  it('decrements timeLeft once per second when running', () => {
    renderHook(() => useTimer())

    act(() => {
      usePomodoroStore.getState().startTimer()
    })

    const start = usePomodoroStore.getState().timeLeft

    // Advance ~3 seconds of wall + frame time. RAF fires every 16ms; tick()
    // runs only when a full second has elapsed since lastTickRef.
    act(() => {
      vi.advanceTimersByTime(3_100)
    })

    const after = usePomodoroStore.getState().timeLeft
    // Allow ±1 fudge — the loop checks "now - lastTickRef >= 1000" so the
    // exact count depends on frame alignment.
    expect(start - after).toBeGreaterThanOrEqual(2)
    expect(start - after).toBeLessThanOrEqual(4)
  })

  it('stops scheduling ticks when paused', () => {
    renderHook(() => useTimer())
    act(() => {
      usePomodoroStore.getState().startTimer()
    })
    act(() => {
      vi.advanceTimersByTime(2_100)
    })
    const midway = usePomodoroStore.getState().timeLeft
    expect(midway).toBeLessThan(DEFAULT_WORK)

    act(() => {
      usePomodoroStore.getState().pauseTimer()
    })
    act(() => {
      vi.advanceTimersByTime(5_000)
    })

    // After pause, timeLeft should not have moved further.
    expect(usePomodoroStore.getState().timeLeft).toBe(midway)
  })

  it('catches up missed seconds on visibility change back to visible', () => {
    renderHook(() => useTimer())
    act(() => {
      usePomodoroStore.getState().startTimer()
    })

    // Simulate the tab going hidden after 1 second.
    act(() => {
      vi.advanceTimersByTime(1_100)
    })
    const beforeHide = usePomodoroStore.getState().timeLeft

    // Mark hidden and dispatch event (the hook listens for 'visibilitychange').
    Object.defineProperty(document, 'hidden', {
      configurable: true,
      get: () => true,
    })
    act(() => {
      document.dispatchEvent(new Event('visibilitychange'))
    })

    // Advance "real wall time" by 10 seconds while hidden. We can't rely on
    // performance.now() under fake timers to advance, so we fake Date.now.
    const dateNowSpy = vi.spyOn(Date, 'now')
    const baseNow = Date.now()
    dateNowSpy.mockReturnValue(baseNow + 10_000)

    // Now flip back to visible.
    Object.defineProperty(document, 'hidden', {
      configurable: true,
      get: () => false,
    })
    act(() => {
      document.dispatchEvent(new Event('visibilitychange'))
    })

    const afterShow = usePomodoroStore.getState().timeLeft
    // Should have caught up ~10 seconds beyond the pre-hide value.
    expect(beforeHide - afterShow).toBeGreaterThanOrEqual(8)
  })

  it('triggers onSessionComplete when timeLeft reaches 0 during work', async () => {
    // Set the timer to 1 second of work so a single tick triggers complete.
    usePomodoroStore.setState({ timeLeft: 1, phase: 'work' })

    renderHook(() => useTimer())

    act(() => {
      usePomodoroStore.getState().startTimer()
    })

    // Advance enough for at least one full-second tick to fire.
    await act(async () => {
      vi.advanceTimersByTime(1_200)
      // Let any microtasks settled by the (async) onSessionComplete resolve.
      await Promise.resolve()
    })

    // After completion, the store should have advanced past the work phase
    // (skipPhase is called from inside onSessionComplete) — phase becomes
    // 'short' or 'long', sessionCount bumps to 1, and timeLeft is reset.
    const s = usePomodoroStore.getState()
    expect(['short', 'long']).toContain(s.phase)
    expect(s.sessionCount).toBe(1)
    expect(s.isRunning).toBe(false)
  })
})
