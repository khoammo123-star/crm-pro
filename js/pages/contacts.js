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
                <th>Nguồn</th>
                <th>Ngày tạo</th>
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

    return `
      <tr>
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
        <td>${contact.source || '-'}</td>
        <td>${Utils.formatDate(contact.created_at)}</td>
        <td>
          <div class="table-actions">
            ${zaloPhone ? `
              <a href="https://zalo.me/${zaloPhone.replace(/\D/g, '')}" target="_blank" class="btn-icon btn-zalo" title="Chat Zalo" onclick="event.stopPropagation()">
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

    return `
      <div class="mobile-card" onclick="ContactsPage.viewContact('${contact.id}')">
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
          ${company ? `
            <div class="mobile-card-row">
              <span class="mobile-card-label">🏢 Công ty</span>
              <span class="mobile-card-value">${company.name}</span>
            </div>
          ` : ''}
          ${contact.phone ? `
            <div class="mobile-card-row">
              <span class="mobile-card-label">📞 Điện thoại</span>
              <span class="mobile-card-value">${contact.phone}</span>
            </div>
          ` : ''}
          ${contact.reminder_date ? `
            <div class="mobile-card-row">
              <span class="mobile-card-label">🔔 Nhắc gọi</span>
              <span class="mobile-card-value">${Utils.formatDate(contact.reminder_date)}</span>
            </div>
          ` : ''}
          <div class="mobile-card-row">
            <span class="mobile-card-label">📅 Ngày tạo</span>
            <span class="mobile-card-value">${Utils.formatDate(contact.created_at)}</span>
          </div>
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

    } catch (error) {
      Components.hideLoading();
      Components.toast(error.message, 'error');
    }
  },

  renderContactForm(contact = {}) {
    const sources = AppData.sources || ['Website', 'Facebook', 'Zalo', 'Giới thiệu', 'Khác'];
    const statuses = AppData.contactStatuses || [
      { id: 'lead', name: 'Lead' },
      { id: 'prospect', name: 'Tiềm năng' },
      { id: 'customer', name: 'Khách hàng' },
      { id: 'inactive', name: 'Không hoạt động' }
    ];
    const priorities = [
      { id: 'low', name: '🔵 Thấp' },
      { id: 'normal', name: '🟢 Bình thường' },
      { id: 'high', name: '🟠 Cao' },
      { id: 'urgent', name: '🔴 Khẩn cấp' }
    ];

    return `
      <form id="contactForm">
        <div class="form-row">
          ${Components.formField('first_name', 'Tên', 'text', { value: contact.first_name, required: true, placeholder: 'Nhập tên' })}
          ${Components.formField('last_name', 'Họ', 'text', { value: contact.last_name, placeholder: 'Nhập họ' })}
        </div>
        
        <div class="form-row">
          ${Components.formField('email', 'Email', 'email', { value: contact.email, placeholder: 'email@example.com' })}
          ${Components.formField('phone', 'Điện thoại', 'tel', { value: contact.phone, placeholder: '0912345678' })}
        </div>
        
        ${Components.formField('position', 'Chức vụ', 'text', { value: contact.position, placeholder: 'Ví dụ: Giám đốc' })}
        
        <div class="form-row">
          ${Components.formField('status', 'Trạng thái', 'select', {
      value: contact.status || 'lead',
      options: statuses.map(s => ({ value: s.id, label: s.name }))
    })}
          ${Components.formField('source', 'Nguồn', 'select', {
      value: contact.source,
      options: [{ value: '', label: '-- Chọn nguồn --' }, ...sources.map(s => ({ value: s, label: s }))]
    })}
        </div>
        
        ${Components.formField('address', 'Địa chỉ', 'text', { value: contact.address })}
        
        <hr style="margin: 20px 0; border: none; border-top: 1px solid var(--border-color);">
        <h4 style="margin-bottom: 15px; color: var(--text-secondary);">📅 Lịch hẹn & Nhắc nhở</h4>
        
        <div class="form-row">
          ${Components.formField('expected_need_date', 'Ngày cần SP', 'date', {
      value: contact.expected_need_date,
      hint: 'Khi nào khách dự kiến cần sản phẩm'
    })}
          ${Components.formField('reminder_date', 'Ngày nhắc gọi', 'date', {
      value: contact.reminder_date,
      hint: 'Hệ thống sẽ nhắc bạn gọi vào ngày này'
    })}
        </div>
        
        <div class="form-row">
          ${Components.formField('care_priority', 'Mức ưu tiên', 'select', {
      value: contact.care_priority || 'normal',
      options: priorities.map(p => ({ value: p.id, label: p.name }))
    })}
          ${Components.formField('zalo_phone', 'SĐT Zalo', 'tel', {
      value: contact.zalo_phone,
      placeholder: 'Nếu khác SĐT chính'
    })}
        </div>
        
        ${Components.formField('reminder_note', 'Ghi chú nhắc nhở', 'textarea', {
      value: contact.reminder_note,
      placeholder: 'VD: Hỏi về đơn hàng, giới thiệu sản phẩm mới...'
    })}
        
        ${Components.formField('notes', 'Ghi chú chung', 'textarea', { value: contact.notes })}
      </form>
    `;
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
