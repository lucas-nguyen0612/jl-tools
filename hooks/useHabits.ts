'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useHabitsStore } from '@/features/habits/store'
import { habitsKeys } from '@/features/habits/keys'
import { fetchHabitsWithStatus, fetchHeatmapData } from '@/features/habits/queries'
import {
  createHabit,
  updateHabit,
  archiveHabit,
  toggleHabitCompletion,
  getHabitNote,
  upsertHabitNote,
} from '@/features/habits/actions'
import type { HabitFormValues, HabitWithStatus } from '@/features/habits/types'

export function useHabitsQuery(userId: string) {
  const setTodayHabits = useHabitsStore(s => s.setTodayHabits)

  return useQuery({
    queryKey: habitsKeys.withStatus(userId),
    queryFn: async () => {
      const habits = await fetchHabitsWithStatus(userId)
      setTodayHabits(habits)
      return habits
    },
    staleTime: 30_000,
    enabled: !!userId,
  })
}

export function useHeatmapQuery(userId: string) {
  return useQuery({
    queryKey: habitsKeys.heatmap(userId),
    queryFn: () => fetchHeatmapData(userId),
    staleTime: 5 * 60_000,
    enabled: !!userId,
  })
}

export function useToggleHabit(userId: string) {
  const queryClient = useQueryClient()
  const { optimisticCheckIn, rollbackCheckIn, confirmCheckIn } = useHabitsStore()

  return useMutation({
    mutationFn: ({
      habitId,
      date,
    }: {
      habitId: string
      date: string
    }) => toggleHabitCompletion(habitId, userId, date),

    onMutate: async ({ habitId, date }) => {
      const today = new Date().toLocaleDateString('sv-SE')
      const isToday = date === today
      await queryClient.cancelQueries({ queryKey: habitsKeys.withStatus(userId) })
      const previous = queryClient.getQueryData<HabitWithStatus[]>(habitsKeys.withStatus(userId))
      if (isToday) {
        // Update TanStack Query cache so HabitCard shows the change immediately
        queryClient.setQueryData<HabitWithStatus[]>(
          habitsKeys.withStatus(userId),
          (old) => old?.map(h => h.id === habitId ? { ...h, checked_today: !h.checked_today } : h) ?? []
        )
        optimisticCheckIn(habitId)
      }
      return { previous, isToday }
    },

    onError: (_err, { habitId }, context) => {
      if (context?.previous) {
        queryClient.setQueryData(habitsKeys.withStatus(userId), context.previous)
      }
      if (context?.isToday) rollbackCheckIn(habitId)
    },

    onSuccess: (result, { habitId, date }) => {
      const today = new Date().toLocaleDateString('sv-SE')
      if (date === today) confirmCheckIn(habitId, result.checked)
      queryClient.invalidateQueries({ queryKey: habitsKeys.withStatus(userId) })
      queryClient.invalidateQueries({ queryKey: habitsKeys.heatmap(userId) })
    },
  })
}

export function useCreateHabit(userId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: HabitFormValues) => createHabit(userId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: habitsKeys.withStatus(userId) })
    },
  })
}

export function useUpdateHabit(userId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ habitId, data }: { habitId: string; data: Partial<HabitFormValues> }) =>
      updateHabit(habitId, userId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: habitsKeys.withStatus(userId) })
    },
  })
}

export function useArchiveHabit(userId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (habitId: string) => archiveHabit(habitId, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: habitsKeys.withStatus(userId) })
    },
  })
}

export function useHabitNoteQuery(userId: string, date: string) {
  return useQuery({
    queryKey: habitsKeys.note(userId, date),
    queryFn: () => getHabitNote(userId, date),
    staleTime: 60_000,
    enabled: !!userId && !!date,
  })
}

export function useUpsertHabitNote(userId: string, date: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ content, mood }: { content: string; mood?: number | null }) =>
      upsertHabitNote(userId, date, content, mood),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: habitsKeys.note(userId, date) })
    },
  })
}
