# Product Brief: JL-Tools

## Executive Summary

*JL-Tools* là một nền tảng tập hợp các công cụ giúp học tập và làm việc hiệu quả, hướng đến những người làm việc nhiều trên máy tính — sinh viên, nhân viên văn phòng, freelancer và content creator. Thay vì phải sử dụng nhiều ứng dụng phân tán để giải quyết từng vấn đề riêng lẻ, JL-Tools quy tụ mọi thứ vào một nền tảng duy nhất với hệ thống gamification RPG xuyên suốt, giúp biến kỷ luật thành trải nghiệm thú vị.

Bản MVP bao gồm hai công cụ cốt lõi: *Pomodoro App* (ứng dụng tập trung kiểu RPG với XP, level, badges) và *Habit Tracker* (theo dõi thói quen với streak, insight và chỉ số trực quan). Cả hai chia sẻ chung một hệ thống XP/Level thống nhất — mọi hành động tích cực đều đóng góp vào sự tiến bộ chung của người dùng.

*Tagline:*
"Làm chủ thời gian. Tối đa giá trị."

---

## Core Vision

### Problem Statement

Người làm việc trên máy tính và mạng xã hội đang đối mặt với vòng lặp mất năng suất: bị phân tâm liên tục, thiếu hệ thống kỷ luật bền vững, và phải sử dụng nhiều ứng dụng phân tán (Pomodoro một app, Habit một app, Task một app) để giải quyết từng vấn đề riêng lẻ. Việc này dẫn đến chi phí tăng, dữ liệu rải rác không tập trung, và không có bức tranh toàn cảnh về sự tiến bộ cá nhân.

### Problem Impact

- *Cá nhân:* Không tận dụng tối đa năng lực bản thân, giảm hiệu suất học tập và làm việc, mất thời gian chuyển đổi giữa các công cụ, dễ bỏ cuộc vì thiếu động lực duy trì.
- *Tài chính:* Chi phí đăng ký nhiều app cộng dồn đáng kể (Sunsama $20/th + Habitify $5/th + Forest $4...). Năng suất thấp ảnh hưởng trực tiếp đến thu nhập, đặc biệt với freelancer và content creator.
- *Xã hội:* Khi mỗi cá nhân không tối đa được giá trị của mình, toàn bộ cộng đồng mất đi những đóng góp tiềm năng. Vấn đề phân tâm và thiếu kỷ luật đang trở thành "đại dịch thầm lặng" của thế hệ làm việc số.

### Why Existing Solutions Fall Short

| Giải pháp hiện tại | Hạn chế chính |
|---------------------|---------------|
| *Forest* (Pomodoro) | Chỉ chống dùng điện thoại, không block web desktop, gamification đơn điệu (chỉ trồng cây), không habit tracking |
| *Habitica* (Habit + RPG) | UI cũ kỹ và rối, learning curve cao, không có Pomodoro timer, gamification mất hứng sau vài tháng, analytics yếu |
| *TickTick* (All-in-one) | Gần nhất nhưng không có gamification, habit tracking nông, Pomodoro cơ bản |
| *Notion* (Platform) | Không có native Pomodoro/Habit, performance chậm, "Notion procrastination" — tốn thời gian setup hơn là làm việc |
| *Sunsama* (Planner) | Quá đắt ($20/th), không habit tracking, không Pomodoro, không gamification |
| *Dùng nhiều app riêng lẻ* | Tốn chi phí, data phân tán, không có cross-domain insights, mệt mỏi quản lý |

*Kết luận:* Chưa có nền tảng nào kết hợp sâu được cả ba yếu tố: *Focus Timer + Habit Tracking + Gamification RPG* trong một trải nghiệm thống nhất với analytics xuyên suốt.

### Proposed Solution

*JL-Tools* — một nền tảng productivity all-in-one với kiến trúc module, nơi mỗi công cụ là một module độc lập nhưng chia sẻ chung hệ thống gamification và dữ liệu người dùng.

*MVP gồm 2 công cụ:*

1. *Pomodoro App (RPG Focus Timer):*
   - Timer tùy chỉnh (focus/break) với giao diện neon tối màu, immersive
   - Focus Mode toàn màn hình — loại bỏ mọi phân tâm
   - Earn XP mỗi phiên hoàn thành, gắn label cho từng phiên
   - Thống kê daily: số phiên, tổng phút focus

