---
title: 'Profile section + avatars storage bucket'
type: 'feature'
created: '2026-04-28'
status: 'draft'
baseline_commit: '0909549ac3f680cd3bbdda2562eb902e5f9031c9'
context:
  - '{project-root}/CLAUDE.md'
  - '{project-root}/docs/features/user-settings.md'
  - '{project-root}/_bmad-output/implementation-artifacts/spec-1-settings-shell.md'
  - '{project-root}/_bmad-output/implementation-artifacts/deferred-work.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** `/settings/profile` is a placeholder. Users can't edit their display name or avatar; the Character page avatar is non-interactive; the Side/Top nav reads a profile field that has no editor. Sprint cannot ship a "managed identity" without this section.

**Approach:** Reconcile the schema first (Story 2.0 — the codebase has two `profiles` table definitions, see Open Questions block), add a per-user-folder `avatars` storage bucket mirroring the `music` bucket from `00021_pomodoro_soundscapes.sql`, expose three server actions (`updateProfile`, `uploadAvatar`, `removeAvatar`), and render `ProfileSection` + `AvatarUpload` in `/settings/profile`. Wire Character page avatar to deep-link into this section.

## Decisions (locked 2026-04-28)

**Q1 Schema canonical — keep `character_name`.** Runtime reads `character_name` at 4+ call sites (`app/(app)/layout.tsx:15`, `app/(app)/character/page.tsx:46`, `app/onboarding/page.tsx:46`); RPG framing is intentional product. Migration `00023` is **purely additive** — it only adds `avatar_url`. No `display_name` column added; no call-site renames. Profile UI labels the editable field "Display name" but reads / writes `character_name` under the hood.

**Q3 Avatar default — local SVG at `public/avatars/default.svg`.** ~2 KB asset, no external service, no CSP change. UI fallback: `<img src={avatar_url ?? '/avatars/default.svg'}>`.

## Boundaries & Constraints

**Always:**
- Profile edits go through Server Actions returning `ActionResult<T>` (mirror `features/flashcards/actions.ts:9` pattern).
- Avatar bucket `avatars` mirrors `music` bucket from `00021`: per-user folder isolation via `(storage.foldername(name))[1] = auth.uid()::text`, public bucket so `<img>` tags work without signed URLs.
- Avatar files limited to 2 MB, mime allow-list `image/png, image/jpeg, image/webp`.
- Display name (whichever column wins Q1): 2–32 chars, trimmed, regex strip control chars.
- TanStack Query invalidates `profileKeys.detail(userId)` after every mutation; SideNav re-renders within one request cycle.
- `<Link href="/settings/profile">` from Character page avatar is the deep-link entry.

**Ask First:**
- Open Question 1 (schema) and 2 (avatar default) — must be answered.
- Adding indexes or columns beyond `display_name` / `avatar_url` to `profiles`.
- Touching `app/(app)/layout.tsx`'s profile fetch (currently selects `character_name` only).

**Never:**
- Do not store avatars in `localStorage` or as base64 in DB.
- Do not skip the per-user-folder RLS guard — cross-tenant leak is the single biggest risk.
- Do not break existing Character/SideNav reads of `character_name` (Option A path).
- Do not implement Account / Notifications / About logic (separate specs).

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Behavior |
|----------|---------------|-------------------|
| Edit display name (valid, 2–32 chars) | Submit form / blur | DB updates; toast `Saved`; SideNav `characterName` reflects within next render |
| Edit display name empty / 1 char / 33+ chars | Submit | Inline Zod error; no DB write |
| Upload avatar PNG ≤ 2 MB | File picker → Save | Optimistic preview; storage upload to `{userId}/{uuid}.png`; DB `avatar_url` updates; `<img>` swaps within 2 s |
| Upload avatar > 2 MB | File picker | Client guard rejects before upload; toast `Image must be under 2 MB` |
| Upload non-image mime | File picker | Client + server reject; toast `Only PNG / JPG / WEBP` |
| Click "Remove avatar" → confirm | Button + dialog | Storage object deleted; DB `avatar_url = NULL`; UI shows default (Dicebear or placeholder per Q2) |
| Click avatar on `/character` | Tap | Navigate to `/settings/profile` |
| Two simultaneous avatar uploads from same tab | Double-click | Second upload superseded; only the latest survives in DB and storage; previous storage object cleaned up |
| Logged-in user A sees user B's avatar URL in DOM | View | Public bucket — URL is public but UUID-based, unguessable; per-user folder RLS prevents listing |

</frozen-after-approval>

## Code Map

