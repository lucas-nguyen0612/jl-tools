export const XP_VALUES = {
  POMODORO_SESSION: 10,
  POMODORO_CLEAN_BONUS: 5,
  HABIT_CHECKIN: 5,
  HABIT_ALL_DONE_BONUS: 10,
  STREAK_DAILY_BONUS: 5,
  FLASHCARD_AGAIN: 0,
  FLASHCARD_HARD: 1,
  FLASHCARD_GOOD: 2,
  FLASHCARD_EASY: 3,
  FLASHCARD_SESSION_BONUS: 15,
} as const

export const LEVEL_THRESHOLDS = [
  { level: 1, xp: 0 },
  { level: 2, xp: 300 },
  { level: 3, xp: 700 },
  { level: 4, xp: 1200 },
  { level: 5, xp: 1500 },
  { level: 10, xp: 5500 },
  { level: 15, xp: 12000 },
  { level: 20, xp: 21000 },
  { level: 30, xp: 46500 },
  { level: 50, xp: 127500 },
] as const

export const AVATAR_TIERS = {
  MYTHIC: 50,
  LEGENDARY: 30,
  RARE: 15,
  UNCOMMON: 5,
  COMMON: 1,
} as const

export const MAX_HABITS = 10
export const HEATMAP_WEEKS = 26
export const SM2_DEFAULT_EASE = 2.5
export const SM2_MIN_EASE = 1.3
