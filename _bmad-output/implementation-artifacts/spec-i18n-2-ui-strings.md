# Story 6.2 — UI Translation Strings

## Status
in-progress

## Story

As a Vietnamese-speaking user, I want every UI string in the app — buttons, headings, labels, placeholders, error messages, toasts — to render in my language when I'm on `/vi/...`, and in English when I'm on `/en/...`, so that I can use JL-Tools natively without context-switching, and the foundation built in Story 6.1 actually delivers user-visible value.

(Internal framing: this is the story where i18n stops being plumbing and starts being product.)

## Acceptance Criteria

- **AC-6.2.1 — No hardcoded UI strings.** Audit grep `grep -rE '>[A-Z][a-z]+ ' app components` returns ZERO non-brand matches. Brand-name exceptions (`JL-Tools`, `Pomodoro` if used as proper noun, third-party logos) are explicitly listed in `messages/en.json` under `app.*` or `common.brand.*`.
- **AC-6.2.2 — Every locale-visible surface renders correctly in both `/en` and `/vi`.** Manual smoke for each route in `app/[locale]/`: `/`, `/sign-in`, `/sign-up`, `/onboarding`, `/auth/{forgot-password,update-password,error,sign-up-success}`, `/legal/{privacy,terms}`, `/dashboard`, `/character`, `/pomodoro`, `/habits`, `/flashcards`, `/flashcards/[deckId]`, `/flashcards/[deckId]/study`, `/settings/{account,appearance,notifications,profile,about}`. No raw English in `/vi` rendered output (excluding brand).
- **AC-6.2.3 — Translation key namespace structure follows convention.** `messages/{en,vi}.json` adheres to `_bmad-output/planning-artifacts/i18n-key-naming-convention.md`: namespace = surface (not component), max 3 levels nesting, leaf = role (`title`/`cta`/`label`/`placeholder`/`helpText`/`errorMessage`/`successMessage`/`emptyState`), shared strings live in `common.*` (no per-feature duplication of "Save"/"Cancel"/"Loading").
- **AC-6.2.4 — Key parity between `en` and `vi`.** Every key in `messages/en.json` exists in `messages/vi.json` with identical structure and a non-empty Vietnamese value. Verified by a parity check (script or test). No `__MISSING__` placeholders shipped.
- **AC-6.2.5 — Internal navigation preserves locale.** All in-app `<Link>` and `useRouter`/`redirect` calls that target user-facing routes (anything inside `app/[locale]/`) use `@/i18n/navigation` instead of `next/link` / `next/navigation`. Result: navigating `/en/dashboard` → `/profile` lands on `/en/profile` without an intermediate middleware redirect. Excluded: server-side route handlers (`app/auth/callback`, `app/api/*`) and external links.
- **AC-6.2.6 — Form validation messages localized.** Zod schema error messages (sign-in, sign-up, forgot/update password, profile, settings forms) read from `errors.validation.*` keys. No inline English strings inside `z.string().email('...')` etc.
- **AC-6.2.7 — Auth + Supabase error codes localized.** Supabase auth errors (invalid credentials, email not confirmed, OTP expired, weak password) map to `errors.auth.*` keys via a code→key lookup, not by matching raw `error.message` strings.
- **AC-6.2.8 — Build + lint + typecheck pass.** `pnpm build`, `pnpm lint`, `pnpm type-check` all exit 0. Typed `Messages` from `global.d.ts` autocompletes every key the dev calls; dead keys (in JSON but unused in code) flagged by review.
- **AC-6.2.9 — Locale switch is a pure URL swap.** Visiting `/vi/dashboard` and `/en/dashboard` (same authenticated user) renders the same data, layout, and component tree — only text content differs. No layout shift, no re-fetch differences, no flicker beyond first paint.

## Tasks / Subtasks

> **Order matters.** Tasks 1–2 produce the canonical key tree first (audit + structure); tasks 3–11 migrate surfaces against that tree; tasks 12–14 finalize navigation, validation, and verification. Don't translate ad-hoc — write the EN tree, review it, then translate to VI in one pass.

- [ ] **Task 1: Audit hardcoded strings** (AC: 6.2.1, 6.2.3)
  - [ ] Subtask 1.1: Run `grep -rnE '>[A-Z][a-z][^<]*<' app components` and capture output to a working doc (not committed). Filter out: code identifiers, JSX prop expressions, `aria-*` (handle separately).
  - [ ] Subtask 1.2: Run `grep -rnE "'[A-Z][a-z][^']{3,}'" app components features hooks` for inline string literals (toast messages, Zod error messages, `alt`, `title`, `placeholder` props). Cross-reference with subtask 1.1.
  - [ ] Subtask 1.3: Categorize each finding by namespace per `_bmad-output/planning-artifacts/i18n-key-naming-convention.md` — output a key-by-key plan in dev notes.

