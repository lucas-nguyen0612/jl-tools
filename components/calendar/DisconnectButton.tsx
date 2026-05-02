'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { useRouter } from '@/i18n/navigation'
import { CheckCircle2 } from 'lucide-react'
import { disconnectGoogleCalendar } from '@/features/calendar/auth-actions'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'

export type DisconnectButtonProps = {
  email?: string
}

export function DisconnectButton({ email }: DisconnectButtonProps) {
  const t = useTranslations('calendar')
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [pending, setPending] = useState(false)

  async function handleDisconnect() {
    setPending(true)
    try {
      await disconnectGoogleCalendar()
      router.refresh()
      setOpen(false)
    } finally {
      setPending(false)
    }
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      {email ? (
        <Popover>
          <PopoverTrigger asChild>
            <button
              type="button"
              title={t('connectedAs', { email })}
              style={connectedChipStyle}
            >
              <CheckCircle2 size={12} style={{ color: 'var(--jl-success)' }} />
              <span
                style={{
                  maxWidth: 160,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {email}
              </span>
            </button>
          </PopoverTrigger>
          <PopoverContent align="end" sideOffset={6} style={{ width: 'auto', maxWidth: 320 }}>
            <p style={{ margin: 0, fontSize: 13, color: 'var(--jl-text)' }}>
              {t('connectedAs', { email })}
            </p>
          </PopoverContent>
        </Popover>
      ) : (
        <span style={connectedChipStyle}>
          <CheckCircle2 size={12} style={{ color: 'var(--jl-success)' }} />
          {t('connected')}
        </span>
      )}

      <button onClick={() => setOpen(true)} style={triggerStyle}>
        {t('disconnect.cta')}
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>{t('disconnect.cta')}</DialogTitle>
            <DialogDescription>{t('disconnect.confirm')}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <button onClick={() => setOpen(false)} disabled={pending} style={cancelStyle}>
              {t('event.cancel')}
            </button>
            <button onClick={handleDisconnect} disabled={pending} style={confirmStyle(pending)}>
              {pending ? t('disconnect.disconnecting') : t('disconnect.cta')}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

const triggerStyle: React.CSSProperties = {
  padding: '6px 14px',
  borderRadius: 'var(--jl-r-sm)',
  border: '1px solid var(--jl-line)',
  background: 'transparent',
  color: 'var(--jl-text-soft)',
  fontSize: 13,
  fontWeight: 500,
  cursor: 'pointer',
  transition: 'opacity 0.15s, background 0.15s',
}

const connectedChipStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 6,
  height: 28,
  padding: '0 10px',
  borderRadius: 999,
  background: 'var(--jl-bg-sunken)',
  border: '1px solid var(--jl-line-soft)',
  color: 'var(--jl-text-soft)',
  fontSize: 12,
  fontWeight: 500,
  cursor: 'pointer',
  fontFamily: 'inherit',
}

const cancelStyle: React.CSSProperties = {
  padding: '8px 14px',
  borderRadius: 'var(--jl-r-sm)',
  border: '1px solid var(--jl-line)',
  background: 'transparent',
  color: 'inherit',
  fontSize: 13,
  fontWeight: 500,
  cursor: 'pointer',
}

function confirmStyle(pending: boolean): React.CSSProperties {
  return {
    padding: '8px 14px',
    borderRadius: 'var(--jl-r-sm)',
    border: '1px solid color-mix(in oklch, var(--jl-danger) 50%, transparent)',
    background: 'transparent',
    color: 'var(--jl-danger)',
    fontSize: 13,
    fontWeight: 500,
    cursor: pending ? 'not-allowed' : 'pointer',
    opacity: pending ? 0.6 : 1,
  }
}
