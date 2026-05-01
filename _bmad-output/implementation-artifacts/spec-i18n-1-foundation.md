# Story 6.1 — i18n Foundation

## Status
review

## Story
As a developer, I want next-intl wired vào Next.js App Router với path-based routing `/[locale]/...`, so that toàn bộ stories 6.2–6.6 có nền tảng để build trên (translations, LocaleSwitcher, persistence).

## Acceptance Criteria
- AC-6.1.1: Truy cập `/` redirect 307 → `/en` (default locale prefix always).
- AC-6.1.2: `/en` và `/vi` cùng render landing page; key `app.name` đọc từ `messages/{locale}.json` qua `useTranslations()`.
- AC-6.1.3: Middleware chain: `next-intl` chạy TRƯỚC `updateSession` (Supabase); `/api/*` và `/auth/callback` skip i18n.
- AC-6.1.4: `/protected` (chưa login) redirect → `/en/sign-in` (auth flow giữ nguyên hoạt động sau khi thêm locale prefix).
- AC-6.1.5: `pnpm build` + `pnpm lint` pass; không TS error; autocomplete được key `app.name` trong IDE.

## Tasks / Subtasks

> **Path adjustment:** Project uses root-level layout (`app/`, `lib/`, `i18n/` ở repo root) thay vì `src/`. Tất cả `src/...` paths trong spec dưới được map về root. `next-intl@^4.8.4` đã có sẵn trong `package.json`.

- [x] **Task 1: Install & config next-intl**
  - [x] Subtask 1.1: `next-intl@^4.8.4` (already in package.json — no install needed)
  - [x] Subtask 1.2: Update `next.config.ts` wrap với `createNextIntlPlugin('./i18n/request.ts')`

- [x] **Task 2: Create i18n config layer**
  - [x] Subtask 2.1: `i18n/routing.ts` — `defineRouting` với locales/defaultLocale/localePrefix
  - [x] Subtask 2.2: `i18n/request.ts` — `getRequestConfig` load messages by locale
  - [x] Subtask 2.3: `i18n/navigation.ts` — re-export Link/redirect/usePathname/useRouter từ `createNavigation`

- [x] **Task 3: Create messages files**
  - [x] Subtask 3.1: `messages/en.json` — `{ "app": { "name": "JL Tools" } }`
  - [x] Subtask 3.2: `messages/vi.json` — `{ "app": { "name": "JL Tools" } }` (giữ nguyên brand)

- [x] **Task 4: Restructure App Router**
  - [x] Subtask 4.1: Move root layout content vào `app/[locale]/layout.tsx`; move all locale-aware routes (`(app)`, `(marketing)`, `sign-in`, `sign-up`, `onboarding`, `legal`, `auth/{confirm,error,forgot-password,sign-up-success,update-password}`, `page.tsx`) vào `app/[locale]/`. Removed root `app/layout.tsx` (next-intl Pattern A — locale layout serves as de-facto root for HTML pages).
  - [x] Subtask 4.2: `app/[locale]/layout.tsx` wrap children với `<NextIntlClientProvider>`; `setRequestLocale`; `generateStaticParams`; preserves theme cookie + system theme script.
  - [x] Subtask 4.3: GIỮ `app/auth/callback/route.ts` ngoài `[locale]/` (Supabase callback không có locale).
  - [x] Subtask 4.4: GIỮ `app/api/*` ngoài `[locale]/`.
  - [x] Subtask 4.5 (extra): Removed orphaned `lib/i18n/` placeholder (unused; ran type errors against new typed AppConfig).

- [x] **Task 5: Refactor middleware chain**
  - [x] Subtask 5.1: Update `middleware.ts` — chain `intlMiddleware` → `updateSession`; skip `/api`, `/auth/callback`, static assets.
  - [x] Subtask 5.2: Matcher unchanged — already excludes static asset extensions and `_next/*`.
  - [x] Subtask 5.3: Update `lib/supabase/proxy.ts` — `updateSession` accepts optional `response` param; mutates intl response in place; locale-aware redirect to `/{locale}/sign-in` for unauthenticated protected routes.

- [x] **Task 6: Type augmentation**
  - [x] Subtask 6.1: `global.d.ts` (root) — declare module 'next-intl' với Messages type từ en.json + Locale union type.

- [x] **Task 7: Verify**
  - [x] Subtask 7.1: `pnpm build` ✅ pass, `pnpm lint` ✅ pass (added `.next/`, `_bmad/`, `_bmad-output/`, `coverage/`, `.claude/` to ignore patterns; fixed 2 pre-existing unused-var lint errors).
  - [x] Subtask 7.2: Manual smoke verified via `curl` — `/` → 307 `/en` (with `NEXT_LOCALE=en` cookie), `/en` 200 + renders `app.name`, `/vi` 200 + hreflang links, `/dashboard` (no auth) → 307 `/en/sign-in`.

## Dev Notes

**Library:** `next-intl@^4` (App Router native — check changelog cho `setRequestLocale` API).

