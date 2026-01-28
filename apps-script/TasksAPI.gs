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
