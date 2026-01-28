# 📊 CRM Pro - Hệ thống Quản lý Khách hàng

CRM Pro là hệ thống quản lý khách hàng (Customer Relationship Management) đơn giản nhưng đầy đủ tính năng, được xây dựng hoàn toàn bằng Google Apps Script và Google Sheets.

## ✨ Tính năng

- **Dashboard**: Thống kê tổng quan, biểu đồ doanh thu, pipeline deals
- **Contacts**: Quản lý liên hệ, tìm kiếm, lọc theo trạng thái
- **Companies**: Quản lý công ty khách hàng
- **Deals**: Pipeline dạng Kanban, kéo thả cập nhật trạng thái
- **Tasks**: Quản lý công việc theo độ ưu tiên và hạn hoàn thành
- **Notes**: Ghi chú cho contacts/companies/deals
- **Files**: Upload và quản lý file đính kèm qua Google Drive

## 🚀 Cài đặt nhanh

### Bước 1: Tạo Google Sheets

1. Truy cập [Google Sheets](https://sheets.google.com)
2. Tạo một Spreadsheet mới
3. Copy **ID** của Spreadsheet từ URL:

   ```
   https://docs.google.com/spreadsheets/d/[SPREADSHEET_ID]/edit
   ```

### Bước 2: Thêm Apps Script

1. Trong Google Sheets, vào **Extensions** → **Apps Script**
2. Xóa code mặc định trong `Code.gs`
3. Tạo các file `.gs` mới và copy code từ thư mục `apps-script/`:
   - `Config.gs`
   - `Utils.gs`
   - `Code.gs`
   - `ContactsAPI.gs`
   - `CompaniesAPI.gs`
   - `DealsAPI.gs`
   - `TasksAPI.gs`
   - `NotesAPI.gs`
   - `DashboardAPI.gs`
   - `DriveAPI.gs`

### Bước 3: Cấu hình

1. Mở file `Config.gs`
2. Thay `YOUR_SPREADSHEET_ID` bằng ID thật của bạn:

   ```javascript
   SPREADSHEET_ID: 'YOUR_SPREADSHEET_ID',
   ```

### Bước 4: Deploy Web App

1. Trong Apps Script, click **Deploy** → **New deployment**
2. Chọn type: **Web app**
3. Cấu hình:
   - **Execute as**: Me (your account)
   - **Who has access**: Anyone
4. Click **Deploy**
5. Copy **Web app URL**

### Bước 5: Khởi tạo Database

1. Trong Apps Script, chạy function `initializeDatabase()` một lần
2. Điều này sẽ tạo các sheets cần thiết trong Spreadsheet

### Bước 6: Chạy Frontend

1. Mở file `index.html` trong thư mục gốc
2. Paste Web app URL vào ô cài đặt
3. Bắt đầu sử dụng!

## 📁 Cấu trúc thư mục

```
crm/
├── index.html              # Trang chính
├── styles/
│   ├── variables.css       # CSS variables và design tokens
│   ├── main.css            # Styles cơ bản
│   ├── components.css      # Buttons, forms, cards, etc.
│   ├── layout.css          # Sidebar, header, layout
│   └── pages.css           # Styles cho từng page
├── js/
│   ├── config.js           # Cấu hình client
│   ├── api.js              # API client
│   ├── utils.js            # Utility functions
│   ├── components.js       # UI components
│   ├── app.js              # Main application
│   └── pages/
│       ├── dashboard.js
│       ├── contacts.js
│       ├── companies.js
│       ├── deals.js
│       └── tasks.js
└── apps-script/            # Backend code
    ├── Config.gs
    ├── Utils.gs
    ├── Code.gs
    ├── ContactsAPI.gs
    ├── CompaniesAPI.gs
    ├── DealsAPI.gs
    ├── TasksAPI.gs
    ├── NotesAPI.gs
    ├── DashboardAPI.gs
    └── DriveAPI.gs
```

## 🎨 Tính năng UI

- **Dark Mode**: Nhấn icon mặt trăng để chuyển theme
- **Responsive**: Hoạt động tốt trên mobile
- **Keyboard Shortcuts**:
  - `Ctrl+K`: Focus vào ô tìm kiếm
  - `Esc`: Đóng modal

## 📝 API Endpoints

### Contacts

- `getContacts` - Lấy danh sách liên hệ
- `getContact` - Lấy chi tiết liên hệ
- `createContact` - Tạo liên hệ mới
- `updateContact` - Cập nhật liên hệ
- `deleteContact` - Xóa liên hệ
- `searchContacts` - Tìm kiếm liên hệ

### Companies

- `getCompanies` - Lấy danh sách công ty
- `getCompany` - Lấy chi tiết công ty
- `createCompany` - Tạo công ty mới
- `updateCompany` - Cập nhật công ty
- `deleteCompany` - Xóa công ty

### Deals

- `getDeals` - Lấy danh sách deals
- `getDeal` - Lấy chi tiết deal
- `createDeal` - Tạo deal mới
- `updateDeal` - Cập nhật deal
- `updateDealStage` - Cập nhật stage (kéo thả)
- `deleteDeal` - Xóa deal
- `getDealsPipeline` - Lấy pipeline view

### Tasks

- `getTasks` - Lấy danh sách công việc
- `getTask` - Lấy chi tiết công việc
- `createTask` - Tạo công việc mới
- `updateTask` - Cập nhật công việc
- `completeTask` - Đánh dấu hoàn thành
- `deleteTask` - Xóa công việc
- `getOverdueTasks` - Lấy tasks quá hạn
- `getTodayTasks` - Lấy tasks hôm nay

### Dashboard

- `getDashboardStats` - Thống kê tổng quan
- `getRecentActivities` - Hoạt động gần đây

## 🔧 Tùy chỉnh

### Thêm trường mới cho entity

1. Thêm column vào sheet tương ứng
2. Cập nhật `COLUMNS` trong `Config.gs`
3. Cập nhật form trong frontend

### Thay đổi stages của deals

Sửa trong `Config.gs`:

```javascript
DEAL_STAGES: [
  { id: 'new', name: 'Mới', color: '#3b82f6' },
  // Thêm/sửa stages
]
```

## ⚠️ Lưu ý

- Dữ liệu được lưu trữ trên Google Sheets của bạn
- Giới hạn Google Sheets: ~5 triệu cells
- Phù hợp cho doanh nghiệp nhỏ (< 10,000 contacts)
- Tốc độ API phụ thuộc vào Google Apps Script quotas

## 📄 License

MIT License - Tự do sử dụng và chỉnh sửa.
