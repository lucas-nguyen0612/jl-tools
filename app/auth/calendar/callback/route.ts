import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { handleCalendarCallback } from '@/features/calendar/auth-actions'

const STATE_COOKIE = 'cal_oauth_state'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const error = searchParams.get('error')
  const state = searchParams.get('state')

  const cookieStore = await cookies()
  const expectedState = cookieStore.get(STATE_COOKIE)?.value
  cookieStore.delete(STATE_COOKIE)

  if (error || !code || !state || !expectedState || state !== expectedState) {
    return NextResponse.redirect(`${origin}/calendar?error=google_denied`)
  }

  const result = await handleCalendarCallback(code)

  if (result.error) {
    return NextResponse.redirect(`${origin}/calendar?error=callback_failed`)
  }

  return NextResponse.redirect(`${origin}/calendar`)
}
