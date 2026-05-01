# JL-Tools — Sprint Plan

**Total:** 4 sprints × 2 tuần = **8 tuần**
**Start date:** TBD
**Stack:** Next.js 15 · TypeScript · Supabase · Tailwind · Vercel

---

## Tổng quan

```
Sprint 1 (W1–2)   Foundation        ✅ Complete
Sprint 2 (W3–4)   Pomodoro Tool     ✅ Complete
Sprint 3 (W5–6)   Habit Tracker     ✅ Complete
Sprint 4 (W7–8)   Flashcard + Ship  🔄 Features complete — Production Deploy pending
```

---

## Sprint 1 — Foundation ✅

**Goal:** App chạy được trên localhost, đăng nhập/đăng ký hoạt động, design system đúng với giao diện thiết kế, RPG components cơ bản render được.

**Deliverable:** Đăng nhập → thấy SideNav với Avatar + XP bar đúng design. Level up modal chạy được.

**Completed:** 2026-04-23

---

### Setup & Infrastructure

- [x] Khởi tạo Next.js 15 project với TypeScript, Tailwind, App Router
- [x] Cài dependencies: supabase-js, ssr, zustand, framer-motion, lucide-react, date-fns, react-hook-form, zod, shadcn/ui
- [x] Setup Supabase local (`supabase init && supabase start`)
- [x] Tạo `.env.local` với Supabase local keys
- [x] Tạo 3 Supabase client files: `lib/supabase/client.ts`, `server.ts`, `middleware.ts`
- [x] Setup `middleware.ts` bảo vệ routes `/dashboard`, `/pomodoro`, `/habits`, `/flashcards`, `/character`

---

### Database

- [x] Migration `001_initial_schema.sql` (17 tables + indexes)
- [x] Migration `002_rls_policies.sql`
- [x] Migration `003_functions_triggers.sql`
  - `award_xp()`, `apply_sm2()`, `update_streak()`
  - `check_and_award_badges()`, `on_auth_user_created()`
  - `update_updated_at()` triggers
- [x] Migration `004_seed_data.sql`
  - 20 badges, 9 quests, 9 unlockables, level_thresholds (1–50)
- [x] TypeScript types: `src/types/database.ts`
- [x] Enable Realtime cho 4 tables: `character_stats`, `xp_transactions`, `user_badges`, `user_quests`

---

### Design System

- [x] CSS tokens vào `src/app/globals.css` (merge với Tailwind base)
- [x] shadcn token override vào `globals.css`
- [x] `tailwind.config.ts` với custom colors từ JL tokens
- [x] `ThemeProvider` client component (dark mode, accent hue, cookie persist)
- [x] Root `layout.tsx` đọc cookie theme từ server → inject vào `<html>` (flash-free)

---

### Landing Page

- [x] `app/page.tsx`: landing page cho unauthenticated, redirect `/dashboard` cho logged-in
- [x] `app/(marketing)/layout.tsx`: layout riêng cho public pages
- [x] `components/marketing/LandingNav.tsx`
- [x] `components/marketing/HeroSection.tsx`
- [x] `components/marketing/HeroVisual.tsx`
- [x] `components/marketing/ToolStrip.tsx`
- [x] `components/marketing/XPBand.tsx`
- [x] `components/marketing/LandingFooter.tsx`

---

### Authentication

- [x] Page `/login` (`app/login/page.tsx`): email + password + Google OAuth
- [x] Page `/auth/login` (`app/auth/login/page.tsx`): dùng `LoginForm` component
- [x] Page `/signup` (`app/signup/page.tsx`)
- [x] Page `/auth/sign-up` (`app/auth/sign-up/page.tsx`)
- [x] Page `/onboarding` (3 steps: đặt tên nhân vật, chọn mục tiêu, chọn tool đầu tiên)
- [x] `app/auth/callback/route.ts`: xử lý OAuth callback
- [x] `app/auth/confirm/route.ts`: xử lý email confirmation link
- [x] `app/auth/forgot-password/page.tsx` + `app/auth/update-password/page.tsx`
- [x] Onboarding check trong middleware
- [x] `enable_confirmations = true` trong `supabase/config.toml`
- [x] `components/ui/PasswordInput.tsx`: input password với eye icon toggle (Eye/EyeOff)
  - Dùng cho tất cả password fields: login, sign-up (×2), update-password
