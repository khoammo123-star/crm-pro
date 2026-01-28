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
