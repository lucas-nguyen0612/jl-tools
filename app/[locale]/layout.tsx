import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { hasLocale, NextIntlClientProvider } from 'next-intl'
import { setRequestLocale } from 'next-intl/server'
import '../globals.css'
import { Providers } from '@/components/Providers'
import { readThemeCookie, htmlClassForTheme } from '@/lib/settings/theme-cookie'
import { routing } from '@/i18n/routing'

export const metadata: Metadata = {
  title: 'JL Tools',
  description: 'Your productivity RPG',
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

const SYSTEM_THEME_SCRIPT = `(function(){try{var m=document.cookie.match(/(?:^|; )jl-theme=([^;]+)/);var v=m?decodeURIComponent(m[1]):'system';if(v==='system'&&window.matchMedia('(prefers-color-scheme: dark)').matches){document.documentElement.classList.add('jl-dark','dark');}}catch(e){}})();`

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  if (!hasLocale(routing.locales, locale)) {
    notFound()
  }
  setRequestLocale(locale)

  const { theme, hue } = await readThemeCookie()
  const htmlClass = htmlClassForTheme(theme)
  const htmlStyle = { '--jl-hue': String(hue) } as React.CSSProperties

  return (
    <html lang={locale} className={htmlClass} style={htmlStyle} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: SYSTEM_THEME_SCRIPT }} />
      </head>
      <body>
        <NextIntlClientProvider>
          <Providers>{children}</Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