- [ ] **Task 2: Build canonical EN key tree in `messages/en.json`** (AC: 6.2.3, 6.2.4)
  - [ ] Subtask 2.1: Top-level namespaces: `app`, `common`, `auth`, `landing`, `nav`, `dashboard`, `pomodoro`, `habits`, `flashcards`, `character`, `settings`, `legal`, `onboarding`, `errors`. Keep existing `app.name` from Story 6.1.
  - [ ] Subtask 2.2: Populate `common.*` with shared atoms first: `save`, `cancel`, `delete`, `edit`, `close`, `confirm`, `back`, `continue`, `submit`, `loading`, `retry`, `yes`, `no`, `comingSoon`. These MUST NOT be duplicated into feature namespaces.
  - [ ] Subtask 2.3: Populate `errors.validation.*` (invalidEmail, passwordMin8, passwordRequired, fieldRequired, displayNameMaxLength, etc.) and `errors.auth.*` (invalidCredentials, emailNotConfirmed, weakPassword, otpExpired, otpInvalid, sessionExpired, networkError, unknown).
  - [ ] Subtask 2.4: For each surface namespace, draft its subtree top-to-bottom using leaf roles (`title`, `subtitle`, `description`, `cta`, `label`, `placeholder`, `helpText`, `errorMessage`, `successMessage`, `emptyState`). Max 3 levels deep.
  - [ ] Subtask 2.5: Use ICU MessageFormat for any string with a number/plural/select (e.g., `pomodoro.session.completedCount: "Completed {count, plural, one {# session} other {# sessions}}"`).

- [ ] **Task 3: Translate to `messages/vi.json`** (AC: 6.2.4)
  - [ ] Subtask 3.1: Mirror `en.json` structure exactly. Translate every leaf value to Vietnamese. Keep keys in English (per convention rule 5: "Keys luôn EN, value mới translate").
  - [ ] Subtask 3.2: Preserve ICU placeholders (`{count}`, `{name}`) verbatim — do not translate placeholder names.
  - [ ] Subtask 3.3: Brand strings (`JL-Tools`, `Pomodoro`, `Anki` etc.) keep identical to EN unless culturally different.

- [ ] **Task 4: Migrate `landing` surface** (AC: 6.2.2, 6.2.5)
  - [ ] Subtask 4.1: `components/marketing/LandingNav.tsx` — already partly POC'd in 6.1 (`app.name`). Migrate nav links (`Tools`, `Progression`, `Guild`, `Pricing`, `Changelog`), `Sign in`, `Start free` CTAs.
  - [ ] Subtask 4.2: `components/marketing/HeroSection.tsx` — headline, subheadline, badges, CTAs.
  - [ ] Subtask 4.3: `components/marketing/HeroVisual.tsx`, `ToolStrip.tsx`, `XPBand.tsx`, `LandingFooter.tsx` — all visible text (privacy/terms link labels go to `legal.*` namespace; footer chrome stays `landing.footer.*`).
  - [ ] Subtask 4.4: Migrate `<Link>` from `next/link` → `@/i18n/navigation` for `/sign-in`, `/sign-up`, `/legal/*` targets.

- [ ] **Task 5: Migrate `auth` surface** (AC: 6.2.2, 6.2.5, 6.2.6, 6.2.7)
  - [ ] Subtask 5.1: `app/[locale]/sign-in/page.tsx` — title, subtitle, email/password labels + placeholders, submit CTA, "Forgot password?", "Don't have an account? / Sign up", Google CTA, unverified-email dialog (DialogTitle, DialogDescription, resend CTA, success/error messages).
  - [ ] Subtask 5.2: `app/[locale]/sign-up/page.tsx` — same pattern; agreement checkbox text references `legal.*` keys.
  - [ ] Subtask 5.3: `app/[locale]/onboarding/page.tsx` — character creation flow text.
  - [ ] Subtask 5.4: `app/[locale]/auth/{forgot-password,update-password,error,sign-up-success}/page.tsx` — and their associated components in `components/features/{forgot-password-form,update-password-form}.tsx`.
  - [ ] Subtask 5.5: Replace inline Zod messages: `z.string().email('Invalid email address')` → `z.string().email(t('errors.validation.invalidEmail'))`. Pattern: get `t` once at top of component, reference `t('errors.validation.X')` inside the schema (rebuild schema on each render is acceptable; or use `useMemo`).
  - [ ] Subtask 5.6: Build a Supabase-error → key mapper: `lib/auth/error-map.ts` exporting `mapAuthError(error: AuthError | { message: string }): string` returning a `errors.auth.*` key. Use error code where available (Supabase `error.code` is preferred over message matching). Replace all `setError(error.message)` with `setError(t(mapAuthError(error)))`.

