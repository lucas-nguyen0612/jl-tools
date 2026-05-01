import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { taskId, durationMinutes, interruptions, isClean } = body

  const xpAwarded = 10 + (isClean ? 5 : 0)

  // Insert session record — eslint-disable-next-line @typescript-eslint/no-explicit-any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (supabase as any).from('pomodoro_sessions').insert({
    user_id: user.id,
    task_id: taskId ?? null,
    started_at: new Date(Date.now() - durationMinutes * 60 * 1000).toISOString(),
    completed_at: new Date().toISOString(),
    duration_minutes: durationMinutes,
    interruptions: interruptions ?? 0,
    is_clean: isClean ?? false,
    xp_awarded: xpAwarded,
  })

  // Mirror the client-side completed_pomodoros bump so reloads see accurate counts.
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

  // Award XP via RPC — cast because generated types may not include this function yet
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: xpResult } = await (supabase as any).rpc('award_xp', {
    p_user_id: user.id,
    p_source: 'pomodoro_complete',
    p_amount: xpAwarded,
    p_metadata: { task_id: taskId, is_clean: isClean },
  })

  const leveledUp = (xpResult as { leveled_up?: boolean } | null)?.leveled_up ?? false

  revalidatePath('/dashboard')

  return NextResponse.json({ success: true, xpAwarded, leveledUp })
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
