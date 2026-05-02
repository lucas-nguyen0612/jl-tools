'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { CalendarDays } from 'lucide-react'
import { connectGoogleCalendar } from '@/features/calendar/auth-actions'

export function ConnectCalendarBanner() {
  const t = useTranslations('calendar')
  const [pending, setPending] = useState(false)

  async function handleConnect() {
    setPending(true)
    try {
      await connectGoogleCalendar()
    } catch {
      setPending(false)
    }
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
        gap: 24,
        padding: 32,
        textAlign: 'center',
      }}
    >
      <div
        style={{
          width: 72,
          height: 72,
          borderRadius: 'var(--jl-r-lg)',
          background: 'var(--jl-accent-soft)',
          border: '1px solid color-mix(in oklch, var(--jl-accent) 35%, transparent)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <CalendarDays size={32} style={{ color: 'var(--jl-accent-ink)' }} />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxWidth: 420 }}>
        <h2
          style={{
            fontFamily: 'var(--jl-font-display)',
            fontSize: 26,
            fontWeight: 500,
            letterSpacing: '-0.02em',
            margin: 0,
            color: 'var(--jl-text)',
          }}
        >
          {t('connect.title')}
        </h2>
        <p style={{ fontSize: 14, color: 'var(--jl-text-soft)', margin: 0, lineHeight: 1.6 }}>
          {t('connect.description')}
        </p>
      </div>

      <button
        onClick={handleConnect}
        disabled={pending}
        className="jl-btn-accent"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
          height: 40,
          padding: '0 20px',
          borderRadius: 'var(--jl-r)',
          border: 'none',
          fontSize: 14,
          fontWeight: 600,
          cursor: pending ? 'not-allowed' : 'pointer',
          opacity: pending ? 0.7 : 1,
          transition: 'opacity 0.15s, filter 0.15s',
        }}
      >
        <CalendarDays size={16} />
        {pending ? t('connect.connecting') : t('connect.cta')}
      </button>
    </div>
  )
}
