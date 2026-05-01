/**
 * Auth Zustand store
 * Manages client-side auth session state — mutations go through actions.ts
 */
import { create } from 'zustand'
import type { Profile } from './types'

type AuthState = {
  /** Authenticated user profile (null if not signed in) */
  profile: Profile | null
  /** User ID of the currently authenticated user */
  userId: string | null
  /** Whether the auth state has been loaded from the server */
  isLoaded: boolean
}

type AuthActions = {
  /** Set the authenticated profile (called after session fetch) */
  setProfile: (profile: Profile | null, userId: string | null) => void
  /** Clear the session (called on sign-out) */
  clearSession: () => void
}

type AuthStore = AuthState & AuthActions

const initialState: AuthState = {
  profile: null,
  userId: null,
  isLoaded: false,
}

export const useAuthStore = create<AuthStore>((set) => ({
  ...initialState,

  setProfile: (profile, userId) =>
    set({ profile, userId, isLoaded: true }),

  clearSession: () => set(initialState),
}))
