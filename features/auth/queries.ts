/**
 * Auth TanStack Query keys and fetch function stubs
 * Real implementations will be added in Epic 1
 */

/**
 * Query key factory for authentication / user profile
 */
export const authKeys = {
  all: ['auth'] as const,
  /** Current authenticated user profile */
  profile: () => [...authKeys.all, 'profile'] as const,
  /** Auth session token validity */
  session: () => [...authKeys.all, 'session'] as const,
} as const
