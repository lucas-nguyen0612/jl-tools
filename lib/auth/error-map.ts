import type { AuthError } from '@supabase/supabase-js'

/**
 * Map a Supabase auth error to a translation key under `errors.auth.*`.
 *
 * Contract:
 * - Returns a key string (e.g. `'errors.auth.invalidCredentials'`).
 * - It does NOT return a translated message — caller must do `t(mapAuthError(err))`
 *   using `useTranslations()` / `getTranslations()`.
 * - Prefers `error.code` (stable across SDK versions); falls back to message
 *   matching only when code is missing (older SDKs / edge cases).
 *
 * Extending: add new code branches here. Keep the returned key in sync with
 * `errors.auth.*` in `messages/en.json` + `messages/vi.json`. Story 6.2 adds the
 * keys this mapper currently emits — adding a new code without adding a key
 * will surface as the raw key in the UI.
 *
 * @example
 * const { error } = await supabase.auth.signInWithPassword({ email, password })
 * if (error) {
 *   const t = useTranslations()
 *   setErrorMsg(t(mapAuthError(error)))
 * }
 */
export type AuthErrorKey =
  | 'errors.auth.invalidCredentials'
  | 'errors.auth.emailNotConfirmed'
  | 'errors.auth.weakPassword'
  | 'errors.auth.otpExpired'
  | 'errors.auth.otpInvalid'
  | 'errors.auth.rateLimit'
  | 'errors.auth.sessionExpired'
  | 'errors.auth.networkError'
  | 'errors.auth.unknown'

export function mapAuthError(
  error: AuthError | { message?: string; code?: string; status?: number },
): AuthErrorKey {
  const code = 'code' in error ? error.code : undefined
  const message = ('message' in error ? error.message : '') ?? ''
  const status = 'status' in error ? error.status : undefined

  // Prefer code-based matching (stable across SDK versions).
  switch (code) {
    case 'invalid_credentials':
      return 'errors.auth.invalidCredentials'
    case 'email_not_confirmed':
      return 'errors.auth.emailNotConfirmed'
    case 'weak_password':
      return 'errors.auth.weakPassword'
    case 'otp_expired':
      return 'errors.auth.otpExpired'
    case 'otp_invalid':
    case 'otp_disabled':
      return 'errors.auth.otpInvalid'
    case 'over_email_send_rate_limit':
    case 'over_request_rate_limit':
    case 'too_many_requests':
      return 'errors.auth.rateLimit'
    case 'session_not_found':
    case 'session_expired':
      return 'errors.auth.sessionExpired'
  }

  // HTTP status fallbacks (rate limiting / network).
  if (status === 429) return 'errors.auth.rateLimit'

  // Last-resort message matching for older Supabase SDKs that don't surface code.
  // Keep this list short — code-based matching is preferred.
  if (message === 'Email not confirmed') return 'errors.auth.emailNotConfirmed'
  if (message === 'Invalid login credentials') return 'errors.auth.invalidCredentials'
  if (/network/i.test(message) || /fetch/i.test(message)) return 'errors.auth.networkError'

  return 'errors.auth.unknown'
}
