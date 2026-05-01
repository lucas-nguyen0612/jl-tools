/**
 * Authentication utility helpers
 * Pure functions for session management and user display
 */
import type { Profile } from './types'

/**
 * Returns a display name for a profile.
 * Falls back through: display_name → email prefix → 'User'
 * @param profile - user profile (or null)
 * @param email - optional email fallback
 * @returns display name string
 */
export function getUserDisplayName(
  profile: Pick<Profile, 'display_name'> | null,
  email?: string
): string {
  if (profile?.display_name) return profile.display_name
  if (email) {
    const [prefix] = email.split('@')
    return prefix ?? 'User'
  }
  return 'User'
}

/**
 * Returns true when a valid session exists (non-null, non-empty user).
 * @param userId - authenticated user ID (null if not authenticated)
 * @returns authentication status
 */
export function isAuthenticated(userId: string | null): boolean {
  return userId !== null && userId.length > 0
}
