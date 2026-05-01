'use client'

import { useEffect, useRef, useState, useTransition } from 'react'
import { useTranslations } from 'next-intl'
import { Switch } from '@/components/ui/switch'
import { updateNotifications } from '@/features/settings/preferences'
import type { NotificationsInput } from '@/features/settings/notification-schemas'

interface Props {
  initialEnabled: boolean
}

export function HabitReminderCard({ initialEnabled }: Props) {
  const t = useTranslations('settings.notifications.habits')
  const [enabled, setEnabled] = useState(initialEnabled)
  const [error, setError] = useState<string | null>(null)
  const [, startTransition] = useTransition()
  const isMountedRef = useRef(true)
  const lastSavedRef = useRef<boolean>(initialEnabled)

  useEffect(() => {
    return () => {
      isMountedRef.current = false
    }
  }, [])

  function onToggle(checked: boolean) {
    const previous = lastSavedRef.current
    setEnabled(checked)

    const payload: NotificationsInput = {
      pomodoro_sound: true,
      pomodoro_volume: 80,
      habit_reminders_enabled: checked,
    }

    startTransition(async () => {
      const result = await updateNotifications(payload)
      if (!isMountedRef.current) return
      if (result.error) {
        setError(result.error.message)
        setEnabled(previous)
      } else {
        lastSavedRef.current = checked
        setError(null)
      }
    })
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
          checked={enabled}
          onCheckedChange={onToggle}
          aria-label={t('masterToggleLabel')}
        />
        <span style={{ fontSize: 13, color: 'var(--jl-text-soft)' }}>
          {enabled ? 'On' : 'Off'}
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
