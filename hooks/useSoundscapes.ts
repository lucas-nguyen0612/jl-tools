'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import {
  listSoundscapes,
  registerSoundscape,
  deleteSoundscape,
  type Soundscape,
} from '@/features/pomodoro/soundscapes'

export const soundscapesKeys = {
  all: ['pomodoro', 'soundscapes'] as const,
}

export const SOUNDSCAPE_MAX_BYTES = 20 * 1024 * 1024
export const SOUNDSCAPE_ALLOWED_MIME = [
  'audio/mpeg',
  'audio/mp3',
  'audio/wav',
  'audio/x-wav',
  'audio/ogg',
  'audio/webm',
] as const

export function useSoundscapesQuery() {
  return useQuery({
    queryKey: soundscapesKeys.all,
    queryFn: () => listSoundscapes(),
    staleTime: 60_000,
  })
}

function extFromMime(mime: string, fallbackName: string): string {
  if (mime === 'audio/mpeg' || mime === 'audio/mp3') return 'mp3'
  if (mime === 'audio/wav' || mime === 'audio/x-wav') return 'wav'
  if (mime === 'audio/ogg') return 'ogg'
  if (mime === 'audio/webm') return 'webm'
  const dot = fallbackName.lastIndexOf('.')
  return dot >= 0 ? fallbackName.slice(dot + 1).toLowerCase() : 'mp3'
}

export function useUploadSoundscape() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ file, name }: { file: File; name: string }): Promise<Soundscape> => {
      if (file.size > SOUNDSCAPE_MAX_BYTES) {
        throw new Error(`File quá lớn (>${SOUNDSCAPE_MAX_BYTES / 1024 / 1024} MB)`)
      }
      if (!SOUNDSCAPE_ALLOWED_MIME.includes(file.type as (typeof SOUNDSCAPE_ALLOWED_MIME)[number])) {
        throw new Error('Định dạng không hỗ trợ. Dùng MP3, WAV, OGG hoặc WEBM.')
      }

      const supabase = createClient()
      const { data: userData, error: userErr } = await supabase.auth.getUser()
      if (userErr || !userData.user) throw new Error('Chưa đăng nhập')

      const id = crypto.randomUUID()
      const ext = extFromMime(file.type, file.name)
      const storagePath = `${userData.user.id}/${id}.${ext}`

      const { error: uploadErr } = await supabase.storage
        .from('music')
        .upload(storagePath, file, {
          contentType: file.type,
          upsert: false,
        })
      if (uploadErr) throw new Error(uploadErr.message)

      const result = await registerSoundscape({
        id,
        name,
        storagePath,
        fileSizeBytes: file.size,
        mimeType: file.type,
      })

      if (result.error || !result.data) {
        // Roll back the storage object so we don't leave orphans on a failed register.
        await supabase.storage.from('music').remove([storagePath])
        throw new Error(result.error ?? 'Lưu thông tin file thất bại')
      }

      return result.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: soundscapesKeys.all })
    },
  })
}

export function useDeleteSoundscape() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const result = await deleteSoundscape(id)
      if (result.error) throw new Error(result.error)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: soundscapesKeys.all })
    },
  })
}
