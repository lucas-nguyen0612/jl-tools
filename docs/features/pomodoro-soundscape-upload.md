# Pomodoro · Soundscape Upload

User-uploaded background music cho phần Pomodoro. File MP3/WAV/OGG/WEBM được lưu ở Supabase Storage (bucket `music`); DB chỉ lưu metadata + link công khai đến file.

---

## Tổng quan

| Thành phần | Vị trí |
|---|---|
| Migration (bucket + table + RLS) | `supabase/migrations/00021_pomodoro_soundscapes.sql` |
| Server actions | `features/pomodoro/soundscapes.ts` |
| TanStack Query hooks | `hooks/useSoundscapes.ts` |
| Audio playback hook | `hooks/useSoundscapePlayer.ts` |
| UI | `components/pomodoro/SoundscapeSelector.tsx` |
| Wired vào trang | `app/(app)/pomodoro/page.tsx` |
| Database type | `types/database.ts` (`pomodoro_soundscapes`) |

---

## Database schema

### Bảng `pomodoro_soundscapes`

| Cột | Kiểu | Ghi chú |
|---|---|---|
| `id` | `uuid PK` | Cũng là tên file (`{user_id}/{id}.{ext}`) trong storage |
| `user_id` | `uuid` | FK `auth.users`, on delete cascade |
| `name` | `text` | 1–80 ký tự, tên hiển thị do user đặt |
| `storage_path` | `text` | Object key trong bucket `music`, dạng `{user_id}/{id}.{ext}` |
| `file_url` | `text` | Public URL ổn định của file — đây là "link" client dùng để phát |
| `file_size_bytes` | `int` | 0 → 20 MB (`20971520`) |
| `mime_type` | `text \| null` | `audio/mpeg`, `audio/wav`, ... |
| `created_at` | `timestamptz` | Default `now()` |

Index: `idx_pomodoro_soundscapes_user (user_id, created_at desc)` cho query list.

### RLS

Tất cả 4 lệnh (select/insert/update/delete) đều giới hạn `user_id = auth.uid()`. Mỗi user chỉ thấy / sửa / xóa row của chính mình.

---

## Storage: bucket `music`

Tạo trong cùng migration `00021`:

| Thuộc tính | Giá trị |
|---|---|
| `id` / `name` | `music` |
| `public` | `true` (URL ổn định, embed thẳng vào `<audio>`) |
| `file_size_limit` | `20 MB` |
| `allowed_mime_types` | `audio/mpeg`, `audio/mp3`, `audio/wav`, `audio/x-wav`, `audio/ogg`, `audio/webm` |

**Layout key**: `{user_id}/{soundscape_id}.{ext}` — giúp 4 storage policy dùng `(storage.foldername(name))[1] = auth.uid()::text` để cô lập folder mỗi user.

**Storage policies** (trên `storage.objects`):
- `music_select_own` — authenticated, chỉ folder mình
- `music_insert_own` — authenticated, chỉ upload vào folder mình
- `music_update_own` — authenticated, folder mình
- `music_delete_own` — authenticated, folder mình
- `music_public_read` — anon, cho phép `<audio>` không cần token (vì bucket đã public)

> **Vì sao public bucket?** User yêu cầu DB lưu "link". Signed URL hết hạn ⇒ phải refresh liên tục, không thực sự là "lưu link". Object key là UUID nên URL không đoán được. Storage policy vẫn chặn write từ user khác.

---

## Upload flow

```
┌──────────┐                  ┌──────────────────┐         ┌──────────────┐
│  Client  │  1. file picker  │  Supabase Storage│         │  PostgREST   │
│ (browser)│ ───────────────▶ │  bucket: music   │         │ pomodoro_    │
└──────────┘                  │  path: {uid}/    │         │ soundscapes  │
     │   3. registerSoundscape│       {id}.{ext} │         └──────────────┘
     │   (server action)      └──────────────────┘                ▲
     │                                                            │
     │ ───────────────────────────────────────────────────────────┘
                                4. INSERT row
                                  (file_url = getPublicUrl(path))
```

1. User chọn file trong `SoundscapeSelector`.
2. `useUploadSoundscape` (client) sinh `id = crypto.randomUUID()`, build path `{user_id}/{id}.{ext}`, gọi `supabase.storage.from('music').upload(...)` với session của user. RLS chặn nếu prefix folder không khớp `auth.uid()`.
3. Sau khi upload xong, gọi server action `registerSoundscape({ id, name, storagePath, fileSizeBytes, mimeType })`.
4. Server action verify `storagePath` bắt đầu bằng `{user_id}/`, lấy public URL bằng `supabase.storage.from('music').getPublicUrl(storagePath)`, INSERT row vào `pomodoro_soundscapes`.

**Rollback**: nếu `registerSoundscape` thất bại, client gọi `storage.remove([storagePath])` để dọn file mồ côi.

**Bytes file không đi qua Next.js** — upload trực tiếp browser → Supabase Storage. Tránh giới hạn body size của Vercel functions và bandwidth không cần thiết.

---

## Delete flow

`deleteSoundscape(id)` (server action):
1. SELECT `storage_path` của row (kèm filter `user_id = auth.uid()`).
2. `storage.from('music').remove([storage_path])` — xóa file.
3. `DELETE FROM pomodoro_soundscapes WHERE id = ?`.

Nếu storage delete fail → giữ lại DB row để user retry. Nếu DB delete fail (sau storage success) → row mồ côi, vô hại.

---

## Playback

`hooks/useSoundscapePlayer.ts` mount ở trang Pomodoro (`app/(app)/pomodoro/page.tsx`):