2. *Habit Tracker:*
   - Tạo, quản lý, check-in thói quen hàng ngày
   - Streak tracking với fire emoji
   - Weekly progress bar, insight trực quan
   - Hỗ trợ frequency linh hoạt (daily/weekly/custom)

3. *Shared Gamification System (xuyên suốt):*
   - Unified XP bar trên sidebar — mọi hành động tích cực đều tăng XP
   - Hệ thống Level với danh hiệu tiến hóa ("Tân binh" → "Chiến binh kỷ luật" → "Bậc thầy tập trung")
   - Badges/Achievements mở khóa qua milestones
   - Level-up celebration animation

*Tech stack:* Next.js, Supabase (Auth + Postgres + RLS), Tailwind CSS, shadcn/ui, i18n (vi/en), Turborepo monorepo, Tailwind CSS light/dark class-based theme system.

### Key Differentiators

| Differentiator | Mô tả |
|----------------|--------|
| *Unified XP System* | Tất cả tools đổ XP vào cùng một hệ thống progression. Dùng càng nhiều tool → level lên càng nhanh → tạo stickiness và cross-tool engagement mà không app nào hiện có |
| *"Mở là dùng" — Opinionated, không blank canvas* | Khác Notion (phải tự build), JL-Tools có workflow sẵn — mở app là bắt đầu focus hoặc check-in ngay, zero setup |
| *Gamification tiến hóa* | Học từ lỗi của Habitica — XP system mở khóa mechanics mới theo level, không lặp lại nhàm chán. Gentle approach (khuyến khích > trừng phạt) |
| *Cross-domain Insights* | Analytics kết nối dữ liệu từ nhiều tools: "Ngày bạn Pomodoro ≥4 phiên, tỷ lệ hoàn thành habit cao hơn 60%" — insight mà không app đơn lẻ nào cung cấp được |
| *Modular & Scalable* | Kiến trúc schema riêng biệt cho mỗi tool, dễ dàng thêm tool mới mà không ảnh hưởng tools hiện có |
| *Founder = User* | Sản phẩm được xây dựng từ chính pain point thực tế của founder, đảm bảo product-market fit tự nhiên |

---

## Target Users

### Primary Users

*1. Minh — Sinh viên Đại học (21 tuổi)*

- Sinh viên năm 3 ngành CNTT, sống ở ký túc xá
- Một ngày điển hình: dậy 7h, lên lớp buổi sáng, chiều tự học ở thư viện hoặc quán cafe, tối code bài tập/project
- *Pain point:* Mở laptop lên định học nhưng lướt TikTok/YouTube "5 phút" rồi 2 tiếng trôi qua. Dùng Forest trên điện thoại nhưng vẫn bị phân tâm trên laptop. Từng thử Notion để track thói quen nhưng tốn quá nhiều thời gian setup rồi bỏ
- *Motivation:* Muốn GPA cao để apply học bổng, muốn chứng minh với bản thân rằng mình có kỷ luật
- *Thiết bị chính:* Laptop + điện thoại
- *Aha moment:* Hoàn thành 4 phiên Pomodoro liên tiếp, thấy XP bar nhảy lên gần level mới → "Hóa ra mình tập trung được 2 tiếng liền luôn!"

*2. Hà — Nhân viên văn phòng (28 tuổi)*

- Marketing executive tại một công ty startup, ngồi máy tính 8-10 tiếng/ngày
- Một ngày điển hình: 8h30 vào công ty, check email/Slack, họp 2-3 cuộc/ngày, viết content/report xen kẽ, về nhà 18h30 kiệt sức
- *Pain point:* Bị interrupt liên tục bởi Slack/email, không có block time rõ ràng cho deep work. Muốn tập thể dục buổi sáng + đọc sách trước ngủ nhưng không bao giờ duy trì được quá 2 tuần. Dùng Todoist cho task nhưng không track được thói quen
- *Motivation:* Muốn tăng năng suất để được thăng chức, muốn work-life balance tốt hơn
- *Thiết bị chính:* Laptop công ty + điện thoại
- *Aha moment:* Sau 1 tuần dùng, xem weekly insight: "Bạn focus 12 tiếng tuần này, hoàn thành 5/7 ngày tập thể dục" → thấy bức tranh toàn cảnh lần đầu tiên

*3. Khoa — Freelancer Designer (25 tuổi)*

