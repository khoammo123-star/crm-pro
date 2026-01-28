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
