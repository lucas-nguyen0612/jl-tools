'use client'

import { useTranslations } from 'next-intl'
import type { TimerPhase, TimerStatus } from '@/hooks/usePomodoroTimer'

interface PomodoroTimerProps {
  secondsRemaining: number
  totalSeconds: number
  phase: TimerPhase
  status: TimerStatus
  onPhaseChange: (phase: TimerPhase) => void
}

export function PomodoroTimer({
  secondsRemaining,
  totalSeconds,
  phase,
  status,
  onPhaseChange,
}: PomodoroTimerProps) {
  const t = useTranslations('pomodoro')

  const minutes = Math.floor(secondsRemaining / 60)
  const seconds = secondsRemaining % 60
  const progress = totalSeconds > 0 ? ((totalSeconds - secondsRemaining) / totalSeconds) * 100 : 0

  const phaseLabels: Record<TimerPhase, string> = {
    focus: t('focus'),
    shortBreak: t('shortBreak'),
    longBreak: t('longBreak'),
  }

  const phaseColors: Record<TimerPhase, string> = {
    focus: 'stroke-indigo-500',
    shortBreak: 'stroke-emerald-500',
    longBreak: 'stroke-blue-500',
  }

  const color = phaseColors[phase]
  const size = 280
  const strokeWidth = 10
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const dashOffset = circumference * (1 - progress / 100)

  return (
    <div className="flex flex-col items-center gap-8">
      {/* Phase selector tabs */}
      <div className="bg-muted flex gap-2 rounded-xl p-1">
        {(['focus', 'shortBreak', 'longBreak'] as TimerPhase[]).map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => onPhaseChange(p)}
            className={`h-10 rounded-lg px-4 text-sm font-medium transition-all ${
              phase === p
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {phaseLabels[p]}
          </button>
        ))}
      </div>

      {/* Circular timer */}
      <div className="relative">
        <svg width={size} height={size} className="-rotate-90 transform">
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            className="text-border"
          />
          {/* Progress circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            className={`${color} transition-all duration-1000 ease-linear`}
            style={{
              strokeDasharray: circumference,
              strokeDashoffset: dashOffset,
            }}
          />
        </svg>

        {/* Time display */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-tabular text-foreground text-6xl font-bold tracking-tight">
            {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
          </span>
          <span className="text-muted-foreground mt-2 text-sm font-medium">
            {phaseLabels[phase]}
          </span>
        </div>
      </div>
    </div>
  )
}
