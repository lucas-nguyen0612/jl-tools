// Supabase-generated types will be placed here after running:
// pnpm db:types
// For now, define the base types manually.

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string | null
          display_name: string | null
          avatar_url: string | null
          locale: string
          theme: 'light' | 'dark' | 'system'
          current_xp: number
          current_level: number
          total_xp_earned: number
          pomodoro_settings: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email?: string | null
          display_name?: string | null
          avatar_url?: string | null
          locale?: string
          theme?: 'light' | 'dark' | 'system'
          current_xp?: number
          current_level?: number
          total_xp_earned?: number
          pomodoro_settings?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string | null
          display_name?: string | null
          avatar_url?: string | null
          locale?: string
          theme?: 'light' | 'dark' | 'system'
          current_xp?: number
          current_level?: number
          total_xp_earned?: number
          pomodoro_settings?: Json | null
          created_at?: string
          updated_at?: string
        }
      }
      xp_transactions: {
        Row: {
          id: string
          user_id: string
          amount: number
          source: 'pomodoro' | 'habit' | 'streak_bonus' | 'manual'
          source_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          amount: number
          source: 'pomodoro' | 'habit' | 'streak_bonus' | 'manual'
          source_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          amount?: number
          source?: 'pomodoro' | 'habit' | 'streak_bonus' | 'manual'
          source_id?: string | null
          created_at?: string
        }
      }
      pomodoro_sessions: {
        Row: {
          id: string
          user_id: string
          label: string | null
          duration_minutes: number
          status: 'completed' | 'cancelled' | 'in_progress'
          started_at: string
          completed_at: string | null
          xp_earned: number
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          label?: string | null
          duration_minutes: number
          status?: 'completed' | 'cancelled' | 'in_progress'
          started_at?: string
          completed_at?: string | null
          xp_earned?: number
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          label?: string | null
          duration_minutes?: number
          status?: 'completed' | 'cancelled' | 'in_progress'
          started_at?: string
          completed_at?: string | null
          xp_earned?: number
          created_at?: string
        }
      }
      pomodoro_labels: {
        Row: {
          id: string
          user_id: string
          name: string
          color: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          color: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          color?: string
          created_at?: string
        }
      }
      habits: {
        Row: {
          id: string
          user_id: string
          name: string
          icon: string
          color: string
          frequency_type: 'daily' | 'weekly' | 'custom'
          frequency_days: number[] | null
          created_at: string
          archived_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          icon?: string
          color?: string
          frequency_type?: 'daily' | 'weekly' | 'custom'
          frequency_days?: number[] | null
          created_at?: string
          archived_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          icon?: string
          color?: string
          frequency_type?: 'daily' | 'weekly' | 'custom'
          frequency_days?: number[] | null
          created_at?: string
          archived_at?: string | null
        }
      }
      habit_check_ins: {
        Row: {
          id: string
          habit_id: string
          user_id: string
          checked_at: string
          xp_earned: number
        }
        Insert: {
          id?: string
          habit_id: string
          user_id: string
          checked_at?: string
          xp_earned?: number
        }
        Update: {
          id?: string
          habit_id?: string
          user_id?: string
          checked_at?: string
          xp_earned?: number
        }
      }
    }
  }
}

// Convenience types
export type Profile = Database['public']['Tables']['profiles']['Row']
export type XpTransaction = Database['public']['Tables']['xp_transactions']['Row']
export type PomodoroSession = Database['public']['Tables']['pomodoro_sessions']['Row']
export type PomodoroLabel = Database['public']['Tables']['pomodoro_labels']['Row']
export type Habit = Database['public']['Tables']['habits']['Row']
export type HabitCheckIn = Database['public']['Tables']['habit_check_ins']['Row']

export type Locale = 'vi' | 'en'
export type Theme = 'light' | 'dark' | 'system'

export interface PomodoroSettings {
  focusDuration: number // minutes
  shortBreakDuration: number
  longBreakDuration: number
  sessionsBeforeLongBreak: number
}

export const DEFAULT_POMODORO_SETTINGS: PomodoroSettings = {
  focusDuration: 25,
  shortBreakDuration: 5,
  longBreakDuration: 15,
  sessionsBeforeLongBreak: 4,
}
