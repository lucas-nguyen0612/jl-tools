/**
 * Habit tracker constants
 * Limits, palette, and streak thresholds
 */

/** Maximum habit name length in characters */
export const MAX_HABIT_NAME_LENGTH = 100

/** Available color palette for habit cards (hex values) */
export const HABIT_COLOR_PALETTE = [
  '#ef4444', // red
  '#f97316', // orange
  '#eab308', // yellow
  '#22c55e', // green
  '#14b8a6', // teal
  '#06b6d4', // cyan
  '#3b82f6', // blue
  '#8b5cf6', // violet
  '#ec4899', // pink
  '#6b7280', // gray
] as const

export type HabitColor = (typeof HABIT_COLOR_PALETTE)[number]

/** Available icon palette — rendered as emoji in UI */
export const HABIT_ICON_PALETTE = [
  '💪', '🏃', '📚', '💧', '🧘', '🎯',
  '✍️', '🎨', '🎵', '💤', '🥗', '💊',
] as const

export type HabitIcon = (typeof HABIT_ICON_PALETTE)[number]

/** Streak thresholds — used by getStreakTier() in types.ts */
export const STREAK_WARM_THRESHOLD  = 3   // days for "warm" tier
export const STREAK_HOT_THRESHOLD   = 7   // days for "hot" tier
export const STREAK_BLAZING_THRESHOLD = 30 // days for "blazing" tier
