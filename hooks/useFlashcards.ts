'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  fetchDecks,
  createDeck,
  updateDeck,
  deleteDeck,
  fetchDeckCards,
  createCard,
  updateCard,
  deleteCard,
  fetchDueCards,
  submitReviewBatch,
  fetchRetentionStats,
  fetchAllDueCount,
} from '@/features/flashcards/actions'
import type { Deck, FlashCard, ReviewResult } from '@/features/flashcards/types'

// ──────────────────────────────────────────────────────────────────────────────
// Query key factory
// ──────────────────────────────────────────────────────────────────────────────

export const flashcardKeys = {
  all: ['flashcards'] as const,
  decks: () => [...flashcardKeys.all, 'decks'] as const,
  deck: (id: string) => [...flashcardKeys.all, 'deck', id] as const,
  cards: (deckId: string) => [...flashcardKeys.all, 'cards', deckId] as const,
  due: (deckId: string) => [...flashcardKeys.all, 'due', deckId] as const,
  retention: (deckId: string) => [...flashcardKeys.all, 'retention', deckId] as const,
  allDue: () => [...flashcardKeys.all, 'allDue'] as const,
}

// ──────────────────────────────────────────────────────────────────────────────
// Deck queries & mutations
// ──────────────────────────────────────────────────────────────────────────────

export function useDecks() {
  return useQuery({
    queryKey: flashcardKeys.decks(),
    queryFn: async () => {
      const result = await fetchDecks()
      if (result.error) throw new Error(result.error.message)
      return result.data
    },
    staleTime: 30_000,
  })
}

export function useCreateDeck() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: { name: string; description?: string; color: string }) => {
      const result = await createDeck(data)
      if (result.error) throw new Error(result.error.message)
      return result.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: flashcardKeys.decks() })
    },
  })
}

export function useUpdateDeck() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Pick<Deck, 'name' | 'description' | 'color'>> }) => {
      const result = await updateDeck(id, data)
      if (result.error) throw new Error(result.error.message)
      return result.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: flashcardKeys.decks() })
    },
  })
}

export function useDeleteDeck() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const result = await deleteDeck(id)
      if (result.error) throw new Error(result.error.message)
      return result.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: flashcardKeys.decks() })
    },
  })
}

// ──────────────────────────────────────────────────────────────────────────────
// Card queries & mutations
// ──────────────────────────────────────────────────────────────────────────────

export function useDeckCards(deckId: string) {
  return useQuery({
    queryKey: flashcardKeys.cards(deckId),
    queryFn: async () => {
      const result = await fetchDeckCards(deckId)
      if (result.error) throw new Error(result.error.message)
      return result.data
    },
    staleTime: 30_000,
    enabled: !!deckId,
  })
}

export function useCreateCard() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: { deck_id: string; front: string; back: string; tags?: string[] }) => {
      const result = await createCard(data)
      if (result.error) throw new Error(result.error.message)
      return result.data
    },
    onSuccess: (_result, variables) => {
      queryClient.invalidateQueries({ queryKey: flashcardKeys.cards(variables.deck_id) })
      queryClient.invalidateQueries({ queryKey: flashcardKeys.due(variables.deck_id) })
      queryClient.invalidateQueries({ queryKey: flashcardKeys.decks() })
    },
  })
}

export function useUpdateCard() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string
      data: Partial<Pick<FlashCard, 'front' | 'back' | 'tags'>>
      deckId: string
    }) => {
      const result = await updateCard(id, data)
      if (result.error) throw new Error(result.error.message)
      return result.data
    },
    onSuccess: (_result, variables) => {
      queryClient.invalidateQueries({ queryKey: flashcardKeys.cards(variables.deckId) })
    },
  })
}

export function useDeleteCard() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id }: { id: string; deckId: string }) => {
      const result = await deleteCard(id)
      if (result.error) throw new Error(result.error.message)
      return result.data
    },
    onSuccess: (_result, variables) => {
      queryClient.invalidateQueries({ queryKey: flashcardKeys.cards(variables.deckId) })
      queryClient.invalidateQueries({ queryKey: flashcardKeys.due(variables.deckId) })
      queryClient.invalidateQueries({ queryKey: flashcardKeys.decks() })
    },
  })
}

export function useDueCards(deckId: string) {
  return useQuery({
    queryKey: flashcardKeys.due(deckId),
    queryFn: async () => {
      const result = await fetchDueCards(deckId)
      if (result.error) throw new Error(result.error.message)
      return result.data
    },
    staleTime: 60_000,
    enabled: !!deckId,
  })
}

export function useRetentionStats(deckId: string | null) {
  return useQuery({
    queryKey: flashcardKeys.retention(deckId ?? ''),
    queryFn: async () => {
      const result = await fetchRetentionStats(deckId as string)
      if (result.error) throw new Error(result.error.message)
      return result.data
    },
    staleTime: 60_000,
    enabled: !!deckId,
  })
}

export function useAllDueCount() {
  return useQuery({
    queryKey: flashcardKeys.allDue(),
    queryFn: async () => {
      const result = await fetchAllDueCount()
      if (result.error) throw new Error(result.error.message)
      return result.data
    },
    staleTime: 30_000,
  })
}

export function useSubmitReview() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (results: ReviewResult[]) => {
      const result = await submitReviewBatch(results)
      if (result.error) throw new Error(result.error.message)
      return result.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: flashcardKeys.decks() })
      queryClient.invalidateQueries({ queryKey: flashcardKeys.all })
    },
  })
}
