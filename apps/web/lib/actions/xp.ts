'use server'

import { createServerSupabase } from '@/lib/supabase/server'

// Abuse prevention constants (shared with packages/shared)
const XP_DAILY_CAP = 500
const POMODORO_MIN_DURATION_SECONDS = 60

export type XpGrantResult = {
  success: boolean
  xpGranted: number
  newTotalXp: number
  newLevel: number
  leveledUp: boolean
  error?: string
}

export async function grantXP(params: {
  userId: string
  amount: number
  source: 'pomodoro' | 'habit' | 'streak_bonus' | 'manual'
  sourceId?: string
  sessionDurationSeconds?: number
}): Promise<XpGrantResult> {
  const supabase = await createServerSupabase()
  const { userId, amount, source, sourceId, sessionDurationSeconds } = params

  const errorResult = {
    success: false as const,
    xpGranted: 0,
    newTotalXp: 0,
    newLevel: 1,
    leveledUp: false,
  }

  // Validation
  if (amount <= 0) {
    return { ...errorResult, newTotalXp: 0, newLevel: 1, error: 'Invalid XP amount' }
  }

  // Get current profile
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('current_xp, current_level, total_xp_earned')
    .eq('id', userId)
    .single()

  if (profileError || !profile) {
    return { ...errorResult, newTotalXp: 0, newLevel: 1, error: 'Profile not found' }
  }

  const profileErrorResult = {
    success: false as const,
    xpGranted: 0,
    newTotalXp: profile.total_xp_earned,
    newLevel: profile.current_level,
    leveledUp: false,
  }

  // XP abuse: check daily cap
  const todayStart = new Date()
  todayStart.setHours(0, 0, 0, 0)

  const { data: todayXp } = await supabase
    .from('xp_transactions')
    .select('amount')
    .eq('user_id', userId)
    .gte('created_at', todayStart.toISOString())

  const todayTotal = (todayXp ?? []).reduce((sum, t) => sum + t.amount, 0)
  if (todayTotal >= XP_DAILY_CAP) {
    return { ...profileErrorResult, error: 'Daily XP cap reached' }
  }

  // XP abuse: validate session duration for pomodoro
  if (source === 'pomodoro' && sessionDurationSeconds !== undefined) {
    if (sessionDurationSeconds < POMODORO_MIN_DURATION_SECONDS) {
      return { ...profileErrorResult, error: 'Session too short' }
    }
  }

  // XP abuse: check cooldown for pomodoro (last pomodoro XP < 5 min ago)
  if (source === 'pomodoro') {
    const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString()
    const { data: recentPomodoros } = await supabase
      .from('xp_transactions')
      .select('created_at')
      .eq('user_id', userId)
      .eq('source', 'pomodoro')
      .gte('created_at', fiveMinAgo)
      .limit(1)

    if ((recentPomodoros ?? []).length > 0) {
      return { ...profileErrorResult, error: 'Pomodoro cooldown' }
    }
  }

  // Calculate new XP
  const newTotalXp = profile.total_xp_earned + amount
  const newLevel = calculateLevel(newTotalXp)
  const leveledUp = newLevel > profile.current_level

  // Record transaction
  const { error: txError } = await supabase.from('xp_transactions').insert({
    user_id: userId,
    amount,
    source,
    source_id: sourceId ?? null,
  })

  if (txError) {
    return { ...profileErrorResult, error: txError.message }
  }

  // Update profile
  const { error: updateError } = await supabase
    .from('profiles')
    .update({
      current_xp: newTotalXp,
      current_level: newLevel,
      total_xp_earned: newTotalXp,
    })
    .eq('id', userId)

  if (updateError) {
    return { ...profileErrorResult, error: updateError.message }
  }

  return {
    success: true,
    xpGranted: amount,
    newTotalXp,
    newLevel,
    leveledUp,
    error: undefined,
  }
}

function calculateLevel(totalXp: number): number {
  const LEVEL_THRESHOLDS = [
    0, 100, 250, 500, 850, 1300, 1900, 2650, 3550, 4600, 5800, 7150, 8650, 10300, 12100, 14050,
    16150, 18400, 20800, 23400,
  ] as const
  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (totalXp >= LEVEL_THRESHOLDS[i]) {
      return i + 1
    }
  }
  return 1
}
