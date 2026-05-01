import { createClient } from '@/lib/supabase/server'
import type { CharacterStats, XPTransaction, Badge, UserBadge, Quest, UserQuest } from '@/types/rpg'

/**
 * Query key factory for gamification / XP
 */
export const gamificationKeys = {
  all: ['gamification'] as const,
  /** User's current XP and level (from profiles table) */
  xp: (userId: string) => [...gamificationKeys.all, 'xp', userId] as const,
  /** XP transaction history */
  transactions: (userId: string) => [...gamificationKeys.all, 'transactions', userId] as const,
  /** All gamification levels */
  levels: () => [...gamificationKeys.all, 'levels'] as const,
  /** Character stats */
  characterStats: (userId: string) => [...gamificationKeys.all, 'characterStats', userId] as const,
  /** Badges */
  badges: (userId: string) => [...gamificationKeys.all, 'badges', userId] as const,
  /** Quests */
  quests: (userId: string) => [...gamificationKeys.all, 'quests', userId] as const,
} as const

export async function fetchCharacterStats(userId: string): Promise<CharacterStats | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('character_stats')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null // no rows found
    throw new Error(error.message)
  }
  return data as CharacterStats
}

export type BadgeWithStatus = Badge & { earned: boolean; earned_at?: string }

export async function fetchUserBadges(userId: string): Promise<BadgeWithStatus[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('user_badges')
    .select('*, badge:badges(*)')
    .eq('user_id', userId)
    .order('earned_at', { ascending: false })

  if (error) throw new Error(error.message)

  return ((data ?? []) as (UserBadge & { badge: Badge })[]).map(ub => ({
    ...ub.badge,
    earned: true,
    earned_at: ub.earned_at,
  }))
}

export async function fetchAllBadges(userId: string): Promise<BadgeWithStatus[]> {
  const supabase = await createClient()

  const [badgesRes, userBadgesRes] = await Promise.all([
    supabase.from('badges').select('*').order('condition_value', { ascending: true }),
    supabase.from('user_badges').select('badge_id, earned_at').eq('user_id', userId),
  ])

  if (badgesRes.error) throw new Error(badgesRes.error.message)
  if (userBadgesRes.error) throw new Error(userBadgesRes.error.message)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const userBadgeRows = (userBadgesRes.data ?? []) as any as Array<{ badge_id: string; earned_at: string }>
  const earnedMap = new Map(
    userBadgeRows.map(ub => [ub.badge_id, ub.earned_at])
  )

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const allBadgeRows = (badgesRes.data ?? []) as any as Badge[]
  return allBadgeRows.map(badge => ({
    ...badge,
    earned: earnedMap.has(badge.id),
    earned_at: earnedMap.get(badge.id),
  }))
}

export async function fetchXPTimeline(
  userId: string,
  limit = 20
): Promise<XPTransaction[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('xp_transactions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) throw new Error(error.message)
  return (data ?? []) as XPTransaction[]
}

export type UserQuestWithQuest = UserQuest & { quest: Quest }

export async function fetchUserQuests(userId: string): Promise<UserQuestWithQuest[]> {
  const supabase = await createClient()
  const today = new Date().toISOString().split('T')[0]

  await (supabase as unknown as {
    rpc: (fn: string, args: Record<string, unknown>) => Promise<{ error: { message: string } | null }>
  }).rpc('ensure_daily_quests', { p_user_id: userId })

  const { data, error } = await supabase
    .from('user_quests')
    .select('*, quest:quests(*)')
    .eq('user_id', userId)
    .eq('assigned_date', today)
    .order('is_completed', { ascending: true })

  if (error) throw new Error(error.message)
  return (data ?? []) as UserQuestWithQuest[]
}
