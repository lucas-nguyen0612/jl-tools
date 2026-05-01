export type Tier = 'common' | 'uncommon' | 'rare' | 'legendary' | 'mythic'

export interface CharacterStats {
  id: string
  user_id: string
  level: number
  total_xp: number
  xp_in_current_level: number
  focus_stat: number
  discipline_stat: number
  knowledge_stat: number
  endurance_stat: number
  total_pomodoros: number
  total_focus_minutes: number
  total_habits_completed: number
  total_cards_reviewed: number
  current_streak: number
  longest_streak: number
  last_activity_date: string | null
  last_badges_seen_at: string | null
  last_level_seen: number | null
  created_at: string
  updated_at: string
}

export interface XPTransaction {
  id: string
  user_id: string
  amount: number
  source: 'pomodoro' | 'habit' | 'flashcard' | 'quest' | 'streak' | 'bonus'
  source_id: string | null
  description: string
  created_at: string
}

export interface Badge {
  id: string
  slug: string
  name: string
  description: string
  icon: string
  rarity: Tier
  condition_type: string
  condition_value: number
  created_at: string
}

export interface UserBadge {
  id: string
  user_id: string
  badge_id: string
  earned_at: string
  badge?: Badge
}

export interface LevelThreshold {
  level: number
  xp_required: number
  unlock_feature: string | null
}

export interface Quest {
  id: string
  slug: string
  name: string
  description: string
  quest_type: 'daily' | 'weekly'
  tool: 'pomodoro' | 'habit' | 'flashcard' | 'any'
  target_value: number
  xp_reward: number
  is_active: boolean
}

export interface UserQuest {
  id: string
  user_id: string
  quest_id: string
  current_value: number
  is_completed: boolean
  assigned_date: string
  completed_at: string | null
  quest?: Quest
}

export interface Profile {
  id: string
  username: string
  character_name: string
  character_class: string
  goals: string[]
  first_tool: string | null
  onboarding_completed: boolean
  preferred_theme: string
  accent_hue: number
  timezone: string
  created_at: string
  updated_at: string
}