- [ ] **Task 6: Migrate `nav` surface** (AC: 6.2.2, 6.2.5)
  - [ ] Subtask 6.1: `components/layout/SideNav.tsx`, `BottomNav.tsx`, `TopBar.tsx` — all nav item labels, section headers, character chip text.
  - [ ] Subtask 6.2: `components/settings/SettingsNav.tsx`, `MobileBackLink.tsx` — settings nav labels.
  - [ ] Subtask 6.3: Replace `next/link` → `@/i18n/navigation` Link, `usePathname` from `next/navigation` → from `@/i18n/navigation` (for active-state matching against locale-stripped path).

- [ ] **Task 7: Migrate `dashboard` surface** (AC: 6.2.2, 6.2.5)
  - [ ] Subtask 7.1: `components/dashboard/{HeroCard,ToolGrid,QuestList,StreakCard,WeeklyStats,RecentBadges,NotificationPanel,SearchDropdown,DashboardTopBarActions}.tsx` — visible text, search placeholder, empty states, notification messages.
  - [ ] Subtask 7.2: `app/[locale]/(app)/dashboard/page.tsx` — page-level strings.

- [ ] **Task 8: Migrate `pomodoro` surface** (AC: 6.2.2, 6.2.5)
  - [ ] Subtask 8.1: `components/pomodoro/{PomodoroTimer,ModeSelector,TimerControls,DurationSettingsModal,FocusModeOverlay,FocusTaskList,SessionDots,SessionHistoryChart,SoundscapeSelector,TaskItem,TaskList,XPTickerPanel}.tsx`. Mode names (`Focus`, `Short Break`, `Long Break`) use ICU `select` if needed. Toast messages on session complete go to `pomodoro.session.{started,completed,paused,reset}`.
  - [ ] Subtask 8.2: `app/[locale]/(app)/pomodoro/page.tsx` — page-level strings.

- [ ] **Task 9: Migrate `habits` surface** (AC: 6.2.2, 6.2.5)
  - [ ] Subtask 9.1: `components/habits/{HabitCard,HabitForm,AiInsightCard,CheckInButton,HeatmapView,InsightPanel,RemindersPanel,StreakBadge,WeeklyGrid}.tsx`. Streak phrasing uses ICU plural (`{days, plural, one {# day} other {# days}}`).
  - [ ] Subtask 9.2: `app/[locale]/(app)/habits/page.tsx`.

- [ ] **Task 10: Migrate `flashcards` surface** (AC: 6.2.2, 6.2.5)
  - [ ] Subtask 10.1: `components/flashcard/{DeckList,DeckCard,DeckEditor,DeckStats,CardEditor,CardFlip,FlashcardSidebar,FlashcardStatsRail,ForecastChart,RatingButtons,ReviewSession,SessionProgress,SessionSummary}.tsx`. Rating-button labels (`Again`/`Hard`/`Good`/`Easy`) are translation-critical.
  - [ ] Subtask 10.2: `app/[locale]/(app)/flashcards/{page,FlashcardsClient,[deckId]/page,[deckId]/DeckDetailClient,[deckId]/study/page}.tsx`.

- [ ] **Task 11: Migrate `character` + `settings` + `legal` surfaces** (AC: 6.2.2, 6.2.5)
  - [ ] Subtask 11.1: `components/character/{CharacterSheet,ActivityTimeline,BadgeGrid,StatChart}.tsx` and `app/[locale]/(app)/character/page.tsx`.
  - [ ] Subtask 11.2: `components/settings/{AboutSection,AccountSection,AppearanceSection,AvatarUpload,BrowserPermissionCard,DeleteAccountDialog,DisplayNameForm,EmailChangeForm,HabitReminderCard,HueSlider,NotificationsSection,PasswordChangeForm}.tsx` and `app/[locale]/(app)/settings/{account,appearance,notifications,profile,about,page}.tsx`. Confirmation dialogs (delete account) need locale-aware destructive-action text.
  - [ ] Subtask 11.3: `app/[locale]/legal/{privacy,terms}/page.tsx` and `legal/layout.tsx` — long-form legal text. May be quite large; OK to keep paragraph-level keys (`legal.privacy.section1.body`, etc.) — exception to "leaf = role" since legal copy IS the body.

- [ ] **Task 12: Replace `next/link` and `next/navigation` with `@/i18n/navigation` repo-wide** (AC: 6.2.5)
  - [ ] Subtask 12.1: Find all internal links: `grep -rn "from 'next/link'\|from 'next/navigation'" app components features hooks lib`. Exclude: `app/auth/callback`, `app/api/*`, server-only utilities operating on raw paths.
  - [ ] Subtask 12.2: Replace `import Link from 'next/link'` with `import { Link } from '@/i18n/navigation'`. Replace `useRouter`, `redirect`, `usePathname` similarly. (`useSearchParams` stays from `next/navigation` — not locale-aware.)
  - [ ] Subtask 12.3: For `redirect` calls in server components/actions, use the next-intl `redirect({ href, locale })` form with `locale` from `getLocale()`. For pure relative redirects (`/dashboard` from inside the app), the locale is implicit when imported from `@/i18n/navigation`. Verify one redirect explicitly hits `/{locale}/...` in network tab — no double-hop.

