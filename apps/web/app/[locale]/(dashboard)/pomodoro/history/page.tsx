import { setRequestLocale } from 'next-intl/server'
import { getTranslations } from 'next-intl/server'
import { redirect } from 'next/navigation'
import { createServerSupabase } from '@/lib/supabase/server'
import { SessionHistory } from '@/components/pomodoro/pomodoro-history'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default async function PomodoroHistoryPage({
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

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href={`/${locale}/pomodoro`}
          className="hover:bg-accent rounded-xl p-2 transition-colors"
          aria-label={t('back')}
        >
          <ArrowLeft className="text-muted-foreground h-5 w-5" />
        </Link>
        <h1 className="text-2xl font-bold tracking-tight">{t('pomodoro.history')}</h1>
      </div>

      <SessionHistory userId={user.id} />
    </div>
  )
}