- `supabase/migrations/00023_avatar_url.sql` — NEW. `ALTER TABLE profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT CHECK (avatar_url IS NULL OR char_length(avatar_url) <= 2048)`. No other column changes — `character_name` remains canonical.
- `supabase/migrations/00024_avatars_bucket.sql` — NEW. Mirror `00021`: bucket `avatars` (public, 2 MB cap, mime allow-list `image/png|image/jpeg|image/webp`), four storage RLS policies (`avatars_select_own`, `avatars_insert_own`, `avatars_update_own`, `avatars_delete_own`) keyed on `(storage.foldername(name))[1] = auth.uid()::text`, plus `avatars_public_read` for `anon` so `<img>` works without auth.
- `public/avatars/default.svg` — NEW. ~2 KB placeholder asset (neutral silhouette, sized 256×256). Used as `<img>` fallback when `avatar_url IS NULL`.
- `types/database.ts` — EDIT. Add `avatar_url` to `profiles` row type.
- `features/settings/profile-schemas.ts` — NEW. Zod `profileUpdateSchema` (`character_name` 2–32 chars + control-char strip; UI labels it "Display name"), `avatarUploadSchema` (file size + mime).
- `features/settings/profile.ts` — NEW. `'use server'`. `updateProfile({ character_name })`, `uploadAvatar(formData)`, `removeAvatar()`. All return `ActionResult<…>`. Upload writes to `avatars/{userId}/{uuid}.{ext}`, persists URL via `getPublicUrl()`. Remove issues `storage.from('avatars').remove([oldPath])` then DB nullification.
- `hooks/useSettings.ts` — NEW (or extend if exists). TanStack Query: `useProfileQuery()`, `useUpdateProfileMutation()`, `useUploadAvatarMutation()`, `useRemoveAvatarMutation()`. Mutations invalidate `['profile', userId]`.
- `components/settings/ProfileSection.tsx` — NEW. Server component. Fetches current profile row, passes to client children. Renders email read-only.
- `components/settings/AvatarUpload.tsx` — NEW. `'use client'`. File input + preview + Save / Remove buttons. Confirm dialog for Remove.
- `components/settings/DisplayNameForm.tsx` — NEW. `'use client'`. Controlled input + react-hook-form + Zod resolver.
- `app/(app)/settings/profile/page.tsx` — EDIT. Replace placeholder with `<ProfileSection />`.
- `app/(app)/character/page.tsx` — EDIT (~3 lines). Wrap avatar `<img>` in `<Link href="/settings/profile" aria-label="Edit profile">`.
- `app/(app)/layout.tsx` — EDIT. Extend profile select to include `avatar_url` so SideNav can render the uploaded image.
- `__tests__/profile.test.tsx` — NEW. Vitest + RTL: Zod boundaries (1, 2, 32, 33 chars; control chars), `updateProfile` happy path with mocked Supabase, file size guard (2 MB limit, 1 byte under, 1 byte over), mime guard, optimistic preview rollback on error.

## Tasks & Acceptance

**Execution:**
- [ ] `supabase/migrations/00023_avatar_url.sql` — add `avatar_url` column with length check
- [ ] `supabase/migrations/00024_avatars_bucket.sql` — bucket + 5 storage RLS policies
- [ ] `public/avatars/default.svg` — ~2 KB placeholder asset
- [ ] `types/database.ts` — add `avatar_url` to profiles row
- [ ] `features/settings/profile-schemas.ts` — Zod schemas
- [ ] `features/settings/profile.ts` — three server actions
- [ ] `hooks/useSettings.ts` — query + mutation hooks
- [ ] `components/settings/ProfileSection.tsx` — server shell
- [ ] `components/settings/AvatarUpload.tsx` — file UI + dialogs
- [ ] `components/settings/DisplayNameForm.tsx` — form
- [ ] `app/(app)/settings/profile/page.tsx` — render section
- [ ] `app/(app)/character/page.tsx` — avatar Link wrap
- [ ] `app/(app)/layout.tsx` — extend select to include `avatar_url`
- [ ] `__tests__/profile.test.tsx` — I/O matrix coverage

**Acceptance Criteria:**
- Given an authenticated user on `/settings/profile`, when they edit display name to a valid string, then DB persists and SideNav reflects within one request.
- Given an authenticated user, when they upload a 1.9 MB PNG, then storage object lands at `avatars/{userId}/{uuid}.png` and `<img src={avatar_url}>` renders within 2 s.
- Given an authenticated user, when they upload a 2.5 MB image, then upload is rejected client-side and no storage / DB write occurs.
- Given an authenticated user, when they click Remove avatar and confirm, then `avatar_url = NULL` in DB and the prior storage object is deleted.
- Given a user on `/character`, when they tap their avatar, then they land on `/settings/profile`.
- Given user A and user B, when A inspects B's avatar URL, then A cannot list B's storage folder via Supabase client (per-user folder RLS).

## Spec Change Log

- **2026-04-28 — Open Questions resolved.** Q1 schema canonical = keep `character_name` (additive migration adds only `avatar_url`); Q3 avatar default = local SVG at `public/avatars/default.svg`. See Decisions block above.

## Design Notes

**Why we kept `character_name`.** Renaming the column has a 4+ call-site blast radius (`app/(app)/layout.tsx`, `app/(app)/character/page.tsx`, `app/onboarding/page.tsx`, plus future char-* features) for zero user-facing benefit. The "Display name" UI label is independent of the DB column name. RPG framing stays intact; future "Account name" UX can layer on without DB changes.

**Per-user storage folder.** Identical pattern to `00021_pomodoro_soundscapes.sql:50-84`. Reusing the same shape means RLS reasoning is already vetted by the soundscapes ship.

**Why two migrations, not one.** `avatar_url` column (`00023`) is a different review concern from storage bucket (`00024`); splitting keeps each migration focused and revertible independently.

**Default avatar.** Single static SVG at `public/avatars/default.svg`. UI fallback rendered when `avatar_url IS NULL`. No external dependency, no CSP change, no per-user state to manage.

## Verification

**Commands:**
- `npx supabase db reset` — both migrations apply cleanly; existing rows backfilled.
- `pnpm type-check` — passes.
- `pnpm lint` — no new errors in changed paths.
- `pnpm test __tests__/profile.test.tsx` — all assertions pass.
- `pnpm dev` then on `/settings/profile`: edit name (valid + invalid), upload PNG/JPG/WEBP/oversize/wrong-mime, remove avatar, verify SideNav refresh, click avatar from Character page.
