# JL Tools — Project Context for AI Agents

> **Building UI?** Đọc [`docs/design-system.md`](./docs/design-system.md) trước — chứa tokens `--jl-*`, layout patterns, shadcn primitives đã cài, i18n convention, và anti-patterns. Tránh được việc tự nghĩ pattern lệch với phần còn lại của codebase.

## Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router, Turbopack) |
| Language | TypeScript (strict mode) |
| Styling | Tailwind CSS + shadcn/ui |
| Auth | Supabase Auth (cookie-based, supabase-ssr) |
| State | Zustand (client) + TanStack Query (server) |
| Package Manager | **pnpm** (use pnpm in all commands) |
| Database | Supabase (Postgres + RLS) |
| Hosting | Vercel (auto-deploy on push) |

## Project Structure

```
src/
├── app/                          # Next.js App Router pages
│   ├── layout.tsx                 # Root layout (ThemeProvider)
│   ├── page.tsx                  # Landing page
│   └── auth/                     # Auth pages (login, signup, etc.)
├── components/
│   ├── ui/                       # shadcn/ui components (do not modify structure)
│   ├── features/                 # Feature components (auth forms, hero, etc.)
│   └── layout/                   # Layout components (sidebar, nav — Epic 5)
├── lib/
│   ├── supabase/
│   │   ├── client.ts             # Browser Supabase client
│   │   └── server.ts             # Server-side Supabase client
│   └── utils.ts                  # cn() utility + helpers
└── features/                     # Feature logic (stories 2.4+)
    ├── pomodoro/
    ├── habits/
    └── gamification/
```

## Naming Conventions

| Type | Pattern | Example |
|------|---------|---------|
| Components | PascalCase.tsx | `XpBar.tsx`, `FocusTimer.tsx` |
| Utilities | kebab-case.ts | `xp-calculator.ts` |
| Functions | camelCase | `grantXp()`, `calculateStreak()` |
| Constants | SCREAMING_SNAKE_CASE | `MAX_LEVEL`, `XP_PER_SESSION` |
| DB Tables | snake_case | `pomo_sessions`, `habit_definitions` |
| Types | PascalCase | `Session`, `Habit`, `XpTransaction` |

## Anti-Patterns — DO NOT USE

- ❌ `useEffect` + `useState` for data fetching → Use **TanStack Query**
- ❌ Default exports for components → Use **named exports** (except Next.js page/layout)
- ❌ Inline styles → Use **Tailwind**
- ❌ `any` type → Use **TypeScript strict**
- ❌ Raw SQL → Use **Supabase client**
- ❌ Direct Supabase mutations from client → Use **Server Actions**

## Server Action Return Format

```typescript
type ActionResult<T> =
  | { data: T; error: null }
  | { data: null; error: { message: string; code: string } }
```

## Dev Commands

```bash
# Local development (requires Docker running for Supabase local)
pnpm dev              # Start Next.js dev server

# Supabase local
npx supabase start   # Start Supabase Docker containers
npx supabase stop    # Stop Supabase

# Production
pnpm build           # Build for production
pnpm lint            # ESLint check

# When Story 2.5 is done:
pnpm typecheck       # TypeScript check
pnpm test            # Run tests
```

## Environment Variables

- Copy `.env.example` → `.env.local`
- For Supabase local: run `npx supabase start` and copy the credentials
- For production: set in **Vercel Dashboard → Settings → Environment Variables**

## Routing

- Auth pages: `/sign-in`, `/sign-up`, `/auth/forgot-password`, `/auth/update-password`
- Protected pages: `/protected/*` (requires login)
- Feature pages: `/pomodoro`, `/habits`, `/profile` (Epic 5+)

## Key Patterns

**Zustand Store:**
```typescript
export const useTimerStore = create<TimerStore>((set, get) => ({ ... }))
```

**TanStack Query Keys:**
```typescript
export const pomodoroKeys = {
  all: ['pomodoro'] as const,
  sessions: () => [...pomodoroKeys.all, 'sessions'] as const,
}
```
