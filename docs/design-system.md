# JL Tools — Design System Reference

> Tài liệu canonical cho UI patterns. Agent NÊN đọc file này trước khi build feature mới để tránh tự nghĩ pattern lệch với phần còn lại của codebase.
>
> Nguyên tắc: chỉ ghi cái **canonical** + **non-obvious**. Cái gì grep ra dễ thì không lặp lại.

---

## 1. Design tokens (`app/globals.css`)

Toàn bộ tokens định nghĩa trong `:root` (light) và `.jl-dark` (dark). Dùng qua `var(--jl-*)`.

### Color (oklch — warm neutral palette)

| Token | Mục đích |
|---|---|
| `--jl-bg` | Nền trang chính |
| `--jl-bg-raised` | Card, modal, popover |
| `--jl-bg-sunken` | Hover, input, secondary panel |
| `--jl-line` | Border chính |
| `--jl-line-soft` | Divider mảnh |
| `--jl-text` | Text chính |
| `--jl-text-soft` | Text phụ (description, label) |
| `--jl-text-faint` | Text nhạt nhất (hint, count) |

### Accent (tunable hue qua `--jl-hue`, default = 38 amber ấm)

| Token | Mục đích |
|---|---|
| `--jl-accent` | Màu accent chính (button hover, dot, today highlight) |
| `--jl-accent-strong` | CTA chính, primary button bg |
| `--jl-accent-soft` | Bg nhạt cho icon badge |
| `--jl-accent-ink` | Text/icon trên nền `--jl-accent-soft` |

### Semantic

| Token | Hue | Dùng cho |
|---|---|---|
| `--jl-success` | 150° (xanh lá) | Habit events, success state |
| `--jl-warn` | 70° (vàng) | Cảnh báo |
| `--jl-danger` | 25° (đỏ) | Lỗi, delete, destructive |
| `--jl-info` | 240° (xanh dương) | Google Calendar events, info |
| `--jl-epic` | 300° (tím) | Epic/legendary trong gamification |

### RPG rarity (cho gamification UI)

`--jl-common`, `--jl-uncommon`, `--jl-rare`, `--jl-legendary`, `--jl-mythic`

### Layout / radii / shadow

| Token | Giá trị |
|---|---|
| `--jl-gap` | `20px` (gap giữa các card) |
| `--jl-p` | `16px` (padding chuẩn trong card) |
| `--jl-r-sm` | `8px` (button, input, chip) |
| `--jl-r` | `12px` (card mặc định) |
| `--jl-r-lg` | `18px` (card lớn, modal) |
| `--jl-r-xl` | `28px` (hero element) |
| `--jl-shadow-sm` / `--jl-shadow` / `--jl-shadow-lg` | Shadow scale |

### Typography

| Token | Font |
|---|---|
| `--jl-font-sans` | Geist (body) |
| `--jl-font-display` | Fraunces (heading editorial — page title, big number) |
| `--jl-font-mono` | JetBrains Mono (kbd, code) |

### shadcn variable mapping

shadcn tokens (`--background`, `--primary`, `--ring`, `--radius`, ...) đã được map sang `--jl-*` ở `globals.css` line 78-113. **Không sửa shadcn vars trực tiếp** — sửa `--jl-*` để propagate.

---

## 2. Convention quan trọng nhất: **inline-style + jl-* token**

Codebase này KHÔNG dùng Tailwind utility classes cho color/spacing tokens. Pattern chuẩn:

```tsx
// ✅ Đúng
<div style={{
  background: 'var(--jl-bg-raised)',
  border: '1px solid var(--jl-line)',
  borderRadius: 'var(--jl-r-lg)',
  padding: 'var(--jl-p)',
}}>

// ❌ Sai (không có Tailwind class cho jl-* tokens)
<div className="bg-jl-bg-raised border-jl-line rounded-jl-r-lg p-jl-p">
```

