---
title: 'Account section — email, password, delete account'
type: 'feature'
created: '2026-04-28'
status: 'draft'
baseline_commit: '0909549ac3f680cd3bbdda2562eb902e5f9031c9'
context:
  - '{project-root}/CLAUDE.md'
  - '{project-root}/docs/features/user-settings.md'
  - '{project-root}/_bmad-output/implementation-artifacts/spec-1-settings-shell.md'
  - '{project-root}/_bmad-output/implementation-artifacts/spec-4-appearance.md'
  - '{project-root}/_bmad-output/implementation-artifacts/deferred-work.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** `/settings/account` is a placeholder. Users have no in-app path to change email, change password, or delete their account. The current sign-out flow (`components/features/logout-button.tsx`) also leaks theme cookies between users on shared devices (deferred from spec-4).

**Approach:** Three Server Actions for the trust-critical operations: `updateEmail` (Supabase confirmation flow), `updatePassword` (re-auth with current password + `auth.updateUser`), `deleteAccount` (re-auth + privileged user delete via decision in Open Question 1). All re-auth uses `signInWithPassword` to verify current password before mutation. Delete-account UX: hard confirm dialog requiring both display name AND password typed correctly. Wire `clearThemeCookie()` into the sign-out + delete flows to close the cross-user leak.

## Decisions (locked 2026-04-28)

**Q1 Delete account — Option A: Service Role admin client.** New `lib/supabase/admin.ts` exports a server-only `createAdminClient()` factory using `SUPABASE_SERVICE_ROLE_KEY`. The `deleteAccount` action calls `adminClient.auth.admin.deleteUser(userId)` after re-auth. Standard Supabase pattern, single env var, no Postgres RPC migration needed.

**Q2 Re-auth UX — 3 fields + surface toast.** Password form has Current password / New password / Confirm new password. After a successful password change, surface toast: `For security, we signed you out on other devices`.

## Boundaries & Constraints

**Always:**
- All actions return `ActionResult<T>`.
- Re-auth before any mutation that requires the current password: pass `(email, current_password)` to `signInWithPassword` on a fresh server client; on success, run the mutation; on failure, return `{ data: null, error: { code: 'INVALID_CREDENTIALS' } }`.
- Email change goes through Supabase's built-in confirmation flow (`auth.updateUser({ email })` triggers a confirmation email; the new email is NOT live until the user clicks the link). UI must say "Check your inbox" rather than implying success.
- Delete confirmation requires the user to type **exact** display name AND current password. Both fields must match before the destructive button enables.
- After delete, run `clearThemeCookie()`, sign out, then redirect to landing (`/`). FK cascades on `auth.users` (verified per master doc) handle row cleanup.
- Wire `clearThemeCookie()` into `components/features/logout-button.tsx` — closes the deferred-work leak from spec-4.

**Ask First:**
- Adding any new env var beyond `SUPABASE_SERVICE_ROLE_KEY` — must be set in Vercel + `.env.example` synchronized.
- Changing the redirect target after delete (default: `/`).