- Freelance UI/UX designer, làm việc tại nhà, nhận project qua Upwork/Fiverr
- Một ngày điển hình: thức dậy không cố định, check email client, design 3-4 tiếng, xen kẽ lướt mạng xã hội, deadline thường gấp gáp
- *Pain point:* Không ai giám sát → dễ trì hoãn cực độ. Thu nhập gắn trực tiếp với output nhưng vẫn không kỷ luật nổi. Từng dùng Toggl track time nhưng chỉ track, không motivate. Thói quen ngủ muộn + không tập thể dục ảnh hưởng sức khỏe
- *Motivation:* Muốn earn nhiều hơn bằng cách tăng output/giờ, muốn xây dựng routine ổn định dù làm việc tự do
- *Thiết bị chính:* MacBook + điện thoại
- *Aha moment:* Streak 7 ngày liên tiếp dậy trước 8h + 3 phiên Pomodoro mỗi sáng → nhận ra mình hoàn thành được gấp đôi lượng công việc so với tuần trước

*4. Linh — Content Creator (23 tuổi)*

- Làm YouTube và viết blog về lifestyle/productivity, 50K followers
- Một ngày điển hình: sáng research nội dung, chiều quay/edit video, tối viết blog + engage comment. Workflow phức tạp nhiều phase
- *Pain point:* Nghịch lý: làm content về productivity nhưng bản thân struggle với kỷ luật. MXH vừa là công cụ làm việc vừa là nguồn phân tâm lớn nhất. Mỗi phase cần focus khác nhau (research cần đọc nhiều, edit cần block dài, viết cần yên tĩnh)
- *Motivation:* Muốn tăng output content (từ 2 video/tuần lên 3), muốn authentic — thực sự productive chứ không chỉ nói về productivity
- *Thiết bị chính:* iMac + điện thoại
- *Aha moment:* Gắn label Pomodoro cho từng phase → cuối tuần xem stats biết chính xác mỗi phase tốn bao nhiêu thời gian → tối ưu workflow

### Secondary Users

| Persona | Mô tả | Cách tương tác |
|---------|--------|----------------|
| *Team Leader* | Quản lý nhóm 5-10 người, muốn giới thiệu JL-Tools cho team để cải thiện năng suất chung | Không trực tiếp dùng nhưng là người ảnh hưởng đến quyết định adopt. Post-MVP: team dashboard |
| *Giáo viên/Mentor* | Giảng viên đại học hoặc mentor khuyên sinh viên dùng để rèn kỷ luật | Referral source, có thể tạo "classroom challenge" trong tương lai |
| *Phụ huynh* | Cha mẹ muốn con cái quản lý thời gian tốt hơn, đặc biệt khi học online | Người trả tiền (premium) nhưng con là primary user |

### User Journey

Lấy *Minh (Sinh viên)* làm ví dụ đại diện:

| Giai đoạn | Trải nghiệm | Cảm xúc |
|-----------|-------------|---------|
| *Discovery* | Thấy bạn chia sẻ screenshot level-up trên Instagram story: "Lv.10 rồi nè!". Tò mò click vào link | "Cái gì vậy? Trông cool ghê" |
| *Onboarding* | Đăng ký bằng Google, chọn avatar, thấy mình là "Lv.1 Tân binh". Sidebar hiện 2 tools rõ ràng | "Đơn giản, không cần setup gì nhiều" |
| *First value* | Chạy phiên Pomodoro đầu tiên 25 phút. Hoàn thành → +50 XP, animation nhỏ. XP bar trên sidebar nhích lên | "Ồ, satisfying ghê! Thêm 1 phiên nữa" |
| *Aha moment* | Ngày thứ 3: hoàn thành 4 Pomodoro + check-in 2 habits. Lên Lv.3 → celebration animation → mở badge "Khởi đầu mạnh mẽ" | "Mình thực sự đang tiến bộ! Muốn duy trì streak" |
| *Habit formation* | Tuần thứ 2: mở JL-Tools là thao tác đầu tiên khi mở laptop. Check habits buổi sáng, Pomodoro khi học | "Thiếu nó là thấy thiếu gì đó" |
| *Long-term* | Tháng thứ 2: Lv.15, streak 14 ngày, weekly insight cho thấy focus time tăng 40% so với tháng trước | "App này thay đổi cách mình học. Chia sẻ cho bạn bè thôi!" |

