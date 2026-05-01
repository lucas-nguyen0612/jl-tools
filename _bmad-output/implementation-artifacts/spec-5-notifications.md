---
title: 'Notifications section — Pomodoro sound, habit reminders, browser permission'
type: 'feature'
created: '2026-04-28'
status: 'draft'
baseline_commit: '0909549ac3f680cd3bbdda2562eb902e5f9031c9'
context:
  - '{project-root}/CLAUDE.md'
  - '{project-root}/docs/features/user-settings.md'
  - '{project-root}/_bmad-output/implementation-artifacts/spec-1-settings-shell.md'
  - '{project-root}/_bmad-output/implementation-artifacts/spec-4-appearance.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** `/settings/notifications` is a placeholder. The `user_preferences.notification_settings` JSONB column already exists (added by `00022_user_preferences.sql` in spec-4) but no UI surfaces it and no Pomodoro / Habit code reads from it. Users cannot mute Pomodoro alerts, set their preferred volume, disable habit reminders, or check / grant browser notification permission.

**Approach:** Add a single Server Action `updateNotifications` that writes to the existing `notification_settings` JSONB. Render `NotificationsSection` with three cards: Pomodoro sound (toggle + volume slider, debounced), Habit reminder master toggle, Browser permission status (read-only from `Notification.permission` + button calling `Notification.requestPermission()`). Wire the existing Pomodoro timer-end alert and Habit reminder check to read these preferences instead of hard-coded defaults.

## Open Questions — clarify before execution

1. **What "Pomodoro sound" means.** Two candidates and they are NOT the same thing:
   - **The timer-end alert** — short ding when a focus session ends. Currently hard-coded (or absent). Story 5 owns toggling this.
   - **The ambient soundscape** — `pomo_sessions.soundscape` + `pomo_sessions.soundscape_volume` from `00020_pomodoro_character_stats_mirror.sql` and `00021_pomodoro_soundscapes.sql`. Per-session, already user-controllable inside the timer UI.
   Master doc Story 5 says "Pomodoro sound (toggle + volume slider)" — the most natural reading is **timer-end alert**, not soundscape. Confirm before implementation; if Lucas wants soundscape toggle here too, the spec doubles in size.
2. **Habit reminder logic location.** Existing habit code may not have a "master toggle" concept. Confirm whether to:
   - **Option A:** Add a guard in the existing reminder code path that early-returns when `habit_reminders_enabled = false`. (Smaller change.)
   - **Option B:** Refactor reminder scheduling to read prefs at schedule time. (Larger change, only worth it if reminders are actually scheduled — out of scope for the lean MVP per master doc.)
   The master doc explicitly defers browser-push subscription, so reminders are likely just in-app surface today. Default to Option A.

Spec body below assumes timer-end alert (Q1) + Option A (Q2).

## Boundaries & Constraints

**Always:**
- Reuse migration `00022_user_preferences.sql`. Do NOT add a new migration unless we need a CHECK constraint on the JSONB shape.
- `updateNotifications` returns `ActionResult<UserPreferences>`; same pattern as `updateAppearance` in `features/settings/preferences.ts`.
- Volume slider debounces DB writes 300 ms (mirror `HueSlider` mount-guard + debounce pattern from spec-4).
- `Notification.permission` is read client-side only. Server cannot know it.
- Pomodoro timer-end audio reads `notification_settings.pomodoro_sound` + `pomodoro_volume` at firing time, not at component mount (so toggle takes effect immediately on next session end without reload).
- Habit reminder check reads `habit_reminders_enabled` at the same moment.
- All Zod gates: `pomodoro_sound: boolean`, `pomodoro_volume: int 0–100`, `habit_reminders_enabled: boolean`.

**Ask First:**
- Open Questions 1 + 2.
- Touching `pomo_sessions.soundscape*` columns or the soundscape player. Out of scope for this story unless Q1 expands it.
- Adding a DB CHECK constraint on `notification_settings` JSONB shape — `deferred-work.md` already notes this for `appearance_settings`; could be bundled into one follow-up migration but not required for ship.