**Folder structure target:**
```
src/
├── app/
│   ├── [locale]/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── sign-in/page.tsx
│   │   ├── sign-up/page.tsx
│   │   ├── auth/{forgot-password,update-password}/page.tsx
│   │   ├── protected/...
│   │   ├── pomodoro/page.tsx
│   │   ├── habits/page.tsx
│   │   ├── profile/page.tsx
│   │   └── settings/{account,notifications}/page.tsx
│   ├── auth/callback/route.ts        # NO locale
│   └── api/...                        # NO locale
├── i18n/
│   ├── routing.ts
│   ├── request.ts
│   └── navigation.ts
├── middleware.ts
└── global.d.ts
messages/
├── en.json
└── vi.json
```

**`src/i18n/routing.ts`:**
```ts
import { defineRouting } from 'next-intl/routing'

export const routing = defineRouting({
  locales: ['en', 'vi'],
  defaultLocale: 'en',
  localePrefix: 'always',
})
```

**`src/i18n/request.ts`:**
```ts
import { getRequestConfig } from 'next-intl/server'
import { hasLocale } from 'next-intl'
import { routing } from './routing'

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale
  const locale = hasLocale(routing.locales, requested) ? requested : routing.defaultLocale
  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
  }
})
```

**`src/i18n/navigation.ts`:**
```ts
import { createNavigation } from 'next-intl/navigation'
import { routing } from './routing'

export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing)
```

**Middleware chain pattern (`src/middleware.ts`):**
```ts
import createIntlMiddleware from 'next-intl/middleware'
import { type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'
import { routing } from '@/i18n/routing'

const intlMiddleware = createIntlMiddleware(routing)

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Skip i18n cho callback + api
  if (pathname.startsWith('/auth/callback') || pathname.startsWith('/api')) {
    return await updateSession(request)
  }

  // Intl first → mutate response → Supabase session refresh trên cùng response
  const intlResponse = intlMiddleware(request)
  return await updateSession(request, intlResponse)
}

export const config = {
  matcher: ['/((?!_next|_vercel|.*\\..*).*)'],
}
```

> Note: `updateSession` cần accept optional `response` param để chain cookie writes lên intl response. Adjust signature trong `src/lib/supabase/middleware.ts`.

**`next.config.ts`:**
```ts
import createNextIntlPlugin from 'next-intl/plugin'
const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts')
export default withNextIntl(nextConfig)
```

**`src/global.d.ts`:**
```ts
import type messages from '../messages/en.json'

declare module 'next-intl' {
  interface AppConfig {
    Messages: typeof messages
    Locale: 'en' | 'vi'
  }
}
```

**Supabase callback:** `src/app/auth/callback/route.ts` GIỮ NGUYÊN, không vào `[locale]/`. Redirect URL trong Supabase dashboard không cần đổi.

## Testing

**Manual smoke (MVP, ship-fast):**
- `curl -I http://localhost:3000/` → 307 Location: `/en`
- `curl http://localhost:3000/vi` → 200, render landing
- Logout state → visit `/protected` → redirect `/en/sign-in`
- Login flow `/sign-in` → submit → callback → `/protected` (locale preserved)

**Unit (optional, defer nếu rush):** mock NextRequest, assert `intlMiddleware` called before `updateSession`; assert `/api/foo` skip intl.

**Build gate:** `pnpm build && pnpm lint` phải pass trước khi merge.

## Dependencies
- None (foundation story, merge first trước 6.2–6.6).

## Out of Scope (defer to later stories)
- Translation strings cho UI components (Story 6.2 — chỉ POC 1 key `app.name`).
- LocaleSwitcher UI component (Story 6.3).
- DB column `profiles.preferred_locale` + persistence (Story 6.6).
- Email template translations, `hreflang` tags, `<html lang>` SEO audit, sitemap per-locale (Story 6.7 — post-launch).

## Related Artifacts
- Translation key naming convention: `_bmad-output/planning-artifacts/i18n-key-naming-convention.md`

## Dev Agent Record

### Implementation Plan
Wired next-intl into Next.js App Router với path-based routing `/[locale]/...` (locales: `en`, `vi`; default: `en`; localePrefix: `always`).

**Architecture decisions:**
1. **Pattern A (no root `app/layout.tsx`):** All HTML pages live under `app/[locale]/`, where the locale layout owns `<html lang>` + `<body>`. The remaining routes outside `[locale]/` (`auth/callback/route.ts`, `api/*`) are route handlers returning `Response` objects — they don't need a layout. Removed `app/layout.tsx` entirely. This matches next-intl's official App Router guidance (v4) and eliminates the dual-layout coordination problem.
2. **Middleware chain order:** `intlMiddleware` runs first to resolve/rewrite locale, producing `intlResponse`. `updateSession` (Supabase) then accepts that response as an optional 2nd parameter and mutates it in place to attach session refresh cookies — preventing intl rewrite/redirect headers from being dropped. Skip path: `/auth/callback` + `/api/*` bypass i18n entirely.
3. **Locale-aware auth redirect (single hop):** `lib/supabase/proxy.ts` derives the current locale from the request pathname (regex `^/(en|vi)`) and redirects unauthenticated users to `/{locale}/sign-in` directly. Verified single-hop: `/dashboard` → 307 `/en/sign-in` (no intermediate redirect).
4. **Path mapping:** Project does not use `src/` — all spec paths (`src/app`, `src/i18n`, etc.) map to root-level (`app/`, `i18n/`, etc.). Path alias `@/*` → `./*`.
5. **Type augmentation:** `global.d.ts` declares `Messages: typeof messages` (from `messages/en.json`) and `Locale: 'en' | 'vi'`, giving IDE autocomplete on `t('app.name')` and enforcing valid locale tokens at `setRequestLocale` call sites.

