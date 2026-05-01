import { create } from 'zustand'
import { emitAppEvent } from '@/lib/events'

interface UserState {
  level: number
  totalXP: number
  xpInCurrentLevel: number
  maxXPInLevel: number
  characterName: string
  userId: string | null

  setProfile: (data: {
    level: number
    totalXP: number
    xpInCurrentLevel: number
    maxXPInLevel: number
    characterName: string
    userId: string
  }) => void

  addXP: (amount: number) => void
}

export const useUserStore = create<UserState>((set) => ({
  level: 1,
  totalXP: 0,
  xpInCurrentLevel: 0,
  maxXPInLevel: 300,
  characterName: 'Adventurer',
  userId: null,

  setProfile: (data) => set(data),

  addXP: (amount) => {
    set(state => ({
      totalXP: state.totalXP + amount,
      xpInCurrentLevel: state.xpInCurrentLevel + amount,
    }))

    // Dispatch XP gain event for overlay animation
    emitAppEvent('jl:xp-gain', { amount })
  },
}))
