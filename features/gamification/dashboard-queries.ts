import { createClient } from '@/lib/supabase/server'
import { format, subDays, startOfWeek, endOfWeek, subWeeks } from 'date-fns'
import type { CharacterStats, Badge } from '@/types/rpg'
import {
  fetchCharacterStats,
  fetchUserQuests,
  type BadgeWithStatus,
  type UserQuestWithQuest,
} from './queries'
import {
  computeNotifications,
  type Notification,
} from './notifications'

export interface WeeklyData {
  pomodoros: number
  habits: number
  focusMinutes: number
  cardsReviewed: number
  /** Daily breakdown for sparklines (last 7 days) */
  dailyPomodoros: number[]
  dailyHabits: number[]
  dailyFocusMinutes: number[]
  dailyCards: number[]
}

export interface WeeklyXPData {
  thisWeek: number
  lastWeek: number
  daily: number[]
}

export interface DailyActivityCell {
  date: string
  count: number
}

export interface NextUnlock {
  name: string
  level: number
}

export interface DashboardData {
  characterStats: CharacterStats | null
  quests: UserQuestWithQuest[]
  recentBadges: BadgeWithStatus[]
  thisWeek: WeeklyData
  lastWeek: WeeklyData
  pomodoroCountToday: number
  habitsDoneToday: number
  totalHabitsToday: number
  flashcardsDue: number
  weeklyXP: WeeklyXPData
  dailyActivity: DailyActivityCell[]
  unearnedBadges: BadgeWithStatus[]
  cardsReviewedToday: number
  nextUnlock: NextUnlock | null
  characterName: string
  characterClass: string
  avatarUrl: string | null
  xpForNextLevel: number
  notifications: Notification[]
}

async function fetchWeeklyStats(
  userId: string,
  weekStart: Date,
  weekEnd: Date
): Promise<WeeklyData> {
  const supabase = await createClient()
  const fromDate = format(weekStart, 'yyyy-MM-dd')
  const toDate = format(weekEnd, 'yyyy-MM-dd')
  const fromISO = weekStart.toISOString()
  const toISO = new Date(weekEnd.getTime() + 86400000).toISOString() // end of day

  const [pomRes, habRes, cardRes] = await Promise.all([
    supabase
      .from('pomodoro_sessions')
      .select('duration_minutes, completed_at')
      .eq('user_id', userId)
      .gte('completed_at', fromISO)
      .lt('completed_at', toISO),
    supabase
      .from('habit_completions')
      .select('completed_date')
      .eq('user_id', userId)
      .gte('completed_date', fromDate)
      .lte('completed_date', toDate),
    supabase
      .from('flashcard_reviews')
      .select('reviewed_at')
      .eq('user_id', userId)
      .gte('reviewed_at', fromISO)
      .lt('reviewed_at', toISO),
  ])

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const pomRows = (pomRes.data ?? []) as any as Array<{ completed_at: string; duration_minutes: number | null }>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const habRows = (habRes.data ?? []) as any as Array<{ completed_date: string }>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const cardRows = (cardRes.data ?? []) as any as Array<{ reviewed_at: string }>

  // Build daily arrays (7 days)
  const dailyPomodoros = Array(7).fill(0)
  const dailyFocusMinutes = Array(7).fill(0)
  const dailyHabits = Array(7).fill(0)
  const dailyCards = Array(7).fill(0)

  for (const row of pomRows) {
    const d = new Date(row.completed_at)
    const dayIdx = Math.floor(
      (d.getTime() - weekStart.getTime()) / 86400000
    )
    if (dayIdx >= 0 && dayIdx < 7) {
      dailyPomodoros[dayIdx]++
      dailyFocusMinutes[dayIdx] += row.duration_minutes ?? 0
    }
  }

  for (const row of habRows) {
    const d = new Date(row.completed_date)
    const dayIdx = Math.floor(
      (d.getTime() - weekStart.getTime()) / 86400000
    )
    if (dayIdx >= 0 && dayIdx < 7) {
      dailyHabits[dayIdx]++
    }
  }

  for (const row of cardRows) {
    const d = new Date(row.reviewed_at)
    const dayIdx = Math.floor(
      (d.getTime() - weekStart.getTime()) / 86400000
    )
    if (dayIdx >= 0 && dayIdx < 7) {
      dailyCards[dayIdx]++
    }
  }

  return {
    pomodoros: pomRows.length,
    habits: habRows.length,
    focusMinutes: pomRows.reduce((s, r) => s + (r.duration_minutes ?? 0), 0),
    cardsReviewed: cardRows.length,
    dailyPomodoros,
    dailyHabits,
    dailyFocusMinutes,
    dailyCards,
  }
}

