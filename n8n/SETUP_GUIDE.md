# Hướng Dẫn Setup N8N Integration

## 📋 Yêu Cầu

- N8N instance (self-hosted hoặc n8n.cloud)
- Telegram Bot (để nhận thông báo)
- Supabase project đã setup

---

## 🔧 Bước 1: Tạo Telegram Bot

1. Mở Telegram, tìm `@BotFather`
2. Gõ `/newbot` và làm theo hướng dẫn
3. Lưu lại **Bot Token** (dạng `123456:ABC-DEF...`)
4. Gửi tin nhắn cho bot của bạn
5. Truy cập `https://api.telegram.org/bot<TOKEN>/getUpdates` để lấy **Chat ID**

---

## 🔧 Bước 2: Import Workflow vào N8N

1. Mở N8N Dashboard
2. Click **Add Workflow** → **Import from File**
3. Chọn file `n8n/daily_reminder_workflow.json`
4. Workflow sẽ được import

---

## 🔧 Bước 3: Cấu hình Credentials

### Telegram API

1. Vào **Credentials** → **Add Credential**
2. Chọn **Telegram API**
3. Paste **Bot Token** từ Bước 1

### Environment Variables

Vào **Settings** → **Variables**, thêm:

| Variable | Giá trị |
|----------|---------|
| `SUPABASE_URL` | `https://nkjakqtffuowajsmioff.supabase.co` |
| `SUPABASE_ANON_KEY` | (Anon key từ Supabase Dashboard) |
| `TELEGRAM_CHAT_ID` | (Chat ID từ Bước 1) |
| `CRM_URL` | URL của CRM (VD: `https://crm.example.com`) |

---

## 🔧 Bước 4: Test Workflow

1. Click **Execute Workflow** để test
2. Kiểm tra Telegram có nhận được message không
3. Nếu OK, **Activate** workflow

---

## ⏰ Schedule

Workflow mặc định chạy **mỗi ngày lúc 8:00 sáng**.

Để thay đổi:

1. Click vào node **Schedule Trigger**
2. Chỉnh `triggerAtHour` theo giờ mong muốn

---

## 📊 Các RPC Functions có sẵn

| Function | Mô tả |
|----------|-------|
| `get_due_reminders()` | Lấy danh sách khách cần gọi hôm nay |
| `get_upcoming_needs(days_ahead)` | Lấy khách sắp cần SP trong N ngày |
| `count_due_reminders()` | Đếm số khách cần gọi |
| `count_upcoming_needs(days_ahead)` | Đếm khách sắp cần SP |
| `mark_contacted(contact_id, next_reminder)` | Đánh dấu đã liên hệ |

---

## 🔗 API Endpoints cho N8N

Gọi RPC qua HTTP:

```
POST https://<SUPABASE_URL>/rest/v1/rpc/<function_name>

Headers:
  apikey: <SUPABASE_ANON_KEY>
  Authorization: Bearer <SUPABASE_ANON_KEY>
  Content-Type: application/json

Body (nếu có params):
  {"days_ahead": 7}
```

---

## ❓ Troubleshooting

### Không nhận được message Telegram

- Kiểm tra Bot Token và Chat ID
- Đảm bảo đã gửi tin nhắn cho bot trước

### RPC trả về lỗi

- Kiểm tra đã chạy SQL migration chưa
- Kiểm tra Supabase URL và Anon Key

### Workflow không chạy tự động

- Kiểm tra đã Activate workflow chưa
- Kiểm tra timezone của N8N server
