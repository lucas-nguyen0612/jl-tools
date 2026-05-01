'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { XP_VALUES } from '@/lib/xp/constants'
import { SESSION_BONUS_THRESHOLD } from './constants'
import type { Deck, FlashCard, ReviewResult } from './types'

type ActionResult<T> =
  | { data: T; error: null }
  | { data: null; error: { message: string; code: string } }

// ──────────────────────────────────────────────────────────────────────────────
// Deck Actions
// ──────────────────────────────────────────────────────────────────────────────

export async function fetchDecks(): Promise<ActionResult<Deck[]>> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { data: null, error: { message: 'Unauthorized', code: 'AUTH_REQUIRED' } }

  const { data: deckRows, error } = await (supabase
    .from('flashcard_decks')
    .select('id, user_id, name, description, color, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: true }) as unknown as Promise<{
      data: Array<Omit<Deck, 'card_count' | 'due_count' | 'new_count'>> | null
      error: { message: string } | null
    }>)

  if (error) return { data: null, error: { message: error.message, code: 'FETCH_ERROR' } }
  const rows = deckRows ?? []
  if (rows.length === 0) return { data: [], error: null }

  // Compute counts on-the-fly from flashcard_cards (denormalised columns on
  // flashcard_decks are not kept in sync — and due_count is time-dependent).
  const { data: cardRows } = await (supabase
    .from('flashcard_cards')
    .select('deck_id, state, due_at')
    .eq('user_id', user.id)
    .in('deck_id', rows.map(r => r.id)) as unknown as Promise<{
      data: Array<{ deck_id: string; state: string; due_at: string }> | null
    }>)

  const now = new Date().toISOString()
  const counts = new Map<string, { card_count: number; new_count: number; due_count: number }>()
  for (const r of rows) counts.set(r.id, { card_count: 0, new_count: 0, due_count: 0 })
  for (const c of cardRows ?? []) {
    const slot = counts.get(c.deck_id)
    if (!slot) continue
    slot.card_count += 1
    if (c.state === 'new') slot.new_count += 1
    if (c.due_at <= now) slot.due_count += 1
  }

  const decks: Deck[] = rows.map(r => ({ ...r, ...counts.get(r.id)! }))
  return { data: decks, error: null }
}

export async function createDeck(input: {
  name: string
  description?: string
  color: string
}): Promise<ActionResult<Deck>> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { data: null, error: { message: 'Unauthorized', code: 'AUTH_REQUIRED' } }

  const { data, error } = await (supabase
    .from('flashcard_decks')
    .insert({
      user_id: user.id,
      name: input.name.trim(),
      description: input.description?.trim() ?? null,
      color: input.color,
      card_count: 0,
      due_count: 0,
      new_count: 0,
      is_public: false,
    } as never)
    .select('id, user_id, name, description, color, card_count, due_count, new_count, created_at')
    .single() as unknown as Promise<{
      data: Deck | null
      error: { message: string } | null
    }>)

  if (error) return { data: null, error: { message: error.message, code: 'CREATE_ERROR' } }
  revalidatePath('/flashcards')
  return { data: data!, error: null }
}

export async function updateDeck(
  id: string,
  input: Partial<Pick<Deck, 'name' | 'description' | 'color'>>
): Promise<ActionResult<Deck>> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { data: null, error: { message: 'Unauthorized', code: 'AUTH_REQUIRED' } }

  const payload: Record<string, unknown> = {}
  if (input.name !== undefined) payload.name = input.name.trim()
  if (input.description !== undefined) payload.description = input.description?.trim() ?? null
  if (input.color !== undefined) payload.color = input.color

  const { data, error } = await (supabase
    .from('flashcard_decks')
    .update(payload as never)
    .eq('id', id)
    .eq('user_id', user.id)
    .select('id, user_id, name, description, color, card_count, due_count, new_count, created_at')
    .single() as unknown as Promise<{
      data: Deck | null
      error: { message: string } | null
    }>)

  if (error) return { data: null, error: { message: error.message, code: 'UPDATE_ERROR' } }
  revalidatePath('/flashcards')
  return { data: data!, error: null }
}

export async function deleteDeck(id: string): Promise<ActionResult<null>> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { data: null, error: { message: 'Unauthorized', code: 'AUTH_REQUIRED' } }

  const { error } = await (supabase
    .from('flashcard_decks')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id) as unknown as Promise<{
      error: { message: string } | null
    }>)

  if (error) return { data: null, error: { message: error.message, code: 'DELETE_ERROR' } }
  revalidatePath('/flashcards')
  return { data: null, error: null }
}

