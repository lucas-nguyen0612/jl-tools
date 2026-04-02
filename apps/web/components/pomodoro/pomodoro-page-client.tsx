'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { PomodoroApp } from '@/components/pomodoro/pomodoro-app'
import { PomodoroFocusMode } from '@/components/pomodoro/pomodoro-focus-mode'
import { PomodoroDailyStats } from '@/components/pomodoro/pomodoro-daily-stats'
import { Settings, History } from 'lucide-react'
import Link from 'next/link'

interface PomodoroPageClientProps {
  locale: string
  userId: string
}

export function PomodoroPageClient({ locale, userId }: PomodoroPageClientProps) {
  const t = useTranslations('pomodoro')
  const [focusMode, setFocusMode] = useState(false)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t('title')}</h1>
          <p className="text-muted-foreground mt-1">{t('subtitle')}</p>
        </div>
        <div className="flex items-center gap-1">
          <Link
            href={`/${locale}/pomodoro/history`}
            className="hover:bg-accent rounded-xl p-2 transition-colors"
            aria-label={t('history')}
          >
            <History className="text-muted-foreground h-5 w-5" />
          </Link>
          <Link
            href={`/${locale}/pomodoro/settings`}
            className="hover:bg-accent rounded-xl p-2 transition-colors"
            aria-label={t('settings')}
          >
            <Settings className="text-muted-foreground h-5 w-5" />
          </Link>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <PomodoroDailyStats userId={userId} />
      </div>

      <PomodoroApp locale={locale} />
    </div>
  )
}