- [x] OTP verification dialog khi login với email chưa confirm:
  - Tự động gửi OTP 6 số khi bắt lỗi `"Email not confirmed"`
  - Dialog nhập OTP + nút Resend (cooldown 60s)
  - Verify qua `supabase.auth.verifyOtp({ type: 'signup' })` → redirect `/dashboard`

---

### RPG Components

- [x] `components/rpg/Avatar.tsx`
- [x] `components/rpg/XPBar.tsx`
- [x] `components/rpg/LevelBadge.tsx`
- [x] `components/rpg/RarityChip.tsx`
- [x] `components/rpg/StatPill.tsx`
- [x] `components/rpg/Sparkline.tsx`
- [x] `components/rpg/Heatmap.tsx`

---

### Layout Components

- [x] `components/layout/SideNav.tsx`
- [x] `components/layout/TopBar.tsx`
- [x] `components/layout/BottomNav.tsx` (mobile)
- [x] `app/(app)/layout.tsx`: Server Component fetch profile → render SideNav

---

### Animation Layer

- [x] `components/animations/XPGainOverlay.tsx`
- [x] `components/animations/LevelUpModal.tsx`

---

### State Foundation

- [x] `store/userStore.ts`: profile, totalXP, level, xpGainQueue, `addXP()`
- [x] `hooks/useXPRealtime.ts`: Supabase Realtime subscribe `character_stats`
- [x] TypeScript types: `src/types/rpg.ts`, `src/types/tools.ts`

---

## Sprint 2 — Pomodoro Tool ✅

**Goal:** Pomodoro timer hoạt động end-to-end: timer chạy, task list, soundscape, XP award khi session hoàn thành, XP cộng vào character.

**Deliverable:** User bấm Start → đếm ngược 25 phút → hoàn thành → thấy "+10 XP" popup → XP bar tăng.

**Completed:** 2026-04-23 — build pass, type-check 0 errors, lint 0 errors.

---

### Supabase

- [x] API route `POST /api/pomodoro/sessions`: nhận completed session, gọi `award_xp()`, trả về XP result
- [x] API route `GET /api/pomodoro/sessions?from=&to=`: lấy session history

---

### State

- [x] `store/pomodoroStore.ts` với Zustand `persist`:
  - `phase`, `timeLeft`, `isRunning`, `sessionCount`, `tasks`, `settings`
  - Actions: `startTimer`, `pauseTimer`, `resetTimer`, `skipPhase`, `addTask`, `reorderTasks`
  - Persist sang `localStorage` để survive page refresh
- [x] `hooks/useTimer.ts`: `requestAnimationFrame` loop → tick store mỗi giây

---

### Components

- [x] `components/pomodoro/PomodoroTimer.tsx`
- [x] `components/pomodoro/ModeSelector.tsx`
- [x] `components/pomodoro/TimerControls.tsx`
- [x] `components/pomodoro/SessionDots.tsx`
- [x] `components/pomodoro/TaskList.tsx`
- [x] `components/pomodoro/TaskItem.tsx`
- [x] `components/pomodoro/SoundscapeSelector.tsx`
- [x] `components/pomodoro/FocusBlocker.tsx`
- [x] `components/pomodoro/FocusModeOverlay.tsx`
- [x] `components/pomodoro/XPTickerPanel.tsx`
- [x] `components/pomodoro/SessionHistoryChart.tsx`

---

### Page

- [x] `app/(app)/pomodoro/page.tsx`
- [x] Keyboard shortcuts: `Space` = start/pause, `R` = reset, `F` = focus mode
- [x] Notification API khi session complete

---

### XP Integration

- [x] POST session → nhận `{ xpAwarded, leveledUp }` → trigger XP popup + LevelUpModal
- [x] Session complete: +10 XP · Clean session: +5 bonus · Daily streak: +5
- [ ] Update `character_stats.total_pomodoros` + `total_focus_minutes` *(defer: cần thêm RPC call)*

---

### Edge Cases

- [x] Tab hidden / máy sleep: recalculate elapsed từ timestamp lúc hidden
- [x] User đóng tab giữa chừng: session chưa hoàn thành không tính XP
- [x] Cross-tab sync qua `BroadcastChannel`

---

## Sprint 3 — Habit Tracker ✅

**Goal:** Habit check-in hoạt động, streak tính đúng (timezone-aware), heatmap render từ real Supabase data, XP award khi check-in.

