import { setRequestLocale } from 'next-intl/server'
import { getTranslations } from 'next-intl/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Timer, CheckCircle, Zap, Flame } from 'lucide-react'

export default async function DashboardPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations()

  const stats = [
    {
      icon: Timer,
      label: t('dashboard.sessionsCompleted'),
      value: '0',
      color: 'text-indigo-500',
      bg: 'bg-indigo-50 dark:bg-indigo-950/50',
    },
    {
      icon: CheckCircle,
      label: t('dashboard.habitsCompleted'),
      value: '0',
      color: 'text-emerald-500',
      bg: 'bg-emerald-50 dark:bg-emerald-950/50',
    },
    {
      icon: Zap,
      label: t('dashboard.xpEarned'),
      value: '0',
      color: 'text-amber-500',
      bg: 'bg-amber-50 dark:bg-amber-950/50',
    },
    {
      icon: Flame,
      label: t('dashboard.currentStreak'),
      value: '0',
      color: 'text-orange-500',
      bg: 'bg-orange-50 dark:bg-orange-950/50',
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t('dashboard.welcome')}</h1>
        <p className="text-muted-foreground mt-1">{t('dashboard.todayStats')}</p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className={`rounded-xl p-2 ${stat.bg}`}>
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                </div>
                <div className="min-w-0">
                  <p className="font-tabular text-2xl font-bold">{stat.value}</p>
                  <p className="text-muted-foreground truncate text-xs">{stat.label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Quick Start</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-3">
              <a
                href="/pomodoro"
                className="bg-primary text-primary-foreground hover:bg-primary/90 flex h-12 flex-1 items-center justify-center gap-2 rounded-xl text-sm font-medium transition-colors"
              >
                <Timer className="h-4 w-4" />
                Start Pomodoro
              </a>
              <a
                href="/habits"
                className="border-border bg-background hover:bg-accent flex h-12 flex-1 items-center justify-center gap-2 rounded-xl border text-sm font-medium transition-colors"
              >
                <CheckCircle className="h-4 w-4" />
                Check Habits
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
