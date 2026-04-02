export type FrequencyType = 'daily' | 'weekly' | 'custom'

export interface Habit {
  id: string
  user_id: string
  name: string
  icon: string
  color: string
  frequency_type: FrequencyType
  frequency_days: number[]
  created_at: string
  archived_at: string | null
}

export interface HabitCheckIn {
  id: string
  habit_id: string
  user_id: string
  checked_at: string
  xp_earned: number
}

export interface HabitWithStats extends Habit {
  currentStreak: number
  longestStreak: number
  completedToday: boolean
  completedThisWeek: number
  totalCheckIns: number
}
