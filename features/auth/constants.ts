/**
 * Authentication constants
 * Session expiry, cookie names, and auth-related limits
 */

/** Session cookie name */
export const SESSION_COOKIE_NAME = 'sb-auth-token'

/** Session expiry in seconds (7 days) */
export const SESSION_EXPIRY_SECONDS = 7 * 24 * 60 * 60

/** Minimum password length (DB-enforced) */
export const MIN_PASSWORD_LENGTH = 6

/** Maximum display name length */
export const MAX_DISPLAY_NAME_LENGTH = 100

/** OAuth provider identifiers */
export const OAUTH_PROVIDERS = ['google', 'github'] as const
export type OAuthProvider = (typeof OAUTH_PROVIDERS)[number]
