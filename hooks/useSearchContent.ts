'use client'

import { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'

export type SearchResultType = 'flashcard_deck' | 'habit' | 'pomodoro_task'

export type SearchResult = {
  type: SearchResultType
  id: string
  label: string
  sublabel: string | null
}

/**
 * Search across the current user's flashcard decks, habits, and pomodoro
 * tasks. Wraps the `search_user_content` Postgres function with a 300ms
 * debounce so we don't issue an RPC on every keystroke.
 *
 * `userId` is passed in from the server-rendered page so we don't have to
 * round-trip `auth.getUser()` from the browser. The RPC itself enforces that
 * `p_user_id === auth.uid()`.
 */
export function useSearchContent(query: string, userId: string) {
  const [debouncedQuery, setDebouncedQuery] = useState(query.trim())

  useEffect(() => {
    const trimmed = query.trim()
    const timeout = setTimeout(() => {
      setDebouncedQuery(trimmed)
    }, 300)
    return () => clearTimeout(timeout)
  }, [query])

  const { data, isLoading, error } = useQuery({
    queryKey: ['search', userId, debouncedQuery],
    enabled: debouncedQuery.length >= 1,
    staleTime: 30_000,
    queryFn: async (): Promise<SearchResult[]> => {
      const supabase = createClient()
      const { data, error } = await (supabase as unknown as {
        rpc: (
          fn: string,
          args: Record<string, unknown>
        ) => Promise<{
          data: Array<{
            type: string
            id: string
            label: string
            sublabel: string | null
          }> | null
          error: { message: string } | null
        }>
      }).rpc('search_user_content', {
        p_user_id: userId,
        p_query: debouncedQuery,
      })
      if (error) throw new Error(error.message)
      return (data ?? []).map(row => ({
        type: row.type as SearchResultType,
        id: row.id,
        label: row.label,
        sublabel: row.sublabel,
      }))
    },
  })

  return {
    results: data ?? [],
    isLoading: isLoading && debouncedQuery.length >= 1,
    error: error as Error | null,
    debouncedQuery,
  }
}
