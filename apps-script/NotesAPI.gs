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
