'use server'

/**
 * Auth Server Action wrappers
 * All mutations go through these actions — never call Supabase directly from components
 */

import { createClient } from '@/lib/supabase/server'
import { clearThemeCookie } from '@/lib/settings/theme-cookie'
import { revalidatePath } from 'next/cache'

/**
 * Sign the current user out, clearing theme cookies first to prevent
 * cross-user theme leaks on shared devices (spec-4 deferred-work item).
 */
export async function signOut(): Promise<void> {
  const supabase = await createClient()
  // Clear theme cookies BEFORE signOut so the next user on this device
  // sees the default theme rather than the previous user's preference.
  await clearThemeCookie()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
}
