import { describe, it, expect, vi, beforeEach } from 'vitest'

// ────────────────────────────────────────────────────────────────
// Shared hoisted state — referenced by the vi.mock factories below.
// ────────────────────────────────────────────────────────────────

const mocks = vi.hoisted(() => {
  return {
    cookieStore: new Map<string, string>(),
    state: {
      user: { id: 'u1' } as { id: string } | null,
      upsertResult: { data: null, error: null } as
        | { data: unknown; error: null }
        | { data: null; error: { message: string } },
    },
    upsertSpy: vi.fn(),
    revalidateSpy: vi.fn(),
  }
})

vi.mock('next/headers', () => ({
  cookies: vi.fn(async () => ({
    get: (name: string) => {
      const v = mocks.cookieStore.get(name)
      return v !== undefined ? { name, value: v } : undefined
    },
    set: (name: string, value: string) => {
      mocks.cookieStore.set(name, value)
    },
    delete: (name: string) => {
      mocks.cookieStore.delete(name)
    },
  })),
}))

vi.mock('next/cache', () => ({
  revalidatePath: (...args: unknown[]) => mocks.revalidateSpy(...args),
}))

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(async () => ({
    auth: {
      getUser: vi.fn(async () => ({ data: { user: mocks.state.user } })),
    },
    from: vi.fn(() => ({
      upsert: (row: unknown, opts: unknown) => {
        mocks.upsertSpy(row, opts)
        return {
          select: () => ({
            single: vi.fn(async () => mocks.state.upsertResult),
          }),
        }
      },
    })),
  })),
}))

// ────────────────────────────────────────────────────────────────

import {
  readThemeCookie,
  writeThemeCookie,
  htmlClassForTheme,
  THEME_COOKIE,
  HUE_COOKIE,
  DEFAULT_THEME,
  DEFAULT_HUE,
} from '@/lib/settings/theme-cookie'
import { appearanceSchema } from '@/features/settings/schemas'
import { updateAppearance } from '@/features/settings/preferences'

beforeEach(() => {
  mocks.cookieStore.clear()
  mocks.state.user = { id: 'u1' }
  mocks.state.upsertResult = { data: null, error: null }
  mocks.upsertSpy.mockClear()
  mocks.revalidateSpy.mockClear()
})

describe('htmlClassForTheme', () => {
  it('returns "jl-dark dark" for dark', () => {
    expect(htmlClassForTheme('dark')).toBe('jl-dark dark')
  })

  it('returns empty string for light', () => {
    expect(htmlClassForTheme('light')).toBe('')
  })

  it('returns empty string for system (client script promotes to dark)', () => {
    expect(htmlClassForTheme('system')).toBe('')
  })
})

describe('appearanceSchema', () => {
  it('accepts theme=dark + hue=200', () => {
    const r = appearanceSchema.safeParse({ theme: 'dark', accent_hue: 200 })
    expect(r.success).toBe(true)
  })

  it('accepts hue boundaries 0 and 360', () => {
    expect(appearanceSchema.safeParse({ theme: 'light', accent_hue: 0 }).success).toBe(true)
    expect(appearanceSchema.safeParse({ theme: 'light', accent_hue: 360 }).success).toBe(true)
  })

  it('rejects unknown theme value', () => {
    expect(appearanceSchema.safeParse({ theme: 'neon', accent_hue: 38 }).success).toBe(false)
  })

  it('rejects out-of-range hues (-1, 361, 999)', () => {
    expect(appearanceSchema.safeParse({ theme: 'light', accent_hue: -1 }).success).toBe(false)
    expect(appearanceSchema.safeParse({ theme: 'light', accent_hue: 361 }).success).toBe(false)
    expect(appearanceSchema.safeParse({ theme: 'light', accent_hue: 999 }).success).toBe(false)
  })

  it('rejects non-integer hue', () => {
    expect(appearanceSchema.safeParse({ theme: 'light', accent_hue: 38.5 }).success).toBe(false)
  })
})

describe('readThemeCookie / writeThemeCookie', () => {
  it('returns defaults when both cookies are missing', async () => {
    expect(await readThemeCookie()).toEqual({ theme: DEFAULT_THEME, hue: DEFAULT_HUE })
  })

  it('round-trips theme and hue through the cookie store', async () => {
    await writeThemeCookie('dark', 200)
    expect(await readThemeCookie()).toEqual({ theme: 'dark', hue: 200 })
  })

  it('falls back to default theme when cookie value is invalid', async () => {
    mocks.cookieStore.set(THEME_COOKIE, 'neon')
    mocks.cookieStore.set(HUE_COOKIE, '38')
    expect((await readThemeCookie()).theme).toBe(DEFAULT_THEME)
  })

  it('falls back to default hue when cookie value is out of range', async () => {
    mocks.cookieStore.set(THEME_COOKIE, 'dark')
    mocks.cookieStore.set(HUE_COOKIE, '999')
    expect((await readThemeCookie()).hue).toBe(DEFAULT_HUE)
  })

  it('falls back to default hue when cookie value is non-numeric', async () => {
    mocks.cookieStore.set(HUE_COOKIE, 'banana')
    expect((await readThemeCookie()).hue).toBe(DEFAULT_HUE)
  })
})

describe('updateAppearance', () => {
  it('rejects invalid input with VALIDATION_ERROR and writes nothing', async () => {
    const result = await updateAppearance({
      // @ts-expect-error — intentionally invalid for the test
      theme: 'neon',
      accent_hue: 999,
    })
    expect(result.data).toBeNull()
    expect(result.error?.code).toBe('VALIDATION_ERROR')
    expect(mocks.upsertSpy).not.toHaveBeenCalled()
    expect(mocks.cookieStore.size).toBe(0)
    expect(mocks.revalidateSpy).not.toHaveBeenCalled()
  })

  it('returns AUTH_REQUIRED when there is no session', async () => {
    mocks.state.user = null
    const result = await updateAppearance({ theme: 'dark', accent_hue: 200 })
    expect(result.data).toBeNull()
    expect(result.error?.code).toBe('AUTH_REQUIRED')
    expect(mocks.upsertSpy).not.toHaveBeenCalled()
  })

  it('on happy path upserts the row, sets cookies, and revalidates the layout', async () => {
    mocks.state.upsertResult = {
      data: {
        user_id: 'u1',
        appearance_settings: { theme: 'dark', accent_hue: 200 },
        notification_settings: {
          pomodoro_sound: true,
          pomodoro_volume: 70,
          habit_reminders_enabled: true,
        },
        created_at: '2026-04-28T00:00:00Z',
        updated_at: '2026-04-28T00:00:00Z',
      },
      error: null,
    }

    const result = await updateAppearance({ theme: 'dark', accent_hue: 200 })

    expect(result.error).toBeNull()
    expect(result.data?.appearance_settings.theme).toBe('dark')
    expect(result.data?.appearance_settings.accent_hue).toBe(200)

    expect(mocks.upsertSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        user_id: 'u1',
        appearance_settings: { theme: 'dark', accent_hue: 200 },
      }),
      expect.objectContaining({ onConflict: 'user_id' })
    )

    expect(mocks.cookieStore.get(THEME_COOKIE)).toBe('dark')
    expect(mocks.cookieStore.get(HUE_COOKIE)).toBe('200')
    expect(mocks.revalidateSpy).toHaveBeenCalledWith('/', 'layout')
  })
})
