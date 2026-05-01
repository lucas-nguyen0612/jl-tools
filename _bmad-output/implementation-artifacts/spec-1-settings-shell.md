---
title: 'Settings shell + navigation'
type: 'feature'
created: '2026-04-28'
status: 'done'
baseline_commit: 'f6d754ed04a777170079f5132909a0548ac8067d'
context:
  - '{project-root}/CLAUDE.md'
  - '{project-root}/docs/features/user-settings.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** No `/settings` shell exists yet, blocking Stories 2–6 from the user-settings doc which fill the 5 sections (Profile / Account / Appearance / Notifications / About).

**Approach:** Add `app/(app)/settings/*` (layout + index + 5 placeholder section pages), a `SettingsNav` sidebar mirroring `components/layout/SideNav.tsx` styling, and a `SettingsSectionList` for the index. iOS-style detail nav on mobile — no auto-redirect. Wire one entry into `SideNav.NAV_ITEMS` and mirror into `BottomNav` for mobile parity.

## Boundaries & Constraints

**Always:**
- Match existing visuals from `SideNav.tsx` / `BottomNav.tsx`: CSS vars `--jl-*`, `lucide-react` icons, active state via `pathname.startsWith(href)`, named exports.
- Paths flat at repo root (CLAUDE.md describes `src/` but the repo is flat).
- Auth guard reuses `app/(app)/layout.tsx`'s `redirect('/login')` — no new auth code.
- `/settings` index always renders the section list. No redirect.

**Ask First:**
- Any change to `SideNav` props or `(app)/layout.tsx` data fetching (this spec only adds one `NAV_ITEMS` entry).
- Dropping a tool from `BottomNav` if the 6-column layout looks cramped on real devices.

**Never:**
- Do not implement section content — those are Stories 2–6 (see `deferred-work.md`).
- Do not create migrations, server actions, schemas, cookie helpers, or storage buckets.
- Do not redirect `/settings` → `/settings/profile`.
- Do not rename or restructure `SideNav.tsx` / `BottomNav.tsx` / `TopBar.tsx`.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Behavior |
|----------|--------------|-------------------|
| Unauth hits `/settings/*` | No session | Parent layout redirects to `/login`; settings tree never renders |
| Auth hits `/settings` | Session valid | Section list renders 5 cards; no redirect |
| Auth on `/settings/<section>` (md+) | Desktop viewport | 2-col: SettingsNav left (~220px) + section placeholder right; back link hidden |
| Auth on `/settings/<section>` (<768px) | Mobile viewport | SettingsNav hidden; `← Settings` back link visible at top |
| Auth on any `/settings/*` | Active route | `Settings` item in `SideNav` highlights via `pathname.startsWith('/settings')` |
| Auth taps Settings in `BottomNav` (mobile) | Tap | Navigate to `/settings`; section list renders |

</frozen-after-approval>

## Code Map

- `app/(app)/layout.tsx` — UNCHANGED. Provides auth guard and outer chrome.
- `app/(app)/settings/layout.tsx` — NEW. Server component. Renders `<SettingsNav />` (md+) + `<main>{children}</main>`.
- `app/(app)/settings/page.tsx` — NEW. Server component. Renders `<TopBar title="Settings" />` + `<SettingsSectionList />`.
- `app/(app)/settings/{profile,account,appearance,notifications,about}/page.tsx` — NEW (5 files). Each renders `<MobileBackLink />` + `<TopBar title="…" />` + `Coming soon — Story N` body.
- `components/settings/SettingsNav.tsx` — NEW. `'use client'`. Vertical nav, 5 items, lucide icons (`User`, `KeyRound`, `Palette`, `Bell`, `Info`), `hidden md:flex`. Mirrors `SideNav.tsx` item styling.
- `components/settings/SettingsSectionList.tsx` — NEW. Card list (icon + title + 1-line description, each a `<Link>`). Always rendered.
- `components/settings/MobileBackLink.tsx` — NEW. `'use client'`. `md:hidden` `<Link href="/settings">← Settings</Link>`.
- `components/layout/SideNav.tsx` — EDIT. Append `{ href: '/settings', icon: Settings, label: 'Settings' }` to `NAV_ITEMS` (after Character). Import `Settings` from `lucide-react`.
- `components/layout/BottomNav.tsx` — EDIT. Append matching entry; change grid `repeat(5, 1fr)` → `repeat(6, 1fr)`.
- `__tests__/settings-shell.test.tsx` — NEW. Vitest + RTL. Asserts I/O matrix: section list renders 5 expected hrefs; `SettingsNav` highlights item matching mocked pathname; `SideNav.NAV_ITEMS` and `BottomNav` arrays contain `/settings` entry.

## Tasks & Acceptance

