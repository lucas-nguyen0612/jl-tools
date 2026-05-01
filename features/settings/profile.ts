'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { profileUpdateSchema, avatarUploadSchema } from './profile-schemas'

type ActionResult<T> =
  | { data: T; error: null }
  | { data: null; error: { message: string; code: string } }

// Minimal shape of a profiles update payload — avoids strict Supabase type
// inference conflicts while staying safe at runtime.
type ProfileUpdatePayload = Record<string, unknown>

// ── updateProfile ─────────────────────────────────────────────────────────────

export async function updateProfile(
  input: { character_name: string },
): Promise<ActionResult<{ character_name: string }>> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { data: null, error: { message: 'Unauthorized', code: 'AUTH_REQUIRED' } }
  }

  const parsed = profileUpdateSchema.safeParse(input)
  if (!parsed.success) {
    const msg = parsed.error.issues[0]?.message ?? 'Validation error'
    return { data: null, error: { message: msg, code: 'VALIDATION_ERROR' } }
  }

  const payload: ProfileUpdatePayload = {
    character_name: parsed.data.character_name,
    updated_at: new Date().toISOString(),
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error: dbError } = await (supabase as any)
    .from('profiles')
    .update(payload)
    .eq('user_id', user.id)

  if (dbError) {
    return { data: null, error: { message: (dbError as { message: string }).message, code: 'DB_ERROR' } }
  }

  // SideNav reads character_name from the (app) layout RSC, so refresh it.
  revalidatePath('/', 'layout')

  return { data: { character_name: parsed.data.character_name }, error: null }
}

// ── uploadAvatar ─────────────────────────────────────────────────────────────

export async function uploadAvatar(
  formData: FormData,
): Promise<ActionResult<{ avatar_url: string }>> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { data: null, error: { message: 'Unauthorized', code: 'AUTH_REQUIRED' } }
  }

  const file = formData.get('file')
  if (!(file instanceof File)) {
    return { data: null, error: { message: 'No file provided', code: 'MISSING_FILE' } }
  }

  // Server-side validation (mirrors client-side guards)
  const parsed = avatarUploadSchema.safeParse({ file })
  if (!parsed.success) {
    const msg = parsed.error.issues[0]?.message ?? 'Invalid file'
    return { data: null, error: { message: msg, code: 'VALIDATION_ERROR' } }
  }

  // Derive extension from mime type
  const mimeToExt: Record<string, string> = {
    'image/png': 'png',
    'image/jpeg': 'jpg',
    'image/webp': 'webp',
  }
  const ext = mimeToExt[file.type] ?? 'png'

  // Fetch current avatar_url to delete old object after successful upload
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: profileRowRaw } = await (supabase as any)
    .from('profiles')
    .select('avatar_url')
    .eq('user_id', user.id)
    .single()
  const profileRow = profileRowRaw as { avatar_url: string | null } | null

  // UUID-based filename so URLs are unguessable
  const uuid = crypto.randomUUID()
  const storagePath = `${user.id}/${uuid}.${ext}`

  const arrayBuffer = await file.arrayBuffer()
  const { error: uploadError } = await supabase.storage
    .from('avatars')
    .upload(storagePath, arrayBuffer, {
      contentType: file.type,
      upsert: false,
    })

  if (uploadError) {
    return { data: null, error: { message: uploadError.message, code: 'UPLOAD_ERROR' } }
  }

  const { data: publicUrlData } = supabase.storage
    .from('avatars')
    .getPublicUrl(storagePath)

  const avatar_url = publicUrlData.publicUrl

  const avatarPayload: ProfileUpdatePayload = {
    avatar_url,
    updated_at: new Date().toISOString(),
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error: dbError } = await (supabase as any)
    .from('profiles')
    .update(avatarPayload)
    .eq('user_id', user.id)

  if (dbError) {
    // Attempt rollback of uploaded object — best effort
    await supabase.storage.from('avatars').remove([storagePath])
    return { data: null, error: { message: (dbError as { message: string }).message, code: 'DB_ERROR' } }
  }

  // Delete old storage object if one existed
  if (profileRow?.avatar_url) {
    const oldUrl = profileRow.avatar_url
    // Extract path segment after the /avatars/ prefix
    const marker = '/object/public/avatars/'
    const idx = oldUrl.indexOf(marker)
    if (idx !== -1) {
      const oldPath = oldUrl.slice(idx + marker.length)
      // Best-effort — ignore errors
      await supabase.storage.from('avatars').remove([oldPath])
    }
  }

  // SideNav reads avatar_url from the (app) layout RSC, so refresh it.
  revalidatePath('/', 'layout')

  return { data: { avatar_url }, error: null }
}

// ── removeAvatar ─────────────────────────────────────────────────────────────

export async function removeAvatar(): Promise<ActionResult<{ avatar_url: null }>> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { data: null, error: { message: 'Unauthorized', code: 'AUTH_REQUIRED' } }
  }

  // Fetch current avatar_url so we can delete the storage object
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: profileRowRaw } = await (supabase as any)
    .from('profiles')
    .select('avatar_url')
    .eq('user_id', user.id)
    .single()
  const profileRow = profileRowRaw as { avatar_url: string | null } | null

  const removePayload: ProfileUpdatePayload = {
    avatar_url: null,
    updated_at: new Date().toISOString(),
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error: dbError } = await (supabase as any)
    .from('profiles')
    .update(removePayload)
    .eq('user_id', user.id)

  if (dbError) {
    return { data: null, error: { message: (dbError as { message: string }).message, code: 'DB_ERROR' } }
  }

  // Delete the storage object — best effort
  if (profileRow?.avatar_url) {
    const oldUrl = profileRow.avatar_url
    const marker = '/object/public/avatars/'
    const idx = oldUrl.indexOf(marker)
    if (idx !== -1) {
      const oldPath = oldUrl.slice(idx + marker.length)
      await supabase.storage.from('avatars').remove([oldPath])
    }
  }

  // SideNav reads avatar_url from the (app) layout RSC, so refresh it.
  revalidatePath('/', 'layout')

  return { data: { avatar_url: null }, error: null }
}