- [ ] **Task 13: Add CI parity check for messages files** (AC: 6.2.4, 6.2.8)
  - [ ] Subtask 13.1: Add `__tests__/i18n-parity.test.ts` (vitest). Recursively walk `messages/en.json` and `messages/vi.json`. Assert: identical key structure (same paths, same depth), every leaf in `en.json` has a non-empty string leaf at the same path in `vi.json`, no extra keys in `vi.json`, no extra keys in `en.json` that aren't in `vi.json`.
  - [ ] Subtask 13.2: Test runs as part of `pnpm test:run`.

- [ ] **Task 14: Verify** (AC: 6.2.1, 6.2.2, 6.2.5, 6.2.8, 6.2.9)
  - [ ] Subtask 14.1: `pnpm build` pass, `pnpm lint` pass, `pnpm type-check` pass, `pnpm test:run` pass (parity test).
  - [ ] Subtask 14.2: Re-run audit grep — assert empty (no hardcoded strings remaining; brand exceptions documented inline).
  - [ ] Subtask 14.3: Manual smoke: walk every route listed in AC-6.2.2 in both `/en` and `/vi`. Capture screenshots if useful. No raw English in `/vi`. No raw Vietnamese in `/en`.
  - [ ] Subtask 14.4: Smoke locale-aware navigation: from `/en/dashboard`, click a sidebar link → confirm URL stays in `/en/...` without intermediate redirect (DevTools Network panel: single 200, not 307→200). Repeat from `/vi/dashboard`.

## Dev Notes

### Why this story exists
Story 6.1 wired next-intl plumbing (routing, middleware, layout, types) and proved the path with one POC key (`app.name`). Without 6.2, the user sees `/vi` URLs but English text — i18n is invisible. This story converts every visible string and makes the locale switch (Story 6.3) actually meaningful.

### Architecture & key patterns

**Translation hook usage (next-intl 4.x):**
- `useTranslations()` — universal hook, works in BOTH server and client components. Default — use unless you have a specific reason not to.
- `getTranslations()` — async, server-only. Use in server actions, generateMetadata, route handlers.
- Usage: `const t = useTranslations('auth.signIn')` scopes to that namespace; `t('title')` → `auth.signIn.title`. Or `useTranslations()` (no arg) for full-path access (`t('common.save')`).
- **Don't** call `useTranslations` inside loops or conditionals. Standard React hook rules.

**Server-component layouts that already render before locale narrowing:**
For pages that need `setRequestLocale` (server static rendering optimization), keep the pattern from Story 6.1's `app/[locale]/page.tsx`:
```ts
const { locale } = await params
if (!hasLocale(routing.locales, locale)) notFound()
setRequestLocale(locale)
```
Sibling pages (e.g., `/[locale]/dashboard/page.tsx`) should also call `setRequestLocale(locale)` if they're statically rendered. For dynamic-only pages (those calling `cookies()`, `auth()`, etc.) it's optional. Default to including it for consistency.

**Zod schemas with translated messages:**
Zod evaluates messages at schema-build time. If you build the schema at module top level, you get one English message frozen. Two options:

```ts
// Option A — build inside component (acceptable for forms; rebuild on each render is cheap)
function SignInForm() {
  const t = useTranslations('errors.validation')
  const schema = z.object({
    email: z.string().email(t('invalidEmail')),
    password: z.string().min(8, t('passwordMin8')),
  })
  const { register, handleSubmit } = useForm({ resolver: zodResolver(schema) })
  // ...
}

// Option B — pass message function to schema factory
function makeSchema(t: ReturnType<typeof useTranslations>) {
  return z.object({ ... })
}
```

Prefer Option A for simplicity unless the schema is reused in multiple places.

**Auth error mapping (the slippery one):**
Don't match on `error.message` strings — those are Supabase-localized in unpredictable ways and break across SDK upgrades. Match on `error.code` or `error.status`:

```ts
// lib/auth/error-map.ts
import type { AuthError } from '@supabase/supabase-js'

export function mapAuthError(error: AuthError | { message?: string; code?: string }): string {
  const code = 'code' in error ? error.code : undefined
  const message = error.message ?? ''

  if (code === 'invalid_credentials') return 'errors.auth.invalidCredentials'
  if (code === 'email_not_confirmed' || message === 'Email not confirmed') return 'errors.auth.emailNotConfirmed'
  if (code === 'over_email_send_rate_limit') return 'errors.auth.rateLimit'
  if (code === 'weak_password') return 'errors.auth.weakPassword'
  if (code === 'otp_expired') return 'errors.auth.otpExpired'
  // ...
  return 'errors.auth.unknown'
}

// usage
const { error } = await supabase.auth.signInWithPassword({ email, password })
if (error) setErrorMsg(t(mapAuthError(error)))
```