**Deliverable:** User tạo habit → check-in hàng ngày → thấy streak tăng → heatmap điền màu → XP cộng vào.

**Completed:** 2026-04-23 — build pass, type-check 0 errors, lint 0 errors.

---

### Supabase

- [x] `fetchHabitsWithStatus` Server Action (`features/habits/queries.ts`)
- [x] `createHabit` Server Action (`features/habits/actions.ts`)
- [x] `updateHabit` Server Action
- [x] `archiveHabit` Server Action (soft delete, `is_archived = true`)
- [x] `toggleHabitCompletion(habitId, userId, date)`: Insert/delete completions, streak calc, XP insert, `revalidatePath`

---

### State

- [x] `features/habits/store.ts`: optimistic toggle/rollback/confirm
- [x] `hooks/useHabits.ts`: TanStack Query + `useToggleHabit`, `useCreateHabit`, `useUpdateHabit`, `useArchiveHabit`, `useHeatmapQuery`

---

### Components

- [x] `components/habits/HabitCard.tsx`
- [x] `components/habits/CheckInButton.tsx`
- [x] `components/habits/StreakBadge.tsx`
- [x] `components/habits/HabitForm.tsx`
- [x] `components/habits/HeatmapView.tsx`
- [x] `components/habits/InsightPanel.tsx`
- [x] `components/habits/WeeklyGrid.tsx`
- [x] `components/habits/RemindersPanel.tsx`
- [ ] `components/habits/HabitList.tsx` *(skipped — HabitsClient renders cards directly)*

---

### Page

- [x] `app/(app)/habits/page.tsx`
- [x] `app/(app)/habits/HabitsClient.tsx`

---

### XP Integration

- [x] Check-in: +5 XP · All done bonus: +10 XP
- [x] Streak milestones: +50 XP (7d), +100 XP (14d), +200 XP (30d)
- [x] `character_stats.total_habits_completed` update

---

### Edge Cases

- [x] Timezone: `toLocaleDateString('sv-SE')` → YYYY-MM-DD browser timezone
- [x] Habit limit: max 10, button disabled + "Max 10 habits reached"
- [x] Retroactive check-in ngày hôm qua trong 6h sau midnight
- [x] Warning sớm khi đạt 8+ habits

---

### Habit Check-in — Post-Impl Bugfix ✅

Fix sau khi user báo "bấm hoàn thành habit không được" (2026-04-24):

- [x] Migration `00011_fix_check_and_award_badges.sql`: thêm branch `when 'total_habits_completed'` và `else null` cho CASE trong function `check_and_award_badges`
  - **Root cause:** Seed badge `first_habit` ở `00009_sprint4_full_schema.sql:592` dùng `condition_type='total_habits_completed'` nhưng function CASE trong cùng file (lines 350-371) không có branch tương ứng và không có `else` → Postgres ném `case not found` khi trigger `trg_habit_completion_streak` chạy `update_streak() → award_xp() → check_and_award_badges()` → rollback cả transaction → habit_completion không được lưu, UI revert về unchecked
  - **Verified:** Test insert trực tiếp vào DB local sau fix → streak=1, +5 XP, badge `first_habit` được trao đúng

---

## Sprint 4 — Flashcard + Character + Ship 🔄

**Goal:** SM-2 review loop hoàn chỉnh, Character screen đầy đủ, Dashboard tổng hợp, app deploy lên Vercel production.

**Deliverable:** App hoàn chỉnh 3 tools + dashboard + character sheet. Deployed và chạy được trên production URL.

**Status:** Features complete locally — Production Deploy pending.

---

### Flashcard ✅

#### Supabase
- [x] `hooks/useFlashcards.ts`: TanStack Query cho decks, cards, review session
- [x] `store/flashcardStore.ts`: current review session, results queue

#### State
- [x] `lib/sm2/algorithm.ts`: `calculateNextReview()` client-side
- [x] `hooks/useFlashcards.ts`: session state machine (idle → reviewing → complete)

