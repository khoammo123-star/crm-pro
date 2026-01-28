// =====================================================
// CRM BACKEND - CONFIGURATION
// =====================================================
// File: Config.gs
// Cáº¥u hÃ¬nh chÃ­nh cho CRM system
// =====================================================

const CONFIG = {
  // âš ï¸ QUAN TRá»ŒNG: Thay báº±ng ID Google Sheets cá»§a báº¡n
  // CÃ¡ch láº¥y ID: Má»Ÿ Google Sheets -> Copy pháº§n ID trong URL
  // https://docs.google.com/spreadsheets/d/[SPREADSHEET_ID]/edit
  SPREADSHEET_ID: 'YOUR_SPREADSHEET_ID_HERE',
  
  // âš ï¸ QUAN TRá»ŒNG: Thay báº±ng ID folder Google Drive
  // Táº¡o folder má»›i trong Drive -> Chuá»™t pháº£i -> Get link -> Copy ID
  DRIVE_FOLDER_ID: 'YOUR_DRIVE_FOLDER_ID_HERE',
  
  // TÃªn cÃ¡c sheet trong Spreadsheet
  SHEETS: {
    CONTACTS: 'Contacts',
    COMPANIES: 'Companies', 
    DEALS: 'Deals',
    TASKS: 'Tasks',
    NOTES: 'Notes',
    ACTIVITIES: 'Activities',
    SETTINGS: 'Settings'
  },
  
  // Cáº¥u hÃ¬nh phÃ¢n trang
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
  
  // CÃ¡c tráº¡ng thÃ¡i Deal (Pipeline stages)
  DEAL_STAGES: [
    { id: 'new', name: 'Má»›i', color: '#3b82f6' },
    { id: 'qualified', name: 'Äá»§ Ä‘iá»u kiá»‡n', color: '#8b5cf6' },
    { id: 'proposal', name: 'Äá» xuáº¥t', color: '#f59e0b' },
    { id: 'negotiation', name: 'ÄÃ m phÃ¡n', color: '#f97316' },
    { id: 'won', name: 'ThÃ nh cÃ´ng', color: '#10b981' },
    { id: 'lost', name: 'Tháº¥t báº¡i', color: '#ef4444' }
  ],
  
  // Tráº¡ng thÃ¡i Contact
  CONTACT_STATUSES: [
    { id: 'lead', name: 'Lead', color: '#3b82f6' },
    { id: 'prospect', name: 'Tiá»m nÄƒng', color: '#8b5cf6' },
    { id: 'customer', name: 'KhÃ¡ch hÃ ng', color: '#10b981' },
    { id: 'inactive', name: 'KhÃ´ng hoáº¡t Ä‘á»™ng', color: '#6b7280' }
  ],
  
  // Loáº¡i Task
  TASK_TYPES: [
    { id: 'call', name: 'Gá»i Ä‘iá»‡n', icon: 'ðŸ“ž' },
    { id: 'email', name: 'Email', icon: 'ðŸ“§' },
    { id: 'meeting', name: 'Há»p', icon: 'ðŸ¤' },
    { id: 'task', name: 'CÃ´ng viá»‡c', icon: 'âœ…' },
    { id: 'deadline', name: 'Deadline', icon: 'â°' }
  ],
  
  // Äá»™ Æ°u tiÃªn Task
  TASK_PRIORITIES: [
    { id: 'low', name: 'Tháº¥p', color: '#6b7280' },
    { id: 'medium', name: 'Trung bÃ¬nh', color: '#f59e0b' },
    { id: 'high', name: 'Cao', color: '#f97316' },
    { id: 'urgent', name: 'Kháº©n cáº¥p', color: '#ef4444' }
  ],
  
  // Nguá»“n khÃ¡ch hÃ ng
  SOURCES: [
    'Website',
    'Facebook', 
    'Zalo',
    'Giá»›i thiá»‡u',
    'Triá»ƒn lÃ£m',
    'Cold Call',
    'Email Marketing',
    'KhÃ¡c'
  ],
  
  // NgÃ nh nghá»
  INDUSTRIES: [
    'CÃ´ng nghá»‡',
    'TÃ i chÃ­nh - NgÃ¢n hÃ ng',
    'Báº¥t Ä‘á»™ng sáº£n',
    'GiÃ¡o dá»¥c',
    'Y táº¿ - Sá»©c khá»e',
    'BÃ¡n láº»',
    'Sáº£n xuáº¥t',
    'Dá»‹ch vá»¥',
    'KhÃ¡c'
  ]
};

// =====================================================
// HELPER FUNCTIONS
// =====================================================

/**
 * Láº¥y Spreadsheet theo ID
 */
function getSpreadsheet() {
  return SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
}

/**
 * Láº¥y sheet theo tÃªn
 */
function getSheet(sheetName) {
  const ss = getSpreadsheet();
  let sheet = ss.getSheetByName(sheetName);
  
  // Tá»± Ä‘á»™ng táº¡o sheet náº¿u chÆ°a cÃ³
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
    initializeSheet(sheetName, sheet);
  }
  
  return sheet;
}

