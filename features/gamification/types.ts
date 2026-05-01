/**
 * Gamification types
 * Source: supabase/migrations/00005_create_gam_xp_transactions.sql
 * Source: supabase/migrations/00006_seed_gam_levels.sql
 */

// ============================================================
// Enums
// ============================================================

export type XpSourceType = 'pomodoro' | 'habit'

// ============================================================
// Tables
// ============================================================

export type XpTransaction = {
  id: string
  user_id: string
  source_type: XpSourceType
  /** FK to pomo_sessions.id (set if source_type = 'pomodoro') */
  pomo_session_id: string | null
  /** FK to habit_entries.id (set if source_type = 'habit') */
  habit_entry_id: string | null
  amount: number
  created_at: string
}

// ============================================================
// XP amounts — constants (MUST match DB CHECK constraints)
// DB caps: CHECK (amount > 0 AND amount <= 1000)
// ============================================================

export const XP_PER_POMODORO = 50
export const XP_PER_HABIT    = 10
export const MAX_XP_PER_ACTION = 1000  // DB-enforced upper bound
export const MAX_LEVEL        = 20

// ============================================================
// Gam Levels
// ============================================================

export type GamLevel = {
  level: number
  min_xp: number
  title_vi: string
  title_en: string
}

// ============================================================
// Derived / UI types
// ============================================================

// Current level progress for a user
export type LevelProgress = {
  level: number
  title_vi: string
  title_en: string
  min_xp: number
  next_xp: number | null // null for level 20
  current_xp: number
  progress: number // 0-1 fraction within this level
}

// XP bar display state
export type XpBarState = {
  totalXp: number
  levelProgress: LevelProgress
  recentGain: number | null // last XP amount earned (for animation)
}

// XP transaction with joined source info
export type XpTransactionDetail = XpTransaction & {
  source_label?: string // session label for pomodoro, habit name for habit
}

// ============================================================
// XP calculation helpers
// ============================================================

export function calculateLevelProgress(
  totalXp: number,
  levels: GamLevel[]
): LevelProgress {
  // FIX (finding #4): Guard against empty levels array
  if (!levels || levels.length === 0) {
    throw new Error('calculateLevelProgress: levels array must not be empty')
  }

  // FIX (finding #4): Guard against negative XP
  const safeXp = Math.max(0, totalXp)

  // Sort descending by level to find current level efficiently
  const sorted = [...levels].sort((a, b) => b.level - a.level)
  const current = sorted.find(l => safeXp >= l.min_xp) ?? levels[0]
  const next = levels.find(l => l.level === current.level + 1) ?? null

  const xpInLevel = safeXp - current.min_xp
  const xpNeeded = next ? next.min_xp - current.min_xp : 1
  const progress = Math.min(Math.max(0, xpInLevel / xpNeeded), 1)

  return {
    level: current.level,
    title_vi: current.title_vi,
    title_en: current.title_en,
    min_xp: current.min_xp,
    next_xp: next?.min_xp ?? null,
    current_xp: safeXp,
    progress,
  }
}

/**
 * Validates XP amount is within DB-allowed range.
 * Use before inserting a gam_xp_transactions row.
 */
export function isValidXpAmount(amount: number): boolean {
  return Number.isInteger(amount) && amount > 0 && amount <= MAX_XP_PER_ACTION
}
