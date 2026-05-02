'use client'

import { useState, useRef, useMemo, useCallback } from 'react'
import dynamic from 'next/dynamic'
import { isSameDay } from 'date-fns'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import type {
  DatesSetArg,
  EventClickArg,
  EventContentArg,
  EventDropArg,
} from '@fullcalendar/core'
import type { DateClickArg, EventResizeDoneArg } from '@fullcalendar/interaction'
import { useTranslations, useLocale } from 'next-intl'

import { useCalendarEvents, useCalendarTasks, useUpdateEvent } from '@/features/calendar/queries'
import type { CalendarEvent } from '@/features/calendar/types'
import {
  SOURCE_KEYS,
  getSourceMeta,
  type SourceKey,
} from '@/features/calendar/sources'
import { useCalendarShortcuts } from '@/features/calendar/useCalendarShortcuts'

import { CalendarToolbar, type CalendarView as ViewKey } from './CalendarToolbar'
import { CalendarRightRail } from './CalendarRightRail'
import { EventChip } from './EventChip'
import { EventModal } from './EventModal'
import { QuickCreatePopover } from './QuickCreatePopover'

const FullCalendar = dynamic(
  () => import('./FullCalendarWithRef').then((m) => m.FullCalendarWithRef),
  { ssr: false },
)

const VIEW_TO_FC: Record<ViewKey, string> = {
  day: 'timeGridDay',
  week: 'timeGridWeek',
  month: 'dayGridMonth',
}

type ModalState = {
  open: boolean
  mode: 'create' | 'edit'
  event?: CalendarEvent
  defaultDate?: string
  initialDraft?: { title?: string; startAt?: string; endAt?: string }
}

type QuickCreateState = {
  open: boolean
  anchor: { x: number; y: number } | null
  defaultDate: string
}

function getInitialRange() {
  const now = new Date()
  return {
    timeMin: new Date(now.getFullYear(), now.getMonth(), 1).toISOString(),
    timeMax: new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59).toISOString(),
  }
}

