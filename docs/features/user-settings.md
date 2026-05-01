# User Settings Page

Settings page tập trung cho phép user quản lý identity, account, appearance, và notifications. Phương án **C** (đã chốt): 5 sections — Profile (lean), Account, Appearance, Notifications, About. Avatar/display name edit sống ở `/settings/profile`; Character page đọc avatar read-only và deep-link sang đó.

---

## Tổng quan

| Thành phần | Vị trí |
|---|---|
| Migration | `supabase/migrations/00022_user_preferences.sql` |
| Server actions (account) | `features/settings/account.ts` |
| Server actions (profile) | `features/settings/profile.ts` |
| Server actions (preferences) | `features/settings/preferences.ts` |
| TanStack Query hooks | `hooks/useSettings.ts` |
| Zod schemas | `features/settings/schemas.ts` |
| Routes | `app/(app)/settings/{layout,page,profile,account,appearance,notifications,about}/...` |
| UI sections | `components/settings/{ProfileSection,AccountSection,AppearanceSection,NotificationsSection,AboutSection}.tsx` |
| Sidebar nav | `components/settings/SettingsNav.tsx` |
| Shared cookie helpers | `lib/settings/theme-cookie.ts` |
| Avatar storage bucket | `avatars` (mirror pattern từ `music` bucket trong 00021) |
| Database type | `types/database.ts` (`user_preferences`) |

---

## In Scope (MVP — 1 sprint)

- 5 sections sau với route segment riêng cho mỗi section: Profile, Account, Appearance, Notifications, About.
- Bảng `user_preferences` mới (jsonb).
- Cookie + DB sync cho `theme` và `accent_hue` để zero-FOUC SSR.
- Reuse Supabase Auth cho email/password change.
- Delete account với hard confirm (type display name + password).
- Avatar upload lên Supabase Storage (bucket `avatars`).

## Out of Scope (defer)

- Browser push subscription backend (Service Worker + VAPID + `web-push`).
- Email digest cron + Edge Function.
- Bio, pronouns, social links, timezone picker, language switcher.
- Two-factor auth, connected sessions, "sign out all devices".
- Data export JSON (move sang Sprint sau).
- Pomodoro/Habit/Flashcard tool defaults — sống inline trong từng tool screen, KHÔNG ở `/settings`.
- Section "Learning" (daily XP goal, study reminder time) — đề xuất Sally rev2, defer.
- Audit log, preferences versioning, feature flags.

---

## Database schema

### Bảng mới `user_preferences`

| Cột | Kiểu | Ghi chú |
|---|---|---|
| `user_id` | `uuid PK` | FK `auth.users(id)` ON DELETE CASCADE, UNIQUE |
| `appearance_settings` | `jsonb NOT NULL DEFAULT '{}'` | `{ theme: 'light'\|'dark'\|'system', accent_hue: 0..360 }` |
| `notification_settings` | `jsonb NOT NULL DEFAULT '{}'` | `{ pomodoro_sound: bool, pomodoro_volume: 0..100, habit_reminders_enabled: bool }` |
| `created_at` | `timestamptz NOT NULL DEFAULT now()` | |
| `updated_at` | `timestamptz NOT NULL DEFAULT now()` | Auto-update via existing `handle_updated_at` trigger |

**RLS:** owner-only (`user_id = auth.uid()`) cho SELECT/UPDATE; INSERT chỉ via trigger trên `auth.users` (mirror pattern của `profiles`).

**Auto-create row** khi user signup: extend `handle_new_user()` function để insert default `user_preferences` row cùng lúc với `profiles`.

**Defaults:** `appearance_settings = { theme: 'system', accent_hue: 38 }`; `notification_settings = { pomodoro_sound: true, pomodoro_volume: 70, habit_reminders_enabled: true }`.

### Profile columns dùng từ `profiles` (table đã tồn tại)

