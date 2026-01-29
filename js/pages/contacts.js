// =====================================================
// CRM PRO - CONTACTS PAGE
// =====================================================

const ContactsPage = {
  currentPage: 1,
  currentFilters: {},

  async render() {
    const container = document.getElementById('contactsPage');
    container.innerHTML = '<div class="loading-spinner" style="margin: 40px auto;"></div>';

    try {
      await this.loadContacts();
    } catch (error) {
      container.innerHTML = Components.emptyState(
        '⚠️',
        'Không thể tải dữ liệu',
        error.message,
        'Thử lại',
        'ContactsPage.render()'
      );
    }
  },

  async loadContacts() {
    const container = document.getElementById('contactsPage');

    const params = {
      page: this.currentPage,
      limit: 20,
      ...this.currentFilters
    };

    const result = await API.getContacts(params);
    const { data: contacts, pagination } = result;

    container.innerHTML = `
      <!-- Toolbar -->
      <div class="list-toolbar">
        <div class="filter-group">
          <div class="search-box">
            <i data-lucide="search"></i>
            <input type="text" id="contactSearch" placeholder="Tìm liên hệ..." value="${this.currentFilters.search || ''}">
          </div>
          
          <select class="form-select" id="contactStatusFilter" style="width: auto;">
            <option value="">Tất cả trạng thái</option>
            <option value="lead" ${this.currentFilters.status === 'lead' ? 'selected' : ''}>Lead</option>
            <option value="prospect" ${this.currentFilters.status === 'prospect' ? 'selected' : ''}>Tiềm năng</option>
            <option value="customer" ${this.currentFilters.status === 'customer' ? 'selected' : ''}>Khách hàng</option>
            <option value="inactive" ${this.currentFilters.status === 'inactive' ? 'selected' : ''}>Không hoạt động</option>
          </select>
        </div>
        
        <button class="btn btn-primary desktop-only" onclick="ContactsPage.openCreateModal()">
          <i data-lucide="plus"></i> Thêm liên hệ
        </button>
      </div>
      
      <!-- Desktop Table -->
      <div class="card desktop-table">
        <div class="table-container">
          <table class="table">
            <thead>
              <tr>
                <th>Liên hệ</th>
                <th>Công ty</th>
                <th>Điện thoại</th>
                <th>Trạng thái</th>
                <th>Ưu tiên</th>
                <th>Nhắc gọi</th>
                <th>Cần SP</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              ${contacts.length > 0 ? contacts.map(c => this.renderContactRow(c)).join('') : `
                <tr>
                  <td colspan="7">
                    ${Components.emptyState('👥', 'Chưa có liên hệ nào', 'Thêm liên hệ đầu tiên của bạn', 'Thêm liên hệ', 'ContactsPage.openCreateModal()')}
                  </td>
                </tr>
              `}
            </tbody>
          </table>
        </div>
        
        ${Components.pagination(pagination.page, pagination.totalPages)}
      </div>
      
      <!-- Mobile Cards -->
      <div class="mobile-cards">
        ${contacts.length > 0 ? contacts.map(c => this.renderContactCard(c)).join('') : `
          ${Components.emptyState('👥', 'Chưa có liên hệ nào', 'Nhấn nút + để thêm', 'Thêm liên hệ', 'ContactsPage.openCreateModal()')}
        `}
        ${Components.pagination(pagination.page, pagination.totalPages)}
      </div>
    `;

    this.initEventListeners();

    // Initialize Lucide icons for dynamically rendered content
    if (typeof lucide !== 'undefined') {
      lucide.createIcons();
    }
  },

  renderContactRow(contact) {
    const company = contact.company;
    const zaloPhone = contact.zalo_phone || contact.phone;

    // Priority badge colors
    const priorityColors = {
      urgent: 'badge-danger',
      high: 'badge-warning',
      normal: 'badge-primary',
      low: 'badge-gray'
    };
    const priorityLabels = {
      urgent: '🔥 Khẩn',
      high: '⚡ Cao',
      normal: '📋 Thường',
      low: '📌 Thấp'
    };

    // Check if reminder is due (today or past)
    const reminderDate = contact.reminder_date;
    const isReminderDue = reminderDate && new Date(reminderDate) <= new Date();

    // Check if expected need date is coming soon (within 7 days)
    const needDate = contact.expected_need_date;
    const isNeedSoon = needDate && ((new Date(needDate) - new Date()) / (1000 * 60 * 60 * 24)) <= 7;

    return `
      <tr class="${isReminderDue ? 'row-highlight-warning' : ''}">
        <td>
          <div class="contact-row">
            ${Components.avatar(contact.first_name, contact.last_name)}
            <div class="contact-info">
              <div class="contact-name">${Utils.getFullName(contact.first_name, contact.last_name)}</div>
              <div class="contact-email">${contact.email || '-'}</div>
            </div>
          </div>
        </td>
        <td>${company ? company.name : '-'}</td>
        <td>${contact.phone || '-'}</td>
        <td>${Components.statusBadge(contact.status, 'contact')}</td>
        <td>
          ${contact.care_priority ? `<span class="badge ${priorityColors[contact.care_priority] || 'badge-gray'}">${priorityLabels[contact.care_priority] || contact.care_priority}</span>` : '-'}
        </td>
        <td>
          ${reminderDate ? `
            <span class="${isReminderDue ? 'text-danger font-semibold' : ''}" title="${contact.reminder_note || ''}">
              ${isReminderDue ? '🔔 ' : ''}${Utils.formatDate(reminderDate)}
            </span>
          ` : '-'}
        </td>
        <td>
          ${needDate ? `
            <span class="${isNeedSoon ? 'text-warning font-semibold' : ''}">
              ${isNeedSoon ? '📦 ' : ''}${Utils.formatDate(needDate)}
            </span>
          ` : '-'}
        </td>
        <td>
          <div class="table-actions">
            ${zaloPhone ? `
              <a href="https://zalo.me/${zaloPhone.replace(/\\D/g, '')}" target="_blank" class="btn-icon btn-zalo" title="Chat Zalo" onclick="event.stopPropagation()">
                <img src="icons/zalo.svg" width="18" height="18" alt="Zalo">
              </a>
            ` : ''}
            <button class="btn-icon" onclick="ContactsPage.viewContact('${contact.id}')" title="Xem">
              <i data-lucide="eye"></i>
            </button>
            <button class="btn-icon" onclick="ContactsPage.openEditModal('${contact.id}')" title="Sửa">
              <i data-lucide="edit"></i>
            </button>
            <button class="btn-icon" onclick="ContactsPage.deleteContact('${contact.id}')" title="Xóa">
              <i data-lucide="trash-2"></i>
            </button>
          </div>
        </td>
      </tr>
    `;
  },

  // Mobile card view for contacts
  renderContactCard(contact) {
    const company = contact.company;
    const fullName = Utils.getFullName(contact.first_name, contact.last_name);
    const zaloPhone = contact.zalo_phone || contact.phone;

    // Priority labels
    const priorityLabels = {
      urgent: '🔥 Khẩn cấp',
      high: '⚡ Cao',
      normal: '📋 Thường',
      low: '📌 Thấp'
    };

    // Check dates
    const reminderDate = contact.reminder_date;
    const isReminderDue = reminderDate && new Date(reminderDate) <= new Date();
    const needDate = contact.expected_need_date;
    const isNeedSoon = needDate && ((new Date(needDate) - new Date()) / (1000 * 60 * 60 * 24)) <= 7;

    return `
      <div class="mobile-card ${isReminderDue ? 'card-highlight-warning' : ''}" onclick="ContactsPage.viewContact('${contact.id}')">
        <div class="mobile-card-header">
          <div style="display: flex; align-items: center; gap: 12px;">
            ${Components.avatar(contact.first_name, contact.last_name)}
            <div>
              <div class="mobile-card-title">${fullName}</div>
              <div class="mobile-card-subtitle">${contact.email || contact.phone || '-'}</div>
            </div>
          </div>
          ${Components.statusBadge(contact.status, 'contact')}
        </div>
        
        <div class="mobile-card-body">
          ${contact.care_priority && contact.care_priority !== 'normal' ? `
            <div class="mobile-card-row">
              <span class="mobile-card-label">⚡ Ưu tiên</span>
              <span class="mobile-card-value ${contact.care_priority === 'urgent' ? 'text-danger' : contact.care_priority === 'high' ? 'text-warning' : ''}">${priorityLabels[contact.care_priority] || contact.care_priority}</span>
            </div>
          ` : ''}
          ${reminderDate ? `
            <div class="mobile-card-row">
              <span class="mobile-card-label">🔔 Nhắc gọi</span>
              <span class="mobile-card-value ${isReminderDue ? 'text-danger font-bold' : ''}">${isReminderDue ? '⏰ HÔM NAY - ' : ''}${Utils.formatDate(reminderDate)}</span>
            </div>
          ` : ''}
          ${needDate ? `
            <div class="mobile-card-row">
              <span class="mobile-card-label">📦 Cần SP</span>
              <span class="mobile-card-value ${isNeedSoon ? 'text-warning' : ''}">${isNeedSoon ? '⏳ ' : ''}${Utils.formatDate(needDate)}</span>
            </div>
          ` : ''}
          ${company ? `
            <div class="mobile-card-row">
              <span class="mobile-card-label">🏢 Công ty</span>
              <span class="mobile-card-value">${company.name}</span>
            </div>
          ` : ''}
          ${contact.phone ? `
            <div class="mobile-card-row">
              <span class="mobile-card-label">📞 SĐT</span>
              <span class="mobile-card-value">${contact.phone}</span>
            </div>
          ` : ''}
        </div>
        
        <div class="mobile-card-actions" onclick="event.stopPropagation()">
          ${zaloPhone ? `
            <a href="https://zalo.me/${zaloPhone.replace(/\\D/g, '')}" target="_blank" class="btn btn-sm btn-zalo" title="Chat Zalo">
              <img src="icons/zalo.svg" width="16" height="16" alt="Zalo"> Zalo
            </a>
          ` : ''}
          <button class="btn btn-sm btn-secondary" onclick="ContactsPage.viewContact('${contact.id}')">
            <i data-lucide="eye"></i> Xem
          </button>
          <button class="btn btn-sm btn-secondary" onclick="ContactsPage.openEditModal('${contact.id}')">
            <i data-lucide="edit"></i> Sửa
          </button>
          <button class="btn btn-sm btn-danger" onclick="ContactsPage.deleteContact('${contact.id}')">
            <i data-lucide="trash-2"></i>
          </button>
        </div>
      </div>
    `;
  },

  initEventListeners() {
    // Search
    const searchInput = document.getElementById('contactSearch');
    if (searchInput) {
      searchInput.addEventListener('input', Utils.debounce((e) => {
        this.currentFilters.search = e.target.value;
        this.currentPage = 1;
        this.loadContacts();
      }, 500));
    }

    // Status filter
    const statusFilter = document.getElementById('contactStatusFilter');
    if (statusFilter) {
      statusFilter.addEventListener('change', (e) => {
        this.currentFilters.status = e.target.value;
        this.currentPage = 1;
        this.loadContacts();
      });
    }

    // Pagination
    document.querySelectorAll('.pagination-btn[data-page]').forEach(btn => {
      btn.addEventListener('click', () => {
        const page = parseInt(btn.dataset.page);
        if (page && !btn.disabled) {
          this.currentPage = page;
          this.loadContacts();
        }
      });
    });
  },

  // View contact in Drawer (side panel)
  viewContact(id) {
    if (typeof Drawer !== 'undefined') {
      Drawer.open(id);
    } else {
      // Fallback to edit modal
      this.openEditModal(id);
    }
  },

  // Confirm delete
  confirmDelete(id) {
    if (confirm('Bạn có chắc chắn muốn xóa liên hệ này?')) {
      this.deleteContact(id);
    }
  },

  openCreateModal() {
    const content = this.renderContactForm();

    Components.openModal('Thêm liên hệ mới', content, {
      confirmText: 'Tạo liên hệ',
      onConfirm: () => this.createContact()
    });

    // Init cascade after modal renders
    setTimeout(() => {
      this.initProvinceDistrictCascade();
      if (typeof lucide !== 'undefined') lucide.createIcons();
    }, 100);
  },

  async openEditModal(id) {
    Components.showLoading();

    try {
      const result = await API.getContact(id);
      const contact = result.data;

      Components.hideLoading();

      const content = this.renderContactForm(contact);

      Components.openModal('Sửa liên hệ', content, {
        confirmText: 'Lưu thay đổi',
        onConfirm: () => this.updateContact(id)
      });

      // Init cascade after modal renders
      setTimeout(() => {
        this.initProvinceDistrictCascade();
        if (typeof lucide !== 'undefined') lucide.createIcons();
      }, 100);

    } catch (error) {
      Components.hideLoading();
      Components.toast(error.message, 'error');
    }
  },

  renderContactForm(contact = {}) {
    const statuses = AppData.contactStatuses || [
      { id: 'lead', name: 'Lead' },
      { id: 'prospect', name: 'Tiềm năng' },
      { id: 'customer', name: 'Khách hàng' },
      { id: 'inactive', name: 'Không hoạt động' }
    ];

    // Preset sources
    const sources = [
      { id: 'facebook', name: '📘 Facebook' },
      { id: 'youtube', name: '📺 YouTube' },
      { id: 'tiktok', name: '🎵 TikTok' },
      { id: 'instagram', name: '📸 Instagram' },
      { id: 'zalo', name: '💬 Zalo' },
      { id: 'website', name: '🌐 Website' },
      { id: 'n8n', name: '🤖 N8N' },
      { id: 'referral', name: '👥 Giới thiệu' },
      { id: 'phone', name: '📞 Gọi điện' },
      { id: 'other', name: '📋 Khác' }
    ];

    // Get provinces list
    const provinces = typeof VietnamData !== 'undefined' ? VietnamData.getProvinces() : [];
    const districts = contact.province && typeof VietnamData !== 'undefined'
      ? VietnamData.getDistricts(contact.province)
      : [];

    return `
      <form id="contactForm">
        <!-- Thông tin khách hàng -->
        <h4 class="form-section-title">👤 Thông tin khách hàng</h4>
        
        <div class="form-row">
          ${Components.formField('first_name', 'Tên khách *', 'text', {
      value: contact.first_name,
      required: true,
      placeholder: 'Nhập tên khách hàng'
    })}
          ${Components.formField('phone', 'Số điện thoại *', 'tel', {
      value: contact.phone,
      required: true,
      placeholder: '0912345678'
    })}
        </div>
        
        ${Components.formField('zalo_phone', 'SĐT Zalo (nếu khác)', 'tel', {
      value: contact.zalo_phone,
      placeholder: 'Để trống nếu dùng SĐT chính'
    })}
        
        <!-- Sản phẩm & Thời gian -->
        <h4 class="form-section-title">📦 Sản phẩm & Thời gian</h4>
        
        <div class="form-row">
          ${Components.formField('product_needed', 'Sản phẩm cần *', 'text', {
      value: contact.product_needed,
      required: true,
      placeholder: 'VD: Máy bơm nước, Bồn inox...',
      list: 'productsList'
    })}
          ${Components.formField('expected_need_date', 'Ngày cần SP *', 'date', {
      value: contact.expected_need_date,
      required: true
    })}
        </div>
        
        <!-- Địa chỉ -->
        <h4 class="form-section-title">📍 Địa chỉ</h4>
        
        <div class="form-row">
          ${Components.formField('province', 'Tỉnh/Thành phố', 'select', {
      value: contact.province,
      options: [
        { value: '', label: '-- Chọn tỉnh --' },
        ...provinces.map(p => ({ value: p.id, label: p.name }))
      ]
    })}
          ${Components.formField('district', 'Quận/Huyện', 'select', {
      value: contact.district,
      options: [
        { value: '', label: '-- Chọn huyện --' },
        ...districts.map(d => ({ value: d.id, label: d.name }))
      ]
    })}
        </div>
        
        <div class="form-row">
          ${Components.formField('google_map_url', 'Link Google Map', 'url', {
      value: contact.google_map_url,
      placeholder: 'https://maps.google.com/...'
    })}
          <div class="form-group">
            <label>&nbsp;</label>
            <a href="${contact.google_map_url || '#'}" target="_blank" class="btn btn-secondary btn-sm ${!contact.google_map_url ? 'disabled' : ''}" id="openMapBtn">
              <i data-lucide="map-pin"></i> Mở Map
            </a>
          </div>
        </div>
        
        <!-- Phân loại -->
        <h4 class="form-section-title">📊 Phân loại</h4>
        
        <div class="form-row">
          ${Components.formField('status', 'Trạng thái', 'select', {
      value: contact.status || 'lead',
      options: statuses.map(s => ({ value: s.id, label: s.name }))
    })}
          ${Components.formField('source', 'Nguồn khách', 'select', {
      value: contact.source,
      options: [
        { value: '', label: '-- Chọn nguồn --' },
        ...sources.map(s => ({ value: s.id, label: s.name }))
      ]
    })}
        </div>
        
        <!-- Ghi chú -->
        ${Components.formField('notes', '📝 Ghi chú', 'textarea', {
      value: contact.notes,
      placeholder: 'Ghi chú thêm về khách hàng...'
    })}
      </form>
      
      <style>
        .form-section-title {
          margin: 20px 0 12px 0;
          padding-bottom: 8px;
          border-bottom: 1px solid var(--border-color-light);
          color: var(--text-secondary);
          font-size: var(--font-size-sm);
          font-weight: var(--font-weight-semibold);
        }
        .form-section-title:first-child {
          margin-top: 0;
        }
      </style>
    `;
  },

  // Initialize province/district cascade
  initProvinceDistrictCascade() {
    const provinceSelect = document.getElementById('province');
    const districtSelect = document.getElementById('district');

    if (provinceSelect && districtSelect) {
      provinceSelect.addEventListener('change', (e) => {
        const provinceId = e.target.value;
        const districts = typeof VietnamData !== 'undefined'
          ? VietnamData.getDistricts(provinceId)
          : [];

        districtSelect.innerHTML = '<option value="">-- Chọn huyện --</option>' +
          districts.map(d => `<option value="${d.id}">${d.name}</option>`).join('');
      });
    }

    // Update Google Map button
    const mapInput = document.getElementById('google_map_url');
    const mapBtn = document.getElementById('openMapBtn');
    if (mapInput && mapBtn) {
      mapInput.addEventListener('input', (e) => {
        const url = e.target.value;
        mapBtn.href = url || '#';
        mapBtn.classList.toggle('disabled', !url);
      });
    }
  },

  async createContact() {
    const form = document.getElementById('contactForm');

    if (!Components.validateForm(form)) {
      Components.toast('Vui lòng điền đầy đủ thông tin bắt buộc', 'error');
      return;
    }

    const data = Components.getFormData(form);

    Components.showLoading('Đang tạo...');

    try {
      await API.createContact(data);
      Components.hideLoading();
      Components.closeModal();
      Components.toast('Tạo liên hệ thành công!', 'success');
      this.loadContacts();
    } catch (error) {
      Components.hideLoading();
      Components.toast(error.message, 'error');
    }
  },

  async updateContact(id) {
    const form = document.getElementById('contactForm');

    if (!Components.validateForm(form)) {
      Components.toast('Vui lòng điền đầy đủ thông tin bắt buộc', 'error');
      return;
    }

    const data = Components.getFormData(form);

    Components.showLoading('Đang lưu...');

    try {
      await API.updateContact(id, data);
      Components.hideLoading();
      Components.closeModal();
      Components.toast('Cập nhật thành công!', 'success');
      this.loadContacts();
    } catch (error) {
      Components.hideLoading();
      Components.toast(error.message, 'error');
    }
  },

  async deleteContact(id) {
    const confirmed = await Components.confirm(
      'Bạn có chắc muốn xóa liên hệ này?',
      { title: 'Xác nhận xóa', danger: true, confirmText: 'Xóa' }
    );

    if (!confirmed) return;

    Components.showLoading('Đang xóa...');

    try {
      await API.deleteContact(id);
      Components.hideLoading();
      Components.toast('Đã xóa liên hệ', 'success');
      this.loadContacts();
    } catch (error) {
      Components.hideLoading();
      Components.toast(error.message, 'error');
    }
  },

  async viewContact(id) {
    Components.showLoading();

    try {
      const result = await API.getContact(id);
      const contact = result.data;

      Components.hideLoading();

      const content = `
        <div class="detail-header">
          ${Components.avatar(contact.first_name, contact.last_name, 'lg')}
          <div class="detail-info">
            <h3 class="detail-name">${Utils.getFullName(contact.first_name, contact.last_name)}</h3>
            <div class="detail-meta">
              ${contact.position ? `<span>${contact.position}</span>` : ''}
              ${contact.company ? `<span>@ ${contact.company.name}</span>` : ''}
              ${Components.statusBadge(contact.status, 'contact')}
            </div>
          </div>
        </div>
        
        <div class="detail-grid">
          <div class="detail-field">
            <span class="detail-label">Email</span>
            <span class="detail-value">${contact.email || '-'}</span>
          </div>
          <div class="detail-field">
            <span class="detail-label">Điện thoại</span>
            <span class="detail-value">${contact.phone || '-'}</span>
          </div>
          <div class="detail-field">
            <span class="detail-label">Nguồn</span>
            <span class="detail-value">${contact.source || '-'}</span>
          </div>
          <div class="detail-field">
            <span class="detail-label">Ngày tạo</span>
            <span class="detail-value">${Utils.formatDate(contact.created_at)}</span>
          </div>
        </div>
        
        ${contact.notes ? `
          <div class="detail-section mt-4">
            <h4 class="detail-section-title">📝 Ghi chú</h4>
            <p>${contact.notes}</p>
          </div>
        ` : ''}
        
        <div class="detail-section mt-4">
          <h4 class="detail-section-title">📊 Thống kê</h4>
          <div class="detail-grid">
            <div class="detail-field">
              <span class="detail-label">Tổng deals</span>
              <span class="detail-value">${contact.stats?.totalDeals || 0}</span>
            </div>
            <div class="detail-field">
              <span class="detail-label">Deals thành công</span>
              <span class="detail-value">${contact.stats?.wonDeals || 0}</span>
            </div>
            <div class="detail-field">
              <span class="detail-label">Tổng giá trị</span>
              <span class="detail-value">${Utils.formatCurrency(contact.stats?.totalValue || 0)}</span>
            </div>
            <div class="detail-field">
              <span class="detail-label">Tasks chờ xử lý</span>
              <span class="detail-value">${contact.stats?.pendingTasks || 0}</span>
            </div>
          </div>
        </div>
      `;

      Components.openModal('Chi tiết liên hệ', content, {
        size: 'lg',
        hideFooter: true
      });

    } catch (error) {
      Components.hideLoading();
      Components.toast(error.message, 'error');
    }
  }
};
