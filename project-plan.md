# JL-Tools — Project Plan (MVP)

> **Stack:** Next.js · Supabase (Local) · Tailwind CSS · shadcn/ui · i18n (vi/en) · Turborepo Monorepo
> **Supabase Mode:** Supabase Local (Docker)

---

## Phase 1 — Project Foundation

_Thiết lập repo, monorepo structure, CI/CD base, Supabase local_

- [x] **1.1** Khởi tạo Turborepo monorepo (apps/web, packages/shared)
- [x] **1.2** Setup Next.js 14 app trong apps/web (App Router, TypeScript strict)
- [x] **1.3** Cấu hình Tailwind CSS + shadcn/ui
- [x] **1.4** Setup Supabase CLI + Docker compose (local)
- [x] **1.5** Chạy Supabase local, verify connection
- [x] **1.6** Init Supabase project (`supabase init`) với TypeScript types export
- [x] **1.7** Cấu hình environment variables (.env.local, .env.example)
- [x] **1.8** Setup ESLint + Prettier + Husky (pre-commit hook cơ bản)
- [x] **1.9** Tạo shared `packages` base: types, constants, utils
- [x] **1.10** Commit base structure

---

## Phase 2 — Platform Foundation

_Auth, Layout, i18n, Theme, Responsive_

- [ ] **2.1** Thiết kế database schema với ERD (Supabase Postgres):
  - [ ] `profiles` (id, email, display_name, avatar_url, locale, created_at)
  - [ ] `xp_transactions` (id, user_id, amount, source, source_id, created_at)
- [ ] **2.2** Tạo Supabase migration (`supabase migration new`) cho schema trên, apply bằng `supabase db reset`
- [ ] **2.3** Generate Supabase TypeScript client types
- [ ] **2.4** Setup Supabase Auth: Email/Password + Google OAuth (providers enabled)
- [ ] **2.5** Tạo Auth pages: Login, Register, Forgot Password
- [ ] **2.6** Tạo Auth providers (React Context / Supabase SSR helpers)
- [ ] **2.7** Implement RLS policies: users chỉ đọc/ghi own data
- [ ] **2.8** Tạo Layout shell: Sidebar (desktop) + Bottom Nav (mobile)
- [ ] **2.9** Setup i18n với next-intl hoặc react-i18next (vi/en)
- [ ] **2.10** Tạo i18n translation files: `locales/vi.json`, `locales/en.json`
- [ ] **2.11** Setup Theme System: Light/Dark mode toggle, class-based Tailwind
- [ ] **2.12** Persist theme + locale preference trong profile
- [ ] **2.13** Implement responsive breakpoints (mobile-first, 375px+)
- [ ] **2.14** Tạo User Profile page: display name, avatar, locale/theme settings
- [ ] **2.15** Setup middleware: protect routes, redirect unauthenticated users

---

## Phase 3 — Gamification System

_XP, Level, Level-up Detection_

- [ ] **3.1** Mở rộng schema: thêm `profiles.current_xp`, `profiles.current_level`, `profiles.total_xp_earned`
- [ ] **3.2** Định nghĩa Level thresholds (20 levels) trong `constants/levels.ts` — mỗi level có title vi/en (VD: "Tân binh" / "Rookie", "Chiến binh kỷ luật" / "Discipline Warrior")
- [ ] **3.3** Tạo utility function tính XP → Level và Level → next threshold
- [ ] **3.4** Tạo `grantXP()` server action / RPC function
- [ ] **3.5** Tạo XP Transaction table: ghi nhận mọi XP source
- [ ] **3.6** Apply RLS policies cho `xp_transactions`
- [ ] **3.7** Tạo Unified XP Bar component (sidebar, animate on XP gain)
- [ ] **3.8** Tạo Level Badge / Level Title component
- [ ] **3.9** Implement Level-up detection logic (client-side)
- [ ] **3.10** Tạo Level-up Celebration Modal (simple animation)
- [ ] **3.11** Tạo XP Sources constants:
  - Pomodoro session completed: +50 XP
  - Habit check-in: +20 XP
  - Streak milestone bonuses: 7-day streak +100 XP, 14-day +200 XP, 30-day +500 XP
- [ ] **3.12** Implement XP abuse prevention cơ bản:
  - Max XP cap/ngày (VD: 500 XP)
  - Validate session duration server-side (không grant XP nếu duration < focus setting)
  - Cooldown giữa các Pomodoro session (VD: không grant XP nếu 2 session completed < 5 phút cách nhau)