#### Components
- [x] `components/flashcard/DeckList.tsx`
- [x] `components/flashcard/DeckCard.tsx`
- [x] `components/flashcard/CardFlip.tsx`
- [x] `components/flashcard/RatingButtons.tsx` (Again/Hard/Good/Easy + keyboard 1/2/3/4)
- [x] `components/flashcard/ReviewSession.tsx`
- [x] `components/flashcard/SessionProgress.tsx`
- [x] `components/flashcard/SessionSummary.tsx`
- [x] `components/flashcard/DeckStats.tsx`
- [x] `components/flashcard/CardEditor.tsx`
- [x] `components/flashcard/DeckEditor.tsx`
- [x] `components/flashcard/ForecastChart.tsx`

#### Pages
- [x] `app/(app)/flashcards/page.tsx`
- [x] `app/(app)/flashcards/[deckId]/page.tsx`
- [x] `app/(app)/flashcards/[deckId]/study/page.tsx`

---

### Flashcard UI — Match Design ✅

Implemented via 3-agent parallel team (2026-04-24). Build + typecheck pass.

#### Layout & TopBar
- [x] Redesign `app/(app)/flashcards/page.tsx`: 3-column grid `260px | 1fr | 320px` (split into server `page.tsx` + client `FlashcardsClient.tsx`; old `DeckListClient.tsx` deleted)
- [x] TopBar: 3 action buttons bên phải — Browse (Search icon), New card (Plus icon, mở DeckEditor), Study all (Play icon, accent)
- [x] TopBar subtitle: `"X cards due across Y decks · SM-2 scheduling · +2 XP per card"` từ `useAllDueCount()`

#### Left Sidebar — `FlashcardSidebar.tsx`
- [x] `components/flashcard/FlashcardSidebar.tsx`: compact sidebar (260px), header "DECKS", color dot + name + due chip theo deck color hoặc `✓ All caught up`, active state với accent-soft bg, "New deck" button
- [x] Click deck → `onSelectDeck` callback, không navigate

#### Center — Inline Study Zone
- [x] Auto-select deck có `due_count` cao nhất on mount
- [x] `useDueCards(selectedDeckId)` → `startSession()` inline, render `<ReviewSession />`
- [x] Empty states: "All caught up on this deck" / "Select a deck to start studying" / "Create your first deck"

#### Right Rail — `FlashcardStatsRail.tsx`
- [x] `components/flashcard/FlashcardStatsRail.tsx`
- [x] **Retention widget**: young/mature % từ `useRetentionStats(deckId)` + 7-point Sparkline
- [x] **Card pool**: reuse `<DeckStats>` component
- [x] **Forecast**: reuse `<ForecastChart>` component

#### CardFlip Enhancements
- [x] `CardFlip.tsx`: props `deckName?: string` (hiện sau accent dot ở header) và `tags?: string[]` (chip pills ở footer front face)
- [x] Space key listener (guard input/textarea/contenteditable) + hint "Press Space to flip"
- [x] `ReviewSession.tsx`: truyền `deckName` (từ `useDecks`) và `tags` (từ `currentCard.tags`) vào CardFlip

#### Data / Queries
- [x] `features/flashcards/actions.ts`: `fetchRetentionStats(deckId)` query `flashcard_reviews` tính young (<21d) / mature (≥21d) retention % + 7-day sparkline (carry-forward empty days)
- [x] `features/flashcards/actions.ts`: `fetchAllDueCount()` sum due_count + count decks with due > 0
- [x] `hooks/useFlashcards.ts`: `useRetentionStats(deckId)` (60s staleTime, enabled on deckId) và `useAllDueCount()` (30s staleTime)

---

### Flashcard UI — Post-Impl Polish & Bugfixes ✅

Các fix sau khi user test 3-agent output (2026-04-24):

#### CSS Token System Alignment
- [x] `globals.css`: port toàn bộ utility classes từ `claude-design/styles/tokens.css` — `.jl-card`, `.jl-chip`, `.jl-btn` + `:hover`/`:active`, `.jl-btn-primary`, `.jl-btn-accent`, `.jl-display`, `.jl-mono`, `.jl-tnum`, `.jl-scroll::-webkit-*`
  - **Root cause:** Design file JSX dùng `className="jl-btn"` etc. nhưng các class này chưa tồn tại → buttons không có flex layout, icons xếp dọc
- [x] `globals.css`: CSS var aliases `--jl-bg-elevated → --jl-bg-raised` và `--jl-border → --jl-line`
  - **Root cause:** Các legacy components (`DeckStats`, `ForecastChart`, `CardFlip`, `RatingButtons`, `SessionSummary`, Habits components) dùng tên biến không tồn tại → cards không có bg/border → không nổi bật
