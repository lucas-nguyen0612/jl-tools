# JL-Tools — Project Brief

**Version:** 1.3 · **Date:** 2026-04-24 · **Status:** Sprint 4 — Features Complete, Production Deploy Pending

---

## 1. Vision

JL-Tools là nền tảng web tập hợp các công cụ học tập và làm việc hiệu quả, hướng đến những người làm việc nhiều trên máy tính — sinh viên, nhân viên văn phòng, freelancer và content creator.

Thay vì dùng nhiều app phân tán, JL-Tools quy tụ mọi thứ vào một nền tảng duy nhất với **hệ thống gamification RPG xuyên suốt** — biến kỷ luật thành trải nghiệm thú vị.

> "Mọi giờ học, mọi thói quen, mọi lần ôn bài đều đóng góp vào sự tiến bộ của nhân vật của bạn."

---

## 2. Tech Stack

| Layer | Technology | Lý do |
|---|---|---|
| Frontend + Backend | Next.js 16 (App Router, Turbopack) + TypeScript | SSR, Server Actions, single codebase |
| Database | Supabase (PostgreSQL) | Auth tích hợp, RLS, Realtime, local dev |
| Styling | **Tailwind CSS** | Utility-first, tích hợp hoàn hảo với CSS variables JL tokens |
| UI Components | **shadcn/ui** | Copy-paste components, dùng CSS variables → khớp design system sẵn có |
| State | Zustand (client) + TanStack Query (server) | Phân tách rõ UI state vs server state |
| Animation | Framer Motion | XP popups, level-up modal, transitions |
| Deploy | Vercel | Preview deployments, Edge Network |
| Icons | Lucide React | Nhất quán với design gốc (đã dùng trong screens/) |
| Date | date-fns + date-fns-tz | Timezone-aware streak calculation |
| Forms | react-hook-form + Zod | Validation type-safe |

---

## 3. MVP Scope

### 3 Core Tools

| Tool | Mô tả | XP/action |
|---|---|---|
| **Pomodoro** | Timer tập trung 25/5/15 phút, task list, soundscape, focus mode | +10 XP/session |
| **Habit Tracker** | Daily check-in, weekly grid, 6-month heatmap, streak | +5 XP/check-in |
| **Flashcard** | SM-2 spaced repetition, flip & rate (Again/Hard/Good/Easy) | +0/1/2/3 XP |

### RPG System (xuyên suốt)
- **Unified XP pool** từ tất cả 3 tools
- **50-level system** với visual avatar evolution (Common → Uncommon → Rare → Legendary → Mythic)
- **20 Badges** từ Common đến Mythic
- **Daily Quests** (3–5 quests/ngày, reset midnight)
- **Character Sheet** với 4 stats: Focus, Discipline, Knowledge, Endurance

### XP Economy

| Action | XP | Ghi chú |
|---|---|---|
| Pomodoro session hoàn thành | +10 | Base |
| Clean session (không pause >10s) | +5 | Bonus |
| Habit check-in | +5 | Per habit |
| All habits done (cùng ngày) | +10 | All-done bonus |
| Streak bonus daily | +5 | Nếu có ≥1 activity |
| Streak milestone 7 ngày | +50 | One-time per milestone |
| Streak milestone 14 ngày | +100 | One-time per milestone |
| Streak milestone 30 ngày | +200 | One-time per milestone |
| Flashcard Again / Hard / Good / Easy | +0 / +1 / +2 / +3 | Per card |
| Daily quest: 2 Pomodoro sessions | +30 | Quest reward |
| Daily quest: 50 flashcards | +40 | Quest reward |
| Daily quest: toàn bộ habit list | +25 | Quest reward |

**Target:** User active (2h focus + 4 habits + 30 cards/ngày) ≈ 130–180 XP/ngày.

### Level Thresholds (key milestones)

| Level | XP cumulative | Unlock |
|---|---|---|
| 5 | 1,500 XP | Dark mode theme |
| 10 | 5,500 XP | Café soundscape |
| 15 | 12,000 XP | Deep Forest BGM + **Rare tier avatar** |
| 20 | 21,000 XP | Custom accent color picker |
| 30 | 46,500 XP | **Legendary tier avatar** + crown |
| 50 | 127,500 XP | **Mythic tier** — prestige badge |

