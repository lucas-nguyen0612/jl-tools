import { CalendarDays, Flame, Sprout, SquareCheck, type LucideIcon } from 'lucide-react'

export type SourceKey = 'google' | 'pomodoro' | 'habit' | 'task'

export type SourceMeta = {
  key: SourceKey
  /** CSS color expression — used for backgrounds, borders, dots. Use jl-* tokens. */
  color: string
  /** i18n key path under the `calendar.filters.*` namespace. */
  filterLabelKey: string
  Icon: LucideIcon
  /** Deep-link path (no locale prefix) for read-only event "View in X" buttons. Null = no deep link. */
  deepLinkPath: string | null
  /** i18n key for the deep-link button label, null if no deep link. */
  deepLinkLabelKey: 'event.viewInPomodoro' | 'event.viewInHabits' | null
}

export const CALENDAR_SOURCES: Record<SourceKey, SourceMeta> = {
  google: {
    key: 'google',
    color: 'var(--jl-info)',
    filterLabelKey: 'filters.google',
    Icon: CalendarDays,
    deepLinkPath: null,
    deepLinkLabelKey: null,
  },
  pomodoro: {
    key: 'pomodoro',
    color: 'var(--jl-accent)',
    filterLabelKey: 'filters.pomodoro',
    Icon: Flame,
    deepLinkPath: '/pomodoro',
    deepLinkLabelKey: 'event.viewInPomodoro',
  },
  habit: {
    key: 'habit',
    color: 'var(--jl-success)',
    filterLabelKey: 'filters.habits',
    Icon: Sprout,
    deepLinkPath: '/habits',
    deepLinkLabelKey: 'event.viewInHabits',
  },
  task: {
    key: 'task',
    color: 'var(--jl-warning)',
    filterLabelKey: 'filters.tasks',
    Icon: SquareCheck,
    deepLinkPath: null,
    deepLinkLabelKey: null,
  },
}

export const SOURCE_KEYS: SourceKey[] = Object.keys(CALENDAR_SOURCES) as SourceKey[]

/**
 * Literal-typed lookup so callers can pass the value directly to next-intl `t()`
 * without losing the union of valid keys.
 */
export const SOURCE_FILTER_LABEL_KEYS = {
  google: 'filters.google',
  pomodoro: 'filters.pomodoro',
  habit: 'filters.habits',
  task: 'filters.tasks',
} as const


export function getSourceMeta(key: SourceKey): SourceMeta {
  return CALENDAR_SOURCES[key]
}
