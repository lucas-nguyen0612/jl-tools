'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import {
  DEFAULT_HUE,
  DEFAULT_THEME,
  writeThemeCookie,
  type Theme,
} from '@/lib/settings/theme-cookie'
import { appearanceSchema, type AppearanceInput } from '@/features/settings/schemas'
import { notificationsSchema, type NotificationsInput } from '@/features/settings/notification-schemas'
import type { Database } from '@/types/database'

type ActionResult<T> =
  | { data: T; error: null }
  | { data: null; error: { message: string; code: string } }

type UserPreferences = Database['public']['Tables']['user_preferences']['Row']

export async function updateAppearance(
  input: AppearanceInput
): Promise<ActionResult<UserPreferences>> {
  const parsed = appearanceSchema.safeParse(input)
  if (!parsed.success) {
    return { data: null, error: { message: 'Invalid appearance settings', code: 'VALIDATION_ERROR' } }
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { data: null, error: { message: 'Unauthorized', code: 'AUTH_REQUIRED' } }

  const appearance_settings = {
    theme: parsed.data.theme,
    accent_hue: parsed.data.accent_hue,
  }

  // upsert keeps this resilient if the trigger-seeded row was ever missed.
  // `as never` cast matches the codebase pattern (features/pomodoro/actions.ts:227,
  // features/habits/actions.ts:150) where supabase type inference falls through.
  const { data, error } = await (supabase
    .from('user_preferences')
    .upsert({ user_id: user.id, appearance_settings } as never, { onConflict: 'user_id' })
    .select('*')
    .single() as unknown as Promise<{
      data: UserPreferences | null
      error: { message: string } | null
    }>)

  if (error || !data) {
    return { data: null, error: { message: error?.message ?? 'Update failed', code: 'DB_ERROR' } }
  }

  await writeThemeCookie(parsed.data.theme, parsed.data.accent_hue)
  revalidatePath('/', 'layout')

  return { data, error: null }
}

export async function updateNotifications(
  input: NotificationsInput
): Promise<ActionResult<UserPreferences>> {
  const parsed = notificationsSchema.safeParse(input)
  if (!parsed.success) {
    return { data: null, error: { message: 'Invalid notification settings', code: 'VALIDATION_ERROR' } }
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { data: null, error: { message: 'Unauthorized', code: 'AUTH_REQUIRED' } }

  const notification_settings = {
    pomodoro_sound: parsed.data.pomodoro_sound,
    pomodoro_volume: parsed.data.pomodoro_volume,
    habit_reminders_enabled: parsed.data.habit_reminders_enabled,
  }

  const { data, error } = await (supabase
    .from('user_preferences')
    .upsert({ user_id: user.id, notification_settings } as never, { onConflict: 'user_id' })
    .select('*')
    .single() as unknown as Promise<{
      data: UserPreferences | null
      error: { message: string } | null
    }>)

  if (error || !data) {
    return { data: null, error: { message: error?.message ?? 'Update failed', code: 'DB_ERROR' } }
  }

  try {
    revalidatePath('/', 'layout')
  } catch (revalidateErr) {
    console.error('[notifications] revalidatePath failed:', revalidateErr)
  }

  return { data, error: null }
}

export async function syncAppearanceCookies(): Promise<ActionResult<UserPreferences | null>> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { data: null, error: { message: 'Unauthorized', code: 'AUTH_REQUIRED' } }

  const { data, error } = await (supabase
    .from('user_preferences')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle() as unknown as Promise<{
      data: UserPreferences | null
      error: { message: string } | null
    }>)

  if (error) {
    return { data: null, error: { message: error.message, code: 'DB_ERROR' } }
  }

  const row = data
  const theme: Theme = row?.appearance_settings?.theme ?? DEFAULT_THEME
  const hue = row?.appearance_settings?.accent_hue ?? DEFAULT_HUE

  await writeThemeCookie(theme, hue)
  revalidatePath('/', 'layout')

  return { data: row, error: null }
}
