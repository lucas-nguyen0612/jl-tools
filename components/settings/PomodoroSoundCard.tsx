'use client'

import { useEffect, useRef, useState, useTransition } from 'react'
import { useTranslations } from 'next-intl'
import { Switch } from '@/components/ui/switch'
import { updateNotifications } from '@/features/settings/preferences'
import type { NotificationsInput } from '@/features/settings/notification-schemas'

const DEBOUNCE_MS = 300

interface Props {
  initialSound: boolean
  initialVolume: number
}

export function PomodoroSoundCard({ initialSound, initialVolume }: Props) {
  const t = useTranslations('settings.notifications.pomodoro')
  const [soundEnabled, setSoundEnabled] = useState(initialSound)
  const [volume, setVolume] = useState(initialVolume)
  const [error, setError] = useState<string | null>(null)
  const [, startTransition] = useTransition()

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const isMountedRef = useRef(true)

  const lastSavedRef = useRef<NotificationsInput>({
    pomodoro_sound: initialSound,
    pomodoro_volume: initialVolume,
    habit_reminders_enabled: true,
  })

  useEffect(() => {
    return () => {
      isMountedRef.current = false
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [])

  function scheduleSave(next: { sound?: boolean; vol?: number }) {
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      const payload: NotificationsInput = {
        pomodoro_sound: next.sound ?? soundEnabled,
        pomodoro_volume: next.vol ?? volume,
        habit_reminders_enabled: lastSavedRef.current.habit_reminders_enabled,
      }
      const previous = { ...lastSavedRef.current }
      startTransition(async () => {
        const result = await updateNotifications(payload)
        if (!isMountedRef.current) return
        if (result.error) {
          setError(result.error.message)
          setSoundEnabled(previous.pomodoro_sound)
          setVolume(previous.pomodoro_volume)
        } else {
          lastSavedRef.current = payload
          setError(null)
        }
      })
    }, DEBOUNCE_MS)
  }

  function onSoundToggle(checked: boolean) {
    setSoundEnabled(checked)
    scheduleSave({ sound: checked })
  }

  function onVolumeChange(next: number) {
    setVolume(next)
    scheduleSave({ vol: next })
  }

  return (
    <section style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <header>
        <h2
          style={{
            fontFamily: 'var(--jl-font-display)',
            fontSize: 16,
            fontWeight: 600,
            color: 'var(--jl-text)',
            margin: 0,
          }}
        >
          {t('title')}
        </h2>
        <p style={{ fontSize: 13, color: 'var(--jl-text-soft)', margin: '4px 0 0' }}>
          {t('description')}
        </p>
      </header>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <Switch
          checked={soundEnabled}
          onCheckedChange={onSoundToggle}
          aria-label={t('toggleLabel')}
        />
        <span style={{ fontSize: 13, color: 'var(--jl-text-soft)' }}>
          {soundEnabled ? 'On' : 'Off'}
        </span>
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 14,
          opacity: soundEnabled ? 1 : 0.4,
          pointerEvents: soundEnabled ? 'auto' : 'none',
        }}
      >
        <span style={{ fontSize: 12, color: 'var(--jl-text-faint)', minWidth: 44 }}>{t('volumeLabel')}</span>
        <input
          type="range"
          min={0}
          max={100}
          step={1}
          value={volume}
          disabled={!soundEnabled}
          aria-label={t('volumeLabel')}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={volume}
          onChange={(e) => onVolumeChange(Number.parseInt(e.target.value, 10))}
          style={{ flex: 1, accentColor: 'var(--jl-accent-strong)' }}
        />
        <span
          className="jl-tnum"
          style={{ minWidth: 36, textAlign: 'right', fontSize: 13, color: 'var(--jl-text-soft)' }}
        >
          {volume}%
        </span>
      </div>

      {error && (
        <p role="alert" style={{ fontSize: 12, color: 'var(--jl-danger)' }}>
          {error}
        </p>
      )}
    </section>
  )
}
