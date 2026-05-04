import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import {
  XP_PER_POMODORO_BASE,
  XP_PER_POMODORO_CLEAN_BONUS,
  MIN_POMODORO_DURATION_MINUTES,
  MAX_POMODORO_DURATION_MINUTES,
} from '@/features/pomodoro/constants'

type AwardXpRow = {
  xp_awarded: number
  leveled_up: boolean
  new_level: number
  old_level: number
}

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = (await req.json().catch(() => null)) as {
    taskId?: string | null
    durationMinutes?: number
    interruptions?: number
  } | null
  if (!body) return NextResponse.json({ error: 'Bad request' }, { status: 400 })

  // Sanitize untrusted client input. The client is allowed to be wrong (or
  // malicious); the server decides what gets persisted and what XP is awarded.
  const rawDuration = Number(body.durationMinutes)
  if (!Number.isFinite(rawDuration) || !Number.isInteger(rawDuration)) {
    return NextResponse.json({ error: 'durationMinutes must be an integer' }, { status: 400 })
  }
  const durationMinutes = Math.max(
    MIN_POMODORO_DURATION_MINUTES,
    Math.min(MAX_POMODORO_DURATION_MINUTES, rawDuration)
  )

  const interruptions = Math.max(0, Math.min(1000, Math.trunc(Number(body.interruptions) || 0)))
  // Derive isClean server-side; never trust client's claim that they were uninterrupted.
  const isClean = interruptions === 0

  const taskId = typeof body.taskId === 'string' && body.taskId.length > 0 ? body.taskId : null

  if (taskId) {
    const { data: ownedTask } = await (supabase as unknown as {
      from: (t: string) => {
        select: (c: string) => {
          eq: (k: string, v: string) => {
            eq: (k: string, v: string) => {
              maybeSingle: () => Promise<{ data: { id: string } | null }>
            }
          }
        }
      }
    })
      .from('pomodoro_tasks')
      .select('id')
      .eq('id', taskId)
      .eq('user_id', user.id)
      .maybeSingle()
    if (!ownedTask) {
      return NextResponse.json({ error: 'taskId not owned by user' }, { status: 403 })
    }
  }

  const xpAwarded =
    XP_PER_POMODORO_BASE + (isClean ? XP_PER_POMODORO_CLEAN_BONUS : 0)

  const completedAt = new Date()
  const startedAt = new Date(completedAt.getTime() - durationMinutes * 60 * 1000)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: sessionRow, error: insertError } = await (supabase as any)
    .from('pomodoro_sessions')
    .insert({
      user_id: user.id,
      task_id: taskId,
      started_at: startedAt.toISOString(),
      completed_at: completedAt.toISOString(),
      duration_minutes: durationMinutes,
      interruptions,
      is_clean: isClean,
      xp_awarded: xpAwarded,
    })
    .select('id')
    .single()

  if (insertError || !sessionRow) {
    console.error('[pomodoro] insert session failed', insertError)
    return NextResponse.json({ error: 'Failed to record session' }, { status: 500 })
  }

  // Mirror completed_pomodoros so reloads see accurate per-task counts.
  // (character_stats counters are mirrored by trigger trg_pomodoro_session_mirror_stats.)
  if (taskId) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: taskRow } = await (supabase as any)
      .from('pomodoro_tasks')
      .select('completed_pomodoros')
      .eq('id', taskId)
      .eq('user_id', user.id)
      .maybeSingle()
    if (taskRow) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase as any)
        .from('pomodoro_tasks')
        .update({ completed_pomodoros: (taskRow.completed_pomodoros ?? 0) + 1 })
        .eq('id', taskId)
        .eq('user_id', user.id)
    }
  }

  // award_xp signature (see migration 00017): (p_user_id, p_amount, p_source, p_source_id, p_description)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: xpResult, error: xpError } = await (supabase as any).rpc('award_xp', {
    p_user_id: user.id,
    p_amount: xpAwarded,
    p_source: 'pomodoro',
    p_source_id: sessionRow.id,
    p_description: `Pomodoro complete (${durationMinutes}m${isClean ? ', clean' : ''})`,
  })

  let leveledUp = false
  if (xpError) {
    // The session row is recorded and counters mirrored, but XP/level didn't move.
    // Surface the failure rather than silently telling the client it succeeded.
    console.error('[pomodoro] award_xp failed', xpError)
  } else {
    // award_xp returns a setof; PostgREST gives us an array.
    const row = Array.isArray(xpResult) ? (xpResult[0] as AwardXpRow | undefined) : (xpResult as AwardXpRow | null)
    leveledUp = row?.leveled_up ?? false
  }

  revalidatePath('/dashboard')

  return NextResponse.json({
    success: true,
    xpAwarded: xpError ? 0 : xpAwarded,
    leveledUp,
    xpError: xpError ? xpError.message : undefined,
  })
}

export async function GET(req: NextRequest) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const from =
    searchParams.get('from') ??
    new Date(Date.now() - 14 * 86400000).toISOString()
  const to = searchParams.get('to') ?? new Date().toISOString()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: sessions } = await (supabase as any)
    .from('pomodoro_sessions')
    .select('*')
    .eq('user_id', user.id)
    .gte('started_at', from)
    .lte('started_at', to)
    .order('started_at', { ascending: false })

  return NextResponse.json({ sessions: sessions ?? [] })
}
