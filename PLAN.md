# JL-Tools — Implementation Plan

## Tổng quan

Repo hiện tại (`main` branch) đã có một habit tracker hoàn chỉnh: CRUD habits, streak logic, calendar views (week/month/year), Supabase auth. Code sạch, tested.

**Thực trạng vs. Project Brief:**

| Yêu cầu (Brief) | Hiện có | Cần làm |
|---|---|---|
| Turborepo monorepo | Flat Next.js app | Chuyển thành monorepo |
| Pomodoro App | Không có | Xây mới hoàn toàn |
| Gamification (XP/Level) | Không có | Xây mới hoàn toàn |
| Shared Layout (sidebar + bottom nav) | Header đơn giản | Thiết kế lại |
| Dark neon RPG theme | Light theme đơn giản | Thiết kế lại từ đầu |
| i18n (vi/en) | Không có | Thêm mới |
| Habit frequency (daily/weekly/custom) | Chỉ có goal_days | Nâng cấp schema + UI |
| Focus Mode (fullscreen) | Không có | Xây mới |
| Level-up celebration | Không có | Xây mới |
| Supabase profiles + XP table | Chỉ auth + habits | Thêm mới |

---

## Chiến lược merge

Không cần merge `jl-tool` (chỉ có doc, không code). Bắt đầu từ `main` — đó là codebase thực.

**Kế hoạch checkout:** `git checkout main` để code từ branch có code sẵn.

---

## Lộ trình thực hiện

```
Phase 1: Nền tảng — Cơ sở hạ tầng (Foundation)
Phase 2: Thiết kế hệ thống UI (Design System)
Phase 3: Gamification Engine (XP / Level)
Phase 4: Pomodoro App (RPG Focus Timer)
Phase 5: Habit Tracker nâng cao (Enhanced Habits)
Phase 6: Shared Layout + Navigation
Phase 7: i18n + Polish + QA
```

---

## Note

Làm xong task/phase nào thì đánh dấu done cái task/phase đó luôn

## Phase 1 — Nền tảng: Cơ sở hạ tầng

### 1.1 Cấu trúc Monorepo (Turborepo)

**Mục tiêu:** Tách thành 3 packages: `web` (Next.js app), `shared` (types/utils), `ui` (components)

```
jl-tools/
├── apps/
│   └── web/                  # Next.js app (hiện tại → chuyển vào đây)
├── packages/
│   ├── ui/                   # Shared UI components (shadcn/ui)
│   └── shared/               # Types, utils, lib dùng chung
├── turbo.json
├── package.json              # Root — chỉ chứa workspaces
└── pnpm-workspace.yaml
```

**Các bước:**
1. Tạo `pnpm-workspace.yaml` khai báo `apps/*` và `packages/*`
2. Tạo `turbo.json` với pipeline: `build → deploy` cho `web`, `build → package` cho `ui/shared`
3. Tạo `package.json` root (workspaces only, không có dependencies trực tiếp)
4. Chuyển code hiện tại vào `apps/web/`
5. Tạo `packages/shared/src/types/` — di chuyển `lib/types.ts`
6. Tạo `packages/shared/src/utils/` — di chuyển `lib/utils.ts`, `lib/date.ts`, `lib/streaks.ts`
7. Khởi tạo `packages/ui/` với shadcn/ui (từ từ migrate components)
8. Cập nhật imports: `@jl-tools/shared` thay vì `@/lib/...`

**Lưu ý:** Chạy `pnpm install` sau khi cấu trúc xong. Import path: `import { type Habit } from "@jl-tools/shared"`.

**Config cần thiết:**
- `tsconfig.base.json` ở root với `paths` cho `@jl-tools/shared` và `@jl-tools/ui`
- `next.config.js` trong `apps/web/` giữ nguyên

**Kiểm tra:** `pnpm build` chạy thành công trước khi sang phase tiếp theo.

---

### 1.2 Nâng cấp Dependencies

**Thêm vào `apps/web/package.json`:**

