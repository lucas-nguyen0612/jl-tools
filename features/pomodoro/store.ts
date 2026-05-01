/**
 * Pomodoro timer Zustand store
 * Manages client-side UI state only — business logic lives in actions.ts
 */
import { create } from 'zustand'
import type { TimerPhase } from './types'
import {
  FOCUS_DURATION_DEFAULT,
  SESSIONS_BEFORE_LONG_BREAK,
} from './constants'

type PomodoroTimerStatus = 'idle' | 'running' | 'paused'

type PomodoroTimerState = {
  /** Current timer phase */
  phase: TimerPhase
  /** Timer running status */
  status: PomodoroTimerStatus
  /** Unix timestamp ms when current phase started */
  startedAt: number | null
  /** Unix timestamp ms when timer was paused */
  pausedAt: number | null
  /** Planned duration for current phase in seconds */
  plannedDuration: number
  /** Total focus sessions completed today */
  sessionsCompleted: number
  /** Current session label (e.g. 'Deep Work') */
  label: string | null
}

type PomodoroTimerActions = {
  /** Start the timer for a given phase */
  start: (phase: TimerPhase, label?: string | null) => void
  /** Pause the timer */
  pause: () => void
  /** Resume from pause */
  resume: () => void
  /** Skip current phase (move to next without completing) */
  skip: () => void
  /** Reset timer to idle state */
  reset: () => void
  /** Increment completed focus sessions count */
  incrementSessions: () => void
  /** Set planned duration for a phase */
  setPhaseDuration: (phase: TimerPhase, durationSeconds: number) => void
}

type PomodoroTimerStore = PomodoroTimerState & PomodoroTimerActions

const initialState: PomodoroTimerState = {
  phase: 'focus',
  status: 'idle',
  startedAt: null,
  pausedAt: null,
  plannedDuration: FOCUS_DURATION_DEFAULT,
  sessionsCompleted: 0,
  label: null,
}

export const usePomodoroTimerStore = create<PomodoroTimerStore>((set, get) => ({
  ...initialState,

  start: (phase, label) =>
    set({
      phase,
      status: 'running',
      startedAt: Date.now(),
      pausedAt: null,
      label: label ?? null,
    }),

  pause: () =>
    set({
      status: 'paused',
      pausedAt: Date.now(),
    }),

  resume: () =>
    set(state => ({
      status: 'running',
      // Shift start time forward by the paused duration to preserve elapsed time
      startedAt: state.startedAt
        ? state.startedAt + (Date.now() - (state.pausedAt ?? Date.now()))
        : Date.now(),
      pausedAt: null,
    })),

  skip: () => {
    const { phase, sessionsCompleted } = get()
    const nextPhase = getNextPhase(phase, sessionsCompleted)
    set({
      phase: nextPhase,
      status: 'idle',
      startedAt: null,
      pausedAt: null,
    })
  },

  reset: () => set(initialState),

  incrementSessions: () =>
    set(state => ({ sessionsCompleted: state.sessionsCompleted + 1 })),

  setPhaseDuration: (phase, durationSeconds) =>
    set(state => ({
      plannedDuration:
        state.status === 'idle' ? durationSeconds : state.plannedDuration,
    })),
}))

/** Determines the next phase based on current phase and session count */
function getNextPhase(current: TimerPhase, sessionsCompleted: number): TimerPhase {
  if (current === 'focus') {
    return sessionsCompleted > 0 && sessionsCompleted % SESSIONS_BEFORE_LONG_BREAK === 0
      ? 'long-break'
      : 'short-break'
  }
  return 'focus'
}
