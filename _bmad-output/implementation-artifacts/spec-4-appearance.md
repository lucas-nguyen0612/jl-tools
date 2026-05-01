---
title: 'Appearance section + user_preferences DB'
type: 'feature'
created: '2026-04-28'
status: 'done'
baseline_commit: 'd0f6f0a29534e0aa1a2186530ee955abc35d542e'
context:
  - '{project-root}/CLAUDE.md'
  - '{project-root}/docs/features/user-settings.md'
  - '{project-root}/_bmad-output/implementation-artifacts/spec-1-settings-shell.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** `/settings/appearance` is a placeholder; the app has no working theme system (`components/ThemeProvider.tsx` and `next-themes` are dead — never wired into `Providers.tsx`). Story 5 also blocks on the `user_preferences` table.

**Approach:** Migration `00022` (table + RLS + extend `handle_new_user`). Cookie ↔ DB sync via `lib/settings/theme-cookie.ts`. Root `app/layout.tsx` reads cookies and injects `class="jl-dark dark"` + `style="--jl-hue: …"` on `<html>` so shadcn portals get themed too. Server action `updateAppearance` writes DB + cookies + revalidates layout; `syncAppearanceCookies` runs post-login for cross-device prefs. UI: theme radios + debounced hue slider with live preview.

## Boundaries & Constraints

**Always:**
- Apply BOTH `jl-dark` (`globals.css:62`, project tokens) and `dark` (`globals.css:100`, shadcn vars) when theme=dark. Either alone leaves half the UI mismatched.
- Inject on `<html>` in root `app/layout.tsx` — wrapping in `(app)/layout.tsx` misses shadcn portals (Radix renders at `document.body`).
- Cookies: `jl-theme` (`light|dark|system`), `jl-hue` (int 0–360). `Path=/`, `SameSite=Lax`, `Max-Age=31536000`. Defaults: `system` + `38`.
- Server actions return `ActionResult<T>` per `features/flashcards/actions.ts:9` local pattern.
- Hue slider updates `--jl-hue` on `documentElement` instantly; debounces DB write 300ms.
- `revalidatePath('/', 'layout')` after every `updateAppearance` so cookies propagate.

**Ask First:**
- Touching `globals.css` selectors — only edit if a missing token is required.
- Renaming the cookies — Story 5+ may read them.

**Never:**
- Do not delete `components/ThemeProvider.tsx` or remove `next-themes` — pre-existing dead code; cleanup deferred.
- Do not UA-sniff for `system` server-side — use a small client `matchMedia` correction.
- Do not store theme/hue in `localStorage`.
- Do not implement Profile / Account / Notifications / About.

## I/O & Edge-Case Matrix

| Scenario | Input | Behavior |
|----------|-------|----------|
| Pick Dark | Click Dark radio | DB + cookies update; `<html>` gains `jl-dark dark` within one render; no reload |
| Drag hue 38 → 200 | Slider | `--jl-hue` updates live on `documentElement`; one DB write 300ms after release |
| Reload while in Dark/200 | Page load | Root layout reads cookies; first paint already themed (zero FOUC) |
| First visit, no cookies | Anonymous | Server applies defaults `system` + `38`; client `matchMedia` effect promotes to dark if OS prefers it |
| Login on new device | Successful sign-in | `syncAppearanceCookies()` reads DB and sets cookies before `router.push('/dashboard')` |
| Bad input (`theme:'neon'`, `hue:999`) | Form | Zod rejects; action returns `{ data: null, error: { code: 'VALIDATION_ERROR' } }` |

</frozen-after-approval>

## Code Map

