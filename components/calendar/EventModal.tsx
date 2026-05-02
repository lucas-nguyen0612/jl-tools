'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { useRouter } from '@/i18n/navigation'
import { ArrowRight } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { useCreateEvent, useUpdateEvent, useDeleteEvent } from '@/features/calendar/queries'
import { getSourceMeta, SOURCE_FILTER_LABEL_KEYS } from '@/features/calendar/sources'
import type { CalendarEvent } from '@/features/calendar/types'

export type EventModalProps = {
  open: boolean
  onClose: () => void
  mode: 'create' | 'edit'
  event?: CalendarEvent
  defaultDate?: string
  /** Prefill values when opened from quick-create. Only honored in 'create' mode. */
  initialDraft?: {
    title?: string
    startAt?: string
    endAt?: string
  }
}

function pad(n: number): string {
  return String(n).padStart(2, '0')
}

function splitDateTimeLocal(iso: string): { date: string; time: string } {
  const d = new Date(iso)
  return {
    date: `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`,
    time: `${pad(d.getHours())}:${pad(d.getMinutes())}`,
  }
}

function joinDateTimeLocal(date: string, time: string): string {
  const t = time || '00:00'
  // Include local timezone offset so the server parses the correct absolute time.
  // Without this, a server running UTC interprets "19:00" as UTC 19:00 instead
  // of the user's local 19:00, causing events to shift by the UTC offset.
  const offsetMinutes = new Date().getTimezoneOffset() // negative for UTC+N
  const sign = offsetMinutes <= 0 ? '+' : '-'
  const abs = Math.abs(offsetMinutes)
  const hh = String(Math.floor(abs / 60)).padStart(2, '0')
  const mm = String(abs % 60).padStart(2, '0')
  return `${date}T${t}:00${sign}${hh}:${mm}`
}

function defaultStartForDate(dateStr?: string): { date: string; time: string } {
  if (!dateStr) {
    const now = new Date()
    now.setMinutes(0, 0, 0)
    return splitDateTimeLocal(now.toISOString())
  }
  return { date: dateStr, time: '09:00' }
}

function defaultEndForDate(dateStr?: string): { date: string; time: string } {
  if (!dateStr) {
    const now = new Date()
    now.setMinutes(0, 0, 0)
    now.setHours(now.getHours() + 1)
    return splitDateTimeLocal(now.toISOString())
  }
  return { date: dateStr, time: '10:00' }
}

function formatEventTime(start: string, end: string, allDay: boolean): string {
  const startDate = new Date(start)
  const endDate = new Date(end)
  if (allDay) {
    const dateFmt = new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' })
    return dateFmt.format(startDate)
  }
  const fmt = new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' })
  return `${fmt.format(startDate)} — ${fmt.format(endDate)}`
}

