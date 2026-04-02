import { describe, it, expect } from 'vitest'
import {
  pomodoroReducer,
  getNextPhase,
  getPhaseDuration,
  type PomodoroState,
  type PomodoroAction,
  type TimerPhase,
} from './usePomodoroTimer'
import type { PomodoroSettings } from '@/types/pomodoro'

const DEFAULT_SETTINGS: PomodoroSettings = {
  focusDuration: 25,
  shortBreakDuration: 5,
  longBreakDuration: 15,
  sessionsBeforeLongBreak: 4,
}

const initialState: PomodoroState = {
  phase: 'focus',
  status: 'idle',
  secondsRemaining: 25 * 60,
  sessionsCompleted: 0,
  totalSessionsToday: 0,
  settings: DEFAULT_SETTINGS,
  sessionStartTime: null,
}

function run(state: PomodoroState, action: PomodoroAction): PomodoroState {
  return pomodoroReducer(state, action)
}

describe('getPhaseDuration', () => {
  it('returns focus duration in seconds', () => {
    expect(getPhaseDuration('focus', DEFAULT_SETTINGS)).toBe(25 * 60)
  })

  it('returns short break duration in seconds', () => {
    expect(getPhaseDuration('shortBreak', DEFAULT_SETTINGS)).toBe(5 * 60)
  })

  it('returns long break duration in seconds', () => {
    expect(getPhaseDuration('longBreak', DEFAULT_SETTINGS)).toBe(15 * 60)
  })

  it('respects custom settings', () => {
    const custom = { ...DEFAULT_SETTINGS, focusDuration: 45 }
    expect(getPhaseDuration('focus', custom)).toBe(45 * 60)
  })
})

describe('getNextPhase', () => {
  it('focus → shortBreak after session 1', () => {
    // sessionsCompleted=0 → nextCount=1 → 1%4=1 → shortBreak
    expect(getNextPhase('focus', 0, DEFAULT_SETTINGS)).toBe('shortBreak')
  })

  it('focus → shortBreak after session 2', () => {
    // sessionsCompleted=1 → nextCount=2 → 2%4=2 → shortBreak
    expect(getNextPhase('focus', 1, DEFAULT_SETTINGS)).toBe('shortBreak')
  })

  it('focus → longBreak after session 4', () => {
    // sessionsCompleted=3 → nextCount=4 → 4%4=0 → longBreak
    expect(getNextPhase('focus', 3, DEFAULT_SETTINGS)).toBe('longBreak')
  })

  it('focus → longBreak after session 8', () => {
    // sessionsCompleted=7 → nextCount=8 → 8%4=0 → longBreak
    expect(getNextPhase('focus', 7, DEFAULT_SETTINGS)).toBe('longBreak')
  })

  it('shortBreak → focus', () => {
    expect(getNextPhase('shortBreak', 1, DEFAULT_SETTINGS)).toBe('focus')
  })

  it('longBreak → focus', () => {
    expect(getNextPhase('longBreak', 4, DEFAULT_SETTINGS)).toBe('focus')
  })

  it('respects sessionsBeforeLongBreak setting', () => {
    const settings = { ...DEFAULT_SETTINGS, sessionsBeforeLongBreak: 2 }
    // sessionsCompleted=1 → nextCount=2 → 2%2=0 → longBreak
    expect(getNextPhase('focus', 1, settings)).toBe('longBreak')
    // sessionsCompleted=0 → nextCount=1 → 1%2=1 → shortBreak
    expect(getNextPhase('focus', 0, settings)).toBe('shortBreak')
  })
})

describe('START action', () => {
  it('sets status to running', () => {
    const next = run(initialState, { type: 'START' })
    expect(next.status).toBe('running')
  })

  it('sets secondsRemaining to phase duration', () => {
    const next = run(initialState, { type: 'START' })
    expect(next.secondsRemaining).toBe(25 * 60)
  })

  it('sets sessionStartTime', () => {
    const next = run(initialState, { type: 'START' })
    expect(next.sessionStartTime).not.toBeNull()
  })

  it('does not reset phase', () => {
    const state = { ...initialState, phase: 'shortBreak' as TimerPhase, secondsRemaining: 5 * 60 }
    const next = run(state, { type: 'START' })
    expect(next.phase).toBe('shortBreak')
    expect(next.secondsRemaining).toBe(5 * 60)
  })
})