- `supabase/migrations/00022_user_preferences.sql` — NEW. Table (`user_id PK FK auth.users ON DELETE CASCADE`, `appearance_settings jsonb`, `notification_settings jsonb`, timestamps), owner-only RLS on every verb (SELECT/INSERT/UPDATE — INSERT policy needed so the action's upsert fallback can self-heal a missing row), extend `public.handle_new_user()` (`00001_create_profiles.sql:35`) to also `INSERT INTO user_preferences`. Backfill `INSERT…SELECT` for pre-existing `auth.users`. Reuse `handle_updated_at`.
- `types/database.ts` — EDIT. Add `user_preferences` row type.
- `features/settings/preferences.ts` — NEW. `'use server'`. `updateAppearance({theme, accent_hue})` (DB write + cookie write + revalidate) and `syncAppearanceCookies()` (read DB → set cookies). Local Zod `z.object({ theme: z.enum(['light','dark','system']), accent_hue: z.number().int().min(0).max(360) })`. Both return `ActionResult<UserPreferences>`.
- `lib/settings/theme-cookie.ts` — NEW. `readThemeCookie()` (RSC-safe, returns defaults if missing), `writeThemeCookie(theme, hue)` (action-only — Next 15 blocks `cookies().set` in RSC), `clearThemeCookie()`.
- `app/layout.tsx` — EDIT. Read cookies via `readThemeCookie()`; render `<html className={theme === 'dark' ? 'jl-dark dark' : ''} style={{ '--jl-hue': String(hue) } as React.CSSProperties}>`. Add a 3-line inline `<script>` in `<head>` that promotes `jl-dark dark` when cookie is `system` and `matchMedia('(prefers-color-scheme: dark)').matches` — runs before paint.
- `app/login/page.tsx:62` — EDIT. After successful `signInWithPassword`, await `syncAppearanceCookies()` then `router.refresh()` then `router.push('/dashboard')`.
- `components/settings/AppearanceSection.tsx` — NEW. Server component. Fetches current prefs via `createClient()`, passes to children.
- `components/settings/ThemeRadio.tsx` — NEW. `'use client'`. 3 cards (Light/Dark/System). Optimistic toggle of `jl-dark dark` on `documentElement`, then `await updateAppearance(...)`.
- `components/settings/HueSlider.tsx` — NEW. `'use client'`. Range 0–360 + live swatch. `onChange` updates `--jl-hue` immediately; debounces `updateAppearance` 300ms via `useRef<NodeJS.Timeout>`.
- `app/(app)/settings/appearance/page.tsx` — EDIT. Replace placeholder with `<AppearanceSection />`.
- `__tests__/appearance.test.tsx` — NEW. Zod (theme enum, hue boundaries 0/360/-1/361), `readThemeCookie` defaults, `writeThemeCookie` round-trip, `updateAppearance` happy path with `cookies()` mocked, root-layout class derivation function.

## Tasks & Acceptance

**Execution:**
- [x] `supabase/migrations/00022_user_preferences.sql` — table, RLS, `handle_new_user` extension
- [x] `types/database.ts` — add `user_preferences` row type
- [x] `lib/settings/theme-cookie.ts` — read/write/clear + defaults
- [x] `features/settings/preferences.ts` — actions + Zod
- [x] `app/layout.tsx` — html-level class + style + system-theme inline script
- [x] `components/settings/AppearanceSection.tsx` — server shell fetching prefs
- [x] `components/settings/ThemeRadio.tsx` — 3 cards w/ optimistic class toggle
- [x] `components/settings/HueSlider.tsx` — live `--jl-hue` + 300ms debounce
- [x] `app/(app)/settings/appearance/page.tsx` — render AppearanceSection
- [x] `app/login/page.tsx` — call `syncAppearanceCookies` post-signin
- [x] `__tests__/appearance.test.tsx` — cover I/O matrix scenarios

**Acceptance Criteria:**
- Given user on `/settings/appearance`, when they pick Dark, then `<html>` has `jl-dark dark` classes within one render AND `user_preferences.appearance_settings->>'theme'='dark'` in DB.
- Given user reloads any `/(app)/*` page after picking Dark, when first paint occurs, then it paints dark on the first frame (no light flash).
- Given user drags hue slider, when they release, then accent color updates instantly during drag and exactly one DB write fires 300ms after release.
- Given new account / new device login, when sign-in succeeds, then `syncAppearanceCookies()` runs before redirect and the next page reflects DB prefs.
- Given malformed input, when the action runs, then it returns `{ data: null, error: { code: 'VALIDATION_ERROR' } }` and writes nothing to DB or cookies.

## Spec Change Log

- **Schema extracted to `features/settings/schemas.ts`.** `'use server'` modules can only export async functions, so the Zod schema lived alongside the actions but couldn't be imported by tests. Pulling it into a sibling file keeps the action logic intact and lets the test file assert validation rules directly against the schema (`appearance_settings` enum + hue boundaries).
- **`types/database.ts` Insert/Update for `user_preferences`** written explicitly instead of using the recursive `Partial<Row>` shortcut. Supabase's `from(...).upsert(...)` overload was still resolving its argument to `never`, so the upsert call uses the codebase's existing `as never` workaround (mirroring `features/pomodoro/actions.ts:227` and `features/habits/actions.ts:150`).
- **Login order tweaked** to `await syncAppearanceCookies()` → `router.refresh()` → `router.push('/dashboard')`. The refresh happens before push so the dashboard's first paint already sees the new cookies.
- **Review pass (iteration 2)** patches:
  - **RLS amended.** The Code Map originally said "INSERT only via trigger". Reviewers (Blind Hunter F10, Edge Case Hunter E1) noted the action's `upsert` fallback can't self-heal a missing row when RLS blocks INSERT. Added an owner-only `user_preferences_insert_own` policy (`WITH CHECK (auth.uid() = user_id)`). The `handle_new_user` trigger is `SECURITY DEFINER` and still bypasses RLS for fresh signups; the new policy only matters for the action-side recovery path, and stays owner-scoped so foreign inserts remain impossible.
  - **Backfill.** Migration appends `INSERT INTO public.user_preferences (user_id) SELECT id FROM auth.users ON CONFLICT (user_id) DO NOTHING;` so legacy users (Edge Case E2) get a seed row when the migration runs.
  - **Hydration warning.** `<html suppressHydrationWarning>` added to root layout — the inline pre-paint script mutates `documentElement.classList` before React hydrates, which would otherwise emit a `system+prefers-dark` mismatch warning (Edge Case E3).
  - **`parseHue` tightened.** Changed to `/^\d+$/` regex check before `parseInt` so `"38abc"`/`"38.9"` fall back to default rather than silently coercing (Blind Hunter F5, Edge Case E10).
  - **HueSlider unmount guard.** Added `isMountedRef` so a debounced server action that resolves after navigation doesn't `setHue` / `setError` on an unmounted component or override the next page's hue (Edge Case E6, partially F8).
  - **Login error visibility.** `syncAppearanceCookies` errors now `console.warn` instead of being silently swallowed; the redirect still proceeds with default-theme cookies (Blind Hunter F1, Edge Case E4).

## Design Notes

**Both `jl-dark` and `dark`.** Half the UI uses `var(--jl-*)` (project tokens, scoped under `.jl-dark`); the other half uses `var(--background)` etc. (shadcn vars, scoped under `.dark`). Setting both classes is the only path that themes everything without rewriting `globals.css`.

**`<html>`, not a `(app)` wrapper.** Radix portals (DropdownMenu, Dialog) render at `document.body` — outside any `(app)` subtree. Class on `<html>` is the only place that covers them.

**`system` resolution.** `prefers-color-scheme` is client-only; UA sniffing is fragile. Server applies light defaults when cookie says `system`; a small inline `<script>` in `<head>` (synchronous, runs before paint) calls `matchMedia` and adds `jl-dark dark` to `<html>` if needed. Once the user picks Light or Dark explicitly, the cookie is concrete and the script is a no-op.

**Cookie writes (Next 15).** `cookies().set()` is forbidden in RSC — only allowed in Server Actions and Route Handlers. `readThemeCookie()` is RSC-safe; both writers are action-only.

**Dead theme code untouched.** `ThemeProvider.tsx` + `next-themes` cleanup is deferred to keep this spec scoped.

## Verification

**Commands:**
- `npx supabase db reset` (local) — migration applies; `user_preferences` row auto-inserts on signup.
- `pnpm type-check` — passes.
- `pnpm lint` — no new errors in changed paths.
- `pnpm test __tests__/appearance.test.tsx` — all pass.
- `pnpm dev`, then on `/settings/appearance`: toggle theme, drag hue, reload (zero FOUC), sign out + sign in (verify `syncAppearanceCookies`).

## Suggested Review Order

**Persistence — schema + RLS contract (entry point)**

- New table with JSONB defaults that match the cookie defaults — start here to grasp the full contract.
  [`00022_user_preferences.sql:8`](../../supabase/migrations/00022_user_preferences.sql#L8)

- Owner-only RLS on all three verbs; the INSERT policy is the review-pass fix that lets `upsert` self-heal a missing row.
  [`00022_user_preferences.sql:33`](../../supabase/migrations/00022_user_preferences.sql#L33)

- `handle_new_user` extended to seed preferences alongside profile, idempotent via `ON CONFLICT`.
  [`00022_user_preferences.sql:48`](../../supabase/migrations/00022_user_preferences.sql#L48)

- Backfill `INSERT…SELECT` so legacy `auth.users` aren't stranded without a row.
  [`00022_user_preferences.sql:71`](../../supabase/migrations/00022_user_preferences.sql#L71)

**Cookie ↔ DB plumbing (the SSR zero-FOUC mechanism)**

- Cookie defaults + names hardcoded once and reused everywhere.
  [`theme-cookie.ts:5`](../../lib/settings/theme-cookie.ts#L5)

- `parseHue` regex-gated against `parseInt` lenience — review-pass tightening.
  [`theme-cookie.ts:28`](../../lib/settings/theme-cookie.ts#L28)

- Pure `htmlClassForTheme` keeps the SSR class derivation testable.
  [`theme-cookie.ts:63`](../../lib/settings/theme-cookie.ts#L63)

**Server actions (the write path)**

- Validation gate fires before any side effect — guarantees AC5.
  [`preferences.ts:23`](../../features/settings/preferences.ts#L23)

- DB upsert + cookie write + `revalidatePath` is the atomic update unit.
  [`preferences.ts:40`](../../features/settings/preferences.ts#L40)

- `syncAppearanceCookies` reads DB and seeds cookies for the new-device login flow.
  [`preferences.ts:59`](../../features/settings/preferences.ts#L59)

**Root layout (first paint)**

- `<html>` class + `--jl-hue` style derived server-side from cookies.
  [`layout.tsx:13`](../../app/layout.tsx#L13)

- Inline pre-paint script promotes to dark when cookie is `system` and OS prefers dark — runs before React hydrates.
  [`layout.tsx:11`](../../app/layout.tsx#L11)

- `suppressHydrationWarning` on `<html>` because the script mutates classes pre-hydration (review-pass fix).
  [`layout.tsx:19`](../../app/layout.tsx#L19)

**UI binding**

- Server shell fetches prefs and passes them as initial props.
  [`AppearanceSection.tsx:9`](../../components/settings/AppearanceSection.tsx#L9)

- `applyThemeClass` mirrors the layout's class contract on the client.
  [`ThemeRadio.tsx:23`](../../components/settings/ThemeRadio.tsx#L23)

- Optimistic toggle then transition; rollback on action error.
  [`ThemeRadio.tsx:52`](../../components/settings/ThemeRadio.tsx#L52)

- `applyHue` writes the CSS var instantly on every drag tick.
  [`HueSlider.tsx:14`](../../components/settings/HueSlider.tsx#L14)

- Debounced save with mount guard so unmount during in-flight save can't clobber state (review-pass fix).
  [`HueSlider.tsx:34`](../../components/settings/HueSlider.tsx#L34)

**Login wiring**

- Post-signin sync; error surfaced via `console.warn` instead of silent swallow (review-pass fix).
  [`login/page.tsx:63`](../../app/login/page.tsx#L63)

**Tests + types**

- Schema boundary tests pin the AC5 validation contract.
  [`appearance.test.tsx:94`](../../__tests__/appearance.test.tsx#L94)

- Cookie helper round-trip + invalid-value fallback coverage.
  [`appearance.test.tsx:120`](../../__tests__/appearance.test.tsx#L120)

- `updateAppearance` happy path asserts upsert payload, cookie write, and revalidate.
  [`appearance.test.tsx:170`](../../__tests__/appearance.test.tsx#L170)

- New `user_preferences` row type — explicit Insert/Update because Supabase inference falls through.
  [`database.ts:316`](../../types/database.ts#L316)
