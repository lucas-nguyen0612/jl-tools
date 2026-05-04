'use client'

import { useEffect, useState, useTransition } from 'react'
import { CalendarDays, CheckCircle2, Coffee, Sparkles } from 'lucide-react'
import { useTranslations } from 'next-intl'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Checkbox } from '@/components/ui/checkbox'
import { createPomodoroCalendarEvent } from '@/features/calendar/pomodoro-sync'
import type { CompletedFocusSession } from '@/store/pomodoroStore'

interface FocusSessionCompleteDialogProps {
  open: boolean
  session: CompletedFocusSession | null
  onDismiss: () => void
  onStartBreak: () => void
}

export function FocusSessionCompleteDialog({
  open,
  session,
  onDismiss,
  onStartBreak,
}: FocusSessionCompleteDialogProps) {
  const t = useTranslations('pomodoro.sessionCompleteDialog')
  const [syncToCalendar, setSyncToCalendar] = useState(true)
  const [calendarError, setCalendarError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    if (!open) return
    setSyncToCalendar(true)
    setCalendarError(null)
  }, [open, session?.sessionCount])

  async function maybeSyncCalendar() {
    if (!syncToCalendar || !session?.calendarPayload) return

    const result = await createPomodoroCalendarEvent(session.calendarPayload)
    if (result.error) {
      console.error('[pomodoro] failed to create calendar event:', result.error)
      setCalendarError(t('calendarError'))
    }
  }

  function handleConfirm(next: 'dismiss' | 'break') {
    startTransition(async () => {
      await maybeSyncCalendar()
      if (next === 'break') {
        onStartBreak()
      } else {
        onDismiss()
      }
    })
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen && !isPending) onDismiss()
      }}
    >
      <DialogContent
        showCloseButton={false}
        className="border-[color:var(--jl-line-soft)] bg-[var(--jl-bg-raised)] p-0 text-[var(--jl-text)] sm:max-w-[440px]"
      >
        <div className="flex flex-col items-center gap-5 px-6 pb-6 pt-7 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--jl-accent-soft)] text-[var(--jl-accent-ink)]">
            <CheckCircle2 size={34} />
          </div>

          <DialogHeader className="items-center gap-2 text-center">
            <DialogTitle className="font-display text-2xl leading-tight text-[var(--jl-text)]">
              {t('title')}
            </DialogTitle>
            <DialogDescription className="max-w-[320px] text-sm leading-6 text-[var(--jl-text-soft)]">
              {t('description')}
            </DialogDescription>
          </DialogHeader>

          <div className="grid w-full grid-cols-2 gap-3">
            <div className="rounded-md border border-[color:var(--jl-line-soft)] bg-[var(--jl-bg-sunken)] p-3">
              <div className="flex items-center justify-center gap-1.5 text-sm font-semibold text-[var(--jl-accent-ink)]">
                <Sparkles size={15} />
                {t('xpEarned', { xp: session?.xpAwarded ?? 0 })}
              </div>
              <div className="mt-1 text-xs text-[var(--jl-text-faint)]">
                {t('xpLabel')}
              </div>
            </div>

            <div className="rounded-md border border-[color:var(--jl-line-soft)] bg-[var(--jl-bg-sunken)] p-3">
              <div className="text-sm font-semibold text-[var(--jl-text)]">
                {t('sessionCount', { count: session?.sessionCount ?? 0 })}
              </div>
              <div className="mt-1 text-xs text-[var(--jl-text-faint)]">
                {t('sessionCountLabel')}
              </div>
            </div>
          </div>

          <label className="flex w-full items-start gap-3 rounded-md border border-[color:var(--jl-line-soft)] bg-[var(--jl-bg-sunken)] p-3 text-left">
            <Checkbox
              checked={syncToCalendar}
              onCheckedChange={(checked) => setSyncToCalendar(checked === true)}
              className="mt-0.5"
              aria-label={t('calendarCheckbox')}
            />
            <span className="flex-1">
              <span className="flex items-center gap-2 text-sm font-medium text-[var(--jl-text)]">
                <CalendarDays size={15} />
                {t('calendarCheckbox')}
              </span>
              <span className="mt-1 block text-xs leading-5 text-[var(--jl-text-soft)]">
                {t('calendarHint')}
              </span>
              {calendarError && (
                <span className="mt-1 block text-xs text-[var(--jl-danger, #ef4444)]">
                  {calendarError}
                </span>
              )}
            </span>
          </label>

          <div className="grid w-full grid-cols-1 gap-2 sm:grid-cols-[1fr_auto]">
            <button
              type="button"
              onClick={() => handleConfirm('break')}
              disabled={isPending}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-[var(--jl-accent-strong)] px-4 text-sm font-semibold text-white transition-opacity disabled:cursor-not-allowed disabled:opacity-70"
            >
              <Coffee size={16} />
              {isPending ? t('saving') : t('startBreak')}
            </button>
            <button
              type="button"
              onClick={() => handleConfirm('dismiss')}
              disabled={isPending}
              className="inline-flex h-10 items-center justify-center rounded-md border border-[color:var(--jl-line)] bg-[var(--jl-bg-sunken)] px-5 text-sm font-semibold text-[var(--jl-text-soft)] transition-opacity disabled:cursor-not-allowed disabled:opacity-70"
            >
              {t('ok')}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
