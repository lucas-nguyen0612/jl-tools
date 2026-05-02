import { google } from 'googleapis'
import { createClient } from '@/lib/supabase/server'

export function getOAuthClient() {
  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID!,
    process.env.GOOGLE_CLIENT_SECRET!,
    process.env.GOOGLE_REDIRECT_URI!
  )
}

/** Returns an authenticated OAuth2 client with auto-refreshed token. */
export async function getAuthorizedClient(userId: string) {
  const supabase = await createClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: tokenRow } = await (supabase as any)
    .from('calendar_tokens')
    .select('access_token, refresh_token, expires_at')
    .eq('user_id', userId)
    .single()

  if (!tokenRow) throw new Error('CALENDAR_NOT_CONNECTED')

  const oauth2Client = getOAuthClient()
  oauth2Client.setCredentials({
    access_token: tokenRow.access_token,
    refresh_token: tokenRow.refresh_token,
    expiry_date: new Date(tokenRow.expires_at).getTime(),
  })

  if (new Date(tokenRow.expires_at) < new Date(Date.now() + 60_000)) {
    const { credentials } = await oauth2Client.refreshAccessToken()
    // Conditional update: only write if another concurrent refresh hasn't already done so.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any)
      .from('calendar_tokens')
      .update({
        access_token: credentials.access_token!,
        expires_at: new Date(credentials.expiry_date!).toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId)
      .eq('expires_at', tokenRow.expires_at)
    oauth2Client.setCredentials(credentials)
  }

  return oauth2Client
}
