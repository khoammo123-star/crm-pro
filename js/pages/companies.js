// =====================================================
// CRM PRO - COMPANIES PAGE
// =====================================================

const CompaniesPage = {
  currentPage: 1,
  currentFilters: {},

  async render() {
    const container = document.getElementById('companiesPage');
    container.innerHTML = '<div class="loading-spinner" style="margin: 40px auto;"></div>';

    try {
      await this.loadCompanies();
    } catch (error) {
      container.innerHTML = Components.emptyState(
        '⚠️',
        'Không thể tải dữ liệu',
        error.message,
        'Thử lại',
        'CompaniesPage.render()'
      );
    }
  },

  async loadCompanies() {
    const container = document.getElementById('companiesPage');

    const params = {
      page: this.currentPage,
      limit: 20,
      ...this.currentFilters
    };

    const result = await API.getCompanies(params);
    const { data: companies, pagination } = result;

    container.innerHTML = `
      <!-- Toolbar -->
      <div class="list-toolbar">
        <div class="filter-group">
          <div class="search-box">
            <i data-lucide="search"></i>
            <input type="text" id="companySearch" placeholder="Tìm công ty..." value="${this.currentFilters.search || ''}">
          </div>
          
          <select class="form-select" id="companyStatusFilter" style="width: auto;">
            <option value="">Tất cả trạng thái</option>
            <option value="active" ${this.currentFilters.status === 'active' ? 'selected' : ''}>Hoạt động</option>
            <option value="potential" ${this.currentFilters.status === 'potential' ? 'selected' : ''}>Tiềm năng</option>
            <option value="inactive" ${this.currentFilters.status === 'inactive' ? 'selected' : ''}>Không hoạt động</option>
          </select>
        </div>
        
        <button class="btn btn-primary" onclick="CompaniesPage.openCreateModal()">
          <i data-lucide="plus"></i> Thêm công ty
        </button>
      </div>
      
      <!-- Grid -->
      <div class="grid-3">
        ${companies.length > 0 ? companies.map(c => this.renderCompanyCard(c)).join('') : `
          <div style="grid-column: 1 / -1;">
            ${Components.emptyState('🏢', 'Chưa có công ty nào', 'Thêm công ty đầu tiên', 'Thêm công ty', 'CompaniesPage.openCreateModal()')}
          </div>
        `}
      </div>
      
      ${companies.length > 0 ? Components.pagination(pagination.page, pagination.totalPages) : ''}
    `;

    this.initEventListeners();

    // Initialize Lucide icons for dynamically rendered content
    if (typeof lucide !== 'undefined') {
      lucide.createIcons();
    }
  },

  renderCompanyCard(company) {
    return `
      <div class="card" style="cursor: pointer" onclick="CompaniesPage.viewCompany('${company.id}')">
        <div class="card-body">
          <div style="display: flex; align-items: start; gap: 12px; margin-bottom: 16px;">
            <div class="avatar" style="background: linear-gradient(135deg, ${Utils.getAvatarColor(company.name)}, ${Utils.getAvatarColor(company.name + '2')})">
              🏢
            </div>
            <div style="flex: 1">
              <h4 style="margin-bottom: 4px">${company.name}</h4>
              <p class="text-secondary" style="font-size: 12px; margin: 0">${company.industry || 'Chưa phân loại'}</p>
            </div>
            ${Components.statusBadge(company.status || 'active', 'company')}
          </div>
          
          <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; text-align: center; padding-top: 12px; border-top: 1px solid var(--border-color-light);">
            <div>
              <div class="stat-label">Liên hệ</div>
              <div class="font-semibold">${company.contactCount || 0}</div>
            </div>
            <div>
              <div class="stat-label">Deals</div>
              <div class="font-semibold">${company.dealCount || 0}</div>
            </div>
            <div>
              <div class="stat-label">Doanh thu</div>
              <div class="font-semibold text-success">${company.totalDealValue ? Utils.formatCurrency(company.totalDealValue) : '-'}</div>
            </div>
          </div>
        </div>
      </div>
    `;
  },

  initEventListeners() {
    // Search
    const searchInput = document.getElementById('companySearch');
    if (searchInput) {
      searchInput.addEventListener('input', Utils.debounce((e) => {
        this.currentFilters.search = e.target.value;
        this.currentPage = 1;
        this.loadCompanies();
      }, 500));
    }

    // Status filter
    const statusFilter = document.getElementById('companyStatusFilter');
    if (statusFilter) {
      statusFilter.addEventListener('change', (e) => {
        this.currentFilters.status = e.target.value;
        this.currentPage = 1;
        this.loadCompanies();
      });
    }

    // Pagination
    document.querySelectorAll('.pagination-btn[data-page]').forEach(btn => {
      btn.addEventListener('click', () => {
        const page = parseInt(btn.dataset.page);
        if (page && !btn.disabled) {
          this.currentPage = page;
          this.loadCompanies();
        }
      });
    });
  },

  openCreateModal() {
    const content = this.renderCompanyForm();

    Components.openModal('Thêm công ty mới', content, {
      confirmText: 'Tạo công ty',
      onConfirm: () => this.createCompany()
    });
  },

  async openEditModal(id) {
    Components.showLoading();

    try {
      const result = await API.getCompany(id);
      const company = result.data;

      Components.hideLoading();

      const content = this.renderCompanyForm(company);

      Components.openModal('Sửa công ty', content, {
        confirmText: 'Lưu thay đổi',
        onConfirm: () => this.updateCompany(id)
      });

    } catch (error) {
      Components.hideLoading();
      Components.toast(error.message, 'error');
    }
  },

  renderCompanyForm(company = {}) {
    const industries = AppData.industries || [
      'Công nghệ', 'Tài chính - Ngân hàng', 'Bất động sản',
      'Giáo dục', 'Y tế - Sức khỏe', 'Bán lẻ', 'Sản xuất', 'Dịch vụ', 'Khác'
    ];

    const sizes = [
      { value: '1-10', label: '1-10 nhân viên' },
      { value: '11-50', label: '11-50 nhân viên' },
      { value: '51-200', label: '51-200 nhân viên' },
      { value: '201-500', label: '201-500 nhân viên' },
      { value: '500+', label: 'Trên 500 nhân viên' }
    ];

    return `
      <form id="companyForm">
        ${Components.formField('name', 'Tên công ty', 'text', { value: company.name, required: true, placeholder: 'Nhập tên công ty' })}
        
        <div class="form-row">
          ${Components.formField('industry', 'Ngành nghề', 'select', {
      value: company.industry,
      options: [{ value: '', label: '-- Chọn ngành --' }, ...industries.map(i => ({ value: i, label: i }))]
    })}
          ${Components.formField('size', 'Quy mô', 'select', {
      value: company.size,
      options: [{ value: '', label: '-- Chọn quy mô --' }, ...sizes]
    })}
        </div>
        
        <div class="form-row">
          ${Components.formField('email', 'Email', 'email', { value: company.email, placeholder: 'info@company.com' })}
          ${Components.formField('phone', 'Điện thoại', 'tel', { value: company.phone, placeholder: '0912345678' })}
        </div>
        
        ${Components.formField('website', 'Website', 'url', { value: company.website, placeholder: 'https://company.com' })}
        
        ${Components.formField('address', 'Địa chỉ', 'text', { value: company.address })}
        
        ${Components.formField('description', 'Mô tả', 'textarea', { value: company.description })}
        
        ${Components.formField('status', 'Trạng thái', 'select', {
      value: company.status || 'active',
      options: [
        { value: 'active', label: 'Hoạt động' },
        { value: 'potential', label: 'Tiềm năng' },
        { value: 'inactive', label: 'Không hoạt động' }
      ]
    })}
      </form>
    `;
  },

  async createCompany() {
    const form = document.getElementById('companyForm');

    if (!Components.validateForm(form)) {
      Components.toast('Vui lòng điền đầy đủ thông tin bắt buộc', 'error');
      return;
    }

    const data = Components.getFormData(form);

    Components.showLoading('Đang tạo...');

    try {
      await API.createCompany(data);
      Components.hideLoading();
      Components.closeModal();
      Components.toast('Tạo công ty thành công!', 'success');
      this.loadCompanies();
    } catch (error) {
      Components.hideLoading();
      Components.toast(error.message, 'error');
    }
  },

  async updateCompany(id) {
    const form = document.getElementById('companyForm');

    if (!Components.validateForm(form)) {
      Components.toast('Vui lòng điền đầy đủ thông tin bắt buộc', 'error');
      return;
    }

    const data = Components.getFormData(form);

    Components.showLoading('Đang lưu...');

    try {
      await API.updateCompany(id, data);
      Components.hideLoading();
      Components.closeModal();
      Components.toast('Cập nhật thành công!', 'success');
      this.loadCompanies();
    } catch (error) {
      Components.hideLoading();
      Components.toast(error.message, 'error');
    }
  },

  async deleteCompany(id) {
    const confirmed = await Components.confirm(
      'Bạn có chắc muốn xóa công ty này?',
      { title: 'Xác nhận xóa', danger: true, confirmText: 'Xóa' }
    );

    if (!confirmed) return;

    Components.showLoading('Đang xóa...');

    try {
      await API.deleteCompany(id);
      Components.hideLoading();
      Components.toast('Đã xóa công ty', 'success');
      this.loadCompanies();
    } catch (error) {
      Components.hideLoading();
      Components.toast(error.message, 'error');
    }
  },

  async viewCompany(id) {
    Components.showLoading();

    try {
      const result = await API.getCompany(id);
      const company = result.data;

      Components.hideLoading();

      const content = `
        <div class="detail-header">
          <div class="avatar avatar-lg" style="background: linear-gradient(135deg, ${Utils.getAvatarColor(company.name)}, ${Utils.getAvatarColor(company.name + '2')})">
            🏢
          </div>
          <div class="detail-info">
            <h3 class="detail-name">${company.name}</h3>
            <div class="detail-meta">
              ${company.industry ? `<span>${company.industry}</span>` : ''}
              ${Components.statusBadge(company.status || 'active', 'company')}
            </div>
          </div>
        </div>
        
        <div class="detail-grid">
          <div class="detail-field">
            <span class="detail-label">Email</span>
            <span class="detail-value">${company.email || '-'}</span>
          </div>
          <div class="detail-field">
            <span class="detail-label">Điện thoại</span>
            <span class="detail-value">${company.phone || '-'}</span>
          </div>
          <div class="detail-field">
            <span class="detail-label">Website</span>
            <span class="detail-value">${company.website ? `<a href="${company.website}" target="_blank">${company.website}</a>` : '-'}</span>
          </div>
          <div class="detail-field">
            <span class="detail-label">Quy mô</span>
            <span class="detail-value">${company.size || '-'}</span>
          </div>
        </div>
        
        ${company.address ? `
          <div class="detail-field mt-4">
            <span class="detail-label">Địa chỉ</span>
            <span class="detail-value">${company.address}</span>
          </div>
        ` : ''}
        
        <div class="detail-section mt-4">
          <h4 class="detail-section-title">📊 Thống kê</h4>
          <div class="detail-grid">
            <div class="detail-field">
              <span class="detail-label">Tổng liên hệ</span>
              <span class="detail-value">${company.stats?.totalContacts || 0}</span>
            </div>
            <div class="detail-field">
              <span class="detail-label">Tổng deals</span>
              <span class="detail-value">${company.stats?.totalDeals || 0}</span>
            </div>
            <div class="detail-field">
              <span class="detail-label">Deals đang mở</span>
              <span class="detail-value">${company.stats?.activeDeals || 0}</span>
            </div>
            <div class="detail-field">
              <span class="detail-label">Tổng doanh thu</span>
              <span class="detail-value text-success">${Utils.formatCurrency(company.stats?.wonValue || 0)}</span>
            </div>
          </div>
        </div>
        
        <div style="display: flex; gap: 12px; margin-top: 24px; padding-top: 16px; border-top: 1px solid var(--border-color-light);">
          <button class="btn btn-secondary" onclick="CompaniesPage.openEditModal('${id}'); Components.closeModal();">
            <i data-lucide="edit"></i> Sửa
          </button>
          <button class="btn btn-danger" onclick="CompaniesPage.deleteCompany('${id}'); Components.closeModal();">
            <i data-lucide="trash-2"></i> Xóa
          </button>
        </div>
      `;

      Components.openModal('Chi tiết công ty', content, {
        size: 'lg',
        hideFooter: true
      });

    } catch (error) {
      Components.hideLoading();
      Components.toast(error.message, 'error');
    }
  }
};