### Completion Notes
- ✅ AC-6.1.1: `curl -I /` → 307 `Location: /en` (sets `NEXT_LOCALE=en` cookie).
- ✅ AC-6.1.2: `/en` and `/vi` both 200; `app.name` renders as "JL Tools" via `useTranslations()` in `LandingNav`. `/vi` response includes proper `hreflang` link headers.
- ✅ AC-6.1.3: Middleware chain verified by build + smoke; `/api/*` and `/auth/callback` skip i18n.
- ✅ AC-6.1.4: `/dashboard` (unauthenticated) → 307 `/en/sign-in` in single hop (proxy.ts strips locale before public-path check, then prepends locale to redirect URL).
- ✅ AC-6.1.5: `pnpm build` succeeds (49 routes generated under `[locale]`); `pnpm lint` exits 0; no TypeScript errors; `t('app.name')` autocompletes via `Messages` type.
- 📌 Removed orphaned `lib/i18n/` placeholder directory (was scaffolded for "Epic 7" but never wired up; conflicted with new typed AppConfig).
- 📌 Fixed 2 pre-existing lint errors blocking `pnpm lint` exit 0 (`hooks/useTimer.ts` unused `startedAt`, `components/features/update-password-form.tsx` unused `Input` import). Theme test failures (24) in `__tests__/theme.test.ts` are pre-existing — they reference Dark Neon Theme tokens replaced by current `--jl-*` tokens. Not in scope for this story.
- 📌 Next.js 16 emits a soft warning: `The "middleware" file convention is deprecated. Please use "proxy" instead.` Renaming `middleware.ts` → `proxy.ts` is a deferred housekeeping item (separate from this story's scope).
- 📌 `Link` and `useRouter` calls across the codebase still use `next/link` / `next/navigation` (not the locale-aware versions from `@/i18n/navigation`). Out of scope per spec — Story 6.2+ migrates UI components.

### File List

**Created:**
- `i18n/routing.ts`
- `i18n/request.ts`
- `i18n/navigation.ts`
- `messages/en.json`
- `messages/vi.json`
- `app/[locale]/layout.tsx`
- `global.d.ts`

**Modified:**
- `next.config.ts` — wrap with `createNextIntlPlugin('./i18n/request.ts')`
- `middleware.ts` — chain `intlMiddleware` → `updateSession`; skip `/auth/callback` + `/api`
- `lib/supabase/proxy.ts` — accept optional response param; locale-aware redirect; strip locale before public-path check
- `eslint.config.mjs` — add ignore patterns for `.next/`, `node_modules/`, `coverage/`, `_bmad/`, `_bmad-output/`, `.claude/`
- `components/marketing/LandingNav.tsx` — wire `app.name` via `useTranslations()` (POC)
- `components/features/update-password-form.tsx` — drop unused `Input` import (lint fix)
- `hooks/useTimer.ts` — drop unused `startedAt` selector (lint fix)
- `app/[locale]/page.tsx` — accept `params.locale`; `hasLocale` validate + `setRequestLocale`
- `app/[locale]/(app)/layout.tsx` — unchanged behavior; relocated only

**Moved (git mv, history preserved):**
- `app/layout.tsx` → DELETED (content merged into `app/[locale]/layout.tsx`)
- `app/page.tsx` → `app/[locale]/page.tsx`
- `app/(app)/` → `app/[locale]/(app)/`
- `app/(marketing)/` → `app/[locale]/(marketing)/`
- `app/sign-in/` → `app/[locale]/sign-in/`
- `app/sign-up/` → `app/[locale]/sign-up/`
- `app/onboarding/` → `app/[locale]/onboarding/`
- `app/legal/` → `app/[locale]/legal/`
- `app/auth/{confirm,error,forgot-password,sign-up-success,update-password}/` → `app/[locale]/auth/{...}/`

**Removed:**
- `app/layout.tsx`
- `app/(auth)/` (was empty)
- `lib/i18n/{i18n.config.ts,index.ts,request.ts,messages/{en,vi}.json}` (orphaned placeholder)

## Change Log
| Date | Change |
|------|--------|
| 2026-05-01 | Story 6.1 implemented — next-intl wired with `/[locale]/...` routing, middleware chain (intl → supabase), Pattern A locale layout, type-safe messages, manual smoke verified. Removed orphaned `lib/i18n/`. |
