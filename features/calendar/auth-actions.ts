'use server'

import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { google } from 'googleapis'
import { createClient } from '@/lib/supabase/server'
import { getOAuthClient, getAuthorizedClient } from './oauth-client'
import type { CalendarConnectionStatus } from './types'

const CALENDAR_SCOPE = 'https://www.googleapis.com/auth/calendar'
const TASKS_SCOPE = 'https://www.googleapis.com/auth/tasks.readonly'
const STATE_COOKIE = 'cal_oauth_state'

export async function connectGoogleCalendar() {
  const oauth2Client = getOAuthClient()
  const state = crypto.randomUUID()
  const cookieStore = await cookies()
  cookieStore.set(STATE_COOKIE, state, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 300,
  })
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: [CALENDAR_SCOPE, TASKS_SCOPE],
    prompt: 'consent',
    state,
  })
  redirect(authUrl)
}

export async function handleCalendarCallback(
  code: string
): Promise<{ error?: string }> {
  const oauth2Client = getOAuthClient()

  try {
    const { tokens } = await oauth2Client.getToken(code)

    if (!tokens.access_token || !tokens.refresh_token) {
      return { error: 'MISSING_TOKENS' }
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'NOT_AUTHENTICATED' }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any).from('calendar_tokens').upsert({
      user_id: user.id,
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      expires_at: new Date(tokens.expiry_date!).toISOString(),
      scope: tokens.scope ?? CALENDAR_SCOPE,
      updated_at: new Date().toISOString(),
    })

    return {}
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'UNKNOWN_ERROR' }
  }
}

export async function disconnectGoogleCalendar(): Promise<void> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: tokenRow } = await (supabase as any)
    .from('calendar_tokens')
    .select('access_token')
    .eq('user_id', user.id)
    .single()

  if (tokenRow) {
    try {
      const oauth2Client = getOAuthClient()
      await oauth2Client.revokeToken(tokenRow.access_token)
    } catch {
      // Best-effort — proceed even if revoke fails
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: deleteError } = await (supabase as any)
      .from('calendar_tokens')
      .delete()
      .eq('user_id', user.id)
    if (deleteError) throw new Error(deleteError.message)
  }
}

export async function getCalendarConnectionStatus(): Promise<CalendarConnectionStatus> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { connected: false }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = await (supabase as any)
    .from('calendar_tokens')
    .select('id')
    .eq('user_id', user.id)
    .maybeSingle()

  if (!data) return { connected: false }

  // Best-effort: surface the connected Google account email so the UI can show it.
  try {
    const oauth = await getAuthorizedClient(user.id)
    const oauth2 = google.oauth2({ version: 'v2', auth: oauth })
    const { data: info } = await oauth2.userinfo.get()
    return { connected: true, email: info.email ?? undefined }
  } catch {
    return { connected: true }
  }
}
