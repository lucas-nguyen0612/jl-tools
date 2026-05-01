'use client'

import { useTranslations } from 'next-intl'

interface PomodoroTimerProps {
  phase: 'work' | 'short' | 'long'
  timeLeft: number
  totalDuration: number
  size?: number
}

const PHASE_KEYS: Record<PomodoroTimerProps['phase'], 'focus' | 'shortBreak' | 'longBreak'> = {
  work: 'focus',
  short: 'shortBreak',
  long: 'longBreak',
}

const STROKE = 14

function formatTime(seconds: number): string {
  const mm = String(Math.floor(seconds / 60)).padStart(2, '0')
  const ss = String(seconds % 60).padStart(2, '0')
  return `${mm}:${ss}`
}

export function PomodoroTimer({ phase, timeLeft, totalDuration, size = 240 }: PomodoroTimerProps) {
  const t = useTranslations('pomodoro')
  // r = size/2 - stroke/2 - 7 of breathing room. At size=280 this resolves to 126,
  // matching the original visual radius so default-size callers are unchanged.
  const r = size / 2 - STROKE / 2 - 7
  const c = 2 * Math.PI * r
  const center = size / 2
  const scale = size / 280

  const progress = Math.min(1, Math.max(0, 1 - timeLeft / totalDuration))
  const dashOffset = c * (1 - progress)

  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <defs>
          <linearGradient id="pgrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="var(--jl-accent)" />
            <stop offset="100%" stopColor="var(--jl-accent-strong)" />
          </linearGradient>
        </defs>

        <circle
          cx={center}
          cy={center}
          r={r}
          fill="none"
          stroke="var(--jl-bg-sunken)"
          strokeWidth={STROKE}
        />

        <circle
          cx={center}
          cy={center}
          r={r}
          fill="none"
          stroke="url(#pgrad)"
          strokeWidth={STROKE}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={dashOffset}
          transform={`rotate(-90 ${center} ${center})`}
          style={{ transition: 'stroke-dashoffset 1s linear' }}
        />
      </svg>

      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div
          style={{
            fontSize: 10 * scale,
            letterSpacing: '0.16em',
            textTransform: 'uppercase',
            color: 'var(--jl-text-faint)',
          }}
        >
          {t(`mode.${PHASE_KEYS[phase]}`)}
        </div>

        <div
          style={{
            fontFamily: 'var(--jl-font-mono)',
            fontSize: 72 * scale,
            lineHeight: 1,
            letterSpacing: '-0.04em',
            marginTop: 8 * scale,
          }}
        >
          {formatTime(timeLeft)}
        </div>

        <div
          style={{
            fontSize: 12 * scale,
            color: 'var(--jl-text-soft)',
            marginTop: 4 * scale,
          }}
        >
          {t('timer.elapsed', { time: formatTime(totalDuration - timeLeft) })}
        </div>
      </div>
    </div>
  )
}