```json
{
  "dependencies": {
    "@radix-ui/react-dialog": "^1.0.5",
    "@radix-ui/react-dropdown-menu": "^2.0.6",
    "@radix-ui/react-label": "^2.0.2",
    "@radix-ui/react-progress": "^1.0.3",
    "@radix-ui/react-slot": "^1.0.2",
    "@radix-ui/react-tabs": "^1.0.4",
    "@radix-ui/react-tooltip": "^1.0.7",
    "@radix-ui/react-switch": "^1.0.3",
    "@supabase/ssr": "^0.3.0",
    "@supabase/supabase-js": "^2.45.0",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.1.1",
    "tailwind-merge": "^2.5.2",
    "next": "^14.2.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "next-intl": "^3.17.0",
    "lucide-react": "^0.400.0",
    "sonner": "^1.5.0",
    "tailwindcss-animate": "^1.0.7"
  }
}
```

**Gỡ bỏ:** Emoji usage trong code hiện tại ( streak fire emoji → dùng Lucide icon `Flame` thay vì emoji).

---

### 1.3 Mở rộng Supabase Schema

**Migration mới:** `supabase/migrations/20260402000001_gamification_v1.sql`

```sql
-- ─── Profiles & Gamification ─────────────────────────────────────────────

create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  avatar_url   text,
  locale       text not null default 'vi',
  current_xp   integer not null default 0,
  current_level integer not null default 1,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- RLS: user owns their profile
alter table public.profiles enable row level security;
create policy "Profiles viewable by owner" on public.profiles
  for select using (auth.uid() = id);
create policy "Profiles updatable by owner" on public.profiles
  for update using (auth.uid() = id);

-- Trigger: auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, display_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- ─── XP Transactions ──────────────────────────────────────────────────────

create table if not exists public.xp_transactions (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  source      text not null check (source in ('pomodoro', 'habits')),
  amount      integer not null,
  description text,
  created_at  timestamptz not null default now()
);

alter table public.xp_transactions enable row level security;
create policy "XP transactions viewable by owner" on public.xp_transactions
  for select using (auth.uid() = user_id);
create policy "XP transactions insertable by owner" on public.xp_transactions
  for insert with check (auth.uid() = user_id);


-- ─── Habits Enhancement ───────────────────────────────────────────────────

-- frequency: 'daily' | 'weekly' | 'custom'
-- custom_days: array of 0-6 (Sun-Sat) for custom frequency
alter table public.habits
  add column if not exists frequency   text not null default 'daily',
  add column if not exists custom_days integer[]    default '{}',
  add column if not exists icon         text          default 'star',
  add column if not exists color         text          default '#10b981';

-- ─── Pomodoro Sessions ─────────────────────────────────────────────────────

create table if not exists public.pomodoro_sessions (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  label       text,
  duration    integer not null,          -- minutes
  status      text not null check (status in ('completed', 'cancelled')),
  xp_earned   integer not null default 0,
  created_at  timestamptz not null default now()
);

alter table public.pomodoro_sessions enable row level security;
create policy "Sessions viewable by owner" on public.pomodoro_sessions
  for select using (auth.uid() = user_id);
create policy "Sessions insertable by owner" on public.pomodoro_sessions
  for insert with check (auth.uid() = user_id);
create policy "Sessions deletable by owner" on public.pomodoro_sessions
  for delete using (auth.uid() = user_id);

-- Index for daily stats
create index if not exists pomodoro_sessions_user_date_idx
  on public.pomodoro_sessions (user_id, created_at);

-- ─── User Settings ─────────────────────────────────────────────────────────

create table if not exists public.user_settings (
  user_id          uuid primary key references auth.users(id) on delete cascade,
  pomodoro_focus   integer not null default 25,  -- minutes
  pomodoro_short   integer not null default 5,
  pomodoro_long    integer not null default 15,
  sessions_before_long integer not null default 4,
  updated_at       timestamptz not null default now()
);

alter table public.user_settings enable row level security;
create policy "Settings viewable by owner" on public.user_settings
  for select using (auth.uid() = user_id);
create policy "Settings updatable by owner" on public.user_settings
  for update using (auth.uid() = user_id);
```

**Sau khi chạy migration**, update `lib/supabase/server.ts` để dùng env vars cho cả `NEXT_PUBLIC_SUPABASE_URL` và `NEXT_PUBLIC_SUPABASE_ANON_KEY`.

---

### 1.4 Server Actions — Gamification + Habits

**Tạo `apps/web/app/actions/xp.ts`:**

