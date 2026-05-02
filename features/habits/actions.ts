'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { format, subDays } from 'date-fns'
import { XP_VALUES } from '@/lib/xp/constants'
import type { Habit, HabitCompletion, HabitFormValues, HabitNote, ToggleResult } from './types'
import { syncHabitCalendarEvent } from '@/features/calendar/habits-sync'

export async function createHabit(
  userId: string,
  data: HabitFormValues
): Promise<{ id: string } | { error: string }> {
  const supabase = await createClient()

  // Check habit limit (max 10)
  const { count } = await (supabase
    .from('habits')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('is_archived', false) as unknown as Promise<{ count: number | null }>)

  if ((count ?? 0) >= 10) {
    return { error: 'Maximum 10 habits allowed' }
  }

  // Get next sort_order
  const { data: maxSort } = await (supabase
    .from('habits')
    .select('sort_order')
    .eq('user_id', userId)
    .order('sort_order', { ascending: false })
    .limit(1)
    .single() as unknown as Promise<{ data: Pick<Habit, 'sort_order'> | null }>)

  const sortOrder = (maxSort?.sort_order ?? -1) + 1

  const { data: habit, error } = await (supabase
    .from('habits')
    .insert({
      user_id: userId,
      name: data.name.trim(),
      category: data.category,
      time_of_day: data.time_of_day,
      color: data.color,
      target_days: data.target_days ?? [],
      reminder_time: data.reminder_time ?? null,
      sort_order: sortOrder,
    } as never)
    .select('id')
    .single() as unknown as Promise<{ data: Pick<Habit, 'id'> | null; error: { message: string } | null }>)

  if (error) return { error: error.message }
  revalidatePath('/habits')
  return { id: habit!.id }
}

export async function updateHabit(
  habitId: string,
  userId: string,
  data: Partial<HabitFormValues>
): Promise<{ error?: string }> {
  const supabase = await createClient()

  const updatePayload: Partial<Habit> = {}
  if (data.name) updatePayload.name = data.name.trim()
  if (data.category) updatePayload.category = data.category
  if (data.time_of_day) updatePayload.time_of_day = data.time_of_day
  if (data.color) updatePayload.color = data.color
  if (data.target_days !== undefined) updatePayload.target_days = data.target_days
  if (data.reminder_time !== undefined) updatePayload.reminder_time = data.reminder_time

  const { error } = await (supabase
    .from('habits')
    .update(updatePayload as never)
    .eq('id', habitId)
    .eq('user_id', userId) as unknown as Promise<{ error: { message: string } | null }>)

  if (error) return { error: error.message }
  revalidatePath('/habits')
  return {}
}

export async function archiveHabit(
  habitId: string,
  userId: string
): Promise<{ error?: string }> {
  const supabase = await createClient()

  const { error } = await (supabase
    .from('habits')
    .update({ is_archived: true } as never)
    .eq('id', habitId)
    .eq('user_id', userId) as unknown as Promise<{ error: { message: string } | null }>)

  if (error) return { error: error.message }
  revalidatePath('/habits')
  return {}
}

