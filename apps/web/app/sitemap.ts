import { routing } from '@/i18n/routing'

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://jl-tools.app'

export default function sitemap() {
  const locales = routing.locales

  const staticPaths = [
    '/dashboard',
    '/pomodoro',
    '/pomodoro/history',
    '/pomodoro/settings',
    '/habits',
    '/profile',
    '/onboarding',
  ]

  const paths = locales.flatMap((locale) =>
    staticPaths.map((path) => ({
      url: `${BASE_URL}/${locale}${path}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: path === '/dashboard' ? 1.0 : 0.8,
    })),
  )

  return paths
}
