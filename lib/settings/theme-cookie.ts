import { cookies } from 'next/headers'

export type Theme = 'light' | 'dark' | 'system'

export const THEME_COOKIE = 'jl-theme'
export const HUE_COOKIE = 'jl-hue'

export const DEFAULT_THEME: Theme = 'system'
export const DEFAULT_HUE = 38

const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365

const COOKIE_OPTIONS = {
  path: '/',
  sameSite: 'lax',
  maxAge: ONE_YEAR_SECONDS,
} as const

export type ThemeCookies = {
  theme: Theme
  hue: number
}

function parseTheme(raw: string | undefined): Theme {
  return raw === 'light' || raw === 'dark' || raw === 'system' ? raw : DEFAULT_THEME
}

function parseHue(raw: string | undefined): number {
  if (!raw || !/^\d+$/.test(raw)) return DEFAULT_HUE
  const n = Number.parseInt(raw, 10)
  if (!Number.isFinite(n) || n < 0 || n > 360) return DEFAULT_HUE
  return n
}

// RSC-safe: only reads. May be called from Server Components, layouts,
// pages, Server Actions, and Route Handlers.
export async function readThemeCookie(): Promise<ThemeCookies> {
  const store = await cookies()
  return {
    theme: parseTheme(store.get(THEME_COOKIE)?.value),
    hue: parseHue(store.get(HUE_COOKIE)?.value),
  }
}

// Action-only: cookies().set() throws inside RSC. Call from Server Actions
// or Route Handlers only.
export async function writeThemeCookie(theme: Theme, hue: number): Promise<void> {
  const store = await cookies()
  store.set(THEME_COOKIE, theme, COOKIE_OPTIONS)
  store.set(HUE_COOKIE, String(hue), COOKIE_OPTIONS)
}

// Action-only: see writeThemeCookie. Used by sign-out flows.
export async function clearThemeCookie(): Promise<void> {
  const store = await cookies()
  store.delete(THEME_COOKIE)
  store.delete(HUE_COOKIE)
}

// Pure helper used by the root layout and tests to derive the <html> class
// from a resolved theme value. `system` stays empty server-side; the inline
// pre-paint script promotes to dark when matchMedia agrees.
export function htmlClassForTheme(theme: Theme): string {
  return theme === 'dark' ? 'jl-dark dark' : ''
}
