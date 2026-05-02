'use client'

import type { EventContentArg } from '@fullcalendar/core'
import { CALENDAR_SOURCES, getSourceMeta, type SourceKey } from '@/features/calendar/sources'

function resolveSource(raw: unknown): SourceKey {
  if (typeof raw === 'string' && raw in CALENDAR_SOURCES) {
    return raw as SourceKey
  }
  return 'google'
}

export function EventChip(arg: EventContentArg): React.ReactElement {
  const source = resolveSource(arg.event.extendedProps.source)
  const meta = getSourceMeta(source)
  const { color, Icon } = meta
  const showTime = !arg.event.allDay && Boolean(arg.timeText)

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        padding: '2px 6px',
        borderRadius: 'var(--jl-r-sm)',
        borderLeft: `3px solid ${color}`,
        background: `color-mix(in oklch, ${color} 14%, transparent)`,
        color: 'var(--jl-text)',
        overflow: 'hidden',
        cursor: 'pointer',
        fontSize: 12,
        lineHeight: 1.2,
      }}
    >
      <Icon size={12} style={{ color, flexShrink: 0 }} />
      <span
        style={{
          flex: 1,
          minWidth: 0,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          fontWeight: 500,
        }}
      >
        {arg.event.title}
      </span>
      {showTime && (
        <span
          style={{
            fontVariantNumeric: 'tabular-nums',
            fontSize: 11,
            color: 'var(--jl-text-soft)',
            flexShrink: 0,
          }}
        >
          {arg.timeText}
        </span>
      )}
    </div>
  )
}
