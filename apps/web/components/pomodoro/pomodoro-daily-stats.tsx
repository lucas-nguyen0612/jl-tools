'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Timer, Zap } from 'lucide-react'

interface DailyStats {
  sessionsToday: number
  totalFocusMinutes: number
}

interface PomodoroDailyStatsProps {
  userId: string
}

export function PomodoroDailyStats({ userId }: PomodoroDailyStatsProps) {
  const t = useTranslations('pomodoro')
  const [stats, setStats] = useState<DailyStats>({ sessionsToday: 0, totalFocusMinutes: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()
    const todayStart = new Date()
    todayStart.setHours(0, 0, 0, 0)

    supabase
      .from('pomodoro_sessions')
      .select('duration_minutes')
      .eq('user_id', userId)
      .eq('status', 'completed')
      .gte('completed_at', todayStart.toISOString())
      .then(({ data, error }) => {
        if (!error && data) {
          const sessions = data.length
          const minutes = data.reduce((sum, s) => sum + (s.duration_minutes ?? 0), 0)
          setStats({ sessionsToday: sessions, totalFocusMinutes: minutes })
        }
        setLoading(false)
      })
  }, [userId])

  if (loading) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-muted-foreground text-sm font-medium">
            {t('sessionsToday') ?? 'Sessions today'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-muted h-8 w-20 animate-pulse rounded" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-muted-foreground text-sm font-medium">
          {t('sessionsToday') ?? 'Today'}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100 dark:bg-indigo-950">
            <Timer className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <p className="text-2xl font-bold tabular-nums">{stats.sessionsToday}</p>
            <p className="text-muted-foreground text-xs">{t('sessions') ?? 'sessions'}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 dark:bg-amber-950">
            <Zap className="h-5 w-5 text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <p className="text-2xl font-bold tabular-nums">{stats.totalFocusMinutes}</p>
            <p className="text-muted-foreground text-xs">{t('focusMinutes') ?? 'focus minutes'}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