This makes adding a new mapping a single file change, and gives Vietnamese-translated errors automatically.

**Locale-aware navigation imports (the migration tedium):**
Every file that does in-app navigation must import from `@/i18n/navigation`, not `next/link` or `next/navigation`. The shape is identical, so it's mostly a search-and-replace, with two gotchas:
1. `useSearchParams` is NOT exported from `@/i18n/navigation` (it's not locale-relevant). Keep that import from `next/navigation`.
2. `redirect` from `@/i18n/navigation` has a different signature: `redirect({ href, locale })` — different from `redirect(url)` in `next/navigation`. Server actions and server components calling redirect need to fetch `getLocale()` first.

**Preserving the (app) layout's user redirect:**
Story 6.1 reverted the `app/[locale]/(app)/layout.tsx` redirect to `redirect('/sign-in')` from `next/navigation` because TypeScript narrowing didn't propagate across `await getLocale()`. The middleware (`lib/supabase/proxy.ts`) handles locale-aware redirect. **Don't fight this** — leave the layout's `redirect('/sign-in')` as-is, OR if migrating, use a helper that accepts a non-null user assertion:

```ts
// lib/auth/require-user.ts
import { redirect } from '@/i18n/navigation'
import { getLocale } from 'next-intl/server'
import { getUser } from '@/lib/supabase/server'

export async function requireUser() {
  const user = await getUser()
  if (!user) {
    const locale = await getLocale()
    redirect({ href: '/sign-in', locale })
  }
  return user!  // type assertion: redirect throws, so this is reachable only when user is truthy
}
```

Either approach is fine; pick one and apply consistently.

### Anti-patterns — DO NOT

- ❌ **Don't translate keys.** Keys stay English (`auth.signIn.title`); only values get translated. NO `auth.dangNhap.tieuDe` keys.
- ❌ **Don't duplicate `common.*` strings into feature namespaces.** `auth.signIn.cancelButton` ≠ `common.cancel`. Use `common.cancel` everywhere.
- ❌ **Don't match `error.message` strings.** Use `error.code` (see auth error mapping above).
- ❌ **Don't nest beyond 3 levels.** `auth.signIn.email.label` ✅ — `auth.signIn.form.email.label.text` ❌.
- ❌ **Don't put translation lookup inside JSX prop arrays/maps that don't see hook context.** Static arrays of `{ key: 'tools' }` are fine; rendering text from them happens during render where `t` is available.
- ❌ **Don't call `useTranslations` inside `useEffect` or callbacks** — same React rule as any other hook.
- ❌ **Don't ship `__MISSING__` or empty-string values in `vi.json`.** The parity test (Task 13) catches this.
- ❌ **Don't use `next/link` for in-app links.** Locale must be preserved.

### File touches by namespace

**`landing` (Task 4):** `components/marketing/{LandingNav,HeroSection,HeroVisual,ToolStrip,XPBand,LandingFooter}.tsx`

**`auth` (Task 5):** `app/[locale]/{sign-in,sign-up,onboarding}/page.tsx`, `app/[locale]/auth/{forgot-password,update-password,error,sign-up-success,confirm}/{page.tsx,route.ts}` (route.ts only for redirect-target keys), `components/features/{forgot-password-form,update-password-form,logout-button}.tsx`

**`nav` (Task 6):** `components/layout/{SideNav,BottomNav,TopBar,sidebar.tsx,bottom-nav.tsx}.tsx`, `components/settings/{SettingsNav,MobileBackLink}.tsx`. Note: lowercase `sidebar.tsx`/`bottom-nav.tsx` may be old duplicates — confirm and consolidate before migrating.

**`dashboard` (Task 7):** `app/[locale]/(app)/dashboard/page.tsx`, `components/dashboard/*.tsx` (9 files)

**`pomodoro` (Task 8):** `app/[locale]/(app)/pomodoro/page.tsx`, `components/pomodoro/*.tsx` (12 files), `components/features/{focus-timer,session-label}.tsx`, `components/layout/focus-mode-shell.tsx`

**`habits` (Task 9):** `app/[locale]/(app)/habits/page.tsx`, `app/[locale]/(app)/habits/HabitsClient.tsx`, `components/habits/*.tsx` (9 files), `components/features/habit-card.tsx`

**`flashcards` (Task 10):** `app/[locale]/(app)/flashcards/{page.tsx,FlashcardsClient.tsx,[deckId]/{page.tsx,DeckDetailClient.tsx,study/page.tsx}}`, `components/flashcard/*.tsx` (13 files)

**`character` + `settings` + `legal` (Task 11):** `app/[locale]/(app)/character/page.tsx`, `components/character/*.tsx`, `app/[locale]/(app)/settings/{page,about,account,appearance,notifications,profile}/page.tsx`, `app/[locale]/(app)/settings/layout.tsx`, `components/settings/*.tsx` (~12 files), `app/[locale]/legal/{privacy,terms}/page.tsx`, `app/[locale]/legal/layout.tsx`

**Cross-cutting (Task 12):** Every file currently importing `next/link` or `next/navigation` for `Link`/`useRouter`/`redirect`/`usePathname`. Estimated ~30 files based on Story 6.1's grep (`grep -rn "from 'next/link'\|from 'next/navigation'" app components`).

### Estimated scope

- ~250-400 translation keys total (rough order-of-magnitude based on ~50 components × 5-8 strings each, minus shared `common.*`).
- ~50-60 files touched.
- 2x message files updated.
- 1 new helper (`lib/auth/error-map.ts`).
- 1 new test (`__tests__/i18n-parity.test.ts`).

This is the largest story in Epic 6. Consider splitting if delivering in one PR feels too risky:
- **6.2a:** Tasks 1, 2, 3, 4, 5, 6, 13, 14 (foundation tree + auth + nav + landing + parity test) → ships locale-aware login/landing
- **6.2b:** Tasks 7, 8, 9, 10, 11 (feature pages) → ships rest

Task 12 (link migration) can fold into either half or run separately.

### Testing strategy

**Unit / parity:**
- `__tests__/i18n-parity.test.ts` — structural parity between en.json and vi.json (Task 13).
- Existing component tests should still pass; if any test asserts on hardcoded English, update those tests to render with a wrapper that provides messages via `NextIntlClientProvider`.

**Integration / smoke (manual):**
- Per AC-6.2.2: walk every route in both locales.
- Per AC-6.2.5/6.2.9: verify navigation stays within locale.

**Out of scope for this story:**
- Visual regression / snapshot tests for VI rendering (defer — too noisy for first migration).
- Accessibility audit for screen-reader Vietnamese pronunciation (defer to 6.7 SEO/a11y story).

### Dependencies

- **Blocked by:** Story 6.1 (i18n foundation). ✅ Done.
- **Blocks:** Story 6.3 (LocaleSwitcher UI) — switcher needs translated UI to show off; Story 6.6 (DB persistence) — persistence is irrelevant if UI doesn't translate.
- **Independent of:** Story 6.7 (email translations + SEO) — can run after 6.2 in any order.

## Out of Scope (defer to later stories)

- **LocaleSwitcher UI component** (Story 6.3) — the dropdown/toggle that lets the user pick their language. Story 6.2 ships translatable UI; 6.3 ships the picker.
- **Persisting user locale preference** (Story 6.6) — column on `profiles`, sync between cookie/DB on login. Out of scope.
- **Email template translations** (Story 6.7) — Supabase email templates (sign-up confirmation, password reset) are configured in Supabase dashboard with their own template language. Separate concern.
- **`hreflang` SEO tags + sitemap per-locale** (Story 6.7).
- **Vietnamese-specific number/date/currency formatting beyond next-intl defaults** — `next-intl`'s built-in `useFormatter()` covers basic needs; custom formatters defer.
- **AI-translated content** (e.g., AI insights in habits) — those strings come from an LLM at runtime; localizing the prompt to ask the LLM to respond in user's locale is a separate consideration, defer.
- **RTL layouts** — neither EN nor VI is RTL; not applicable.

## Related Artifacts

- Story 6.1 spec (foundation): `_bmad-output/implementation-artifacts/spec-i18n-1-foundation.md`
- Translation key naming convention: `_bmad-output/planning-artifacts/i18n-key-naming-convention.md` (THE source of truth for namespace structure and key shape — read first)
- next-intl docs (4.x App Router): https://next-intl.dev/docs/getting-started/app-router

## Dev Agent Record

### Implementation Plan

Multi-agent orchestration:
- **Phase 1 (sequential, foundation):** 1 agent built the canonical key tree, VI translations, and the Supabase error mapper.
- **Phase 2 (parallel, surface migration):** 4 agents launched concurrently, each owning a non-overlapping component scope (landing+auth · nav+dashboard · pomodoro+habits · flashcards+character+settings+legal). All four hit user-account rate limit before completing their full scopes.
- **Phase 3 (sequential, convergence):** orchestrator added the parity test, fixed cross-cutting `next/link` / `next/navigation` imports the agents didn't reach, narrowed `mapAuthError` return type to satisfy `next-intl` typed-keys, and migrated several high-priority pages (character, legal, habits page) directly.

### Completion Notes

**Status: PARTIALLY COMPLETE — Phase 1 done, Phase 2 ~60% done, Phase 3 verification gates partial.**

Done:
- ✅ `messages/en.json` + `messages/vi.json` — 710 leaf keys each, structurally identical, every leaf non-empty, ICU placeholders preserved.
- ✅ `lib/auth/error-map.ts` — `mapAuthError(error): AuthErrorKey` with strict key union return type.
- ✅ `__tests__/i18n-parity.test.ts` — 6 vitest assertions (parity, no extras, no empty leaves, no `__MISSING__`/`__TODO__`, ICU placeholder name match). Passes.
- ✅ All `next/link` imports migrated to `@/i18n/navigation` (or kept where excluded per spec — confirm route handler `app/[locale]/auth/confirm/route.ts` only).
- ✅ All `next/navigation` imports migrated where appropriate. Kept per spec: `notFound` in `[locale]/layout.tsx` + `[locale]/page.tsx`, `redirect('/sign-in')` in `[locale]/(app)/layout.tsx` and `[locale]/(app)/habits/page.tsx` (middleware handles locale-aware redirect — see spec line 178), `useParams` in `study/page.tsx`, `redirect` in `confirm/route.ts`.
- ✅ Locale-aware `redirect({ href, locale })` in `[locale]/page.tsx`, `settings/page.tsx`.
- ✅ ~32 components fully migrated to `useTranslations()` (marketing 6/6 · auth pages + forms · onboarding · sign-in/sign-up · SideNav, BottomNav, SettingsNav, MobileBackLink · dashboard page + HeroCard, ToolGrid · most pomodoro top-level components · legal pages · character page).
- ✅ Zod schemas in auth forms read from `errors.validation.*`.
- ✅ Supabase auth errors routed through `mapAuthError(error)` + `t(...)`.
- ✅ `pnpm type-check` PASS (0 errors).
- ✅ `pnpm lint` PASS (0 errors, 1 pre-existing warning unrelated to this story).
- ✅ `pnpm test:run __tests__/i18n-parity.test.ts` PASS.

**Pending (Phase 2 surface-migration files NOT yet converted to `useTranslations()` — keys exist in tree, components still render hardcoded English):**

- `dashboard`: `QuestList.tsx`, `StreakCard.tsx`, `WeeklyStats.tsx`, `RecentBadges.tsx`, `NotificationPanel.tsx`, `SearchDropdown.tsx`, `DashboardTopBarActions.tsx` (imports were migrated but content not translated).
- `pomodoro`: `SessionDots.tsx`, `SessionHistoryChart.tsx`, `SoundscapeSelector.tsx`, `TaskItem.tsx`, `TaskList.tsx`, `XPTickerPanel.tsx`. Plus `app/[locale]/(app)/pomodoro/page.tsx` may still have hardcoded TopBar strings — check.
- `habits`: ALL components un-migrated — `HabitCard`, `HabitForm`, `AiInsightCard`, `CheckInButton`, `HeatmapView`, `InsightPanel`, `RemindersPanel`, `StreakBadge`, `WeeklyGrid`, `HabitsClient`. (Page-level `habits/page.tsx` migrated.)
- `flashcards`: most `components/flashcard/*` un-migrated — `DeckEditor`, `DeckStats`, `CardEditor`, `CardFlip`, `FlashcardSidebar` text, `FlashcardStatsRail`, `ForecastChart`, `RatingButtons`, `ReviewSession` text, `SessionProgress`, `SessionSummary`, `DeckList`, `DeckCard`. Plus `flashcards/page.tsx`, `[deckId]/study/page.tsx` content.
- `character`: `CharacterSheet`, `ActivityTimeline`, `BadgeGrid`, `StatChart` un-migrated. (Page is migrated.)
- `settings`: most `components/settings/*` un-migrated — `AboutSection`, `AccountSection`, `AppearanceSection`, `NotificationsSection`, `AvatarUpload`, `BrowserPermissionCard`, `DeleteAccountDialog`, `EmailChangeForm`, `HabitReminderCard`, `HueSlider`, `PasswordChangeForm`, `SettingsSectionList`. Plus `settings/{account,profile,appearance,notifications,about}/page.tsx`.

**To resume:** spawn 4 fresh agents (after rate-limit recovery) with the same surface scopes — keys are already in `messages/en.json` / `messages/vi.json`, the foundation pattern is established, the work is mechanical from here. Each agent needs the spec + the file list above for their surface.

**AC status:**
- AC-6.2.1 (no hardcoded UI strings): ❌ — re-audit grep returns ~61 lines of capital-leading JSX text in unmigrated components.
- AC-6.2.2 (every locale-visible surface renders in both `/en` and `/vi`): ⚠️ partial — surfaces with migrated components do; un-migrated components fall through to literal English.
- AC-6.2.3 (key namespace structure): ✅ followed.
- AC-6.2.4 (key parity): ✅ enforced by parity test.
- AC-6.2.5 (locale-preserving navigation): ✅ all in-app `<Link>` and `useRouter`/`redirect` migrated; spec-permitted exceptions kept.
- AC-6.2.6 (Zod messages localized): ✅ for migrated forms (auth); ❌ for un-migrated (settings forms).
- AC-6.2.7 (Auth error codes localized): ✅ via `mapAuthError`.
- AC-6.2.8 (build/lint/typecheck): ⚠️ typecheck + lint PASS; `pnpm build` not run yet (defer until full migration).
- AC-6.2.9 (locale switch is pure URL swap): ⚠️ partially — applies to migrated surfaces.

### File List

**Foundation:**
- `messages/en.json` (rewritten from POC stub to 710-key canonical tree)
- `messages/vi.json` (rewritten — full Vietnamese translations)
- `lib/auth/error-map.ts` (new)

**Test:**
- `__tests__/i18n-parity.test.ts` (new)

**Cross-cutting (orchestrator-handled):**
- `app/[locale]/page.tsx` (redirect → `@/i18n/navigation`)
- `app/[locale]/(app)/settings/page.tsx` (redirect → `@/i18n/navigation`)
- `app/[locale]/(app)/habits/page.tsx` (TopBar strings → `t()`, redirect kept per spec)
- `app/[locale]/(app)/character/page.tsx` (full migration)
- `app/[locale]/(app)/flashcards/[deckId]/study/page.tsx` (split useParams/useRouter imports)
- `app/[locale]/legal/privacy/page.tsx` (full migration including `generateMetadata`)
- `app/[locale]/legal/terms/page.tsx` (full migration including `generateMetadata`)
- `hooks/useSettings.ts` (`useRouter` → `@/i18n/navigation`)

**Migrated by Agent A (landing + auth):**
- `components/marketing/{LandingNav,HeroSection,HeroVisual,ToolStrip,XPBand,LandingFooter}.tsx`
- `app/[locale]/sign-in/page.tsx`, `app/[locale]/sign-up/page.tsx`, `app/[locale]/onboarding/page.tsx`
- `app/[locale]/auth/{error,sign-up-success}/page.tsx`
- `components/features/{forgot-password-form,update-password-form,logout-button}.tsx`

**Migrated by Agent B (nav + dashboard, partial):**
- `components/layout/{SideNav,BottomNav}.tsx` (TopBar.tsx unchanged — receives translated strings via props)
- `components/settings/{SettingsNav,MobileBackLink}.tsx`
- Removed legacy duplicates: `components/layout/{sidebar,bottom-nav}.tsx`
- `app/[locale]/(app)/dashboard/page.tsx`
- `components/dashboard/{HeroCard,ToolGrid}.tsx`
- Imports-only updates: `components/dashboard/{NotificationPanel,SearchDropdown,DashboardTopBarActions}.tsx`

**Migrated by Agent C (pomodoro + habits, partial):**
- `app/[locale]/(app)/pomodoro/page.tsx`
- `components/pomodoro/{PomodoroTimer,ModeSelector,TimerControls,DurationSettingsModal,FocusModeOverlay,FocusTaskList}.tsx`

**Migrated by Agent D (flashcards + character + settings + legal, partial):**
- `app/[locale]/(app)/flashcards/{page,FlashcardsClient}.tsx`, `[deckId]/{page,DeckDetailClient}.tsx`
- `components/flashcard/FlashcardStatsRail.tsx`
- `components/settings/AvatarUpload.tsx`
- Imports-only updates: `components/settings/{AboutSection,SettingsSectionList,DeleteAccountDialog,DisplayNameForm}.tsx`, `components/character/CharacterSheet.tsx`, `components/flashcard/{DeckCard,FlashcardSidebar,DeckList,ReviewSession}.tsx`

**Other touched (not core to this story but adjacent — pre-existing or incidental):**
- `components/character/{ActivityTimeline,BadgeGrid,StatChart}.tsx` — unrelated formatting
- `components/dashboard/{QuestList,StreakCard,WeeklyStats,RecentBadges}.tsx` — unrelated formatting
- `components/marketing/{LandingNav,HeroSection,HeroVisual,ToolStrip,XPBand,LandingFooter}.tsx` (above)
- `components/rpg/Avatar.tsx`, `components/ui/card.tsx`, `eslint.config.mjs`, `features/gamification/dashboard-queries.ts`, `features/settings/profile.ts`, `hooks/useTimer.ts`, `lib/avatar.ts`, `lib/supabase/proxy.ts`, `middleware.ts`, `next.config.ts` — not part of this story's diff but on branch from prior work.

## Change Log

| Date | Change |
|------|--------|
| 2026-05-01 | Story 6.2 spec created — comprehensive UI translation plan covering all 11 surfaces, locale-aware navigation migration, Zod + Supabase auth error mapping, parity test. Estimated ~250-400 keys, ~50-60 files. |
| 2026-05-01 | Story 6.2 implementation **partially complete**. Foundation (710 keys EN/VI, parity test, error-map), all `next/link` and most `next/navigation` migrations, and ~32 components migrated. Remaining work: ~20 components in habits, flashcards, character widgets, dashboard widgets, settings. typecheck + lint PASS; full `pnpm build` deferred until surface migrations finish. Status remains `in-progress` — not ready for review. |