function todayIsoDate(): string {
  const d = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

export function CalendarView() {
  const t = useTranslations('calendar')
  const locale = useLocale()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const calendarRef = useRef<any>(null)

  const [view, setView] = useState<ViewKey>('month')
  const [currentDate, setCurrentDate] = useState<Date>(() => new Date())
  const [currentRange, setCurrentRange] = useState(getInitialRange)
  const [visibleSources, setVisibleSources] = useState<Set<SourceKey>>(
    () => new Set(SOURCE_KEYS),
  )
  const [modal, setModal] = useState<ModalState>({ open: false, mode: 'create' })
  const [quickCreate, setQuickCreate] = useState<QuickCreateState>({
    open: false,
    anchor: null,
    defaultDate: '',
  })

  const { data: result, isFetching: fetchingEvents } = useCalendarEvents(
    currentRange.timeMin,
    currentRange.timeMax,
  )
  const { data: tasksResult, isFetching: fetchingTasks } = useCalendarTasks(
    currentRange.timeMin,
    currentRange.timeMax,
  )
  const isFetching = fetchingEvents || fetchingTasks
  const updateMutation = useUpdateEvent()

  const allEvents = useMemo<CalendarEvent[]>(
    () => [...(result?.data ?? []), ...(tasksResult?.data ?? [])],
    [result, tasksResult],
  )

  const sourceCounts = useMemo<Record<SourceKey, number>>(() => {
    const counts: Record<SourceKey, number> = { google: 0, pomodoro: 0, habit: 0, task: 0 }
    for (const ev of allEvents) {
      if (ev.source in counts) counts[ev.source as SourceKey] += 1
    }
    return counts
  }, [allEvents])

  const todaysEvents = useMemo<CalendarEvent[]>(() => {
    const today = new Date()
    return allEvents
      .filter((e) => isSameDay(new Date(e.start), today))
      .filter((e) => visibleSources.has(e.source as SourceKey))
  }, [allEvents, visibleSources])

  const fcEvents = useMemo(() => {
    return allEvents
      .filter((ev) => visibleSources.has(ev.source as SourceKey))
      .map((ev) => {
        const meta = getSourceMeta(ev.source as SourceKey)
        return {
          id: ev.id,
          title: ev.title,
          start: ev.start,
          end: ev.end,
          allDay: ev.allDay,
          backgroundColor: meta.color,
          borderColor: meta.color,
          editable: ev.source === 'google',
          extendedProps: { source: ev.source, calendarEvent: ev },
        }
      })
  }, [allEvents, visibleSources])

  const title = useMemo(() => {
    if (view === 'month') {
      return new Intl.DateTimeFormat(locale, { month: 'long', year: 'numeric' }).format(currentDate)
    }
    if (view === 'day') {
      return new Intl.DateTimeFormat(locale, {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
      }).format(currentDate)
    }
    const start = new Date(currentDate)
    const end = new Date(start)
    end.setDate(start.getDate() + 6)
    const sFmt = new Intl.DateTimeFormat(locale, { month: 'short', day: 'numeric' }).format(start)
    const eFmt = new Intl.DateTimeFormat(locale, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(end)
    return `${sFmt} – ${eFmt}`
  }, [currentDate, view, locale])

  const api = useCallback(() => calendarRef.current?.getApi(), [])

  const onPrev = useCallback(() => api()?.prev(), [api])
  const onNext = useCallback(() => api()?.next(), [api])
  const onToday = useCallback(() => api()?.today(), [api])
  const onChangeView = useCallback(
    (v: ViewKey) => {
      setView(v)
      api()?.changeView(VIEW_TO_FC[v])
    },
    [api],
  )
  const onSelectDate = useCallback(
    (d: Date) => {
      api()?.gotoDate(d)
    },
    [api],
  )
  const onNewEvent = useCallback(() => {
    setQuickCreate({
      open: true,
      anchor: { x: window.innerWidth / 2, y: window.innerHeight / 2 },
      defaultDate: todayIsoDate(),
    })
  }, [])

  const onToggleSource = useCallback((key: SourceKey) => {
    setVisibleSources((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }, [])

  useCalendarShortcuts(
    {
      onToday,
      onPrev,
      onNext,
      onView: onChangeView,
      onNew: onNewEvent,
    },
    !modal.open && !quickCreate.open,
  )

  function handleDatesSet(arg: DatesSetArg) {
    const timeMin = arg.start.toISOString()
    const timeMax = arg.end.toISOString()
    setCurrentRange((prev) =>
      prev.timeMin === timeMin && prev.timeMax === timeMax ? prev : { timeMin, timeMax },
    )
    setCurrentDate(arg.view.currentStart)
  }

  function handleEventClick(arg: EventClickArg) {
    const ev = arg.event.extendedProps.calendarEvent as CalendarEvent
    setModal({ open: true, mode: 'edit', event: ev })
  }

  function handleDateClick(arg: DateClickArg) {
    setQuickCreate({
      open: true,
      anchor: { x: arg.jsEvent.clientX, y: arg.jsEvent.clientY },
      defaultDate: arg.dateStr.slice(0, 10),
    })
  }

  async function handleEventDrop(arg: EventDropArg) {
    const ev = arg.event.extendedProps.calendarEvent as CalendarEvent
    if (ev.source !== 'google') {
      arg.revert()
      return
    }
    const result = await updateMutation.mutateAsync({
      eventId: ev.id,
      input: {
        title: ev.title,
        startAt: arg.event.startStr,
        endAt: arg.event.endStr || arg.event.startStr,
        allDay: arg.event.allDay,
      },
    })
    if (result.error) arg.revert()
  }

  async function handleEventResize(arg: EventResizeDoneArg) {
    const ev = arg.event.extendedProps.calendarEvent as CalendarEvent
    if (ev.source !== 'google') {
      arg.revert()
      return
    }
    const result = await updateMutation.mutateAsync({
      eventId: ev.id,
      input: {
        title: ev.title,
        startAt: arg.event.startStr,
        endAt: arg.event.endStr || arg.event.startStr,
        allDay: arg.event.allDay,
      },
    })
    if (result.error) arg.revert()
  }

  function handleQuickMore(draft: { title: string; startAt: string; endAt: string }) {
    setModal({
      open: true,
      mode: 'create',
      defaultDate: quickCreate.defaultDate,
      initialDraft: draft,
    })
    setQuickCreate({ open: false, anchor: null, defaultDate: '' })
  }

  if (result?.error && result.error.code !== 'CALENDAR_NOT_CONNECTED') {
    return (
      <div style={{ padding: '32px 24px', color: 'var(--jl-danger)', fontSize: 14 }}>
        {result.error.message}
      </div>
    )
  }


  return (
    <div
      className="calendar-page"
      style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}
    >
      <div
        className="grid grid-cols-1 xl:grid-cols-[1fr_300px]"
        style={{
          gap: 'var(--jl-gap)',
          padding: '16px 24px',
          flex: 1,
          minHeight: 0,
        }}
      >
        {/* Main calendar column */}
        <div
          className="jl-card"
          style={{
            display: 'flex',
            flexDirection: 'column',
            minHeight: 0,
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Top loading bar */}
          <div
            aria-hidden
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: 2,
              overflow: 'hidden',
              zIndex: 5,
              opacity: isFetching ? 1 : 0,
              transition: 'opacity 0.2s',
              pointerEvents: 'none',
            }}
          >
            <div
              style={{
                width: '40%',
                height: '100%',
                background: 'var(--jl-accent)',
                animation: 'jl-cal-progress 1.2s ease-in-out infinite',
              }}
            />
          </div>
          <style>{`
            @keyframes jl-cal-progress {
              0% { transform: translateX(-120%); }
              100% { transform: translateX(350%); }
            }
          `}</style>

          <CalendarToolbar
            title={title}
            view={view}
            onPrev={onPrev}
            onNext={onNext}
            onToday={onToday}
            onChangeView={onChangeView}
            visibleSources={visibleSources}
            onToggleSource={onToggleSource}
            sourceCounts={sourceCounts}
          />

          <div style={{ flex: 1, minHeight: 0, padding: '8px 12px 12px' }}>
            <FullCalendar
              ref={calendarRef}
              plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
              initialView={VIEW_TO_FC[view]}
              headerToolbar={false}
              events={fcEvents}
              datesSet={handleDatesSet}
              eventClick={handleEventClick}
              dateClick={handleDateClick}
              eventDrop={handleEventDrop}
              eventResize={handleEventResize}
              eventContent={(arg: EventContentArg) => <EventChip {...arg} />}
              editable
              eventStartEditable
              eventDurationEditable
              dayMaxEventRows
              firstDay={1}
              nowIndicator
              height="100%"
              locale={locale}
              aria-label={t('title')}
            />
          </div>
        </div>

        {/* Right rail (xl+) */}
        <div className="hidden xl:block" style={{ minHeight: 0, overflowY: 'auto' }}>
          <CalendarRightRail
            currentDate={currentDate}
            onSelectDate={onSelectDate}
            todaysEvents={todaysEvents}
            visibleSources={visibleSources}
            onToggleSource={onToggleSource}
            sourceCounts={sourceCounts}
          />
        </div>
      </div>

      <EventModal
        open={modal.open}
        onClose={() => setModal({ open: false, mode: 'create' })}
        mode={modal.mode}
        event={modal.event}
        defaultDate={modal.defaultDate}
        initialDraft={modal.initialDraft}
      />

      <QuickCreatePopover
        open={quickCreate.open}
        onClose={() => setQuickCreate({ open: false, anchor: null, defaultDate: '' })}
        anchorRect={quickCreate.anchor}
        defaultDate={quickCreate.defaultDate}
        onMore={handleQuickMore}
      />
    </div>
  )
}
