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
