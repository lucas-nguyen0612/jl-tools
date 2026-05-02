'use server'

import { google } from 'googleapis'
import { getAuthorizedClient } from './oauth-client'

function hexColorToGoogleColorId(hex: string): string {
  const map: Record<string, string> = {
    '#ef4444': '11', // tomato
    '#f97316': '6',  // tangerine
    '#eab308': '5',  // banana
    '#22c55e': '10', // basil
    '#3b82f6': '9',  // blueberry
    '#8b5cf6': '3',  // grape
    '#ec4899': '4',  // flamingo
  }
  return map[hex.toLowerCase()] ?? '1'
}

export async function syncHabitCalendarEvent(input: {
  userId: string
  habitId: string
  habitName: string
  habitColor: string
  date: string     // YYYY-MM-DD
  checked: boolean // true = add event, false = remove event
}): Promise<void> {
  try {
    const { userId, habitId, habitName, habitColor, date, checked } = input
    const client = await getAuthorizedClient(userId)
    const calendar = google.calendar({ version: 'v3', auth: client })

    // Search for an existing event tagged with this habit + date
    const listRes = await calendar.events.list({
      calendarId: 'primary',
      privateExtendedProperty: [
        `jlHabitId=${habitId}`,
        `jlDate=${date}`,
      ],
    })

    const existingEvent = listRes.data.items?.[0] ?? null

    if (checked) {
      // Idempotent: only create if no event exists yet
      if (!existingEvent) {
        await calendar.events.insert({
          calendarId: 'primary',
          requestBody: {
            summary: habitName,
            start: { date },
            end: { date },
            colorId: hexColorToGoogleColorId(habitColor),
            extendedProperties: {
              private: {
                jlHabitId: habitId,
                jlDate: date,
                jlSource: 'habit',
              },
            },
          },
        })
      }
    } else {
      // Remove event if found
      if (existingEvent?.id) {
        await calendar.events.delete({
          calendarId: 'primary',
          eventId: existingEvent.id,
        })
      }
    }
  } catch {
    // Best-effort — never throw from habit sync
  }
}