---

## 4. User Personas

### Persona A — Minh (Primary)
- **Profile:** Sinh viên 20–24, học kỹ thuật/kinh tế, MacBook + iPhone
- **Pain:** Mất tập trung, dùng quá nhiều app rời rạc, không thấy tiến bộ
- **Goal:** Ôn chứng chỉ, xây dựng thói quen tự học bền vững
- **Hook RPG:** Streak, level-up, badges — cực kỳ nhạy cảm với "phá streak"

### Persona B — Linh (Secondary)
- **Profile:** Freelancer/content creator 26–32, làm việc từ nhà
- **Pain:** Thiếu kỷ luật không có sếp giám sát, burnout vì không có break rõ ràng
- **Goal:** Deep work structure, track billable hours, học kỹ năng mới đều đặn
- **Hook RPG:** Visual progress (heatmap, chart) hơn game mechanics thuần túy

### Persona C — Huy (Emerging)
- **Profile:** Học sinh THPT 16–18, ôn thi đại học, Android là thiết bị chính
- **Pain:** TikTok/YouTube cạnh tranh thời gian học, khối lượng kiến thức lớn
- **Goal:** Ôn từ vựng, chặn distraction, chứng minh với bố mẹ mình học thật
- **Hook RPG:** Phản ứng mạnh nhất với game elements, mobile-first bắt buộc

---

## 5. Database Architecture

**17 tables** tổ chức theo domain:

```
Auth & Profile
  profiles              — extends auth.users, preferences, character class
  character_stats       — XP, level, 4 stats, streak counters

Pomodoro
  pomodoro_settings     — work/break durations, soundscape, blocker
  pomodoro_tasks        — todo list với pomodoro estimate
  pomodoro_sessions     — completed sessions (immutable log)

Habits
  habits                — habit definitions với streak state
  habit_completions     — daily check-ins (timezone-aware DATE)
  habit_notes           — daily journal entry

Flashcard
  flashcard_decks       — deck metadata với denormalised counts
  flashcard_cards       — cards với đầy đủ SM-2 state (ease_factor, interval, due_at)
  flashcard_reviews     — immutable review history

Gamification
  xp_transactions       — append-only XP ledger (audit + analytics)
  badges                — badge catalogue
  user_badges           — earned badges
  quests                — quest definitions
  user_quests           — daily/weekly quest progress
  unlockables           — soundscapes, themes, frames
  user_unlockables      — unlocked items per user
  level_thresholds      — XP required per level (1–50)
```

**Key PostgreSQL functions:**
- `award_xp()` — atomic với `FOR UPDATE` lock, bypass RLS via `SECURITY DEFINER`
- `apply_sm2()` — SM-2 algorithm server-side, log review history, award XP
- `update_streak()` — timezone-aware, triggered sau INSERT vào `habit_completions`
- `check_and_award_badges()` — auto-check và award badges sau mỗi XP event
- `on_auth_user_created()` — auto-init profile/stats/settings khi user signup

---

## 6. Architecture Decisions

### Server vs Client Components
- **Server Component làm default** — chỉ `'use client'` khi cần interactivity
- Dashboard, Character, Deck list → Server Components (SEO + fast initial load)
- Pomodoro timer, Habit check-in, Flashcard review → Client Components
- Pattern: Server fetch data → pass as props → Client Island cho interactive parts

### XP Engine: Server-Only
- Mọi XP award đi qua Postgres function với `FOR UPDATE` lock
- Client không thể INSERT vào `xp_transactions` trực tiếp (RLS block)
- Chống cheating, tránh race condition khi 2 actions cùng lúc

### Pomodoro Timer: Pure Client-Side
- Dùng `requestAnimationFrame` + `Date.now()` timestamp để chính xác khi tab bị throttle
- State persist vào `localStorage` qua Zustand `persist` middleware
- Chỉ POST lên server khi session **hoàn thành** (không sync mỗi giây)

### Theme: Flash-Free
- Dark mode + accent hue đọc từ cookie trên **server** → inject vào `<html>` tag
- Không có flash of wrong theme khi load
- Accent thay đổi bằng cách set 1 CSS variable duy nhất: `--jl-hue`