/**
 * Khá»Ÿi táº¡o headers cho sheet má»›i
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
 * Láº¥y headers cho tá»«ng sheet
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
 * Láº¥y cáº¥u hÃ¬nh cho frontend
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
// CÃ¡c hÃ m tiá»‡n Ã­ch dÃ¹ng chung
// =====================================================

const Utils = {
  
  /**
   * Táº¡o UUID má»›i
   */
  generateId() {
    return Utilities.getUuid();
  },
  
  /**
   * Láº¥y thá»i gian hiá»‡n táº¡i ISO format
   */
  now() {
    return new Date().toISOString();
  },
  
  /**
   * Format ngÃ y tiáº¿ng Viá»‡t
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
   * Format tiá»n tá»‡ VNÄ
   */
  formatCurrency(amount) {
    if (!amount) return '0 â‚«';
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  },
  
  /**
   * Chuyá»ƒn row array thÃ nh object
   */
  rowToObject(headers, row) {
    const obj = {};
    headers.forEach((header, index) => {
      let value = row[index];
      // Chuyá»ƒn Date object thÃ nh ISO string
      if (value instanceof Date) {
        value = value.toISOString();
      }
      obj[header] = value !== undefined && value !== '' ? value : null;
    });
    return obj;
  },
  
  /**
   * Chuyá»ƒn object thÃ nh row array
   */
  objectToRow(headers, obj) {
    return headers.map(header => {
      const value = obj[header];
      return value !== undefined && value !== null ? value : '';
    });
  },
  
  /**
   * Láº¥y toÃ n bá»™ data tá»« sheet dáº¡ng objects
   */
  getSheetData(sheetName) {
    const sheet = getSheet(sheetName);
    const data = sheet.getDataRange().getValues();
    
    if (data.length < 2) return [];
    
    const headers = data[0];
    return data.slice(1)
      .filter(row => row[0]) // Bá» qua row trá»‘ng
      .map(row => this.rowToObject(headers, row));
  },
  
  /**
   * TÃ¬m row index theo ID
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
   * Láº¥y headers cá»§a sheet
   */
  getHeaders(sheetName) {
    const sheet = getSheet(sheetName);
    return sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  },
  
  /**
   * PhÃ¢n trang data
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
   * Lá»c data theo Ä‘iá»u kiá»‡n
   */
  applyFilters(data, filters) {
    if (!filters || Object.keys(filters).length === 0) return data;
    
    return data.filter(item => {
      for (const [key, value] of Object.entries(filters)) {
        if (value === '' || value === null || value === undefined) continue;
        
        const itemValue = item[key];
        if (itemValue === null || itemValue === undefined) return false;
        
        // So sÃ¡nh string (khÃ´ng phÃ¢n biá»‡t hoa thÆ°á»ng)
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
   * Sáº¯p xáº¿p data
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
   * TÃ¬m kiáº¿m full-text trong nhiá»u fields
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
// Entry point vÃ  routing cho táº¥t cáº£ API requests
// =====================================================

/**
 * Serve HTML frontend khi khÃ´ng cÃ³ action parameter
 */
function doGet(e) {
  // Náº¿u cÃ³ action parameter, xá»­ lÃ½ nhÆ° API
  if (e && e.parameter && e.parameter.action) {
    return handleRequest(e, 'GET');
  }
  
  // Serve HTML frontend
  return HtmlService.createTemplateFromFile('Index')
    .evaluate()
    .setTitle('CRM Pro - Quáº£n lÃ½ khÃ¡ch hÃ ng')
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
 * Handler cho google.script.run tá»« client
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
      return ContactsAPI.create(data);
    case 'updateContact':
      return ContactsAPI.update(data.id, data);
    case 'deleteContact':
      return ContactsAPI.delete(data.id);
    case 'getCompanies':
      return CompaniesAPI.getAll(data);
    case 'getCompany':
      return CompaniesAPI.getById(data.id);
    case 'createCompany':
      return CompaniesAPI.create(data);
    case 'updateCompany':
      return CompaniesAPI.update(data.id, data);
    case 'deleteCompany':
      return CompaniesAPI.delete(data.id);
    case 'getDeals':
      return DealsAPI.getAll(data);
    case 'getDeal':
      return DealsAPI.getById(data.id);
    case 'createDeal':
      return DealsAPI.create(data);
    case 'updateDeal':
      return DealsAPI.update(data.id, data);
    case 'updateDealStage':
      return DealsAPI.updateStage(data.id, data.stage);
    case 'deleteDeal':
      return DealsAPI.delete(data.id);
    case 'getDealsPipeline':
      return DealsAPI.getPipeline();
    case 'getTasks':
      return TasksAPI.getAll(data);
    case 'getTask':
      return TasksAPI.getById(data.id);
    case 'createTask':
      return TasksAPI.create(data);
    case 'updateTask':
      return TasksAPI.update(data.id, data);
    case 'completeTask':
      return TasksAPI.complete(data.id);
    case 'deleteTask':
      return TasksAPI.delete(data.id);
    case 'getOverdueTasks':
      return TasksAPI.getOverdue();
    case 'getTodayTasks':
      return TasksAPI.getToday();
    default:
      return { success: false, error: 'Unknown action: ' + action };
  }
}

/**
 * Xá»­ lÃ½ POST requests
 */
function doPost(e) {
  return handleRequest(e, 'POST');
}

/**
 * Router chÃ­nh - Ä‘á»‹nh tuyáº¿n request Ä‘áº¿n handler phÃ¹ há»£p
 */
function handleRequest(e, method) {
  // Cho phÃ©p CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  };
  
  try {
    let action, data;
    
    if (method === 'GET') {
      action = e.parameter.action;
      data = e.parameter;
    } else {
      const body = JSON.parse(e.postData.contents);
      action = body.action;
      data = body.data || body;
    }
    
    if (!action) {
      return jsonResponse({ 
        success: false, 
        error: 'Missing action parameter' 
      });
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
    
    return jsonResponse(result);
    
  } catch (error) {
    Logger.log('Error: ' + error.toString());
    Logger.log('Stack: ' + error.stack);
    
    return jsonResponse({ 
      success: false, 
      error: error.message,
      stack: error.stack 
    }, 500);
  }
}

/**
 * Tráº£ vá» JSON response
 */
function jsonResponse(data, statusCode = 200) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Láº¥y danh sÃ¡ch actions kháº£ dá»¥ng
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
 * Khá»Ÿi táº¡o database - táº¡o táº¥t cáº£ sheets vá»›i headers
 */
function initializeDatabase() {
  try {
    const sheets = Object.values(CONFIG.SHEETS);
    const created = [];
    
    sheets.forEach(sheetName => {
      getSheet(sheetName); // Tá»± Ä‘á»™ng táº¡o náº¿u chÆ°a cÃ³
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
 * Test function - cháº¡y trong Apps Script editor Ä‘á»ƒ test
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
// CRUD operations cho Contacts (LiÃªn há»‡)
// =====================================================

const ContactsAPI = {
  
  SHEET_NAME: CONFIG.SHEETS.CONTACTS,
  SEARCH_FIELDS: ['first_name', 'last_name', 'email', 'phone', 'position', 'notes', 'tags'],
  
  /**
   * Láº¥y danh sÃ¡ch contacts cÃ³ phÃ¢n trang vÃ  filter
   */
  getAll(params = {}) {
    try {
      const page = parseInt(params.page) || 1;
      const limit = Math.min(
        parseInt(params.limit) || CONFIG.DEFAULT_PAGE_SIZE,
        CONFIG.MAX_PAGE_SIZE
      );
      
      // Láº¥y data
      let contacts = Utils.getSheetData(this.SHEET_NAME);
      
      // TÃ¬m kiáº¿m
      if (params.search) {
        contacts = Utils.searchInFields(contacts, params.search, this.SEARCH_FIELDS);
      }
      
      // Lá»c theo Ä‘iá»u kiá»‡n
      const filters = {
        status: params.status,
        company_id: params.company_id,
        source: params.source
      };
      contacts = Utils.applyFilters(contacts, filters);
      
      // Sáº¯p xáº¿p
      const sortBy = params.sortBy || 'created_at';
      const sortOrder = params.sortOrder || 'desc';
      contacts = Utils.applySort(contacts, sortBy, sortOrder);
      
      // PhÃ¢n trang
      const result = Utils.paginate(contacts, page, limit);
      
      // ThÃªm thÃ´ng tin company náº¿u cÃ³
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
   * Láº¥y chi tiáº¿t má»™t contact theo ID
   */
  getById(id) {
    try {
      const contacts = Utils.getSheetData(this.SHEET_NAME);
      const contact = contacts.find(c => c.id === id);
      
      if (!contact) {
        return { success: false, error: 'KhÃ´ng tÃ¬m tháº¥y liÃªn há»‡' };
      }
      
      // Láº¥y thÃ´ng tin liÃªn quan
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
   * Táº¡o contact má»›i
   */
  create(data) {
    try {
      // Validation
      if (!data.first_name) {
        return { success: false, error: 'Vui lÃ²ng nháº­p tÃªn' };
      }
      
      if (data.email && !Utils.isValidEmail(data.email)) {
        return { success: false, error: 'Email khÃ´ng há»£p lá»‡' };
      }
      
      // Kiá»ƒm tra email trÃ¹ng
      if (data.email) {
        const contacts = Utils.getSheetData(this.SHEET_NAME);
        if (contacts.some(c => c.email === data.email)) {
          return { success: false, error: 'Email Ä‘Ã£ tá»“n táº¡i trong há»‡ thá»‘ng' };
        }
      }
      
      // Táº¡o contact má»›i
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
      
      // LÆ°u vÃ o sheet
      const sheet = getSheet(this.SHEET_NAME);
      const headers = Utils.getHeaders(this.SHEET_NAME);
      const newRow = Utils.objectToRow(headers, newContact);
      sheet.appendRow(newRow);
      
      // Log activity
      this.logActivity('create', newContact.id, 'Táº¡o liÃªn há»‡ má»›i: ' + newContact.first_name);
      
      return {
        success: true,
        data: newContact,
        message: 'Táº¡o liÃªn há»‡ thÃ nh cÃ´ng'
      };
      
    } catch (error) {
      return { success: false, error: error.message };
    }
  },
  
  /**
   * Cáº­p nháº­t contact
   */
  update(id, data) {
    try {
      const sheet = getSheet(this.SHEET_NAME);
      const rowIndex = Utils.findRowById(this.SHEET_NAME, id);
      
      if (rowIndex === -1) {
        return { success: false, error: 'KhÃ´ng tÃ¬m tháº¥y liÃªn há»‡' };
      }
      
      // Láº¥y data hiá»‡n táº¡i
      const headers = Utils.getHeaders(this.SHEET_NAME);
      const currentRow = sheet.getRange(rowIndex, 1, 1, headers.length).getValues()[0];
      const currentContact = Utils.rowToObject(headers, currentRow);
      
      // Kiá»ƒm tra email trÃ¹ng (náº¿u thay Ä‘á»•i email)
      if (data.email && data.email !== currentContact.email) {
        if (!Utils.isValidEmail(data.email)) {
          return { success: false, error: 'Email khÃ´ng há»£p lá»‡' };
        }
        
        const contacts = Utils.getSheetData(this.SHEET_NAME);
        if (contacts.some(c => c.email === data.email && c.id !== id)) {
          return { success: false, error: 'Email Ä‘Ã£ tá»“n táº¡i trong há»‡ thá»‘ng' };
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
      
      // Cáº­p nháº­t row
      const updatedRow = Utils.objectToRow(headers, updatedContact);
      sheet.getRange(rowIndex, 1, 1, headers.length).setValues([updatedRow]);
      
      // Log activity
      this.logActivity('update', id, 'Cáº­p nháº­t liÃªn há»‡: ' + updatedContact.first_name);
      
      return {
        success: true,
        data: updatedContact,
        message: 'Cáº­p nháº­t thÃ nh cÃ´ng'
      };
      
    } catch (error) {
      return { success: false, error: error.message };
    }
  },
  
  /**
   * XÃ³a contact
   */
  delete(id) {
    try {
      const sheet = getSheet(this.SHEET_NAME);
      const rowIndex = Utils.findRowById(this.SHEET_NAME, id);
      
      if (rowIndex === -1) {
        return { success: false, error: 'KhÃ´ng tÃ¬m tháº¥y liÃªn há»‡' };
      }
      
      // Láº¥y tÃªn Ä‘á»ƒ log
      const headers = Utils.getHeaders(this.SHEET_NAME);
      const currentRow = sheet.getRange(rowIndex, 1, 1, headers.length).getValues()[0];
      const contact = Utils.rowToObject(headers, currentRow);
      
      // XÃ³a row
      sheet.deleteRow(rowIndex);
      
      // Log activity
      this.logActivity('delete', id, 'XÃ³a liÃªn há»‡: ' + contact.first_name);
      
      return {
        success: true,
        message: 'XÃ³a liÃªn há»‡ thÃ nh cÃ´ng'
      };
      
    } catch (error) {
      return { success: false, error: error.message };
    }
  },
  
  /**
   * TÃ¬m kiáº¿m nhanh
   */
  search(params) {
    try {
      const limit = parseInt(params.limit) || 10;
      let contacts = Utils.getSheetData(this.SHEET_NAME);
      
      if (params.q) {
        contacts = Utils.searchInFields(contacts, params.q, this.SEARCH_FIELDS);
      }
      
      // Tráº£ vá» tá»‘i Ä‘a limit káº¿t quáº£
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
// CRUD operations cho Companies (CÃ´ng ty)
// =====================================================

const CompaniesAPI = {
  
  SHEET_NAME: CONFIG.SHEETS.COMPANIES,
  SEARCH_FIELDS: ['name', 'industry', 'email', 'phone', 'website', 'description'],
  
  /**
   * Láº¥y danh sÃ¡ch companies cÃ³ phÃ¢n trang
   */
  getAll(params = {}) {
    try {
      const page = parseInt(params.page) || 1;
      const limit = Math.min(
        parseInt(params.limit) || CONFIG.DEFAULT_PAGE_SIZE,
        CONFIG.MAX_PAGE_SIZE
      );
      
      let companies = Utils.getSheetData(this.SHEET_NAME);
      
      // TÃ¬m kiáº¿m
      if (params.search) {
        companies = Utils.searchInFields(companies, params.search, this.SEARCH_FIELDS);
      }
      
      // Lá»c
      const filters = {
        status: params.status,
        industry: params.industry,
        city: params.city
      };
      companies = Utils.applyFilters(companies, filters);
      
      // Sáº¯p xáº¿p
      const sortBy = params.sortBy || 'created_at';
      const sortOrder = params.sortOrder || 'desc';
      companies = Utils.applySort(companies, sortBy, sortOrder);
      
      // Äáº¿m sá»‘ contacts cho má»—i company
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
      
      // PhÃ¢n trang
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
   * Láº¥y chi tiáº¿t má»™t company
   */
  getById(id) {
    try {
      const companies = Utils.getSheetData(this.SHEET_NAME);
      const company = companies.find(c => c.id === id);
      
      if (!company) {
        return { success: false, error: 'KhÃ´ng tÃ¬m tháº¥y cÃ´ng ty' };
      }
      
      // Láº¥y contacts cá»§a company
      const contacts = Utils.getSheetData(CONFIG.SHEETS.CONTACTS)
        .filter(c => c.company_id === id);
      
      // Láº¥y deals cá»§a company
      const deals = Utils.getSheetData(CONFIG.SHEETS.DEALS)
        .filter(d => d.company_id === id);
      
      // Láº¥y notes cá»§a company
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
   * Táº¡o company má»›i
   */
  create(data) {
    try {
      // Validation
      if (!data.name) {
        return { success: false, error: 'Vui lÃ²ng nháº­p tÃªn cÃ´ng ty' };
      }
      
      // Kiá»ƒm tra tÃªn trÃ¹ng
      const companies = Utils.getSheetData(this.SHEET_NAME);
      if (companies.some(c => c.name.toLowerCase() === data.name.toLowerCase())) {
        return { success: false, error: 'TÃªn cÃ´ng ty Ä‘Ã£ tá»“n táº¡i' };
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
      this.logActivity('create', newCompany.id, 'Táº¡o cÃ´ng ty má»›i: ' + newCompany.name);
      
      return {
        success: true,
        data: newCompany,
        message: 'Táº¡o cÃ´ng ty thÃ nh cÃ´ng'
      };
      
    } catch (error) {
      return { success: false, error: error.message };
    }
  },
  
  /**
   * Cáº­p nháº­t company
   */
  update(id, data) {
    try {
      const sheet = getSheet(this.SHEET_NAME);
      const rowIndex = Utils.findRowById(this.SHEET_NAME, id);
      
      if (rowIndex === -1) {
        return { success: false, error: 'KhÃ´ng tÃ¬m tháº¥y cÃ´ng ty' };
      }
      
      const headers = Utils.getHeaders(this.SHEET_NAME);
      const currentRow = sheet.getRange(rowIndex, 1, 1, headers.length).getValues()[0];
      const currentCompany = Utils.rowToObject(headers, currentRow);
      
      // Kiá»ƒm tra tÃªn trÃ¹ng
      if (data.name && data.name !== currentCompany.name) {
        const companies = Utils.getSheetData(this.SHEET_NAME);
        if (companies.some(c => c.name.toLowerCase() === data.name.toLowerCase() && c.id !== id)) {
          return { success: false, error: 'TÃªn cÃ´ng ty Ä‘Ã£ tá»“n táº¡i' };
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
      
      this.logActivity('update', id, 'Cáº­p nháº­t cÃ´ng ty: ' + updatedCompany.name);
      
      return {
        success: true,
        data: updatedCompany,
        message: 'Cáº­p nháº­t thÃ nh cÃ´ng'
      };
      
    } catch (error) {
      return { success: false, error: error.message };
    }
  },
  
  /**
   * XÃ³a company
   */
  delete(id) {
    try {
      const sheet = getSheet(this.SHEET_NAME);
      const rowIndex = Utils.findRowById(this.SHEET_NAME, id);
      
      if (rowIndex === -1) {
        return { success: false, error: 'KhÃ´ng tÃ¬m tháº¥y cÃ´ng ty' };
      }
      
      // Kiá»ƒm tra cÃ²n contacts khÃ´ng
      const contacts = Utils.getSheetData(CONFIG.SHEETS.CONTACTS)
        .filter(c => c.company_id === id);
      
      if (contacts.length > 0) {
        return { 
          success: false, 
          error: `KhÃ´ng thá»ƒ xÃ³a cÃ´ng ty vÃ¬ cÃ²n ${contacts.length} liÃªn há»‡ liÃªn quan` 
        };
      }
      
      const headers = Utils.getHeaders(this.SHEET_NAME);
      const currentRow = sheet.getRange(rowIndex, 1, 1, headers.length).getValues()[0];
      const company = Utils.rowToObject(headers, currentRow);
      
      sheet.deleteRow(rowIndex);
      
      this.logActivity('delete', id, 'XÃ³a cÃ´ng ty: ' + company.name);
      
      return {
        success: true,
        message: 'XÃ³a cÃ´ng ty thÃ nh cÃ´ng'
      };
      
    } catch (error) {
      return { success: false, error: error.message };
    }
  },
  
  /**
   * Láº¥y danh sÃ¡ch company cho dropdown
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
// CRUD operations cho Deals (CÆ¡ há»™i kinh doanh)
// =====================================================

const DealsAPI = {
  
  SHEET_NAME: CONFIG.SHEETS.DEALS,
  SEARCH_FIELDS: ['title', 'description', 'source'],
  
  /**
   * Láº¥y danh sÃ¡ch deals
   */
  getAll(params = {}) {
    try {
      const page = parseInt(params.page) || 1;
      const limit = Math.min(
        parseInt(params.limit) || CONFIG.DEFAULT_PAGE_SIZE,
        CONFIG.MAX_PAGE_SIZE
      );
      
      let deals = Utils.getSheetData(this.SHEET_NAME);
      
      // TÃ¬m kiáº¿m
      if (params.search) {
        deals = Utils.searchInFields(deals, params.search, this.SEARCH_FIELDS);
      }
      
      // Lá»c
      const filters = {
        stage: params.stage,
        contact_id: params.contact_id,
        company_id: params.company_id
      };
      deals = Utils.applyFilters(deals, filters);
      
      // Sáº¯p xáº¿p
      const sortBy = params.sortBy || 'created_at';
      const sortOrder = params.sortOrder || 'desc';
      deals = Utils.applySort(deals, sortBy, sortOrder);
      
      // ThÃªm thÃ´ng tin contact vÃ  company
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
   * Láº¥y chi tiáº¿t deal
   */
  getById(id) {
    try {
      const deals = Utils.getSheetData(this.SHEET_NAME);
      const deal = deals.find(d => d.id === id);
      
      if (!deal) {
        return { success: false, error: 'KhÃ´ng tÃ¬m tháº¥y deal' };
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
   * Láº¥y pipeline view (kanban)
   */
  getPipeline() {
    try {
      const deals = Utils.getSheetData(this.SHEET_NAME);
      const contacts = Utils.getSheetData(CONFIG.SHEETS.CONTACTS);
      const companies = Utils.getSheetData(CONFIG.SHEETS.COMPANIES);
      
      // NhÃ³m theo stage
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
      
      // Sáº¯p xáº¿p deals trong má»—i stage theo expected_close
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
   * Táº¡o deal má»›i
   */
  create(data) {
    try {
      if (!data.title) {
        return { success: false, error: 'Vui lÃ²ng nháº­p tÃªn deal' };
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
        `Táº¡o deal má»›i: ${newDeal.title} - ${Utils.formatCurrency(newDeal.value)}`);
      
      return {
        success: true,
        data: newDeal,
        message: 'Táº¡o deal thÃ nh cÃ´ng'
      };
      
    } catch (error) {
      return { success: false, error: error.message };
    }
  },
  
  /**
   * Cáº­p nháº­t deal
   */
  update(id, data) {
    try {
      const sheet = getSheet(this.SHEET_NAME);
      const rowIndex = Utils.findRowById(this.SHEET_NAME, id);
      
      if (rowIndex === -1) {
        return { success: false, error: 'KhÃ´ng tÃ¬m tháº¥y deal' };
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
      
      this.logActivity('update', id, `Cáº­p nháº­t deal: ${updatedDeal.title}`);
      
      return {
        success: true,
        data: updatedDeal,
        message: 'Cáº­p nháº­t thÃ nh cÃ´ng'
      };
      
    } catch (error) {
      return { success: false, error: error.message };
    }
  },
  
  /**
   * Cáº­p nháº­t stage (drag & drop)
   */
  updateStage(id, newStage) {
    try {
      const sheet = getSheet(this.SHEET_NAME);
      const rowIndex = Utils.findRowById(this.SHEET_NAME, id);
      
      if (rowIndex === -1) {
        return { success: false, error: 'KhÃ´ng tÃ¬m tháº¥y deal' };
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
        `Chuyá»ƒn deal "${deal.title}" sang ${stageInfo ? stageInfo.name : newStage}`);
      
      return {
        success: true,
        data: deal,
        message: `ÄÃ£ chuyá»ƒn sang ${stageInfo ? stageInfo.name : newStage}`
      };
      
    } catch (error) {
      return { success: false, error: error.message };
    }
  },
  
  /**
   * XÃ³a deal
   */
  delete(id) {
    try {
      const sheet = getSheet(this.SHEET_NAME);
      const rowIndex = Utils.findRowById(this.SHEET_NAME, id);
      
      if (rowIndex === -1) {
        return { success: false, error: 'KhÃ´ng tÃ¬m tháº¥y deal' };
      }
      
      const headers = Utils.getHeaders(this.SHEET_NAME);
      const currentRow = sheet.getRange(rowIndex, 1, 1, headers.length).getValues()[0];
      const deal = Utils.rowToObject(headers, currentRow);
      
      sheet.deleteRow(rowIndex);
      
      this.logActivity('delete', id, `XÃ³a deal: ${deal.title}`);
      
      return {
        success: true,
        message: 'XÃ³a deal thÃ nh cÃ´ng'
      };
      
    } catch (error) {
      return { success: false, error: error.message };
    }
  },
  
  /**
   * Láº¥y probability máº·c Ä‘á»‹nh theo stage
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
// CRUD operations cho Tasks (CÃ´ng viá»‡c)
// =====================================================

const TasksAPI = {
  
  SHEET_NAME: CONFIG.SHEETS.TASKS,
  
  /**
   * Láº¥y danh sÃ¡ch tasks
   */
  getAll(params = {}) {
    try {
      const page = parseInt(params.page) || 1;
      const limit = Math.min(
        parseInt(params.limit) || CONFIG.DEFAULT_PAGE_SIZE,
        CONFIG.MAX_PAGE_SIZE
      );
      
      let tasks = Utils.getSheetData(this.SHEET_NAME);
      
      // Lá»c
      const filters = {
        status: params.status,
        type: params.type,
        priority: params.priority,
        contact_id: params.contact_id,
        deal_id: params.deal_id
      };
      tasks = Utils.applyFilters(tasks, filters);
      
      // TÃ¬m kiáº¿m
      if (params.search) {
        tasks = Utils.searchInFields(tasks, params.search, ['title', 'description']);
      }
      
      // Sáº¯p xáº¿p
      const sortBy = params.sortBy || 'due_date';
      const sortOrder = params.sortOrder || 'asc';
      tasks = Utils.applySort(tasks, sortBy, sortOrder);
      
      // ThÃªm thÃ´ng tin liÃªn quan
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
   * Láº¥y chi tiáº¿t task
   */
  getById(id) {
    try {
      const tasks = Utils.getSheetData(this.SHEET_NAME);
      const task = tasks.find(t => t.id === id);
      
      if (!task) {
        return { success: false, error: 'KhÃ´ng tÃ¬m tháº¥y cÃ´ng viá»‡c' };
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
   * Láº¥y tasks hÃ´m nay
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
      
      // Sáº¯p xáº¿p theo priority
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
   * Láº¥y tasks quÃ¡ háº¡n
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
      
      // Sáº¯p xáº¿p theo sá»‘ ngÃ y quÃ¡ háº¡n
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
   * Táº¡o task má»›i
   */
  create(data) {
    try {
      if (!data.title) {
        return { success: false, error: 'Vui lÃ²ng nháº­p tiÃªu Ä‘á» cÃ´ng viá»‡c' };
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
      
      this.logActivity('create', newTask.id, `Táº¡o cÃ´ng viá»‡c: ${newTask.title}`);
      
      return {
        success: true,
        data: newTask,
        message: 'Táº¡o cÃ´ng viá»‡c thÃ nh cÃ´ng'
      };
      
    } catch (error) {
      return { success: false, error: error.message };
    }
  },
  
  /**
   * Cáº­p nháº­t task
   */
  update(id, data) {
    try {
      const sheet = getSheet(this.SHEET_NAME);
      const rowIndex = Utils.findRowById(this.SHEET_NAME, id);
      
      if (rowIndex === -1) {
        return { success: false, error: 'KhÃ´ng tÃ¬m tháº¥y cÃ´ng viá»‡c' };
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
      
      this.logActivity('update', id, `Cáº­p nháº­t cÃ´ng viá»‡c: ${updatedTask.title}`);
      
      return {
        success: true,
        data: updatedTask,
        message: 'Cáº­p nháº­t thÃ nh cÃ´ng'
      };
      
    } catch (error) {
      return { success: false, error: error.message };
    }
  },
  
  /**
   * ÄÃ¡nh dáº¥u hoÃ n thÃ nh
   */
  complete(id) {
    try {
      const sheet = getSheet(this.SHEET_NAME);
      const rowIndex = Utils.findRowById(this.SHEET_NAME, id);
      
      if (rowIndex === -1) {
        return { success: false, error: 'KhÃ´ng tÃ¬m tháº¥y cÃ´ng viá»‡c' };
      }
      
      const headers = Utils.getHeaders(this.SHEET_NAME);
      const currentRow = sheet.getRange(rowIndex, 1, 1, headers.length).getValues()[0];
      const task = Utils.rowToObject(headers, currentRow);
      
      task.status = 'completed';
      task.completed_at = Utils.now();
      task.updated_at = Utils.now();
      
      const updatedRow = Utils.objectToRow(headers, task);
      sheet.getRange(rowIndex, 1, 1, headers.length).setValues([updatedRow]);
      
      this.logActivity('complete', id, `HoÃ n thÃ nh cÃ´ng viá»‡c: ${task.title}`);
      
      return {
        success: true,
        data: task,
        message: 'ÄÃ£ Ä‘Ã¡nh dáº¥u hoÃ n thÃ nh'
      };
      
    } catch (error) {
      return { success: false, error: error.message };
    }
  },
  
  /**
   * XÃ³a task
   */
  delete(id) {
    try {
      const sheet = getSheet(this.SHEET_NAME);
      const rowIndex = Utils.findRowById(this.SHEET_NAME, id);
      
      if (rowIndex === -1) {
        return { success: false, error: 'KhÃ´ng tÃ¬m tháº¥y cÃ´ng viá»‡c' };
      }
      
      const headers = Utils.getHeaders(this.SHEET_NAME);
      const currentRow = sheet.getRange(rowIndex, 1, 1, headers.length).getValues()[0];
      const task = Utils.rowToObject(headers, currentRow);
      
      sheet.deleteRow(rowIndex);
      
      this.logActivity('delete', id, `XÃ³a cÃ´ng viá»‡c: ${task.title}`);
      
      return {
        success: true,
        message: 'XÃ³a cÃ´ng viá»‡c thÃ nh cÃ´ng'
      };
      
    } catch (error) {
      return { success: false, error: error.message };
    }
  },
  
  /**
   * Kiá»ƒm tra task cÃ³ quÃ¡ háº¡n khÃ´ng
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
// CRUD operations cho Notes (Ghi chÃº)
// =====================================================

const NotesAPI = {
  
  SHEET_NAME: CONFIG.SHEETS.NOTES,
  
  /**
   * Láº¥y notes theo entity
   */
  getAll(params = {}) {
    try {
      let notes = Utils.getSheetData(this.SHEET_NAME);
      
      // Lá»c theo entity
      if (params.contact_id) {
        notes = notes.filter(n => n.contact_id === params.contact_id);
      }
      if (params.company_id) {
        notes = notes.filter(n => n.company_id === params.company_id);
      }
      if (params.deal_id) {
        notes = notes.filter(n => n.deal_id === params.deal_id);
      }
      
      // Sáº¯p xáº¿p theo thá»i gian má»›i nháº¥t
      notes.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      
      // PhÃ¢n trang
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
   * Táº¡o note má»›i
   */
  create(data) {
    try {
      if (!data.content) {
        return { success: false, error: 'Vui lÃ²ng nháº­p ná»™i dung ghi chÃº' };
      }
      
      if (!data.contact_id && !data.company_id && !data.deal_id) {
        return { success: false, error: 'Ghi chÃº pháº£i Ä‘Æ°á»£c liÃªn káº¿t vá»›i Ã­t nháº¥t má»™t Ä‘á»‘i tÆ°á»£ng' };
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
        message: 'ThÃªm ghi chÃº thÃ nh cÃ´ng'
      };
      
    } catch (error) {
      return { success: false, error: error.message };
    }
  },
  
  /**
   * Cáº­p nháº­t note
   */
  update(id, data) {
    try {
      const sheet = getSheet(this.SHEET_NAME);
      const rowIndex = Utils.findRowById(this.SHEET_NAME, id);
      
      if (rowIndex === -1) {
        return { success: false, error: 'KhÃ´ng tÃ¬m tháº¥y ghi chÃº' };
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
        message: 'Cáº­p nháº­t ghi chÃº thÃ nh cÃ´ng'
      };
      
    } catch (error) {
      return { success: false, error: error.message };
    }
  },
  
  /**
   * XÃ³a note
   */
  delete(id) {
    try {
      const sheet = getSheet(this.SHEET_NAME);
      const rowIndex = Utils.findRowById(this.SHEET_NAME, id);
      
      if (rowIndex === -1) {
        return { success: false, error: 'KhÃ´ng tÃ¬m tháº¥y ghi chÃº' };
      }
      
      sheet.deleteRow(rowIndex);
      
      return {
        success: true,
        message: 'XÃ³a ghi chÃº thÃ nh cÃ´ng'
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
// Thá»‘ng kÃª vÃ  bÃ¡o cÃ¡o tá»•ng quan
// =====================================================

const DashboardAPI = {
  
  /**
   * Láº¥y thá»‘ng kÃª tá»•ng quan cho dashboard
   */
  getStats() {
    try {
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
      
      // ===== MONTHLY REVENUE CHART (12 thÃ¡ng gáº§n nháº¥t) =====
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
      
      return {
        success: true,
        data: {
          contacts: contactStats,
          companies: companyStats,
          deals: dealStats,
          tasks: taskStats,
          pipeline,
          monthlyRevenue,
          topDeals,
          recentContacts
        }
      };
      
    } catch (error) {
      return { success: false, error: error.message };
    }
  },
  
  /**
   * Láº¥y hoáº¡t Ä‘á»™ng gáº§n Ä‘Ã¢y
   */
  getRecentActivities(params = {}) {
    try {
      const limit = parseInt(params.limit) || 20;
      
      let activities = Utils.getSheetData(CONFIG.SHEETS.ACTIVITIES);
      
      // Sáº¯p xáº¿p má»›i nháº¥t trÆ°á»›c
      activities.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      
      // Láº¥y limit activities
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
   * TÃ­nh thá»i gian tÆ°Æ¡ng Ä‘á»‘i
   */
  getTimeAgo(dateString) {
    const now = new Date();
    const date = new Date(dateString);
    const seconds = Math.floor((now - date) / 1000);
    
    if (seconds < 60) return 'Vá»«a xong';
    
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} phÃºt trÆ°á»›c`;
    
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} giá» trÆ°á»›c`;
    
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days} ngÃ y trÆ°á»›c`;
    
    const weeks = Math.floor(days / 7);
    if (weeks < 4) return `${weeks} tuáº§n trÆ°á»›c`;
    
    const months = Math.floor(days / 30);
    if (months < 12) return `${months} thÃ¡ng trÆ°á»›c`;
    
    return Utils.formatDate(dateString);
  }
};

// =====================================================
// CRM BACKEND - DRIVE API
// =====================================================
// File: DriveAPI.gs
// Xá»­ lÃ½ upload/download files tá»« Google Drive
// =====================================================

const DriveAPI = {
  
  /**
   * Upload file lÃªn Google Drive
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
        message: 'Upload thÃ nh cÃ´ng'
      };
      
    } catch (error) {
      Logger.log('Upload error: ' + error.toString());
      return { success: false, error: 'Upload tháº¥t báº¡i: ' + error.message };
    }
  },
  
  /**
   * Láº¥y danh sÃ¡ch files
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
   * XÃ³a file
   */
  deleteFile(fileId) {
    try {
      const file = DriveApp.getFileById(fileId);
      file.setTrashed(true);
      
      return {
        success: true,
        message: 'XÃ³a file thÃ nh cÃ´ng'
      };
      
    } catch (error) {
      return { success: false, error: 'KhÃ´ng thá»ƒ xÃ³a file: ' + error.message };
    }
  },
  
  /**
   * Láº¥y download URL
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