- [ ] **3.12** Viết unit tests cho XP/Level utility functions
- [ ] **3.13** Viết unit tests cho XP abuse prevention logic
- [ ] **3.14** Commit Phase 3

---

## Phase 4 — Pomodoro App (RPG Focus Timer)

_Timer engine, Focus Mode, Session tracking, Labels, Stats_

- [ ] **4.1** Thiết kế schema `pomodoro.sessions`:
  - [ ] (id, user_id, label, duration_minutes, status, started_at, completed_at, xp_earned)
- [ ] **4.2** Apply schema + RLS policies + indexes (`user_id`, `status`, `started_at`) lên Supabase local
- [ ] **4.3** Tạo Timer engine (useReducer / custom hook `usePomodoroTimer`)
- [ ] **4.4** Tạo Timer UI: circular/linear countdown, time display
- [ ] **4.5** Tạo Timer Controls: Start, Pause, Resume, Skip, Cancel
- [ ] **4.6** Pomodoro State Machine: focus → short break → focus → ... → long break
- [ ] **4.7** Pomodoro Settings: focus duration, short break, long break, sessions before long break
- [ ] **4.8** Persist Pomodoro Settings trong `profiles.pomodoro_settings`
- [ ] **4.9** Tạo Focus Mode UI: fullscreen immersive, hide sidebar, show only timer + session count + XP preview (XP sẽ nhận được khi hoàn thành)
- [ ] **4.10** Implement Session completion → call `grantXP()` → save to DB
- [ ] **4.11** Session Labels: tạo bảng `pomodoro.session_labels` (id, user_id, name, color) để reuse labels; hoặc dùng text field nếu đơn giản hơn cho MVP
- [ ] **4.12** Session History page: list past sessions, filter by date/label
- [ ] **4.13** Daily Stats widget: sessions hôm nay, total focus minutes
- [ ] **4.14** Integrate XP Bar + Level display vào Pomodoro page
- [ ] **4.15** Auto-trigger level-up modal khi session completed
- [ ] **4.16** Viết unit tests cho Timer engine
- [ ] **4.17** Commit Phase 4

---

## Phase 5 — Habit Tracker

_Habit CRUD, Check-in, Streaks, Weekly Progress_

- [ ] **5.1** Thiết kế schema `habits`:
  - [ ] (id, user_id, name, icon, color, frequency_type, frequency_days, created_at, archived_at)
- [ ] **5.2** Thiết kế schema `habit_check_ins`:
  - [ ] (id, habit_id, user_id, checked_at, xp_earned)
- [ ] **5.3** Apply schemas + RLS policies + indexes (`user_id`, `habit_id`, `checked_at`) lên Supabase local
- [ ] **5.4** Tạo Habit CRUD page: create/edit/delete/archive habit
- [ ] **5.5** Frequency config: daily, weekly, custom (chọn ngày cụ thể)
- [ ] **5.6** Habit Icon picker + Color picker components
- [ ] **5.7** Daily Check-in page: list habits for today, tap to check-in
- [ ] **5.8** Streak calculation logic (useMemo):
  - [ ] current streak, longest streak, missed days
- [ ] **5.9** Streak UI: fire emoji + count + streak progress ring/bar
- [ ] **5.10** Implement check-in → call `grantXP()` → save to DB
- [ ] **5.11** Weekly Progress widget: % habits completed this week
- [ ] **5.12** Habit Insights: streak history chart (simple bar/line)
- [ ] **5.13** Integrate XP Bar vào Habit Tracker pages
- [ ] **5.14** Auto-trigger level-up modal khi check-in
- [ ] **5.15** Archived habits UI: page xem danh sách habits đã archive, cho phép restore hoặc xóa vĩnh viễn
- [ ] **5.16** Viết unit tests cho Streak calculation
- [ ] **5.17** Commit Phase 5

---

## Phase 6 — Cross-Feature Integration & Polish

_Dashboard, Sidebar, Navigation, Onboarding, UX Polish_