---

## Success Metrics

### User Success Metrics

| Metric | Mục tiêu | Cách đo |
|--------|----------|---------|
| *Activation Rate* | ≥ 60% user mới hoàn thành phiên Pomodoro đầu tiên trong 24h sau đăng ký | pomodoro.sessions WHERE created_at < signup + 24h |
| *Daily Active Usage* | User active dùng ≥ 1 tool/ngày, ít nhất 4 ngày/tuần | DAU / WAU ratio ≥ 57% |
| *Pomodoro Completion Rate* | ≥ 75% phiên focus được hoàn thành (không bị cancel) | sessions status='completed' / total sessions |
| *Habit Streak Retention* | ≥ 30% users duy trì streak ≥ 7 ngày trong tháng đầu | habits.streaks WHERE current_streak ≥ 7 |
| *Cross-tool Engagement* | ≥ 40% users dùng CẢ 2 tools (Pomodoro + Habits) trong cùng tuần | Users có records ở cả 2 schemas trong 7 ngày |
| *Level Progression* | User trung bình đạt Lv.5 sau 2 tuần sử dụng | profiles.current_level theo cohort |

### Business Objectives

*Giai đoạn MVP (0-3 tháng) — Focus: Validate & Engage*

| Objective | Target | Rationale |
|-----------|--------|-----------|
| *Tổng đăng ký* | 500 users | Đủ để validate product-market fit, thu thập feedback có ý nghĩa |
| *Retention D7* | ≥ 40% | Benchmark ngành productivity apps: 25-35%. JL-Tools nhờ gamification nên target cao hơn |
| *Retention D30* | ≥ 20% | Nếu đạt = core loop hoạt động, gamification giữ chân hiệu quả |
| *NPS Score* | ≥ 40 | "Rất có thể giới thiệu cho bạn bè" — đo word-of-mouth potential |
| *Revenue* | Chưa ưu tiên | MVP tập trung 100% vào user value. Monetization ở phase sau |

*Giai đoạn Growth (3-12 tháng) — Focus: Scale & Monetize*

| Objective | Target | Rationale |
|-----------|--------|-----------|
| *Tổng đăng ký* | 5,000 users | Organic growth + referral từ gamification social features |
| *MAU* | 2,000 active users | 40% monthly active rate |
| *Premium conversion* | 5-8% | Freemium model: core free, premium cho advanced analytics, custom themes, extra badges |
| *MRR* | $500-1,000 | Premium plan ~$5/th x 100-200 subscribers |
| *Organic referral* | 30% signups từ referral | Gamification screenshots/level-up sharing tự nhiên tạo viral loop |

### Key Performance Indicators

*KPIs hàng tuần (theo dõi sát):*

| KPI | Formula | Target | Alert nếu |
|-----|---------|--------|-----------|
| *WAU* | Unique users active trong 7 ngày | Tăng 10%/tuần (giai đoạn đầu) | Giảm 2 tuần liên tiếp |
| *Avg. Pomodoro/user/ngày* | Total sessions / DAU | ≥ 3 phiên/ngày | < 1.5 phiên/ngày |
| *Habit check-in rate* | Check-ins / (Active habits x Active users) | ≥ 65% | < 50% |
| *XP earned/user/ngày* | Avg total XP earned per active user per day | ≥ 80 XP | < 40 XP |

*KPIs hàng tháng (đánh giá chiến lược):*

| KPI | Formula | Target |
|-----|---------|--------|
| *Retention curve* | % users quay lại sau D1, D7, D14, D30 | D1: 60%, D7: 40%, D14: 30%, D30: 20% |
| *Feature adoption* | % users dùng từng feature ít nhất 1 lần/tháng | Pomodoro: 90%, Habits: 70%, Badges: 50% |
| *Avg session length* | Thời gian trung bình mỗi lần mở app | ≥ 25 phút 😊 1 Pomodoro) |
| *Churn rate* | % users ngừng dùng trong 30 ngày | < 15%/tháng |

*North Star Metric:*

**"Số phiên Pomodoro hoàn thành + Habit check-ins mỗi tuần trên toàn platform"**

Metric này phản ánh trực tiếp giá trị cốt lõi: người dùng thực sự tập trung hơn và xây dựng thói quen tốt hơn. Nếu con số này tăng = JL-Tools đang tạo ra giá trị thật.


---

## MVP Scope

### Core Features

