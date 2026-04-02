import { setRequestLocale } from 'next-intl/server'
import { getTranslations } from 'next-intl/server'
import { redirect } from 'next/navigation'
import { createServerSupabase } from '@/lib/supabase/server'
import { DashboardStats } from '@/components/dashboard/dashboard-stats'
import { QuickActions } from '@/components/dashboard/quick-actions'

export default async function DashboardPage({ params }: { params: Promise<{ locale: string }> }) {
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

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  // Fetch today's pomodoro sessions
  const { count: sessionsToday } = await supabase
    .from('pomodoro_sessions')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('status', 'completed')
    .gte('completed_at', today.toISOString())
    .lt('completed_at', tomorrow.toISOString())

  // Fetch today's habit check-ins
  const { count: habitsToday } = await supabase
    .from('habit_check_ins')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .gte('checked_at', today.toISOString())
    .lt('checked_at', tomorrow.toISOString())

  // Fetch today's XP earned
  const { data: todayXp } = await supabase
    .from('xp_transactions')
    .select('amount')
    .eq('user_id', user.id)
    .gte('created_at', today.toISOString())

  const xpToday = (todayXp ?? []).reduce((sum, t) => sum + t.amount, 0)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t('dashboard.welcome')}</h1>
        <p className="text-muted-foreground mt-1">{t('dashboard.todayStats')}</p>
      </div>

      <DashboardStats
        sessionsToday={sessionsToday ?? 0}
        habitsToday={habitsToday ?? 0}
        xpToday={xpToday}
        locale={locale}
      />

      <QuickActions locale={locale} />
    </div>
  )
}
