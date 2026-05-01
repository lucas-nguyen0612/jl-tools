# Translation Key Naming Convention Guide

**Author:** Paige (Technical Writer)
**Scope:** All translation keys in `messages/en.json` and `messages/vi.json` (next-intl)
**Goal:** Clarity is the cheapest investment for future-you. Solo dev sau 3 tháng vẫn nhớ key nằm ở đâu.

---

## 1. Cấu trúc namespace top-level

**Quy tắc:** 1 namespace = 1 **surface** (route/khu vực UI logic), KHÔNG phải 1 component. Component refactor liên tục, surface thì stable.

| Namespace | Surface |
|-----------|---------|
| `common` | Shared strings (Save, Cancel, Loading, Delete) |
| `auth` | `/sign-in`, `/sign-up`, `/auth/forgot-password`, `/auth/update-password` |
| `landing` | `/` |
| `nav` | Sidebar, top nav, breadcrumbs |
| `pomodoro` | `/pomodoro` |
| `habits` | `/habits` |
| `profile` | `/profile` |
| `settings` | `/settings/account`, `/settings/notifications` |
| `errors` | Error codes mapping (auth, validation, network) |

```json
{
  "common": { "save": "...", "cancel": "...", "loading": "..." },
  "auth": { "signIn": { ... }, "signUp": { ... } },
  "landing": { "hero": { ... } },
  "nav": { "sidebar": { ... } },
  "errors": { "auth": { ... }, "validation": { ... } }
}
```

---

## 2. Naming convention — 5 rules

### Rule 1 — dot.notation + camelCase segments
`auth.signIn.title` ✅ — không dùng `auth.sign-in.title` hay `auth_sign_in_title`.

### Rule 2 — leaf key = role của string, không phải nội dung
Leaf chuẩn: `title`, `subtitle`, `description`, `cta`, `label`, `placeholder`, `helpText`, `errorMessage`, `successMessage`, `emptyState`. Đọc key biết ngay string đóng vai trò gì trong UI.

### Rule 3 — shared strings ở `common.*`, không duplicate
`common.save`, `common.cancel`, `common.loading` — KHÔNG có `auth.signIn.cancelButton` rồi `settings.account.cancelButton` nữa.

### Rule 4 — dynamic content dùng ICU MessageFormat
```json
"pomodoro.session.completed": "Đã hoàn thành {count, plural, one {# phiên} other {# phiên}}"
```
Key đặt theo template/ngữ cảnh, không hardcode số trong key.

### Rule 5 — error keys map theo `error.code`, không phải raw message
`errors.auth.invalidCredentials` ✅ — KHÔNG `errors.invalidLoginEmailOrPassword`. Khi message thay đổi, key vẫn ổn định.

---

## 3. Anti-patterns — DO NOT

- ❌ `landing.h1`, `landing.h2` — đặt theo HTML tag, không phải role.
- ❌ `signInPageTitle` — flat, không nested namespace.
- ❌ `auth.signIn.signInButton` — repeat namespace trong leaf (đã ở `auth.signIn` rồi, leaf chỉ cần `submit`).
- ❌ `auth.signIn.title.welcome` — quá 3 levels nesting.
- ❌ `auth.dangNhap.title` — translate keys. **Keys luôn EN**, value mới translate.

---

## 4. Worked example — `auth.signIn`

**`messages/en.json`:**
```json
{
  "auth": {
    "signIn": {
      "title": "Welcome back",
      "subtitle": "Sign in to continue your focus journey",
      "email": {
        "label": "Email",
        "placeholder": "you@example.com"
      },
      "password": {
        "label": "Password",
        "placeholder": "Enter your password"
      },
      "submit": "Sign in",
      "forgotPasswordLink": "Forgot password?",
      "noAccountText": "Don't have an account?",
      "signUpLink": "Sign up",
      "errors": {
        "invalidCredentials": "Invalid email or password",
        "emailNotConfirmed": "Please confirm your email first"
      }
    }
  }
}
```

**`messages/vi.json`:**
```json
{
  "auth": {
    "signIn": {
      "title": "Chào mừng trở lại",
      "subtitle": "Đăng nhập để tiếp tục hành trình tập trung",
      "email": {
        "label": "Email",
        "placeholder": "ban@example.com"
      },
      "password": {
        "label": "Mật khẩu",
        "placeholder": "Nhập mật khẩu"
      },
      "submit": "Đăng nhập",
      "forgotPasswordLink": "Quên mật khẩu?",
      "noAccountText": "Chưa có tài khoản?",
      "signUpLink": "Đăng ký",
      "errors": {
        "invalidCredentials": "Email hoặc mật khẩu không đúng",
        "emailNotConfirmed": "Vui lòng xác nhận email trước"
      }
    }
  }
}
```

> Cấu trúc key **giống hệt** giữa `en` và `vi` — chỉ value khác.

---

## 5. PR review checklist

- [ ] Mỗi key mới có **cả** `en` + `vi` (CI fail nếu thiếu — Story 6.6 setup).
- [ ] Không hardcoded string trong JSX:
  ```bash
  grep -rE '>[A-Z][a-z]+ ' src/app src/components
  ```
- [ ] Key naming theo convention (KHÔNG `landing.h1`, `signInTitle`).
- [ ] Shared strings ở `common.*`, không duplicate vào feature.
- [ ] Dynamic content dùng ICU plural/select khi liên quan số/giới tính.
- [ ] Max 3 levels nesting.

---

## 6. Cập nhật convention thế nào

Nếu sau 2 tháng thấy convention không ổn → **sửa document này TRƯỚC**, sau đó refactor keys một lần. **Đừng sửa keys ad-hoc** trong từng PR — đó chính là cách chaos quay lại. Convention là single source of truth; keys chỉ là implementation của nó.

---

## TL;DR

- **Namespace** = surface (stable), không phải component.
- **Leaf** = role của string (`title`, `cta`, `label`, ...).
- **Shared** strings ở `common.*`.
- **Errors** map theo `error.code`.
- **Keys** luôn EN, value mới translate.
- Max **3 levels** nesting.

Solo dev 3 tháng sau mở `messages/en.json` đọc key là biết ngay nó hiện ở đâu, đóng vai trò gì.
