'use server'

/**
 * Server actions for user-uploaded Pomodoro soundscapes.
 *
 * Upload flow (file bytes do NOT go through Next.js):
 *   1. Client uploads file directly to Supabase Storage bucket `music`
 *      at {user_id}/{soundscape_id}.{ext} using its session.
 *   2. Client calls registerSoundscape() with the storage path + name.
 *   3. Server validates the path is under the user's folder and inserts
 *      a row into pomodoro_soundscapes pointing at it.
 *
 * Delete flow:
 *   1. Client calls deleteSoundscape(id).
 *   2. Server removes the storage object and the DB row in one go.
 */

import { createClient } from '@/lib/supabase/server'

export interface Soundscape {
  id: string
  name: string
  fileUrl: string
  fileSizeBytes: number
  mimeType: string | null
  createdAt: string
}

type DbRow = {
  id: string
  user_id: string
  name: string
  storage_path: string
  file_url: string
  file_size_bytes: number
  mime_type: string | null
  created_at: string
}

function rowToSoundscape(row: DbRow): Soundscape {
  return {
    id: row.id,
    name: row.name,
    fileUrl: row.file_url,
    fileSizeBytes: row.file_size_bytes,
    mimeType: row.mime_type,
    createdAt: row.created_at,
  }
}

async function requireUserId(): Promise<string> {
  const supabase = await createClient()
  const { data } = await supabase.auth.getUser()
  if (!data.user) throw new Error('Unauthorized')
  return data.user.id
}

export async function listSoundscapes(): Promise<Soundscape[]> {
  const userId = await requireUserId()
  const supabase = await createClient()

  const { data, error } = await (supabase
    .from('pomodoro_soundscapes')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false }) as unknown as Promise<{
      data: DbRow[] | null
      error: { message: string } | null
    }>)

  if (error) throw new Error(error.message)
  return (data ?? []).map(rowToSoundscape)
}

export async function registerSoundscape(input: {
  id: string
  name: string
  storagePath: string
  fileSizeBytes: number
  mimeType: string | null
}): Promise<{ data: Soundscape | null; error: string | null }> {
  const userId = await requireUserId()
  const supabase = await createClient()

  // Path must live under the user's folder. Storage RLS already enforces
  // this on upload, but we re-check here so we don't write a DB row that
  // points at someone else's object.
  const expectedPrefix = `${userId}/`
  if (!input.storagePath.startsWith(expectedPrefix)) {
    return { data: null, error: 'Storage path must be under your user folder' }
  }
  if (input.fileSizeBytes < 0 || input.fileSizeBytes > 20 * 1024 * 1024) {
    return { data: null, error: 'File size out of range' }
  }
  const trimmedName = input.name.trim().slice(0, 80)
  if (!trimmedName) {
    return { data: null, error: 'Name is required' }
  }

  const { data: publicUrlData } = supabase.storage
    .from('music')
    .getPublicUrl(input.storagePath)
  const fileUrl = publicUrlData.publicUrl

  const { data, error } = await (supabase
    .from('pomodoro_soundscapes')
    .insert({
      id: input.id,
      user_id: userId,
      name: trimmedName,
      storage_path: input.storagePath,
      file_url: fileUrl,
      file_size_bytes: input.fileSizeBytes,
      mime_type: input.mimeType,
    } as never)
    .select('*')
    .single() as unknown as Promise<{ data: DbRow | null; error: { message: string } | null }>)

  if (error || !data) return { data: null, error: error?.message ?? 'Insert failed' }
  return { data: rowToSoundscape(data), error: null }
}

export async function deleteSoundscape(id: string): Promise<{ error: string | null }> {
  const userId = await requireUserId()
  const supabase = await createClient()

  const { data: row, error: fetchErr } = await (supabase
    .from('pomodoro_soundscapes')
    .select('storage_path, user_id')
    .eq('id', id)
    .eq('user_id', userId)
    .maybeSingle() as unknown as Promise<{
      data: Pick<DbRow, 'storage_path' | 'user_id'> | null
      error: { message: string } | null
    }>)

  if (fetchErr) return { error: fetchErr.message }
  if (!row) return { error: 'Not found' }

  // Storage first — if this fails we keep the DB row so the user can retry.
  // If the DB delete fails after, the file is gone but the orphan row is
  // harmless and easy to clean up manually.
  const { error: storageErr } = await supabase.storage
    .from('music')
    .remove([row.storage_path])
  if (storageErr) return { error: storageErr.message }

  const { error: dbErr } = await (supabase
    .from('pomodoro_soundscapes')
    .delete()
    .eq('id', id)
    .eq('user_id', userId) as unknown as Promise<{ error: { message: string } | null }>)

  if (dbErr) return { error: dbErr.message }
  return { error: null }
}