```typescript
'use server'

import { createSupabaseServerClient } from '@/lib/supabase/server'

// Level thresholds (20 levels, MVP scope)
export const LEVEL_THRESHOLDS = [
  0, 100, 250, 500, 900,   // Lv1-5
  1400, 2000, 2700, 3500, 4500,  // Lv6-10
  5700, 7000, 8500, 10200, 12000, // Lv11-15
  14000, 16200, 18600, 21200       // Lv16-20
]

export function getLevelFromXP(xp: number): number {
  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (xp >= LEVEL_THRESHOLDS[i]) return i + 1
  }
  return 1
}

export function getXPForNextLevel(currentLevel: number): number {
  if (currentLevel >= LEVEL_THRESHOLDS.length) return LEVEL_THRESHOLDS.at(-1)!
  return LEVEL_THRESHOLDS[currentLevel]
}

export async function awardXP(amount: number, source: 'pomodoro' | 'habits', description?: string) {
  const supabase = createSupabaseServerClient()
  const { data: userData } = await supabase.auth.getUser()
  if (!userData.user) return { newLevel: null, leveledUp: false }

  // Insert transaction
  await supabase.from('xp_transactions').insert({
    user_id: userData.user.id,
    source,
    amount,
    description
  })

  // Update profile XP + recalculate level
  const { data: profile } = await supabase
    .from('profiles')
    .select('current_xp, current_level')
    .eq('id', userData.user.id)
    .single()

  if (!profile) return { newLevel: null, leveledUp: false }

  const newXP = profile.current_xp + amount
  const newLevel = getLevelFromXP(newXP)
  const leveledUp = newLevel > profile.current_level

  await supabase.from('profiles').update({
    current_xp: newXP,
    current_level: newLevel,
    updated_at: new Date().toISOString()
  }).eq('id', userData.user.id)

  return { newLevel: leveledUp ? newLevel : null, leveledUp, newXP }
}
```

**Cập nhật `apps/web/app/actions/habits.ts`:**
- Import và gọi `awardXP(10, 'habits', 'Daily habit check-in')` trong `markDoneToday()`
- Gỡ bỏ hardcoded `redirect()` với query params (dùng React `useActionState` hoặc `useFormStatus` thay thế pattern redirect-redirect nặng)

---

## Phase 2 — Design System (Dark Neon RPG)

### 2.1 Tailwind Config

**`apps/web/tailwind.config.ts`** — thay hoàn toàn:

```typescript
import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    '../../packages/ui/src/**/*.{ts,tsx}'
  ],
  theme: {
    extend: {
      // Neon color palette
      colors: {
        background: '#0a0a0f',
        surface:    '#111118',
        surface2:   '#1a1a25',
        border:     '#2a2a3a',
        primary:     '#8b5cf6',   // violet-500 — XP purple
        primary2:    '#06b6d4',   // cyan-500 — accent
        accent:      '#f97316',   // orange-500 — streak fire
        success:     '#10b981',  // emerald-500
        warning:     '#eab308',  // yellow-500
        danger:      '#ef4444',  // red-500
        muted:       '#3a3a50',
        foreground:  '#f0f0ff',
        'fg-muted':  '#8888aa',
      },
      fontFamily: {
        sans:  ['Inter', 'system-ui', 'sans-serif'],
        mono:  ['JetBrains Mono', 'Fira Code', 'monospace'],
        display: ['Space Grotesk', 'Inter', 'sans-serif'],
      },
      // Neon glow utilities
      boxShadow: {
        'neon-primary': '0 0 20px rgba(139, 92, 246, 0.4)',
        'neon-accent':  '0 0 20px rgba(6, 182, 212, 0.4)',
        'neon-fire':    '0 0 15px rgba(249, 115, 22, 0.5)',
        'glow-sm':      '0 0 8px rgba(139, 92, 246, 0.3)',
      },
      animation: {
        'pulse-glow':   'pulseGlow 2s ease-in-out infinite',
        'slide-up':     'slideUp 0.3s ease-out',
        'fade-in':      'fadeIn 0.2s ease-out',
        'xp-bump':      'xpBump 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
        'level-up':     'levelUp 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)',
      },
      keyframes: {
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 10px rgba(139,92,246,0.3)' },
          '50%':      { boxShadow: '0 0 25px rgba(139,92,246,0.6)' },
        },
        slideUp: {
          from: { transform: 'translateY(8px)', opacity: '0' },
          to:   { transform: 'translateY(0)',   opacity: '1' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to:   { opacity: '1' },
        },
        xpBump: {
          '0%':   { transform: 'scale(1)' },
          '50%':  { transform: 'scale(1.15)' },
          '100%': { transform: 'scale(1)' },
        },
        levelUp: {
          '0%':   { transform: 'scale(0.8)', opacity: '0' },
          '60%':  { transform: 'scale(1.1)' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}
export default config
```

