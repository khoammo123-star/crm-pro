// =====================================================
// CRM BACKEND - CONFIGURATION
// =====================================================
// File: Config.gs
// Cấu hình chính cho CRM system
// =====================================================

const CONFIG = {
  // ⚠️ QUAN TRỌNG: Thay bằng ID Google Sheets của bạn
  // Cách lấy ID: Mở Google Sheets -> Copy phần ID trong URL
  // https://docs.google.com/spreadsheets/d/[SPREADSHEET_ID]/edit
  SPREADSHEET_ID: '1rNXdl1WUTt0jLAtnI7JK96gwaohZE3jGgLLI4qWn7LE',
  
  // ⚠️ QUAN TRỌNG: Thay bằng ID folder Google Drive
  // Tạo folder mới trong Drive -> Chuột phải -> Get link -> Copy ID
  DRIVE_FOLDER_ID: 'YOUR_DRIVE_FOLDER_ID_HERE',
  
  // Tên các sheet trong Spreadsheet
  SHEETS: {
    CONTACTS: 'Contacts',
    COMPANIES: 'Companies', 
    DEALS: 'Deals',
    TASKS: 'Tasks',
    NOTES: 'Notes',
    ACTIVITIES: 'Activities',
    SETTINGS: 'Settings'
  },
  
  // Cấu hình phân trang
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
  
  // Các trạng thái Deal (Pipeline stages)
  DEAL_STAGES: [
    { id: 'new', name: 'Mới', color: '#3b82f6' },
    { id: 'qualified', name: 'Đủ điều kiện', color: '#8b5cf6' },
    { id: 'proposal', name: 'Đề xuất', color: '#f59e0b' },
    { id: 'negotiation', name: 'Đàm phán', color: '#f97316' },
    { id: 'won', name: 'Thành công', color: '#10b981' },
    { id: 'lost', name: 'Thất bại', color: '#ef4444' }
  ],
  
  // Trạng thái Contact
  CONTACT_STATUSES: [
    { id: 'lead', name: 'Lead', color: '#3b82f6' },
    { id: 'prospect', name: 'Tiềm năng', color: '#8b5cf6' },
    { id: 'customer', name: 'Khách hàng', color: '#10b981' },
    { id: 'inactive', name: 'Không hoạt động', color: '#6b7280' }
  ],
  
  // Loại Task
  TASK_TYPES: [
    { id: 'call', name: 'Gọi điện', icon: '📞' },
    { id: 'email', name: 'Email', icon: '📧' },
    { id: 'meeting', name: 'Họp', icon: '🤝' },
    { id: 'task', name: 'Công việc', icon: '✅' },
    { id: 'deadline', name: 'Deadline', icon: '⏰' }
  ],
  
  // Độ ưu tiên Task
  TASK_PRIORITIES: [
    { id: 'low', name: 'Thấp', color: '#6b7280' },
    { id: 'medium', name: 'Trung bình', color: '#f59e0b' },
    { id: 'high', name: 'Cao', color: '#f97316' },
    { id: 'urgent', name: 'Khẩn cấp', color: '#ef4444' }
  ],
  
  // Nguồn khách hàng
  SOURCES: [
    'Website',
    'Facebook', 
    'Zalo',
    'Giới thiệu',
    'Triển lãm',
    'Cold Call',
    'Email Marketing',
    'Khác'
  ],
  
  // Ngành nghề
  INDUSTRIES: [
    'Công nghệ',
    'Tài chính - Ngân hàng',
    'Bất động sản',
    'Giáo dục',
    'Y tế - Sức khỏe',
    'Bán lẻ',
    'Sản xuất',
    'Dịch vụ',
    'Khác'
  ]
};

// =====================================================
// HELPER FUNCTIONS
// =====================================================

/**
 * Lấy Spreadsheet theo ID
 */
function getSpreadsheet() {
  return SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
}

/**
 * Lấy sheet theo tên
 */
function getSheet(sheetName) {
  const ss = getSpreadsheet();
  let sheet = ss.getSheetByName(sheetName);
  
  // Tự động tạo sheet nếu chưa có
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
    initializeSheet(sheetName, sheet);
  }
  
  return sheet;
}

/**
 * Khởi tạo headers cho sheet mới
 */
function initializeSheet(sheetName, sheet) {
  const headers = getHeadersForSheet(sheetName);
  if (headers.length > 0) {
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    sheet.getRange(1, 1, 1, headers.length)
      .setBackground('#1f2937')
      .setFontColor('#ffffff')
      .setFontWeight('bold');
    sheet.setFrozenRows(1);
  }
}

/**
 * Lấy headers cho từng sheet
 */
function getHeadersForSheet(sheetName) {
  const headerMap = {
    'Contacts': [
      'id', 'created_at', 'updated_at', 'first_name', 'last_name',
      'email', 'phone', 'company_id', 'position', 'status',
      'source', 'address', 'city', 'notes', 'avatar_url', 'tags'
    ],
    'Companies': [
      'id', 'created_at', 'updated_at', 'name', 'industry',
      'website', 'email', 'phone', 'address', 'city',
      'size', 'revenue', 'logo_url', 'description', 'status'
    ],
    'Deals': [
      'id', 'created_at', 'updated_at', 'title', 'contact_id',
      'company_id', 'value', 'currency', 'stage', 'probability',
      'expected_close', 'actual_close', 'description', 'lost_reason', 'source'
    ],
    'Tasks': [
      'id', 'created_at', 'updated_at', 'title', 'description',
      'type', 'priority', 'status', 'due_date', 'completed_at',
      'contact_id', 'deal_id', 'reminder'
    ],
    'Notes': [
      'id', 'created_at', 'updated_at', 'content', 'contact_id',
      'company_id', 'deal_id', 'attachments'
    ],
    'Activities': [
      'id', 'created_at', 'type', 'entity_type', 'entity_id',
      'description', 'old_value', 'new_value'
    ],
    'Settings': [
      'key', 'value', 'description', 'updated_at'
    ]
  };
  
  return headerMap[sheetName] || [];
}

/**
 * Lấy cấu hình cho frontend
 */
function getConfig() {
  return {
    dealStages: CONFIG.DEAL_STAGES,
    contactStatuses: CONFIG.CONTACT_STATUSES,
    taskTypes: CONFIG.TASK_TYPES,
    taskPriorities: CONFIG.TASK_PRIORITIES,
    sources: CONFIG.SOURCES,
    industries: CONFIG.INDUSTRIES
  };
}
