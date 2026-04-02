import { LEVEL_THRESHOLDS } from '../constants'

/**
 * Calculate level from total XP
 */
export function xpToLevel(totalXp: number): number {
  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (totalXp >= LEVEL_THRESHOLDS[i]) {
      return i + 1
    }
  }
  return 1
}

/**
 * Get XP progress within current level (0-100)
 */
export function xpProgressInLevel(totalXp: number): number {
  const level = xpToLevel(totalXp)
  const currentThreshold = LEVEL_THRESHOLDS[level - 1] ?? 0
  const nextThreshold = LEVEL_THRESHOLDS[level] ?? LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1]
  const xpInLevel = totalXp - currentThreshold
  const xpNeeded = nextThreshold - currentThreshold

  if (xpNeeded <= 0) return 100
  return Math.min(100, Math.round((xpInLevel / xpNeeded) * 100))
}

/**
 * Get XP needed to reach next level
 */
export function xpToNextLevel(totalXp: number): number {
  const level = xpToLevel(totalXp)
  const currentThreshold = LEVEL_THRESHOLDS[level - 1] ?? 0
  const nextThreshold = LEVEL_THRESHOLDS[level] ?? LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1]
  return Math.max(0, nextThreshold - totalXp)
}

/**
 * Check if XP gain would trigger level up
 */
export function wouldLevelUp(currentTotalXp: number, xpGain: number): boolean {
  const currentLevel = xpToLevel(currentTotalXp)
  const newLevel = xpToLevel(currentTotalXp + xpGain)
  return newLevel > currentLevel
}

/**
 * Format seconds to MM:SS display
 */
export function formatTime(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
}

/**
 * Format minutes to human readable
 */
export function formatMinutes(minutes: number): string {
  if (minutes < 60) return `${minutes}m`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m > 0 ? `${h}h ${m}m` : `${h}h`
}

/**
 * Get day of week 0=Sun, 1=Mon, ..., 6=Sat
 */
export function getDayOfWeek(date: Date): number {
  return date.getDay()
}

/**
 * Calculate current streak from check-in dates
 */
export function calculateStreak(checkInDates: Date[]): {
  current: number
  longest: number
} {
  if (checkInDates.length === 0) return { current: 0, longest: 0 }

  // Sort descending (most recent first)
  const sorted = [...checkInDates]
    .map((d) => {
      const normalized = new Date(d)
      normalized.setHours(0, 0, 0, 0)
      return normalized.getTime()
    })
    .sort((a, b) => b - a)

  // Deduplicate days
  const uniqueDays = [...new Set(sorted)]

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const todayMs = today.getTime()
  const oneDayMs = 24 * 60 * 60 * 1000

  let current = 0
  let longest = 0
  let streak = 0
  let prevMs: number | null = null

  for (const ms of uniqueDays) {
    if (prevMs === null) {
      // First item: must be today or yesterday
      if (ms === todayMs || ms === todayMs - oneDayMs) {
        streak = 1
        current = 1
      } else {
        streak = 0
        current = 0
      }
    } else {
      const gap = prevMs - ms
      if (gap === oneDayMs) {
        streak++
        if (ms === todayMs || ms === todayMs - oneDayMs) {
          current = streak
        }
      } else {
        longest = Math.max(longest, streak)
        streak = 1
      }
    }
    prevMs = ms
  }

  longest = Math.max(longest, streak)

  return { current, longest }
}

/**
 * Get streak bonus XP
 */
export function getStreakBonus(streakDays: number): number {
  if (streakDays >= 30) return 500
  if (streakDays >= 14) return 200
  if (streakDays >= 7) return 100
  return 0
}