⚠️ **Schema discrepancy cần Lucas verify trước Story 2:** repo có 2 migration set song song — `00001_create_profiles.sql` định nghĩa `display_name`/`avatar_url`, còn `001_initial_schema.sql` (cũ hơn?) định nghĩa `character_name`/`character_class`/`username`. Character page (`app/(app)/character/page.tsx:43`) đọc `character_name`, `character_class` — nghĩa là schema runtime đang theo set `001`.

**Action item Story 2.0:** xác nhận schema canonical là gì:
- Nếu `00001` đúng → Profile section dùng `display_name`, `avatar_url`. Cần migration sửa Character page đọc đúng cột.
- Nếu `001` đúng → Profile section dùng `character_name`, `avatar_url` (kiểm tra avatar_url có tồn tại trong set này không, nếu chưa thì ALTER ADD).
- Quyết định trước khi viết Story 2 để tránh phải refactor.

Spec dưới đây giả định schema cuối cùng có cột: `display_name TEXT NOT NULL`, `avatar_url TEXT NULL`. Nếu repo chốt `character_name`, đổi tên field tương ứng.

---

## Cookie strategy (zero-FOUC SSR)

Theme và accent hue PHẢI sync DB ↔ cookie để render đúng từ Server Component.

**Cookies:**
- `jl-theme` (`light` | `dark` | `system`), `Path=/`, `SameSite=Lax`, `Max-Age=31536000`
- `jl-hue` (`0`–`360` integer), cùng attributes

**Read path:** `app/(app)/layout.tsx` (root authenticated layout) đọc cookies qua `next/headers cookies()`, inject `class={theme === 'dark' ? 'jl-dark' : ''}` và `style={{ '--jl-hue': hue }}` vào `<html>` hoặc wrapper div. Nếu cookie thiếu → fallback default `system` + `38`.

**Write path:** Server Action `updateAppearance(input)` làm 3 việc trong cùng response:
1. Update `user_preferences.appearance_settings`.
2. Set 2 cookies via `cookies().set(...)`.
3. `revalidatePath('/', 'layout')` để layout re-render.

**Login sync:** sau login thành công, một Server Action helper đọc `user_preferences` và set cookies tương ứng. Logout clear cả 2 cookies.

**Helper:** `lib/settings/theme-cookie.ts` xuất `readThemeCookie()`, `writeThemeCookie()`, `clearThemeCookie()`.

---

## API surface — Server Actions

Tất cả actions return `ActionResult<T>` theo pattern dự án (`{ data, error: null } | { data: null, error: { message, code } }`). Validate input bằng Zod.

```ts
// features/settings/profile.ts
updateProfile(input: { display_name: string }) → ActionResult<Profile>
uploadAvatar(formData: FormData) → ActionResult<{ avatar_url: string }>
removeAvatar() → ActionResult<void>

// features/settings/account.ts
updateEmail(input: { new_email: string }) → ActionResult<{ confirmation_sent: true }>
updatePassword(input: { current: string; new: string }) → ActionResult<void>
deleteAccount(input: { display_name_confirm: string; password: string }) → ActionResult<void>

// features/settings/preferences.ts
updateAppearance(input: { theme: Theme; accent_hue: number }) → ActionResult<UserPreferences>
updateNotifications(input: NotificationPrefs) → ActionResult<UserPreferences>
```

**Zod constraints:**
- `display_name`: 2–32 ký tự, trim, regex chặn ký tự control.
- `accent_hue`: integer 0–360.
- `theme`: enum `['light','dark','system']`.
- `pomodoro_volume`: integer 0–100.
- Password: tối thiểu 8 ký tự (Supabase default).
- Email: standard `z.string().email()`.

---

## Layout & navigation

