---
title: 'About section — version, build date, feedback link'
type: 'feature'
created: '2026-04-28'
status: 'draft'
baseline_commit: '0909549ac3f680cd3bbdda2562eb902e5f9031c9'
context:
  - '{project-root}/CLAUDE.md'
  - '{project-root}/docs/features/user-settings.md'
  - '{project-root}/_bmad-output/implementation-artifacts/spec-1-settings-shell.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** `/settings/about` is a placeholder. Users have no in-app way to confirm app version when reporting bugs, no path to send feedback, and no link to ToS / Privacy Policy. Useful trust + support signal, cheap to ship.

**Approach:** Static section component. Read app version from `package.json` (currently missing — add a `version` field). Inject version + build date into the runtime via `next.config.ts` `env` so the values are baked at build time and don't require a Server Action. Feedback link is a `mailto:` for now (lowest friction; can swap to a Google Form later without code structure change). ToS / Privacy are placeholder routes (`/legal/terms`, `/legal/privacy`) shown as `<Link>`s — actual content out of scope.

## Open Questions — minor, can decide inline

1. **Feedback target.** `mailto:dat.t.nguyen.works@gmail.com` (default — your CLAUDE.md user email) vs Google Form vs in-app feedback widget. Pick `mailto:` for the lean MVP unless Lucas wants something different.
2. **Legal placeholder routes.** Either ship `/legal/terms` and `/legal/privacy` as empty "Coming soon" pages now (small but real surface) or just link to `#` and disable the anchor styling. Default to "Coming soon" placeholder pages so the links don't 404.

## Boundaries & Constraints

**Always:**
- Version comes from `package.json` `version` field (add if missing — semver, start `0.1.0`).
- Build date is the build's wall-clock time, injected via `next.config.ts` env. Pure server-rendered into the page; no client-side `Date.now()`.
- Feedback link uses `mailto:` with subject prefilled (`Subject=JL%20Tools%20Feedback%20-%20v{version}`).
- Legal placeholder pages render under `app/legal/{terms,privacy}/page.tsx` (not nested under `(app)` — they should be public, no auth).
- Snapshot test pins the rendered structure so accidental version-string changes are visible in PR diff.

**Ask First:**
- Adding a real ToS / Privacy Policy text body — that's a legal exercise, not engineering. Out of scope.
- Replacing `mailto:` with a backed feedback form (Resend / Supabase function / 3rd party) — adds infra, defer.

**Never:**
- Do not read `package.json` from a Server Component at request time. Inject via `env` at build so it's a constant.
- Do not commit a generated `__BUILD_DATE__` constant — let `next.config.ts` compute it on every build.
- Do not implement Profile / Account / Notifications (separate specs).

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Behavior |
|----------|---------------|-------------------|
| Visit `/settings/about` | Authenticated | Shows app name "JL Tools", version `v0.1.0` (or current `package.json` version), build date in `YYYY-MM-DD` format, feedback link, ToS link, Privacy link |
| Click feedback link | Click | Opens default mail client with `to=`, `subject=` prefilled |
| Click ToS link | Click | Navigates to `/legal/terms` "Coming soon" placeholder |
| Click Privacy link | Click | Navigates to `/legal/privacy` "Coming soon" placeholder |
| `package.json` missing `version` | Build time | `next.config.ts` falls back to `'0.0.0'` and a one-time build warning |
| Visit `/settings/about` while signed out | Unauthenticated | Parent `(app)/layout.tsx` redirect kicks in (consistent with other settings sections) |
| Visit `/legal/terms` while signed out | Unauthenticated | Page renders (legal pages are public) |

</frozen-after-approval>

## Code Map

