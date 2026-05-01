export interface PomodoroSettings {
  id: string
  user_id: string
  work_duration: number
  short_break: number
  long_break: number
  sessions_before_long_break: number
  auto_start_breaks: boolean
  auto_start_pomodoros: boolean
  soundscape: string
  soundscape_volume: number
  focus_blocker_enabled: boolean
  blocked_sites: string[]
}

export interface PomodoroTask {
  id: string
  user_id: string
  title: string
  estimated_pomodoros: number
  completed_pomodoros: number
  is_completed: boolean
  sort_order: number
  created_at: string
  updated_at: string
}

export interface PomodoroSession {
  id: string
  user_id: string
  task_id: string | null
  started_at: string
  completed_at: string
  duration_minutes: number
  interruptions: number
  is_clean: boolean
  xp_awarded: number
  created_at: string
}

export interface Habit {
  id: string
  user_id: string
  name: string
  category: 'health' | 'learning' | 'work' | 'social' | 'custom'
  time_of_day: 'morning' | 'afternoon' | 'evening' | 'anytime'
  color: string
  target_days: number[]
  reminder_time: string | null
  current_streak: number
  longest_streak: number
  last_completed_date: string | null
  is_archived: boolean
  sort_order: number
  created_at: string
  updated_at: string
}

export interface HabitCompletion {
  id: string
  habit_id: string
  user_id: string
  completed_date: string
  created_at: string
}

export interface FlashcardDeck {
  id: string
  user_id: string
  name: string
  description: string | null
  color: string
  is_public: boolean
  card_count: number
  due_count: number
  new_count: number
  created_at: string
  updated_at: string
}

export interface Flashcard {
  id: string
  deck_id: string
  user_id: string
  front: string
  back: string
  tags: string[]
  ease_factor: number
  interval: number
  repetitions: number
  due_at: string
  state: 'new' | 'learning' | 'young' | 'mature'
  created_at: string
  updated_at: string
}

export interface FlashcardReview {
  id: string
  card_id: string
  user_id: string
  deck_id: string
  rating: 0 | 1 | 2 | 3
  ease_factor_before: number
  interval_before: number
  ease_factor_after: number
  interval_after: number
  xp_awarded: number
  reviewed_at: string
}