- [x] `globals.css`: fix `.jl-btn-accent:hover` và `.jl-btn-primary:hover` — thêm `background` để override `.jl-btn:hover` (specificity cùng level, source order không đủ)
- [x] `globals.css`: thêm `font-feature-settings: "ss01", "cv11"` vào body — enable alt glyphs của Geist (match typography design)

#### Behavior Fixes
- [x] `FlashcardsClient.tsx`: wire button "New card" vào `<CardEditor>` (trước đó mở nhầm `<DeckEditor>`) + disabled khi chưa chọn deck
- [x] `store/flashcardStore.ts`: `flipCard()` toggle `!state.isFlipped` (trước đó set cứng `true` → không flip ngược back→front được)
- [x] `CardFlip.tsx`: bỏ `if (isFlipped) return` trong Space handler → Space cũng toggle 2 chiều

#### Study All & Retention Label Fixes (2026-04-24)
- [x] `features/flashcards/actions.ts`: thêm server action `fetchAllDueCards()` — lấy toàn bộ due cards của user qua mọi deck (filter `user_id` + `due_at <= now`, order `due_at asc`)
- [x] `FlashcardsClient.tsx`: wire `onClick` cho button "Study all" — trước đó button không có handler nên click không làm gì
  - `handleStudyAll()` gọi `fetchAllDueCards()` với loading state, sau đó `resetSession()` + `startSession(ALL_DECKS_SENTINEL, cards)`
  - Button `disabled` khi `totalDue === 0` hoặc đang loading, tooltip động `"Study N due cards across all decks"`
  - Label hiển thị "Loading…" trong lúc fetch
- [x] `FlashcardsClient.tsx`: đổi render condition center column `deckSelectedWithCards` → `sessionActive` (dựa trên `phase !== 'idle'`) → `<ReviewSession />` vẫn render đúng khi phiên cross-deck đang chạy dù `selectedDeckId` không đổi
- [x] `FlashcardsClient.tsx`: auto-start effect thêm guard `currentDeckId === ALL_DECKS_SENTINEL` để không đè phiên Study All bằng phiên deck đơn lẻ
- [x] `FlashcardsClient.tsx`: `handleSelectDeck` reset session kể cả khi click cùng deck nếu đang trong phiên cross-deck
- [x] `components/flashcard/FlashcardStatsRail.tsx`: sửa label retention `young · 14 days` → `young · <21 days` cho khớp logic bucket `interval_after < 21` trong `fetchRetentionStats` (`actions.ts:485`)
  - **Root cause:** design file viết "14 days" nhưng logic SM-2 theo Anki convention (young = interval < 21d) → label misleading

---

### Character Screen ✅

- [x] `app/(app)/character/page.tsx`
- [x] `components/character/CharacterSheet.tsx`
- [x] `components/character/BadgeGrid.tsx`
- [x] `components/character/ActivityTimeline.tsx`
- [x] `components/character/StatChart.tsx`

---

### Dashboard ✅

- [x] `app/(app)/dashboard/page.tsx`
- [x] `components/dashboard/HeroCard.tsx`
- [x] `components/dashboard/QuestList.tsx`
- [x] `components/dashboard/ToolGrid.tsx`
- [x] `components/dashboard/WeeklyStats.tsx`
- [x] `components/dashboard/RecentBadges.tsx`

---

### Dashboard UI — Match Design 🔄

Parallel 2-agent team (2026-04-24) để đóng gap giữa design `claude-design/screens/dashboard.jsx` và implementation hiện tại.

#### Data layer — `features/gamification/dashboard-queries.ts`
- [ ] `dailyActivity[]` — aggregate 18 tuần × 7 ngày từ `pomodoro_sessions` + `habit_completions` + `flashcard_reviews` cho Heatmap
- [ ] `weeklyXP` — sum `xp_transactions` tuần này/tuần trước + daily sparkline 7 điểm
- [ ] `unearnedBadges` — query `badges` NOT IN user_badges để fill locked slots (limit 5)
- [ ] `cardsReviewedToday` — count `flashcard_reviews` trong ngày hiện tại
- [ ] `UNLOCK_SCHEDULE` constant + `getNextUnlock(level)` helper (level → reward name)

