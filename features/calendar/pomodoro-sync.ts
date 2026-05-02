'use server'

import { google } from 'googleapis'
import { createClient } from '@/lib/supabase/server'
import { getAuthorizedClient } from './oauth-client'

export type PomodoroSyncInput = {
  taskName?: string
  startedAt: string   // ISO string
  completedAt: string // ISO string
  durationMinutes: number
}

export async function createPomodoroCalendarEvent(
  input: PomodoroSyncInput
): Promise<{ data: { eventId: string } | null; error: { message: string; code: string } | null }> {
  const supabase = await createClient()
  const { data: { user }, error: userError } = await supabase.auth.getUser()

  if (userError || !user) {
    return {
      data: null,
      error: { message: 'Not authenticated', code: 'NOT_AUTHENTICATED' },
    }
  }

  let auth
  try {
    auth = await getAuthorizedClient(user.id)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    if (message === 'CALENDAR_NOT_CONNECTED') {
      return {
        data: null,
        error: { message: 'Google Calendar is not connected', code: 'CALENDAR_NOT_CONNECTED' },
      }
    }
    return {
      data: null,
      error: { message, code: 'CALENDAR_AUTH_ERROR' },
    }
  }

  try {
    const calendar = google.calendar({ version: 'v3', auth })
    const event = await calendar.events.insert({
      calendarId: 'primary',
      requestBody: {
        summary: `🍅 ${input.taskName ?? 'Focus Session'}`,
        start: { dateTime: input.startedAt },
        end: { dateTime: input.completedAt },
        colorId: '11',
        description: `Pomodoro session · ${input.durationMinutes} min`,
      },
    })

    const eventId = event.data.id
    if (!eventId) {
      return {
        data: null,
        error: { message: 'Event created but no ID returned', code: 'MISSING_EVENT_ID' },
      }
    }

    return { data: { eventId }, error: null }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to create calendar event'
    return {
      data: null,
      error: { message, code: 'CALENDAR_CREATE_ERROR' },
    }
  }
}
