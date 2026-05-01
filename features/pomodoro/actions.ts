'use server'

/**
 * Pomodoro server actions — source of truth is Supabase.
 * DB stores durations in MINUTES and volume as an INT (0-100).
 * Client uses SECONDS and a float (0-1). Conversions live in mappers below.
 */

import { createClient } from '@/lib/supabase/server'
import type { PomodoroSettings, PomodoroTask } from '@/store/pomodoroStore'

type DbTaskRow = {
  id: string
  user_id: string
  title: string
  estimated_pomodoros: number
  completed_pomodoros: number
  is_completed: boolean
  sort_order: number
  created_at: string
  updated_at: string
}

type DbSettingsRow = {
  id: string
  user_id: string
  work_duration: number
  short_break: number
  long_break: number
  sessions_before_long_break: number
  auto_start_breaks: boolean
  auto_start_pomodoros: boolean
  soundscape: string
  soundscape_volume: number
  focus_blocker_enabled: boolean
  blocked_sites: string[]
}

function taskFromDb(row: DbTaskRow): PomodoroTask {
  return {
    id: row.id,
    title: row.title,
    completed: row.is_completed,
    pomodorosDone: row.completed_pomodoros,
    pomodorosEstimated: row.estimated_pomodoros,
  }
}

function settingsFromDb(row: DbSettingsRow): PomodoroSettings {
  return {
    workDuration: row.work_duration * 60,
    shortDuration: row.short_break * 60,
    longDuration: row.long_break * 60,
    sessionsUntilLong: row.sessions_before_long_break,
    soundscape: row.soundscape,
    volume: row.soundscape_volume / 100,
    blockedSites: row.blocked_sites,
    focusBlockerEnabled: row.focus_blocker_enabled,
  }
}

function settingsToDb(s: Partial<PomodoroSettings>): Partial<DbSettingsRow> {
  const out: Partial<DbSettingsRow> = {}
  if (s.workDuration !== undefined) out.work_duration = Math.max(1, Math.round(s.workDuration / 60))
  if (s.shortDuration !== undefined) out.short_break = Math.max(1, Math.round(s.shortDuration / 60))
  if (s.longDuration !== undefined) out.long_break = Math.max(1, Math.round(s.longDuration / 60))
  if (s.sessionsUntilLong !== undefined) out.sessions_before_long_break = s.sessionsUntilLong
  if (s.soundscape !== undefined) out.soundscape = s.soundscape
  if (s.volume !== undefined) out.soundscape_volume = Math.round(s.volume * 100)
  if (s.blockedSites !== undefined) out.blocked_sites = s.blockedSites
  if (s.focusBlockerEnabled !== undefined) out.focus_blocker_enabled = s.focusBlockerEnabled
  return out
}

async function requireUserId(): Promise<string> {
  const supabase = await createClient()
  const { data } = await supabase.auth.getUser()
  if (!data.user) throw new Error('Unauthorized')
  return data.user.id
}

// ============================================================
// Tasks
// ============================================================

export async function listPomodoroTasks(): Promise<PomodoroTask[]> {
  const userId = await requireUserId()
  const supabase = await createClient()

  const { data, error } = await (supabase
    .from('pomodoro_tasks')
    .select('*')
    .eq('user_id', userId)
    .order('sort_order', { ascending: true }) as unknown as Promise<{
      data: DbTaskRow[] | null
      error: { message: string } | null
    }>)

  if (error) throw new Error(error.message)
  return (data ?? []).map(taskFromDb)
}

export async function createPomodoroTask(input: {
  id: string
  title: string
  estimatedPomodoros: number
}): Promise<{ error?: string }> {
  const userId = await requireUserId()
  const supabase = await createClient()

  const { data: maxRow } = await (supabase
    .from('pomodoro_tasks')
    .select('sort_order')
    .eq('user_id', userId)
    .order('sort_order', { ascending: false })
    .limit(1)
    .maybeSingle() as unknown as Promise<{ data: Pick<DbTaskRow, 'sort_order'> | null }>)

  const sortOrder = (maxRow?.sort_order ?? -1) + 1

  const { error } = await (supabase.from('pomodoro_tasks').insert({
    id: input.id,
    user_id: userId,
    title: input.title,
    estimated_pomodoros: Math.max(1, Math.min(20, input.estimatedPomodoros)),
    completed_pomodoros: 0,
    is_completed: false,
    sort_order: sortOrder,
  } as never) as unknown as Promise<{ error: { message: string } | null }>)

  if (error) return { error: error.message }
  return {}
}

export async function updatePomodoroTask(
  taskId: string,
  patch: {
    title?: string
    estimatedPomodoros?: number
    completedPomodoros?: number
    isCompleted?: boolean
  }
): Promise<{ error?: string }> {
  const userId = await requireUserId()
  const supabase = await createClient()

  const update: Partial<DbTaskRow> = {}
  if (patch.title !== undefined) update.title = patch.title
  if (patch.estimatedPomodoros !== undefined)
    update.estimated_pomodoros = Math.max(1, Math.min(20, patch.estimatedPomodoros))
  if (patch.completedPomodoros !== undefined)
    update.completed_pomodoros = Math.max(0, patch.completedPomodoros)
  if (patch.isCompleted !== undefined) update.is_completed = patch.isCompleted

  const { error } = await (supabase
    .from('pomodoro_tasks')
    .update(update as never)
    .eq('id', taskId)
    .eq('user_id', userId) as unknown as Promise<{ error: { message: string } | null }>)

  if (error) return { error: error.message }
  return {}
}

export async function deletePomodoroTask(taskId: string): Promise<{ error?: string }> {
  const userId = await requireUserId()
  const supabase = await createClient()

  const { error } = await (supabase
    .from('pomodoro_tasks')
    .delete()
    .eq('id', taskId)
    .eq('user_id', userId) as unknown as Promise<{ error: { message: string } | null }>)

  if (error) return { error: error.message }
  return {}
}

export async function reorderPomodoroTasks(taskIds: string[]): Promise<{ error?: string }> {
  const userId = await requireUserId()
  const supabase = await createClient()

  await Promise.all(
    taskIds.map((id, index) =>
      (supabase
        .from('pomodoro_tasks')
        .update({ sort_order: index } as never)
        .eq('id', id)
        .eq('user_id', userId) as unknown as Promise<unknown>)
    )
  )
  return {}
}

// ============================================================
// Settings
// ============================================================

export async function getPomodoroSettings(): Promise<PomodoroSettings | null> {
  const userId = await requireUserId()
  const supabase = await createClient()

  const { data, error } = await (supabase
    .from('pomodoro_settings')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle() as unknown as Promise<{
      data: DbSettingsRow | null
      error: { message: string } | null
    }>)

  if (error) throw new Error(error.message)
  return data ? settingsFromDb(data) : null
}

export async function upsertPomodoroSettings(
  patch: Partial<PomodoroSettings>
): Promise<{ error?: string }> {
  const userId = await requireUserId()
  const supabase = await createClient()

  const dbPatch = settingsToDb(patch)

  // on_auth_user_created creates a row per user, but we use upsert for safety.
  const { error } = await (supabase
    .from('pomodoro_settings')
    .upsert({ user_id: userId, ...dbPatch } as never, { onConflict: 'user_id' }) as unknown as Promise<{ error: { message: string } | null }>)

  if (error) return { error: error.message }
  return {}
}