*1. Platform Foundation*

| Feature | Chi tiết | Lý do MVP |
|---------|---------|-----------|
| *Auth System* | Đăng ký/Đăng nhập bằng Email + Google OAuth | Barrier thấp nhất cho cả 4 nhóm user |
| *Shared Layout* | Sidebar (desktop) + Bottom nav (mobile) với logo, avatar, XP bar, menu items | Shell chung tạo cảm giác "platform", không phải 2 app rời rạc |
| *User Profile* | Display name, avatar, total XP, current level, locale preference | Nền tảng cho gamification system |
| *i18n (vi/en)* | Toàn bộ UI hỗ trợ Tiếng Việt và English, toggle chuyển đổi | Target user chính ở Việt Nam, nhưng mở rộng được quốc tế |
| *Theme System* | Light mode là default; Dark mode toggle trong Settings và Quick Settings | Light mode tốt hơn cho người dùng văn phòng/học tập ban ngày; Dark mode cho buổi tối hoặc người dùng thích aesthetic RPG neon. Cả hai đều được support từ day 1.
| *Responsive Design* | Mobile-first, hoạt động tốt từ 375px trở lên | Sinh viên dùng điện thoại rất nhiều |

*2. Pomodoro App (RPG Focus Timer)*

| Feature | Chi tiết | Lý do MVP |
|---------|---------|-----------|
| *Timer Engine* | Countdown chính xác, chuyển state: focus → short break → focus → ... → long break | Core mechanic, không có thì không có app |
| *Customizable Settings* | Focus duration, short/long break, sessions before long break | Mỗi user có rhythm khác nhau |
| *Focus Mode UI* | Ẩn sidebar, fullscreen-like, chỉ hiện timer + session count + XP preview | Differentiator chính — immersive, zero distraction |
| *Session Persistence* | Ghi record mỗi phiên (completed/cancelled) vào pomodoro.sessions | Cần data để tính XP và analytics |
| *Session Labels* | Gắn label tùy chọn ("Học React", "Viết báo cáo") | Content creator (Linh) cần track từng phase |
| *XP Earning* | Hoàn thành phiên focus → auto grant XP vào hệ thống chung | Core gamification loop |
| *Daily Stats* | Số phiên, tổng phút focus hôm nay | Feedback loop ngắn hạn — user thấy ngay kết quả |

*3. Habit Tracker*

| Feature | Chi tiết | Lý do MVP |
|---------|---------|-----------|
| *Habit CRUD* | Tạo/sửa/xóa/archive habit với name, icon, color | Chức năng cơ bản, không có thì không dùng được |
| *Frequency Config* | Daily, weekly, custom (chọn ngày cụ thể) | Freelancer (Khoa) cần flexible scheduling |
| *Daily Check-in* | Danh sách habits hôm nay, tap để check-in, micro-animation | Core interaction — phải nhanh, satisfying |
| *Streak Tracking* | Auto tính current streak, longest streak, reset khi miss | Proven retention mechanic (Duolingo, Streaks) |
| *Streak UI* | Fire emoji + streak count bên cạnh mỗi habit | Visual motivation, dễ screenshot chia sẻ |
| *XP Earning* | Check-in habit → auto grant XP vào hệ thống chung | Kết nối với Pomodoro qua shared XP |
| *Weekly Progress* | Progress bar % habits completed tuần này | Hà (văn phòng) cần bức tranh tuần |

*4. Shared Gamification System*

| Feature | Chi tiết | Lý do MVP |
|---------|---------|-----------|
| *Unified XP Bar* | Hiển thị trên sidebar, animate khi XP tăng, cập nhật realtime | Tim đập của platform — kết nối mọi tool |
| *Level System* | 20 levels ban đầu, mỗi level có title vi/en + XP threshold | Progression rõ ràng, mục tiêu để hướng tới |
| *Level-up Detection* | Auto detect khi vượt threshold → modal celebration | "Aha moment" — khoảnh khắc satisfying nhất |
| *XP Transaction Log* | Ghi nhận mọi XP earned, source (pomodoro/habits), timestamp | Transparency + data cho analytics sau này |

### Out of Scope for MVP