**Never:**
- Do not call `auth.admin.*` from a browser-side or anon-keyed client. Service Role key is server-only.
- Do not skip current-password re-auth for password change. Supabase's `updateUser({ password })` doesn't enforce it server-side.
- Do not delete the user row before running `clearThemeCookie()` and `signOut()` — order matters for cookie cleanup and session invalidation.
- Do not implement Profile / Notifications / About (separate specs).

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Behavior |
|----------|---------------|-------------------|
| Read account page | Authenticated | Email shown read-only; password form (current + new + optional confirm); danger-zone delete card |
| Change email valid | New email differs, format valid | Action returns `{ data: { confirmation_sent: true }, error: null }`; UI swaps to "Check your inbox at {newEmail}" |
| Change email same as current | Same email | Inline Zod error; no Supabase call |
| Change email invalid format | `foo@bar` | Zod rejects; no call |
| Change password valid (current correct) | Current+new+confirm | Re-auth succeeds; password updates; UI shows two toasts: `Password updated` + `For security, we signed you out on other devices` |
| Change password current wrong | Wrong current | Action returns `{ error: { code: 'INVALID_CREDENTIALS' } }`; inline error on Current field |
| Change password new < 8 chars | Short new | Zod rejects |
| Change password new == current | Same value | Zod rejects with `New password must differ from current` |
| Open delete dialog | Click `Delete account` | Modal opens with two inputs (display name, current password) and disabled red button |
| Type display name correctly + password correctly | Both match | Button enables; click → re-auth → privileged delete (per Q1) → `clearThemeCookie()` → `signOut()` → `redirect('/')` with toast `Account deleted` |
| Type display name correctly + password wrong | Name OK, pwd wrong | Re-auth fails; modal shows error; no delete |
| Type display name wrong | Name mismatch | Button stays disabled; no submission possible |
| Tab away mid-delete | Race | In-flight request completes; if user is already gone, redirect chain still runs (no-op locally) |
| User has FK rows in pomo_sessions / habits / flashcards / xp_transactions | Cascade delete | All rows go via `ON DELETE CASCADE` on `auth.users` (audited) |
| Sign out (separately) | Click logout | `clearThemeCookie()` runs before `signOut()`; cookies gone; next user on device sees default theme |

</frozen-after-approval>

## Code Map

- `features/settings/account-schemas.ts` — NEW. Zod: `emailUpdateSchema` (`z.string().email()` + differs from current), `passwordUpdateSchema` (current min 8, new min 8, new ≠ current, confirm matches new), `deleteAccountSchema` (`character_name_confirm` string, password min 8).
- `features/settings/account.ts` — NEW. `'use server'`. Three actions:
  - `updateEmail({ new_email })` → re-auth not required (Supabase emails confirmation link to NEW address). Calls `supabase.auth.updateUser({ email })`. Returns `ActionResult<{ confirmation_sent: true }>`.
  - `updatePassword({ current, new })` → re-auth via `signInWithPassword({ email: user.email, password: current })` on a fresh server client. On success, `supabase.auth.updateUser({ password: new })`. Returns `ActionResult<void>`.
  - `deleteAccount({ character_name_confirm, password })` → re-auth same pattern; verify `character_name_confirm` equals current `profiles.character_name`; import `createAdminClient()` from new `lib/supabase/admin.ts` (Service Role keyed, server-only); call `adminClient.auth.admin.deleteUser(userId)`. After delete: `clearThemeCookie()`, `supabase.auth.signOut()`, `revalidatePath('/', 'layout')`. Returns `ActionResult<void>` (success usually unobserved — user is logged out).
- `lib/supabase/admin.ts` — NEW. `createAdminClient()` factory using `SUPABASE_SERVICE_ROLE_KEY`. Throw if env missing. Comment marking it as server-only — never import from a `'use client'` file or any module that runs in the browser bundle.
- `.env.example` — EDIT. Add `SUPABASE_SERVICE_ROLE_KEY=` placeholder with security warning comment (Vercel-only secret, do not commit real value).
- `components/settings/AccountSection.tsx` — NEW. Server component. Fetches `user.email` and `profiles.character_name`. Passes to client children.
- `components/settings/EmailChangeForm.tsx` — NEW. `'use client'`. RHF + Zod. On success swap to "Check your inbox" message until route change.
- `components/settings/PasswordChangeForm.tsx` — NEW. `'use client'`. RHF + Zod. 3 fields: Current password, New password, Confirm new password.
- `components/settings/DeleteAccountDialog.tsx` — NEW. `'use client'`. Controlled inputs gating button enablement; both must match before submit. Uses shadcn `Dialog`.
- `app/(app)/settings/account/page.tsx` — EDIT. Replace placeholder with `<AccountSection />`.
- `components/features/logout-button.tsx` — EDIT (~3 lines). Call `clearThemeCookie()` before `supabase.auth.signOut()` (closes deferred-work leak).
- `__tests__/account.test.tsx` — NEW. Vitest + RTL. Zod boundaries; `updateEmail` confirmation-sent path; `updatePassword` happy + wrong-current; `deleteAccount` re-auth gate + display_name mismatch; dialog button-enable contract; `clearThemeCookie` called on logout.

