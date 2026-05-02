'use client'

import { useTranslations } from 'next-intl'

interface ModeSelectorProps {
  phase: 'work' | 'short' | 'long'
  onSelect: (phase: 'work' | 'short' | 'long') => void
  disabled?: boolean
  durations: { work: number; short: number; long: number }
}

export function ModeSelector({ phase, onSelect, disabled, durations }: ModeSelectorProps) {
  const t = useTranslations('pomodoro.mode')
  const modes: { id: 'work' | 'short' | 'long'; label: string }[] = [
    { id: 'work', label: t('focusShort', { minutes: Math.round(durations.work / 60) }) },
    { id: 'short', label: t('shortShort', { minutes: Math.round(durations.short / 60) }) },
    { id: 'long', label: t('longShort', { minutes: Math.round(durations.long / 60) }) },
  ]
  return (
    <div
      style={{
        display: 'inline-flex',
        alignSelf: 'flex-start',
        gap: 6,
        padding: 4,
        background: 'var(--jl-bg-sunken)',
        border: '1px solid var(--jl-line-soft)',
        borderRadius: 999,
      }}
    >
      {modes.map((m) => {
        const isActive = phase === m.id
        return (
          <button
            key={m.id}
            onClick={() => !disabled && onSelect(m.id)}
            disabled={disabled}
            style={{
              height: 30,
              border: 'none',
              cursor: disabled ? 'not-allowed' : 'pointer',
              padding: '0 12px',
              borderRadius: 999,
              fontSize: 12,
              whiteSpace: 'nowrap',
              background: isActive ? 'var(--jl-bg-raised)' : 'transparent',
              boxShadow: isActive ? 'var(--jl-shadow-sm)' : 'none',
              color: isActive ? 'var(--jl-text)' : 'var(--jl-text-soft)',
              fontWeight: isActive ? 600 : 500,
              transition: 'background 0.15s, color 0.15s, box-shadow 0.15s',
              opacity: disabled ? 0.6 : 1,
            }}
          >
            {m.label}
          </button>
        )
      })}
    </div>
  )
}
