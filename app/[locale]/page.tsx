import { notFound } from 'next/navigation'
import { hasLocale } from 'next-intl'
import { setRequestLocale } from 'next-intl/server'
import { redirect } from '@/i18n/navigation'
import { createClient } from '@/lib/supabase/server'
import { routing } from '@/i18n/routing'
import { LandingNav } from '@/components/marketing/LandingNav'
import { HeroSection } from '@/components/marketing/HeroSection'
import { ToolStrip } from '@/components/marketing/ToolStrip'
import { XPBand } from '@/components/marketing/XPBand'
import { LandingFooter } from '@/components/marketing/LandingFooter'

export default async function RootPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  if (!hasLocale(routing.locales, locale)) notFound()
  setRequestLocale(locale)

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) redirect({ href: '/dashboard', locale })

  return (
    <div
      style={{
        width: '100%',
        minHeight: '100vh',
        overflowX: 'hidden',
        background: 'var(--jl-bg)',
      }}
    >
      <LandingNav />
      <HeroSection />
      <ToolStrip />
      <XPBand />
      <LandingFooter />
    </div>
  )
}
