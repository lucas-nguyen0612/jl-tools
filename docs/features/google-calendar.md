# Google Calendar Integration

Tích hợp Google Calendar vào jl-tools để người dùng xem, tạo/sửa event ngay trong app — đồng thời sync tự động với Pomodoro session và Habit check-in.

---

## Tổng quan

| Thành phần | Vị trí (planned) |
|---|---|
| Migration (tokens) | `supabase/migrations/000XX_calendar_tokens.sql` |
| Migration (event cache) | `supabase/migrations/000XX_calendar_event_cache.sql` |
| Feature types | `features/calendar/types.ts` |
| Feature store | `features/calendar/store.ts` |
| Server actions (OAuth) | `features/calendar/auth-actions.ts` |
| Server actions (events) | `features/calendar/event-actions.ts` |
| TanStack Query hooks | `features/calendar/queries.ts` |
| Route page | `app/[locale]/(app)/calendar/page.tsx` |
| Calendar view component | `components/calendar/CalendarView.tsx` |
| Event modal | `components/calendar/EventModal.tsx` |
| Connect banner | `components/calendar/ConnectCalendarBanner.tsx` |
| Sidebar nav item | `components/layout/SideNav.tsx` (thêm vào `NAV_ITEMS`) |
| Pomodoro hook | `features/pomodoro/useCalendarSync.ts` |
| Habit sync | `features/habits/useCalendarSync.ts` |
| Thư viện calendar UI | `@fullcalendar/react` + `@fullcalendar/google-calendar` |
| Thư viện Google API | `googleapis` |

---

## In Scope (MVP — Phase 1–3)

- Connect / disconnect Google Calendar qua OAuth 2.0 (luồng riêng, tách biệt với Supabase auth).
- Xem lịch tháng / tuần / ngày với events từ Google Calendar của user.
- Tạo, sửa, xoá event trực tiếp trong app.
- Auto-tạo Calendar event khi hoàn thành Pomodoro session (Phase 4).
- Hiển thị habit check-in lên Calendar dưới dạng event read-only có màu riêng (Phase 5).

## Out of Scope

- Sync 2 chiều real-time (webhook/push notification từ Google) — MVP chỉ dùng polling.
- Hỗ trợ nhiều Google Account cùng lúc.
- Import sự kiện từ Calendar vào Pomodoro task list.
- Offline support / local cache bền vững.

---

## Kiến trúc OAuth

**Lý do dùng luồng OAuth riêng thay vì gắn vào Supabase Auth:**
Supabase Auth xử lý identity (đăng nhập). Calendar là một dịch vụ bên thứ ba cần quyền riêng. Tách biệt để user có thể revoke calendar access mà không ảnh hưởng đến tài khoản.

```
User click "Connect Google Calendar"
  → Server Action redirect → Google OAuth consent screen
    (scope: calendar.readonly hoặc calendar full)
  → Google redirect → /auth/calendar/callback
  → Server Action lưu { access_token, refresh_token, expires_at } vào bảng calendar_tokens
  → Redirect về /calendar
```

**Token refresh:** Mỗi Server Action gọi Google API đều gọi `refreshAccessToken()` nếu `expires_at < now + 60s` trước khi dùng token.

---

## Database Schema

### Bảng `calendar_tokens`

```sql
create table public.calendar_tokens (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  access_token  text not null,
  refresh_token text not null,
  expires_at    timestamptz not null,
  scope         text not null,
  created_at    timestamptz default now(),
  updated_at    timestamptz default now(),

  unique (user_id)  -- 1 Google Calendar account per user
);

-- RLS: user chỉ đọc/ghi được row của mình
alter table public.calendar_tokens enable row level security;

create policy "owner access"
  on public.calendar_tokens
  for all
  using (auth.uid() = user_id);
```

### Bảng `calendar_event_cache` (Phase 2, optional)

Dùng để tránh gọi Google API mỗi lần render. TTL = 5 phút.

