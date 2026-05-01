/**
 * Pomodoro utility helpers
 * Pure functions for timer math, formatting, and stats
 */
import type { PomoSession } from './types'

/**
 * Converts milliseconds to seconds.
 * @param ms - milliseconds
 * @returns seconds (integer)
 */
export function msToSeconds(ms: number): number {
  return Math.floor(ms / 1000)
}

/**
 * Converts seconds to MM:SS string format.
 * @param totalSeconds - total seconds
 * @returns formatted string e.g. "25:00"
 */
export function secondsToMMSS(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60)
  const s = totalSeconds % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

/**
 * Computes today's completed session count and total actual duration
 * from a list of sessions.
 * @param sessions - array of PomoSession records
 * @returns aggregated today stats
 */
export function getTodayStats(
  sessions: PomoSession[]
): { completedCount: number; totalActualSeconds: number } {
  const today = new Date().toISOString().slice(0, 10) // YYYY-MM-DD

  return sessions.reduce(
    (acc, s) => {
      if (s.completed_at?.slice(0, 10) === today && s.status === 'completed') {
        acc.completedCount++
        acc.totalActualSeconds += s.actual_duration
      }
      return acc
    },
    { completedCount: 0, totalActualSeconds: 0 }
  )
}