### 2.2 Global CSS

**`apps/web/app/globals.css`** — thay hoàn toàn:

```css
@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');

@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    color-scheme: dark;
  }
  body {
    @apply bg-background text-foreground font-sans antialiased;
    min-height: 100dvh;
  }
  /* Custom scrollbar neon style */
  ::-webkit-scrollbar { width: 6px; height: 6px; }
  ::-webkit-scrollbar-track { @apply bg-background; }
  ::-webkit-scrollbar-thumb { @apply bg-muted rounded-full; }
  ::-webkit-scrollbar-thumb:hover { @apply bg-primary/50; }
}

@layer components {
  .card-neon {
    @apply bg-surface border border-border rounded-xl;
    @apply transition-all duration-200;
  }
  .card-neon:hover {
    @apply border-primary/40;
    box-shadow: 0 0 12px rgba(139, 92, 246, 0.15);
  }
  .btn-primary {
    @apply bg-primary text-white font-medium px-4 py-2 rounded-lg
           transition-all duration-150 active:scale-95
           hover:shadow-neon-primary;
  }
  .btn-ghost {
    @apply text-fg-muted hover:text-foreground px-3 py-2 rounded-lg
           transition-colors duration-150;
  }
  .xp-bar-track {
    @apply bg-muted rounded-full overflow-hidden h-2;
  }
  .xp-bar-fill {
    @apply bg-gradient-to-r from-primary to-primary2 h-full rounded-full
           transition-all duration-500 ease-out;
    box-shadow: 0 0 8px rgba(139, 92, 246, 0.6);
  }
}

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

### 2.3 Shared UI Components (shadcn/ui base)

**Migrate từ `components/ui/` vào `packages/ui/src/`:**

```
packages/ui/src/
├── button.tsx        (variant: default, ghost, outline, destructive, ghost)
├── card.tsx          (Card, CardHeader, CardContent, CardTitle)
├── input.tsx         (styled input)
├── label.tsx         (Label)
├── badge.tsx         (Badge variants)
├── progress.tsx      (XP bar, progress bars)
├── dialog.tsx        (Modal — Radix Dialog)
├── tooltip.tsx       (Radix Tooltip)
├── sonner.tsx        (toast notifications — from sonner lib)
└── index.ts         (export all)
```

**Nguyên tắc shadcn/ui:**
- Mỗi component là một file độc lập, tự quản lý imports
- Dùng `cn()` (clsx + tailwind-merge) cho class merging
- Components dùng `forwardRef` hoặc stable component patterns
- Styles kế thừa từ Tailwind config đã định nghĩa ở Phase 2.1

---

## Phase 3 — Gamification Engine

### 3.1 XP Bar Component

**`apps/web/components/gamification/xp-bar.tsx`**

```
Client Component
Props: { currentXP, currentLevel, size?: 'sm' | 'md' | 'lg' }

Hiển thị:
- Icon level (Lv.{n})
- Level title theo locale
- Progress bar với gradient + glow
- "X / Y XP to next level" label
- Khi XP tăng: animation 'xp-bump' trên thanh tiến trình
- Khi level up: emit event để trigger LevelUpModal
```

**Level titles (vi/en):**
```typescript
const LEVEL_TITLES = {
  vi: ['Tân binh', 'Người tập sự', 'Chiến binh', 'Kỵ sĩ', 'Cao thủ',
       'Master', 'Grandmaster', 'Legend', 'Mythic', 'Titan',
       ...], // đủ 20 levels
  en: ['Rookie', 'Apprentice', 'Warrior', 'Knight', 'Expert',
       'Master', 'Grandmaster', 'Legend', 'Mythic', 'Titan',
       ...]
}
```

### 3.2 Level-Up Celebration Modal

**`apps/web/components/gamification/level-up-modal.tsx`**

```
Client Component (renders via <dialog> or Radix Dialog)
Props: { level, onClose }

