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
          <div class="mobile-card-row">
            <span class="mobile-card-label">📅 Ngày tạo</span>
            <span class="mobile-card-value">${Utils.formatDate(contact.created_at)}</span>
          </div>
        </div>
        
        <div class="mobile-card-actions" onclick="event.stopPropagation()">
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
        
        ${Components.formField('notes', 'Ghi chú', 'textarea', { value: contact.notes })}
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
