/**
 * Gamification utility helpers
 * Pure functions for XP calculation and level progression
 */
import type { GamLevel } from './types'

/**
 * Determines the current level number for a given total XP.
 * Assumes levels are consecutive integers starting at 1.
 * @param totalXp - user's total accumulated XP
 * @param levels - all level threshold definitions
 * @returns current level number (minimum 1)
 */
export function calculateLevel(totalXp: number, levels: GamLevel[]): number {
  if (!levels || levels.length === 0) return 1
  const safeXp = Math.max(0, totalXp)
  const current = levels
    .slice()
    .sort((a, b) => b.level - a.level)
    .find(l => safeXp >= l.min_xp)
  return current?.level ?? 1
}

/**
 * Returns the XP required to reach the next level.
 * @param level - current level
 * @param levels - all level threshold definitions
 * @returns XP needed for next level, or null if already at max
 */
export function getXpForNextLevel(level: number, levels: GamLevel[]): number | null {
  const next = levels.find(l => l.level === level + 1)
  return next?.min_xp ?? null
}

/**
 * Formats XP with a thousand-separator and optional suffix.
 * @param xp - XP amount
 * @param suffix - optional suffix (default: ' XP')
 * @returns formatted string e.g. "1,250 XP"
 */
export function formatXp(xp: number, suffix = ' XP'): string {
  return `${xp.toLocaleString()}${suffix}`
}
