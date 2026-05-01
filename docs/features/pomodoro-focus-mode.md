# Pomodoro · Focus Mode

Chế độ toàn màn hình giúp người dùng tập trung vào một phiên work pomodoro: ẩn sidebar, ẩn các panel phụ, chỉ hiển thị timer + task đang làm + danh sách task để chuyển nhanh.

---

## Tổng quan

| Thành phần | Vị trí |
|---|---|
| Overlay component | `components/pomodoro/FocusModeOverlay.tsx` |
| Task panel trong overlay | `components/pomodoro/FocusTaskList.tsx` |
| Trigger từ trang pomodoro | `app/(app)/pomodoro/page.tsx` |
| Store (timer + tasks state) | `store/pomodoroStore.ts` |

---

## Hành vi (UX)

### Tự động bật khi bắt đầu work session

Khi user bấm **Start** (hoặc phím **Space**) ở phase `work`, overlay tự động mở. Logic nằm trong `app/(app)/pomodoro/page.tsx`:

```tsx
useEffect(() => {
  if (isRunning && phase === 'work') {
    setFocusMode(true)
  }
}, [isRunning, phase])
```

**Quy tắc:**

- Chỉ trigger khi `phase === 'work'` — break (`short`/`long`) không auto-open để user nghỉ ngơi tự do.
- Nếu user bấm **Esc** giữa session để thoát focus mode, effect **không** chạy lại (deps không đổi) → overlay sẽ không tự bật lại trong cùng session.
- Lần Start tiếp theo (bắt đầu work session mới) sẽ lại auto-open.
- `isRunning` không được persist vào localStorage (xem `store/pomodoroStore.ts` `partialize`), nên reload trang ở giữa session sẽ KHÔNG auto-open lại.

### Mở/đóng thủ công

| Cách | Hành động |
|---|---|
| Phím `F` | Toggle focus mode (mở hoặc đóng) |
| Nút **Focus Mode** ở TopBar | Toggle |
| Phím `Esc` (khi đang ở focus mode) | Thoát focus mode |
| Nút **Exit Focus Mode** ở góc phải trên overlay | Thoát |
| Nút **Mute / Unmute** ở góc phải trên overlay | Bật/tắt tiếng soundscape (set `volume` = 0 hoặc restore) |

---

## Layout overlay

Top-right controls (cố định, dùng chung cho mọi viewport):

- **Mute toggle** (`Volume2` / `VolumeX` icon) — bật/tắt soundscape. Khi mute, set `settings.volume = 0`; khi unmute, restore về volume cuối cùng > 0 (lưu trong ref). Border đổi sang `--jl-accent` khi đang mute.
- **Exit Focus Mode** button.

### Fit-to-viewport (no scroll)

Triết lý: focus mode phải vừa khít mọi màn desktop/laptop, **không cho user scroll trang**. Lý do: scroll = phân tâm, mất focus.

Cách thực hiện:

- Outer overlay: `position: fixed, inset: 0, overflow: hidden` (chặn scroll trang).
- `useEffect` set `document.body.style.overflow = 'hidden'` khi mount, restore khi unmount → page nền không scroll được kể cả khi click ra ngoài overlay.
- Viewport size được track qua `useState` + `window.addEventListener('resize')` để compute kích thước layout động.
- Bỏ keyboard-hint footer ("Press Space/Esc...") — user đã quen, càng ít chữ trên màn càng tập trung.

### Timer size adaptive

Timer kích thước được tính từ viewport, không cố định:

```ts
const POMODORO_CHROME = 256 // padding + active task + controls + gaps
const heightBudget = vp.h - POMODORO_CHROME
const widthBudget = isDesktop ? vp.w / 2 - 120 : vp.w - 64
const timerSize = clamp(Math.min(heightBudget, widthBudget), 180, 480)
```

Đảm bảo timer luôn fit cả height (sau khi trừ chrome) lẫn width (nửa viewport trên desktop). Cap ở 480 (đẹp nhất) và 180 (đọc được tối thiểu). `PomodoroTimer` nhận prop `size`; radius/font scale theo `size / 280`.

### Desktop (≥ 1024px) — 2-column

CSS grid `minmax(0, 1fr) minmax(360px, 460px)` với gap 64, `alignItems: stretch`, padding `64px 48px 32px`.

- **Cột trái — Pomodoro side**: timer (size động) + "Working on …" + timer controls. `justifyContent: center` để căn giữa cột.
- **Cột phải — Tasks side**: `FocusTaskList` height 100% cột; bên trong, vùng scroll danh sách dùng `flex: 1; overflow-y: auto; min-height: 0` để tự fill chiều cao còn lại sau header + add input.

