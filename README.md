inch# JL-Tools

> Productivity RPG — biến việc học và làm việc thành một hành trình lên cấp.

JL-Tools là một web app tập hợp các công cụ học tập + làm việc của bạn vào **một nơi duy nhất**, gắn với một hệ thống gamification kiểu RPG: mỗi phiên tập trung, mỗi thói quen check-in, mỗi flashcard ôn đúng đều quy ra **XP** và giúp **nhân vật** của bạn lên cấp.

Thay vì phải mở 3–4 app rời rạc (timer, habit tracker, Anki…), bạn dùng một dashboard duy nhất — và thấy được tiến bộ thật của mình theo thời gian.

---

## Ai dùng JL-Tools?

- **Sinh viên** muốn vừa học tập trung vừa duy trì thói quen ôn bài đều đặn.
- **Freelancer** cần một timer Pomodoro nghiêm túc và tracking công việc theo ngày.
- **Học sinh / người tự học** dùng flashcards với spaced repetition để nhớ lâu.

Tất cả ai thích cảm giác **"thấy mình tiến bộ"** thay vì chỉ tick to-do list cho có.

---

## Có gì trong MVP?

| Tool | Mô tả | XP / lần |
|------|-------|----------|
| **Pomodoro** | RPG-style focus timer (25/5, 50/10, custom). Chạy session = nhận XP. | +10 XP / session |
| **Habits** | Habit tracker với streak counter và heatmap kiểu GitHub. | +5 XP / check-in |
| **Flashcards** | Bộ thẻ học theo thuật toán **SM-2 (spaced repetition)** — chỉ ôn đúng thẻ cần ôn. | +2 XP / "Good" |
| **Character** | Trang nhân vật: level, total XP, lịch sử hoạt động. Level 14 → 15 cần 1500 XP. |  |
| **Dashboard** | Tổng quan hàng ngày: focus time, streak, thẻ tới hạn. |  |

Hỗ trợ **dark mode**, **đa ngôn ngữ (EN / VI)**, và một palette warm neutral OKLCH có thể tune accent hue qua biến `--jl-hue`.

---

## Tech Stack

| Layer | Tech |
|-------|------|
| Framework | Next.js 16 (App Router, Turbopack), React 19 |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS + shadcn/ui |
| Auth + DB | Supabase (Postgres + RLS, cookie-based auth qua `supabase-ssr`) |
| State | Zustand (client) + TanStack Query (server) |
| i18n | next-intl |
| Animation | Framer Motion |
| Validation | Zod + React Hook Form |
| Test | Vitest + Testing Library |
| Hosting | Vercel (auto-deploy on push) |
| Package manager | **pnpm** |

---

## Chạy local

**Yêu cầu:** Node 20+, pnpm, Docker (cho Supabase local).

```bash
# 1. Clone & cài dependencies
pnpm install

# 2. Khởi động Supabase local (Postgres + Auth qua Docker)
npx supabase start

# 3. Tạo .env.local từ template, điền credentials Supabase in ra ở bước 2
cp .env.example .env.local

# 4. Chạy dev server
pnpm dev
```

App chạy ở [http://localhost:3000](http://localhost:3000).

### Các lệnh khác

```bash
pnpm build         # Build production
pnpm lint          # ESLint
pnpm type-check    # TypeScript check
pnpm test          # Vitest
pnpm test:ui       # Vitest UI
```

---

## Cấu trúc project

```
app/
├── [locale]/              # Routes theo locale (en / vi)
│   ├── (app)/             # Protected routes — yêu cầu login
│   │   ├── dashboard/
│   │   ├── pomodoro/
│   │   ├── habits/
│   │   ├── flashcards/
│   │   ├── character/
│   │   └── settings/
│   ├── (marketing)/       # Landing page
│   ├── auth/              # Sign-in, sign-up, reset password
│   └── legal/
components/
├── ui/                    # shadcn/ui primitives
├── pomodoro/ | habits/ | flashcards/ | character/
└── layout/
lib/
├── supabase/              # Browser + server clients
└── utils.ts
features/                  # Feature logic (XP calc, SM-2, streak…)
claude-design/             # Design source: tokens.css + screen mockups
supabase/migrations/       # 4 migration files, 17 tables, RLS policies
```

---

## Design system

- **Source of truth:** `claude-design/styles/tokens.css` — palette, spacing, typography. Khi cần đổi design, sửa file này trước rồi port qua `app/globals.css`.
- **Mockups:** `claude-design/screens/*.jsx` — mỗi screen một file React để tham chiếu UI intent.
- **Fonts:** Geist (sans), Fraunces (display), JetBrains Mono.
- **Utility classes:** `.jl-card`, `.jl-chip`, `.jl-btn` (`-primary`, `-accent`), `.jl-display`, `.jl-mono`, `.jl-tnum`.

---

## Roadmap

4 sprint × 2 tuần = ~8 tuần cho MVP:

1. **Sprint 1** — Foundation + auth + design tokens.
2. **Sprint 2** — Pomodoro + XP engine.
3. **Sprint 3** — Habits + streak + heatmap.
4. **Sprint 4** — Flashcards (SM-2) + Character + polish.

---

## License

Private — work in progress.