// ──────────────────────────────────────────────────────────────────────────────
// Card Actions
// ──────────────────────────────────────────────────────────────────────────────

function mapCardRow(row: {
  id: string
  deck_id: string
  front: string
  back: string
  tags: string[]
  ease_factor: number
  interval: number
  repetitions: number
  due_at: string
  state: string
}): FlashCard {
  return {
    id: row.id,
    deck_id: row.deck_id,
    front: row.front,
    back: row.back,
    tags: row.tags ?? [],
    ease_factor: row.ease_factor,
    interval: row.interval,
    repetitions: row.repetitions,
    due_date: row.due_at,
    state: (row.state as FlashCard['state']) || 'new',
  }
}

export async function fetchDeckCards(deckId: string): Promise<ActionResult<FlashCard[]>> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { data: null, error: { message: 'Unauthorized', code: 'AUTH_REQUIRED' } }

  const { data, error } = await (supabase
    .from('flashcard_cards')
    .select('id, deck_id, front, back, tags, ease_factor, interval, repetitions, due_at, state')
    .eq('deck_id', deckId)
    .eq('user_id', user.id)
    .order('created_at', { ascending: true }) as unknown as Promise<{
      data: Array<{
        id: string; deck_id: string; front: string; back: string
        tags: string[]; ease_factor: number; interval: number
        repetitions: number; due_at: string; state: string
      }> | null
      error: { message: string } | null
    }>)

  if (error) return { data: null, error: { message: error.message, code: 'FETCH_ERROR' } }
  return { data: (data ?? []).map(mapCardRow), error: null }
}

export async function createCard(input: {
  deck_id: string
  front: string
  back: string
  tags?: string[]
}): Promise<ActionResult<FlashCard>> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { data: null, error: { message: 'Unauthorized', code: 'AUTH_REQUIRED' } }

  const now = new Date().toISOString()

  const { data, error } = await (supabase
    .from('flashcard_cards')
    .insert({
      deck_id: input.deck_id,
      user_id: user.id,
      front: input.front.trim(),
      back: input.back.trim(),
      tags: input.tags ?? [],
      ease_factor: 2.5,
      interval: 0,
      repetitions: 0,
      due_at: now,
      state: 'new',
    } as never)
    .select('id, deck_id, front, back, tags, ease_factor, interval, repetitions, due_at, state')
    .single() as unknown as Promise<{
      data: {
        id: string; deck_id: string; front: string; back: string
        tags: string[]; ease_factor: number; interval: number
        repetitions: number; due_at: string; state: string
      } | null
      error: { message: string } | null
    }>)

  if (error) return { data: null, error: { message: error.message, code: 'CREATE_ERROR' } }
  revalidatePath(`/flashcards/${input.deck_id}`)
  return { data: mapCardRow(data!), error: null }
}

export async function updateCard(
  id: string,
  input: Partial<Pick<FlashCard, 'front' | 'back' | 'tags'>>
): Promise<ActionResult<FlashCard>> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { data: null, error: { message: 'Unauthorized', code: 'AUTH_REQUIRED' } }

  const payload: Record<string, unknown> = {}
  if (input.front !== undefined) payload.front = input.front.trim()
  if (input.back !== undefined) payload.back = input.back.trim()
  if (input.tags !== undefined) payload.tags = input.tags

  const { data, error } = await (supabase
    .from('flashcard_cards')
    .update(payload as never)
    .eq('id', id)
    .eq('user_id', user.id)
    .select('id, deck_id, front, back, tags, ease_factor, interval, repetitions, due_at, state')
    .single() as unknown as Promise<{
      data: {
        id: string; deck_id: string; front: string; back: string
        tags: string[]; ease_factor: number; interval: number
        repetitions: number; due_at: string; state: string
      } | null
      error: { message: string } | null
    }>)

  if (error) return { data: null, error: { message: error.message, code: 'UPDATE_ERROR' } }
  return { data: mapCardRow(data!), error: null }
}

export async function deleteCard(id: string): Promise<ActionResult<null>> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { data: null, error: { message: 'Unauthorized', code: 'AUTH_REQUIRED' } }

  const { error } = await (supabase
    .from('flashcard_cards')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id) as unknown as Promise<{
      error: { message: string } | null
    }>)

  if (error) return { data: null, error: { message: error.message, code: 'DELETE_ERROR' } }
  return { data: null, error: null }
}

