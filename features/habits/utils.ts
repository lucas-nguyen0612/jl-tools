import type { Habit } from './types'

export function getTodayDayOfWeek(): number {
  return new Date().getDay()
}

// target_days empty array = daily (every day)
// target_days with values = only those weekdays
export function isHabitDueToday(habit: Pick<Habit, 'target_days'>): boolean {
  const { target_days } = habit
  if (!target_days || target_days.length === 0) return true  // daily
  return target_days.includes(getTodayDayOfWeek())
}

export function calculateTodayProgress(total: number, completed: number): number {
  if (total <= 0) return 0
  return Math.min(Math.max(completed / total, 0), 1)
}

export function formatStreak(streak: number): string {
  return `${streak} day${streak !== 1 ? 's' : ''}`
}

export function getTodayDateString(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}
