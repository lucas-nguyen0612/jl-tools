/**
 * account.test.tsx — Story 3: Account section tests
 *
 * Covers:
 * - Zod schema boundaries (emailUpdateSchema, passwordUpdateSchema, deleteAccountSchema)
 * - updateEmail: confirmation-sent happy path, same-email rejection
 * - updatePassword: happy path + wrong-current-password
 * - deleteAccount: re-auth gate + display_name mismatch
 * - DeleteAccountDialog: button-enable contract (both fields must match)
 * - clearThemeCookie called on sign-out (logout action)
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, fireEvent, waitFor } from '@testing-library/react'

// ────────────────────────────────────────────────────────────────────────────
// Hoisted mocks shared across vi.mock factories
// ────────────────────────────────────────────────────────────────────────────

const mocks = vi.hoisted(() => {
  const cookieStore = new Map<string, string>()

  return {
    cookieStore,
    state: {
      user: { id: 'u1', email: 'old@example.com' } as { id: string; email: string } | null,
      signInResult: { error: null } as { error: { message: string } | null },
      updateUserResult: { error: null } as { error: { message: string } | null },
      profileCharacterName: 'HeroOne',
      deleteUserResult: { error: null } as { error: { message: string } | null },
    },
    signInSpy: vi.fn(),
    updateUserSpy: vi.fn(),
    revalidateSpy: vi.fn(),
    clearCookieSpy: vi.fn(),
    deleteUserSpy: vi.fn(),
    signOutSpy: vi.fn(),
  }
})

// Mock next/headers for cookie operations
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

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
  usePathname: () => '/settings/account',
  useSearchParams: () => new URLSearchParams(),
}))

// Mock Supabase server client
vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(async () => ({
    auth: {
      getUser: vi.fn(async () => ({ data: { user: mocks.state.user } })),
      signInWithPassword: vi.fn(async ({ password }: { email: string; password: string }) => {
        mocks.signInSpy(password)
        return mocks.state.signInResult
      }),
      updateUser: vi.fn(async (payload: unknown) => {
        mocks.updateUserSpy(payload)
        return mocks.state.updateUserResult
      }),
      signOut: vi.fn(async () => {
        mocks.signOutSpy()
      }),
    },
    from: vi.fn((table: string) => {
      if (table === 'profiles') {
        return {
          select: () => ({
            eq: () => ({
              single: vi.fn(async () => ({
                data: { character_name: mocks.state.profileCharacterName },
                error: null,
              })),
              maybeSingle: vi.fn(async () => ({
                data: { character_name: mocks.state.profileCharacterName },
                error: null,
              })),
            }),
          }),
        }
      }
      return {}
    }),
  })),
}))

// Mock admin client
vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: vi.fn(() => ({
    auth: {
      admin: {
        deleteUser: vi.fn(async (_id: string) => {
          mocks.deleteUserSpy(_id)
          return mocks.state.deleteUserResult
        }),
      },
    },
  })),
}))

// Mock clearThemeCookie to track calls
vi.mock('@/lib/settings/theme-cookie', () => ({
  clearThemeCookie: vi.fn(async () => {
    mocks.clearCookieSpy()
    mocks.cookieStore.clear()
  }),
  writeThemeCookie: vi.fn(),
  readThemeCookie: vi.fn(async () => ({ theme: 'system', hue: 38 })),
  THEME_COOKIE: 'jl-theme',
  HUE_COOKIE: 'jl-hue',
  DEFAULT_THEME: 'system',
  DEFAULT_HUE: 38,
}))

// ────────────────────────────────────────────────────────────────────────────
// Imports (after mocks)
// ────────────────────────────────────────────────────────────────────────────

import {
  emailUpdateSchema,
  passwordUpdateSchema,
  deleteAccountSchema,
} from '@/features/settings/account-schemas'
import { updateEmail, updatePassword, deleteAccount } from '@/features/settings/account'
import { signOut } from '@/features/auth/actions'
import { DeleteAccountDialog } from '@/components/settings/DeleteAccountDialog'

// ────────────────────────────────────────────────────────────────────────────
// Reset before each test
// ────────────────────────────────────────────────────────────────────────────

beforeEach(() => {
  mocks.cookieStore.clear()
  mocks.state.user = { id: 'u1', email: 'old@example.com' }
  mocks.state.signInResult = { error: null }
  mocks.state.updateUserResult = { error: null }
  mocks.state.profileCharacterName = 'HeroOne'
  mocks.state.deleteUserResult = { error: null }
  mocks.signInSpy.mockClear()
  mocks.updateUserSpy.mockClear()
  mocks.revalidateSpy.mockClear()
  mocks.clearCookieSpy.mockClear()
  mocks.deleteUserSpy.mockClear()
  mocks.signOutSpy.mockClear()
})

// ════════════════════════════════════════════════════════════════════════════
// 1. Zod schema boundaries
// ════════════════════════════════════════════════════════════════════════════

describe('emailUpdateSchema', () => {
  it('accepts a valid email', () => {
    expect(emailUpdateSchema.safeParse({ new_email: 'new@example.com' }).success).toBe(true)
  })

  it('rejects an invalid email format', () => {
    expect(emailUpdateSchema.safeParse({ new_email: 'not-an-email' }).success).toBe(false)
  })

  it('rejects an empty string', () => {
    expect(emailUpdateSchema.safeParse({ new_email: '' }).success).toBe(false)
  })
})

describe('passwordUpdateSchema', () => {
  it('accepts valid current + new + confirm', () => {
    const r = passwordUpdateSchema.safeParse({
      current_password: 'OldPass1!',
      new_password: 'NewPass1!',
      confirm_password: 'NewPass1!',
    })
    expect(r.success).toBe(true)
  })

  it('rejects new < 8 chars', () => {
    expect(
      passwordUpdateSchema.safeParse({
        current_password: 'OldPass1!',
        new_password: 'short',
        confirm_password: 'short',
      }).success
    ).toBe(false)
  })

  it('rejects new == current (must differ)', () => {
    const r = passwordUpdateSchema.safeParse({
      current_password: 'SamePass1!',
      new_password: 'SamePass1!',
      confirm_password: 'SamePass1!',
    })
    expect(r.success).toBe(false)
    // Error should be on new_password path
    if (!r.success) {
      const paths = r.error.issues.map((i) => i.path.join('.'))
      expect(paths).toContain('new_password')
    }
  })

  it('rejects confirm != new (mismatch)', () => {
    const r = passwordUpdateSchema.safeParse({
      current_password: 'OldPass1!',
      new_password: 'NewPass1!',
      confirm_password: 'DifferentPass1!',
    })
    expect(r.success).toBe(false)
  })

  it('rejects current < 8 chars', () => {
    expect(
      passwordUpdateSchema.safeParse({
        current_password: 'short',
        new_password: 'NewPass1!',
        confirm_password: 'NewPass1!',
      }).success
    ).toBe(false)
  })
})

describe('deleteAccountSchema', () => {
  it('accepts valid character_name + password', () => {
    expect(
      deleteAccountSchema.safeParse({
        character_name_confirm: 'MyHero',
        password: 'SecurePass1!',
      }).success
    ).toBe(true)
  })

  it('rejects empty character_name_confirm', () => {
    expect(
      deleteAccountSchema.safeParse({
        character_name_confirm: '',
        password: 'SecurePass1!',
      }).success
    ).toBe(false)
  })

  it('rejects password < 8 chars', () => {
    expect(
      deleteAccountSchema.safeParse({
        character_name_confirm: 'MyHero',
        password: 'short',
      }).success
    ).toBe(false)
  })
})

// ════════════════════════════════════════════════════════════════════════════
// 2. updateEmail action
// ════════════════════════════════════════════════════════════════════════════

describe('updateEmail', () => {
  it('returns confirmation_sent: true on valid new email', async () => {
    const result = await updateEmail({ new_email: 'new@example.com' })
    expect(result.error).toBeNull()
    expect(result.data).toEqual({ confirmation_sent: true })
    expect(mocks.updateUserSpy).toHaveBeenCalledWith({ email: 'new@example.com' })
  })

  it('returns SAME_EMAIL when new email equals current', async () => {
    const result = await updateEmail({ new_email: 'old@example.com' })
    expect(result.data).toBeNull()
    expect(result.error?.code).toBe('SAME_EMAIL')
    expect(mocks.updateUserSpy).not.toHaveBeenCalled()
  })

  it('returns VALIDATION_ERROR for invalid email format', async () => {
    const result = await updateEmail({ new_email: 'not-valid' })
    expect(result.data).toBeNull()
    expect(result.error?.code).toBe('VALIDATION_ERROR')
    expect(mocks.updateUserSpy).not.toHaveBeenCalled()
  })

  it('returns AUTH_REQUIRED when user is not authenticated', async () => {
    mocks.state.user = null
    const result = await updateEmail({ new_email: 'new@example.com' })
    expect(result.data).toBeNull()
    expect(result.error?.code).toBe('AUTH_REQUIRED')
  })
})

// ════════════════════════════════════════════════════════════════════════════
// 3. updatePassword action
// ════════════════════════════════════════════════════════════════════════════

describe('updatePassword', () => {
  const validInput = {
    current_password: 'OldPass1!',
    new_password: 'NewPass1!',
    confirm_password: 'NewPass1!',
  }

  it('happy path: re-auths and updates password', async () => {
    const result = await updatePassword(validInput)
    expect(result.error).toBeNull()
    expect(mocks.signInSpy).toHaveBeenCalledWith('OldPass1!')
    expect(mocks.updateUserSpy).toHaveBeenCalledWith({ password: 'NewPass1!' })
  })

  it('returns INVALID_CREDENTIALS when current password is wrong', async () => {
    mocks.state.signInResult = { error: { message: 'Invalid login credentials' } }
    const result = await updatePassword(validInput)
    expect(result.data).toBeNull()
    expect(result.error?.code).toBe('INVALID_CREDENTIALS')
    // Must NOT proceed to updateUser
    expect(mocks.updateUserSpy).not.toHaveBeenCalled()
  })

  it('returns VALIDATION_ERROR when new password < 8 chars', async () => {
    const result = await updatePassword({
      current_password: 'OldPass1!',
      new_password: 'short',
      confirm_password: 'short',
    })
    expect(result.data).toBeNull()
    expect(result.error?.code).toBe('VALIDATION_ERROR')
    expect(mocks.signInSpy).not.toHaveBeenCalled()
  })

  it('returns VALIDATION_ERROR when new == current', async () => {
    const result = await updatePassword({
      current_password: 'SamePass1!',
      new_password: 'SamePass1!',
      confirm_password: 'SamePass1!',
    })
    expect(result.data).toBeNull()
    expect(result.error?.code).toBe('VALIDATION_ERROR')
  })

  it('returns AUTH_REQUIRED when not authenticated', async () => {
    mocks.state.user = null
    const result = await updatePassword(validInput)
    expect(result.data).toBeNull()
    expect(result.error?.code).toBe('AUTH_REQUIRED')
  })
})

// ════════════════════════════════════════════════════════════════════════════
// 4. deleteAccount action
// ════════════════════════════════════════════════════════════════════════════

describe('deleteAccount', () => {
  const validInput = {
    character_name_confirm: 'HeroOne',
    password: 'SecurePass1!',
  }

  it('happy path: re-auths, deletes, clears cookies, signs out', async () => {
    const result = await deleteAccount(validInput)
    expect(result.error).toBeNull()
    expect(mocks.signInSpy).toHaveBeenCalledWith('SecurePass1!')
    expect(mocks.deleteUserSpy).toHaveBeenCalledWith('u1')
    expect(mocks.clearCookieSpy).toHaveBeenCalled()
    expect(mocks.signOutSpy).toHaveBeenCalled()
    expect(mocks.revalidateSpy).toHaveBeenCalledWith('/', 'layout')
  })

  it('returns DISPLAY_NAME_MISMATCH when name does not match profile', async () => {
    const result = await deleteAccount({
      character_name_confirm: 'WrongName',
      password: 'SecurePass1!',
    })
    expect(result.data).toBeNull()
    expect(result.error?.code).toBe('DISPLAY_NAME_MISMATCH')
    // Must NOT proceed to sign-in or delete
    expect(mocks.signInSpy).not.toHaveBeenCalled()
    expect(mocks.deleteUserSpy).not.toHaveBeenCalled()
  })

  it('returns INVALID_CREDENTIALS when password is wrong (re-auth gate)', async () => {
    mocks.state.signInResult = { error: { message: 'Invalid login credentials' } }
    const result = await deleteAccount(validInput)
    expect(result.data).toBeNull()
    expect(result.error?.code).toBe('INVALID_CREDENTIALS')
    // Must NOT proceed to delete
    expect(mocks.deleteUserSpy).not.toHaveBeenCalled()
    expect(mocks.clearCookieSpy).not.toHaveBeenCalled()
  })

  it('returns AUTH_REQUIRED when not authenticated', async () => {
    mocks.state.user = null
    const result = await deleteAccount(validInput)
    expect(result.data).toBeNull()
    expect(result.error?.code).toBe('AUTH_REQUIRED')
  })

  it('returns VALIDATION_ERROR for empty character_name', async () => {
    const result = await deleteAccount({ character_name_confirm: '', password: 'SecurePass1!' })
    expect(result.data).toBeNull()
    expect(result.error?.code).toBe('VALIDATION_ERROR')
  })
})

// ════════════════════════════════════════════════════════════════════════════
// 5. DeleteAccountDialog — button-enable contract
// ════════════════════════════════════════════════════════════════════════════

describe('DeleteAccountDialog — button enable contract', () => {
  const CHARACTER_NAME = 'HeroOne'

  function setup() {
    const utils = render(<DeleteAccountDialog characterName={CHARACTER_NAME} />)
    // Open the dialog
    const trigger = utils.getByRole('button', { name: /delete account/i })
    fireEvent.click(trigger)
    return utils
  }

  it('renders the trigger button', () => {
    const { getByRole } = render(<DeleteAccountDialog characterName={CHARACTER_NAME} />)
    expect(getByRole('button', { name: /delete account/i })).toBeInTheDocument()
  })

  it('destructive button is disabled when both inputs are empty', async () => {
    const { getByRole } = setup()
    await waitFor(() => {
      const deleteBtn = getByRole('button', { name: /delete my account/i })
      expect(deleteBtn).toBeDisabled()
    })
  })

  it('destructive button stays disabled when only name matches', async () => {
    const { getByRole, getByLabelText } = setup()
    await waitFor(() => getByLabelText(/display name confirmation/i))

    fireEvent.change(getByLabelText(/display name confirmation/i), {
      target: { value: CHARACTER_NAME },
    })
    // password still empty
    const deleteBtn = getByRole('button', { name: /delete my account/i })
    expect(deleteBtn).toBeDisabled()
  })

  it('destructive button stays disabled when only password is filled but name is wrong', async () => {
    const { getByRole, getByLabelText } = setup()
    await waitFor(() => getByLabelText(/display name confirmation/i))

    fireEvent.change(getByLabelText(/display name confirmation/i), {
      target: { value: 'WrongName' },
    })
    fireEvent.change(getByLabelText(/password for account deletion/i), {
      target: { value: 'SecurePass1!' },
    })
    const deleteBtn = getByRole('button', { name: /delete my account/i })
    expect(deleteBtn).toBeDisabled()
  })

  it('destructive button enables when BOTH name matches AND password >= 8 chars', async () => {
    const { getByRole, getByLabelText } = setup()
    await waitFor(() => getByLabelText(/display name confirmation/i))

    fireEvent.change(getByLabelText(/display name confirmation/i), {
      target: { value: CHARACTER_NAME },
    })
    fireEvent.change(getByLabelText(/password for account deletion/i), {
      target: { value: 'SecurePass1!' },
    })
    const deleteBtn = getByRole('button', { name: /delete my account/i })
    expect(deleteBtn).not.toBeDisabled()
  })
})

// ════════════════════════════════════════════════════════════════════════════
// 6. clearThemeCookie called on sign-out (logout action)
// ════════════════════════════════════════════════════════════════════════════

describe('signOut (logout action)', () => {
  it('calls clearThemeCookie before signOut', async () => {
    // Seed a cookie so we can verify it's cleared
    mocks.cookieStore.set('jl-theme', 'dark')

    await signOut()

    expect(mocks.clearCookieSpy).toHaveBeenCalled()
    expect(mocks.signOutSpy).toHaveBeenCalled()
    // clearThemeCookie clears the store
    expect(mocks.cookieStore.size).toBe(0)
  })

  it('revalidates layout after sign-out', async () => {
    await signOut()
    expect(mocks.revalidateSpy).toHaveBeenCalledWith('/', 'layout')
  })
})