export async function fetchDueCards(deckId: string): Promise<ActionResult<FlashCard[]>> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { data: null, error: { message: 'Unauthorized', code: 'AUTH_REQUIRED' } }

  const now = new Date().toISOString()

  const { data, error } = await (supabase
    .from('flashcard_cards')
    .select('id, deck_id, front, back, tags, ease_factor, interval, repetitions, due_at, state')
    .eq('deck_id', deckId)
    .eq('user_id', user.id)
    .lte('due_at', now)
    .order('due_at', { ascending: true }) as unknown as Promise<{
      data: Array<{
        id: string; deck_id: string; front: string; back: string
        tags: string[]; ease_factor: number; interval: number
        repetitions: number; due_at: string; state: string
      }> | null
      error: { message: string } | null
    }>)

  if (error) return { data: null, error: { message: error.message, code: 'FETCH_ERROR' } }
  return { data: (data ?? []).map(mapCardRow), error: null }
}

export async function fetchAllDueCards(): Promise<ActionResult<FlashCard[]>> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { data: null, error: { message: 'Unauthorized', code: 'AUTH_REQUIRED' } }

  const now = new Date().toISOString()

  const { data, error } = await (supabase
    .from('flashcard_cards')
    .select('id, deck_id, front, back, tags, ease_factor, interval, repetitions, due_at, state')
    .eq('user_id', user.id)
    .lte('due_at', now)
    .order('due_at', { ascending: true }) as unknown as Promise<{
      data: Array<{
        id: string; deck_id: string; front: string; back: string
        tags: string[]; ease_factor: number; interval: number
        repetitions: number; due_at: string; state: string
      }> | null
      error: { message: string } | null
    }>)

  if (error) return { data: null, error: { message: error.message, code: 'FETCH_ERROR' } }
  return { data: (data ?? []).map(mapCardRow), error: null }
}

// ──────────────────────────────────────────────────────────────────────────────
// Review batch
// ──────────────────────────────────────────────────────────────────────────────

