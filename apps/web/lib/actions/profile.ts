'use server'

import { createServerSupabase } from '@/lib/supabase/server'

export type ProfileState = { success: boolean; error: string | null }

export async function updateProfile(
  _prevState: ProfileState,
  formData: FormData,
): Promise<ProfileState> {
  const supabase = await createServerSupabase()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'Not authenticated' }
  }

  const displayName = formData.get('displayName') as string
  const locale = formData.get('locale') as string
  const theme = formData.get('theme') as 'light' | 'dark' | 'system'
  const avatarUrl = formData.get('avatarUrl') as string
  const onboardingCompleted = formData.get('onboardingCompleted') as string

  const updates: Record<string, unknown> = {
    display_name: displayName,
    locale,
    theme,
  }

  if (avatarUrl) updates.avatar_url = avatarUrl
  if (onboardingCompleted === 'true') updates.onboarding_completed = true

  const { error } = await supabase.from('profiles').update(updates).eq('id', user.id)

  if (error) {
    return { success: false, error: error.message }
  }

  return { success: true, error: null }
}
