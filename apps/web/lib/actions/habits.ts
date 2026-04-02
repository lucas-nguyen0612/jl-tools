'use server'

import { createServerSupabase } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import type { FrequencyType } from '@/types/habit'

export type HabitResult = { success: boolean; error: string | null }

export async function createHabit(
  _prevState: HabitResult,
  formData: FormData,
): Promise<HabitResult> {
  const supabase = await createServerSupabase()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Unauthorized' }

  const name = (formData.get('name') as string)?.trim()
  if (!name) return { success: false, error: 'Name is required' }

  const icon = (formData.get('icon') as string) || '📌'
  const color = (formData.get('color') as string) || '#6366f1'
  const frequencyType = (formData.get('frequencyType') as FrequencyType) || 'daily'

  // Parse frequency_days (JSON array)
  let frequencyDays: number[] = []
  const daysStr = formData.get('frequencyDays') as string
  if (daysStr) {
    try {
      frequencyDays = JSON.parse(daysStr)
    } catch {
      frequencyDays = []
    }
  }

  const { error } = await supabase.from('habits').insert({
    user_id: user.id,
    name,
    icon,
    color,
    frequency_type: frequencyType,
    frequency_days: frequencyDays,
  })

  if (error) return { success: false, error: error.message }
  return { success: true, error: null }
}

export async function updateHabit(
  _prevState: HabitResult,
  formData: FormData,
): Promise<HabitResult> {
  const supabase = await createServerSupabase()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Unauthorized' }

  const habitId = formData.get('habitId') as string
  if (!habitId) return { success: false, error: 'Habit ID required' }

  const name = (formData.get('name') as string)?.trim()
  if (!name) return { success: false, error: 'Name is required' }

  const icon = (formData.get('icon') as string) || '📌'
  const color = (formData.get('color') as string) || '#6366f1'
  const frequencyType = (formData.get('frequencyType') as FrequencyType) || 'daily'

  let frequencyDays: number[] = []
  const daysStr = formData.get('frequencyDays') as string
  if (daysStr) {
    try {
      frequencyDays = JSON.parse(daysStr)
    } catch {
      frequencyDays = []
    }
  }

  const { error } = await supabase
    .from('habits')
    .update({ name, icon, color, frequency_type: frequencyType, frequency_days: frequencyDays })
    .eq('id', habitId)
    .eq('user_id', user.id)

  if (error) return { success: false, error: error.message }
  return { success: true, error: null }
}

export async function archiveHabit(habitId: string): Promise<HabitResult> {
  const supabase = await createServerSupabase()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Unauthorized' }

  const { error } = await supabase
    .from('habits')
    .update({ archived_at: new Date().toISOString() })
    .eq('id', habitId)
    .eq('user_id', user.id)

  if (error) return { success: false, error: error.message }
  return { success: true, error: null }
}

export async function restoreHabit(habitId: string): Promise<HabitResult> {
  const supabase = await createServerSupabase()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Unauthorized' }

  const { error } = await supabase
    .from('habits')
    .update({ archived_at: null })
    .eq('id', habitId)
    .eq('user_id', user.id)

  if (error) return { success: false, error: error.message }
  return { success: true, error: null }
}

export async function deleteHabitForever(habitId: string): Promise<HabitResult> {
  const supabase = await createServerSupabase()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Unauthorized' }

  const { error } = await supabase.from('habits').delete().eq('id', habitId).eq('user_id', user.id)

  if (error) return { success: false, error: error.message }
  return { success: true, error: null }
}