- Backdrop blur
- "LEVEL UP!" heading với animation
- Level number lớn với glow effect
- Level title mới
- Confetti-like CSS particles (simple CSS, không cần library nặng)
- "Continue" button
- Auto-dismiss sau 5s
- Animation: 'level-up' keyframe
- Prevent scroll body while open
```

### 3.3 XP Context Provider

**`apps/web/components/gamification/xp-provider.tsx`**

```typescript
'use client'
// React Context: XPContext
// Giá trị: { xp, level, leveledUp, newLevel, awardXP(), dismissLevelUp() }
// Dùng trong AppShell layout
// awardXP() gọi server action awardXP(), cập nhật state
// Khi leveledUp = true → hiện LevelUpModal
```

---

## Phase 4 — Pomodoro App (RPG Focus Timer)

### 4.1 Pomodoro Timer Engine

**`apps/web/components/pomodoro/timer-engine.tsx`** — Client Component

```
State machine: IDLE → FOCUS → SHORT_BREAK → FOCUS → ... → LONG_BREAK → IDLE

Props: {
  focusDuration: number      (default 25)
  shortBreak:    number      (default 5)
  longBreak:     number      (default 15)
  sessionsBeforeLong: number (default 4)
  onSessionComplete: (duration: number) => void
  onSessionCancel: () => void
}

Features:
- Countdown display: MM:SS với font-mono, font size lớn
- Visual: circular or bar progress indicator
- State badge: "FOCUS" | "SHORT BREAK" | "LONG BREAK"
- Session counter: "Session 2 of 4"
- Controls: Start / Pause / Skip / Cancel
- Keyboard shortcuts: Space (start/pause), Esc (cancel)
- Tab title cập nhật: "25:00 — Focus | JL-Tools" → countdown realtime
- Audio cue khi hết timer (Web Audio API, không cần file audio)
- Auto-advance: sau FOCUS → break, sau break → FOCUS
```

### 4.2 Pomodoro Page

**`apps/web/app/(app)/pomodoro/page.tsx`** — Server Component

```
Layout: Full màn hình, dark background
Fetch: today's sessions từ pomodoro_sessions
Display:
- Timer Engine (center, large)
- Today's stats sidebar/bottom:
  * Sessions completed: N
  * Total focus time: Xh Ym
  * XP earned today: +Z XP
- Session label input (optional, pre-session)
```

### 4.3 Focus Mode Overlay

**`apps/web/components/pomodoro/focus-mode.tsx`** — Client Component

```
Trigger: khi bấm "Start" trong Timer
Overlay: full-screen với:
- Timer ở giữa (rất lớn)
- Current session label
- "Press Space to pause • Esc to cancel"
- Sidebar hoàn toàn ẩn
- Exit: bấm Esc hoặc hoàn thành session
Animation: fade-in khi enter, fade-out khi exit
```

### 4.4 Pomodoro Settings

**`apps/web/app/(app)/pomodoro/settings/page.tsx`** — Server Component

```
Form để cậu nhật user_settings:
- Focus duration (slider/input: 15-60 phút)
- Short break (3-15 phút)
- Long break (10-30 phút)
- Sessions before long break (2-8)
Lưu vào user_settings table
```

### 4.5 Pomodoro Server Actions

**`apps/web/app/actions/pomodoro.ts`**

```typescript
'use server'

export async function savePomodoroSession(formData: FormData) {
  // Validate, insert vào pomodoro_sessions
  // Tính XP: completed = 50 XP base
  // awardXP(50, 'pomodoro', `Pomodoro: ${label}`)
  // Return: { success, xpAwarded, newLevel }
}
```

---

## Phase 5 — Habit Tracker Nâng cao

### 5.1 Habit CRUD — Frequency Support

**Update `apps/web/components/habits/habit-dialog.tsx`:**

```
Form fields:
- Name (text input)
- Icon picker (grid of Lucide icons, 20 icons)
- Color picker (preset swatches từ Tailwind palette)
- Frequency: radio group — Daily | Weekly | Custom
  * Weekly: chọn ngày trong tuần (Mon-Sun checkboxes)
  * Custom: chọn các ngày cụ thể
- Goal days (number input — chỉ hiện khi frequency = daily)
```

**Update `apps/web/app/actions/habits.ts`:**
- `createHabit` → thêm `frequency`, `custom_days`, `icon`, `color`
- `updateHabit` → tương tự
- `markDoneToday` → gọi `awardXP(10, 'habits', habit.name)`

### 5.2 Habit Dashboard — Home Page

**`apps/web/app/(app)/page.tsx`** — thay hoàn toàn

```
Server Component — fetch habits + today's logs + XP data

