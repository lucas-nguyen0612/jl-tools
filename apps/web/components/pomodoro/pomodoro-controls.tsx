'use client'

import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import type { TimerStatus } from '@/hooks/usePomodoroTimer'

interface PomodoroControlsProps {
  status: TimerStatus
  sessionsCompleted: number
  totalSessionsToday: number
  xpPreview: number
  onStart: () => void
  onPause: () => void
  onResume: () => void
  onSkip: () => void
  onCancel: () => void
}

export function PomodoroControls({
  status,
  sessionsCompleted,
  totalSessionsToday,
  xpPreview,
  onStart,
  onPause,
  onResume,
  onSkip,
  onCancel,
}: PomodoroControlsProps) {
  const t = useTranslations('pomodoro')

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex items-center gap-3">
        {status === 'idle' && (
          <Button size="lg" className="h-12 px-8" onClick={onStart}>
            {t('start')}
          </Button>
        )}
        {status === 'running' && (
          <>
            <Button variant="secondary" size="lg" className="h-12 px-6" onClick={onPause}>
              {t('pause')}
            </Button>
            <Button variant="outline" size="lg" className="h-12 px-6" onClick={onCancel}>
              {t('cancel')}
            </Button>
          </>
        )}
        {status === 'paused' && (
          <>
            <Button size="lg" className="h-12 px-8" onClick={onResume}>
              {t('resume')}
            </Button>
            <Button variant="outline" size="lg" className="h-12 px-6" onClick={onCancel}>
              {t('cancel')}
            </Button>
          </>
        )}
        {status === 'completed' && (
          <Button size="lg" className="h-12 px-8" onClick={onStart}>
            {t('start')}
          </Button>
        )}
      </div>

      {/* Skip */}
      <Button variant="ghost" size="sm" onClick={onSkip} className="text-muted-foreground">
        {t('skip')}
      </Button>

      {/* Session info */}
      <div className="text-muted-foreground flex items-center gap-4 text-sm">
        <div className="flex items-center gap-1.5">
          <span className="font-medium">{totalSessionsToday}</span>
          <span>{t('session')} today</span>
        </div>
        {status === 'idle' && (
          <div className="flex items-center gap-1">
            <span className="font-medium text-amber-500">+{xpPreview} XP</span>
            <span className="text-muted-foreground">{t('xpPreview', { xp: xpPreview })}</span>
          </div>
        )}
      </div>
    </div>
  )
}
