/**
 * Gamification (XP) Zustand store
 * Manages XP state — XP mutations go through actions.ts
 */
import { create } from 'zustand'
import type { LevelProgress, XpTransactionDetail } from './types'

type GamificationState = {
  /** Total XP accumulated by the user */
  totalXp: number
  /** Current level number */
  currentLevel: number
  /** Current level title (locale-dependent — filled in Epic 6) */
  levelTitle: string
  /** Progress within current level */
  levelProgress: LevelProgress | null
  /** Recent XP transactions (last 10) */
  recentTransactions: XpTransactionDetail[]
  /** Last XP gain amount (for animation — null if no recent gain) */
  recentGain: number | null
}

type GamificationActions = {
  /** Apply XP gain (called after a successful mutation) */
  applyXpGain: (amount: number) => void
  /** Set the full XP state (used after profile fetch) */
  setXpState: (state: Omit<GamificationState, 'recentGain'>) => void
  /** Clear recent gain (after animation plays) */
  clearRecentGain: () => void
  /** Reset store to initial state */
  reset: () => void
}

type GamificationStore = GamificationState & GamificationActions

const initialState: GamificationState = {
  totalXp: 0,
  currentLevel: 1,
  levelTitle: '',
  levelProgress: null,
  recentTransactions: [],
  recentGain: null,
}

export const useGamificationStore = create<GamificationStore>((set) => ({
  ...initialState,

  applyXpGain: (amount) =>
    set(state => ({
      totalXp: state.totalXp + amount,
      recentGain: amount,
    })),

  setXpState: (xpState) =>
    set({ ...xpState, recentGain: null }),

  clearRecentGain: () => set({ recentGain: null }),

  reset: () => set(initialState),
}))
