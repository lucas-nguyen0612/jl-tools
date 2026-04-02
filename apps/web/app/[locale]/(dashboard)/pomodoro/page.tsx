import { setRequestLocale } from 'next-intl/server'
import { getTranslations } from 'next-intl/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Timer, Settings } from 'lucide-react'
import Link from 'next/link'

export default async function PomodoroPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t('pomodoro.title')}</h1>
          <p className="text-muted-foreground mt-1">{t('pomodoro.xpPreview', { xp: 50 })}</p>
        </div>
        <Link
          href="/pomodoro/settings"
          className="hover:bg-accent rounded-xl p-2 transition-colors"
          aria-label={t('pomodoro.settings')}
        >
          <Settings className="text-muted-foreground h-5 w-5" />
        </Link>
      </div>

      {/* Timer placeholder */}
      <Card className="overflow-hidden border-0 shadow-lg">
        <CardContent className="flex flex-col items-center justify-center gap-8 py-16">
          <div className="relative">
            <div className="border-border flex h-56 w-56 items-center justify-center rounded-full border-[8px]">
              <span className="font-tabular text-6xl font-bold tracking-tight">25:00</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button className="bg-primary text-primary-foreground hover:bg-primary/90 h-12 rounded-xl px-8 text-sm font-semibold shadow-sm transition-all active:scale-95">
              {t('pomodoro.start')}
            </button>
            <button className="border-border bg-background hover:bg-accent h-12 rounded-xl border px-6 text-sm font-medium transition-all active:scale-95">
              {t('pomodoro.skip')}
            </button>
          </div>

          <div className="text-muted-foreground flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1.5">
              <Timer className="h-4 w-4" />
              <span>{t('pomodoro.session')} 1/4</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Session type tabs */}
      <div className="bg-muted flex gap-2 rounded-xl p-1">
        {['focus', 'shortBreak', 'longBreak'].map((type) => (
          <button
            key={type}
            className={`h-10 flex-1 rounded-lg text-sm font-medium transition-all ${
              type === 'focus'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {type === 'focus'
              ? t('pomodoro.focus')
              : type === 'shortBreak'
                ? t('pomodoro.shortBreak')
                : t('pomodoro.longBreak')}
          </button>
        ))}
      </div>
    </div>
  )
}
