/**
 * __tests__/notifications.test.tsx
 * Story 5 — Notifications section tests
 * Covers: Zod schema, updateNotifications action, BrowserPermissionCard states, debounce
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react'

// ─── Hoist mock for preferences (used by PomodoroSoundCard debounce tests) ───
// Must be at the top level so vitest can hoist it correctly.
const mockUpdateNotifications = vi.fn()

vi.mock('@/features/settings/preferences', () => ({
  updateNotifications: (...args: unknown[]) => mockUpdateNotifications(...args),
  updateAppearance: vi.fn(),
  syncAppearanceCookies: vi.fn(),
}))

// ─── Mock next/cache (server-only) ──────────────────────────────────────────
vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }))

// ─── Mock next/headers ──────────────────────────────────────────────────────
vi.mock('next/headers', () => ({
  cookies: vi.fn(() => ({
    get: vi.fn(() => null),
    set: vi.fn(),
    delete: vi.fn(),
    getAll: vi.fn(() => []),
  })),
}))

// ─── Supabase server mock ─────────────────────────────────────────────────────
const mockSingle = vi.fn()
const mockSelect = vi.fn()
const mockUpsert = vi.fn()
const mockEq = vi.fn()
const mockMaybeSingle = vi.fn()
const mockFrom = vi.fn()

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(async () => ({
    auth: {
      getUser: vi.fn(async () => ({
        data: { user: { id: 'user-123' } },
      })),
    },
    from: mockFrom,
  })),
}))

// ─── Mock @supabase/ssr (used by playAlertTone) ───────────────────────────────
vi.mock('@supabase/ssr', () => ({
  createBrowserClient: vi.fn(() => ({
    auth: { getUser: vi.fn(async () => ({ data: { user: { id: 'user-123' } } })) },
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn(async () => ({ data: null })),
    })),
  })),
}))

// ─── Imports ──────────────────────────────────────────────────────────────────
import { notificationsSchema } from '@/features/settings/notification-schemas'
import { BrowserPermissionCard } from '@/components/settings/BrowserPermissionCard'
import { PomodoroSoundCard } from '@/components/settings/PomodoroSoundCard'

// ─── Helper to set up supabase chainable mock for the action tests ────────────
function setupSupabaseMock(returnValue: { data: unknown; error: unknown }) {
  mockSingle.mockResolvedValue(returnValue)
  mockSelect.mockReturnValue({ single: mockSingle })
  mockUpsert.mockReturnValue({ select: mockSelect })
  mockEq.mockReturnValue({ maybeSingle: mockMaybeSingle })
  mockMaybeSingle.mockResolvedValue({ data: null, error: null })
  mockFrom.mockReturnValue({ upsert: mockUpsert, select: vi.fn().mockReturnValue({ eq: mockEq }) })
}

// ─── Default mock return for updateNotifications ──────────────────────────────
const mockUpdateSuccess = async () => ({
  data: {
    user_id: 'user-123',
    notification_settings: { pomodoro_sound: true, pomodoro_volume: 50, habit_reminders_enabled: true },
    appearance_settings: { theme: 'system', accent_hue: 200 },
    created_at: '2026-01-01',
    updated_at: '2026-01-01',
  },
  error: null,
})

// ════════════════════════════════════════════════════════════════════════════
// 1. Zod schema validation
// ════════════════════════════════════════════════════════════════════════════
describe('notificationsSchema', () => {
  it('accepts valid input', () => {
    const result = notificationsSchema.safeParse({
      pomodoro_sound: true,
      pomodoro_volume: 50,
      habit_reminders_enabled: false,
    })
    expect(result.success).toBe(true)
  })

  it('rejects pomodoro_volume below 0 (boundary -1)', () => {
    const result = notificationsSchema.safeParse({
      pomodoro_sound: true,
      pomodoro_volume: -1,
      habit_reminders_enabled: true,
    })
    expect(result.success).toBe(false)
  })

  it('accepts pomodoro_volume at boundary 0', () => {
    const result = notificationsSchema.safeParse({
      pomodoro_sound: false,
      pomodoro_volume: 0,
      habit_reminders_enabled: true,
    })
    expect(result.success).toBe(true)
  })

  it('accepts pomodoro_volume at boundary 100', () => {
    const result = notificationsSchema.safeParse({
      pomodoro_sound: true,
      pomodoro_volume: 100,
      habit_reminders_enabled: true,
    })
    expect(result.success).toBe(true)
  })

  it('rejects pomodoro_volume above 100 (boundary 101)', () => {
    const result = notificationsSchema.safeParse({
      pomodoro_sound: true,
      pomodoro_volume: 101,
      habit_reminders_enabled: true,
    })
    expect(result.success).toBe(false)
  })

  it('rejects non-integer pomodoro_volume', () => {
    const result = notificationsSchema.safeParse({
      pomodoro_sound: true,
      pomodoro_volume: 50.5,
      habit_reminders_enabled: true,
    })
    expect(result.success).toBe(false)
  })

  it('rejects string for pomodoro_sound', () => {
    const result = notificationsSchema.safeParse({
      pomodoro_sound: 'yes',
      pomodoro_volume: 50,
      habit_reminders_enabled: true,
    })
    expect(result.success).toBe(false)
  })

  it('rejects string for habit_reminders_enabled', () => {
    const result = notificationsSchema.safeParse({
      pomodoro_sound: true,
      pomodoro_volume: 50,
      habit_reminders_enabled: 'true',
    })
    expect(result.success).toBe(false)
  })
})

// ════════════════════════════════════════════════════════════════════════════
// 2. updateNotifications action
// We call the REAL action here (not the mock) so we need to use the real module.
// But we mocked @/features/settings/preferences at the top… we need to bypass.
// Solution: test the action via the real implementation by calling the server
// module with proper supabase setup. The mock is only for the client components.
// ════════════════════════════════════════════════════════════════════════════
describe('updateNotifications action (real implementation)', () => {
  // We need the real preferences module — but vi.mock hoisted it.
  // Import the actual module directly to test it.
  // Since it's mocked, we can't get the real function through the alias.
  // Instead we import directly from the actual file path.
  let realUpdateNotifications: typeof import('@/features/settings/preferences').updateNotifications

  beforeEach(async () => {
    // Import the un-mocked version by importing the actual TS source
    const mod = await vi.importActual<typeof import('@/features/settings/preferences')>(
      '@/features/settings/preferences'
    )
    realUpdateNotifications = mod.updateNotifications
    vi.clearAllMocks()
  })

  it('returns VALIDATION_ERROR for volume 150 (forged input)', async () => {
    const result = await realUpdateNotifications({
      pomodoro_sound: true,
      pomodoro_volume: 150,
      habit_reminders_enabled: true,
    })
    expect(result.data).toBeNull()
    expect(result.error?.code).toBe('VALIDATION_ERROR')
  })

  it('calls upsert with the correct payload and returns data on success', async () => {
    const fakeRow = {
      user_id: 'user-123',
      notification_settings: { pomodoro_sound: true, pomodoro_volume: 50, habit_reminders_enabled: false },
      appearance_settings: { theme: 'system', accent_hue: 220 },
      created_at: '2026-01-01',
      updated_at: '2026-01-01',
    }
    setupSupabaseMock({ data: fakeRow, error: null })

    const result = await realUpdateNotifications({
      pomodoro_sound: true,
      pomodoro_volume: 50,
      habit_reminders_enabled: false,
    })

    expect(result.error).toBeNull()
    expect(result.data).toMatchObject({ user_id: 'user-123' })
    expect(mockUpsert).toHaveBeenCalledWith(
      expect.objectContaining({ user_id: 'user-123' }),
      { onConflict: 'user_id' }
    )
  })

  it('returns DB_ERROR when supabase returns an error', async () => {
    mockSingle.mockResolvedValue({ data: null, error: { message: 'db failure' } })
    mockSelect.mockReturnValue({ single: mockSingle })
    mockUpsert.mockReturnValue({ select: mockSelect })
    mockFrom.mockReturnValue({ upsert: mockUpsert })

    const result = await realUpdateNotifications({
      pomodoro_sound: false,
      pomodoro_volume: 0,
      habit_reminders_enabled: false,
    })
    expect(result.data).toBeNull()
    expect(result.error?.code).toBe('DB_ERROR')
  })
})

// ════════════════════════════════════════════════════════════════════════════
// 3. BrowserPermissionCard states
// ════════════════════════════════════════════════════════════════════════════
describe('BrowserPermissionCard', () => {
  function setPermission(state: 'granted' | 'denied' | 'default', requestReturn = state) {
    Object.defineProperty(window, 'Notification', {
      writable: true,
      configurable: true,
      value: {
        permission: state,
        requestPermission: vi.fn(async () => requestReturn),
      },
    })
  }

  beforeEach(() => {
    mockUpdateNotifications.mockImplementation(mockUpdateSuccess)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('shows "Allowed" when permission is granted', async () => {
    setPermission('granted')
    render(<BrowserPermissionCard />)
    await waitFor(() => expect(screen.getByText('Allowed')).toBeInTheDocument())
    expect(screen.queryByText('Enable')).toBeNull()
  })

  it('shows "Blocked" and help text when permission is denied', async () => {
    setPermission('denied')
    render(<BrowserPermissionCard />)
    await waitFor(() => expect(screen.getByText('Blocked')).toBeInTheDocument())
    expect(screen.getByText(/Open browser settings/)).toBeInTheDocument()
    expect(screen.queryByText('Enable')).toBeNull()
  })

  it('shows "Off" and Enable button when permission is default', async () => {
    setPermission('default')
    render(<BrowserPermissionCard />)
    await waitFor(() => expect(screen.getByText('Off')).toBeInTheDocument())
    expect(screen.getByRole('button', { name: 'Enable' })).toBeInTheDocument()
  })

  it('does NOT call requestPermission on mount', () => {
    const requestMock = vi.fn(async () => 'default' as const)
    Object.defineProperty(window, 'Notification', {
      writable: true,
      configurable: true,
      value: { permission: 'default', requestPermission: requestMock },
    })
    render(<BrowserPermissionCard />)
    expect(requestMock).not.toHaveBeenCalled()
  })

  it('calls requestPermission only when Enable is clicked', async () => {
    const requestMock = vi.fn(async () => 'granted' as const)
    Object.defineProperty(window, 'Notification', {
      writable: true,
      configurable: true,
      value: { permission: 'default', requestPermission: requestMock },
    })
    render(<BrowserPermissionCard />)
    await waitFor(() => screen.getByRole('button', { name: 'Enable' }))
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Enable' }))
    })
    expect(requestMock).toHaveBeenCalledTimes(1)
  })

  it('shows "Not supported" when Notification API is absent', async () => {
    const originalNotification = (window as unknown as Record<string, unknown>)['Notification']
    // @ts-expect-error — intentionally removing Notification to simulate old browser
    delete window.Notification
    render(<BrowserPermissionCard />)
    await waitFor(() => expect(screen.getByText('Not supported')).toBeInTheDocument())
    expect(screen.getByText(/not supported on this device/)).toBeInTheDocument()
    Object.defineProperty(window, 'Notification', {
      value: originalNotification,
      configurable: true,
      writable: true,
    })
  })
})

// ════════════════════════════════════════════════════════════════════════════
// 4. PomodoroSoundCard — debounce collapses rapid changes to one DB write
// ════════════════════════════════════════════════════════════════════════════
describe('PomodoroSoundCard debounce', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    mockUpdateNotifications.mockImplementation(mockUpdateSuccess)
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('fires exactly one DB write after 300 ms regardless of how many drag events fired', async () => {
    render(<PomodoroSoundCard initialSound={true} initialVolume={80} />)
    const slider = screen.getByLabelText('Alert volume')

    // Simulate rapid drag: fire 10 input events within < 300ms
    for (let v = 70; v >= 60; v--) {
      fireEvent.change(slider, { target: { value: String(v) } })
    }

    // Before debounce fires — no call yet
    expect(mockUpdateNotifications).not.toHaveBeenCalled()

    // Advance clock past debounce window
    await act(async () => {
      vi.advanceTimersByTime(350)
    })

    // Exactly one call despite 10 events
    expect(mockUpdateNotifications).toHaveBeenCalledTimes(1)
  })
})
