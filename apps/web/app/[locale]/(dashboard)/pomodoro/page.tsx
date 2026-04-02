import { setRequestLocale } from 'next-intl/server'
import { getTranslations } from 'next-intl/server'
import { redirect } from 'next/navigation'
import { createServerSupabase } from '@/lib/supabase/server'
import { PomodoroPageClient } from '@/components/pomodoro/pomodoro-page-client'

export default async function PomodoroPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations()

  const supabase = await createServerSupabase()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect(`/${locale}/login`)
  }

  return <PomodoroPageClient locale={locale} userId={user.id} />
}
