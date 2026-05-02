'use server'

import { google } from 'googleapis'
import { createClient } from '@/lib/supabase/server'
import { getAuthorizedClient } from './oauth-client'
import type { CalendarEvent, CreateEventInput, UpdateEventInput } from './types'

type ActionResult<T> =
  | { data: T; error: null }
  | { data: null; error: { message: string; code: string } }

function mapGoogleEvent(ev: {
  id?: string | null
  summary?: string | null
  start?: { dateTime?: string | null; date?: string | null } | null
  end?: { dateTime?: string | null; date?: string | null } | null
  colorId?: string | null
  description?: string | null
}): CalendarEvent {
  const allDay = !ev.start?.dateTime
  return {
    id: ev.id ?? '',
    title: ev.summary ?? '(No title)',
    start: ev.start?.dateTime ?? ev.start?.date ?? '',
    end: ev.end?.dateTime ?? ev.end?.date ?? '',
    allDay,
    color: ev.colorId ?? undefined,
    source: 'google',
    description: ev.description ?? undefined,
  }
}

async function getCalendarInstance() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')
  const authClient = await getAuthorizedClient(user.id)
  return google.calendar({ version: 'v3', auth: authClient })
}

async function getTasksInstance() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')
  const authClient = await getAuthorizedClient(user.id)
  return google.tasks({ version: 'v1', auth: authClient })
}

function mapCalendarError(err: unknown, fallbackCode: string): { message: string; code: string } {
  const message = err instanceof Error ? err.message : 'Calendar operation failed'
  if (message === 'CALENDAR_NOT_CONNECTED') return { message, code: 'CALENDAR_NOT_CONNECTED' }
  if (message === 'Not authenticated') return { message, code: 'NOT_AUTHENTICATED' }
  return { message, code: fallbackCode }
}

export async function listEvents(
  timeMin: string,
  timeMax: string
): Promise<ActionResult<CalendarEvent[]>> {
  try {
    const calendar = await getCalendarInstance()
    const res = await calendar.events.list({
      calendarId: 'primary',
      timeMin,
      timeMax,
      singleEvents: true,
      orderBy: 'startTime',
    })
    return { data: (res.data.items ?? []).map(mapGoogleEvent), error: null }
  } catch (err) {
    return { data: null, error: mapCalendarError(err, 'LIST_EVENTS_FAILED') }
  }
}

export async function createEvent(
  input: CreateEventInput
): Promise<ActionResult<CalendarEvent>> {
  try {
    const calendar = await getCalendarInstance()
    const eventBody = input.allDay
      ? {
          summary: input.title,
          description: input.description,
          colorId: input.colorId,
          start: { date: input.startAt.split('T')[0] },
          end: { date: input.endAt.split('T')[0] },
        }
      : {
          summary: input.title,
          description: input.description,
          colorId: input.colorId,
          start: { dateTime: new Date(input.startAt).toISOString() },
          end: { dateTime: new Date(input.endAt).toISOString() },
        }
    const res = await calendar.events.insert({ calendarId: 'primary', requestBody: eventBody })
    return { data: mapGoogleEvent(res.data), error: null }
  } catch (err) {
    return { data: null, error: mapCalendarError(err, 'CREATE_EVENT_FAILED') }
  }
}

export async function updateEvent(
  eventId: string,
  input: UpdateEventInput
): Promise<ActionResult<CalendarEvent>> {
  try {
    const calendar = await getCalendarInstance()
    const patch: Record<string, unknown> = {}
    if (input.title !== undefined) patch.summary = input.title
    if (input.description !== undefined) patch.description = input.description
    if (input.colorId !== undefined) patch.colorId = input.colorId
    if (input.startAt !== undefined) {
      patch.start = input.allDay
        ? { date: input.startAt.split('T')[0] }
        : { dateTime: new Date(input.startAt).toISOString() }
    }
    if (input.endAt !== undefined) {
      patch.end = input.allDay
        ? { date: input.endAt.split('T')[0] }
        : { dateTime: new Date(input.endAt).toISOString() }
    }
    const res = await calendar.events.patch({ calendarId: 'primary', eventId, requestBody: patch })
    return { data: mapGoogleEvent(res.data), error: null }
  } catch (err) {
    return { data: null, error: mapCalendarError(err, 'UPDATE_EVENT_FAILED') }
  }
}

export async function deleteEvent(eventId: string): Promise<ActionResult<void>> {
  try {
    const calendar = await getCalendarInstance()
    await calendar.events.delete({ calendarId: 'primary', eventId })
    return { data: undefined, error: null }
  } catch (err) {
    return { data: null, error: mapCalendarError(err, 'DELETE_EVENT_FAILED') }
  }
}

export async function listTasks(
  timeMin: string,
  timeMax: string,
): Promise<ActionResult<CalendarEvent[]>> {
  try {
    const tasksClient = await getTasksInstance()

    // Fetch all task lists so tasks outside @default are included.
    const listsRes = await tasksClient.tasklists.list({ maxResults: 20 })
    const taskLists = listsRes.data.items ?? []

    const rangeStart = new Date(timeMin)
    const rangeEnd = new Date(timeMax)

    // Fetch incomplete tasks from all lists in parallel.
    // Filter by due date client-side — the API-level dueMin/dueMax param is
    // unreliable when task due times are stored as midnight UTC.
    const taskResults = await Promise.all(
      taskLists.map((list) =>
        tasksClient.tasks.list({
          tasklist: list.id!,
          showCompleted: false,
          maxResults: 100,
        }),
      ),
    )

    const events: CalendarEvent[] = taskResults
      .flatMap((res) => res.data.items ?? [])
      .filter((t) => {
        if (!t.due) return false
        const due = new Date(t.due)
        return due >= rangeStart && due <= rangeEnd
      })
      .map((t) => ({
        id: t.id ?? '',
        title: t.title ?? '(No title)',
        start: t.due!.split('T')[0],
        end: t.due!.split('T')[0],
        allDay: true,
        source: 'task' as const,
        description: t.notes ?? undefined,
      }))

    return { data: events, error: null }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    // Silently return empty only for genuine scope/auth issues.
    if (
      msg === 'CALENDAR_NOT_CONNECTED' ||
      msg === 'Not authenticated' ||
      msg.toLowerCase().includes('insufficient')
    ) {
      return { data: [], error: null }
    }
    return { data: null, error: mapCalendarError(err, 'LIST_TASKS_FAILED') }
  }
}