#### Components
- [ ] `components/dashboard/StreakCard.tsx`: Flame icon + current streak number + "longest X" + Heatmap (18w) + legend "less ... more"
- [ ] Update `RecentBadges.tsx`: grid 4×2 = 8 slots, merge earned + locked, show Lock icon trên locked
- [ ] Update `WeeklyStats.tsx`: layout 4 cột × 1 hàng, thêm stat "XP earned" với delta %
- [ ] Update `HeroCard.tsx`: 4 stat pills dùng giá trị **today** (Streak, Focus today, Habits today X/Y, Cards today); nhận `nextUnlock` prop
- [ ] Update `ToolGrid.tsx`: header thêm counter "3 active" bên phải

#### Page integration — `app/(app)/dashboard/page.tsx`
- [ ] Dynamic TopBar title theo giờ: "Good morning/afternoon/evening, {name}"
- [ ] Dynamic subtitle: "You're {N} XP away from Level {L}. {K} quests remaining today."
- [ ] TopBar `rightSlot`: Search (ghost) · Bell (ghost) · Start focus (accent, link `/pomodoro`)
- [ ] Wire `StreakCard` + expanded `RecentBadges` vào right rail
- [ ] Pass `nextUnlock`, today values tới `HeroCard`; pass `weeklyXP` tới `WeeklyStats`

#### Deferred (không thuộc scope polish này)
- [ ] Quest `is_bonus` flag + badge rewards (cần schema migration)
- [ ] Per-tool level badge (Lv XX trên ToolCard) — cần schema per-tool XP
- [ ] Guild · Leaderboard — feature lớn, tách sprint riêng

---

### Polish ✅

- [x] Error boundaries: `components/errors/ToolErrorBoundary.tsx`, `QueryErrorBoundary.tsx`
- [x] Skeleton loading states: `DashboardSkeleton`, `CharacterSheetSkeleton`, `BadgeGridSkeleton`, `DeckListSkeleton`
- [x] Empty states với CTA: `NoPomodoroSessionsCTA`, `NoHabitsCTA`, `NoDecksCTA`
- [x] Mobile responsive: `components/layout/BottomNav.tsx`

---

### Production Deploy ❌

- [ ] Tạo Supabase cloud project (region: Singapore)
- [ ] `supabase link --project-ref YOUR_REF`
- [ ] `supabase db push` — apply migrations lên cloud
- [ ] Set environment variables trên Vercel (cloud Supabase keys)
- [ ] Set Auth Redirect URL trong Supabase: `https://jl-tools.vercel.app/api/auth/callback`
- [ ] Enable Google OAuth (tạo credentials tại Google Cloud Console)
- [ ] Verify RLS policies với anonymous role
- [ ] Setup Sentry: `npx @sentry/wizard@latest -i nextjs`
- [ ] Verify deploy trên production URL
- [ ] Smoke test toàn bộ flows trên production

---

## Definition of Done (per sprint)

Một sprint được coi là Done khi:
- [x] Tất cả tasks đã checked
- [x] `pnpm lint` pass (0 errors)
- [x] `pnpm build` pass (0 TypeScript errors)
- [x] App chạy được trên localhost với Supabase local
- [x] User flows chính của sprint hoạt động end-to-end
- [x] Code đã push lên `main`

---

## Dependency Tree

```
Sprint 1 (Foundation) ✅
    ↓
Sprint 2 (Pomodoro) ✅ ← auth, XP engine, character_stats
    ↓
Sprint 3 (Habits) ✅ ← auth, XP engine, streak function
    ↓
Sprint 4 (Flashcard + Ship) 🔄 ← auth, XP engine, SM-2 function, dashboard
```

---

## Packages cần install (đầy đủ)

```bash
# Core
pnpm add @supabase/supabase-js @supabase/ssr

# UI
npx shadcn@latest init
npx shadcn@latest add button dialog progress tabs switch tooltip dropdown-menu skeleton badge popover

# Animation
pnpm add framer-motion

# State
pnpm add zustand @tanstack/react-query

# Forms
pnpm add react-hook-form zod @hookform/resolvers

# Date
pnpm add date-fns date-fns-tz

# Icons
pnpm add lucide-react

# Drag & drop (Pomodoro task list)
pnpm add @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities

# Monitoring (sau khi deploy)
pnpm add @vercel/analytics @vercel/speed-insights
npx @sentry/wizard@latest -i nextjs

# Dev
pnpm add -D supabase @tanstack/react-query-devtools
```