Tailwind dùng cho:
- Layout responsive (`flex`, `grid`, `md:flex-row`, `xl:grid-cols-[1fr_300px]`, `hidden md:block`)
- shadcn components (chúng tự dùng Tailwind)
- 1 vài utility class custom: `.jl-card`, `.jl-chip`, `.jl-btn`, `.jl-btn-primary`, `.jl-btn-accent`, `.jl-display`, `.jl-mono`, `.jl-tnum`, `.jl-scroll`

**Lý do:** tokens là CSS vars → có thể đổi runtime (theme switch, hue rotate qua Tweaks panel) mà không rebuild Tailwind.

---

## 3. Layout patterns

### Page shell

```tsx
// app/[locale]/(app)/{feature}/page.tsx — server component
export default async function FeaturePage() {
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
      <TopBar title={t('title')} subtitle={t('subtitle')} rightSlot={<ActionButton />} />
      {/* content */}
    </div>
  )
}
```

- `<TopBar>` (`components/layout/TopBar.tsx`) — header chuẩn cho mọi page
- Outer container BẮT BUỘC `flex: 1; flex-direction: column; min-height: 0` — vì `(app)/layout.tsx` dùng `<main className="flex-1 flex flex-col overflow-hidden">` để full-height. Thiếu `min-height: 0` thì scroll inner sẽ bể.

### 2-cột với right rail

```tsx
<div className="grid grid-cols-1 xl:grid-cols-[1fr_300px]" style={{ gap: 'var(--jl-gap)' }}>
  <main>...</main>
  <aside className="hidden xl:block">...</aside>
</div>
```

Dùng ở `/pomodoro`, `/dashboard`, `/calendar`. Right rail biến mất dưới `xl` (1280px).

### Card

```tsx
<div className="jl-card" style={{ padding: 'var(--jl-p)' }}>
```

Hoặc inline:
```tsx
<div style={{
  background: 'var(--jl-bg-raised)',
  border: '1px solid var(--jl-line-soft)',
  borderRadius: 'var(--jl-r-lg)',
  padding: 'var(--jl-p)',
}}>
```

---

## 4. shadcn primitives đã cài (`components/ui/`)

| Có sẵn | Dùng cho |
|---|---|
| `Button` | Có CVA variants: default / destructive / outline / secondary / ghost / link |
| `Dialog` | Modal — **luôn dùng cái này, không tự viết overlay** |
| `Popover`, `PopoverAnchor`, `PopoverTrigger`, `PopoverContent` | Tooltip giàu, quick-create, virtual anchor |
| `Tabs`, `TabsList`, `TabsTrigger` | View switcher |
| `Checkbox` | Form checkbox (không dùng `<input type="checkbox">`) |
| `Switch` | Toggle on/off |
| `Input`, `Label`, `PasswordInput` | Form fields |
| `Card` (Card, CardHeader, ...) | Có sẵn nhưng project ưa `.jl-card` hơn |
| `Tooltip` | Tooltip ngắn |
| `DropdownMenu` | Menu context |
| `Progress` | Progress bar |
| `Skeleton` | Loading placeholder |
| `Badge`, `Separator` | Misc |

| **Chưa cài** | Workaround |
|---|---|
| Sheet, Drawer | Tự compose từ Dialog hoặc cài thêm |
| Select | Dùng native `<select>` hoặc Popover + button |
| DatePicker | Native `<input type="date">` (đủ dùng) |
| Calendar | Đã dùng `@fullcalendar/react` cho calendar feature |

---

## 5. i18n pattern (`next-intl`)

```tsx
'use client'
import { useTranslations, useLocale } from 'next-intl'

const t = useTranslations('namespace')
t('key.subkey')                          // ✅ literal — type-safe
t('key.subkey', { name: 'X' })           // ✅ với placeholder
```

**Quan trọng — dynamic key:** TypeScript yêu cầu key phải literal. Nếu cần lookup động:

