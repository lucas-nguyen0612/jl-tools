import { setRequestLocale } from 'next-intl/server'
import { getTranslations } from 'next-intl/server'
import { redirect } from 'next/navigation'
import { createServerSupabase } from '@/lib/supabase/server'
import { PomodoroSettingsForm } from '@/components/pomodoro/pomodoro-settings-form'
import { DEFAULT_POMODORO_SETTINGS } from '@/types/pomodoro'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default async function PomodoroSettingsPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
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

  const { data: profile } = await supabase
    .from('profiles')
    .select('pomodoro_settings')
    .eq('id', user.id)
    .single()

  const settings = {
    ...DEFAULT_POMODORO_SETTINGS,
    ...(profile?.pomodoro_settings ?? {}),
  }

  return (
    <div className="max-w-md space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href={`/${locale}/pomodoro`}
          className="hover:bg-accent rounded-xl p-2 transition-colors"
          aria-label={t('back')}
        >
          <ArrowLeft className="text-muted-foreground h-5 w-5" />
        </Link>
        <h1 className="text-2xl font-bold tracking-tight">{t('pomodoro.settings')}</h1>
      </div>

      <PomodoroSettingsForm initialSettings={settings} />
    </div>
  )
}