- Tạo 1 `HTMLAudioElement` (loop=true) ở client-side.
- Subscribe `pomodoroStore.settings.soundscape`, `settings.volume`, `isRunning`, `phase`.
- Subscribe TanStack Query list custom soundscapes.
- Logic:
  - Nếu `soundscape` là 1 trong 6 preset (`silent/rain/cafe/...`) → hiện không có file audio bundled → **silent**.
  - Nếu `soundscape` là UUID khớp 1 row custom → set `audio.src = row.file_url`.
  - Play khi `isRunning && phase === 'work'`. Pause khi pause/break/skip.
  - Volume slider áp dụng realtime (`audio.volume = settings.volume`).

Chính sách play(): `audio.play()` có thể reject nếu user chưa interact với page (autoplay policy). Đã `.catch(() => {})` để không log spam — lần Start tiếp theo sẽ play được vì bấm nút = user gesture.

---

## UI

`SoundscapeSelector.tsx` được mở rộng:

```
┌─ SOUNDSCAPE ─────────────────────┐
│  🔇 Silent  🌧️ Rain  ☕ Café    │   ← presets giữ nguyên
│  🌲 Forest  🌌 Space  🎵 Lo-Fi  │
├─ MY UPLOADS ──────── [+ Upload] ─┤
│  🎶 Lofi study mix          🗑   │   ← custom uploads
│  🎶 Rain ambience           🗑   │
├──────────────────────────────────┤
│  Volume ─────●──── 50%           │
└──────────────────────────────────┘
```

Khi bấm `+ Upload`:
1. Mở native file picker (chỉ accept audio/*).
2. Hiện form inline: tên file (mặc định = file name, max 80), nút "Tải lên" / "Hủy".
3. Trong khi mutation chạy: button disable, nhãn "Đang tải lên...".
4. Thành công → invalidate query list, auto-select bài vừa upload.
5. Thất bại → hiện error đỏ inline (validation client-side hoặc lỗi storage/server).

Validation client-side trong `useUploadSoundscape`:
- Size > 20 MB → reject trước khi gọi storage.
- MIME không nằm trong allow-list → reject.

---

## Cấu hình settings.soundscape

Cột `pomodoro_settings.soundscape` (đã tồn tại từ Sprint 4) là `text`. Format mới:
- `'silent'` / `'rain'` / `'cafe'` / `'forest'` / `'space'` / `'lofi'` — preset
- Bất kỳ UUID nào → tham chiếu `pomodoro_soundscapes.id` của user

Player phân biệt bằng `PRESET_IDS` set trong `useSoundscapePlayer.ts`. Nếu UUID không tìm thấy trong list custom (ví dụ user xóa bài đang chọn từ thiết bị khác) → fallback về silent, không crash.

Khi user xóa bài đang được chọn, UI tự reset `settings.soundscape = 'silent'` trước khi gọi delete để player dừng cleanly.

---

## Migration & deploy

### Local
```bash
npx supabase migration up
```

Migration `00021` `INSERT ... ON CONFLICT DO UPDATE` cho `storage.buckets`, `DROP POLICY IF EXISTS` rồi `CREATE POLICY` cho từng policy ⇒ **rerun an toàn**.

### Production
- Chạy migration qua dashboard hoặc CI.
- Sau migration, bucket `music` đã sẵn sàng. Không cần thao tác manual trên Supabase Dashboard.
- Không có env var mới.

---

## Test plan

### Manual smoke
- [ ] Pick file MP3 ~5 MB → upload thành công, hiện trong list.
- [ ] Bấm vào bài → bắt đầu Pomodoro work session → nghe nhạc loop.
- [ ] Pause timer → nhạc dừng. Resume → nhạc tiếp.
- [ ] Skip sang short break → nhạc dừng. Quay lại work → nhạc chạy lại.
- [ ] Slider volume kéo realtime → âm lượng đổi.
- [ ] Delete bài đang chọn → fallback silent, file biến mất khỏi storage.
- [ ] Upload file > 20 MB → reject với error message ở client.
- [ ] Upload file `.txt` đổi tên → reject vì MIME.
- [ ] Reload page → list vẫn còn, soundscape vẫn được chọn.

### Bảo mật
- [ ] User A không thấy được bài của User B (RLS DB).
- [ ] User A không upload được vào folder `{user_b_id}/...` (RLS storage).
- [ ] User A không xóa được file của User B qua API (server action filter `eq('user_id', auth.uid())`).

### Edge cases
- [ ] Soundscape UUID lưu trong settings nhưng row đã bị xóa từ thiết bị khác → player im lặng, không crash.
- [ ] Reload trong khi đang upload → upload hủy, không có row mồ côi (file đã upload tồn tại nhưng không có row trỏ tới — chấp nhận được, là edge case hiếm; có thể thêm cron cleanup sau).

---

## Rủi ro & TODO sau này

- **Preset audio bundled**: 6 preset hiện chưa có file audio. Nếu muốn chúng phát nhạc, có 2 hướng:
  1. Bundle file `/public/sounds/{preset}.mp3` và update `useSoundscapePlayer` để map preset id → URL.
  2. Bỏ preset, chỉ giữ custom uploads.
- **Quota per-user**: Hiện không giới hạn số bài / tổng dung lượng / user. Nếu sợ abuse, thêm `count(*) < N` check trong `registerSoundscape`.
- **Soft delete**: `DELETE` cứng. Nếu cần audit, đổi sang flag `deleted_at` + cron cleanup storage.
- **CORS**: Bucket public ⇒ ai có URL đều stream được. URL chứa UUID nên khó leak, nhưng nếu user share URL công khai sẽ tốn bandwidth Supabase. Nếu lo ngại, đổi sang private + signed URL TTL dài (24h) + refresh.