```tsx
// ❌ Lỗi TS2345
const k = meta.someKey  // string
t(k)

// ✅ Dùng `as const` lookup map
const KEYS = {
  google: 'filters.google',
  pomodoro: 'filters.pomodoro',
} as const
t(KEYS[sourceKey])  // type narrows về union literal
```

Xem ví dụ: `features/calendar/sources.ts` (`SOURCE_FILTER_LABEL_KEYS`).

**Locale-aware formatting:** dùng `useLocale()` + `Intl.DateTimeFormat(locale, {...})` chứ không hard-code `'en-US'`.

**Server component:** `import { getTranslations } from 'next-intl/server'; const t = await getTranslations('namespace')`.

**Cập nhật song song:** mọi key thêm vào `messages/en.json` PHẢI có trong `messages/vi.json` cùng lần commit.

---

## 6. State patterns

| Loại state | Tool | Vị trí |
|---|---|---|
| Server data (fetch + cache) | TanStack Query | `features/{feature}/queries.ts` |
| Client state phức tạp | Zustand | `store/{feature}Store.ts` |
| Form state đơn giản | `useState` | Inline trong component |
| URL state (filter, view, page) | searchParams qua `useSearchParams` | — |

### Query keys factory

```ts
export const featureKeys = {
  all: ['feature'] as const,
  list: (filter: string) => [...featureKeys.all, 'list', filter] as const,
}
```

### Server Action return format

```ts
type ActionResult<T> =
  | { data: T; error: null }
  | { data: null; error: { message: string; code: string } }
```

Mutation hook luôn check `result.error` trước khi commit UI.

---

## 7. Quick reference cho UI components mới

Trước khi build:
1. Có shadcn primitive cho việc này không? → Dùng (Dialog, Popover, Tabs, ...)
2. Có pattern tương tự ở feature khác không? → Đọc Pomodoro / Dashboard / Calendar
3. Cần token mới không? → Dùng có sẵn — đừng thêm CSS var mới trừ khi thật sự cần
4. Có i18n key chưa? → Thêm vào CẢ `en.json` + `vi.json`
5. Mobile? → Default mobile-first; xl-only cho right rail; md cho desktop nav

---

## 8. Anti-patterns (đừng làm)

- ❌ Hand-rolled modal/overlay (focus-trap, Escape handler, backdrop click) — dùng `<Dialog>`
- ❌ `useEffect` + `useState` để fetch — dùng TanStack Query
- ❌ Color cứng (`#22c55e`, `#4285f4`) — dùng `var(--jl-success)`, `var(--jl-info)`
- ❌ `any` — dùng strict types, cast tối thiểu khi cần
- ❌ Default exports cho component (trừ Next.js `page.tsx` / `layout.tsx`)
- ❌ Inline `onClick={() => fetch(...)}` từ client — qua Server Action
- ❌ Mock database trong test — hit real Supabase local
- ❌ Tailwind class cho color/spacing tokens — dùng inline-style + `var(--jl-*)`
- ❌ Skip `min-height: 0` trên flex container có scrolling content

---

## 9. File structure shortcuts

```
app/
├── [locale]/(app)/{feature}/page.tsx     # Server component, async
├── [locale]/(auth)/...                   # Auth pages
└── globals.css                            # Tokens + jl-* utility + scoped overrides

components/
├── ui/                # shadcn — KHÔNG sửa structure
├── layout/            # TopBar, SideNav, BottomNav, LocaleSwitcher
└── {feature}/         # Feature-specific (PascalCase, named export)

features/
└── {feature}/
    ├── queries.ts          # TanStack Query hooks
    ├── actions.ts          # Server Actions
    ├── types.ts            # Type definitions
    └── ...                 # Other helpers (sources.ts, useShortcuts.ts, ...)

store/                      # Zustand stores (camelCase suffixed Store.ts)
lib/                        # Generic utilities
messages/{en,vi}.json       # i18n
```
