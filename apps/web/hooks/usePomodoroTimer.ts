'use client'

import { useReducer, useEffect, useCallback, useRef } from 'react'
import type { PomodoroSettings } from '@/types/pomodoro'

export type TimerPhase = 'focus' | 'shortBreak' | 'longBreak'
export type TimerStatus = 'idle' | 'running' | 'paused' | 'completed'

export interface PomodoroState {
  phase: TimerPhase
  status: TimerStatus
  secondsRemaining: number
  sessionsCompleted: number
  totalSessionsToday: number
  settings: PomodoroSettings
  sessionStartTime: number | null
}

export type PomodoroAction =
  | { type: 'START' }
  | { type: 'PAUSE' }
  | { type: 'RESUME' }
  | { type: 'SKIP' }
  | { type: 'CANCEL' }
  | { type: 'TICK' }
  | { type: 'COMPLETE' }
  | { type: 'UPDATE_SETTINGS'; settings: PomodoroSettings }
  | { type: 'SET_TOTAL_TODAY'; count: number }

const DEFAULT_SETTINGS: PomodoroSettings = {
  focusDuration: 25,
  shortBreakDuration: 5,
  longBreakDuration: 15,
  sessionsBeforeLongBreak: 4,
}

export function getPhaseDuration(phase: TimerPhase, settings: PomodoroSettings): number {
  switch (phase) {
    case 'focus':
      return settings.focusDuration * 60
    case 'shortBreak':
      return settings.shortBreakDuration * 60
    case 'longBreak':
      return settings.longBreakDuration * 60
  }
}

export function getNextPhase(
  current: TimerPhase,
  sessionsCompleted: number,
  settings: PomodoroSettings,
): TimerPhase {
  if (current === 'focus') {
    const nextCount = sessionsCompleted + 1
    if (nextCount % settings.sessionsBeforeLongBreak === 0) {
      return 'longBreak'
    }
    return 'shortBreak'
  }
  return 'focus'
}

export function pomodoroReducer(state: PomodoroState, action: PomodoroAction): PomodoroState {
  switch (action.type) {
    case 'START': {
      return {
        ...state,
        status: 'running',
        secondsRemaining: getPhaseDuration(state.phase, state.settings),
        sessionStartTime: Date.now(),
      }
    }
    case 'PAUSE':
      return { ...state, status: 'paused' }
    case 'RESUME':
      return { ...state, status: 'running' }
    case 'CANCEL':
      return {
        ...state,
        status: 'idle',
        secondsRemaining: getPhaseDuration(state.phase, state.settings),
        sessionStartTime: null,
      }
    case 'SKIP': {
      const nextPhase = getNextPhase(state.phase, state.sessionsCompleted, state.settings)
      return {
        ...state,
        phase: nextPhase,
        status: 'idle',
        secondsRemaining: getPhaseDuration(nextPhase, state.settings),
        sessionStartTime: null,
      }
    }
    case 'TICK':
      return {
        ...state,
        secondsRemaining: Math.max(0, state.secondsRemaining - 1),
      }
    case 'COMPLETE': {
      const wasFocus = state.phase === 'focus'
      const nextPhase = wasFocus
        ? getNextPhase(state.phase, state.sessionsCompleted, state.settings)
        : 'focus'
      return {
        ...state,
        status: 'completed',
        sessionsCompleted: wasFocus ? state.sessionsCompleted + 1 : state.sessionsCompleted,
        totalSessionsToday: wasFocus ? state.totalSessionsToday + 1 : state.totalSessionsToday,
        phase: nextPhase,
        secondsRemaining: getPhaseDuration(nextPhase, state.settings),
        sessionStartTime: null,
      }
    }
    case 'UPDATE_SETTINGS':
      return {
        ...state,
        settings: action.settings,
        secondsRemaining:
          state.status === 'idle'
            ? getPhaseDuration(state.phase, action.settings)
            : state.secondsRemaining,
      }
    case 'SET_TOTAL_TODAY':
      return { ...state, totalSessionsToday: action.count }
    default:
      return state
  }
}

export interface UsePomodoroTimer {
  state: PomodoroState
  start: () => void
  pause: () => void
  resume: () => void
  skip: () => void
  cancel: () => void
  updateSettings: (settings: PomodoroSettings) => void
  sessionDurationSeconds: number | null
}

export function usePomodoroTimer(initialSettings?: Partial<PomodoroSettings>): UsePomodoroTimer {
  const settings = { ...DEFAULT_SETTINGS, ...initialSettings }
  const sessionStartTimeRef = useRef<number | null>(null)

  const [state, dispatch] = useReducer(pomodoroReducer, {
    phase: 'focus',
    status: 'idle',
    secondsRemaining: settings.focusDuration * 60,
    sessionsCompleted: 0,
    totalSessionsToday: 0,
    settings,
    sessionStartTime: null,
  })

  // Tick interval
  useEffect(() => {
    if (state.status !== 'running') return
    const interval = setInterval(() => {
      dispatch({ type: 'TICK' })
    }, 1000)
    return () => clearInterval(interval)
  }, [state.status])

  // Auto-complete
  useEffect(() => {
    if (state.secondsRemaining === 0 && state.status === 'running') {
      sessionStartTimeRef.current = null
      dispatch({ type: 'COMPLETE' })
    }
  }, [state.secondsRemaining, state.status])

  const start = useCallback(() => {
    sessionStartTimeRef.current = Date.now()
    dispatch({ type: 'START' })
  }, [])

  const pause = useCallback(() => dispatch({ type: 'PAUSE' }), [])
  const resume = useCallback(() => dispatch({ type: 'RESUME' }), [])
  const skip = useCallback(() => dispatch({ type: 'SKIP' }), [])
  const cancel = useCallback(() => dispatch({ type: 'CANCEL' }), [])
  const updateSettings = useCallback((s: PomodoroSettings) => {
    dispatch({ type: 'UPDATE_SETTINGS', settings: s })
  }, [])

  const sessionDurationSeconds =
    sessionStartTimeRef.current && state.status === 'running'
      ? Math.floor((Date.now() - sessionStartTimeRef.current) / 1000)
      : state.sessionStartTime
        ? Math.floor((Date.now() - state.sessionStartTime) / 1000)
        : null

  return {
    state,
    start,
    pause,
    resume,
    skip,
    cancel,
    updateSettings,
    get sessionDurationSeconds() {
      if (!state.sessionStartTime) return null
      return Math.floor((Date.now() - state.sessionStartTime) / 1000)
    },
  }
}