describe('PAUSE action', () => {
  it('sets status to paused', () => {
    const running = { ...initialState, status: 'running' as const }
    const next = run(running, { type: 'PAUSE' })
    expect(next.status).toBe('paused')
  })
})

describe('RESUME action', () => {
  it('sets status to running', () => {
    const paused = { ...initialState, status: 'paused' as const }
    const next = run(paused, { type: 'RESUME' })
    expect(next.status).toBe('running')
  })
})

describe('CANCEL action', () => {
  it('sets status to idle', () => {
    const running = { ...initialState, status: 'running' as const }
    const next = run(running, { type: 'CANCEL' })
    expect(next.status).toBe('idle')
  })

  it('resets secondsRemaining to current phase duration', () => {
    const running = { ...initialState, status: 'running' as const, secondsRemaining: 100 }
    const next = run(running, { type: 'CANCEL' })
    expect(next.secondsRemaining).toBe(25 * 60)
  })

  it('clears sessionStartTime', () => {
    const running = { ...initialState, status: 'running' as const, sessionStartTime: Date.now() }
    const next = run(running, { type: 'CANCEL' })
    expect(next.sessionStartTime).toBeNull()
  })

  it('keeps sessionsCompleted unchanged', () => {
    const running = { ...initialState, status: 'running' as const, sessionsCompleted: 3 }
    const next = run(running, { type: 'CANCEL' })
    expect(next.sessionsCompleted).toBe(3)
  })
})

describe('SKIP action', () => {
  it('advances to next phase', () => {
    const next = run(initialState, { type: 'SKIP' })
    expect(next.phase).toBe('shortBreak')
  })

  it('sets status to idle', () => {
    const next = run(initialState, { type: 'SKIP' })
    expect(next.status).toBe('idle')
  })

  it('resets secondsRemaining for new phase', () => {
    const next = run(initialState, { type: 'SKIP' })
    expect(next.secondsRemaining).toBe(5 * 60) // shortBreak duration
  })

  it('does not increment sessionsCompleted on focus skip', () => {
    const next = run(initialState, { type: 'SKIP' })
    expect(next.sessionsCompleted).toBe(0)
  })

  it('skips from shortBreak back to focus', () => {
    const state = { ...initialState, phase: 'shortBreak' as TimerPhase, secondsRemaining: 5 * 60 }
    const next = run(state, { type: 'SKIP' })
    expect(next.phase).toBe('focus')
    expect(next.secondsRemaining).toBe(25 * 60)
  })
})

describe('TICK action', () => {
  it('decrements secondsRemaining by 1', () => {
    const next = run(initialState, { type: 'TICK' })
    expect(next.secondsRemaining).toBe(25 * 60 - 1)
  })

  it('does not go below 0', () => {
    const state = { ...initialState, secondsRemaining: 0 }
    const next = run(state, { type: 'TICK' })
    expect(next.secondsRemaining).toBe(0)
  })

  it('preserves other state fields', () => {
    const state = { ...initialState, sessionsCompleted: 2, totalSessionsToday: 2 }
    const next = run(state, { type: 'TICK' })
    expect(next.sessionsCompleted).toBe(2)
    expect(next.totalSessionsToday).toBe(2)
  })
})

