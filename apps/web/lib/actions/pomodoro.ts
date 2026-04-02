'use server'

import { createServerSupabase } from '@/lib/supabase/server'
import type { PomodoroSettings } from '@/types/pomodoro'

export type PomodoroSettingsState = { success: boolean; error: string | null }

export async function savePomodoroSettings(
  _prevState: PomodoroSettingsState,
  formData: FormData,
): Promise<PomodoroSettingsState> {
  const supabase = await createServerSupabase()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'Not authenticated' }
  }

  const focusDuration = parseInt(formData.get('focusDuration') as string, 10)
  const shortBreakDuration = parseInt(formData.get('shortBreakDuration') as string, 10)
  const longBreakDuration = parseInt(formData.get('longBreakDuration') as string, 10)
  const sessionsBeforeLongBreak = parseInt(formData.get('sessionsBeforeLongBreak') as string, 10)

  const settings: PomodoroSettings = {
    focusDuration: isNaN(focusDuration) ? 25 : focusDuration,
    shortBreakDuration: isNaN(shortBreakDuration) ? 5 : shortBreakDuration,
    longBreakDuration: isNaN(longBreakDuration) ? 15 : longBreakDuration,
    sessionsBeforeLongBreak: isNaN(sessionsBeforeLongBreak) ? 4 : sessionsBeforeLongBreak,
  }

  const { error } = await supabase
    .from('profiles')
    .update({ pomodoro_settings: settings })
    .eq('id', user.id)

  if (error) {
    return { success: false, error: error.message }
  }

  return { success: true, error: null }
}
