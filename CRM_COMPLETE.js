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
// =====================================================
// CRM BACKEND - UTILITIES
// =====================================================
// File: Utils.gs
// Các hàm tiện ích dùng chung
// =====================================================

const Utils = {
  
  // ===== CACHING (Tăng tốc đáng kể) =====
  
  /**
   * Lấy data từ cache
   */
  getCache(key) {
    const cache = CacheService.getScriptCache();
    const cached = cache.get(key);
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch (e) {
        return null;
      }
    }
    return null;
  },
  
  /**
   * Lưu data vào cache (mặc định 5 phút)
   */
  setCache(key, data, seconds = 300) {
    const cache = CacheService.getScriptCache();
    try {
      cache.put(key, JSON.stringify(data), seconds);
    } catch (e) {
      // Data quá lớn, bỏ qua cache
      Logger.log('Cache error: ' + e.message);
    }
  },
  
  /**
   * Xóa cache
   */
  clearCache(key) {
    const cache = CacheService.getScriptCache();
    if (key) {
      cache.remove(key);
    } else {
      // Xóa các cache phổ biến
      cache.removeAll(['contacts', 'companies', 'deals', 'tasks', 'dashboard', 'config']);
    }
  },
  
  /**
   * Tạo UUID mới
   */
  generateId() {
    return Utilities.getUuid();
  },
  
  /**
   * Lấy thời gian hiện tại ISO format
   */
  now() {
    return new Date().toISOString();
  },
  
  /**
   * Format ngày tiếng Việt
   */
  formatDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit', 
      year: 'numeric'
    });
  },
  
  /**
   * Format tiền tệ VNĐ
   */
  formatCurrency(amount) {
    if (!amount) return '0 ₫';
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  },
  
  /**
   * Chuyển row array thành object
   */
  rowToObject(headers, row) {
    const obj = {};
    headers.forEach((header, index) => {
      let value = row[index];
      // Chuyển Date object thành ISO string
      if (value instanceof Date) {
        value = value.toISOString();
      }
      obj[header] = value !== undefined && value !== '' ? value : null;
    });
    return obj;
  },
  
  /**
   * Chuyển object thành row array
   */
  objectToRow(headers, obj) {
    return headers.map(header => {
      const value = obj[header];
      return value !== undefined && value !== null ? value : '';
    });
  },
  
  /**
   * Lấy toàn bộ data từ sheet dạng objects
   */
  getSheetData(sheetName) {
    const sheet = getSheet(sheetName);
    const data = sheet.getDataRange().getValues();
    
    if (data.length < 2) return [];
    
    const headers = data[0];
    return data.slice(1)
      .filter(row => row[0]) // Bỏ qua row trống
      .map(row => this.rowToObject(headers, row));
  },
  
  /**
   * Tìm row index theo ID
   */
  findRowById(sheetName, id) {
    const sheet = getSheet(sheetName);
    const data = sheet.getDataRange().getValues();
    
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === id) {
        return i + 1; // 1-indexed
      }
    }
    return -1;
  },
  
  /**
   * Lấy headers của sheet
   */
  getHeaders(sheetName) {
    const sheet = getSheet(sheetName);
    return sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  },
  
  /**
   * Phân trang data
   */
  paginate(data, page, limit) {
    const total = data.length;
    const totalPages = Math.ceil(total / limit) || 1;
    const startIndex = (page - 1) * limit;
    const items = data.slice(startIndex, startIndex + limit);
    
    return {
      items,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    };
  },
  
  /**
   * Lọc data theo điều kiện
   */
  applyFilters(data, filters) {
    if (!filters || Object.keys(filters).length === 0) return data;
    
    return data.filter(item => {
      for (const [key, value] of Object.entries(filters)) {
        if (value === '' || value === null || value === undefined) continue;
        
        const itemValue = item[key];
        if (itemValue === null || itemValue === undefined) return false;
        
        // So sánh string (không phân biệt hoa thường)
        if (typeof value === 'string') {
          if (!String(itemValue).toLowerCase().includes(value.toLowerCase())) {
            return false;
          }
        } else if (itemValue !== value) {
          return false;
        }
      }
      return true;
    });
  },
  
  /**
   * Sắp xếp data
   */
  applySort(data, sortBy, sortOrder = 'desc') {
    if (!sortBy) return data;
    
    return [...data].sort((a, b) => {
      let valA = a[sortBy];
      let valB = b[sortBy];
      
      // Handle null values
      if (valA === null) valA = '';
      if (valB === null) valB = '';
      
      // Sort numbers
      if (typeof valA === 'number' && typeof valB === 'number') {
        return sortOrder === 'asc' ? valA - valB : valB - valA;
      }
      
      // Sort strings
      const strA = String(valA).toLowerCase();
      const strB = String(valB).toLowerCase();
      
      if (strA < strB) return sortOrder === 'asc' ? -1 : 1;
      if (strA > strB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  },
  
  /**
   * Tìm kiếm full-text trong nhiều fields
   */
  searchInFields(data, searchTerm, fields) {
    if (!searchTerm) return data;
    
    const term = searchTerm.toLowerCase();
    
    return data.filter(item => {
      return fields.some(field => {
        const value = item[field];
        if (value === null || value === undefined) return false;
        return String(value).toLowerCase().includes(term);
      });
    });
  },
  
  /**
   * Validate email
   */
  isValidEmail(email) {
    if (!email) return false;
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  },
  
  /**
   * Validate phone (Vietnam format)
   */
  isValidPhone(phone) {
    if (!phone) return false;
    const cleaned = phone.replace(/\D/g, '');
    return cleaned.length >= 10 && cleaned.length <= 11;
  },
  
  /**
   * Sanitize input
   */
  sanitize(value) {
    if (typeof value !== 'string') return value;
    return value.trim();
  },
  
  /**
   * Deep clone object
   */
  clone(obj) {
    return JSON.parse(JSON.stringify(obj));
  }
};
// =====================================================
// CRM BACKEND - MAIN ROUTER
// =====================================================
// File: Code.gs  
// Entry point và routing cho tất cả API requests
// =====================================================

/**
 * Serve HTML frontend khi không có action parameter
 */
function doGet(e) {
  // Nếu có action parameter, xử lý như API
  if (e && e.parameter && e.parameter.action) {
    return handleRequest(e, 'GET');
  }
  
  // Serve HTML frontend
  return HtmlService.createTemplateFromFile('Index')
    .evaluate()
    .setTitle('CRM Pro - Quản lý khách hàng')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

/**
 * Include file helper cho HTML templates
 */
function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

/**
 * Handler cho google.script.run từ client
 */
function handleClientRequest(action, data) {
  try {
    return routeAction(action, data || {});
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Route action to appropriate handler
 */
function routeAction(action, data) {
  switch(action) {
    case 'getConfig':
      return { success: true, data: getConfig() };
    case 'testConnection':
      return { success: true, message: 'Connection OK', timestamp: Utils.now() };
    case 'getDashboardStats':
      return DashboardAPI.getStats();
    case 'getRecentActivities':
      return DashboardAPI.getRecentActivities(data);
    case 'getContacts':
      return ContactsAPI.getAll(data);
    case 'getContact':
      return ContactsAPI.getById(data.id);
    case 'createContact':
      Utils.clearCache('contacts');
      Utils.clearCache('dashboard_stats');
      const contactResult = ContactsAPI.create(data);
      // Gọi n8n webhook nếu có cấu hình
      triggerWebhook('contact.created', contactResult.data);
      return contactResult;
    case 'updateContact':
      Utils.clearCache('contacts');
      Utils.clearCache('dashboard_stats');
      return ContactsAPI.update(data.id, data);
    case 'deleteContact':
      Utils.clearCache('contacts');
      Utils.clearCache('dashboard_stats');
      return ContactsAPI.delete(data.id);
    case 'getCompanies':
      return CompaniesAPI.getAll(data);
    case 'getCompany':
      return CompaniesAPI.getById(data.id);
    case 'createCompany':
      Utils.clearCache('companies');
      Utils.clearCache('dashboard_stats');
      const companyResult = CompaniesAPI.create(data);
      triggerWebhook('company.created', companyResult.data);
      return companyResult;
    case 'updateCompany':
      Utils.clearCache('companies');
      Utils.clearCache('dashboard_stats');
      return CompaniesAPI.update(data.id, data);
    case 'deleteCompany':
      Utils.clearCache('companies');
      Utils.clearCache('dashboard_stats');
      return CompaniesAPI.delete(data.id);
    case 'getDeals':
      return DealsAPI.getAll(data);
    case 'getDeal':
      return DealsAPI.getById(data.id);
    case 'createDeal':
      Utils.clearCache('deals');
      Utils.clearCache('dashboard_stats');
      const dealResult = DealsAPI.create(data);
      triggerWebhook('deal.created', dealResult.data);
      return dealResult;
    case 'updateDeal':
      Utils.clearCache('deals');
      Utils.clearCache('dashboard_stats');
      return DealsAPI.update(data.id, data);
    case 'updateDealStage':
      Utils.clearCache('deals');
      Utils.clearCache('dashboard_stats');
      const stageResult = DealsAPI.updateStage(data.id, data.stage);
      triggerWebhook('deal.stage_changed', { id: data.id, stage: data.stage });
      return stageResult;
    case 'deleteDeal':
      Utils.clearCache('deals');
      Utils.clearCache('dashboard_stats');
      return DealsAPI.delete(data.id);
    case 'getDealsPipeline':
      return DealsAPI.getPipeline();
    case 'getTasks':
      return TasksAPI.getAll(data);
    case 'getTask':
      return TasksAPI.getById(data.id);
    case 'createTask':
      Utils.clearCache('tasks');
      Utils.clearCache('dashboard_stats');
      const taskResult = TasksAPI.create(data);
      triggerWebhook('task.created', taskResult.data);
      return taskResult;
    case 'updateTask':
      Utils.clearCache('tasks');
      Utils.clearCache('dashboard_stats');
      return TasksAPI.update(data.id, data);
    case 'completeTask':
      Utils.clearCache('tasks');
      Utils.clearCache('dashboard_stats');
      const completeResult = TasksAPI.complete(data.id);
      triggerWebhook('task.completed', { id: data.id });
      return completeResult;
    case 'deleteTask':
      Utils.clearCache('tasks');
      Utils.clearCache('dashboard_stats');
      return TasksAPI.delete(data.id);
    case 'getOverdueTasks':
      return TasksAPI.getOverdue();
    case 'getTodayTasks':
      return TasksAPI.getToday();
    
    // ===== n8n & Webhook Integration =====
    case 'webhook':
      return handleExternalWebhook(data);
    case 'clearCache':
      Utils.clearCache();
      return { success: true, message: 'Cache cleared' };
    case 'setWebhookUrl':
      return setWebhookUrl(data.url);
    case 'getWebhookUrl':
      return { success: true, url: getWebhookUrl() };
      
    default:
      return { success: false, error: 'Unknown action: ' + action };
  }
}

/**
 * Xử lý webhook từ bên ngoài (n8n, Zapier, etc.)
 */
function handleExternalWebhook(data) {
  try {
    const event = data.event;
    const payload = data.payload || data;
    
    switch(event) {
      case 'contact.create':
        return ContactsAPI.create(payload);
      case 'deal.create':
        return DealsAPI.create(payload);
      case 'task.create':
        return TasksAPI.create(payload);
      case 'company.create':
        return CompaniesAPI.create(payload);
      default:
        return { success: false, error: 'Unknown webhook event: ' + event };
    }
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Gọi webhook n8n khi có sự kiện
 */
function triggerWebhook(event, data) {
  const webhookUrl = getWebhookUrl();
  if (!webhookUrl) return;
  
  try {
    UrlFetchApp.fetch(webhookUrl, {
      method: 'POST',
      contentType: 'application/json',
      payload: JSON.stringify({
        event: event,
        data: data,
        timestamp: Utils.now()
      }),
      muteHttpExceptions: true
    });
  } catch (e) {
    Logger.log('Webhook error: ' + e.message);
  }
}

/**
 * Lưu URL webhook n8n
 */
function setWebhookUrl(url) {
  const props = PropertiesService.getScriptProperties();
  props.setProperty('WEBHOOK_URL', url);
  return { success: true, message: 'Webhook URL saved' };
}

/**
 * Lấy URL webhook n8n
 */
function getWebhookUrl() {
  const props = PropertiesService.getScriptProperties();
  return props.getProperty('WEBHOOK_URL') || '';
}

/**
 * Xử lý POST requests
 */
function doPost(e) {
  return handleRequest(e, 'POST');
}

/**
 * Router chính - định tuyến request đến handler phù hợp
 */
function handleRequest(e, method) {
  let callback = null;
  
  try {
    let action, data;
    
    if (method === 'GET') {
      action = e.parameter.action;
      callback = e.parameter.callback; // JSONP callback
      data = e.parameter;
    } else {
      const body = JSON.parse(e.postData.contents);
      action = body.action;
      data = body.data || body;
    }
    
    if (!action) {
      return jsonpResponse({ 
        success: false, 
        error: 'Missing action parameter' 
      }, callback);
    }
    
    let result;
    
    // ===== ROUTING =====
    switch(action) {
      
      // ----- Config -----
      case 'getConfig':
        result = { success: true, data: getConfig() };
        break;
      
      // ----- Dashboard -----
      case 'getDashboardStats':
        result = DashboardAPI.getStats();
        break;
      case 'getRecentActivities':
        result = DashboardAPI.getRecentActivities(data);
        break;
      
      // ----- Contacts -----
      case 'getContacts':
        result = ContactsAPI.getAll(data);
        break;
      case 'getContact':
        result = ContactsAPI.getById(data.id || data);
        break;
      case 'createContact':
        result = ContactsAPI.create(data);
        break;
      case 'updateContact':
        result = ContactsAPI.update(data.id, data);
        break;
      case 'deleteContact':
        result = ContactsAPI.delete(data.id || data);
        break;
      case 'searchContacts':
        result = ContactsAPI.search(data);
        break;
      
      // ----- Companies -----
      case 'getCompanies':
        result = CompaniesAPI.getAll(data);
        break;
      case 'getCompany':
        result = CompaniesAPI.getById(data.id || data);
        break;
      case 'createCompany':
        result = CompaniesAPI.create(data);
        break;
      case 'updateCompany':
        result = CompaniesAPI.update(data.id, data);
        break;
      case 'deleteCompany':
        result = CompaniesAPI.delete(data.id || data);
        break;
      
      // ----- Deals -----
      case 'getDeals':
        result = DealsAPI.getAll(data);
        break;
      case 'getDeal':
        result = DealsAPI.getById(data.id || data);
        break;
      case 'createDeal':
        result = DealsAPI.create(data);
        break;
      case 'updateDeal':
        result = DealsAPI.update(data.id, data);
        break;
      case 'updateDealStage':
        result = DealsAPI.updateStage(data.id, data.stage);
        break;
      case 'deleteDeal':
        result = DealsAPI.delete(data.id || data);
        break;
      case 'getDealsPipeline':
        result = DealsAPI.getPipeline();
        break;
      
      // ----- Tasks -----
      case 'getTasks':
        result = TasksAPI.getAll(data);
        break;
      case 'getTask':
        result = TasksAPI.getById(data.id || data);
        break;
      case 'createTask':
        result = TasksAPI.create(data);
        break;
      case 'updateTask':
        result = TasksAPI.update(data.id, data);
        break;
      case 'completeTask':
        result = TasksAPI.complete(data.id || data);
        break;
      case 'deleteTask':
        result = TasksAPI.delete(data.id || data);
        break;
      case 'getOverdueTasks':
        result = TasksAPI.getOverdue();
        break;
      case 'getTodayTasks':
        result = TasksAPI.getToday();
        break;
      
      // ----- Notes -----
      case 'getNotes':
        result = NotesAPI.getAll(data);
        break;
      case 'createNote':
        result = NotesAPI.create(data);
        break;
      case 'updateNote':
        result = NotesAPI.update(data.id, data);
        break;
      case 'deleteNote':
        result = NotesAPI.delete(data.id || data);
        break;
      
      // ----- Files (Drive) -----
      case 'uploadFile':
        result = DriveAPI.upload(data);
        break;
      case 'getFiles':
        result = DriveAPI.getFiles(data);
        break;
      case 'deleteFile':
        result = DriveAPI.deleteFile(data.fileId || data);
        break;
      
      // ----- Setup -----
      case 'initializeDatabase':
        result = initializeDatabase();
        break;
      case 'testConnection':
        result = { success: true, message: 'Connection OK', timestamp: Utils.now() };
        break;
      
      default:
        result = { 
          success: false, 
          error: 'Unknown action: ' + action,
          availableActions: getAvailableActions()
        };
    }
    
    return jsonpResponse(result, callback);
    
  } catch (error) {
    Logger.log('Error: ' + error.toString());
    Logger.log('Stack: ' + error.stack);
    
    return jsonpResponse({ 
      success: false, 
      error: error.message,
      stack: error.stack 
    }, callback);
  }
}

/**
 * Trả về JSONP response hoặc JSON response
 */
function jsonpResponse(data, callback) {
  const jsonStr = JSON.stringify(data);
  
  if (callback) {
    // JSONP response - wrap in callback function
    return ContentService
      .createTextOutput(`${callback}(${jsonStr});`)
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  } else {
    // Regular JSON response
    return ContentService
      .createTextOutput(jsonStr)
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Lấy danh sách actions khả dụng
 */
function getAvailableActions() {
  return [
    // Config
    'getConfig', 'testConnection', 'initializeDatabase',
    // Dashboard
    'getDashboardStats', 'getRecentActivities',
    // Contacts
    'getContacts', 'getContact', 'createContact', 'updateContact', 'deleteContact', 'searchContacts',
    // Companies  
    'getCompanies', 'getCompany', 'createCompany', 'updateCompany', 'deleteCompany',
    // Deals
    'getDeals', 'getDeal', 'createDeal', 'updateDeal', 'updateDealStage', 'deleteDeal', 'getDealsPipeline',
    // Tasks
    'getTasks', 'getTask', 'createTask', 'updateTask', 'completeTask', 'deleteTask', 'getOverdueTasks', 'getTodayTasks',
    // Notes
    'getNotes', 'createNote', 'updateNote', 'deleteNote',
    // Files
    'uploadFile', 'getFiles', 'deleteFile'
  ];
}

/**
 * Khởi tạo database - tạo tất cả sheets với headers
 */
function initializeDatabase() {
  try {
    const sheets = Object.values(CONFIG.SHEETS);
    const created = [];
    
    sheets.forEach(sheetName => {
      getSheet(sheetName); // Tự động tạo nếu chưa có
      created.push(sheetName);
    });
    
    return {
      success: true,
      message: 'Database initialized successfully',
      sheets: created
    };
    
  } catch (error) {
    return {
      success: false,
      error: 'Failed to initialize: ' + error.message
    };
  }
}

/**
 * Test function - chạy trong Apps Script editor để test
 */
function testAPI() {
  // Test connection
  Logger.log('Testing connection...');
  Logger.log(JSON.stringify(handleRequest({ parameter: { action: 'testConnection' }}, 'GET')));
  
  // Test get config
  Logger.log('Getting config...');
  Logger.log(JSON.stringify(getConfig()));
}
// =====================================================
// CRM BACKEND - CONTACTS API
// =====================================================
// File: ContactsAPI.gs
// CRUD operations cho Contacts (Liên hệ)
// =====================================================

const ContactsAPI = {
  
  SHEET_NAME: CONFIG.SHEETS.CONTACTS,
  SEARCH_FIELDS: ['first_name', 'last_name', 'email', 'phone', 'position', 'notes', 'tags'],
  
  /**
   * Lấy danh sách contacts có phân trang và filter
   */
  getAll(params = {}) {
    try {
      const page = parseInt(params.page) || 1;
      const limit = Math.min(
        parseInt(params.limit) || CONFIG.DEFAULT_PAGE_SIZE,
        CONFIG.MAX_PAGE_SIZE
      );
      
      // Lấy data
      let contacts = Utils.getSheetData(this.SHEET_NAME);
      
      // Tìm kiếm
      if (params.search) {
        contacts = Utils.searchInFields(contacts, params.search, this.SEARCH_FIELDS);
      }
      
      // Lọc theo điều kiện
      const filters = {
        status: params.status,
        company_id: params.company_id,
        source: params.source
      };
      contacts = Utils.applyFilters(contacts, filters);
      
      // Sắp xếp
      const sortBy = params.sortBy || 'created_at';
      const sortOrder = params.sortOrder || 'desc';
      contacts = Utils.applySort(contacts, sortBy, sortOrder);
      
      // Phân trang
      const result = Utils.paginate(contacts, page, limit);
      
      // Thêm thông tin company nếu có
      const companies = Utils.getSheetData(CONFIG.SHEETS.COMPANIES);
      result.items = result.items.map(contact => ({
        ...contact,
        company: companies.find(c => c.id === contact.company_id) || null
      }));
      
      return {
        success: true,
        data: result.items,
        pagination: result.pagination
      };
      
    } catch (error) {
      return { success: false, error: error.message };
    }
  },
  
  /**
   * Lấy chi tiết một contact theo ID
   */
  getById(id) {
    try {
      const contacts = Utils.getSheetData(this.SHEET_NAME);
      const contact = contacts.find(c => c.id === id);
      
      if (!contact) {
        return { success: false, error: 'Không tìm thấy liên hệ' };
      }
      
      // Lấy thông tin liên quan
      const companies = Utils.getSheetData(CONFIG.SHEETS.COMPANIES);
      const notes = Utils.getSheetData(CONFIG.SHEETS.NOTES)
        .filter(n => n.contact_id === id)
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      const tasks = Utils.getSheetData(CONFIG.SHEETS.TASKS)
        .filter(t => t.contact_id === id);
      const deals = Utils.getSheetData(CONFIG.SHEETS.DEALS)
        .filter(d => d.contact_id === id);
      
      return {
        success: true,
        data: {
          ...contact,
          company: companies.find(c => c.id === contact.company_id) || null,
          notes,
          tasks,
          deals,
          stats: {
            totalDeals: deals.length,
            wonDeals: deals.filter(d => d.stage === 'won').length,
            totalValue: deals.reduce((sum, d) => sum + (parseFloat(d.value) || 0), 0),
            pendingTasks: tasks.filter(t => t.status !== 'completed').length
          }
        }
      };
      
    } catch (error) {
      return { success: false, error: error.message };
    }
  },
  
  /**
   * Tạo contact mới
   */
  create(data) {
    try {
      // Validation
      if (!data.first_name) {
        return { success: false, error: 'Vui lòng nhập tên' };
      }
      
      if (data.email && !Utils.isValidEmail(data.email)) {
        return { success: false, error: 'Email không hợp lệ' };
      }
      
      // Kiểm tra email trùng
      if (data.email) {
        const contacts = Utils.getSheetData(this.SHEET_NAME);
        if (contacts.some(c => c.email === data.email)) {
          return { success: false, error: 'Email đã tồn tại trong hệ thống' };
        }
      }
      
      // Tạo contact mới
      const newContact = {
        id: Utils.generateId(),
        created_at: Utils.now(),
        updated_at: Utils.now(),
        first_name: Utils.sanitize(data.first_name),
        last_name: Utils.sanitize(data.last_name) || '',
        email: Utils.sanitize(data.email) || '',
        phone: Utils.sanitize(data.phone) || '',
        company_id: data.company_id || '',
        position: Utils.sanitize(data.position) || '',
        status: data.status || 'lead',
        source: data.source || '',
        address: Utils.sanitize(data.address) || '',
        city: Utils.sanitize(data.city) || '',
        notes: Utils.sanitize(data.notes) || '',
        avatar_url: data.avatar_url || '',
        tags: data.tags || ''
      };
      
      // Lưu vào sheet
      const sheet = getSheet(this.SHEET_NAME);
      const headers = Utils.getHeaders(this.SHEET_NAME);
      const newRow = Utils.objectToRow(headers, newContact);
      sheet.appendRow(newRow);
      
      // Log activity
      this.logActivity('create', newContact.id, 'Tạo liên hệ mới: ' + newContact.first_name);
      
      return {
        success: true,
        data: newContact,
        message: 'Tạo liên hệ thành công'
      };
      
    } catch (error) {
      return { success: false, error: error.message };
    }
  },
  
  /**
   * Cập nhật contact
   */
  update(id, data) {
    try {
      const sheet = getSheet(this.SHEET_NAME);
      const rowIndex = Utils.findRowById(this.SHEET_NAME, id);
      
      if (rowIndex === -1) {
        return { success: false, error: 'Không tìm thấy liên hệ' };
      }
      
      // Lấy data hiện tại
      const headers = Utils.getHeaders(this.SHEET_NAME);
      const currentRow = sheet.getRange(rowIndex, 1, 1, headers.length).getValues()[0];
      const currentContact = Utils.rowToObject(headers, currentRow);
      
      // Kiểm tra email trùng (nếu thay đổi email)
      if (data.email && data.email !== currentContact.email) {
        if (!Utils.isValidEmail(data.email)) {
          return { success: false, error: 'Email không hợp lệ' };
        }
        
        const contacts = Utils.getSheetData(this.SHEET_NAME);
        if (contacts.some(c => c.email === data.email && c.id !== id)) {
          return { success: false, error: 'Email đã tồn tại trong hệ thống' };
        }
      }
      
      // Merge updates
      const updatedContact = {
        ...currentContact,
        first_name: data.first_name !== undefined ? Utils.sanitize(data.first_name) : currentContact.first_name,
        last_name: data.last_name !== undefined ? Utils.sanitize(data.last_name) : currentContact.last_name,
        email: data.email !== undefined ? Utils.sanitize(data.email) : currentContact.email,
        phone: data.phone !== undefined ? Utils.sanitize(data.phone) : currentContact.phone,
        company_id: data.company_id !== undefined ? data.company_id : currentContact.company_id,
        position: data.position !== undefined ? Utils.sanitize(data.position) : currentContact.position,
        status: data.status !== undefined ? data.status : currentContact.status,
        source: data.source !== undefined ? data.source : currentContact.source,
        address: data.address !== undefined ? Utils.sanitize(data.address) : currentContact.address,
        city: data.city !== undefined ? Utils.sanitize(data.city) : currentContact.city,
        notes: data.notes !== undefined ? Utils.sanitize(data.notes) : currentContact.notes,
        avatar_url: data.avatar_url !== undefined ? data.avatar_url : currentContact.avatar_url,
        tags: data.tags !== undefined ? data.tags : currentContact.tags,
        updated_at: Utils.now()
      };
      
      // Cập nhật row
      const updatedRow = Utils.objectToRow(headers, updatedContact);
      sheet.getRange(rowIndex, 1, 1, headers.length).setValues([updatedRow]);
      
      // Log activity
      this.logActivity('update', id, 'Cập nhật liên hệ: ' + updatedContact.first_name);
      
      return {
        success: true,
        data: updatedContact,
        message: 'Cập nhật thành công'
      };
      
    } catch (error) {
      return { success: false, error: error.message };
    }
  },
  
  /**
   * Xóa contact
   */
  delete(id) {
    try {
      const sheet = getSheet(this.SHEET_NAME);
      const rowIndex = Utils.findRowById(this.SHEET_NAME, id);
      
      if (rowIndex === -1) {
        return { success: false, error: 'Không tìm thấy liên hệ' };
      }
      
      // Lấy tên để log
      const headers = Utils.getHeaders(this.SHEET_NAME);
      const currentRow = sheet.getRange(rowIndex, 1, 1, headers.length).getValues()[0];
      const contact = Utils.rowToObject(headers, currentRow);
      
      // Xóa row
      sheet.deleteRow(rowIndex);
      
      // Log activity
      this.logActivity('delete', id, 'Xóa liên hệ: ' + contact.first_name);
      
      return {
        success: true,
        message: 'Xóa liên hệ thành công'
      };
      
    } catch (error) {
      return { success: false, error: error.message };
    }
  },
  
  /**
   * Tìm kiếm nhanh
   */
  search(params) {
    try {
      const limit = parseInt(params.limit) || 10;
      let contacts = Utils.getSheetData(this.SHEET_NAME);
      
      if (params.q) {
        contacts = Utils.searchInFields(contacts, params.q, this.SEARCH_FIELDS);
      }
      
      // Trả về tối đa limit kết quả
      const results = contacts.slice(0, limit).map(c => ({
        id: c.id,
        name: `${c.first_name} ${c.last_name}`.trim(),
        email: c.email,
        phone: c.phone,
        status: c.status
      }));
      
      return {
        success: true,
        data: results
      };
      
    } catch (error) {
      return { success: false, error: error.message };
    }
  },
  
  /**
   * Log activity helper
   */
  logActivity(type, entityId, description) {
    try {
      const sheet = getSheet(CONFIG.SHEETS.ACTIVITIES);
      const headers = Utils.getHeaders(CONFIG.SHEETS.ACTIVITIES);
      
      const activity = {
        id: Utils.generateId(),
        created_at: Utils.now(),
        type: type,
        entity_type: 'contact',
        entity_id: entityId,
        description: description,
        old_value: '',
        new_value: ''
      };
      
      const row = Utils.objectToRow(headers, activity);
      sheet.appendRow(row);
    } catch (e) {
      Logger.log('Failed to log activity: ' + e.message);
    }
  }
};
// =====================================================
// CRM BACKEND - COMPANIES API
// =====================================================
// File: CompaniesAPI.gs
// CRUD operations cho Companies (Công ty)
// =====================================================

const CompaniesAPI = {
  
  SHEET_NAME: CONFIG.SHEETS.COMPANIES,
  SEARCH_FIELDS: ['name', 'industry', 'email', 'phone', 'website', 'description'],
  
  /**
   * Lấy danh sách companies có phân trang
   */
  getAll(params = {}) {
    try {
      const page = parseInt(params.page) || 1;
      const limit = Math.min(
        parseInt(params.limit) || CONFIG.DEFAULT_PAGE_SIZE,
        CONFIG.MAX_PAGE_SIZE
      );
      
      let companies = Utils.getSheetData(this.SHEET_NAME);
      
      // Tìm kiếm
      if (params.search) {
        companies = Utils.searchInFields(companies, params.search, this.SEARCH_FIELDS);
      }
      
      // Lọc
      const filters = {
        status: params.status,
        industry: params.industry,
        city: params.city
      };
      companies = Utils.applyFilters(companies, filters);
      
      // Sắp xếp
      const sortBy = params.sortBy || 'created_at';
      const sortOrder = params.sortOrder || 'desc';
      companies = Utils.applySort(companies, sortBy, sortOrder);
      
      // Đếm số contacts cho mỗi company
      const contacts = Utils.getSheetData(CONFIG.SHEETS.CONTACTS);
      const deals = Utils.getSheetData(CONFIG.SHEETS.DEALS);
      
      companies = companies.map(company => ({
        ...company,
        contactCount: contacts.filter(c => c.company_id === company.id).length,
        dealCount: deals.filter(d => d.company_id === company.id).length,
        totalDealValue: deals
          .filter(d => d.company_id === company.id && d.stage === 'won')
          .reduce((sum, d) => sum + (parseFloat(d.value) || 0), 0)
      }));
      
      // Phân trang
      const result = Utils.paginate(companies, page, limit);
      
      return {
        success: true,
        data: result.items,
        pagination: result.pagination
      };
      
    } catch (error) {
      return { success: false, error: error.message };
    }
  },
  
  /**
   * Lấy chi tiết một company
   */
  getById(id) {
    try {
      const companies = Utils.getSheetData(this.SHEET_NAME);
      const company = companies.find(c => c.id === id);
      
      if (!company) {
        return { success: false, error: 'Không tìm thấy công ty' };
      }
      
      // Lấy contacts của company
      const contacts = Utils.getSheetData(CONFIG.SHEETS.CONTACTS)
        .filter(c => c.company_id === id);
      
      // Lấy deals của company
      const deals = Utils.getSheetData(CONFIG.SHEETS.DEALS)
        .filter(d => d.company_id === id);
      
      // Lấy notes của company
      const notes = Utils.getSheetData(CONFIG.SHEETS.NOTES)
        .filter(n => n.company_id === id)
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      
      return {
        success: true,
        data: {
          ...company,
          contacts,
          deals,
          notes,
          stats: {
            totalContacts: contacts.length,
            totalDeals: deals.length,
            activeDeals: deals.filter(d => !['won', 'lost'].includes(d.stage)).length,
            wonDeals: deals.filter(d => d.stage === 'won').length,
            lostDeals: deals.filter(d => d.stage === 'lost').length,
            totalValue: deals.reduce((sum, d) => sum + (parseFloat(d.value) || 0), 0),
            wonValue: deals
              .filter(d => d.stage === 'won')
              .reduce((sum, d) => sum + (parseFloat(d.value) || 0), 0)
          }
        }
      };
      
    } catch (error) {
      return { success: false, error: error.message };
    }
  },
  
  /**
   * Tạo company mới
   */
  create(data) {
    try {
      // Validation
      if (!data.name) {
        return { success: false, error: 'Vui lòng nhập tên công ty' };
      }
      
      // Kiểm tra tên trùng
      const companies = Utils.getSheetData(this.SHEET_NAME);
      if (companies.some(c => c.name.toLowerCase() === data.name.toLowerCase())) {
        return { success: false, error: 'Tên công ty đã tồn tại' };
      }
      
      const newCompany = {
        id: Utils.generateId(),
        created_at: Utils.now(),
        updated_at: Utils.now(),
        name: Utils.sanitize(data.name),
        industry: data.industry || '',
        website: Utils.sanitize(data.website) || '',
        email: Utils.sanitize(data.email) || '',
        phone: Utils.sanitize(data.phone) || '',
        address: Utils.sanitize(data.address) || '',
        city: Utils.sanitize(data.city) || '',
        size: data.size || '',
        revenue: parseFloat(data.revenue) || 0,
        logo_url: data.logo_url || '',
        description: Utils.sanitize(data.description) || '',
        status: data.status || 'active'
      };
      
      const sheet = getSheet(this.SHEET_NAME);
      const headers = Utils.getHeaders(this.SHEET_NAME);
      const newRow = Utils.objectToRow(headers, newCompany);
      sheet.appendRow(newRow);
      
      // Log activity
      this.logActivity('create', newCompany.id, 'Tạo công ty mới: ' + newCompany.name);
      
      return {
        success: true,
        data: newCompany,
        message: 'Tạo công ty thành công'
      };
      
    } catch (error) {
      return { success: false, error: error.message };
    }
  },
  
  /**
   * Cập nhật company
   */
  update(id, data) {
    try {
      const sheet = getSheet(this.SHEET_NAME);
      const rowIndex = Utils.findRowById(this.SHEET_NAME, id);
      
      if (rowIndex === -1) {
        return { success: false, error: 'Không tìm thấy công ty' };
      }
      
      const headers = Utils.getHeaders(this.SHEET_NAME);
      const currentRow = sheet.getRange(rowIndex, 1, 1, headers.length).getValues()[0];
      const currentCompany = Utils.rowToObject(headers, currentRow);
      
      // Kiểm tra tên trùng
      if (data.name && data.name !== currentCompany.name) {
        const companies = Utils.getSheetData(this.SHEET_NAME);
        if (companies.some(c => c.name.toLowerCase() === data.name.toLowerCase() && c.id !== id)) {
          return { success: false, error: 'Tên công ty đã tồn tại' };
        }
      }
      
      const updatedCompany = {
        ...currentCompany,
        name: data.name !== undefined ? Utils.sanitize(data.name) : currentCompany.name,
        industry: data.industry !== undefined ? data.industry : currentCompany.industry,
        website: data.website !== undefined ? Utils.sanitize(data.website) : currentCompany.website,
        email: data.email !== undefined ? Utils.sanitize(data.email) : currentCompany.email,
        phone: data.phone !== undefined ? Utils.sanitize(data.phone) : currentCompany.phone,
        address: data.address !== undefined ? Utils.sanitize(data.address) : currentCompany.address,
        city: data.city !== undefined ? Utils.sanitize(data.city) : currentCompany.city,
        size: data.size !== undefined ? data.size : currentCompany.size,
        revenue: data.revenue !== undefined ? parseFloat(data.revenue) || 0 : currentCompany.revenue,
        logo_url: data.logo_url !== undefined ? data.logo_url : currentCompany.logo_url,
        description: data.description !== undefined ? Utils.sanitize(data.description) : currentCompany.description,
        status: data.status !== undefined ? data.status : currentCompany.status,
        updated_at: Utils.now()
      };
      
      const updatedRow = Utils.objectToRow(headers, updatedCompany);
      sheet.getRange(rowIndex, 1, 1, headers.length).setValues([updatedRow]);
      
      this.logActivity('update', id, 'Cập nhật công ty: ' + updatedCompany.name);
      
      return {
        success: true,
        data: updatedCompany,
        message: 'Cập nhật thành công'
      };
      
    } catch (error) {
      return { success: false, error: error.message };
    }
  },
  
  /**
   * Xóa company
   */
  delete(id) {
    try {
      const sheet = getSheet(this.SHEET_NAME);
      const rowIndex = Utils.findRowById(this.SHEET_NAME, id);
      
      if (rowIndex === -1) {
        return { success: false, error: 'Không tìm thấy công ty' };
      }
      
      // Kiểm tra còn contacts không
      const contacts = Utils.getSheetData(CONFIG.SHEETS.CONTACTS)
        .filter(c => c.company_id === id);
      
      if (contacts.length > 0) {
        return { 
          success: false, 
          error: `Không thể xóa công ty vì còn ${contacts.length} liên hệ liên quan` 
        };
      }
      
      const headers = Utils.getHeaders(this.SHEET_NAME);
      const currentRow = sheet.getRange(rowIndex, 1, 1, headers.length).getValues()[0];
      const company = Utils.rowToObject(headers, currentRow);
      
      sheet.deleteRow(rowIndex);
      
      this.logActivity('delete', id, 'Xóa công ty: ' + company.name);
      
      return {
        success: true,
        message: 'Xóa công ty thành công'
      };
      
    } catch (error) {
      return { success: false, error: error.message };
    }
  },
  
  /**
   * Lấy danh sách company cho dropdown
   */
  getList() {
    try {
      const companies = Utils.getSheetData(this.SHEET_NAME)
        .filter(c => c.status === 'active')
        .map(c => ({
          id: c.id,
          name: c.name,
          industry: c.industry
        }));
      
      return {
        success: true,
        data: companies
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },
  
  /**
   * Log activity
   */
  logActivity(type, entityId, description) {
    try {
      const sheet = getSheet(CONFIG.SHEETS.ACTIVITIES);
      const headers = Utils.getHeaders(CONFIG.SHEETS.ACTIVITIES);
      
      const activity = {
        id: Utils.generateId(),
        created_at: Utils.now(),
        type: type,
        entity_type: 'company',
        entity_id: entityId,
        description: description,
        old_value: '',
        new_value: ''
      };
      
      const row = Utils.objectToRow(headers, activity);
      sheet.appendRow(row);
    } catch (e) {
      Logger.log('Failed to log activity: ' + e.message);
    }
  }
};
// =====================================================
// CRM BACKEND - DEALS API
// =====================================================
// File: DealsAPI.gs
// CRUD operations cho Deals (Cơ hội kinh doanh)
// =====================================================

const DealsAPI = {
  
  SHEET_NAME: CONFIG.SHEETS.DEALS,
  SEARCH_FIELDS: ['title', 'description', 'source'],
  
  /**
   * Lấy danh sách deals
   */
  getAll(params = {}) {
    try {
      const page = parseInt(params.page) || 1;
      const limit = Math.min(
        parseInt(params.limit) || CONFIG.DEFAULT_PAGE_SIZE,
        CONFIG.MAX_PAGE_SIZE
      );
      
      let deals = Utils.getSheetData(this.SHEET_NAME);
      
      // Tìm kiếm
      if (params.search) {
        deals = Utils.searchInFields(deals, params.search, this.SEARCH_FIELDS);
      }
      
      // Lọc
      const filters = {
        stage: params.stage,
        contact_id: params.contact_id,
        company_id: params.company_id
      };
      deals = Utils.applyFilters(deals, filters);
      
      // Sắp xếp
      const sortBy = params.sortBy || 'created_at';
      const sortOrder = params.sortOrder || 'desc';
      deals = Utils.applySort(deals, sortBy, sortOrder);
      
      // Thêm thông tin contact và company
      const contacts = Utils.getSheetData(CONFIG.SHEETS.CONTACTS);
      const companies = Utils.getSheetData(CONFIG.SHEETS.COMPANIES);
      
      deals = deals.map(deal => ({
        ...deal,
        contact: contacts.find(c => c.id === deal.contact_id) || null,
        company: companies.find(c => c.id === deal.company_id) || null,
        stageInfo: CONFIG.DEAL_STAGES.find(s => s.id === deal.stage) || null
      }));
      
      const result = Utils.paginate(deals, page, limit);
      
      return {
        success: true,
        data: result.items,
        pagination: result.pagination
      };
      
    } catch (error) {
      return { success: false, error: error.message };
    }
  },
  
  /**
   * Lấy chi tiết deal
   */
  getById(id) {
    try {
      const deals = Utils.getSheetData(this.SHEET_NAME);
      const deal = deals.find(d => d.id === id);
      
      if (!deal) {
        return { success: false, error: 'Không tìm thấy deal' };
      }
      
      const contacts = Utils.getSheetData(CONFIG.SHEETS.CONTACTS);
      const companies = Utils.getSheetData(CONFIG.SHEETS.COMPANIES);
      const tasks = Utils.getSheetData(CONFIG.SHEETS.TASKS)
        .filter(t => t.deal_id === id);
      const notes = Utils.getSheetData(CONFIG.SHEETS.NOTES)
        .filter(n => n.deal_id === id)
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      
      return {
        success: true,
        data: {
          ...deal,
          contact: contacts.find(c => c.id === deal.contact_id) || null,
          company: companies.find(c => c.id === deal.company_id) || null,
          stageInfo: CONFIG.DEAL_STAGES.find(s => s.id === deal.stage) || null,
          tasks,
          notes
        }
      };
      
    } catch (error) {
      return { success: false, error: error.message };
    }
  },
  
  /**
   * Lấy pipeline view (kanban)
   */
  getPipeline() {
    try {
      const deals = Utils.getSheetData(this.SHEET_NAME);
      const contacts = Utils.getSheetData(CONFIG.SHEETS.CONTACTS);
      const companies = Utils.getSheetData(CONFIG.SHEETS.COMPANIES);
      
      // Nhóm theo stage
      const pipeline = {};
      
      CONFIG.DEAL_STAGES.forEach(stage => {
        pipeline[stage.id] = {
          ...stage,
          deals: [],
          count: 0,
          totalValue: 0
        };
      });
      
      deals.forEach(deal => {
        const stage = deal.stage || 'new';
        if (pipeline[stage]) {
          pipeline[stage].deals.push({
            ...deal,
            contact: contacts.find(c => c.id === deal.contact_id) || null,
            company: companies.find(c => c.id === deal.company_id) || null
          });
          pipeline[stage].count++;
          pipeline[stage].totalValue += parseFloat(deal.value) || 0;
        }
      });
      
      // Sắp xếp deals trong mỗi stage theo expected_close
      Object.keys(pipeline).forEach(stageId => {
        pipeline[stageId].deals.sort((a, b) => {
          const dateA = new Date(a.expected_close || '9999-12-31');
          const dateB = new Date(b.expected_close || '9999-12-31');
          return dateA - dateB;
        });
      });
      
      return {
        success: true,
        data: pipeline,
        summary: {
          totalDeals: deals.length,
          totalValue: deals.reduce((sum, d) => sum + (parseFloat(d.value) || 0), 0),
          activeDeals: deals.filter(d => !['won', 'lost'].includes(d.stage)).length
        }
      };
      
    } catch (error) {
      return { success: false, error: error.message };
    }
  },
  
  /**
   * Tạo deal mới
   */
  create(data) {
    try {
      if (!data.title) {
        return { success: false, error: 'Vui lòng nhập tên deal' };
      }
      
      const newDeal = {
        id: Utils.generateId(),
        created_at: Utils.now(),
        updated_at: Utils.now(),
        title: Utils.sanitize(data.title),
        contact_id: data.contact_id || '',
        company_id: data.company_id || '',
        value: parseFloat(data.value) || 0,
        currency: data.currency || 'VND',
        stage: data.stage || 'new',
        probability: parseInt(data.probability) || this.getStageProbability(data.stage || 'new'),
        expected_close: data.expected_close || '',
        actual_close: '',
        description: Utils.sanitize(data.description) || '',
        lost_reason: '',
        source: data.source || ''
      };
      
      const sheet = getSheet(this.SHEET_NAME);
      const headers = Utils.getHeaders(this.SHEET_NAME);
      const newRow = Utils.objectToRow(headers, newDeal);
      sheet.appendRow(newRow);
      
      this.logActivity('create', newDeal.id, 
        `Tạo deal mới: ${newDeal.title} - ${Utils.formatCurrency(newDeal.value)}`);
      
      return {
        success: true,
        data: newDeal,
        message: 'Tạo deal thành công'
      };
      
    } catch (error) {
      return { success: false, error: error.message };
    }
  },
  
  /**
   * Cập nhật deal
   */
  update(id, data) {
    try {
      const sheet = getSheet(this.SHEET_NAME);
      const rowIndex = Utils.findRowById(this.SHEET_NAME, id);
      
      if (rowIndex === -1) {
        return { success: false, error: 'Không tìm thấy deal' };
      }
      
      const headers = Utils.getHeaders(this.SHEET_NAME);
      const currentRow = sheet.getRange(rowIndex, 1, 1, headers.length).getValues()[0];
      const currentDeal = Utils.rowToObject(headers, currentRow);
      
      const updatedDeal = {
        ...currentDeal,
        title: data.title !== undefined ? Utils.sanitize(data.title) : currentDeal.title,
        contact_id: data.contact_id !== undefined ? data.contact_id : currentDeal.contact_id,
        company_id: data.company_id !== undefined ? data.company_id : currentDeal.company_id,
        value: data.value !== undefined ? parseFloat(data.value) || 0 : currentDeal.value,
        currency: data.currency !== undefined ? data.currency : currentDeal.currency,
        stage: data.stage !== undefined ? data.stage : currentDeal.stage,
        probability: data.probability !== undefined ? parseInt(data.probability) : currentDeal.probability,
        expected_close: data.expected_close !== undefined ? data.expected_close : currentDeal.expected_close,
        actual_close: data.actual_close !== undefined ? data.actual_close : currentDeal.actual_close,
        description: data.description !== undefined ? Utils.sanitize(data.description) : currentDeal.description,
        lost_reason: data.lost_reason !== undefined ? Utils.sanitize(data.lost_reason) : currentDeal.lost_reason,
        source: data.source !== undefined ? data.source : currentDeal.source,
        updated_at: Utils.now()
      };
      
      // Auto-set actual_close when deal is won/lost
      if (data.stage && ['won', 'lost'].includes(data.stage) && !updatedDeal.actual_close) {
        updatedDeal.actual_close = Utils.now().split('T')[0];
      }
      
      const updatedRow = Utils.objectToRow(headers, updatedDeal);
      sheet.getRange(rowIndex, 1, 1, headers.length).setValues([updatedRow]);
      
      this.logActivity('update', id, `Cập nhật deal: ${updatedDeal.title}`);
      
      return {
        success: true,
        data: updatedDeal,
        message: 'Cập nhật thành công'
      };
      
    } catch (error) {
      return { success: false, error: error.message };
    }
  },
  
  /**
   * Cập nhật stage (drag & drop)
   */
  updateStage(id, newStage) {
    try {
      const sheet = getSheet(this.SHEET_NAME);
      const rowIndex = Utils.findRowById(this.SHEET_NAME, id);
      
      if (rowIndex === -1) {
        return { success: false, error: 'Không tìm thấy deal' };
      }
      
      const headers = Utils.getHeaders(this.SHEET_NAME);
      const currentRow = sheet.getRange(rowIndex, 1, 1, headers.length).getValues()[0];
      const deal = Utils.rowToObject(headers, currentRow);
      
      const oldStage = deal.stage;
      deal.stage = newStage;
      deal.probability = this.getStageProbability(newStage);
      deal.updated_at = Utils.now();
      
      // Auto-set actual_close when won/lost
      if (['won', 'lost'].includes(newStage) && !deal.actual_close) {
        deal.actual_close = Utils.now().split('T')[0];
      }
      
      const updatedRow = Utils.objectToRow(headers, deal);
      sheet.getRange(rowIndex, 1, 1, headers.length).setValues([updatedRow]);
      
      const stageInfo = CONFIG.DEAL_STAGES.find(s => s.id === newStage);
      this.logActivity('update', id, 
        `Chuyển deal "${deal.title}" sang ${stageInfo ? stageInfo.name : newStage}`);
      
      return {
        success: true,
        data: deal,
        message: `Đã chuyển sang ${stageInfo ? stageInfo.name : newStage}`
      };
      
    } catch (error) {
      return { success: false, error: error.message };
    }
  },
  
  /**
   * Xóa deal
   */
  delete(id) {
    try {
      const sheet = getSheet(this.SHEET_NAME);
      const rowIndex = Utils.findRowById(this.SHEET_NAME, id);
      
      if (rowIndex === -1) {
        return { success: false, error: 'Không tìm thấy deal' };
      }
      
      const headers = Utils.getHeaders(this.SHEET_NAME);
      const currentRow = sheet.getRange(rowIndex, 1, 1, headers.length).getValues()[0];
      const deal = Utils.rowToObject(headers, currentRow);
      
      sheet.deleteRow(rowIndex);
      
      this.logActivity('delete', id, `Xóa deal: ${deal.title}`);
      
      return {
        success: true,
        message: 'Xóa deal thành công'
      };
      
    } catch (error) {
      return { success: false, error: error.message };
    }
  },
  
  /**
   * Lấy probability mặc định theo stage
   */
  getStageProbability(stage) {
    const probabilities = {
      'new': 10,
      'qualified': 25,
      'proposal': 50,
      'negotiation': 75,
      'won': 100,
      'lost': 0
    };
    return probabilities[stage] || 10;
  },
  
  /**
   * Log activity
   */
  logActivity(type, entityId, description) {
    try {
      const sheet = getSheet(CONFIG.SHEETS.ACTIVITIES);
      const headers = Utils.getHeaders(CONFIG.SHEETS.ACTIVITIES);
      
      const activity = {
        id: Utils.generateId(),
        created_at: Utils.now(),
        type: type,
        entity_type: 'deal',
        entity_id: entityId,
        description: description,
        old_value: '',
        new_value: ''
      };
      
      const row = Utils.objectToRow(headers, activity);
      sheet.appendRow(row);
    } catch (e) {
      Logger.log('Failed to log activity: ' + e.message);
    }
  }
};
// =====================================================
// CRM BACKEND - TASKS API
// =====================================================
// File: TasksAPI.gs
// CRUD operations cho Tasks (Công việc)
// =====================================================

const TasksAPI = {
  
  SHEET_NAME: CONFIG.SHEETS.TASKS,
  
  /**
   * Lấy danh sách tasks
   */
  getAll(params = {}) {
    try {
      const page = parseInt(params.page) || 1;
      const limit = Math.min(
        parseInt(params.limit) || CONFIG.DEFAULT_PAGE_SIZE,
        CONFIG.MAX_PAGE_SIZE
      );
      
      let tasks = Utils.getSheetData(this.SHEET_NAME);
      
      // Lọc
      const filters = {
        status: params.status,
        type: params.type,
        priority: params.priority,
        contact_id: params.contact_id,
        deal_id: params.deal_id
      };
      tasks = Utils.applyFilters(tasks, filters);
      
      // Tìm kiếm
      if (params.search) {
        tasks = Utils.searchInFields(tasks, params.search, ['title', 'description']);
      }
      
      // Sắp xếp
      const sortBy = params.sortBy || 'due_date';
      const sortOrder = params.sortOrder || 'asc';
      tasks = Utils.applySort(tasks, sortBy, sortOrder);
      
      // Thêm thông tin liên quan
      const contacts = Utils.getSheetData(CONFIG.SHEETS.CONTACTS);
      const deals = Utils.getSheetData(CONFIG.SHEETS.DEALS);
      
      tasks = tasks.map(task => ({
        ...task,
        contact: contacts.find(c => c.id === task.contact_id) || null,
        deal: deals.find(d => d.id === task.deal_id) || null,
        typeInfo: CONFIG.TASK_TYPES.find(t => t.id === task.type) || null,
        priorityInfo: CONFIG.TASK_PRIORITIES.find(p => p.id === task.priority) || null,
        isOverdue: this.isOverdue(task)
      }));
      
      const result = Utils.paginate(tasks, page, limit);
      
      return {
        success: true,
        data: result.items,
        pagination: result.pagination
      };
      
    } catch (error) {
      return { success: false, error: error.message };
    }
  },
  
  /**
   * Lấy chi tiết task
   */
  getById(id) {
    try {
      const tasks = Utils.getSheetData(this.SHEET_NAME);
      const task = tasks.find(t => t.id === id);
      
      if (!task) {
        return { success: false, error: 'Không tìm thấy công việc' };
      }
      
      const contacts = Utils.getSheetData(CONFIG.SHEETS.CONTACTS);
      const deals = Utils.getSheetData(CONFIG.SHEETS.DEALS);
      
      return {
        success: true,
        data: {
          ...task,
          contact: contacts.find(c => c.id === task.contact_id) || null,
          deal: deals.find(d => d.id === task.deal_id) || null,
          typeInfo: CONFIG.TASK_TYPES.find(t => t.id === task.type) || null,
          priorityInfo: CONFIG.TASK_PRIORITIES.find(p => p.id === task.priority) || null,
          isOverdue: this.isOverdue(task)
        }
      };
      
    } catch (error) {
      return { success: false, error: error.message };
    }
  },
  
  /**
   * Lấy tasks hôm nay
   */
  getToday() {
    try {
      const today = new Date().toISOString().split('T')[0];
      let tasks = Utils.getSheetData(this.SHEET_NAME);
      
      tasks = tasks.filter(t => {
        if (t.status === 'completed' || t.status === 'cancelled') return false;
        const dueDate = t.due_date ? t.due_date.split('T')[0] : null;
        return dueDate === today;
      });
      
      const contacts = Utils.getSheetData(CONFIG.SHEETS.CONTACTS);
      
      tasks = tasks.map(task => ({
        ...task,
        contact: contacts.find(c => c.id === task.contact_id) || null,
        typeInfo: CONFIG.TASK_TYPES.find(t => t.id === task.type) || null,
        priorityInfo: CONFIG.TASK_PRIORITIES.find(p => p.id === task.priority) || null
      }));
      
      // Sắp xếp theo priority
      const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
      tasks.sort((a, b) => (priorityOrder[a.priority] || 3) - (priorityOrder[b.priority] || 3));
      
      return {
        success: true,
        data: tasks,
        count: tasks.length
      };
      
    } catch (error) {
      return { success: false, error: error.message };
    }
  },
  
  /**
   * Lấy tasks quá hạn
   */
  getOverdue() {
    try {
      const now = new Date();
      let tasks = Utils.getSheetData(this.SHEET_NAME);
      
      tasks = tasks.filter(t => {
        if (t.status === 'completed' || t.status === 'cancelled') return false;
        if (!t.due_date) return false;
        return new Date(t.due_date) < now;
      });
      
      const contacts = Utils.getSheetData(CONFIG.SHEETS.CONTACTS);
      
      tasks = tasks.map(task => ({
        ...task,
        contact: contacts.find(c => c.id === task.contact_id) || null,
        typeInfo: CONFIG.TASK_TYPES.find(t => t.id === task.type) || null,
        daysOverdue: Math.floor((now - new Date(task.due_date)) / (1000 * 60 * 60 * 24))
      }));
      
      // Sắp xếp theo số ngày quá hạn
      tasks.sort((a, b) => b.daysOverdue - a.daysOverdue);
      
      return {
        success: true,
        data: tasks,
        count: tasks.length
      };
      
    } catch (error) {
      return { success: false, error: error.message };
    }
  },
  
  /**
   * Tạo task mới
   */
  create(data) {
    try {
      if (!data.title) {
        return { success: false, error: 'Vui lòng nhập tiêu đề công việc' };
      }
      
      const newTask = {
        id: Utils.generateId(),
        created_at: Utils.now(),
        updated_at: Utils.now(),
        title: Utils.sanitize(data.title),
        description: Utils.sanitize(data.description) || '',
        type: data.type || 'task',
        priority: data.priority || 'medium',
        status: data.status || 'pending',
        due_date: data.due_date || '',
        completed_at: '',
        contact_id: data.contact_id || '',
        deal_id: data.deal_id || '',
        reminder: data.reminder || ''
      };
      
      const sheet = getSheet(this.SHEET_NAME);
      const headers = Utils.getHeaders(this.SHEET_NAME);
      const newRow = Utils.objectToRow(headers, newTask);
      sheet.appendRow(newRow);
      
      this.logActivity('create', newTask.id, `Tạo công việc: ${newTask.title}`);
      
      return {
        success: true,
        data: newTask,
        message: 'Tạo công việc thành công'
      };
      
    } catch (error) {
      return { success: false, error: error.message };
    }
  },
  
  /**
   * Cập nhật task
   */
  update(id, data) {
    try {
      const sheet = getSheet(this.SHEET_NAME);
      const rowIndex = Utils.findRowById(this.SHEET_NAME, id);
      
      if (rowIndex === -1) {
        return { success: false, error: 'Không tìm thấy công việc' };
      }
      
      const headers = Utils.getHeaders(this.SHEET_NAME);
      const currentRow = sheet.getRange(rowIndex, 1, 1, headers.length).getValues()[0];
      const currentTask = Utils.rowToObject(headers, currentRow);
      
      const updatedTask = {
        ...currentTask,
        title: data.title !== undefined ? Utils.sanitize(data.title) : currentTask.title,
        description: data.description !== undefined ? Utils.sanitize(data.description) : currentTask.description,
        type: data.type !== undefined ? data.type : currentTask.type,
        priority: data.priority !== undefined ? data.priority : currentTask.priority,
        status: data.status !== undefined ? data.status : currentTask.status,
        due_date: data.due_date !== undefined ? data.due_date : currentTask.due_date,
        contact_id: data.contact_id !== undefined ? data.contact_id : currentTask.contact_id,
        deal_id: data.deal_id !== undefined ? data.deal_id : currentTask.deal_id,
        reminder: data.reminder !== undefined ? data.reminder : currentTask.reminder,
        updated_at: Utils.now()
      };
      
      // Auto-set completed_at when marking as completed
      if (data.status === 'completed' && !updatedTask.completed_at) {
        updatedTask.completed_at = Utils.now();
      }
      
      const updatedRow = Utils.objectToRow(headers, updatedTask);
      sheet.getRange(rowIndex, 1, 1, headers.length).setValues([updatedRow]);
      
      this.logActivity('update', id, `Cập nhật công việc: ${updatedTask.title}`);
      
      return {
        success: true,
        data: updatedTask,
        message: 'Cập nhật thành công'
      };
      
    } catch (error) {
      return { success: false, error: error.message };
    }
  },
  
  /**
   * Đánh dấu hoàn thành
   */
  complete(id) {
    try {
      const sheet = getSheet(this.SHEET_NAME);
      const rowIndex = Utils.findRowById(this.SHEET_NAME, id);
      
      if (rowIndex === -1) {
        return { success: false, error: 'Không tìm thấy công việc' };
      }
      
      const headers = Utils.getHeaders(this.SHEET_NAME);
      const currentRow = sheet.getRange(rowIndex, 1, 1, headers.length).getValues()[0];
      const task = Utils.rowToObject(headers, currentRow);
      
      task.status = 'completed';
      task.completed_at = Utils.now();
      task.updated_at = Utils.now();
      
      const updatedRow = Utils.objectToRow(headers, task);
      sheet.getRange(rowIndex, 1, 1, headers.length).setValues([updatedRow]);
      
      this.logActivity('complete', id, `Hoàn thành công việc: ${task.title}`);
      
      return {
        success: true,
        data: task,
        message: 'Đã đánh dấu hoàn thành'
      };
      
    } catch (error) {
      return { success: false, error: error.message };
    }
  },
  
  /**
   * Xóa task
   */
  delete(id) {
    try {
      const sheet = getSheet(this.SHEET_NAME);
      const rowIndex = Utils.findRowById(this.SHEET_NAME, id);
      
      if (rowIndex === -1) {
        return { success: false, error: 'Không tìm thấy công việc' };
      }
      
      const headers = Utils.getHeaders(this.SHEET_NAME);
      const currentRow = sheet.getRange(rowIndex, 1, 1, headers.length).getValues()[0];
      const task = Utils.rowToObject(headers, currentRow);
      
      sheet.deleteRow(rowIndex);
      
      this.logActivity('delete', id, `Xóa công việc: ${task.title}`);
      
      return {
        success: true,
        message: 'Xóa công việc thành công'
      };
      
    } catch (error) {
      return { success: false, error: error.message };
    }
  },
  
  /**
   * Kiểm tra task có quá hạn không
   */
  isOverdue(task) {
    if (!task.due_date) return false;
    if (task.status === 'completed' || task.status === 'cancelled') return false;
    return new Date(task.due_date) < new Date();
  },
  
  /**
   * Log activity
   */
  logActivity(type, entityId, description) {
    try {
      const sheet = getSheet(CONFIG.SHEETS.ACTIVITIES);
      const headers = Utils.getHeaders(CONFIG.SHEETS.ACTIVITIES);
      
      const activity = {
        id: Utils.generateId(),
        created_at: Utils.now(),
        type: type,
        entity_type: 'task',
        entity_id: entityId,
        description: description,
        old_value: '',
        new_value: ''
      };
      
      const row = Utils.objectToRow(headers, activity);
      sheet.appendRow(row);
    } catch (e) {
      Logger.log('Failed to log activity: ' + e.message);
    }
  }
};
// =====================================================
// CRM BACKEND - NOTES API
// =====================================================
// File: NotesAPI.gs
// CRUD operations cho Notes (Ghi chú)
// =====================================================

const NotesAPI = {
  
  SHEET_NAME: CONFIG.SHEETS.NOTES,
  
  /**
   * Lấy notes theo entity
   */
  getAll(params = {}) {
    try {
      let notes = Utils.getSheetData(this.SHEET_NAME);
      
      // Lọc theo entity
      if (params.contact_id) {
        notes = notes.filter(n => n.contact_id === params.contact_id);
      }
      if (params.company_id) {
        notes = notes.filter(n => n.company_id === params.company_id);
      }
      if (params.deal_id) {
        notes = notes.filter(n => n.deal_id === params.deal_id);
      }
      
      // Sắp xếp theo thời gian mới nhất
      notes.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      
      // Phân trang
      const page = parseInt(params.page) || 1;
      const limit = parseInt(params.limit) || 20;
      const result = Utils.paginate(notes, page, limit);
      
      return {
        success: true,
        data: result.items,
        pagination: result.pagination
      };
      
    } catch (error) {
      return { success: false, error: error.message };
    }
  },
  
  /**
   * Tạo note mới
   */
  create(data) {
    try {
      if (!data.content) {
        return { success: false, error: 'Vui lòng nhập nội dung ghi chú' };
      }
      
      if (!data.contact_id && !data.company_id && !data.deal_id) {
        return { success: false, error: 'Ghi chú phải được liên kết với ít nhất một đối tượng' };
      }
      
      const newNote = {
        id: Utils.generateId(),
        created_at: Utils.now(),
        updated_at: Utils.now(),
        content: Utils.sanitize(data.content),
        contact_id: data.contact_id || '',
        company_id: data.company_id || '',
        deal_id: data.deal_id || '',
        attachments: data.attachments || ''
      };
      
      const sheet = getSheet(this.SHEET_NAME);
      const headers = Utils.getHeaders(this.SHEET_NAME);
      const newRow = Utils.objectToRow(headers, newNote);
      sheet.appendRow(newRow);
      
      return {
        success: true,
        data: newNote,
        message: 'Thêm ghi chú thành công'
      };
      
    } catch (error) {
      return { success: false, error: error.message };
    }
  },
  
  /**
   * Cập nhật note
   */
  update(id, data) {
    try {
      const sheet = getSheet(this.SHEET_NAME);
      const rowIndex = Utils.findRowById(this.SHEET_NAME, id);
      
      if (rowIndex === -1) {
        return { success: false, error: 'Không tìm thấy ghi chú' };
      }
      
      const headers = Utils.getHeaders(this.SHEET_NAME);
      const currentRow = sheet.getRange(rowIndex, 1, 1, headers.length).getValues()[0];
      const currentNote = Utils.rowToObject(headers, currentRow);
      
      const updatedNote = {
        ...currentNote,
        content: data.content !== undefined ? Utils.sanitize(data.content) : currentNote.content,
        attachments: data.attachments !== undefined ? data.attachments : currentNote.attachments,
        updated_at: Utils.now()
      };
      
      const updatedRow = Utils.objectToRow(headers, updatedNote);
      sheet.getRange(rowIndex, 1, 1, headers.length).setValues([updatedRow]);
      
      return {
        success: true,
        data: updatedNote,
        message: 'Cập nhật ghi chú thành công'
      };
      
    } catch (error) {
      return { success: false, error: error.message };
    }
  },
  
  /**
   * Xóa note
   */
  delete(id) {
    try {
      const sheet = getSheet(this.SHEET_NAME);
      const rowIndex = Utils.findRowById(this.SHEET_NAME, id);
      
      if (rowIndex === -1) {
        return { success: false, error: 'Không tìm thấy ghi chú' };
      }
      
      sheet.deleteRow(rowIndex);
      
      return {
        success: true,
        message: 'Xóa ghi chú thành công'
      };
      
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
};
// =====================================================
// CRM BACKEND - DASHBOARD API
// =====================================================
// File: DashboardAPI.gs
// Thống kê và báo cáo tổng quan
// =====================================================

const DashboardAPI = {
  
  /**
   * Lấy thống kê tổng quan cho dashboard
   */
  getStats() {
    try {
      // Kiểm tra cache trước (cache 2 phút)
      const cached = Utils.getCache('dashboard_stats');
      if (cached) {
        return { success: true, data: cached, cached: true };
      }
      
      const contacts = Utils.getSheetData(CONFIG.SHEETS.CONTACTS);
      const companies = Utils.getSheetData(CONFIG.SHEETS.COMPANIES);
      const deals = Utils.getSheetData(CONFIG.SHEETS.DEALS);
      const tasks = Utils.getSheetData(CONFIG.SHEETS.TASKS);
      
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const startOfYear = new Date(now.getFullYear(), 0, 1);
      
      // ===== CONTACT STATS =====
      const contactStats = {
        total: contacts.length,
        byStatus: {
          lead: contacts.filter(c => c.status === 'lead').length,
          prospect: contacts.filter(c => c.status === 'prospect').length,
          customer: contacts.filter(c => c.status === 'customer').length,
          inactive: contacts.filter(c => c.status === 'inactive').length
        },
        newThisMonth: contacts.filter(c => new Date(c.created_at) >= startOfMonth).length,
        newThisYear: contacts.filter(c => new Date(c.created_at) >= startOfYear).length
      };
      
      // ===== COMPANY STATS =====
      const companyStats = {
        total: companies.length,
        active: companies.filter(c => c.status === 'active').length,
        newThisMonth: companies.filter(c => new Date(c.created_at) >= startOfMonth).length
      };
      
      // ===== DEAL STATS =====
      const activeDeals = deals.filter(d => !['won', 'lost'].includes(d.stage));
      const wonDeals = deals.filter(d => d.stage === 'won');
      const lostDeals = deals.filter(d => d.stage === 'lost');
      const wonThisMonth = wonDeals.filter(d => new Date(d.actual_close) >= startOfMonth);
      const wonThisYear = wonDeals.filter(d => new Date(d.actual_close) >= startOfYear);
      
      const dealStats = {
        total: deals.length,
        active: activeDeals.length,
        won: wonDeals.length,
        lost: lostDeals.length,
        totalValue: activeDeals.reduce((sum, d) => sum + (parseFloat(d.value) || 0), 0),
        wonValue: wonDeals.reduce((sum, d) => sum + (parseFloat(d.value) || 0), 0),
        wonValueThisMonth: wonThisMonth.reduce((sum, d) => sum + (parseFloat(d.value) || 0), 0),
        wonValueThisYear: wonThisYear.reduce((sum, d) => sum + (parseFloat(d.value) || 0), 0),
        winRate: (wonDeals.length + lostDeals.length) > 0 
          ? Math.round((wonDeals.length / (wonDeals.length + lostDeals.length)) * 100) 
          : 0,
        avgDealValue: wonDeals.length > 0
          ? Math.round(wonDeals.reduce((sum, d) => sum + (parseFloat(d.value) || 0), 0) / wonDeals.length)
          : 0
      };
      
      // ===== PIPELINE =====
      const pipeline = CONFIG.DEAL_STAGES.map(stage => ({
        id: stage.id,
        name: stage.name,
        color: stage.color,
        count: deals.filter(d => d.stage === stage.id).length,
        value: deals.filter(d => d.stage === stage.id)
          .reduce((sum, d) => sum + (parseFloat(d.value) || 0), 0)
      }));
      
      // ===== TASK STATS =====
      const pendingTasks = tasks.filter(t => t.status === 'pending' || t.status === 'in_progress');
      const today = now.toISOString().split('T')[0];
      const overdueTasks = pendingTasks.filter(t => {
        if (!t.due_date) return false;
        const dueDate = t.due_date.split('T')[0];
        return dueDate < today;
      });
      const todayTasks = pendingTasks.filter(t => {
        if (!t.due_date) return false;
        const dueDate = t.due_date.split('T')[0];
        return dueDate === today;
      });
      const upcomingTasks = pendingTasks.filter(t => {
        if (!t.due_date) return false;
        const dueDate = t.due_date.split('T')[0];
        return dueDate > today;
      });
      
      const taskStats = {
        total: tasks.length,
        pending: pendingTasks.length,
        overdue: overdueTasks.length,
        dueToday: todayTasks.length,
        upcoming: upcomingTasks.length,
        completed: tasks.filter(t => t.status === 'completed').length
      };
      
      // ===== MONTHLY REVENUE CHART (12 tháng gần nhất) =====
      const monthlyRevenue = [];
      for (let i = 11; i >= 0; i--) {
        const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
        
        const monthWon = wonDeals.filter(d => {
          const closeDate = new Date(d.actual_close);
          return closeDate >= monthStart && closeDate <= monthEnd;
        });
        
        monthlyRevenue.push({
          month: monthStart.toLocaleDateString('vi-VN', { month: 'short', year: '2-digit' }),
          value: monthWon.reduce((sum, d) => sum + (parseFloat(d.value) || 0), 0),
          count: monthWon.length
        });
      }
      
      // ===== TOP DEALS =====
      const topDeals = activeDeals
        .sort((a, b) => (parseFloat(b.value) || 0) - (parseFloat(a.value) || 0))
        .slice(0, 5)
        .map(d => ({
          id: d.id,
          title: d.title,
          value: parseFloat(d.value) || 0,
          stage: d.stage,
          stageInfo: CONFIG.DEAL_STAGES.find(s => s.id === d.stage),
          expected_close: d.expected_close
        }));
      
      // ===== RECENT CONTACTS =====
      const recentContacts = contacts
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, 5)
        .map(c => ({
          id: c.id,
          name: `${c.first_name} ${c.last_name}`.trim(),
          email: c.email,
          status: c.status,
          created_at: c.created_at
        }));
      
      const stats = {
          contacts: contactStats,
          companies: companyStats,
          deals: dealStats,
          tasks: taskStats,
          pipeline,
          monthlyRevenue,
          topDeals,
          recentContacts
        };
      
      // Lưu vào cache 2 phút
      Utils.setCache('dashboard_stats', stats, 120);
      
      return {
        success: true,
        data: stats
      };
      
    } catch (error) {
      return { success: false, error: error.message };
    }
  },
  
  /**
   * Lấy hoạt động gần đây
   */
  getRecentActivities(params = {}) {
    try {
      const limit = parseInt(params.limit) || 20;
      
      let activities = Utils.getSheetData(CONFIG.SHEETS.ACTIVITIES);
      
      // Sắp xếp mới nhất trước
      activities.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      
      // Lấy limit activities
      activities = activities.slice(0, limit);
      
      // Format relative time
      activities = activities.map(a => ({
        ...a,
        timeAgo: this.getTimeAgo(a.created_at)
      }));
      
      return {
        success: true,
        data: activities
      };
      
    } catch (error) {
      return { success: false, error: error.message };
    }
  },
  
  /**
   * Tính thời gian tương đối
   */
  getTimeAgo(dateString) {
    const now = new Date();
    const date = new Date(dateString);
    const seconds = Math.floor((now - date) / 1000);
    
    if (seconds < 60) return 'Vừa xong';
    
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} phút trước`;
    
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} giờ trước`;
    
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days} ngày trước`;
    
    const weeks = Math.floor(days / 7);
    if (weeks < 4) return `${weeks} tuần trước`;
    
    const months = Math.floor(days / 30);
    if (months < 12) return `${months} tháng trước`;
    
    return Utils.formatDate(dateString);
  }
};
// =====================================================
// CRM BACKEND - DRIVE API
// =====================================================
// File: DriveAPI.gs
// Xử lý upload/download files từ Google Drive
// =====================================================

const DriveAPI = {
  
  /**
   * Upload file lên Google Drive
   */
  upload(data) {
    try {
      if (!data.fileName || !data.fileContent) {
        return { success: false, error: 'Missing fileName or fileContent' };
      }
      
      // Decode base64 content
      const decoded = Utilities.base64Decode(data.fileContent);
      const blob = Utilities.newBlob(decoded, data.mimeType || 'application/octet-stream', data.fileName);
      
      // Get or create main folder
      let folder;
      try {
        folder = DriveApp.getFolderById(CONFIG.DRIVE_FOLDER_ID);
      } catch (e) {
        // Create folder if not exists
        folder = DriveApp.createFolder('CRM Attachments');
        Logger.log('Created new folder: ' + folder.getId());
      }
      
      // Create subfolder based on entity type
      if (data.entityType) {
        const subfolderName = data.entityType.charAt(0).toUpperCase() + data.entityType.slice(1);
        let subfolder;
        const subfolders = folder.getFoldersByName(subfolderName);
        
        if (subfolders.hasNext()) {
          subfolder = subfolders.next();
        } else {
          subfolder = folder.createFolder(subfolderName);
        }
        folder = subfolder;
      }
      
      // Upload file
      const file = folder.createFile(blob);
      
      // Set sharing
      file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
      
      const fileRecord = {
        id: file.getId(),
        name: file.getName(),
        mimeType: file.getMimeType(),
        size: file.getSize(),
        url: file.getUrl(),
        downloadUrl: `https://drive.google.com/uc?export=download&id=${file.getId()}`,
        thumbnailUrl: `https://drive.google.com/thumbnail?id=${file.getId()}&sz=w200`,
        entityType: data.entityType || '',
        entityId: data.entityId || '',
        uploadedAt: Utils.now()
      };
      
      return {
        success: true,
        data: fileRecord,
        message: 'Upload thành công'
      };
      
    } catch (error) {
      Logger.log('Upload error: ' + error.toString());
      return { success: false, error: 'Upload thất bại: ' + error.message };
    }
  },
  
  /**
   * Lấy danh sách files
   */
  getFiles(params = {}) {
    try {
      let folder;
      try {
        folder = DriveApp.getFolderById(CONFIG.DRIVE_FOLDER_ID);
      } catch (e) {
        return { success: true, data: [] };
      }
      
      // Navigate to subfolder if entityType specified
      if (params.entityType) {
        const subfolderName = params.entityType.charAt(0).toUpperCase() + params.entityType.slice(1);
        const subfolders = folder.getFoldersByName(subfolderName);
        
        if (subfolders.hasNext()) {
          folder = subfolders.next();
        } else {
          return { success: true, data: [] };
        }
      }
      
      const files = folder.getFiles();
      const fileList = [];
      
      while (files.hasNext()) {
        const file = files.next();
        fileList.push({
          id: file.getId(),
          name: file.getName(),
          mimeType: file.getMimeType(),
          size: file.getSize(),
          url: file.getUrl(),
          downloadUrl: `https://drive.google.com/uc?export=download&id=${file.getId()}`,
          thumbnailUrl: `https://drive.google.com/thumbnail?id=${file.getId()}&sz=w200`,
          createdAt: file.getDateCreated().toISOString(),
          updatedAt: file.getLastUpdated().toISOString()
        });
      }
      
      // Sort by date
      fileList.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      
      return {
        success: true,
        data: fileList
      };
      
    } catch (error) {
      return { success: false, error: error.message };
    }
  },
  
  /**
   * Xóa file
   */
  deleteFile(fileId) {
    try {
      const file = DriveApp.getFileById(fileId);
      file.setTrashed(true);
      
      return {
        success: true,
        message: 'Xóa file thành công'
      };
      
    } catch (error) {
      return { success: false, error: 'Không thể xóa file: ' + error.message };
    }
  },
  
  /**
   * Lấy download URL
   */
  getDownloadUrl(fileId) {
    try {
      const file = DriveApp.getFileById(fileId);
      
      return {
        success: true,
        data: {
          url: file.getUrl(),
          downloadUrl: `https://drive.google.com/uc?export=download&id=${fileId}`,
          name: file.getName()
        }
      };
      
    } catch (error) {
      return { success: false, error: error.message };
    }
  },
  
  /**
   * Format file size
   */
  formatFileSize(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
};