### Realtime: Có Chọn Lọc
- Enable Supabase Realtime chỉ cho 4 tables: `character_stats`, `xp_transactions`, `user_badges`, `user_quests`
- XP bar update cross-device/cross-tab qua Realtime subscription
- Không overuse Realtime cho high-volume tables (sessions, reviews)

### Auth: Email OTP Confirmation
- `enable_confirmations = true` — user phải xác nhận email trước khi sign in
- Login với email chưa confirm → tự động gửi OTP 6 số → Dialog nhập OTP
- OTP verify qua `supabase.auth.verifyOtp({ type: 'signup' })`
- Resend cooldown 60 giây để tránh spam
- `PasswordInput` component tái sử dụng với eye toggle (Eye/EyeOff icon)

### Design Tokens: Single Source of Truth
- **`claude-design/styles/tokens.css`** là nguồn chính thức cho mọi token + utility class
- `src/app/globals.css` port verbatim từ file trên — khi đổi thiết kế, sửa `tokens.css` trước, port lại
- Tokens: 35+ CSS variables (palette warm neutral, accent hue rotatable qua `--jl-hue`, semantic, rarity, radii, shadow, fonts)
- Utility classes: `.jl-card`, `.jl-chip`, `.jl-btn` + variants, `.jl-display`, `.jl-mono`, `.jl-tnum`, `.jl-scroll`
- **Legacy aliases:** `--jl-bg-elevated` và `--jl-border` map về `--jl-bg-raised` / `--jl-line` để giữ tương thích với các components dùng tên biến cũ (CardFlip, DeckStats, HabitCard, …)
- Dark mode: toggle `.jl-dark` class trên root, 10 vars override qua cookie persist
- `font-feature-settings: "ss01", "cv11"` trên body enable alt glyphs của Geist

---

## 7. Project Structure

```
src/
├── app/
│   ├── (auth)/            # login, signup, onboarding
│   ├── (app)/             # dashboard, pomodoro, habits, flashcards, character
│   │   └── layout.tsx     # Shared SideNav + auth check
│   └── api/               # pomodoro, habits, flashcards, xp, user
├── components/
│   ├── rpg/               # Avatar, XPBar, LevelBadge, StatPill, Heatmap...
│   ├── layout/            # SideNav, TopBar, AppShell
│   └── ui/                # shadcn/ui primitives + PasswordInput
├── lib/
│   ├── supabase/          # client.ts, server.ts, middleware.ts
│   ├── xp/                # engine.ts, constants.ts
│   ├── sm2/               # algorithm.ts
│   └── actions/           # Server Actions per feature
├── store/                 # Zustand: userStore, pomodoroStore, flashcardStore
├── hooks/                 # useTimer, useXPRealtime, useHabits, useFlashcards
└── types/                 # database.ts (generated), rpg.ts, tools.ts

supabase/
└── migrations/
    ├── 001_initial_schema.sql
    ├── 002_rls_policies.sql
    ├── 003_functions_triggers.sql
    └── 004_seed_data.sql
```

---

## 8. Out of Scope (MVP)

- Browser extension cho site blocker thật (cần native extension)
- Mobile app (React Native / PWA)
- Guild / social leaderboard
- Push notifications (web push)
- AI-powered insights
- Import/export Anki
- Premium monetization

→ Tất cả là **Phase 2** sau khi MVP validated.

---

## 9. Key Numbers (hardcode nhất quán)

| Constant | Value |
|---|---|
| Pomodoro XP per session | 10 |
| Habit XP per check-in | 5 |
| Flashcard XP: Again/Hard/Good/Easy | 0 / 1 / 2 / 3 |
| Avatar tier breakpoints (level) | 1, 5, 15, 30, 50 |
| SM-2 default ease factor | 2.5 |
| SM-2 minimum ease factor | 1.3 |
| Heatmap duration | 26 weeks |
| Max habits (MVP) | 10 |
| Level 14 → 15 XP required | 1,500 XP |
| Level 50 total XP | 127,500 XP |
| OTP resend cooldown | 60 seconds |
| Retroactive check-in window | 6 hours after midnight |
| Streak milestone XP | 7d: +50, 14d: +100, 30d: +200 |
