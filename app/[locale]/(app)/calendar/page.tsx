import { getTranslations } from 'next-intl/server'
import { TopBar } from '@/components/layout/TopBar'
import { getCalendarConnectionStatus } from '@/features/calendar/auth-actions'
import { ConnectCalendarBanner } from '@/components/calendar/ConnectCalendarBanner'
import { DisconnectButton } from '@/components/calendar/DisconnectButton'
import { CalendarView } from '@/components/calendar/CalendarView'

export default async function CalendarPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const t = await getTranslations('calendar')
  const params = await searchParams
  const status = await getCalendarConnectionStatus()

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
      <TopBar
        title={t('title')}
        subtitle={t('subtitle')}
        rightSlot={
          status.connected ? <DisconnectButton email={status.email} /> : null
        }
      />

      {params.error && (
        <div
          role="alert"
          style={{
            margin: '12px 24px 0',
            padding: '10px 14px',
            borderRadius: 'var(--jl-r-sm)',
            background: 'color-mix(in oklch, var(--jl-danger) 14%, transparent)',
            border: '1px solid color-mix(in oklch, var(--jl-danger) 35%, transparent)',
            fontSize: 13,
            color: 'var(--jl-danger)',
          }}
        >
          {params.error === 'google_denied'
            ? t('error.googleDenied')
            : t('error.callbackFailed')}
        </div>
      )}

      {!status.connected ? <ConnectCalendarBanner /> : <CalendarView />}
    </div>
  )
}
