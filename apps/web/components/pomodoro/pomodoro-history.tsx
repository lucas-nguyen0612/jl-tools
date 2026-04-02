'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent } from '@/components/ui/card'
import { CheckCircle, XCircle, Clock } from 'lucide-react'

interface PomodoroSession {
  id: string
  label: string | null
  duration_minutes: number
  status: string
  started_at: string
  completed_at: string | null
  xp_earned: number
}

interface SessionHistoryProps {
  userId: string
}

export function SessionHistory({ userId }: SessionHistoryProps) {
  const t = useTranslations('pomodoro')
  const [sessions, setSessions] = useState<PomodoroSession[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()
    supabase
      .from('pomodoro_sessions')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'completed')
      .order('completed_at', { ascending: false })
      .limit(50)
      .then(({ data, error }) => {
        if (!error && data) setSessions(data as PomodoroSession[])
        setLoading(false)
      })
  }, [userId])

  function formatDate(dateStr: string) {
    const date = new Date(dateStr)
    return date.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  function formatTime(dateStr: string) {
    const date = new Date(dateStr)
    return date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
  }

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-muted h-16 animate-pulse rounded-xl" />
        ))}
      </div>
    )
  }

  if (sessions.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <Clock className="text-muted-foreground mb-3 h-10 w-10" />
          <p className="text-muted-foreground font-medium">
            {t('noSessions') ?? 'No sessions yet'}
          </p>
          <p className="text-muted-foreground mt-1 text-sm">
            {t('completeFirst') ?? 'Complete your first pomodoro session!'}
          </p>
        </CardContent>
      </Card>
    )
  }

  // Group by date
  const groups: Record<string, PomodoroSession[]> = {}
  for (const s of sessions) {
    const date = formatDate(s.completed_at ?? s.started_at)
    if (!groups[date]) groups[date] = []
    groups[date].push(s)
  }

  return (
    <div className="space-y-6">
      {Object.entries(groups).map(([date, group]) => (
        <div key={date}>
          <p className="text-muted-foreground mb-2 text-sm font-medium">{date}</p>
          <div className="space-y-2">
            {group.map((session) => (
              <Card key={session.id} className="hover:bg-accent/50 transition-colors">
                <CardContent className="flex items-center justify-between px-4 py-3">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-4 w-4 flex-shrink-0 text-emerald-500" />
                    <div>
                      <p className="text-sm font-medium">
                        {session.label ?? t('focus') ?? 'Focus'}
                      </p>
                      <p className="text-muted-foreground text-xs">
                        {formatTime(session.started_at)}
                        {session.completed_at && ` – ${formatTime(session.completed_at)}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <span className="text-muted-foreground tabular-nums">
                      {session.duration_minutes} min
                    </span>
                    {session.xp_earned > 0 && (
                      <span className="font-semibold text-amber-500">+{session.xp_earned} XP</span>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
