/**
 * __tests__/profile.test.tsx
 *
 * Covers the I/O matrix from spec-2-profile.md:
 *   - Zod schema boundaries (1, 2, 32, 33 chars; control chars)
 *   - updateProfile server action (happy path, auth failure, DB error)
 *   - File size guard (5 MB limit, 1 byte under, 1 byte over)
 *   - Mime guard (png, jpeg, webp pass; gif, pdf, etc. rejected)
 *
 * Note: uses Zod v4 `.issues` (not `.errors`) for error access.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { profileUpdateSchema, avatarUploadSchema, MAX_SIZE_BYTES } from '@/features/settings/profile-schemas'

// ── helpers ──────────────────────────────────────────────────────────────────

function makeFile(sizeBytes: number, type = 'image/png', name = 'test.png'): File {
  const buf = new Uint8Array(sizeBytes).fill(0)
  return new File([buf], name, { type })
}

// ─────────────────────────────────────────────────────────────────────────────
// profileUpdateSchema
// ─────────────────────────────────────────────────────────────────────────────

describe('profileUpdateSchema — character_name boundaries', () => {
  it('rejects 1 character', () => {
    const result = profileUpdateSchema.safeParse({ character_name: 'a' })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toMatch(/at least 2/i)
    }
  })

  it('accepts exactly 2 characters', () => {
    const result = profileUpdateSchema.safeParse({ character_name: 'ab' })
    expect(result.success).toBe(true)
    if (result.success) expect(result.data.character_name).toBe('ab')
  })

  it('accepts exactly 32 characters', () => {
    const name = 'a'.repeat(32)
    const result = profileUpdateSchema.safeParse({ character_name: name })
    expect(result.success).toBe(true)
    if (result.success) expect(result.data.character_name).toBe(name)
  })

  it('rejects 33 characters', () => {
    const result = profileUpdateSchema.safeParse({ character_name: 'a'.repeat(33) })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toMatch(/at most 32/i)
    }
  })

  it('strips control characters before length check', () => {
    // "ab\x01cd" -> "abcd" (4 chars) -> passes min(2)
    const result = profileUpdateSchema.safeParse({ character_name: 'ab\x01cd' })
    expect(result.success).toBe(true)
    if (result.success) expect(result.data.character_name).toBe('abcd')
  })

  it('trims leading/trailing whitespace', () => {
    const result = profileUpdateSchema.safeParse({ character_name: '  Lucas  ' })
    expect(result.success).toBe(true)
    if (result.success) expect(result.data.character_name).toBe('Lucas')
  })

  it('rejects empty string', () => {
    const result = profileUpdateSchema.safeParse({ character_name: '' })
    expect(result.success).toBe(false)
  })

  it('rejects string of only whitespace after trim', () => {
    const result = profileUpdateSchema.safeParse({ character_name: '  ' })
    expect(result.success).toBe(false)
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// avatarUploadSchema — file size guard
// ─────────────────────────────────────────────────────────────────────────────

describe('avatarUploadSchema — file size', () => {
  it('accepts file exactly at the 5 MB limit', () => {
    const file = makeFile(MAX_SIZE_BYTES)
    const result = avatarUploadSchema.safeParse({ file })
    expect(result.success).toBe(true)
  })

  it('accepts file 1 byte under 5 MB', () => {
    const file = makeFile(MAX_SIZE_BYTES - 1)
    const result = avatarUploadSchema.safeParse({ file })
    expect(result.success).toBe(true)
  })

  it('rejects file 1 byte over 5 MB', () => {
    const file = makeFile(MAX_SIZE_BYTES + 1)
    const result = avatarUploadSchema.safeParse({ file })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toMatch(/under 5 MB/i)
    }
  })

  it('rejects a 5.5 MB file', () => {
    const file = makeFile(Math.round(5.5 * 1024 * 1024))
    const result = avatarUploadSchema.safeParse({ file })
    expect(result.success).toBe(false)
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// avatarUploadSchema — mime guard
// ─────────────────────────────────────────────────────────────────────────────

describe('avatarUploadSchema — mime types', () => {
  it('accepts image/png', () => {
    const result = avatarUploadSchema.safeParse({ file: makeFile(1000, 'image/png', 'a.png') })
    expect(result.success).toBe(true)
  })

  it('accepts image/jpeg', () => {
    const result = avatarUploadSchema.safeParse({ file: makeFile(1000, 'image/jpeg', 'a.jpg') })
    expect(result.success).toBe(true)
  })

  it('accepts image/webp', () => {
    const result = avatarUploadSchema.safeParse({ file: makeFile(1000, 'image/webp', 'a.webp') })
    expect(result.success).toBe(true)
  })

  it('rejects image/gif', () => {
    const result = avatarUploadSchema.safeParse({ file: makeFile(1000, 'image/gif', 'a.gif') })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toMatch(/PNG \/ JPG \/ WEBP/i)
    }
  })

  it('rejects application/pdf', () => {
    const result = avatarUploadSchema.safeParse({ file: makeFile(1000, 'application/pdf', 'a.pdf') })
    expect(result.success).toBe(false)
  })

  it('rejects text/plain', () => {
    const result = avatarUploadSchema.safeParse({ file: makeFile(1000, 'text/plain', 'a.txt') })
    expect(result.success).toBe(false)
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// updateProfile server action — with mocked Supabase
// ─────────────────────────────────────────────────────────────────────────────

// We mock the entire module so the server action can run in a test environment
// (no Next.js `cookies()` available).

vi.mock('@/lib/supabase/server', () => ({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  createClient: vi.fn() as unknown as () => Promise<any>,
  getUser: vi.fn(),
}))

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type MockedCreateClient = ReturnType<typeof vi.fn> & { mockResolvedValue: (v: any) => void }
import { createClient } from '@/lib/supabase/server'
const mockCreateClient = createClient as unknown as MockedCreateClient

describe('updateProfile server action', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns AUTH_REQUIRED when user is not authenticated', async () => {
    const { updateProfile } = await import('@/features/settings/profile')

    mockCreateClient.mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: null } }),
      },
    })

    const result = await updateProfile({ character_name: 'Lucas' })
    expect(result.data).toBeNull()
    expect(result.error?.code).toBe('AUTH_REQUIRED')
  })

  it('returns VALIDATION_ERROR for a 1-char name', async () => {
    const { updateProfile } = await import('@/features/settings/profile')

    mockCreateClient.mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'user-1' } } }),
      },
    })

    const result = await updateProfile({ character_name: 'a' })
    expect(result.data).toBeNull()
    expect(result.error?.code).toBe('VALIDATION_ERROR')
  })

  it('persists the new character_name and returns data on success', async () => {
    const { updateProfile } = await import('@/features/settings/profile')

    const mockEq = vi.fn().mockResolvedValue({ error: null })
    const mockUpdate = vi.fn().mockReturnValue({ eq: mockEq })

    mockCreateClient.mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'user-1' } } }),
      },
      from: vi.fn().mockReturnValue({
        update: mockUpdate,
      }),
    })

    const result = await updateProfile({ character_name: 'Adventurer' })
    expect(result.error).toBeNull()
    expect(result.data?.character_name).toBe('Adventurer')
    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ character_name: 'Adventurer' }),
    )
  })

  it('returns DB_ERROR when the Supabase update fails', async () => {
    const { updateProfile } = await import('@/features/settings/profile')

    mockCreateClient.mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'user-1' } } }),
      },
      from: vi.fn().mockReturnValue({
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ error: { message: 'DB failure' } }),
        }),
      }),
    })

    const result = await updateProfile({ character_name: 'Lucas' })
    expect(result.data).toBeNull()
    expect(result.error?.code).toBe('DB_ERROR')
  })
})
