import { setRequestLocale } from 'next-intl/server'
import { getTranslations } from 'next-intl/server'
import { redirect } from 'next/navigation'
import { createServerSupabase } from '@/lib/supabase/server'
import { HabitsClient } from '@/components/habits/habits-client'

export default async function HabitsPage({ params }: { params: Promise<{ locale: string }> }) {
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

  return <HabitsClient userId={user.id} locale={locale} />
}
