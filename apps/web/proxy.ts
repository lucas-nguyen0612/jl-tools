import { NextResponse, type NextRequest } from 'next/server'
import createNextIntlMiddleware from 'next-intl/middleware'
import { routing } from './i18n/routing'

const i18nMiddleware = createNextIntlMiddleware(routing)

// Routes that require authentication
const PROTECTED_PATHS = ['/dashboard', '/pomodoro', '/habits', '/profile']

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Check if this is a protected route
  const isProtected = PROTECTED_PATHS.some(
    (path) => pathname === path || pathname.startsWith(path + '/'),
  )

  if (isProtected) {
    // Check for Supabase auth cookie
    const supabaseAuthCookie =
      request.cookies.get('sb-access-token') ||
      request.cookies.get('supabase-auth-token') ||
      request.cookies.get('__session')

    if (!supabaseAuthCookie?.value) {
      // Try to redirect to login in the current locale
      const locale = pathname.split('/')[1] || routing.defaultLocale
      const loginUrl = new URL(`/${locale}/login`, request.url)
      loginUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(loginUrl)
    }
  }

  // Run i18n routing
  return i18nMiddleware(request)
}

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)', '/(vi|en)/:path*'],
}
