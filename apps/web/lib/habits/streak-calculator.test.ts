import { describe, it, expect } from 'vitest'
import {
  calculateStreak,
  getCheckInsThisWeek,
  isCompletedToday,
  getDayOfWeek,
} from './streak-calculator'

function daysAgo(n: number): Date {
  const d = new Date()
  d.setDate(d.getDate() - n)
  d.setHours(12, 0, 0, 0)
  return d
}

function today(): Date {
  const d = new Date()
  d.setHours(12, 0, 0, 0)
  return d
}

function yesterday(): Date {
  return daysAgo(1)
}

describe('calculateStreak', () => {
  it('returns 0 for empty array', () => {
    const result = calculateStreak([])
    expect(result.currentStreak).toBe(0)
    expect(result.longestStreak).toBe(0)
    expect(result.lastCheckInDate).toBeNull()
  })

  it('returns 1 for single check-in today', () => {
    const result = calculateStreak([today()])
    expect(result.currentStreak).toBe(1)
    expect(result.longestStreak).toBe(1)
  })

  it('returns 1 for single check-in yesterday', () => {
    const result = calculateStreak([yesterday()])
    expect(result.currentStreak).toBe(1)
    expect(result.longestStreak).toBe(1)
  })

  it('returns 0 if last check-in was 2+ days ago', () => {
    const result = calculateStreak([daysAgo(2)])
    expect(result.currentStreak).toBe(0)
    expect(result.longestStreak).toBe(1)
  })

  it('counts consecutive days correctly', () => {
    const dates = [today(), yesterday(), daysAgo(2)]
    const result = calculateStreak(dates)
    expect(result.currentStreak).toBe(3)
    expect(result.longestStreak).toBe(3)
  })

  it('breaks streak on missing day', () => {
    const dates = [today(), daysAgo(2)] // missing yesterday
    const result = calculateStreak(dates)
    expect(result.currentStreak).toBe(1) // only today counts
    expect(result.longestStreak).toBe(1) // longest is also 1 (there's a gap)
  })

  it('handles unsorted input', () => {
    const dates = [daysAgo(2), today(), yesterday()]
    const result = calculateStreak(dates)
    expect(result.currentStreak).toBe(3)
  })

  it('calculates longest streak correctly with gap', () => {
    // 3 consecutive days ending 3 days ago, then gap, then today
    const dates = [
      today(), // current streak = 1
      daysAgo(3), // part of old streak
      daysAgo(4), // old streak
      daysAgo(5), // old streak
    ]
    const result = calculateStreak(dates)
    // Current streak is 1 (today only, gap from yesterday)
    expect(result.currentStreak).toBe(1)
    // Longest streak is 3 (daysAgo 3,4,5)
    expect(result.longestStreak).toBe(3)
  })
})

describe('isCompletedToday', () => {
  it('returns true when today is in check-ins', () => {
    expect(isCompletedToday([today()])).toBe(true)
  })

  it('returns false when today is not in check-ins', () => {
    expect(isCompletedToday([yesterday()])).toBe(false)
  })

  it('returns false for empty array', () => {
    expect(isCompletedToday([])).toBe(false)
  })
})

describe('getDayOfWeek', () => {
  it('returns 0 for Sunday', () => {
    const sunday = new Date('2026-01-04') // a Sunday
    expect(getDayOfWeek(sunday)).toBe(0)
  })

  it('returns 1 for Monday', () => {
    const monday = new Date('2026-01-05') // a Monday
    expect(getDayOfWeek(monday)).toBe(1)
  })
})
