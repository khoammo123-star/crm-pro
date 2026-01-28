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
