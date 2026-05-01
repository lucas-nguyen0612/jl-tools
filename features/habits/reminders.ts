/**
 * Habit reminder gate — Story 5 Option A.
 *
 * No server-side push / scheduling exists yet (deferred per master doc).
 * This helper provides the early-return gate that future reminder code
 * MUST call before firing any habit reminder notification.
 *
 * Usage:
 *   if (!(await shouldFireHabitReminder(userId))) return
 *   // ... fire the reminder
 */

import { createClient } from '@/lib/supabase/server'

/**
 * Returns `true` if habit reminders are enabled for the given user.
 * Returns `false` (gate blocks) when `habit_reminders_enabled` is `false`
 * or when user_preferences cannot be fetched.
 */
export async function shouldFireHabitReminder(userId: string): Promise<boolean> {
  try {
    const supabase = await createClient()
    const { data } = await (supabase
      .from('user_preferences')
      .select('notification_settings')
      .eq('user_id', userId)
      .maybeSingle() as unknown as Promise<{
        data: { notification_settings: { habit_reminders_enabled: boolean } | null } | null
      }>)

    const enabled = data?.notification_settings?.habit_reminders_enabled
    // Default to true when pref row absent (opt-out not configured)
    return enabled !== false
  } catch {
    // Fail open — if we can't read prefs, don't suppress reminders
    return true
  }
}