**Never:**
- Do not request notification permission on page load. Permission requests must originate from a user gesture (`onClick`) or the browser blocks future requests.
- Do not silently fail the action when the JSONB write succeeds but `revalidatePath` doesn't — surface revalidate errors to console.
- Do not implement browser-push subscription / Service Worker / VAPID. Master doc explicitly defers these.
- Do not implement Profile / Account / About (separate specs).

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Behavior |
|----------|---------------|-------------------|
| Read notifications page | Authenticated | Three cards: Pomodoro (toggle + slider), Habit (toggle), Browser permission (status + action button) |
| Toggle Pomodoro sound off | Click toggle | DB writes `pomodoro_sound: false`; volume slider disables/dims |
| Drag Pomodoro volume 70 → 35 | Slider | Live value visible during drag; one DB write 300 ms after release |
| Pomodoro session ends with sound off | Timer fires complete | No alert audio plays; visual completion indicator still shows |
| Pomodoro session ends with sound on, volume 35 | Timer fires complete | Alert audio plays at 35% volume |
| Toggle habit reminders off | Click toggle | DB writes `habit_reminders_enabled: false`; future reminder checks early-return |
| Browser permission `default` | Initial state | Card shows "Browser notifications: Off" + "Enable" button |
| Click "Enable" | Permission `default` → click | `Notification.requestPermission()` prompts; on grant → status updates to `granted`; on deny → status `denied` |
| Browser permission `denied` | Pre-blocked | Status shows "Blocked" with help text "Open browser settings to allow notifications for this site" — no button, since the browser will silently no-op repeated requests |
| Browser permission `granted` | Already granted | Status shows "Allowed"; button hidden |
| Bad input (`pomodoro_volume: 150`) | Forged form | Zod rejects; action returns `{ data: null, error: { code: 'VALIDATION_ERROR' } }` |
| User on a browser without `Notification` API (older Safari, in-app webview) | Feature detect | Card shows "Browser notifications not supported on this device" — no toggle |
| Rapid toggle bounce (on/off/on/off in 200 ms) | Multiple clicks | Last value wins in DB; no race condition (`useTransition` ordering, mirror ThemeRadio pattern) |

</frozen-after-approval>

## Code Map

- `features/settings/notification-schemas.ts` — NEW. Zod `notificationsSchema` (`pomodoro_sound: z.boolean()`, `pomodoro_volume: z.number().int().min(0).max(100)`, `habit_reminders_enabled: z.boolean()`).
- `features/settings/preferences.ts` — EDIT. Add `updateNotifications(input)` action mirroring `updateAppearance` shape: validate via Zod → upsert JSONB merge → `revalidatePath('/', 'layout')` → return `ActionResult<UserPreferences>`. Use the same `as never` workaround on `from('user_preferences').upsert(...)` per spec-4 Spec Change Log.
- `components/settings/NotificationsSection.tsx` — NEW. Server component. Fetches current `user_preferences`. Passes initial values + `Notification.permission` placeholder (resolved client-side) to children.
- `components/settings/PomodoroSoundCard.tsx` — NEW. `'use client'`. Toggle (shadcn `Switch`) + slider (shadcn `Slider` 0–100). Optimistic state; debounced action call (300 ms ref-based pattern from `HueSlider.tsx:34`).
- `components/settings/HabitReminderCard.tsx` — NEW. `'use client'`. Single toggle.
- `components/settings/BrowserPermissionCard.tsx` — NEW. `'use client'`. `useEffect` reads `Notification.permission` + listens for `change` event on `navigator.permissions.query({ name: 'notifications' })` (graceful degrade if unsupported). Button calls `Notification.requestPermission()` only on click.
- `hooks/useBrowserNotificationPermission.ts` — NEW. Wraps the read + change-listener; returns `{ permission, isSupported, request }`.
- `app/(app)/settings/notifications/page.tsx` — EDIT. Replace placeholder with `<NotificationsSection />`.
- `features/pomodoro/...` — EDIT (call site to be confirmed during implementation). Wherever the timer fires the end-of-session alert, read `user_preferences.notification_settings.pomodoro_sound` and `pomodoro_volume` before playing audio. Likely candidates: `features/pomodoro/store.ts`, `features/pomodoro/actions.ts`, or a new hook fetching prefs once per session.
- `features/habits/...` — EDIT (call site to be confirmed). Wherever habit reminders fire / render, gate on `habit_reminders_enabled`.
- `__tests__/notifications.test.tsx` — NEW. Vitest + RTL: Zod boundaries (volume 0/100/-1/101, booleans), `updateNotifications` happy path (upsert payload + revalidate called), permission-card states (`default` / `granted` / `denied` / unsupported), debounce-collapses-to-one (fake timers, mirror the unwritten test from spec-4 deferred-work).

