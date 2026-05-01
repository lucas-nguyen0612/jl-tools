'use server'

import { revalidatePath } from 'next/cache'
import { createClient, getUser } from '@/lib/supabase/server'

/**
 * Mark all currently-unlocked badges as "seen" by the user. After this
 * runs, the bell's `new_badges` notification will not re-appear unless
 * a new badge is awarded.
 */
export async function markBadgesSeen(): Promise<void> {
  const user = await getUser()
  if (!user) return
  const supabase = await createClient()

  await supabase
    .from('character_stats')
    .update({ last_badges_seen_at: new Date().toISOString() } as never)
    .eq('user_id', user.id)

  revalidatePath('/dashboard')
}

/**
 * Mark the user's current level as "seen" so the level-up notification
 * is dismissed until the next level transition.
 */
export async function markLevelSeen(): Promise<void> {
  const user = await getUser()
  if (!user) return
  const supabase = await createClient()

  const { data: stats } = await supabase
    .from('character_stats')
    .select('level')
    .eq('user_id', user.id)
    .maybeSingle()

  const currentLevel = ((stats as { level?: number } | null)?.level ?? 1)

  await supabase
    .from('character_stats')
    .update({ last_level_seen: currentLevel } as never)
    .eq('user_id', user.id)

  revalidatePath('/dashboard')
}
