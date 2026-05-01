import { z } from 'zod'

export const notificationsSchema = z.object({
  pomodoro_sound: z.boolean(),
  pomodoro_volume: z.number().int().min(0).max(100),
  habit_reminders_enabled: z.boolean(),
})

export type NotificationsInput = z.infer<typeof notificationsSchema>

export const DEFAULT_NOTIFICATION_SETTINGS: NotificationsInput = {
  pomodoro_sound: true,
  pomodoro_volume: 80,
  habit_reminders_enabled: true,
}