| Feature | Lý do hoãn | Khi nào thêm |
|---------|-----------|--------------|
| *Badge/Achievement System chi tiết* | XP + Level đủ cho core loop. Badges thêm complexity mà chưa validate được giá trị | Post-MVP Phase 3 |
| *Sound Effects & Ambient Sounds* | Nice-to-have, không ảnh hưởng core value | Post-MVP Phase 4 |
| *Level-up Animations hoành tráng* | MVP cần modal celebration đơn giản. Particle effects/confetti để polish sau | Post-MVP Phase 4 |
| *Weekly/Monthly Insight Reports* | Cần tích lũy đủ data trước (ít nhất 2-4 tuần). Daily stats đủ cho MVP | Post-MVP Phase 3-4 |
| *Social Features* | Leaderboard, chia sẻ streak, challenges — cần user base trước | Growth phase (3-12 tháng) |
| *Notification/Reminder System* | Push notification cho habit reminder — phức tạp trên web, cần PWA hoặc native | Post-MVP Phase 4 |
| *Theme System hoàn chỉnh* | Light/Dark toggle đã nằm trong MVP. Cần polish: system preference detection, smooth transition animation, persistent preference | Polish in MVP Phase 2 |
| *Cross-domain Insights* | "Ngày bạn Pomodoro ≥4 phiên, habit completion cao hơn 60%" — cần data lớn | Growth phase |
| *Team/Social Dashboard* | Secondary users (Team Leader) chưa phải priority MVP | Growth phase |
| *Third-party Integrations* | Google Calendar, Slack, Todoist... — mở rộng sau khi core ổn định | Growth phase |
| *Offline Support / PWA* | Web-first đủ cho MVP. Offline cần service worker phức tạp | Post-MVP |

### MVP Success Criteria

*Go/No-Go Gates — Đánh giá sau 3 tháng launch:*

| Gate | Criteria | Pass nếu | Fail nếu |
|------|----------|----------|----------|
| *User Adoption* | Có đủ người dùng thực sự đăng ký và dùng thử | ≥ 500 signups | < 200 signups |
| *Core Loop Works* | Users hoàn thành Pomodoro + check-in habits → earn XP → quay lại | D7 retention ≥ 40% | D7 retention < 20% |
| *Cross-tool Value* | Shared XP system thực sự khiến users dùng cả 2 tools | ≥ 40% users dùng cả 2 tools/tuần | < 20% |
| *Gamification Effective* | XP/Level motivate users quay lại, không chỉ là gimmick | Avg ≥ 3 Pomodoro/user/ngày active | < 1.5 |
| *User Satisfaction* | Users thấy giá trị thực sự, sẵn sàng giới thiệu | NPS ≥ 40 | NPS < 20 |

*Quyết định dựa trên kết quả:*

- *Pass ≥ 4/5 gates* → Proceed to Growth phase, thêm features, tìm monetization
- *Pass 2-3/5 gates* → Iterate MVP, fix weak areas, chạy thêm 1-2 tháng
- *Pass ≤ 1/5 gates* → Pivot hoặc fundamentally rethink approach

### Future Vision

*Năm 1 (Post-MVP):*

- Badge/Achievement system hoàn chỉnh với seasonal events
- Advanced analytics: cross-domain insights, weekly reports, productivity trends
- Sound design: ambient sounds cho Pomodoro, completion chimes
- Social features: leaderboard bạn bè, chia sẻ achievements
- Notification/Reminder system cho habits
- PWA support cho mobile experience tốt hơn
- Custom theme system: cho phép user tùy chỉnh màu chủ đạo (primary color picker)

*Năm 2 (Platform Expansion):*

- *Tool mới: Task Manager* — Kanban/Todo tích hợp XP, kết nối với Pomodoro labels
- *Tool mới: Journal/Notes* — Reflection hàng ngày, gắn với mood tracking
- *Tool mới: Goal Planner* — OKR cá nhân, kết nối habits → goals → vision
- *Team features* — Workspace cho nhóm, team challenges, manager dashboard
- *API public* — Third-party integrations, Zapier/Make connections

*Năm 3 (Ecosystem):*

- *JL-Tools Mobile App* — Native iOS/Android cho trải nghiệm tối ưu
- *AI-powered Insights* — "Dựa trên pattern của bạn, nên focus lúc 9-11h sáng"
- *Marketplace* — Community-created themes, badge packs, habit templates
- *Enterprise plan* — Company-wide productivity platform
- *Adaptive Gamification* — XP mechanics tự điều chỉnh theo hành vi user, chống "novelty fatigue"