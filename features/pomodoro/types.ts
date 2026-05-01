/**
 * Pomodoro types
 * Source: supabase/migrations/00002_create_pomo_sessions.sql
 */

// ============================================================
// Enums
// ============================================================

/** Timer phase — client-side state */
export type TimerPhase = 'focus' | 'short-break' | 'long-break'

/** Session status — DB enum */
export type PomoStatus = 'active' | 'paused' | 'completed' | 'cancelled'

// ============================================================
// Timer → DB state mapping
// IMPORTANT (FIX #5): Client TimerPhase does NOT equal DB PomoStatus
//   idle    → no session row yet  (≠ 'active')
//   running → 'active'  (timer running)
//   paused  → 'paused'  (timer paused)
//   idle    → 'completed' when timer finishes
//   idle    → 'cancelled' when timer is cancelled
// ============================================================

export const TIMER_TO_STATUS: Record<TimerPhase, PomoStatus> = {
  'focus':       'active',
  'short-break':'active',
  'long-break': 'active',
} as const

export const STATUS_TO_TIMER: Record<PomoStatus, 'running' | 'paused'> = {
  'active':    'running',
  'paused':   'paused',
  'completed': 'running',  // session done, timer idle
  'cancelled': 'running', // session done, timer idle
} as const

// ============================================================
// Tables
// ============================================================

export type PomoSession = {
  id: string
  user_id: string
  label: string | null
  status: PomoStatus
  /** Planned duration in seconds (DB CHECK: planned_duration > 0) */
  planned_duration: number
  /** Actual focused time in seconds (DB CHECK: actual_duration >= 0) */
  actual_duration: number
  started_at: string
  completed_at: string | null
  created_at: string
}

// ============================================================
// Timer state (client-side, Zustand)
// ============================================================

export type TimerState = {
  phase: TimerPhase
  /** NOTE (FIX #5): 'idle' is purely client-side. When saving to DB, map via TIMER_TO_STATUS */
  status: 'idle' | 'running' | 'paused'
  startedAt: number | null   // unix timestamp ms when phase started
  pausedAt: number | null   // unix timestamp ms when paused
  plannedDuration: number    // seconds for current phase
  sessionsCompleted: number // count of focus sessions completed today
  label: string | null
}

// ============================================================
// Settings (FIX #9: all numeric fields have validation bounds)
// ============================================================

/** All durations are in seconds */
export type PomoSettings = {
  /** Focus duration in seconds. Range: 60–3600 (1min–60min). Default: 1500 (25min) */
  focusDuration: number
  /** Short break in seconds. Range: 60–1800 (1min–30min). Default: 300 (5min) */
  shortBreakDuration: number
  /** Long break in seconds. Range: 300–3600 (5min–60min). Default: 900 (15min) */
  longBreakDuration: number
  /** Sessions before long break. Range: 1–10. Default: 4 */
  sessionsBeforeLongBreak: number
}

export const DEFAULT_POMO_SETTINGS: PomoSettings = {
  focusDuration: 1500,
  shortBreakDuration: 300,
  longBreakDuration: 900,
  sessionsBeforeLongBreak: 4,
} as const

// Validation helpers (FIX #9)
export function isValidPomoSettings(s: Partial<PomoSettings>): s is PomoSettings {
  return (
    isValidDuration(s.focusDuration, 60, 3600) &&
    isValidDuration(s.shortBreakDuration, 60, 1800) &&
    isValidDuration(s.longBreakDuration, 300, 3600) &&
    isValidSessionsBeforeLongBreak(s.sessionsBeforeLongBreak)
  )
}

function isValidDuration(v: number | undefined, min: number, max: number): boolean {
  return typeof v === 'number' && Number.isInteger(v) && v >= min && v <= max
}

function isValidSessionsBeforeLongBreak(v: number | undefined): boolean {
  return typeof v === 'number' && Number.isInteger(v) && v >= 1 && v <= 10
}
