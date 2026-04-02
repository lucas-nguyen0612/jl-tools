/**
 * Calculate streak information for a habit given its check-in dates.
 */

export interface StreakInfo {
  currentStreak: number
  longestStreak: number
  lastCheckInDate: string | null // ISO date string YYYY-MM-DD
}

export function calculateStreak(checkInDates: Date[]): StreakInfo {
  if (checkInDates.length === 0) {
    return { currentStreak: 0, longestStreak: 0, lastCheckInDate: null }
  }

  // Sort dates descending (most recent first)
  const sorted = [...checkInDates].sort((a, b) => b.getTime() - a.getTime())

  const lastDate = sorted[0]
  const lastDateStr = formatDateStr(lastDate)
  const today = new Date()
  const todayStr = formatDateStr(today)
  const yesterdayStr = formatDateStr(new Date(today.getTime() - 86400000))

  // Current streak: consecutive days ending today or yesterday
  let currentStreak = 0
  let streakBroken = false

  // Start from the most recent check-in date
  let checkDate = new Date(lastDate)
  checkDate.setHours(0, 0, 0, 0)

  // If last check-in is not today or yesterday, streak is 0
  const lastDateOnlyStr = formatDateStr(lastDate)
  if (lastDateOnlyStr !== todayStr && lastDateOnlyStr !== yesterdayStr) {
    currentStreak = 0
    streakBroken = true
  }

  if (!streakBroken) {
    // Count consecutive days backwards from the most recent check-in
    const checkInSet = new Set(sorted.map((d) => formatDateStr(d)))
    let cursor = new Date(checkDate)

    while (checkInSet.has(formatDateStr(cursor))) {
      currentStreak++
      cursor.setDate(cursor.getDate() - 1)
    }
  }

  // Longest streak: scan through all dates
  let longestStreak = 0
  let tempStreak = 1
  const sortedAsc = [...sorted].sort((a, b) => a.getTime() - b.getTime())
  const checkInSetAsc = new Set(sortedAsc.map((d) => formatDateStr(d)))

  let prevDate: Date | null = null
  for (const date of sortedAsc) {
    const dateOnly = new Date(date)
    dateOnly.setHours(0, 0, 0, 0)

    if (prevDate === null) {
      tempStreak = 1
    } else {
      const diff = Math.round((dateOnly.getTime() - prevDate.getTime()) / 86400000)
      if (diff === 1) {
        tempStreak++
      } else {
        longestStreak = Math.max(longestStreak, tempStreak)
        tempStreak = 1
      }
    }
    prevDate = dateOnly
  }
  longestStreak = Math.max(longestStreak, tempStreak)

  return {
    currentStreak,
    longestStreak: Math.max(longestStreak, currentStreak),
    lastCheckInDate: lastDateStr,
  }
}

function formatDateStr(date: Date): string {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  return d.toISOString().split('T')[0]
}

/** Get dates of check-ins in the current week (Mon-Sun) */
export function getCheckInsThisWeek(checkInDates: Date[]): number {
  const today = new Date()
  const dayOfWeek = today.getDay() // 0 = Sunday
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek
  const monday = new Date(today)
  monday.setDate(today.getDate() + mondayOffset)
  monday.setHours(0, 0, 0, 0)

  return checkInDates.filter((d) => d >= monday).length
}

/** Check if habit was completed today */
export function isCompletedToday(checkInDates: Date[]): boolean {
  const todayStr = formatDateStr(new Date())
  return checkInDates.some((d) => formatDateStr(d) === todayStr)
}

/** Get today's day-of-week index (0=Sun, 1=Mon, ..., 6=Sat) */
export function getDayOfWeek(date: Date): number {
  return date.getDay()
}