```sql
create table public.calendar_event_cache (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users(id) on delete cascade,
  google_event_id text not null,
  title        text,
  start_at     timestamptz not null,
  end_at       timestamptz,
  all_day      boolean default false,
  color        text,
  source       text default 'google',  -- 'google' | 'pomodoro' | 'habit'
  metadata     jsonb default '{}',
  cached_at    timestamptz default now(),

  unique (user_id, google_event_id)
);

alter table public.calendar_event_cache enable row level security;

create policy "owner access"
  on public.calendar_event_cache
  for all
  using (auth.uid() = user_id);
```

---

## Server Actions

### `features/calendar/auth-actions.ts`

| Action | Mô tả |
|---|---|
| `connectGoogleCalendar()` | Tạo OAuth URL + redirect sang Google consent screen |
| `handleCalendarCallback(code, state)` | Exchange code → tokens, lưu vào `calendar_tokens` |
| `disconnectGoogleCalendar()` | Xoá row trong `calendar_tokens`, revoke token tại Google |
| `getCalendarConnectionStatus()` | Trả `connected: boolean` + email Google đang kết nối |

### `features/calendar/event-actions.ts`

| Action | Mô tả |
|---|---|
| `listEvents(timeMin, timeMax)` | Fetch events từ Google Calendar API |
| `createEvent(input)` | Tạo event mới trên Google Calendar |
| `updateEvent(eventId, input)` | Cập nhật event |
| `deleteEvent(eventId)` | Xoá event |
| `createPomodoroEvent(sessionId)` | Tạo event từ Pomodoro session (Phase 4) |
| `syncHabitEvents(date)` | Upsert habit check-in events lên Calendar (Phase 5) |

**Return format** (theo convention của project):

```typescript
type ActionResult<T> =
  | { data: T; error: null }
  | { data: null; error: { message: string; code: string } }
```

---

## TanStack Query Keys

```typescript
export const calendarKeys = {
  all: ['calendar'] as const,
  connection: () => [...calendarKeys.all, 'connection'] as const,
  events: (timeMin: string, timeMax: string) =>
    [...calendarKeys.all, 'events', timeMin, timeMax] as const,
}
```

---

## UI / UX

### `/calendar` page

- **Trạng thái chưa connect:** Hiển thị `ConnectCalendarBanner` — mô tả tính năng + nút "Kết nối Google Calendar".
- **Trạng thái đã connect:** Hiển thị `CalendarView` full-page.

### `CalendarView`

| Element | Chi tiết |
|---|---|
| Toolbar | Nút Today, Prev/Next, Dropdown chọn view (Month / Week / Day) |
| Event color | Google events: màu gốc từ Google. Pomodoro events: màu `--jl-accent`. Habit events: màu secondary của habit tương ứng. |
| Click event | Mở `EventModal` ở chế độ xem/sửa |
| Click vào ô ngày trống | Mở `EventModal` ở chế độ tạo mới, pre-fill ngày |
| Drag & drop event | Cập nhật thời gian event (gọi `updateEvent`) |

### `EventModal`

Fields:
- Tiêu đề (required)
- Ngày bắt đầu + kết thúc (DateTimePicker)
- All-day toggle
- Mô tả (optional textarea)
- Nút Lưu / Xoá / Huỷ

Pomodoro events và Habit events: read-only trong modal (không cho sửa trực tiếp, có link dẫn về trang gốc).

---

## Phase 4 — Pomodoro Integration

### Trigger

Khi Pomodoro session hoàn thành (`status = 'completed'`), hiện toast với action:

```
"Phiên tập trung hoàn thành! Tạo Calendar event?" [Tạo] [Bỏ qua]
```

Nếu user bấm **Tạo** → gọi `createPomodoroEvent(sessionId)`.

### Event được tạo

```
Title:  "🍅 Pomodoro — {task_name hoặc 'Focus Session'}"
Start:  session.started_at
End:    session.completed_at
Color:  --jl-accent (vd: #F97316)
Source: 'pomodoro'
```

### Setting (Phase 4b)

Trong `/settings/notifications`:
- Toggle "Tự động tạo Calendar event sau mỗi Pomodoro" (default: off)
- Khi bật: auto-tạo, không hiện toast.

---

## Phase 5 — Habits Integration

### Hiển thị habit check-in lên Calendar

