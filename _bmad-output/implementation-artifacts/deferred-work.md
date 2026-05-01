# Deferred Work

Goals split out of larger intents during quick-dev routing. Each entry can be picked up as its own spec via `bmad-quick-dev`.

---

## From: spec-1-settings-shell review (2026-04-28)

Pre-existing or out-of-scope concerns surfaced by the 3-reviewer pass on Story 1. Each is real but does not block shipping the shell.

- **Project-wide focus-visible audit.** `SideNav.tsx`, `BottomNav.tsx`, and the new settings nav all rely on inline `style={{...}}` and have no `:focus-visible` ring. Keyboard users get no visible focus indicator on any nav link. Fix as a separate UX/a11y pass — adding rings to settings only would be inconsistent.
- **BottomNav 6-column cramping on small phones.** Spec already flagged this in *Ask First*. Verify on iPhone SE / 360px-wide viewport once `pnpm dev` is up; if labels truncate, fallback options are documented in the spec Design Notes.
- **Sidebar "Settings" header vs `TopBar` title double-display.** On desktop `/settings` index, the sidebar shows a "Settings" header AND the page renders `<TopBar title="Settings" />`. Two visible "Settings" headings side-by-side. Decide whether to drop the sidebar header, drop the TopBar on the index page, or accept it as section labeling redundancy.
- **Missing `loading.tsx` / `error.tsx` / `not-found.tsx` for `app/(app)/*` segments.** Pre-existing convention — none of `dashboard`, `pomodoro`, `habits`, `flashcards`, `character` have these either. Address project-wide; not specific to settings.
- **Settings layout overflow + fixed BottomNav clipping.** The layout uses `flex h-full overflow-hidden` and the parent `(app)/layout.tsx` has `pb-16 md:pb-0`. Verify visually that the last item in `SettingsSectionList` is not obscured by the now-taller 6-cell BottomNav on short mobile viewports.
- **Middleware `/auth/login` vs layout `/login` redirect inconsistency.** `lib/supabase/proxy.ts:58` redirects unauthenticated users to `/auth/login`; `app/(app)/layout.tsx:9` redirects to `/login`. Both routes exist so neither is broken, but the inconsistency is an existing trap. Pick one and unify.

---

## From: spec-4-appearance review (2026-04-28)

Findings from the 3-reviewer pass on Story 4 that don't block ship — each should become its own focused follow-up.

- **System theme not reactive to OS changes.** `ThemeRadio` reads `matchMedia('(prefers-color-scheme: dark)')` once at click time, and the inline pre-paint script does the same on first paint. After load, switching the OS theme while `system` is selected does nothing until the page reloads. Add a `change` listener inside `applyThemeClass`, gated on `theme === 'system'`. (Findings F3 / E9.)
- **Sign-out doesn't clear theme cookies.** `clearThemeCookie()` exists but is never wired. On shared devices, User A's cookie leaks into User B's pre-login experience (User B sees A's theme until login fires `syncAppearanceCookies`). Wire it into the existing sign-out flow once that path is touched. (Finding E12.)
- **ThemeRadio rapid-click race.** Multiple in-flight transitions can roll back to a stale `previous` from an earlier closure. Bound on `useTransition` ordering, but worst-case the visible state desyncs from the cookie/DB. Add an in-flight guard or version token. (Finding E8.)
- **Cookie `secure` flag.** `jl-theme` and `jl-hue` cookies are served without `secure` — fine in dev over HTTP, but production should set `secure: true`. Decide via env-aware option. (Finding F7.)
- **DB CHECK constraint on `appearance_settings`.** Hue is bounded only at the application layer (Zod). A future code path could write garbage. Add a `CHECK ((appearance_settings->>'accent_hue')::int BETWEEN 0 AND 360)` and a similar enum check on `theme`. (Finding F6.)
- **Test: assert exactly one DB write after rapid hue drags.** Spec AC says "exactly one DB write fires 300ms after release"; the unit suite covers Zod and the action shape but not the debounce-collapses-to-one invariant. Add a fake-timer test on `HueSlider`. (Finding A8.)
- **Runtime validation when reading `appearance_settings` JSONB.** `AppearanceSection` trusts the row's typed shape and only nullish-coalesces. Corrupt/legacy rows with `theme: "neon"` would propagate. Pass through `appearanceSchema.safeParse` on read. (Finding E11.)

---

## From: docs/features/user-settings.md (split 2026-04-28)

Source intent: convert the User Settings doc into implementation specs. Lucas chose to split — Story 1 (shell + nav) is being repackaged as `spec-1-settings-shell.md`. The remaining 5 stories below are deferred and need their own specs when ready.

**Cross-cutting open questions still unanswered (block specs as noted):**

1. **Schema canonical** (`profiles.display_name` per `00001` vs `character_name` per `001`). Runtime currently reads `character_name` (`app/(app)/character/page.tsx`, `(app)/layout.tsx`). Required before Story 2.
2. **Delete account approach**: `auth.admin.deleteUser` (Service Role key) vs Postgres RPC `SECURITY DEFINER`. Required before Story 3.
3. **Avatar default**: Dicebear external URL vs local placeholder. CSP implications. Required before Story 2.

---

### Story 2 — Profile section

**Goal:** edit `display_name` (or `character_name`) and avatar (upload/remove) at `/settings/profile`. Avatar persists in Supabase Storage bucket `avatars`. Character page deep-links here.

**Blocked by:** open question 1, 3. Schema verify task (doc Story 2.0).

**Touches:** migration for `avatars` bucket + storage RLS, `features/settings/profile.ts` (server actions), `components/settings/ProfileSection.tsx` + `AvatarUpload.tsx`, `hooks/useSettings.ts` (TanStack Query), Character page avatar `<Link>`.

**Size:** M

---

### Story 3 — Account section

**Goal:** change email, change password (with current-password verify), delete account (hard confirm via display name + password) at `/settings/account`.

**Blocked by:** open question 2.

**Touches:** `features/settings/account.ts`, `components/settings/AccountSection.tsx` + `DeleteAccountDialog.tsx`. Audit FK cascades on `auth.users` (spot-check OK per doc).

**Size:** S

---

### Story 4 — Appearance section

**Goal:** theme (light/dark/system) + accent_hue (0–360) at `/settings/appearance`. Cookie ↔ DB sync for zero-FOUC SSR. Brings the `user_preferences` migration (`00022`).

**Touches:** migration `00022_user_preferences.sql` + `handle_new_user` extension, `features/settings/preferences.ts` (`updateAppearance`), `lib/settings/theme-cookie.ts`, `app/(app)/layout.tsx` cookie read + class/CSS-var inject, `components/settings/AppearanceSection.tsx` + `ThemeRadio.tsx` + `HueSlider.tsx`.

**Size:** S–M

---

### Story 5 — Notifications section

**Goal:** Pomodoro sound toggle + volume slider, habit reminders master toggle, browser permission status at `/settings/notifications`. Reuses migration from Story 4.

**Blocked by:** Story 4 migration (shares `user_preferences.notification_settings`).

**Touches:** `features/settings/preferences.ts` (`updateNotifications`), `components/settings/NotificationsSection.tsx`, hook for `Notification.permission`, wire Pomodoro/Habit hooks to read preferences.

**Size:** S

---

### Story 6 — About section

**Goal:** static page at `/settings/about` showing app name, version (from `package.json`), build date, feedback link, ToS/Privacy placeholders.

**Touches:** `components/settings/AboutSection.tsx`, `next.config.ts` env injection for version.

**Size:** XS
