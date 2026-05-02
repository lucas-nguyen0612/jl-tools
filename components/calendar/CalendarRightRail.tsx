'use client'

import { useState, useEffect, useMemo } from 'react'
import { useTranslations } from 'next-intl'
import { isSameDay } from 'date-fns'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Checkbox } from '@/components/ui/checkbox'
import {
  SOURCE_KEYS,
  SOURCE_FILTER_LABEL_KEYS,
  getSourceMeta,
  type SourceKey,
} from '@/features/calendar/sources'
import type { CalendarEvent } from '@/features/calendar/types'

export type CalendarRightRailProps = {
  currentDate: Date
  onSelectDate: (date: Date) => void
  todaysEvents: CalendarEvent[]
  visibleSources: Set<SourceKey>
  onToggleSource: (key: SourceKey) => void
  sourceCounts: Record<SourceKey, number>
}

function startOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1)
}

function addMonths(d: Date, delta: number): Date {
  return new Date(d.getFullYear(), d.getMonth() + delta, 1)
}

/**
 * Build the 6x7 mini-month grid (42 cells) starting on Monday.
 */
function buildMonthGrid(monthAnchor: Date): Date[] {
  const first = startOfMonth(monthAnchor)
  // Monday = 0, Sunday = 6 for our week start
  const dayOfWeek = (first.getDay() + 6) % 7
  const gridStart = new Date(first)
  gridStart.setDate(first.getDate() - dayOfWeek)

  const cells: Date[] = []
  for (let i = 0; i < 42; i++) {
    const d = new Date(gridStart)
    d.setDate(gridStart.getDate() + i)
    cells.push(d)
  }
  return cells
}

// Static: computed once at module load — locale can't change without a page reload.
const NARROW_WEEKDAY_LABELS: string[] = (() => {
  const fmt = new Intl.DateTimeFormat(undefined, { weekday: 'narrow' })
  // 2024-01-01 was a Monday — use it as a stable anchor.
  const monday = new Date(2024, 0, 1)
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    return fmt.format(d)
  })
})()

