import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/onboarding'

  if (code) {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          },
        },
      },
    )

    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      // Check if user completed onboarding to decide redirect target
      const { data: profile } = await supabase
        .from('profiles')
        .select('locale, onboarding_completed')
        .single()

      const locale = profile?.locale ?? 'en'
      const destination = profile?.onboarding_completed
        ? `/${locale}/dashboard`
        : `/${locale}/onboarding`

      return NextResponse.redirect(`${origin}${destination}`, {
        status: 301,
      })
    }
  }

  return NextResponse.redirect(`${origin}/en/login?error=auth`, {
    status: 301,
  })
}