describe('COMPLETE action', () => {
  it('increments sessionsCompleted on focus complete', () => {
    const running = { ...initialState, status: 'running' as const, phase: 'focus' as const }
    const next = run(running, { type: 'COMPLETE' })
    expect(next.sessionsCompleted).toBe(1)
  })

  it('increments totalSessionsToday on focus complete', () => {
    const running = { ...initialState, status: 'running' as const, phase: 'focus' as const }
    const next = run(running, { type: 'COMPLETE' })
    expect(next.totalSessionsToday).toBe(1)
  })

  it('does NOT increment sessionsCompleted on shortBreak complete', () => {
    const running = { ...initialState, status: 'running' as const, phase: 'shortBreak' as const }
    const next = run(running, { type: 'COMPLETE' })
    expect(next.sessionsCompleted).toBe(0)
  })

  it('sets status to completed', () => {
    const running = { ...initialState, status: 'running' as const }
    const next = run(running, { type: 'COMPLETE' })
    expect(next.status).toBe('completed')
  })

  it('moves to next phase and sets secondsRemaining for focus complete', () => {
    const running = { ...initialState, status: 'running' as const, phase: 'focus' as const }
    const next = run(running, { type: 'COMPLETE' })
    expect(next.phase).toBe('shortBreak')
    expect(next.secondsRemaining).toBe(5 * 60)
  })

  it('clears sessionStartTime', () => {
    const running = { ...initialState, status: 'running' as const, sessionStartTime: Date.now() }
    const next = run(running, { type: 'COMPLETE' })
    expect(next.sessionStartTime).toBeNull()
  })

  it('moves to focus after shortBreak complete', () => {
    const running = {
      ...initialState,
      status: 'running' as const,
      phase: 'shortBreak' as const,
    }
    const next = run(running, { type: 'COMPLETE' })
    expect(next.phase).toBe('focus')
    expect(next.secondsRemaining).toBe(25 * 60)
  })

  it('triggers longBreak after 4th focus complete', () => {
    // sessionsCompleted=3 → COMPLETE → sessionsCompleted=4 → nextCount=4 → 4%4=0 → longBreak
    const state = {
      ...initialState,
      status: 'running' as const,
      phase: 'focus' as const,
      sessionsCompleted: 3,
    }
    const next = run(state, { type: 'COMPLETE' })
    expect(next.phase).toBe('longBreak')
    expect(next.sessionsCompleted).toBe(4)
  })

  it('focus → shortBreak after 3rd focus complete', () => {
    // sessionsCompleted=1 → COMPLETE → sessionsCompleted=2 → nextCount=3 → 3%4=3 → shortBreak
    const state = {
      ...initialState,
      status: 'running' as const,
      phase: 'focus' as const,
      sessionsCompleted: 1,
    }
    const next = run(state, { type: 'COMPLETE' })
    expect(next.phase).toBe('shortBreak')
    expect(next.sessionsCompleted).toBe(2)
  })
})

describe('UPDATE_SETTINGS action', () => {
  it('updates settings', () => {
    const newSettings = { ...DEFAULT_SETTINGS, focusDuration: 45 }
    const next = run(initialState, { type: 'UPDATE_SETTINGS', settings: newSettings })
    expect(next.settings.focusDuration).toBe(45)
  })

  it('updates secondsRemaining when idle', () => {
    const newSettings = { ...DEFAULT_SETTINGS, focusDuration: 45 }
    const next = run(initialState, { type: 'UPDATE_SETTINGS', settings: newSettings })
    expect(next.secondsRemaining).toBe(45 * 60)
  })

  it('does not update secondsRemaining when running', () => {
    const newSettings = { ...DEFAULT_SETTINGS, focusDuration: 45 }
    const running = { ...initialState, status: 'running' as const, secondsRemaining: 1000 }
    const next = run(running, { type: 'UPDATE_SETTINGS', settings: newSettings })
    expect(next.secondsRemaining).toBe(1000) // preserved
  })
})

describe('SET_TOTAL_TODAY action', () => {
  it('sets totalSessionsToday', () => {
    const next = run(initialState, { type: 'SET_TOTAL_TODAY', count: 5 })
    expect(next.totalSessionsToday).toBe(5)
  })
})

describe('Session phase transitions', () => {
  // Test that COMPLETE transitions correctly between phases
  it('focus → shortBreak → focus cycle', () => {
    // Start: phase='focus', sessions=0
    let state = run(initialState, { type: 'COMPLETE' })
    // Focus 1 done: sessions=1, phase='shortBreak'
    expect(state.phase).toBe('shortBreak')
    expect(state.sessionsCompleted).toBe(1)

    state = run(state, { type: 'COMPLETE' })
    // ShortBreak 1 done: sessions=1, phase='focus'
    expect(state.phase).toBe('focus')
    expect(state.sessionsCompleted).toBe(1)

    state = run(state, { type: 'COMPLETE' })
    // Focus 2 done: sessions=2, phase='shortBreak'
    expect(state.phase).toBe('shortBreak')
    expect(state.sessionsCompleted).toBe(2)
  })

  it('correctly resets after longBreak', () => {
    const longBreakState: PomodoroState = {
      ...initialState,
      phase: 'longBreak',
      secondsRemaining: 15 * 60,
      sessionsCompleted: 4,
    }
    const next = run(longBreakState, { type: 'COMPLETE' })
    expect(next.phase).toBe('focus')
    expect(next.sessionsCompleted).toBe(4) // not incremented for longBreak
  })
})