- [ ] **6.1** Dashboard page: overview stats (Pomodoro hôm nay + Habits hôm nay + XP)
- [ ] **6.2** Complete Sidebar: logo, avatar, XP bar, Level, nav items, Quick Settings widget (theme toggle + locale toggle)
- [ ] **6.3** Bottom Navigation (mobile): tabs cho Pomodoro, Habits, Dashboard, Profile
- [ ] **6.4** Global Onboarding flow: sau signup → chọn avatar (từ predefined avatar set) → giới thiệu 2 tools → xong
- [ ] **6.5** Empty states cho mọi page (chưa có data)
- [ ] **6.6** Loading states + skeleton components
- [ ] **6.7** Error boundaries + error UI
- [ ] **6.8** Toast notifications (success/error feedback)
- [ ] **6.9** Page transitions + micro-animations (Framer Motion hoặc CSS)
- [ ] **6.10** Global keyboard shortcuts (e.g. Space = start/pause Pomodoro)
- [ ] **6.11** Accessibility check: ARIA labels, focus management, screen reader
- [ ] **6.12** SEO: metadata, Open Graph tags, sitemap
- [ ] **6.13** Favicon + App icons
- [ ] **6.14** Commit Phase 6

---

## Phase 7 — Integration & E2E Testing

_Full flow testing, edge cases, performance_

- [ ] **7.1** E2E test: User flow — signup → complete Pomodoro → check-in habit → earn XP → level up
- [ ] **7.2** E2E test: Habit streak — check-in 3 ngày liên tiếp → verify streak increments
- [ ] **7.3** E2E test: Level up flow — earn enough XP → verify level-up modal appears
- [ ] **7.4** E2E test: Auth flows — login, logout, Google OAuth, protected routes
- [ ] **7.5** E2E test: Responsive — verify layout trên 375px, 768px, 1280px
- [ ] **7.6** E2E test: Theme toggle — light/dark switching, persistent preference
- [ ] **7.7** E2E test: i18n — toggle vi/en, verify all strings translated
- [ ] **7.8** Edge case: Pomodoro bị cancel giữa chừng → không grant XP
- [ ] **7.9** Edge case: Miss check-in → streak resets, verify UI
- [ ] **7.10** Performance: Lighthouse audit (target LCP < 2.5s)
- [ ] **7.11** Test RLS policies: verify user A không đọc được user B data
- [ ] **7.12** Commit Phase 7

---

## Phase 8 — Deployment & DevOps

_Vercel, Supabase production, environment setup_

- [ ] **8.1** Setup Supabase project (production) trên supabase.com
- [ ] **8.2** Export schema từ local → apply lên production (`supabase db push --project-ref`)
- [ ] **8.3** Setup Auth providers: configure Google OAuth trên Supabase + Google Cloud
- [ ] **8.4** Configure Supabase production environment variables
- [ ] **8.5** Deploy apps/web lên Vercel (hoặc tuỳ chọn deployment target)
- [ ] **8.6** Setup CI/CD: GitHub Actions → auto deploy on main branch
- [ ] **8.7** Configure custom domain (nếu có)
- [ ] **8.8** Setup monitoring: Sentry hoặc Vercel Analytics
- [ ] **8.9** Verify production: signup, Pomodoro, Habits, XP, level-up — all working
- [ ] **8.10** Commit Phase 8

---

## Phase 9 — Documentation & Handoff

_Docs, README, code conventions_

- [ ] **9.1** Viết README.md: setup local, env vars, deployment
- [ ] **9.2** Viết CONTRIBUTING.md: code conventions, branch naming, PR flow
- [ ] **9.3** Document Supabase schema + RLS policies
- [ ] **9.4** Document API / server actions
- [ ] **9.5** Tổng hợp all open todos → backlog for post-MVP
- [ ] **9.6** Final review toàn bộ plan
- [ ] **9.7** Commit Phase 9

---

## Progress Summary

| Phase    | Name                               | Tasks   | Status |
| -------- | ---------------------------------- | ------- | ------ |
| 1        | Project Foundation                 | 10      | [x]    |
| 2        | Platform Foundation                | 15      | [ ]    |
| 3        | Gamification System                | 14      | [ ]    |
| 4        | Pomodoro App                       | 17      | [ ]    |
| 5        | Habit Tracker                      | 17      | [ ]    |
| 6        | Cross-Feature Integration & Polish | 14      | [ ]    |
| 7        | Integration & E2E Testing          | 12      | [ ]    |
| 8        | Deployment & DevOps                | 10      | [ ]    |
| 9        | Documentation & Handoff            | 7       | [ ]    |
| **Tổng** |                                    | **116** |        |

---

## Post-MVP Backlog (Ghi chú)

- Badge/Achievement System
- Weekly/Monthly Insight Reports
- Sound Effects & Ambient Sounds
- Social Features (leaderboard, challenges)
- Notification/Reminder System
- PWA Support
- Custom Theme System (primary color picker)
- Cross-domain Insights
- Team/Social Dashboard
- Third-party Integrations
- Mobile Native App (iOS/Android)
