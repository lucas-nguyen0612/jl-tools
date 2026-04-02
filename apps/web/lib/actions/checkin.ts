'use server'

import { createServerSupabase } from '@/lib/supabase/server'
import { grantXP } from '@/lib/actions/xp'
import { XP_SOURCES } from '@/lib/constants/levels'

export type CheckInResult = {
  success: boolean
  xpEarned: number
  streakBonusEarned?: number
  leveledUp: boolean
  newLevel: number
  error?: string
}

function getStreakBonus(streak: number): number {
  if (streak === 7) return XP_SOURCES.STREAK_7_DAYS
  if (streak === 14) return XP_SOURCES.STREAK_14_DAYS
  if (streak === 30) return XP_SOURCES.STREAK_30_DAYS
  return 0
}

export async function checkInHabit(habitId: string): Promise<CheckInResult> {
  const supabase = await createServerSupabase()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user)
    return { success: false, xpEarned: 0, leveledUp: false, newLevel: 1, error: 'Unauthorized' }

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  // Check if already checked in today
  const { data: existing } = await supabase
    .from('habit_check_ins')
    .select('id')
    .eq('habit_id', habitId)
    .eq('user_id', user.id)
    .gte('checked_at', today.toISOString())
    .lt('checked_at', tomorrow.toISOString())
    .limit(1)

  if (existing && existing.length > 0) {
    return {
      success: false,
      xpEarned: 0,
      leveledUp: false,
      newLevel: 1,
      error: 'Already checked in today',
    }
  }

  // Record check-in
  const { error: insertError } = await supabase.from('habit_check_ins').insert({
    habit_id: habitId,
    user_id: user.id,
    checked_at: new Date().toISOString(),
    xp_earned: 0,
  })

  if (insertError)
    return {
      success: false,
      xpEarned: 0,
      leveledUp: false,
      newLevel: 1,
      error: insertError.message,
    }

  // Grant base XP
  const xpResult = await grantXP({
    userId: user.id,
    amount: XP_SOURCES.HABIT_CHECKIN,
    source: 'habit',
    sourceId: habitId,
  })

  let totalXp = xpResult.success ? xpResult.xpGranted : 0
  let leveledUp = xpResult.leveledUp ?? false
  let newLevel = xpResult.newLevel ?? 1
  let streakBonusEarned = 0

  // Check for streak bonus
  if (xpResult.success) {
    const { data: allCheckIns } = await supabase
      .from('habit_check_ins')
      .select('checked_at')
      .eq('habit_id', habitId)
      .eq('user_id', user.id)
      .order('checked_at', { ascending: false })

    if (allCheckIns) {
      // Calculate current streak
      const dates = allCheckIns.map((c) => new Date(c.checked_at))
      const todayStr = today.toISOString().split('T')[0]
      const yesterdayStr = new Date(today.getTime() - 86400000).toISOString().split('T')[0]

      // Sort descending
      dates.sort((a, b) => b.getTime() - a.getTime())
      const dateSet = new Set(dates.map((d) => d.toISOString().split('T')[0]))

      // Count consecutive days ending today or yesterday
      let streak = 0
      const cursor = new Date(dates[0])
      cursor.setHours(0, 0, 0, 0)
      const lastStr = cursor.toISOString().split('T')[0]
      if (lastStr === todayStr || lastStr === yesterdayStr) {
        let day = new Date(cursor)
        while (dateSet.has(day.toISOString().split('T')[0])) {
          streak++
          day.setDate(day.getDate() - 1)
        }
      }

      const bonus = getStreakBonus(streak)
      if (bonus > 0) {
        const bonusResult = await grantXP({
          userId: user.id,
          amount: bonus,
          source: 'streak_bonus',
          sourceId: habitId,
        })
        if (bonusResult.success) {
          streakBonusEarned = bonus
          totalXp += bonus
          leveledUp = leveledUp || bonusResult.leveledUp
          newLevel = bonusResult.newLevel ?? newLevel
        }
      }
    }
  }

  // Update xp_earned on the check-in
  await supabase
    .from('habit_check_ins')
    .update({ xp_earned: totalXp })
    .eq('habit_id', habitId)
    .eq('user_id', user.id)
    .gte('checked_at', today.toISOString())
    .lt('checked_at', tomorrow.toISOString())

  return {
    success: true,
    xpEarned: totalXp,
    streakBonusEarned,
    leveledUp,
    newLevel,
    error: xpResult.success ? undefined : xpResult.error,
  }
}

export async function undoCheckIn(habitId: string): Promise<CheckInResult> {
  const supabase = await createServerSupabase()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user)
    return { success: false, xpEarned: 0, leveledUp: false, newLevel: 1, error: 'Unauthorized' }

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  const { data: existing } = await supabase
    .from('habit_check_ins')
    .select('id, xp_earned')
    .eq('habit_id', habitId)
    .eq('user_id', user.id)
    .gte('checked_at', today.toISOString())
    .lt('checked_at', tomorrow.toISOString())
    .limit(1)

  if (!existing || existing.length === 0) {
    return {
      success: false,
      xpEarned: 0,
      leveledUp: false,
      newLevel: 1,
      error: 'No check-in found',
    }
  }

  await supabase.from('habit_check_ins').delete().eq('id', existing[0].id)

  if (existing[0].xp_earned > 0) {
    await supabase
      .from('xp_transactions')
      .delete()
      .eq('user_id', user.id)
      .eq('source', 'habit')
      .eq('source_id', habitId)
      .gte('created_at', today.toISOString())
      .lt('created_at', tomorrow.toISOString())
  }

  return { success: true, xpEarned: -existing[0].xp_earned, leveledUp: false, newLevel: 1 }
}
