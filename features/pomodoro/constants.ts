/**
 * Pomodoro timer constants
 * Default durations, labels, and break cycle rules
 */

/** Default durations in seconds */
export const FOCUS_DURATION_DEFAULT   = 1500  // 25 minutes
export const SHORT_BREAK_DURATION_DEFAULT = 300 // 5 minutes
export const LONG_BREAK_DURATION_DEFAULT = 900  // 15 minutes

/** Number of focus sessions before a long break is triggered */
export const SESSIONS_BEFORE_LONG_BREAK = 4

/** Session label presets (user can pick or enter custom) */
export const SESSION_LABELS = [
  'Deep Work',
  'Study',
  'Writing',
  'Coding',
  'Reading',
  'Creative',
] as const

export type SessionLabel = (typeof SESSION_LABELS)[number]

/** Break cycle rule: long break after every N focus sessions */
export const LONG_BREAK_CYCLE = SESSIONS_BEFORE_LONG_BREAK

/** Maximum label length in characters */
export const MAX_LABEL_LENGTH = 50

/**
 * XP awarded for a completed focus session.
 * Server (`/api/pomodoro/sessions`) is the source of truth — clients must not
 * recompute and emit this value independently.
 */
export const XP_PER_POMODORO_BASE = 10
export const XP_PER_POMODORO_CLEAN_BONUS = 5

/** Sane bounds for the duration_minutes the client may report. */
export const MIN_POMODORO_DURATION_MINUTES = 1
export const MAX_POMODORO_DURATION_MINUTES = 120