export function CalendarRightRail(props: CalendarRightRailProps): React.ReactElement {
  const {
    currentDate,
    onSelectDate,
    todaysEvents,
    visibleSources,
    onToggleSource,
    sourceCounts,
  } = props
  const t = useTranslations('calendar')

  const [monthAnchor, setMonthAnchor] = useState<Date>(() => startOfMonth(currentDate))

  // When the parent's currentDate changes (jump to date), re-anchor the mini-month.
  useEffect(() => {
    setMonthAnchor(startOfMonth(currentDate))
  }, [currentDate])

  const today = new Date()
  const cells = useMemo(() => buildMonthGrid(monthAnchor), [monthAnchor])
  const monthFmt = useMemo(() => new Intl.DateTimeFormat(undefined, { month: 'long', year: 'numeric' }), [])
  const timeFmt = useMemo(() => new Intl.DateTimeFormat(undefined, { hour: '2-digit', minute: '2-digit' }), [])

  const sortedTodaysEvents = useMemo(
    () => [...todaysEvents].sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime()),
    [todaysEvents],
  )

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        width: '100%',
      }}
    >
      {/* ---- Mini-month panel ---- */}
      <div className="jl-card" style={{ padding: 12 }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 8,
          }}
        >
          <div
            style={{
              fontFamily: 'var(--font-fraunces, Fraunces, serif)',
              fontSize: 14,
              fontWeight: 500,
            }}
          >
            {monthFmt.format(monthAnchor)}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <button
              type="button"
              onClick={() => setMonthAnchor((m) => addMonths(m, -1))}
              aria-label={t('miniMonth.prev')}
              style={chevronBtnStyle}
            >
              <ChevronLeft size={14} />
            </button>
            <button
              type="button"
              onClick={() => setMonthAnchor((m) => addMonths(m, 1))}
              aria-label={t('miniMonth.next')}
              style={chevronBtnStyle}
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(7, 1fr)',
            gap: 2,
            marginBottom: 4,
          }}
        >
          {NARROW_WEEKDAY_LABELS.map((label, idx) => (
            <div
              key={`wd-${idx}`}
              style={{
                fontSize: 10,
                color: 'var(--jl-text-faint)',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                textAlign: 'center',
              }}
            >
              {label}
            </div>
          ))}
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(7, 1fr)',
            gap: 2,
          }}
        >
          {cells.map((cell) => {
            const isToday = isSameDay(cell, today)
            const isSelected = isSameDay(cell, currentDate)
            const isOtherMonth = cell.getMonth() !== monthAnchor.getMonth()

            const cellStyle: React.CSSProperties = {
              aspectRatio: '1',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 999,
              fontSize: 12,
              cursor: 'pointer',
              background: isToday ? 'var(--jl-accent)' : 'transparent',
              color: isToday
                ? 'var(--jl-accent-ink)'
                : isOtherMonth
                  ? 'var(--jl-text-faint)'
                  : 'inherit',
              fontWeight: isToday ? 600 : 400,
              border:
                !isToday && isSelected
                  ? '1px solid var(--jl-accent)'
                  : '1px solid transparent',
              boxSizing: 'border-box',
              userSelect: 'none',
            }

            return (
              <div
                key={cell.toISOString()}
                role="button"
                tabIndex={0}
                onClick={() =>
                  onSelectDate(new Date(cell.getFullYear(), cell.getMonth(), cell.getDate()))
                }
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    onSelectDate(
                      new Date(cell.getFullYear(), cell.getMonth(), cell.getDate()),
                    )
                  }
                }}
                style={cellStyle}
              >
                {cell.getDate()}
              </div>
            )
          })}
        </div>
      </div>

      {/* ---- Today's agenda panel ---- */}
      <div className="jl-card" style={{ padding: 12 }}>
        <div
          style={{
            fontSize: 13,
            fontWeight: 600,
            marginBottom: 8,
          }}
        >
          {t('agenda.title')}
        </div>

        {sortedTodaysEvents.length === 0 ? (
          <div
            style={{
              fontSize: 12,
              color: 'var(--jl-text-faint)',
              fontStyle: 'italic',
            }}
          >
            {t('agenda.empty')}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {sortedTodaysEvents.map((event) => {
              const meta = getSourceMeta(event.source)
              const timeLabel = event.allDay
                ? t('agenda.allDay')
                : timeFmt.format(new Date(event.start))
              return (
                <div
                  key={event.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '6px 0',
                  }}
                >
                  <div
                    style={{
                      width: 60,
                      fontSize: 11,
                      color: 'var(--jl-text-soft)',
                      fontVariantNumeric: 'tabular-nums',
                      flexShrink: 0,
                    }}
                  >
                    {timeLabel}
                  </div>
                  <div
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: 999,
                      background: meta.color,
                      flexShrink: 0,
                    }}
                    aria-hidden
                  />
                  <div
                    style={{
                      fontSize: 13,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      flex: 1,
                      minWidth: 0,
                    }}
                  >
                    {event.title}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* ---- Calendars filter panel ---- */}
      <div className="jl-card" style={{ padding: 12 }}>
        <div
          style={{
            fontSize: 13,
            fontWeight: 600,
            marginBottom: 8,
          }}
        >
          {t('filters.title')}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {SOURCE_KEYS.map((key) => {
            const meta = getSourceMeta(key)
            const checked = visibleSources.has(key)
            const label = t(SOURCE_FILTER_LABEL_KEYS[key])
            return (
              <label
                key={key}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '6px 0',
                  cursor: 'pointer',
                }}
              >
                <Checkbox
                  checked={checked}
                  onCheckedChange={() => onToggleSource(key)}
                  aria-label={label}
                />
                <div
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: 999,
                    background: meta.color,
                    flexShrink: 0,
                  }}
                  aria-hidden
                />
                <div style={{ fontSize: 13, flex: 1, minWidth: 0 }}>
                  {label}
                </div>
                <div
                  style={{
                    fontSize: 11,
                    color: 'var(--jl-text-faint)',
                    fontVariantNumeric: 'tabular-nums',
                  }}
                >
                  {sourceCounts[key]}
                </div>
              </label>
            )
          })}
        </div>
      </div>
    </div>
  )
}

const chevronBtnStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 22,
  height: 22,
  border: 'none',
  background: 'transparent',
  color: 'var(--jl-text-soft)',
  borderRadius: 6,
  cursor: 'pointer',
  padding: 0,
}
