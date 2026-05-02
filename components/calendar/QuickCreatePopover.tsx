'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import {
  Popover,
  PopoverAnchor,
  PopoverContent,
} from '@/components/ui/popover'
import { useCreateEvent } from '@/features/calendar/queries'

export type QuickCreatePopoverProps = {
  open: boolean
  onClose: () => void
  /** Anchor reference for shadcn Popover positioning. Pass a virtual anchor or DOM node. */
  anchorRect: { x: number; y: number } | null
  /** ISO date (YYYY-MM-DD) clicked. Used as the new event's date. */
  defaultDate: string
  /** Called when user opts for full modal. Parent should open the EventModal in 'create' mode prefilled with these values. */
  onMore: (draft: { title: string; startAt: string; endAt: string }) => void
}

export function QuickCreatePopover(
  props: QuickCreatePopoverProps,
): React.ReactElement | null {
  const { open, onClose, anchorRect, defaultDate, onMore } = props
  const t = useTranslations('calendar')

  const [title, setTitle] = useState('')
  const [startTime, setStartTime] = useState('09:00')
  const [endTime, setEndTime] = useState('10:00')
  const [errorMsg, setErrorMsg] = useState('')

  const createMutation = useCreateEvent()

  // Reset form whenever the popover opens or the target date changes.
  useEffect(() => {
    if (!open) return
    setTitle('')
    setStartTime('09:00')
    setEndTime('10:00')
    setErrorMsg('')
  }, [open, defaultDate])

  if (!anchorRect) return null

  function buildIso(time: string): string {
    const offsetMinutes = new Date().getTimezoneOffset()
    const sign = offsetMinutes <= 0 ? '+' : '-'
    const abs = Math.abs(offsetMinutes)
    const hh = String(Math.floor(abs / 60)).padStart(2, '0')
    const mm = String(abs % 60).padStart(2, '0')
    return `${defaultDate}T${time}:00${sign}${hh}:${mm}`
  }

  async function handleSave() {
    const trimmed = title.trim()
    if (!trimmed) return
    setErrorMsg('')
    const result = await createMutation.mutateAsync({
      title: trimmed,
      startAt: buildIso(startTime),
      endAt: buildIso(endTime),
      allDay: false,
    })
    if (result.error) {
      setErrorMsg(result.error.message)
      return
    }
    onClose()
  }

  function handleMore() {
    onMore({
      title: title.trim(),
      startAt: buildIso(startTime),
      endAt: buildIso(endTime),
    })
    onClose()
  }

  const isPending = createMutation.isPending
  const saveDisabled = isPending || !title.trim()

  return (
    <Popover open={open} onOpenChange={(v) => { if (!v) onClose() }}>
      <PopoverAnchor asChild>
        <div
          style={{
            position: 'fixed',
            left: anchorRect.x,
            top: anchorRect.y,
            width: 1,
            height: 1,
            pointerEvents: 'none',
          }}
        />
      </PopoverAnchor>
      <PopoverContent
        align="start"
        sideOffset={6}
        style={{
          width: 280,
          padding: 12,
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
        }}
      >
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              if (!saveDisabled) handleSave()
            }
          }}
          placeholder={t('quickCreate.titlePlaceholder')}
          style={inputStyle}
          autoFocus
        />

        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <input
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            style={{ ...inputStyle, flex: 1 }}
          />
          <span
            style={{
              fontSize: 12,
              color: 'var(--jl-text-soft)',
              userSelect: 'none',
            }}
            aria-hidden
          >
            →
          </span>
          <input
            type="time"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            style={{ ...inputStyle, flex: 1 }}
          />
        </div>

        {errorMsg && (
          <p style={{ margin: 0, fontSize: 12, color: 'var(--jl-danger)' }}>{errorMsg}</p>
        )}

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <button
            type="button"
            onClick={handleMore}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--jl-text-soft)',
              fontSize: 12,
              cursor: 'pointer',
              padding: '4px 0',
            }}
          >
            {t('quickCreate.more')}
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saveDisabled}
            style={saveBtnStyle(saveDisabled)}
          >
            {t('quickCreate.save')}
          </button>
        </div>
      </PopoverContent>
    </Popover>
  )
}

const inputStyle: React.CSSProperties = {
  padding: '8px 10px',
  borderRadius: 8,
  border: '1px solid var(--jl-line)',
  background: 'var(--jl-bg-sunken)',
  color: 'inherit',
  fontSize: 14,
  outline: 'none',
  width: '100%',
  boxSizing: 'border-box',
}

function saveBtnStyle(disabled: boolean): React.CSSProperties {
  return {
    padding: '6px 14px',
    borderRadius: 8,
    border: 'none',
    background: 'var(--jl-accent)',
    color: 'var(--jl-accent-ink)',
    fontSize: 13,
    fontWeight: 600,
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.6 : 1,
  }
}