export async function toggleHabitCompletion(
  habitId: string,
  userId: string,
  date: string  // YYYY-MM-DD in user's local timezone
): Promise<ToggleResult> {
  const supabase = await createClient()

  // Check if already completed today
  const { data: existing } = await (supabase
    .from('habit_completions')
    .select('id')
    .eq('habit_id', habitId)
    .eq('user_id', userId)
    .eq('completed_date', date)
    .single() as unknown as Promise<{ data: Pick<HabitCompletion, 'id'> | null }>)

  if (existing) {
    const [{ error: deleteError }, { data: habitMeta }] = await Promise.all([
      supabase.from('habit_completions').delete().eq('id', existing.id) as unknown as Promise<{ error: { message: string } | null }>,
      supabase.from('habits').select('name, color').eq('id', habitId).single() as unknown as Promise<{ data: Pick<Habit, 'name' | 'color'> | null }>,
    ])

    if (deleteError) return { checked: true, xpAwarded: 0, allDoneBonus: false, error: deleteError.message }

    if (habitMeta) {
      void syncHabitCalendarEvent({
        userId,
        habitId,
        habitName: habitMeta.name,
        habitColor: habitMeta.color,
        date,
        checked: false,
      }).catch(() => {})
    }

    revalidatePath('/habits')
    revalidatePath('/dashboard')
    return { checked: false, xpAwarded: 0, allDoneBonus: false }
  }

  // Read habit streak BEFORE inserting so we can predict the milestone for the notification.
  // The DB trigger (trg_habit_completion_streak) handles the actual streak update and XP award;
  // we must NOT update habits or insert xp_transactions here to avoid duplicate work.
  const { data: habitBefore } = await (supabase
    .from('habits')
    .select('current_streak, last_completed_date, name, color')
    .eq('id', habitId)
    .single() as unknown as Promise<{ data: Pick<Habit, 'current_streak' | 'last_completed_date' | 'name' | 'color'> | null }>)

  const STREAK_MILESTONE_XP: Record<number, number> = { 7: 50, 14: 100, 30: 200 }
  let milestoneXp = 0
  if (habitBefore) {
    const prevDate = format(subDays(new Date(date), 1), 'yyyy-MM-dd')
    const wasConsecutive = habitBefore.last_completed_date === prevDate
    const newStreak = wasConsecutive ? habitBefore.current_streak + 1 : 1
    milestoneXp = STREAK_MILESTONE_XP[newStreak] ?? 0
  }

  // Insert completion — DB trigger handles streak update, XP award, and character_stats
  const { error: insertError } = await (supabase
    .from('habit_completions')
    .insert({ habit_id: habitId, user_id: userId, completed_date: date } as never) as unknown as Promise<{ error: { message: string } | null }>)

  if (insertError) return { checked: false, xpAwarded: 0, allDoneBonus: false, error: insertError.message }

  if (habitBefore) {
    void syncHabitCalendarEvent({
      userId,
      habitId,
      habitName: habitBefore.name,
      habitColor: habitBefore.color,
      date,
      checked: true,
    }).catch(() => {})
  }

  // Check if all habits done today → bonus XP
  const { data: allHabits } = await (supabase
    .from('habits')
    .select('id')
    .eq('user_id', userId)
    .eq('is_archived', false) as unknown as Promise<{ data: Pick<Habit, 'id'>[] | null }>)

  const { data: todayCompletions } = await (supabase
    .from('habit_completions')
    .select('habit_id')
    .eq('user_id', userId)
    .eq('completed_date', date) as unknown as Promise<{ data: Pick<HabitCompletion, 'habit_id'>[] | null }>)

  const allDone =
    allHabits &&
    todayCompletions &&
    allHabits.length > 0 &&
    allHabits.every(h => todayCompletions.some(c => c.habit_id === h.id))

  if (allDone) {
    await (supabase.from('xp_transactions').insert({
      user_id: userId,
      amount: XP_VALUES.HABIT_ALL_DONE_BONUS,
      source: 'bonus',
      source_id: null,
      description: 'All habits done today!',
    } as never) as unknown as Promise<unknown>)
  }

  revalidatePath('/habits')
  revalidatePath('/dashboard')
  return {
    checked: true,
    xpAwarded: XP_VALUES.HABIT_CHECKIN + (allDone ? XP_VALUES.HABIT_ALL_DONE_BONUS : 0),
    allDoneBonus: !!allDone,
    milestoneXp: milestoneXp || undefined,
  }
}

export async function getHabitNote(
  userId: string,
  date: string
): Promise<{ content: string; mood: number | null } | null> {
  const supabase = await createClient()
  const { data } = await (supabase
    .from('habit_notes')
    .select('content, mood')
    .eq('user_id', userId)
    .eq('note_date', date)
    .maybeSingle() as unknown as Promise<{ data: Pick<HabitNote, 'content' | 'mood'> | null }>)
  return data ?? null
}

export async function upsertHabitNote(
  userId: string,
  date: string,
  content: string,
  mood?: number | null
): Promise<{ error?: string }> {
  const supabase = await createClient()

  // Treat empty content as "delete the note" so we don't keep stale rows
  if (content.trim() === '') {
    const { error } = await (supabase
      .from('habit_notes')
      .delete()
      .eq('user_id', userId)
      .eq('note_date', date) as unknown as Promise<{ error: { message: string } | null }>)
    if (error) return { error: error.message }
    return {}
  }

  const { error } = await (supabase
    .from('habit_notes')
    .upsert(
      {
        user_id: userId,
        note_date: date,
        content,
        mood: mood ?? null,
      } as never,
      { onConflict: 'user_id,note_date' }
    ) as unknown as Promise<{ error: { message: string } | null }>)

  if (error) return { error: error.message }
  return {}
}

export async function reorderHabits(
  userId: string,
  habitIds: string[]
): Promise<{ error?: string }> {
  const supabase = await createClient()

  const updates = habitIds.map((id, index) =>
    supabase
      .from('habits')
      .update({ sort_order: index } as never)
      .eq('id', id)
      .eq('user_id', userId) as unknown as Promise<unknown>
  )

  await Promise.all(updates)
  revalidatePath('/habits')
  return {}
}
