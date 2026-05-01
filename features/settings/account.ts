'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { clearThemeCookie } from '@/lib/settings/theme-cookie'
import {
  emailUpdateSchema,
  passwordUpdateSchema,
  deleteAccountSchema,
  type EmailUpdateInput,
  type PasswordUpdateInput,
  type DeleteAccountInput,
} from '@/features/settings/account-schemas'

type ActionResult<T> =
  | { data: T; error: null }
  | { data: null; error: { message: string; code: string } }

/**
 * Request a Supabase email-change confirmation link.
 * The new email is NOT live until the user clicks the link.
 * Returns { confirmation_sent: true } — UI must say "Check your inbox".
 */
export async function updateEmail(
  input: EmailUpdateInput
): Promise<ActionResult<{ confirmation_sent: true }>> {
  const parsed = emailUpdateSchema.safeParse(input)
  if (!parsed.success) {
    const message = parsed.error.issues[0]?.message ?? 'Invalid email'
    return { data: null, error: { message, code: 'VALIDATION_ERROR' } }
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { data: null, error: { message: 'Unauthorized', code: 'AUTH_REQUIRED' } }
  }

  if (parsed.data.new_email === user.email) {
    return {
      data: null,
      error: { message: 'New email must differ from current email', code: 'SAME_EMAIL' },
    }
  }

  const { error } = await supabase.auth.updateUser({ email: parsed.data.new_email })
  if (error) {
    return { data: null, error: { message: error.message, code: 'AUTH_ERROR' } }
  }

  return { data: { confirmation_sent: true }, error: null }
}

/**
 * Change the authenticated user's password.
 * Re-authenticates with the current password first — Supabase's updateUser
 * does not enforce the old password server-side, so we must check it ourselves.
 */
export async function updatePassword(
  input: PasswordUpdateInput
): Promise<ActionResult<void>> {
  const parsed = passwordUpdateSchema.safeParse(input)
  if (!parsed.success) {
    const message = parsed.error.issues[0]?.message ?? 'Invalid input'
    return { data: null, error: { message, code: 'VALIDATION_ERROR' } }
  }

  // Get the current user's email for re-auth
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user?.email) {
    return { data: null, error: { message: 'Unauthorized', code: 'AUTH_REQUIRED' } }
  }

  // Re-auth with current password
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: user.email,
    password: parsed.data.current_password,
  })
  if (signInError) {
    return {
      data: null,
      error: { message: 'Current password is incorrect', code: 'INVALID_CREDENTIALS' },
    }
  }

  // Now update the password
  const { error: updateError } = await supabase.auth.updateUser({
    password: parsed.data.new_password,
  })
  if (updateError) {
    return { data: null, error: { message: updateError.message, code: 'AUTH_ERROR' } }
  }

  return { data: undefined, error: null }
}

/**
 * Permanently delete the authenticated user's account.
 * Order: re-auth → verify display name → admin.deleteUser
 *   → clearThemeCookie → signOut → revalidatePath
 */
export async function deleteAccount(
  input: DeleteAccountInput
): Promise<ActionResult<void>> {
  const parsed = deleteAccountSchema.safeParse(input)
  if (!parsed.success) {
    const message = parsed.error.issues[0]?.message ?? 'Invalid input'
    return { data: null, error: { message, code: 'VALIDATION_ERROR' } }
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user?.email) {
    return { data: null, error: { message: 'Unauthorized', code: 'AUTH_REQUIRED' } }
  }

  // Verify display name matches profiles.character_name
  // (cast required: supabase type inference falls through to never on this schema version)
  const profileRes = await (supabase
    .from('profiles')
    .select('character_name')
    .eq('user_id', user.id)
    .single() as unknown as Promise<{
      data: { character_name: string } | null
      error: { message: string } | null
    }>)

  if (profileRes.error || !profileRes.data) {
    return { data: null, error: { message: 'Could not fetch profile', code: 'DB_ERROR' } }
  }

  const profile = profileRes.data

  if (parsed.data.character_name_confirm !== profile.character_name) {
    return {
      data: null,
      error: {
        message: 'Display name does not match',
        code: 'DISPLAY_NAME_MISMATCH',
      },
    }
  }

  // Re-auth with current password
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: user.email,
    password: parsed.data.password,
  })
  if (signInError) {
    return {
      data: null,
      error: { message: 'Password is incorrect', code: 'INVALID_CREDENTIALS' },
    }
  }

  // Privileged delete via service role (bypasses RLS, cascades FK rows)
  const { createAdminClient } = await import('@/lib/supabase/admin')
  const adminClient = createAdminClient()
  const { error: deleteError } = await adminClient.auth.admin.deleteUser(user.id)
  if (deleteError) {
    return { data: null, error: { message: deleteError.message, code: 'DELETE_ERROR' } }
  }

  // Clear theme cookies and sign out
  await clearThemeCookie()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')

  return { data: undefined, error: null }
}