Layout:
┌──────────────────────────────────────────────────────┐
│  Sidebar (desktop) / Bottom Nav (mobile)             │
│  ┌────────────────────────────────────────────────┐  │
│  │  Header: greeting + date + quick stats       │  │
│  ├────────────────────────────────────────────────┤  │
│  │  Pomodoro Quick Start card                    │  │
│  │  (Sessions today + "Start Focus" button)      │  │
│  ├────────────────────────────────────────────────┤  │
│  │  Today's Habits section                       │  │
│  │  - Habit cards: icon, name, streak fire,      │  │
│  │    check-in button (satisfying animation)     │  │
│  │  - "Add Habit" floating button               │  │
│  ├────────────────────────────────────────────────┤  │
│  │  Weekly Progress bar (% habits done this week)│  │
│  └────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────┘

Habit Card:
- Lucide icon (không emoji) với color tint
- Name
- Streak: Flame icon + count (dùng Lucide, không emoji)
- Tap → toggle check-in (with animation)
- Long press / click → navigate to habit detail
```

### 5.3 Habit Detail — Enhanced

**`apps/web/app/(app)/habits/[id]/page.tsx`** — cập nhật

```
Giữ nguyên calendar + stats logic
Thêm:
- Habit card với icon + color (từ habit record)
- Streak với Lucide Flame icon (thay emoji)
- Quick stats: today's completion, weekly rate
- Edit button → mở dialog với frequency config
```

### 5.4 Streak Fire — Lucide Icon

```typescript
import { Flame } from 'lucide-react'
// Thay thế '🔥' bằng <Flame className="inline text-accent w-4 h-4" />
```

---

## Phase 6 — Shared Layout + Navigation

### 6.1 App Shell Layout

**`apps/web/app/(app)/layout.tsx`** — thay hoàn toàn

```
Server Component
Chứa:
- <Sidebar> (desktop only, ≥ 768px)
- <BottomNav> (mobile only, < 768px)
- <XPProvider> context
- <LevelUpModal>
- Main content area
- Fetch user profile + XP từ Supabase
```

### 6.2 Sidebar (Desktop)

**`apps/web/components/layout/sidebar.tsx`**

```
Fixed left sidebar, width: 240px
Content:
- Logo: "JL-Tools" với icon
- XP Bar (compact)
- Level badge: "Lv.{n} {title}"
- Nav items:
  * Dashboard (Home icon)
  * Pomodoro (Timer icon)
  * Habits (CheckCircle icon)
  * Settings (Cog icon)
- User section: avatar, name, sign out
- Active state: background highlight + left border accent

Responsive: hidden on mobile
```

### 6.3 Bottom Navigation (Mobile)

**`apps/web/components/layout/bottom-nav.tsx`**

```
Fixed bottom, full width, safe-area-inset-bottom
4 items max (theo UI guideline):
1. Dashboard (LayoutDashboard icon)
2. Pomodoro (Timer icon)
3. Habits (CheckCircle2 icon)
4. Settings (Settings icon)

Active: icon + label highlighted
Height: 64px
Background: surface with top border
```

### 6.4 i18n Setup

**Dùng `next-intl`**

```
apps/web/
├── i18n/
│   ├── request.ts     (Next.js App Router integration)
│   └── messages/
│       ├── vi.json
│       └── en.json
├── middleware.ts      (detect locale)
└── app/[locale]/
    ├── layout.tsx
    ├── page.tsx        (→ habits dashboard)
    ├── pomodoro/
    │   ├── page.tsx
    │   └── settings/page.tsx
    ├── habits/
    │   ├── page.tsx
    │   ├── new/page.tsx
    │   └── [id]/
    │       ├── page.tsx
    │       └── edit/page.tsx
    └── auth/
        ├── login/page.tsx
        └── signup/page.tsx
