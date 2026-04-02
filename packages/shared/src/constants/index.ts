import type { Database } from '../types'

export { DEFAULT_POMODORO_SETTINGS } from '../types'

// XP Sources
export const XP_POMODORO_COMPLETE = 50
export const XP_HABIT_CHECKIN = 20
export const XP_STREAK_7_DAYS = 100
export const XP_STREAK_14_DAYS = 200
export const XP_STREAK_30_DAYS = 500

// XP Abuse Prevention
export const XP_DAILY_CAP = 500
export const POMODORO_MIN_DURATION_SECONDS = 60 // 1 minute minimum
export const POMODORO_SESSION_COOLDOWN_SECONDS = 300 // 5 minutes between completions

// Level thresholds
export const LEVEL_THRESHOLDS = [
  0, // Level 1: 0 XP
  100, // Level 2
  250, // Level 3
  500, // Level 4
  850, // Level 5
  1300, // Level 6
  1900, // Level 7
  2650, // Level 8
  3550, // Level 9
  4600, // Level 10
  5800, // Level 11
  7150, // Level 12
  8650, // Level 13
  10300, // Level 14
  12100, // Level 15
  14050, // Level 16
  16150, // Level 17
  18400, // Level 18
  20800, // Level 19
  23400, // Level 20
] as const

export const LEVEL_TITLES: Record<number, { vi: string; en: string }> = {
  1: { vi: 'Tân binh', en: 'Rookie' },
  2: { vi: 'Người tập sự', en: 'Apprentice' },
  3: { vi: 'Học viên', en: 'Learner' },
  4: { vi: 'Người điều hành', en: 'Operator' },
  5: { vi: 'Kỷ luật sĩ', en: 'Disciplinarian' },
  6: { vi: 'Chiến binh', en: 'Warrior' },
  7: { vi: 'Chiến binh kỷ luật', en: 'Discipline Warrior' },
  8: { vi: 'Bậc thầy tập trung', en: 'Focus Master' },
  9: { vi: 'Người thức tỉnh', en: 'Awakened' },
  10: { vi: 'Ngườiguardian', en: 'Guardian' },
  11: { vi: 'Bậc thầy sắt', en: 'Iron Master' },
  12: { vi: 'Bậc thầy lửa', en: 'Flame Master' },
  13: { vi: 'Siêu chiến binh', en: 'Super Warrior' },
  14: { vi: 'Người huyền thoại', en: 'Legend' },
  15: { vi: 'Vệ binh', en: 'Paladin' },
  16: { vi: 'Bậc thầy vĩnh cửu', en: 'Eternal Master' },
  17: { vi: 'Thần lực', en: 'Divine Force' },
  18: { vi: 'Bậc thầy thời gian', en: 'Time Master' },
  19: { vi: 'Tiến hóa', en: 'Evolved' },
  20: { vi: 'Hoàn thiện', en: 'Perfected' },
}

// Pomodoro defaults
export const POMODORO_DEFAULT_FOCUS = 25
export const POMODORO_DEFAULT_SHORT_BREAK = 5
export const POMODORO_DEFAULT_LONG_BREAK = 15
export const POMODORO_DEFAULT_SESSIONS_BEFORE_LONG_BREAK = 4
