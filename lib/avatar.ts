export const DEFAULT_AVATAR_SRC = '/avatars/default.png'

// Avatars max out at 512px on the longest side. Even at the largest surface
// (HeroCard, 88 CSS px → 264 device px on 3x displays) this leaves headroom,
// while staying small enough that the browser downscales cleanly to a sidebar
// 36 px without the mushy 25× ratio we get from 1024 px+ originals.
export const AVATAR_MAX_DIMENSION = 512

/**
 * Returns the URL to render for a profile avatar, falling back to the
 * default image when no avatar has been uploaded.
 */
export function getAvatarSrc(avatarUrl: string | null | undefined): string {
  return avatarUrl && avatarUrl.length > 0 ? avatarUrl : DEFAULT_AVATAR_SRC
}

/**
 * True when the URL points to an external origin (e.g. Supabase Storage)
 * and should be rendered with `unoptimized` to bypass next/image's proxy
 * and host allowlist. Local public assets keep normal optimisation.
 */
export function isExternalAvatar(src: string): boolean {
  return /^https?:\/\//i.test(src)
}

/**
 * Resize an image File to a square that fits within `maxDim` on each side,
 * cropped center, returning a JPEG. Runs in the browser via canvas — keep
 * the call inside a client component or `'use client'` boundary.
 */
export async function resizeAvatarFile(
  file: File,
  maxDim: number = AVATAR_MAX_DIMENSION,
): Promise<File> {
  const bitmap = await createImageBitmap(file)
  try {
    const sourceSize = Math.min(bitmap.width, bitmap.height)
    const sx = (bitmap.width - sourceSize) / 2
    const sy = (bitmap.height - sourceSize) / 2
    const targetSize = Math.min(maxDim, sourceSize)

    const canvas = document.createElement('canvas')
    canvas.width = targetSize
    canvas.height = targetSize
    const ctx = canvas.getContext('2d')
    if (!ctx) return file
    ctx.imageSmoothingEnabled = true
    ctx.imageSmoothingQuality = 'high'
    ctx.drawImage(
      bitmap,
      sx,
      sy,
      sourceSize,
      sourceSize,
      0,
      0,
      targetSize,
      targetSize,
    )

    const blob: Blob | null = await new Promise((resolve) =>
      canvas.toBlob(resolve, 'image/jpeg', 0.9),
    )
    if (!blob) return file

    const baseName = file.name.replace(/\.[^.]+$/, '')
    return new File([blob], `${baseName}.jpg`, { type: 'image/jpeg' })
  } finally {
    bitmap.close?.()
  }
}
