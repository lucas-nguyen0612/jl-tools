'use client'

import { useTranslations } from 'next-intl'
import { useBrowserNotificationPermission } from '@/hooks/useBrowserNotificationPermission'

export function BrowserPermissionCard() {
  const t = useTranslations('settings.notifications.browser')
  const { permission, isSupported, request } = useBrowserNotificationPermission()

  function statusLabel(): string {
    if (!isSupported) return 'Not supported'
    if (permission === null) return 'Checking…'
    if (permission === 'granted') return t('statusGranted')
    if (permission === 'denied') return t('statusDenied')
    return t('statusDefault')
  }

  function statusColor(): string {
    if (permission === 'granted') return 'var(--jl-success, #16a34a)'
    if (permission === 'denied') return 'var(--jl-danger, #dc2626)'
    return 'var(--jl-text-soft)'
  }

  async function handleEnable() {
    await request()
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

      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <span
          style={{
            fontSize: 13,
            fontWeight: 500,
            color: statusColor(),
          }}
          aria-label={`Browser notification permission: ${statusLabel()}`}
        >
          {statusLabel()}
        </span>

        {isSupported && permission === 'default' && (
          <button
            onClick={handleEnable}
            style={{
              height: 30,
              padding: '0 14px',
              background: 'var(--jl-accent-soft)',
              border: '1px solid var(--jl-accent)',
              borderRadius: 'var(--jl-r)',
              cursor: 'pointer',
              fontSize: 12,
              fontWeight: 500,
              color: 'var(--jl-accent-ink)',
            }}
          >
            {t('grantCta')}
          </button>
        )}
      </div>

      {isSupported && permission === 'denied' && (
        <p style={{ fontSize: 12, color: 'var(--jl-text-faint)', margin: 0 }}>
          {t('deniedGuide')}
        </p>
      )}

      {!isSupported && (
        <p style={{ fontSize: 12, color: 'var(--jl-text-faint)', margin: 0 }}>
          Not supported
        </p>
      )}
    </section>
  )
}
