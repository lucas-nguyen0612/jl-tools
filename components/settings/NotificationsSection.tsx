import { createClient } from '@/lib/supabase/server'
import type { Database } from '@/types/database'
import { DEFAULT_NOTIFICATION_SETTINGS } from '@/features/settings/notification-schemas'
import { PomodoroSoundCard } from './PomodoroSoundCard'
import { HabitReminderCard } from './HabitReminderCard'
import { BrowserPermissionCard } from './BrowserPermissionCard'

type UserPreferences = Database['public']['Tables']['user_preferences']['Row']

export async function NotificationsSection() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let pomodoroSound = DEFAULT_NOTIFICATION_SETTINGS.pomodoro_sound
  let pomodoroVolume = DEFAULT_NOTIFICATION_SETTINGS.pomodoro_volume
  let habitRemindersEnabled = DEFAULT_NOTIFICATION_SETTINGS.habit_reminders_enabled

  if (user) {
    const { data } = await supabase
      .from('user_preferences')
      .select('notification_settings')
      .eq('user_id', user.id)
      .maybeSingle()
    const row = data as Pick<UserPreferences, 'notification_settings'> | null
    if (row?.notification_settings) {
      pomodoroSound = row.notification_settings.pomodoro_sound ?? DEFAULT_NOTIFICATION_SETTINGS.pomodoro_sound
      pomodoroVolume = row.notification_settings.pomodoro_volume ?? DEFAULT_NOTIFICATION_SETTINGS.pomodoro_volume
      habitRemindersEnabled = row.notification_settings.habit_reminders_enabled ?? DEFAULT_NOTIFICATION_SETTINGS.habit_reminders_enabled
    }
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 28,
        padding: '22px 28px 40px',
        maxWidth: 720,
      }}
    >
      <PomodoroSoundCard
        initialSound={pomodoroSound}
        initialVolume={pomodoroVolume}
      />
      <HabitReminderCard
        initialEnabled={habitRemindersEnabled}
      />
      <BrowserPermissionCard />
    </div>
  )
}
