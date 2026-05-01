// Placeholder types — regenerate with: supabase gen types typescript --local > src/types/database.ts

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
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
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: Partial<Database['public']['Tables']['profiles']['Row']> & { id: string }
        Update: Partial<Database['public']['Tables']['profiles']['Row']>
      }
      character_stats: {
        Row: {
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
        Insert: Partial<Database['public']['Tables']['character_stats']['Row']> & { user_id: string }
        Update: Partial<Database['public']['Tables']['character_stats']['Row']>
      }
      pomodoro_settings: {
        Row: {
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
          created_at: string
          updated_at: string
        }
        Insert: Partial<Database['public']['Tables']['pomodoro_settings']['Row']> & { user_id: string }
        Update: Partial<Database['public']['Tables']['pomodoro_settings']['Row']>
      }
      pomodoro_tasks: {
        Row: {
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
        Insert: Omit<Database['public']['Tables']['pomodoro_tasks']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['pomodoro_tasks']['Row']>
      }
      pomodoro_soundscapes: {
        Row: {
          id: string
          user_id: string
          name: string
          storage_path: string
          file_url: string
          file_size_bytes: number
          mime_type: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['pomodoro_soundscapes']['Row'], 'id' | 'created_at'> & { id?: string }
        Update: Partial<Database['public']['Tables']['pomodoro_soundscapes']['Row']>
      }
      pomodoro_sessions: {
        Row: {
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
        Insert: Omit<Database['public']['Tables']['pomodoro_sessions']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['pomodoro_sessions']['Row']>
      }
      habits: {
        Row: {
          id: string
          user_id: string
          name: string
          category: string
          time_of_day: string
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
        Insert: Omit<Database['public']['Tables']['habits']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['habits']['Row']>
      }
      habit_completions: {
        Row: {
          id: string
          habit_id: string
          user_id: string
          completed_date: string
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['habit_completions']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['habit_completions']['Row']>
      }
      habit_notes: {
        Row: {
          id: string
          user_id: string
          note_date: string
          content: string
          mood: number | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['habit_notes']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['habit_notes']['Row']>
      }
      flashcard_decks: {
        Row: {
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
        Insert: Omit<Database['public']['Tables']['flashcard_decks']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['flashcard_decks']['Row']>
      }
      flashcard_cards: {
        Row: {
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
          state: string
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['flashcard_cards']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['flashcard_cards']['Row']>
      }
      flashcard_reviews: {
        Row: {
          id: string
          card_id: string
          user_id: string
          deck_id: string
          rating: number
          ease_factor_before: number
          interval_before: number
          ease_factor_after: number
          interval_after: number
          xp_awarded: number
          reviewed_at: string
        }
        Insert: Omit<Database['public']['Tables']['flashcard_reviews']['Row'], 'id'>
        Update: Partial<Database['public']['Tables']['flashcard_reviews']['Row']>
      }
      xp_transactions: {
        Row: {
          id: string
          user_id: string
          amount: number
          source: string
          source_id: string | null
          description: string
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['xp_transactions']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['xp_transactions']['Row']>
      }
      badges: {
        Row: {
          id: string
          slug: string
          name: string
          description: string
          icon: string
          rarity: string
          condition_type: string
          condition_value: number
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['badges']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['badges']['Row']>
      }
      user_badges: {
        Row: {
          id: string
          user_id: string
          badge_id: string
          earned_at: string
        }
        Insert: Omit<Database['public']['Tables']['user_badges']['Row'], 'id'>
        Update: Partial<Database['public']['Tables']['user_badges']['Row']>
      }
      quests: {
        Row: {
          id: string
          slug: string
          name: string
          description: string
          quest_type: string
          tool: string
          target_value: number
          xp_reward: number
          is_active: boolean
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['quests']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['quests']['Row']>
      }
      user_quests: {
        Row: {
          id: string
          user_id: string
          quest_id: string
          current_value: number
          is_completed: boolean
          assigned_date: string
          completed_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['user_quests']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['user_quests']['Row']>
      }
      unlockables: {
        Row: {
          id: string
          slug: string
          name: string
          description: string
          unlock_type: string
          unlock_value: number | null
          category: string
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['unlockables']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['unlockables']['Row']>
      }
      user_unlockables: {
        Row: {
          id: string
          user_id: string
          unlockable_id: string
          unlocked_at: string
        }
        Insert: Omit<Database['public']['Tables']['user_unlockables']['Row'], 'id'>
        Update: Partial<Database['public']['Tables']['user_unlockables']['Row']>
      }
      level_thresholds: {
        Row: {
          level: number
          xp_required: number
          unlock_feature: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['level_thresholds']['Row'], 'created_at'>
        Update: Partial<Database['public']['Tables']['level_thresholds']['Row']>
      }
      user_preferences: {
        Row: {
          user_id: string
          appearance_settings: { theme: 'light' | 'dark' | 'system'; accent_hue: number }
          notification_settings: {
            pomodoro_sound: boolean
            pomodoro_volume: number
            habit_reminders_enabled: boolean
          }
          created_at: string
          updated_at: string
        }
        Insert: {
          user_id: string
          appearance_settings?: { theme: 'light' | 'dark' | 'system'; accent_hue: number }
          notification_settings?: {
            pomodoro_sound: boolean
            pomodoro_volume: number
            habit_reminders_enabled: boolean
          }
          created_at?: string
          updated_at?: string
        }
        Update: {
          user_id?: string
          appearance_settings?: { theme: 'light' | 'dark' | 'system'; accent_hue: number }
          notification_settings?: {
            pomodoro_sound: boolean
            pomodoro_volume: number
            habit_reminders_enabled: boolean
          }
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: Record<string, never>
    Functions: {
      award_xp: {
        Args: { p_user_id: string; p_amount: number; p_source: string; p_source_id: string | null; p_description: string }
        Returns: { xp_awarded: number; leveled_up: boolean; new_level: number; old_level: number }[]
      }
      apply_sm2: {
        Args: { p_user_id: string; p_card_id: string; p_rating: number }
        Returns: { xp_awarded: number; new_interval: number; new_ease_factor: number; leveled_up: boolean }[]
      }
      search_user_content: {
        Args: { p_user_id: string; p_query: string }
        Returns: { type: string; id: string; label: string; sublabel: string | null }[]
      }
    }
    Enums: Record<string, never>
  }
}