- `package.json` — EDIT. Add `"version": "0.1.0"` (or current desired starting version). Confirm `"private": true` stays.
- `next.config.ts` — EDIT. Read `process.env.npm_package_version` (or `require('./package.json').version`); compute `new Date().toISOString().slice(0, 10)` for build date. Expose both via `env: { NEXT_PUBLIC_APP_VERSION, NEXT_PUBLIC_BUILD_DATE }`. Note: using `NEXT_PUBLIC_*` so values are available in client components without a Server Action round-trip; they aren't secret.
- `components/settings/AboutSection.tsx` — NEW. Server component. Renders:
  - App name + tagline
  - Version: `v{NEXT_PUBLIC_APP_VERSION}` ("v0.1.0")
  - Build date: `Built {NEXT_PUBLIC_BUILD_DATE}` ("Built 2026-04-28")
  - Feedback link: `<a href="mailto:dat.t.nguyen.works@gmail.com?subject=JL%20Tools%20Feedback%20-%20v{version}">Send feedback</a>`
  - Legal links: `<Link href="/legal/terms">Terms of Service</Link>`, `<Link href="/legal/privacy">Privacy Policy</Link>`
- `app/(app)/settings/about/page.tsx` — EDIT. Replace placeholder with `<AboutSection />`.
- `app/legal/layout.tsx` — NEW. Minimal centered text container; no `(app)` chrome. Sets `<title>` per child.
- `app/legal/terms/page.tsx` — NEW. "Terms of Service — Coming soon. Contact dat.t.nguyen.works@gmail.com for questions." 5–10 lines.
- `app/legal/privacy/page.tsx` — NEW. Same shape.
- `__tests__/about.test.tsx` — NEW. Vitest + RTL. Snapshot of `AboutSection` (with mocked env vars); assert mailto href starts with `mailto:` and includes the version; assert ToS / Privacy `<Link>`s have correct hrefs.

## Tasks & Acceptance

**Execution:**
- [ ] `package.json` — add `version`
- [ ] `next.config.ts` — inject `NEXT_PUBLIC_APP_VERSION` + `NEXT_PUBLIC_BUILD_DATE`
- [ ] `components/settings/AboutSection.tsx` — render content
- [ ] `app/(app)/settings/about/page.tsx` — render section
- [ ] `app/legal/layout.tsx` — public legal chrome
- [ ] `app/legal/terms/page.tsx` — placeholder
- [ ] `app/legal/privacy/page.tsx` — placeholder
- [ ] `__tests__/about.test.tsx` — snapshot + href assertions

**Acceptance Criteria:**
- Given an authenticated user on `/settings/about`, when the page renders, then they see app name, version (matches `package.json`), build date (the date the deployed build was created), a feedback link, a ToS link, and a Privacy link.
- Given the user clicks the feedback link, when their default mail client opens, then `to=` is set to the project email and `subject=` includes the version string.
- Given the user clicks ToS or Privacy, when the page loads, then a "Coming soon" placeholder renders without auth gate.
- Given a build runs without `version` in `package.json`, when the build completes, then version falls back to `0.0.0` and a build-time warning fires.

## Spec Change Log

_(Empty — populated during/after implementation review.)_

## Design Notes

**Build-time constant, not Server Action.** Version + build date never change between requests within a deploy. Injecting at build via `env:` is one less round-trip and one less file to author.

**Why `NEXT_PUBLIC_*`.** Allows the values to render in client components later (e.g., a footer) without a separate fetch. They aren't secret. Documented under Constraints.

**`mailto:` over a feedback form.** Form requires backend (delivery, spam, validation). `mailto:` is one line and works on every platform. When feedback volume justifies, swap the link target to a Google Form or a Supabase edge function — `AboutSection` doesn't change shape.

**Legal pages now, content later.** Routing the placeholder pages reserves the URL surface and avoids `<Link>`-to-404 (broken UX); the body can be filled by Lucas / counsel without engineering changes.

## Verification

**Commands:**
- `pnpm build` — completes; observe `NEXT_PUBLIC_APP_VERSION` echoed once during build.
- `pnpm type-check` — passes.
- `pnpm lint` — no new errors.
- `pnpm test __tests__/about.test.tsx` — snapshot + href assertions pass.
- `pnpm dev` then visit `/settings/about` (authenticated), click feedback (opens mail client), click ToS / Privacy (loads placeholder), sign out and confirm `/legal/terms` still renders without redirect.