- `app/(app)/settings/layout.tsx`: 2-column desktop (sidebar 220px + content), single-column mobile (sidebar collapse thành accordion ở top hoặc dropdown).
- `SettingsNav.tsx`: list 5 mục, active state theo `usePathname()`. Icon từ `lucide-react` (User, KeyRound, Palette, Bell, Info).
- Default route `/settings` redirect sang `/settings/profile`.
- Thêm entry vào `components/layout/SideNav.tsx NAV_ITEMS` (icon `Settings` từ `lucide-react`), đặt cuối list trước user avatar block hoặc trong user menu — quyết định ở Story 1.

---

## User stories

### Story 1: Settings shell + navigation

**As a** user, **I want** truy cập `/settings` và thấy sidebar 5 sections **so that** điều hướng đến từng nhóm cài đặt.

**Acceptance criteria:**
- Given tôi authenticated, when navigate `/settings`, then redirect tới `/settings/profile`.
- Given tôi ở `/settings/*`, when nhìn sidebar, then thấy 5 mục với active state đúng.
- Given tôi ở mobile (<768px), when mở settings, then sidebar collapse hợp lý (accordion hoặc top dropdown).
- Given tôi unauthenticated, when truy cập `/settings/*`, then redirect tới `/auth/login`.
- Given user mở app, when click avatar góc trên hoặc menu item Settings ở SideNav, then navigate đến `/settings`.

**Tasks:**
- Tạo route segments `app/(app)/settings/{layout.tsx,page.tsx,profile/page.tsx,account/page.tsx,appearance/page.tsx,notifications/page.tsx,about/page.tsx}`.
- Build `SettingsNav.tsx` với 5 items + active state.
- Wire entry point từ `SideNav.tsx` (thêm vào `NAV_ITEMS` hoặc qua user avatar dropdown).
- Mobile responsive — sidebar accordion hoặc dropdown.
- Auth guard middleware (kiểm tra middleware đã handle hay cần thêm).

**Size:** S

---

### Story 2: Profile section

**As a** user, **I want** đổi display name và avatar **so that** tên/ảnh hiển thị ở Character, leaderboard, top bar đúng.

**Acceptance criteria:**
- Given tôi ở `/settings/profile`, when xem trang, then thấy avatar hiện tại, display name (input), email (read-only).
- Given tôi đổi display name hợp lệ (2–32 ký tự), when blur input hoặc click Save, then DB update và toast "Saved".
- Given tôi nhập tên trống hoặc <2 ký tự, when submit, then validation error inline.
- Given tôi upload avatar (PNG/JPG/WEBP, ≤ 5MB), when upload thành công, then avatar mới hiển thị trong <2s và sync sang Character/SideNav.
- Given tôi click "Remove avatar", when confirm, then avatar reset về Dicebear hoặc null.
- Given tôi ở Character page, when click vào avatar, then navigate tới `/settings/profile`.

**Tasks:**
- ⚠️ **Story 2.0:** Verify schema canonical (`display_name` vs `character_name`). Quyết định + ALTER nếu cần.
- Migration `00022_user_preferences.sql` (table + RLS + trigger insert default) — gộp với Story 4 nếu thuận tiện.
- Migration thêm bucket `avatars` + storage RLS (mirror 00021 `music` bucket pattern, file size limit 5MB, mime `image/png,image/jpeg,image/webp`).
- Server action `updateProfile`, `uploadAvatar`, `removeAvatar` + Zod schema.
- Component `ProfileSection.tsx` + `AvatarUpload.tsx`.
- TanStack Query: invalidate `profileKeys.detail(userId)` sau mutation; SideNav re-fetch.
- Character page: avatar click → `<Link href="/settings/profile">`.
- Unit tests: Zod (display_name boundaries), action success/error, file size guard.

**Size:** M (do avatar upload + bucket setup)

**Risks:** schema discrepancy (xem ⚠️ trên); avatar storage cần RLS đúng để không cross-tenant leak.

---

### Story 3: Account section

**As a** user, **I want** đổi email, đổi password, hoặc xóa account **so that** quản lý identity ở một chỗ tin cậy.

