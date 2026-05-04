/**
 * Gamification constants
 * XP amounts, level thresholds, and related values
 */
import type { XpSourceType } from './types'

/**
 * XP granted per completed Pomodoro session (base; clean-bonus excluded).
 * Matches `XP_PER_POMODORO_BASE` in `features/pomodoro/constants.ts`, which is
 * the value the server actually awards. Used by dashboard estimates.
 */
export const XP_PER_POMODORO = 10

/** XP granted per habit check-in */
export const XP_PER_HABIT = 10

/** DB column: gam_xp_transactions.amount CHECK: amount > 0 AND amount <= 1000 */
export const MAX_XP_PER_ACTION = 1000

/** DB column: gam_xp_transactions.amount CHECK upper bound */
export const MAX_LEVEL = 20

/** All valid XP source types */
export const XP_SOURCE_TYPES: XpSourceType[] = ['pomodoro', 'habit']

/**
 * XP label map for display purposes
 * Used in XP transaction history
 */
export const XP_SOURCE_LABELS: Record<XpSourceType, { vi: string; en: string }> = {
  pomodoro: { vi: 'Pomodoro', en: 'Pomodoro' },
  habit:    { vi: 'Thói quen', en: 'Habit' },
}
