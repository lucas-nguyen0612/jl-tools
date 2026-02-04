# PRD: Habit Tracker (Personal)

## 1. Overview
A personal habit tracker focused on streaks, consistency, and warnings when you miss days. Built with Next.js App Router + Supabase (Auth + Postgres + RLS), Server Actions, Tailwind CSS, and shadcn/ui. Minimal, utilitarian dashboard UI.

## 2. Goals
- Track daily habits with one check-in per day.
- Compute streaks dynamically (no stored streak fields).
- Warn when missed days reach 2+ consecutively.
- Secure by default with Supabase Auth + RLS.

## 3. MVP Scope
### 3.1 Authentication
- Email + Password sign up / sign in via Supabase Auth.
- Session stored in cookies, readable in Server Components.
- Protected routes redirect to `/auth/login` if unauthenticated.

### 3.2 Habit List (Home)
Show active habits with:
- Habit name
- Current streak
- Goal progress: `current_streak / goal_days`
- Today status: Done / Not yet
- Warning if missed 2+ consecutive days

Actions:
- Mark done today
- View details
- Edit habit
- Create new habit

### 3.3 Create / Edit Habit
Form fields:
- Habit name
- Goal days
- Start date (default = today)
- Archive (soft delete)

### 3.4 Habit Detail
- Habit name
- Current streak
- Best streak
- Completion rate: last 7 / 30 days
- Monthly calendar (done / missed)

Actions:
- Mark done today
- Undo today
- Edit habit
- Warning if missed 2+ consecutive days

### 3.5 Habit Logging Logic
- One log per habit per day.
- “Done” = presence of a log for that date.
- Streak computed dynamically from logs.
- Single timezone: `Asia/Ho_Chi_Minh`.

## 4. Data & Security
### 4.1 Supabase Tables
**habits**
- id (uuid)
- user_id (uuid)
- name (text)
- goal_days (int)
- start_date (date)
- archived_at (timestamptz)

**habit_logs**
- habit_id (uuid)
- user_id (uuid)
- log_date (date)
- done (boolean)

### 4.2 RLS
- All select/insert/update/delete restricted to the owner.
- Habit logs must belong to a habit owned by the user.

## 5. Architecture & Tech
- Next.js App Router
- Server Actions + cookies
- Supabase Auth + Postgres + RLS
- Tailwind CSS
- shadcn/ui primitives

## 6. Implemented Files
### Pages
- `app/(app)/page.tsx` (Home)
- `app/(app)/habits/new/page.tsx`
- `app/(app)/habits/[id]/page.tsx`
- `app/(app)/habits/[id]/edit/page.tsx`
- `app/auth/login/page.tsx`
- `app/auth/signup/page.tsx`

### Server Actions
- `app/actions/auth.ts`
- `app/actions/habits.ts`

### Utilities
- `lib/date.ts`
- `lib/streaks.ts`
- `lib/supabase/server.ts`
- `lib/supabase/middleware.ts`

### DB Schema
- `supabase/schema.sql`

## 7. Manual Verification Checklist
1. User can register and log in.
2. Protected routes redirect correctly.
3. Create / edit / archive habits.
4. Mark done today updates streak correctly.
5. Undo works correctly.
6. Streak breaks after missed days.
7. Warning appears after 2 consecutive missed days.
8. Calendar view reflects logs accurately.
9. Refresh keeps session and state intact.
