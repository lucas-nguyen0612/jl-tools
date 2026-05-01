// ============================================================
// Core types (match database.ts exactly)
// ============================================================

export type Habit = {
  id: string
  user_id: string
  name: string
  category: string        // 'health' | 'fitness' | 'learning' | 'productivity' | 'mindfulness' | 'other'
  time_of_day: string     // 'morning' | 'afternoon' | 'evening' | 'anytime'
  color: string           // hex color
  target_days: number[]   // weekdays 0=Sun..6=Sat; EMPTY array means every day (daily)
  reminder_time: string | null  // 'HH:MM' or null
  current_streak: number
  longest_streak: number
  last_completed_date: string | null  // YYYY-MM-DD
  is_archived: boolean
  sort_order: number
  created_at: string
  updated_at: string
}

export type HabitCompletion = {
  id: string
  habit_id: string
  user_id: string
  completed_date: string  // YYYY-MM-DD
  created_at: string
}

export type HabitNote = {
  id: string
  user_id: string
  note_date: string   // YYYY-MM-DD
  content: string
  mood: number | null
  created_at: string
  updated_at: string
}

export type HabitWithStatus = Habit & {
  checked_today: boolean
  checked_yesterday: boolean
  week_completions: string[]   // YYYY-MM-DD dates in past 7 days
  completion?: HabitCompletion
}

export type StreakTier = 'cold' | 'warm' | 'hot' | 'blazing'

export const STREAK_TIERS: Record<StreakTier, { min: number; label: string }> = {
  cold:    { min: 0,  label: 'cold' },
  warm:    { min: 3,  label: 'warm' },
  hot:     { min: 7,  label: 'hot' },
  blazing: { min: 30, label: 'blazing' },
}

export function getStreakTier(days: number): StreakTier {
  if (days < 0) return 'cold'
  if (days >= 30) return 'blazing'
  if (days >= 7)  return 'hot'
  if (days >= 3)  return 'warm'
  return 'cold'
}

// ============================================================
// Form types
// ============================================================

export type HabitCategory = 'health' | 'fitness' | 'learning' | 'productivity' | 'mindfulness' | 'other'
export type HabitTimeOfDay = 'morning' | 'afternoon' | 'evening' | 'anytime'

export type HabitFormValues = {
  name: string
  category: HabitCategory
  time_of_day: HabitTimeOfDay
  color: string
  target_days?: number[]   // empty = daily (all days); optional to match zod .default([])
  reminder_time?: string | null
}

// ============================================================
// Category and time options
// ============================================================

export const HABIT_CATEGORIES = [
  { value: 'health', label: 'Health' },
  { value: 'fitness', label: 'Fitness' },
  { value: 'learning', label: 'Learning' },
  { value: 'productivity', label: 'Productivity' },
  { value: 'mindfulness', label: 'Mindfulness' },
  { value: 'other', label: 'Other' },
] as const

export const TIME_OF_DAY_OPTIONS = [
  { value: 'morning', label: 'Morning' },
  { value: 'afternoon', label: 'Afternoon' },
  { value: 'evening', label: 'Evening' },
  { value: 'anytime', label: 'Anytime' },
] as const

// ============================================================
// Toggle result
// ============================================================

export type ToggleResult = {
  checked: boolean
  xpAwarded: number
  allDoneBonus: boolean
  milestoneXp?: number
  error?: string
}
