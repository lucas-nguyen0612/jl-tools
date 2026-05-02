'use client'

import { useEffect, useRef, useState, useTransition } from 'react'
import { useTranslations } from 'next-intl'
import { onAppEvent, type PomodoroCompleteCalendarPayload } from '@/lib/events'
import {
  createPomodoroCalendarEvent,
  type PomodoroSyncInput,
} from '@/features/calendar/pomodoro-sync'
import { useConnectionStatus } from '@/features/calendar/queries'

export function PomodoroCalendarToast() {
  const t = useTranslations('calendar')
  const [pendingSession, setPendingSession] = useState<PomodoroSyncInput | null>(null)
  const [isPending, startTransition] = useTransition()

  const { data: status } = useConnectionStatus()
  const isConnected = status?.connected ?? false
  const isConnectedRef = useRef(isConnected)
  useEffect(() => { isConnectedRef.current = isConnected }, [isConnected])

  useEffect(() => {
    return onAppEvent('jl:pomodoro-complete-calendar', (payload: PomodoroCompleteCalendarPayload) => {
      if (!isConnectedRef.current) return
      setPendingSession({
        startedAt: payload.startedAt,
        completedAt: payload.completedAt,
        durationMinutes: payload.durationMinutes,
        taskName: payload.taskName,
      })
    })
  }, [])

  if (!pendingSession) return null

  function handleAdd() {
    if (!pendingSession) return
    const session = pendingSession
    startTransition(async () => {
      await createPomodoroCalendarEvent(session)
      setPendingSession(null)
    })
  }

  function handleDismiss() {
    setPendingSession(null)
  }

  return (
    <div
      role="alertdialog"
      aria-live="polite"
      style={{
        position: 'fixed',
        bottom: 24,
        right: 24,
        zIndex: 9999,
        background: 'var(--jl-bg-raised)',
        border: '1px solid var(--jl-line)',
        borderRadius: 'var(--jl-r-lg)',
        padding: '14px 18px',
        boxShadow: '0 8px 24px rgba(0,0,0,0.18)',
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        minWidth: 260,
        maxWidth: 340,
      }}
    >
      <p style={{ margin: 0, fontSize: 14, color: 'var(--jl-text)', fontWeight: 500 }}>
        {t('pomodoro.createPrompt')}
      </p>

      <div style={{ display: 'flex', gap: 8 }}>
        <button
          onClick={handleAdd}
          disabled={isPending}
          style={{
            flex: 1,
            height: 32,
            padding: '0 12px',
            background: 'var(--jl-accent)',
            color: 'var(--jl-accent-ink)',
            border: 'none',
            borderRadius: 'var(--jl-r)',
            cursor: isPending ? 'not-allowed' : 'pointer',
            fontSize: 13,
            fontWeight: 600,
            opacity: isPending ? 0.7 : 1,
          }}
        >
          {t('pomodoro.createCta')}
        </button>

        <button
          onClick={handleDismiss}
          disabled={isPending}
          style={{
            height: 32,
            padding: '0 12px',
            background: 'var(--jl-bg-sunken)',
            color: 'var(--jl-text-soft)',
            border: '1px solid var(--jl-line)',
            borderRadius: 'var(--jl-r)',
            cursor: isPending ? 'not-allowed' : 'pointer',
            fontSize: 13,
            fontWeight: 500,
          }}
        >
          {t('pomodoro.dismiss')}
        </button>
      </div>
    </div>
  )
}
