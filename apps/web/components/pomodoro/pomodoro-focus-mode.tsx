'use client'

import { useTranslations } from 'next-intl'
import { PomodoroTimer } from '@/components/pomodoro/pomodoro-timer'
import { PomodoroControls } from '@/components/pomodoro/pomodoro-controls'
import { Maximize2, Minimize2 } from 'lucide-react'
import type { TimerPhase, TimerStatus } from '@/hooks/usePomodoroTimer'
import { XP_SOURCES } from '@/lib/constants/levels'
import { Button } from '@/components/ui/button'

const XP_PER_SESSION = XP_SOURCES.POMODORO_COMPLETE

interface PomodoroFocusModeProps {
  secondsRemaining: number
  totalSeconds: number
  phase: TimerPhase
  status: TimerStatus
  sessionsCompleted: number
  onStart: () => void
  onPause: () => void
  onResume: () => void
  onSkip: () => void
  onCancel: () => void
  onPhaseChange: (phase: TimerPhase) => void
  onExitFocusMode: () => void
  xpPreview: number
}

export function PomodoroFocusMode({
  secondsRemaining,
  totalSeconds,
  phase,
  status,
  sessionsCompleted,
  onStart,
  onPause,
  onResume,
  onSkip,
  onCancel,
  onPhaseChange,
  onExitFocusMode,
  xpPreview,
}: PomodoroFocusModeProps) {
  const t = useTranslations('pomodoro')

  const phaseColors: Record<TimerPhase, string> = {
    focus: 'bg-indigo-500',
    shortBreak: 'bg-emerald-500',
    longBreak: 'bg-blue-500',
  }

  const bgColor = phaseColors[phase]

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center transition-colors duration-700 ${bgColor}`}
    >
      {/* Exit button */}
      <div className="absolute top-6 right-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={onExitFocusMode}
          className="h-10 w-10 rounded-full bg-white/10 p-0 text-white backdrop-blur-sm hover:bg-white/20"
          aria-label={t('exitFocusMode')}
        >
          <Minimize2 className="h-5 w-5" />
        </Button>
      </div>

      {/* Phase indicator */}
      <div className="absolute top-6 left-6">
        <p className="text-sm font-medium text-white/70">{t('focusMode')}</p>
        <p className="text-2xl font-bold text-white">
          {t('session')} {sessionsCompleted + 1}
        </p>
      </div>

      {/* XP preview */}
      {status === 'idle' && phase === 'focus' && (
        <div className="absolute bottom-8 flex items-center gap-2 rounded-full bg-white/10 px-5 py-2 text-sm font-medium text-white backdrop-blur-sm">
          <span className="text-amber-300">⚡</span>
          <span>+{xpPreview} XP</span>
        </div>
      )}

      {/* Timer */}
      <PomodoroTimer
        secondsRemaining={secondsRemaining}
        totalSeconds={totalSeconds}
        phase={phase}
        status={status}
        onPhaseChange={onPhaseChange}
      />

      {/* Controls */}
      <div className="mt-10">
        <PomodoroControls
          status={status}
          sessionsCompleted={sessionsCompleted}
          totalSessionsToday={0}
          xpPreview={xpPreview}
          onStart={onStart}
          onPause={onPause}
          onResume={onResume}
          onSkip={onSkip}
          onCancel={onCancel}
        />
      </div>
    </div>
  )
}
