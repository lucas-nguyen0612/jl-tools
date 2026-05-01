/**
 * Pomodoro TanStack Query keys and fetch function stubs
 * Real implementations will be added in Epic 3
 */

/**
 * Query key factory for pomodoro sessions
 */
export const pomodoroKeys = {
  all: ['pomodoro'] as const,
  /** All sessions for the current user */
  sessions: () => [...pomodoroKeys.all, 'sessions'] as const,
  /** A specific session by ID */
  session: (id: string) => [...pomodoroKeys.all, 'session', id] as const,
  /** Today's aggregated stats */
  todayStats: () => [...pomodoroKeys.all, 'today-stats'] as const,
} as const