### Tablet/Mobile (< 1024px) — stacked

Single column, flex column với `flex: 1` trên container nội dung. Pomodoro side hiển thị tự nhiên ở trên, FocusTaskList lấp phần còn lại (có scroll bên trong khi danh sách dài).

---

## Task panel (`FocusTaskList`)

Phiên bản gọn của `TaskList` chính, **không có drag-and-drop** (để tránh xung đột giữa nhiều `DndContext` cùng lúc và để giữ overlay nhẹ).

### Tính năng

- **Quick-add**: input + nút `+`. Enter để submit. Tạo task mặc định 1 estimated pomodoro.
- **Click row** → set/unset active task. Active task được highlight bằng `--jl-accent-soft`.
- **Checkbox** → toggle complete. Task completed có opacity 0.5 và line-through.
- **Trash icon** (hover-reveal) → xóa task.
- **Counter** ở phải: `pomodorosDone/pomodorosEstimated`.
- Danh sách trống hiển thị placeholder: "No tasks yet — add one above".

### State binding

Tất cả thao tác (add/toggle/remove/setActive) đi qua `usePomodoroStore`:

```ts
addTask, toggleTask, removeTask, setActiveTask
```

Cùng store với `TaskList` chính, nên thay đổi ở overlay phản ánh tức thời ở UI nền (và ngược lại). Mutation cũng debounce/sync về DB qua `features/pomodoro/actions.ts` như flow gốc.

---

## Tương tác với phần khác

### Soundscape

`useSoundscapePlayer()` được mount ở `PomodoroPage` (chứ không trong overlay). Vì page vẫn render khi overlay mở (chỉ bị che bởi z-index 9999), soundscape tiếp tục phát bình thường khi đang focus mode.

### Cross-tab sync

`BroadcastChannel('jl-pomodoro')` ở page-level vẫn hoạt động — focus mode không phá vỡ sync giữa các tab.

### Notification permission

Yêu cầu permission lúc mount page; desktop notification "Session Complete" vẫn bắn khi work phase kết thúc, kể cả khi đang ở focus mode.

---

## Quyết định thiết kế

- **Không có setting tắt auto-open**: user có thể bấm `Esc` để thoát ngay nếu không muốn. Giữ logic đơn giản, không cần migrate DB.
- **Không auto-open trong break**: triết lý của pomodoro là break để nghỉ — không nên ép focus mode lên người dùng lúc đó.
- **Không reuse `TaskList` đầy đủ**: vì `TaskList` dùng `DndContext` từ `@dnd-kit/core`. Render hai instance với cùng task IDs sẽ gây xung đột registry. `FocusTaskList` là biến thể không-DnD.
- **Không persist `focusMode`**: state này thuộc page component, không lưu trong store / localStorage. Tránh phải nghĩ về race condition khi hydrate.
- **Bỏ keyboard hint footer**: giảm chữ trên màn hình focus mode → ít distract user. Phím `Space`/`Esc` là quy ước phổ biến nên không cần nhắc.
- **Timer size tự tính thay vì cố định 480**: laptop màn ngắn (≤768px h) không thể chứa timer 480 + chrome — fixed size sẽ vỡ layout. Adaptive size luôn fit, downside là timer nhỏ hơn trên màn hình cao.

---

## Test thủ công

1. Mở `/pomodoro`, đảm bảo phase là `work`, focus mode đang đóng.
2. Bấm **Start** (hoặc Space) → overlay phải mở ngay lập tức.
3. Trong overlay: thêm task qua quick-add → phải xuất hiện ở cả overlay và task list nền.
4. Click một task trong overlay → task được set active, hiển thị "Working on …".
5. Bấm `Esc` → overlay đóng, timer vẫn chạy.
6. Bấm **Pause** rồi **Start** lại → overlay tự mở lại (vì isRunning chuyển false → true).
7. Skip về phase `short` rồi bấm **Start** → overlay **không** auto-mở (đúng).
8. Reload trang giữa session → timer reset (do `isRunning` không persist), focus mode đóng.
9. Resize cửa sổ qua/dưới breakpoint 1024px → layout chuyển 1↔2 cột real-time, timer thay đổi kích thước tương ứng.
10. Mở focus mode trên laptop màn ngắn (≤768px h) → timer tự co lại để vừa, **không xuất hiện scrollbar trang**.
11. Trong focus mode, scroll bằng chuột/trackpad → trang không scroll được; chỉ vùng task list cuộn nội bộ khi danh sách dài.
