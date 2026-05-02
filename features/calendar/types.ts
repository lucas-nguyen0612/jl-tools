export type CalendarToken = {
  id: string
  user_id: string
  access_token: string
  refresh_token: string
  expires_at: string
  scope: string
  created_at: string
  updated_at: string
}

export type CalendarConnectionStatus = {
  connected: boolean
  email?: string
}

export type CalendarEventSource = 'google' | 'pomodoro' | 'habit' | 'task'

export type CalendarEvent = {
  id: string
  title: string
  start: string
  end: string
  allDay: boolean
  color?: string
  source: CalendarEventSource
  description?: string
}

export type CreateEventInput = {
  title: string
  startAt: string
  endAt: string
  allDay?: boolean
  description?: string
  colorId?: string
}

export type UpdateEventInput = Partial<CreateEventInput>
