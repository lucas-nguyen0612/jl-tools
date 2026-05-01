/**
 * Habits Zustand store
 * Manages client-side UI state — mutations go through actions.ts
 */
import { create } from 'zustand'
import type { HabitWithStatus } from './types'

type HabitsState = {
  /** Habits due/checkable today */
  todayHabits: HabitWithStatus[]
  /** Currently selected habit for detail/edit view */
  selectedHabitId: string | null
  /** Optimistic update queue — habit IDs currently being checked in */
  optimisticCheckinIds: Set<string>
}

type HabitsActions = {
  /** Load today's habits into the store */
  setTodayHabits: (habits: HabitWithStatus[]) => void
  /** Mark a habit as selected */
  selectHabit: (id: string | null) => void
  /** Optimistically mark a habit as checked in */
  optimisticCheckIn: (id: string) => void
  /** Rollback optimistic check-in (on error) */
  rollbackCheckIn: (id: string) => void
  /** Confirm optimistic check-in and update state */
  confirmCheckIn: (id: string, checked: boolean) => void
  /** Reset store to initial state */
  reset: () => void
}

type HabitsStore = HabitsState & HabitsActions

const initialState: HabitsState = {
  todayHabits: [],
  selectedHabitId: null,
  optimisticCheckinIds: new Set(),
}

export const useHabitsStore = create<HabitsStore>((set) => ({
  ...initialState,

  setTodayHabits: (habits) => set({ todayHabits: habits }),

  selectHabit: (id) => set({ selectedHabitId: id }),

  optimisticCheckIn: (id) =>
    set(state => ({
      optimisticCheckinIds: new Set([...state.optimisticCheckinIds, id]),
      todayHabits: state.todayHabits.map(h =>
        h.id === id ? { ...h, checked_today: true } : h
      ),
    })),

  rollbackCheckIn: (id) =>
    set(state => {
      const next = new Set(state.optimisticCheckinIds)
      next.delete(id)
      return {
        optimisticCheckinIds: next,
        todayHabits: state.todayHabits.map(h =>
          h.id === id ? { ...h, checked_today: false } : h
        ),
      }
    }),

  confirmCheckIn: (id, checked) =>
    set(state => {
      const next = new Set(state.optimisticCheckinIds)
      next.delete(id)
      return {
        optimisticCheckinIds: next,
        todayHabits: state.todayHabits.map(h =>
          h.id === id ? { ...h, checked_today: checked } : h
        ),
      }
    }),

  reset: () => set(initialState),
}))
