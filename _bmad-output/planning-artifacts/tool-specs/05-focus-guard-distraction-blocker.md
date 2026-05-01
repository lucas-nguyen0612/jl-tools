# Tool Spec 05: Focus Guard and Distraction Blocker

## Quick Spec

**Goal:** Help users protect focus sessions by defining blocked sites and clean-session goals, starting with a web/PWA guard and preserving a path to browser extension support.

**Primary users:** Students, remote workers, users distracted by social/video sites.  
**Route:** settings inside `app/(app)/pomodoro/page.tsx`, later `app/(app)/focus-guard/page.tsx`  
**Domain folder:** `features/focus-guard/` or extend `features/pomodoro/`  
**UI folder:** `components/focus-guard/`

## Product Story

As a user starting a focus session, I want JL-Tools to warn me when I try to visit distracting sites so that I can finish clean sessions and earn bonus XP.

## MVP Scope

- Re-enable blocked sites UI already preserved in schema.
- User-defined blocked site list.
- Focus session clean score.
- In-app warning screen for links opened from JL-Tools.
- Browser extension specification for Phase 2.
- Clean-session XP bonus continues to use Pomodoro completion.

## Out of Scope

- True cross-browser site blocking in MVP.
- Native OS blocking.
- VPN/DNS-level blocking.
- Parental control features.

## User Stories and Acceptance Criteria

### Story FG-1: Manage Blocked Sites

As a user, I want to define distracting sites so that focus sessions know what to guard against.

Acceptance criteria:
- Given I open Pomodoro settings, when I add a domain, then it is saved to `pomodoro_settings.blocked_sites`.
- Given I enter an invalid domain, then validation blocks it.
- Given I remove a domain, then it no longer appears in the list.

Tasks:
- Restore or build `BlockedSitesSettings`.
- Add domain validation utility.
- Update settings server action.
- Add tests for domain normalization.

### Story FG-2: Clean Session Guard

As a user, I want a clean session indicator so that I know whether I still qualify for bonus XP.

Acceptance criteria:
- Given focus guard is enabled, when a session starts, then clean status starts as true.
- Given the user pauses beyond allowed threshold, then clean status becomes false.
- Given the session completes cleanly, then clean bonus XP is awarded.

Tasks:
- Reuse existing Pomodoro clean-session logic.
- Build `CleanSessionIndicator`.
- Ensure clean bonus remains server-validated.

### Story FG-3: In-App Block Warning

As a user, I want distracting links inside JL-Tools to show a warning during focus so that I can choose to stay focused.

Acceptance criteria:
- Given a focus session is active and a blocked domain is opened from JL-Tools, then a warning modal appears.
- Given I cancel, then I remain in JL-Tools.
- Given I continue, then the session is marked interrupted.

Tasks:
- Add URL checking helper.
- Build `BlockedLinkWarningDialog`.
- Add event to mark interruption in Pomodoro store.

### Story FG-4: Browser Extension Handoff Spec

As a developer, I want a clear extension contract so that true site blocking can be added later without rewriting core Pomodoro logic.

Acceptance criteria:
- Given extension is installed later, it can read active focus session state through a minimal API.
- Given extension reports a blocked visit, JL-Tools records an interruption.
- Given extension is not installed, Pomodoro still works normally.

Tasks:
- Document extension API contract.
- Add placeholder endpoint `GET /api/focus-guard/session-state`.
- Add placeholder endpoint `POST /api/focus-guard/interruption`.
- Keep endpoint disabled or guarded until extension work begins.

## Data Model Draft

Use existing:

```sql
pomodoro_settings.focus_blocker_enabled
pomodoro_settings.blocked_sites
pomodoro_sessions.interruptions
pomodoro_sessions.is_clean
```

Optional future:

```sql
focus_guard_events(id, user_id, pomodoro_session_id, event_type, domain, occurred_at)
```

## Quick Dev File Checklist

- `components/focus-guard/BlockedSitesSettings.tsx`
- `components/focus-guard/CleanSessionIndicator.tsx`
- `components/focus-guard/BlockedLinkWarningDialog.tsx`
- `features/focus-guard/domain.ts`
- `features/focus-guard/actions.ts`
- `app/api/focus-guard/session-state/route.ts`
- `app/api/focus-guard/interruption/route.ts`
- Optional: `supabase/migrations/00025_focus_guard_events.sql`

## Test Plan

- Domain validation handles `https://`, paths, uppercase, and duplicates.
- Clean-session bonus is awarded only when server session is clean.
- Warning dialog marks interruption only after user proceeds.
- Pomodoro works when focus guard is disabled.