export async function fetchDashboardData(userId: string): Promise<DashboardData> {
  const supabase = await createClient()
  const today = new Date()
  const todayStr = format(today, 'yyyy-MM-dd')
  const todayStart = new Date(todayStr + 'T00:00:00Z').toISOString()
  const todayEnd = new Date(todayStr + 'T23:59:59Z').toISOString()

  const thisWeekStart = startOfWeek(today, { weekStartsOn: 1 })
  const thisWeekEnd = endOfWeek(today, { weekStartsOn: 1 })
  const lastWeekStart = subDays(thisWeekStart, 7)
  const lastWeekEnd = subDays(thisWeekEnd, 7)

  // 18 weeks × 7 days window for daily activity heatmap
  const activityStart = startOfWeek(subWeeks(today, 17), { weekStartsOn: 1 })
  const activityStartISO = activityStart.toISOString()
  const activityEndExclusiveISO = new Date(
    new Date(todayStr + 'T00:00:00Z').getTime() + 86400000
  ).toISOString()
  const activityStartDateStr = format(activityStart, 'yyyy-MM-dd')

  // Weekly XP window (this week)
  const thisWeekStartISO = thisWeekStart.toISOString()
  const thisWeekEndExclusiveISO = new Date(
    thisWeekEnd.getTime() + 86400000
  ).toISOString()
  const lastWeekStartISO = lastWeekStart.toISOString()
  const lastWeekEndExclusiveISO = new Date(
    lastWeekEnd.getTime() + 86400000
  ).toISOString()

  const [
    characterStats,
    quests,
    recentBadgesRes,
    thisWeekData,
    lastWeekData,
    pomTodayRes,
    habTodayRes,
    totalHabitsRes,
    flashcardsRes,
    activityPomRes,
    activityHabRes,
    activityCardRes,
    thisWeekXPRes,
    lastWeekXPRes,
    allBadgesRes,
    userBadgesRes,
    cardsTodayRes,
    profileRes,
    levelThresholdsRes,
    unlockablesRes,
    userBadgesForNotifyRes,
  ] = await Promise.all([
    fetchCharacterStats(userId),
    fetchUserQuests(userId),
    supabase
      .from('user_badges')
      .select('badge_id, earned_at, badge:badges(*)')
      .eq('user_id', userId)
      .order('earned_at', { ascending: false })
      .limit(3),
    fetchWeeklyStats(userId, thisWeekStart, thisWeekEnd),
    fetchWeeklyStats(userId, lastWeekStart, lastWeekEnd),
    supabase
      .from('pomodoro_sessions')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .gte('completed_at', todayStart)
      .lte('completed_at', todayEnd),
    supabase
      .from('habit_completions')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('completed_date', todayStr),
    supabase
      .from('habits')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('is_archived', false),
    supabase
      .from('flashcard_cards')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .lte('due_at', new Date().toISOString()),
    supabase
      .from('pomodoro_sessions')
      .select('completed_at')
      .eq('user_id', userId)
      .gte('completed_at', activityStartISO)
      .lt('completed_at', activityEndExclusiveISO),
    supabase
      .from('habit_completions')
      .select('completed_date')
      .eq('user_id', userId)
      .gte('completed_date', activityStartDateStr)
      .lte('completed_date', todayStr),
    supabase
      .from('flashcard_reviews')
      .select('reviewed_at')
      .eq('user_id', userId)
      .gte('reviewed_at', activityStartISO)
      .lt('reviewed_at', activityEndExclusiveISO),
    supabase
      .from('xp_transactions')
      .select('amount, created_at')
      .eq('user_id', userId)
      .gte('created_at', thisWeekStartISO)
      .lt('created_at', thisWeekEndExclusiveISO),
    supabase
      .from('xp_transactions')
      .select('amount')
      .eq('user_id', userId)
      .gte('created_at', lastWeekStartISO)
      .lt('created_at', lastWeekEndExclusiveISO),
    supabase
      .from('badges')
      .select('*')
      .order('condition_value', { ascending: true }),
    supabase
      .from('user_badges')
      .select('badge_id')
      .eq('user_id', userId),
    supabase
      .from('flashcard_reviews')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .gte('reviewed_at', todayStart)
      .lte('reviewed_at', todayEnd),
    supabase
      .from('profiles')
      .select('character_name, character_class, avatar_url')
      .eq('user_id', userId)
      .maybeSingle(),
    supabase
      .from('level_thresholds')
      .select('level, xp_required')
      .order('level', { ascending: true }),
    supabase
      .from('unlockables')
      .select('name, unlock_value')
      .eq('unlock_type', 'level')
      .order('unlock_value', { ascending: true }),
    supabase
      .from('user_badges')
      .select('earned_at')
      .eq('user_id', userId),
  ])

  type BadgeRow = { badge_id: string; earned_at: string; badge: { id: string; slug: string; name: string; description: string; icon: string; rarity: string; condition_type: string; condition_value: number; created_at: string } }
  const recentBadges: BadgeWithStatus[] = (
    (recentBadgesRes.data ?? []) as BadgeRow[]
  ).map(ub => ({
    ...ub.badge,
    rarity: ub.badge.rarity as BadgeWithStatus['rarity'],
    earned: true,
    earned_at: ub.earned_at,
  }))

  // Build dailyActivity heatmap (126 cells, chronological)
  const activityMap = new Map<string, number>()
  const totalDays =
    Math.floor(
      (new Date(todayStr + 'T00:00:00Z').getTime() -
        new Date(activityStartDateStr + 'T00:00:00Z').getTime()) /
        86400000
    ) + 1
  for (let i = 0; i < totalDays; i++) {
    const d = new Date(
      new Date(activityStartDateStr + 'T00:00:00Z').getTime() + i * 86400000
    )
    activityMap.set(format(d, 'yyyy-MM-dd'), 0)
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const activityPomRows = (activityPomRes.data ?? []) as any as Array<{ completed_at: string }>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const activityHabRows = (activityHabRes.data ?? []) as any as Array<{ completed_date: string }>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const activityCardRows = (activityCardRes.data ?? []) as any as Array<{ reviewed_at: string }>

  for (const row of activityPomRows) {
    const key = format(new Date(row.completed_at), 'yyyy-MM-dd')
    if (activityMap.has(key)) activityMap.set(key, (activityMap.get(key) ?? 0) + 1)
  }
  for (const row of activityHabRows) {
    const key = row.completed_date.slice(0, 10)
    if (activityMap.has(key)) activityMap.set(key, (activityMap.get(key) ?? 0) + 1)
  }
  for (const row of activityCardRows) {
    const key = format(new Date(row.reviewed_at), 'yyyy-MM-dd')
    if (activityMap.has(key)) activityMap.set(key, (activityMap.get(key) ?? 0) + 1)
  }

  const dailyActivity: DailyActivityCell[] = Array.from(activityMap.entries())
    .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
    .map(([date, count]) => ({ date, count }))

  // Build weeklyXP
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const thisWeekXPRows = (thisWeekXPRes.data ?? []) as any as Array<{ amount: number; created_at: string }>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const lastWeekXPRows = (lastWeekXPRes.data ?? []) as any as Array<{ amount: number }>

  const dailyXP = Array(7).fill(0) as number[]
  let thisWeekXPSum = 0
  for (const row of thisWeekXPRows) {
    const d = new Date(row.created_at)
    const dayIdx = Math.floor((d.getTime() - thisWeekStart.getTime()) / 86400000)
    if (dayIdx >= 0 && dayIdx < 7) {
      dailyXP[dayIdx] += row.amount
    }
    thisWeekXPSum += row.amount
  }
  const lastWeekXPSum = lastWeekXPRows.reduce((s, r) => s + r.amount, 0)
  const weeklyXP: WeeklyXPData = {
    thisWeek: thisWeekXPSum,
    lastWeek: lastWeekXPSum,
    daily: dailyXP,
  }

  // Build unearnedBadges
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const allBadgeRows = (allBadgesRes.data ?? []) as any as Badge[]
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const userBadgeRows = (userBadgesRes.data ?? []) as any as Array<{ badge_id: string }>
  const earnedIds = new Set(userBadgeRows.map(ub => ub.badge_id))
  const unearnedBadges: BadgeWithStatus[] = allBadgeRows
    .filter(b => !earnedIds.has(b.id))
    .slice(0, 5)
    .map(badge => ({ ...badge, earned: false }))

  // Derive character name, class, level, xp-for-next-level
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const profileRow = (profileRes.data ?? null) as any as { character_name: string | null; character_class: string | null; avatar_url: string | null } | null
  const characterName = profileRow?.character_name ?? 'Adventurer'
  const characterClass = profileRow?.character_class ?? 'Scholar'
  const avatarUrl = profileRow?.avatar_url ?? null

  const currentLevel = characterStats?.level ?? 1

  // Next unlock: from `unlockables` table, first level-gated item whose level > current
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const unlockableRows = (unlockablesRes.data ?? []) as any as Array<{ name: string; unlock_value: number | null }>
  const nextUnlockRow = unlockableRows.find(
    u => typeof u.unlock_value === 'number' && u.unlock_value > currentLevel
  )
  const nextUnlock: NextUnlock | null = nextUnlockRow
    ? { name: nextUnlockRow.name, level: nextUnlockRow.unlock_value as number }
    : null

  // Compute xpForNextLevel from in-memory level_thresholds (xp_required is cumulative per seed data).
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const thresholdRows = (levelThresholdsRes.data ?? []) as any as Array<{ level: number; xp_required: number }>
  const thresholdMap = new Map<number, number>()
  for (const row of thresholdRows) thresholdMap.set(row.level, row.xp_required)
  const currentXPReq = thresholdMap.get(currentLevel)
  const nextXPReq = thresholdMap.get(currentLevel + 1)

  let xpForNextLevel: number
  if (typeof nextXPReq === 'number' && typeof currentXPReq === 'number') {
    xpForNextLevel = Math.max(1, nextXPReq - currentXPReq)
  } else {
    // Fallback: (level+1)^2 * 100 - level^2 * 100
    xpForNextLevel =
      (currentLevel + 1) * (currentLevel + 1) * 100 - currentLevel * currentLevel * 100
  }

  // Compute "unseen" persistent notifications using fields added in
  // migration 00019. Treat null seen-fields as "everything new".
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const userBadgeNotifyRows = (userBadgesForNotifyRes.data ?? []) as any as Array<{ earned_at: string }>
  const lastBadgesSeenAt = characterStats?.last_badges_seen_at ?? null
  const unseenBadgeCount = lastBadgesSeenAt
    ? userBadgeNotifyRows.filter(b => b.earned_at > lastBadgesSeenAt).length
    : userBadgeNotifyRows.length

  const lastLevelSeen = characterStats?.last_level_seen ?? null
  const hasUnseenLevelUp =
    characterStats != null &&
    (lastLevelSeen === null || characterStats.level > lastLevelSeen)

  const incompleteQuestCountToday = quests.filter(q => !q.is_completed).length

  const notifications = computeNotifications({
    characterStats,
    flashcardsDue: flashcardsRes.count ?? 0,
    totalHabitsToday: totalHabitsRes.count ?? 0,
    habitsDoneToday: habTodayRes.count ?? 0,
    pomodoroCountToday: pomTodayRes.count ?? 0,
    incompleteQuestCountToday,
    unseenBadgeCount,
    hasUnseenLevelUp,
  })

  return {
    characterStats,
    quests,
    recentBadges,
    thisWeek: thisWeekData,
    lastWeek: lastWeekData,
    pomodoroCountToday: pomTodayRes.count ?? 0,
    habitsDoneToday: habTodayRes.count ?? 0,
    totalHabitsToday: totalHabitsRes.count ?? 0,
    flashcardsDue: flashcardsRes.count ?? 0,
    weeklyXP,
    dailyActivity,
    unearnedBadges,
    cardsReviewedToday: cardsTodayRes.count ?? 0,
    nextUnlock,
    characterName,
    characterClass,
    avatarUrl,
    xpForNextLevel,
    notifications,
  }
}