export function EventModal({
  open,
  onClose,
  mode,
  event,
  defaultDate,
  initialDraft,
}: EventModalProps): React.ReactElement {
  const t = useTranslations('calendar')
  const router = useRouter()

  const [title, setTitle] = useState('')
  const [startDate, setStartDate] = useState('')
  const [startTime, setStartTime] = useState('')
  const [endDate, setEndDate] = useState('')
  const [endTime, setEndTime] = useState('')
  const [allDay, setAllDay] = useState(false)
  const [description, setDescription] = useState('')
  const [errorMsg, setErrorMsg] = useState('')

  const createMutation = useCreateEvent()
  const updateMutation = useUpdateEvent()
  const deleteMutation = useDeleteEvent()

  const isPending =
    createMutation.isPending || updateMutation.isPending || deleteMutation.isPending

  useEffect(() => {
    if (!open) return
    if (mode === 'edit' && event) {
      const s = splitDateTimeLocal(event.start)
      const e = splitDateTimeLocal(event.end)
      setTitle(event.title)
      setStartDate(s.date)
      setStartTime(s.time)
      setEndDate(e.date)
      setEndTime(e.time)
      setAllDay(event.allDay)
      setDescription(event.description ?? '')
    } else if (mode === 'create') {
      if (initialDraft) {
        setTitle(initialDraft.title ?? '')
        const startSource = initialDraft.startAt
        const endSource = initialDraft.endAt
        const s = startSource
          ? splitDateTimeLocal(new Date(startSource).toISOString())
          : defaultStartForDate(defaultDate)
        const e = endSource
          ? splitDateTimeLocal(new Date(endSource).toISOString())
          : defaultEndForDate(defaultDate)
        setStartDate(s.date)
        setStartTime(s.time)
        setEndDate(e.date)
        setEndTime(e.time)
        setAllDay(false)
        setDescription('')
      } else {
        const s = defaultStartForDate(defaultDate)
        const e = defaultEndForDate(defaultDate)
        setTitle('')
        setStartDate(s.date)
        setStartTime(s.time)
        setEndDate(e.date)
        setEndTime(e.time)
        setAllDay(false)
        setDescription('')
      }
    }
    setErrorMsg('')
  }, [open, mode, event, defaultDate, initialDraft])

  const isReadOnly = mode === 'edit' && event && event.source !== 'google'

  async function handleSave() {
    if (!title.trim()) return
    setErrorMsg('')

    const startAt = joinDateTimeLocal(startDate, startTime)
    const endAt = joinDateTimeLocal(endDate, endTime)

    if (mode === 'create') {
      const result = await createMutation.mutateAsync({
        title: title.trim(),
        startAt,
        endAt,
        allDay,
        description: description || undefined,
      })
      if (result.error) {
        setErrorMsg(result.error.message)
        return
      }
    } else if (mode === 'edit' && event) {
      const result = await updateMutation.mutateAsync({
        eventId: event.id,
        input: {
          title: title.trim(),
          startAt,
          endAt,
          allDay,
          description: description || undefined,
        },
      })
      if (result.error) {
        setErrorMsg(result.error.message)
        return
      }
    }
    onClose()
  }

  async function handleDelete() {
    if (!event) return
    setErrorMsg('')
    const result = await deleteMutation.mutateAsync(event.id)
    if (result.error) {
      setErrorMsg(result.error.message)
      return
    }
    onClose()
  }

  function handleOpenChange(next: boolean) {
    if (!next && !isPending) onClose()
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isReadOnly && event?.source === 'task'
              ? t('event.taskTitle')
              : mode === 'create' ? t('event.newTitle') : t('event.editTitle')}
          </DialogTitle>
        </DialogHeader>

        {isReadOnly && event ? (
          <ReadOnlyEventBody
            event={event}
            onClose={onClose}
            onDeepLink={(path) => {
              router.push(path)
              onClose()
            }}
          />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={labelStyle}>{t('event.titleLabel')}</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={t('event.titleLabel')}
                style={inputStyle}
                autoFocus
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <input
                type="checkbox"
                id="allDay"
                checked={allDay}
                onChange={(e) => setAllDay(e.target.checked)}
                style={{ width: 15, height: 15, accentColor: 'var(--jl-accent)', cursor: 'pointer' }}
              />
              <label htmlFor="allDay" style={{ fontSize: 13, cursor: 'pointer' }}>
                {t('event.allDayLabel')}
              </label>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={labelStyle}>{t('event.startLabel')}</label>
              <div style={{ display: 'flex', gap: 8 }}>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  style={inputStyle}
                />
                {!allDay && (
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    style={inputStyle}
                  />
                )}
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={labelStyle}>{t('event.endLabel')}</label>
              <div style={{ display: 'flex', gap: 8 }}>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  style={inputStyle}
                />
                {!allDay && (
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    style={inputStyle}
                  />
                )}
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={labelStyle}>{t('event.descriptionLabel')}</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={t('event.descriptionPlaceholder')}
                rows={3}
                style={{ ...inputStyle, resize: 'vertical', minHeight: 72 }}
              />
            </div>

            {errorMsg && (
              <p style={{ margin: 0, fontSize: 12, color: 'var(--jl-danger)' }}>{errorMsg}</p>
            )}

            <DialogFooter>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  gap: 8,
                  width: '100%',
                }}
              >
                {mode === 'edit' ? (
                  <button
                    onClick={handleDelete}
                    disabled={isPending}
                    style={deleteBtnStyle(isPending)}
                  >
                    {deleteMutation.isPending ? t('event.deleting') : t('event.delete')}
                  </button>
                ) : (
                  <span />
                )}
                <div style={{ display: 'flex', gap: 8, marginLeft: 'auto' }}>
                  <button onClick={onClose} disabled={isPending} style={cancelBtnStyle}>
                    {t('event.cancel')}
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={isPending || !title.trim()}
                    style={saveBtnStyle(isPending || !title.trim())}
                  >
                    {createMutation.isPending || updateMutation.isPending
                      ? t('event.saving')
                      : t('event.save')}
                  </button>
                </div>
              </div>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

function ReadOnlyEventBody({
  event,
  onClose,
  onDeepLink,
}: {
  event: CalendarEvent
  onClose: () => void
  onDeepLink: (path: string) => void
}) {
  const t = useTranslations('calendar')
  const { deepLinkPath, deepLinkLabelKey, color, Icon } = getSourceMeta(event.source)
  const sourceLabel = t(SOURCE_FILTER_LABEL_KEYS[event.source])
  const timeLabel = formatEventTime(event.start, event.end, event.allDay)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          alignSelf: 'flex-start',
          height: 24,
          padding: '0 10px',
          borderRadius: 999,
          fontSize: 12,
          fontWeight: 500,
          background: `color-mix(in oklch, ${color} 14%, transparent)`,
          border: `1px solid color-mix(in oklch, ${color} 40%, transparent)`,
          color: 'var(--jl-text)',
        }}
      >
        <Icon size={12} style={{ color, flexShrink: 0 }} />
        <span>{sourceLabel}</span>
      </div>

      <p style={{ margin: 0, fontSize: 14, fontWeight: 600 }}>{event.title}</p>
      <p style={{ margin: 0, fontSize: 13, color: 'var(--jl-text-soft)' }}>{timeLabel}</p>

      {event.description && (
        <p style={{ margin: 0, fontSize: 13, color: 'var(--jl-text-soft)', whiteSpace: 'pre-wrap' }}>
          {event.description}
        </p>
      )}

      {deepLinkPath && deepLinkLabelKey && (
        <button
          onClick={() => onDeepLink(deepLinkPath)}
          style={{
            ...saveBtnStyle(false),
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            alignSelf: 'flex-start',
          }}
        >
          {t(deepLinkLabelKey)}
          <ArrowRight size={14} />
        </button>
      )}

      <DialogFooter>
        <button onClick={onClose} style={cancelBtnStyle}>
          {t('event.cancel')}
        </button>
      </DialogFooter>
    </div>
  )
}

const labelStyle: React.CSSProperties = {
  fontSize: 12,
  fontWeight: 600,
  color: 'var(--jl-text-soft)',
  textTransform: 'uppercase',
  letterSpacing: '0.04em',
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

const cancelBtnStyle: React.CSSProperties = {
  padding: '8px 14px',
  borderRadius: 8,
  border: '1px solid var(--jl-line)',
  background: 'transparent',
  color: 'inherit',
  fontSize: 13,
  fontWeight: 500,
  cursor: 'pointer',
}

function saveBtnStyle(disabled: boolean): React.CSSProperties {
  return {
    padding: '8px 16px',
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

function deleteBtnStyle(disabled: boolean): React.CSSProperties {
  return {
    padding: '8px 14px',
    borderRadius: 8,
    border: '1px solid color-mix(in oklch, var(--jl-danger) 50%, transparent)',
    background: 'transparent',
    color: 'var(--jl-danger)',
    fontSize: 13,
    fontWeight: 500,
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.6 : 1,
  }
}
