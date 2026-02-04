# Habit Tracker

A minimal personal Habit Tracker focused on streaks and consistency. Built with Next.js App Router, Supabase (Auth + Postgres + RLS), Server Actions, Tailwind CSS, and shadcn/ui.

## Features
- Email/Password authentication with Supabase Auth.
- Habit CRUD (create, edit, archive).
- Daily check-in (mark done / undo).
- Dynamic streak calculation from logs.
- Warning after 2+ consecutive missed days.
- Monthly calendar view.
- Fixed timezone: `Asia/Ho_Chi_Minh`.

## Setup
1. Install dependencies:
```bash
npm install
```

2. Create a Supabase project and apply `supabase/schema.sql`.

3. Create `.env.local`:
```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Start the dev server:
```bash
npm run dev
```

## Routes
- Login: `/auth/login`
- Home: `/`
- Create habit: `/habits/new`
- Habit detail: `/habits/[id]`

## Manual verification checklist
1. User can register and log in.
2. Protected routes redirect correctly.
3. Create / edit / archive habits.
4. Mark done today updates streak correctly.
5. Undo works correctly.
6. Streak breaks after missed days.
7. Warning appears after 2 consecutive missed days.
8. Calendar view reflects logs accurately.
9. Refresh keeps session and state intact.