**Acceptance criteria:**
- Given tôi ở `/settings/account`, when xem, then thấy email hiện tại, form đổi password, danger zone với "Delete account".
- Given tôi đổi email, when submit, then Supabase gửi confirmation email và UI hiện "Check your inbox to confirm".
- Given tôi đổi password (current + new + confirm), when submit hợp lệ, then password update và sign-out các session khác (per Supabase default).
- Given password current sai, when submit, then error "Current password incorrect" inline.
- Given tôi click "Delete account", when modal mở, then phải gõ display name + password để enable nút "Permanently delete".
- Given delete confirm hợp lệ, when submit, then `auth.users` xóa, cascade FK, redirect về landing page với toast "Account deleted".

**Tasks:**
- Server actions: `updateEmail`, `updatePassword`, `deleteAccount` + Zod.
- `updatePassword` re-auth bằng cách gọi `signInWithPassword({ email, password: current })` để verify current trước khi `updateUser({ password: new })`.
- `deleteAccount`: re-auth, sau đó `supabase.auth.admin.deleteUser(userId)` — yêu cầu Service Role key trong server action (⚠️ KHÔNG dùng `auth.admin` từ anon client). Alternative: tạo Postgres RPC với SECURITY DEFINER xóa từ `auth.users`.
- Component `AccountSection.tsx` + `DeleteAccountDialog.tsx` (controlled inputs để verify match).
- **Audit task:** verify mọi table FK `auth.users` có `ON DELETE CASCADE` (đã spot-check 00001–00021 đều OK).
- Unit tests: Zod, password match, delete confirmation gating.

**Size:** S

**Risks:** delete account cần admin client hoặc RPC — pick một và document.

---

### Story 4: Appearance section

**As a** user, **I want** đổi theme và accent hue **so that** app trông như tôi muốn và lựa chọn persist qua devices.

**Acceptance criteria:**
- Given tôi ở `/settings/appearance`, when xem, then thấy 3 radio cards (Light/Dark/System) với active state, slider hue 0–360 với swatch preview live.
- Given tôi click theme khác, when chọn, then class `.jl-dark` toggle ngay (no reload), DB update, cookie update.
- Given tôi kéo hue slider, when release, then `--jl-hue` CSS var update real-time và DB persist sau debounce 300ms.
- Given tôi reload trang ở chế độ dark/hue tùy chỉnh, when render, then không có flash of unstyled content (theme apply ngay từ server render).
- Given tôi login từ thiết bị khác, when load app, then theme/hue match preference đã lưu (cookie sync từ DB sau login).

**Tasks:**
- Migration `00022_user_preferences.sql` (xem schema ở trên) — bao gồm `auth.users` trigger để insert default row.
- Server action `updateAppearance` với 3 việc: DB write, cookie set, `revalidatePath('/', 'layout')`.
- Helper `lib/settings/theme-cookie.ts`: `readThemeCookie`, `writeThemeCookie`, `clearThemeCookie`.
- Sửa `app/(app)/layout.tsx` đọc cookie + inject class/CSS var. Verify không phá routes khác.
- Login hook (Server Action sau `signInWithPassword`): đọc DB preferences → set cookies.
- Logout: clear cookies trong action sign-out.
- Component `AppearanceSection.tsx`, `ThemeRadio.tsx`, `HueSlider.tsx` (debounced).
- Unit tests: Zod (hue boundary, theme enum), cookie helper round-trip, action success path.

**Size:** S–M (SSR plumbing là rủi ro chính)

**Risks:** quên `revalidatePath` → layout không update tới khi navigate; debounce slider sai → spam DB writes.

---

### Story 5: Notifications section (lean)

**As a** user, **I want** bật/tắt âm thanh Pomodoro và habit reminders, biết status browser notification permission **so that** kiểm soát app làm phiền tôi khi nào.

