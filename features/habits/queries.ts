'use server'

import { createClient } from '@/lib/supabase/server'
import { subWeeks, subDays, startOfWeek, format } from 'date-fns'
import type { Habit, HabitCompletion, HabitWithStatus } from './types'

export async function fetchHabitsWithStatus(userId: string): Promise<HabitWithStatus[]> {
  const supabase = await createClient()
  const now = new Date()
  const today = format(now, 'yyyy-MM-dd')
  const yesterday = format(subDays(now, 1), 'yyyy-MM-dd')
  const weekStart = format(subDays(now, 6), 'yyyy-MM-dd')

  const [habitsRes, weekCompletionsRes] = await Promise.all([
    supabase
      .from('habits')
      .select('*')
      .eq('user_id', userId)
      .eq('is_archived', false)
      .order('sort_order', { ascending: true }) as unknown as Promise<{
        data: Habit[] | null
        error: { message: string } | null
      }>,
    supabase
      .from('habit_completions')
      .select('*')
      .eq('user_id', userId)
      .gte('completed_date', weekStart)
      .lte('completed_date', today) as unknown as Promise<{
        data: HabitCompletion[] | null
        error: { message: string } | null
      }>,
  ])

  if (habitsRes.error) throw new Error(habitsRes.error.message)
  const habits = habitsRes.data ?? []
  const allCompletions = weekCompletionsRes.data ?? []

  return habits.map(h => {
    const habitCompletions = allCompletions.filter(c => c.habit_id === h.id)
    const dates = habitCompletions.map(c => c.completed_date)
    const todayCompletion = habitCompletions.find(c => c.completed_date === today)
    return {
      ...h,
      checked_today: dates.includes(today),
      checked_yesterday: dates.includes(yesterday),
      week_completions: dates,
      completion: todayCompletion,
    }
  })
}

export async function fetchHeatmapData(userId: string): Promise<{ date: string; count: number }[]> {
  const supabase = await createClient()
  const today = new Date()
  const startDate = startOfWeek(subWeeks(today, 25), { weekStartsOn: 1 })
  const fromDate = format(startDate, 'yyyy-MM-dd')
  const toDate = format(today, 'yyyy-MM-dd')

  const { data, error } = await (supabase
    .from('habit_completions')
    .select('completed_date')
    .eq('user_id', userId)
    .gte('completed_date', fromDate)
    .lte('completed_date', toDate) as unknown as Promise<{
      data: Pick<HabitCompletion, 'completed_date'>[] | null
      error: { message: string } | null
    }>)

  if (error) throw new Error(error.message)

  const countMap: Record<string, number> = {}
  for (const row of data ?? []) {
    countMap[row.completed_date] = (countMap[row.completed_date] ?? 0) + 1
  }

  return Object.entries(countMap).map(([date, count]) => ({ date, count }))
}