```

**Tách auth routes** ra khỏi `(app)` group để không có sidebar (vì chưa login).

**`<locale>` param:** `vi` (default), `en`. Detect từ `Accept-Language` header hoặc user profile `locale` field.

**Translatable strings:** Tất cả UI text trong cả 2 files `vi.json` và `en.json`. Component dùng `useTranslations()` hook.

---

## Phase 7 — Polish + Final QA

### 7.1 Settings Page

**`apps/web/app/[locale]/(app)/settings/page.tsx`**

```
Sections:
1. Profile: display name (editable), avatar URL
2. Language: toggle vi/en → update profiles.locale
3. Pomodoro defaults
4. About: version, credits
```

### 7.2 Auth Pages — UI Refresh

**`apps/web/app/[locale]/auth/login/page.tsx`**
**`apps/web/app/[locale]/auth/signup/page.tsx`**

```
Dark theme matching the app
Centered card
Google OAuth button (prioritized)
Email + password fallback
Error states với toast
```

### 7.3 Root Layout + Error Handling

**`apps/web/app/[locale]/layout.tsx`**

```typescript
export default async function LocaleLayout({ children, params }) {
  const { locale } = await params
  return (
    <html lang={locale}>
      <body>
        <NextIntlClientProvider>
          {children}
        </NextIntlClientProvider>
        <Toaster richColors position="top-center" />
      </body>
    </html>
  )
}
```

**`apps/web/app/error.tsx`** — Client Component, dark styled
**`apps/web/app/global-error.tsx`** — Client Component with `<html>/<body>`

### 7.4 Empty States & Loading States

| Screen | Empty State |
|---|---|
| Habits (no habits) | Illustration + "Create your first habit" CTA |
| Pomodoro (no sessions) | "Ready to focus? Start your first session" |
| Dashboard | Graceful degradation if no data |

**Skeleton loading** cho tất cả data-fetching sections (dùng `animate-pulse` Tailwind class).

### 7.5 Performance & Accessibility QA

- [ ] Tất cả images dùng `next/image`
- [ ] Icon-only buttons có `aria-label`
- [ ] Color contrast ≥ 4.5:1 cho text
- [ ] Touch targets ≥ 44×44px
- [ ] Keyboard navigation hoạt động end-to-end
- [ ] `prefers-reduced-motion` respected (CSS đã có, verify)
- [ ] `pnpm build` thành công không warning
- [ ] `pnpm lint` thành công
- [ ] TypeScript strict mode: không có `any`

---

## Thứ tự thực hiện chi tiết (Step-by-step)

```
Week 1 — Phase 1 + 2
  □ Git checkout main
  □ Setup Turborepo structure
  □ Migrate to packages/ui + packages/shared
  □ Update Tailwind config + globals.css
  □ Migrate existing UI components sang dark theme

Week 2 — Phase 1 (còn lại) + 3
  □ Run Supabase migration mới
  □ Implement XP/Level server actions
  □ Build XP Bar component
  □ Build LevelUpModal
  □ Build XPProvider context

Week 3 — Phase 4 (Pomodoro core)
  □ Timer Engine (countdown state machine)
  □ Focus Mode overlay
  □ Pomodoro page
  □ Pomodoro settings
  □ Save session + award XP

Week 4 — Phase 5 (Habits enhanced)
  □ Update HabitDialog với icon/color/frequency
  □ Update habits server actions
  □ Rewrite dashboard (home page)
  □ Add Lucide icons thay emoji
  □ Add streak fire animation

Week 5 — Phase 6 (Layout + i18n)
  □ Setup next-intl
  □ Create [locale] route structure
  □ Build Sidebar component
  □ Build BottomNav component
  □ App shell layout
  □ Refresh auth pages

Week 6 — Phase 7 + Polish
  □ Settings page
  □ Empty states
  □ Skeleton loaders
  □ Error boundaries
  □ Accessibility audit
  □ Final build + type check
  □ Deploy to Vercel
```

---

## Tech Stack — Phiên bản cuối cùng

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| Monorepo | Turborepo + pnpm |
| Database | Supabase (Postgres + Auth + RLS) |
| UI | shadcn/ui + Radix primitives + Tailwind CSS |
| Icons | Lucide React (SVG, no emoji) |
| i18n | next-intl |
| Toasts | Sonner |
| Animations | CSS keyframes + Tailwind animate |
| Styling | Tailwind CSS với custom design tokens |

## Công việc Out-of-scope (không làm trong MVP này)

- ❌ Badge/Achievement system (Phase 3+)
- ❌ Sound effects / ambient sounds (Phase 4+)
- ❌ Weekly/monthly insight reports (Phase 3-4+)
- ❌ Social features / leaderboard (Growth phase)
- ❌ PWA / offline support
- ❌ Light theme toggle
- ❌ Custom Pomodoro sounds

---

*Lập trình viên: Claude Opus 4.6 | Ngày: 2026-04-02*