**Acceptance criteria:**
- Given tôi ở `/settings/notifications`, when xem, then thấy 3 cards: Pomodoro sound (toggle + volume slider), Habit reminders master toggle, Browser permission status.
- Given tôi toggle Pomodoro sound, when change, then DB update và Pomodoro timer dùng giá trị mới (verify integration).
- Given tôi đổi volume, when release slider, then DB persist sau debounce.
- Given Pomodoro sound off, when session kết thúc, then không phát âm.
- Given browser permission là `default`, when click "Enable browser notifications", then prompt browser hiện. Nếu user grant → status update tới `granted`.
- Given browser permission là `denied`, when xem card, then hiển thị guide "Mở browser settings để cho phép".

**Tasks:**
- Server action `updateNotifications` + Zod.
- Component `NotificationsSection.tsx` + 3 sub-cards.
- Hook đọc `Notification.permission` (client-only); button gọi `Notification.requestPermission()`.
- Wire Pomodoro timer hook (existing) đọc `notification_settings.pomodoro_sound` thay vì hardcode — verify call site.
- Wire habit reminder logic kiểm tra `habit_reminders_enabled` master toggle (nếu existing reminder logic chưa có concept này, thêm vào thay vì xây mới).
- Unit tests: Zod, action, hook permission states.

**Size:** S

**Risks:** call site Pomodoro/Habit có thể cần refactor nhỏ để đọc preference.

---

### Story 6: About section

**As a** user, **I want** biết version app và gửi feedback **so that** report bug hoặc xin feature.

**Acceptance criteria:**
- Given tôi ở `/settings/about`, when xem, then thấy app name, version, build date, link feedback (mailto hoặc Google Form), link Terms of Service / Privacy Policy (placeholder OK nếu chưa có).

**Tasks:**
- Component `AboutSection.tsx` (static).
- Đọc version từ `package.json` (build-time inject qua `next.config.ts` `env`).
- Snapshot test.

**Size:** XS

---

## Sprint plan

| # | Story | Size | Dependencies |
|---|---|---|---|
| 1 | Settings shell + nav | S | — |
| 2 | Appearance + migration `user_preferences` | S–M | 1 |
| 3 | Account | S | 1 |
| 4 | Profile (sau khi schema verify) | M | 1, 2.0 audit |
| 5 | Notifications | S | 1, 2 (cùng migration) |
| 6 | About | XS | 1 |

**Total: ~1 sprint** (5–7 ngày dev) nếu schema verify nhanh và avatar storage không bị block.

**Ship order khuyến nghị:**
1. Story 1 (shell) — unblock visible feature
2. Story 2 (Appearance) — moment of delight, đẩy migration sớm
3. Story 6 (About) — XS, fill gap
4. Story 3 (Account) — high trust value
5. Story 5 (Notifications)
6. Story 4 (Profile) — sau khi schema canonical chốt

---

## Open questions cho Lucas

1. **Schema canonical** (Story 2.0): `display_name` (00001) hay `character_name` (001)? Cần chốt trước Story 4.
2. **Delete account** dùng `auth.admin.deleteUser` (Service Role key trong env) hay Postgres RPC SECURITY DEFINER? Pick một.
3. **Avatar default** khi user chưa upload: Dicebear (Sally đề xuất) hay icon placeholder? Dicebear cần `<img>` external — OK với CSP?
4. **Settings entry point**: thêm "Settings" vào `NAV_ITEMS` của `SideNav.tsx`, hay làm dropdown từ avatar block? (Hiện avatar ở SideNav chưa interactive.)
5. **Mobile pattern**: accordion top, dropdown, hay riêng 1 page list section rồi tap vào section detail (iOS Settings pattern)?

---

## Out-of-scope follow-ups (Sprint sau)

- Browser push subscription (Service Worker + VAPID + `web-push` library) — Epic riêng.
- Email digest (Supabase Edge Function + cron + template). Cần SES/Resend setup.
- Data export JSON.
- Bio, timezone, language switcher.
- "Sign out all devices" + connected sessions list.
- Two-factor auth.