## Tasks & Acceptance

**Execution:**
- [ ] `features/settings/account-schemas.ts` — Zod
- [ ] `features/settings/account.ts` — three actions
- [ ] `lib/supabase/admin.ts` — Service Role admin client factory (server-only)
- [ ] `.env.example` — add `SUPABASE_SERVICE_ROLE_KEY` placeholder + warning comment
- [ ] `components/settings/AccountSection.tsx`
- [ ] `components/settings/EmailChangeForm.tsx`
- [ ] `components/settings/PasswordChangeForm.tsx` — 3-field layout
- [ ] `components/settings/DeleteAccountDialog.tsx`
- [ ] `app/(app)/settings/account/page.tsx` — render section
- [ ] `components/features/logout-button.tsx` — wire `clearThemeCookie()`
- [ ] `__tests__/account.test.tsx` — I/O matrix coverage
- [ ] Audit `ON DELETE CASCADE` on `auth.users` for tables touched after `00021` (master-doc spot-check covered through `00021`).

**Acceptance Criteria:**
- Given an authenticated user, when they submit a valid new email, then Supabase sends a confirmation email and the UI shows "Check your inbox at {email}".
- Given an authenticated user with correct current password, when they submit a valid new password, then `auth.updateUser({ password })` succeeds and the UI confirms.
- Given an authenticated user with incorrect current password, when they submit, then the action returns `{ error: { code: 'INVALID_CREDENTIALS' } }` and no DB write occurs.
- Given an authenticated user, when they open the delete dialog, then the destructive button is disabled until both display name AND current password are typed correctly.
- Given a confirmed delete, when the action runs, then theme cookies are cleared, the user is signed out, and they land on `/` with toast `Account deleted`. The `auth.users` row is gone and FK cascades remove all owned rows.
- Given any user signs out (logout button), when the action runs, then `clearThemeCookie()` is called before `signOut()` (closes shared-device leak).

## Spec Change Log

- **2026-04-28 — Open Questions resolved.** Q1 delete approach = Option A (Service Role admin client via `lib/supabase/admin.ts`); Q2 re-auth UX = 3-field password form + surface "signed out on other devices" toast. See Decisions block above.

## Design Notes

**Why re-auth via `signInWithPassword`.** Supabase's `updateUser({ password })` doesn't require the current password server-side, so any session-hijack scenario could change passwords silently. Forcing a fresh `signInWithPassword` round-trip closes that gap. The same pattern guards delete-account.

**Email confirmation, not change.** Calling `auth.updateUser({ email })` doesn't immediately change the email — Supabase emails a confirmation link to the NEW address. The UI must communicate "pending confirmation" rather than implying success.

**Display name as delete confirmation token.** Industry pattern (GitHub, Linear): the user types something they'd remember to prove intent, not just `DELETE`. `character_name` is the canonical column per spec-2 — UI labels the field "Display name" but checks against `character_name` server-side.

**Why Service Role admin client.** Standard Next.js + Supabase pattern, single env var, well-documented. Strict server-only marker on `lib/supabase/admin.ts` plus tree-shaking via `'server-only'` import keeps the key out of any browser bundle. Future admin features (export, bulk ops, support tooling) will need this key anyway, so investing once now avoids re-architecting later.

**Deferred-work piggyback.** Wiring `clearThemeCookie()` into the existing logout button is a 3-line change that closes the cross-user theme leak (deferred-work item from spec-4). Bundling it here means we don't ship Story 3 and then need a separate PR for the leak.

## Verification

**Commands:**
- `pnpm type-check` — passes.
- `pnpm lint` — no new errors in changed paths.
- `pnpm test __tests__/account.test.tsx` — all pass.
- `pnpm dev` then on `/settings/account`: change email (verify inbox), change password with wrong then right current, delete account end-to-end on a throwaway test user.
- Confirm `SUPABASE_SERVICE_ROLE_KEY` is set in `.env.local` (local) and Vercel env (production); `.env.example` only carries the placeholder, never the real value.