## Tasks & Acceptance

**Execution:**
- [ ] Lucas confirms Open Questions 1 + 2; capture decision in Spec Change Log
- [ ] `features/settings/notification-schemas.ts` — Zod
- [ ] `features/settings/preferences.ts` — add `updateNotifications`
- [ ] `hooks/useBrowserNotificationPermission.ts` — permission state + listener
- [ ] `components/settings/NotificationsSection.tsx` — server shell
- [ ] `components/settings/PomodoroSoundCard.tsx` — toggle + slider with debounce
- [ ] `components/settings/HabitReminderCard.tsx` — toggle
- [ ] `components/settings/BrowserPermissionCard.tsx` — status + request button
- [ ] `app/(app)/settings/notifications/page.tsx` — render section
- [ ] Wire Pomodoro timer-end audio to read `notification_settings`
- [ ] Wire habit reminder gate to read `habit_reminders_enabled`
- [ ] `__tests__/notifications.test.tsx` — I/O matrix coverage

**Acceptance Criteria:**
- Given an authenticated user on `/settings/notifications`, when the page renders, then three cards show with current values from `user_preferences.notification_settings`.
- Given a user toggles Pomodoro sound off, when the next focus session ends, then no alert audio plays.
- Given a user changes Pomodoro volume to 35, when the next session ends with sound on, then alert audio plays at volume 0.35.
- Given a user disables habit reminders, when the reminder check runs, then it early-returns and no UI surface fires.
- Given browser permission is `default`, when the user clicks Enable and grants, then status updates to `granted` without page reload.
- Given browser permission is `denied`, when the user views the card, then they see help text and no Enable button.
- Given a user drags the volume slider rapidly, when they release, then exactly one DB write fires 300 ms after release.
- Given malformed input (`pomodoro_volume: 150`), when the action runs, then it returns `VALIDATION_ERROR` and writes nothing.

## Spec Change Log

_(Empty — populated during/after implementation review.)_

## Design Notes

**Why piggyback on the existing migration.** `00022_user_preferences.sql` already shipped both `appearance_settings` and `notification_settings` JSONB columns with sensible defaults. Adding a new migration just to expose the second JSONB would be churn.

**JSONB merge over full overwrite.** `updateNotifications` writes the full `notification_settings` object every time (same shape as `updateAppearance`). This is fine because the column has only three keys; partial-merge complexity isn't justified.

**Why no DB CHECK constraint yet.** `deferred-work.md` already flagged this for `appearance_settings`. When that follow-up lands, bundle a CHECK on `notification_settings` shape too. Skipping for now keeps Story 5 lean.

**Browser permission API quirks.** Safari returns `granted/denied/default` like Chrome but doesn't fire `permissionschange` for the legacy `Notification.permission` getter. The hook listens on `navigator.permissions.query({ name: 'notifications' })` for compatible browsers and falls back to a one-shot read elsewhere. Acceptable degradation: in fallback mode, the card needs a refresh to reflect a permission change made in browser settings.

**Why request only on click.** Per Mozilla docs and Chrome UX guidelines, calling `requestPermission()` outside a user gesture either silently fails or trains the browser to auto-deny future requests. The button MUST be the entry point.

## Verification

**Commands:**
- `pnpm type-check` — passes.
- `pnpm lint` — no new errors in changed paths.
- `pnpm test __tests__/notifications.test.tsx` — all pass.
- `pnpm dev` then on `/settings/notifications`: toggle each card, drag volume, run a Pomodoro session with sound off then on at low volume, verify habit reminder gate (manual depending on existing reminder UX), test browser permission grant + deny flow.
