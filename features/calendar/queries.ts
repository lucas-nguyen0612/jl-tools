'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { listEvents, createEvent, updateEvent, deleteEvent } from './event-actions'
import { getCalendarConnectionStatus } from './auth-actions'
import type { CreateEventInput, UpdateEventInput } from './types'

export const calendarKeys = {
  all: ['calendar'] as const,
  events: (timeMin: string, timeMax: string) =>
    [...calendarKeys.all, 'events', timeMin, timeMax] as const,
}

export function useConnectionStatus() {
  return useQuery({
    queryKey: [...calendarKeys.all, 'connection-status'] as const,
    queryFn: getCalendarConnectionStatus,
    staleTime: 5 * 60 * 1000,
  })
}

export function useCalendarEvents(timeMin: string, timeMax: string) {
  return useQuery({
    queryKey: calendarKeys.events(timeMin, timeMax),
    queryFn: () => listEvents(timeMin, timeMax),
    staleTime: 5 * 60 * 1000,
    enabled: !!timeMin && !!timeMax,
  })
}

export function useCreateEvent() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: CreateEventInput) => createEvent(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: calendarKeys.all })
    },
  })
}

export function useUpdateEvent() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ eventId, input }: { eventId: string; input: UpdateEventInput }) =>
      updateEvent(eventId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: calendarKeys.all })
    },
  })
}

export function useDeleteEvent() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (eventId: string) => deleteEvent(eventId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: calendarKeys.all })
    },
  })
}