export async function submitReviewBatch(
  results: ReviewResult[]
): Promise<ActionResult<{
  xpAwarded: number
  cardsReviewed: number
  sessionBonusAwarded: number
  failed: Array<{ cardId: string; message: string }>
}>> {
  if (results.length === 0) {
    return {
      data: { xpAwarded: 0, cardsReviewed: 0, sessionBonusAwarded: 0, failed: [] },
      error: null,
    }
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { data: null, error: { message: 'Unauthorized', code: 'AUTH_REQUIRED' } }

  let totalXp = 0
  let cardsReviewed = 0
  let sessionBonusAwarded = 0
  const failed: Array<{ cardId: string; message: string }> = []

  for (const result of results) {
    const { data, error } = await (supabase as unknown as {
      rpc: (fn: string, args: Record<string, unknown>) => Promise<{
        data: Array<{ xp_awarded: number; new_interval: number; new_ease_factor: number; leveled_up: boolean }> | null
        error: { message: string } | null
      }>
    }).rpc('apply_sm2', {
      p_user_id: user.id,
      p_card_id: result.card_id,
      p_rating: result.rating,
    })
    if (error) {
      failed.push({ cardId: result.card_id, message: error.message })
      continue
    }
    const row = data?.[0]
    if (!row) {
      failed.push({ cardId: result.card_id, message: 'Empty RPC response' })
      continue
    }
    totalXp += row.xp_awarded ?? 0
    cardsReviewed += 1
  }

  if (cardsReviewed >= SESSION_BONUS_THRESHOLD) {
    const { error } = await (supabase as unknown as {
      rpc: (fn: string, args: Record<string, unknown>) => Promise<{ error: { message: string } | null }>
    }).rpc('award_xp', {
      p_user_id: user.id,
      p_amount: XP_VALUES.FLASHCARD_SESSION_BONUS,
      p_source: 'flashcard_session_bonus',
      p_source_id: null,
      p_description: `Session bonus: reviewed ${cardsReviewed} cards`,
    })
    if (!error) {
      totalXp += XP_VALUES.FLASHCARD_SESSION_BONUS
      sessionBonusAwarded = XP_VALUES.FLASHCARD_SESSION_BONUS
    }
  }

  revalidatePath('/flashcards')
  revalidatePath('/dashboard')
  return {
    data: { xpAwarded: totalXp, cardsReviewed, sessionBonusAwarded, failed },
    error: null,
  }
}

// ──────────────────────────────────────────────────────────────────────────────
// Stats / aggregates
// ──────────────────────────────────────────────────────────────────────────────

export async function fetchRetentionStats(
  deckId: string
): Promise<ActionResult<{
  youngRetentionPct: number | null
  matureRetentionPct: number | null
  sparklineData: number[]
  youngSampleSize: number
  matureSampleSize: number
  reviewDaysCovered: number
}>> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { data: null, error: { message: 'Unauthorized', code: 'AUTH_REQUIRED' } }

  // Pull last 7 days of reviews for the sparkline + all reviews for retention buckets.
  // We fetch only the fields needed and filter by deck + user.
  const { data, error } = await (supabase
    .from('flashcard_reviews')
    .select('rating, interval_after, reviewed_at')
    .eq('user_id', user.id)
    .eq('deck_id', deckId) as unknown as Promise<{
      data: Array<{ rating: number; interval_after: number; reviewed_at: string }> | null
      error: { message: string } | null
    }>)

  if (error) return { data: null, error: { message: error.message, code: 'FETCH_ERROR' } }

  const rows = data ?? []

  // Retention buckets
  let youngTotal = 0
  let youngPass = 0
  let matureTotal = 0
  let maturePass = 0

  for (const r of rows) {
    const passed = r.rating >= 2
    if (r.interval_after < 21) {
      youngTotal += 1
      if (passed) youngPass += 1
    } else {
      matureTotal += 1
      if (passed) maturePass += 1
    }
  }

  const youngRetentionPct = youngTotal === 0 ? null : Math.round((100 * youngPass) / youngTotal)
  const matureRetentionPct = matureTotal === 0 ? null : Math.round((100 * maturePass) / matureTotal)

  // Sparkline: 7 days, oldest → newest, carry-forward for days without reviews.
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const dayBuckets: Array<{ total: number; pass: number }> = Array.from({ length: 7 }, () => ({
    total: 0,
    pass: 0,
  }))

  const startMs = today.getTime() - 6 * 24 * 60 * 60 * 1000
  for (const r of rows) {
    const t = new Date(r.reviewed_at).getTime()
    if (Number.isNaN(t)) continue
    const dayStart = new Date(r.reviewed_at)
    dayStart.setHours(0, 0, 0, 0)
    const idx = Math.floor((dayStart.getTime() - startMs) / (24 * 60 * 60 * 1000))
    if (idx < 0 || idx > 6) continue
    dayBuckets[idx].total += 1
    if (r.rating >= 2) dayBuckets[idx].pass += 1
  }

  const sparklineData: number[] = []
  let last = 0
  for (const bucket of dayBuckets) {
    if (bucket.total === 0) {
      sparklineData.push(last)
    } else {
      const pct = Math.round((100 * bucket.pass) / bucket.total)
      sparklineData.push(pct)
      last = pct
    }
  }

  const reviewDaysCovered = dayBuckets.filter(b => b.total > 0).length

  return {
    data: {
      youngRetentionPct,
      matureRetentionPct,
      sparklineData,
      youngSampleSize: youngTotal,
      matureSampleSize: matureTotal,
      reviewDaysCovered,
    },
    error: null,
  }
}

export async function fetchAllDueCount(): Promise<
  ActionResult<{ totalDue: number; deckCount: number; totalDecks: number }>
> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { data: null, error: { message: 'Unauthorized', code: 'AUTH_REQUIRED' } }

  const { data: deckRows, error } = await (supabase
    .from('flashcard_decks')
    .select('id')
    .eq('user_id', user.id) as unknown as Promise<{
      data: Array<{ id: string }> | null
      error: { message: string } | null
    }>)

  if (error) return { data: null, error: { message: error.message, code: 'FETCH_ERROR' } }

  const totalDecks = (deckRows ?? []).length
  if (totalDecks === 0) {
    return { data: { totalDue: 0, deckCount: 0, totalDecks: 0 }, error: null }
  }

  // Compute on-the-fly from flashcard_cards (denormalised deck counters are stale).
  const now = new Date().toISOString()
  const { data: dueCards } = await (supabase
    .from('flashcard_cards')
    .select('deck_id')
    .eq('user_id', user.id)
    .lte('due_at', now) as unknown as Promise<{
      data: Array<{ deck_id: string }> | null
    }>)

  const perDeck = new Map<string, number>()
  for (const c of dueCards ?? []) {
    perDeck.set(c.deck_id, (perDeck.get(c.deck_id) ?? 0) + 1)
  }

  const totalDue = dueCards?.length ?? 0
  const deckCount = perDeck.size

  return { data: { totalDue, deckCount, totalDecks }, error: null }
}
