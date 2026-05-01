import type { Rating } from '@/lib/sm2/algorithm'

export type { Rating }

export interface Deck {
  id: string
  user_id: string
  name: string
  description: string | null
  color: string
  card_count: number
  due_count: number
  new_count: number
  created_at: string
}

export interface FlashCard {
  id: string
  deck_id: string
  front: string
  back: string
  tags: string[]
  ease_factor: number
  interval: number
  repetitions: number
  due_date: string
  state: 'new' | 'learning' | 'young' | 'mature'
}

export interface ReviewResult {
  card_id: string
  rating: Rating
  reviewed_at: string
}

export interface SessionSummary {
  total: number
  again: number
  hard: number
  good: number
  easy: number
  xpEarned: number
  xpFromServer: number | null
  sessionBonus: number
  failedCount: number
  retentionRate: number
}
