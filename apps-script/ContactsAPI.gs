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