- Mỗi lần user check habit → gọi `syncHabitEvents(date)` trong background.
- Event dạng all-day:
  ```
  Title:  "{habit_icon} {habit_name}"
  Date:   check-in date
  Color:  màu của habit category
  Source: 'habit'
  ```
- Event read-only — không sửa được từ Calendar, phải vào `/habits`.

### Streak badge

Calendar view tháng: hiển thị streak count nhỏ bên cạnh habit events của ngày hiện tại.

---

## Dependencies cần cài

```bash
pnpm add googleapis @fullcalendar/react @fullcalendar/daygrid @fullcalendar/timegrid @fullcalendar/interaction
```

| Package | Mục đích |
|---|---|
| `googleapis` | Server-side Google Calendar API calls + token refresh |
| `@fullcalendar/react` | Calendar UI component |
| `@fullcalendar/daygrid` | Month view |
| `@fullcalendar/timegrid` | Week / Day view |
| `@fullcalendar/interaction` | Drag & drop, click handlers |

---

## Config cần thiết (trước khi implement)

### Google Cloud Console

1. Tạo project (hoặc dùng project hiện có).
2. Enable **Google Calendar API**.
3. Tạo **OAuth 2.0 Client ID** (Web application).
4. Thêm Authorized redirect URIs:
   - Dev: `http://localhost:3000/auth/calendar/callback`
   - Prod: `https://{your-domain}/auth/calendar/callback`
5. Copy `Client ID` và `Client Secret`.

### Environment Variables

```env
# .env.local
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GOOGLE_REDIRECT_URI=http://localhost:3000/auth/calendar/callback
```

```env
# Vercel Dashboard
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GOOGLE_REDIRECT_URI=https://{your-domain}/auth/calendar/callback
```

---

## Acceptance Criteria theo Phase

### Phase 1 — OAuth + Token Storage ✅ khi:
- [ ] User có thể click "Kết nối Google Calendar" và hoàn thành OAuth flow.
- [ ] `calendar_tokens` được tạo đúng trong DB sau khi connect.
- [ ] User có thể disconnect — token bị xoá khỏi DB và revoked tại Google.
- [ ] Trang `/calendar` hiển thị đúng trạng thái (connected / not connected).

### Phase 2 — Calendar View ✅ khi:
- [ ] Calendar hiển thị events từ Google Calendar của user (month/week/day view).
- [ ] Events hiển thị đúng title, thời gian, màu sắc.
- [ ] Token tự động refresh khi hết hạn mà không cần user làm gì.

### Phase 3 — Create/Edit Events ✅ khi:
- [ ] User tạo event từ app → xuất hiện trên Google Calendar.
- [ ] User sửa event → thay đổi được sync lên Google Calendar.
- [ ] User xoá event → event bị xoá trên Google Calendar.
- [ ] Validation: không cho lưu event thiếu title hoặc start date.

### Phase 4 — Pomodoro Integration ✅ khi:
- [ ] Sau khi hoàn thành Pomodoro session, user thấy toast với option tạo event.
- [ ] Event Pomodoro xuất hiện trên Calendar với đúng title, thời gian, màu.
- [ ] Setting auto-create hoạt động đúng (không hiện toast, tự tạo).

### Phase 5 — Habits Integration ✅ khi:
- [ ] Habit check-in xuất hiện trên Calendar dưới dạng all-day event.
- [ ] Habit events không cho sửa/xoá từ Calendar view.
- [ ] Màu của habit event khớp với màu category của habit.

---

## Rủi ro & Lưu ý

| Rủi ro | Xử lý |
|---|---|
| Google API rate limit (1000 req/100s) | Cache events bằng `calendar_event_cache`, TTL 5 phút |
| Token expiry mid-session | Luôn check + refresh trước mỗi API call trong Server Action |
| User revoke quyền từ phía Google | Bắt lỗi 401, hiện banner "Kết nối lại Google Calendar" |
| Supabase RLS không cover service role | Dùng user's Supabase client trong Server Action (không dùng service role) |
| FullCalendar bundle size | Chỉ import plugins cần dùng, dùng dynamic import cho Calendar page |