**Execution:**
- [x] `components/settings/SettingsNav.tsx` -- vertical nav, 5 items, active via `pathname.startsWith()`, hidden mobile
- [x] `components/settings/SettingsSectionList.tsx` -- 5-card list, each a `<Link>`
- [x] `components/settings/MobileBackLink.tsx` -- `md:hidden` back link
- [x] `app/(app)/settings/layout.tsx` -- 2-col shell wrapping children
- [x] `app/(app)/settings/page.tsx` -- TopBar + SettingsSectionList, no redirect
- [x] `app/(app)/settings/profile/page.tsx` -- placeholder (Story 2)
- [x] `app/(app)/settings/account/page.tsx` -- placeholder (Story 3)
- [x] `app/(app)/settings/appearance/page.tsx` -- placeholder (Story 4)
- [x] `app/(app)/settings/notifications/page.tsx` -- placeholder (Story 5)
- [x] `app/(app)/settings/about/page.tsx` -- placeholder (Story 6)
- [x] `components/layout/SideNav.tsx` -- add `Settings` icon import + NAV_ITEMS entry after Character
- [x] `components/layout/BottomNav.tsx` -- add `Settings` entry; grid → `repeat(6, 1fr)`
- [x] `__tests__/settings-shell.test.tsx` -- cover I/O matrix scenarios

**Acceptance Criteria:**
- Given an authenticated user on desktop, when they visit `/settings`, then the section list renders with 5 cards and `SettingsNav` is visible.
- Given an authenticated user on mobile, when they visit `/settings/profile`, then `SettingsNav` is hidden and a `← Settings` back link is visible at the top.
- Given an authenticated user on any `/settings/*` route, when they look at `SideNav`, then the `Settings` item is highlighted.
- Given an authenticated user on mobile, when they look at `BottomNav`, then they see 6 items including `Settings`.
- Given an unauthenticated user, when they hit any `/settings/*` URL, then they are redirected to `/login`.

## Spec Change Log

## Design Notes

**iOS-style mobile (Q2=3):** `/settings` never redirects. Desktop renders the section list alongside the sidebar; mobile renders the list standalone, with `MobileBackLink` at the top of each section detail page providing in-app back nav.

**`BottomNav` 5 → 6 columns:** mobile parity for the new SideNav entry. ~60px per slot at 360px width is comfortable for the existing 18px icon + 10px label density. Fallback if cramped: drop a tool from BottomNav or move Settings into a TopBar dropdown (recorded under Ask First).

## Verification

**Commands:**
- `pnpm lint` -- no new errors in changed paths.
- `pnpm typecheck` -- passes (strict mode, no `any`).
- `pnpm test __tests__/settings-shell.test.tsx` -- all assertions pass.
- `pnpm dev`, visit `/settings` (auth) and `/settings/profile` on mobile emulator -- matches I/O matrix.

## Suggested Review Order

**Active-state contract & a11y (highest-leverage)**

- Prefix-safe match + null guard — the design anchor for nav highlighting.
  [`SettingsNav.tsx:52`](../../components/settings/SettingsNav.tsx#L52)

- Semantic active flag drives both styling and screen readers.
  [`SettingsNav.tsx:74`](../../components/settings/SettingsNav.tsx#L74)

- Landmark labeling on the sidebar.
  [`SettingsNav.tsx:26`](../../components/settings/SettingsNav.tsx#L26)

- Mobile back link gets explicit aria label.
  [`MobileBackLink.tsx:11`](../../components/settings/MobileBackLink.tsx#L11)

**Routing surface**

- 2-column shell, `SettingsNav` hidden on mobile.
  [`settings/layout.tsx:1`](../../app/(app)/settings/layout.tsx#L1)

- Index page always renders the section list — no redirect (iOS pattern).
  [`settings/page.tsx:1`](../../app/(app)/settings/page.tsx#L1)

- Section list with 5 cards as the mobile-first navigation surface.
  [`SettingsSectionList.tsx:1`](../../components/settings/SettingsSectionList.tsx#L1)

**Top-level nav wiring**

- New `Settings` entry appended after Character.
  [`SideNav.tsx:24`](../../components/layout/SideNav.tsx#L24)

- BottomNav grid widened to 6 columns for mobile parity.
  [`BottomNav.tsx:23`](../../components/layout/BottomNav.tsx#L23)

**Placeholder pages (Stories 2–6 swap these)**

- Profile placeholder template — same shape used by 4 sibling pages.
  [`profile/page.tsx:1`](../../app/(app)/settings/profile/page.tsx#L1)

**Tests**

- Prefix-collision regression test — codifies the patch decision.
  [`settings-shell.test.tsx:99`](../../__tests__/settings-shell.test.tsx#L99)

- Active state asserted via `aria-current`, not inline-style strings.
  [`settings-shell.test.tsx:76`](../../__tests__/settings-shell.test.tsx#L76)

