// =====================================================
// CRM PRO - DEALS PAGE (Kanban Pipeline)
// =====================================================

const DealsPage = {
  pipelineData: null,

  async render() {
    const container = document.getElementById('dealsPage');
    container.innerHTML = '<div class="loading-spinner" style="margin: 40px auto;"></div>';

    try {
      await this.loadPipeline();
    } catch (error) {
      container.innerHTML = Components.emptyState(
        '⚠️',
        'Không thể tải dữ liệu',
        error.message,
        'Thử lại',
        'DealsPage.render()'
      );
    }
  },

  async loadPipeline() {
    const container = document.getElementById('dealsPage');

    const result = await API.getDealsPipeline();
    this.pipelineData = result.data;

    container.innerHTML = `
      <!-- Header -->
      <div class="list-toolbar">
        <div class="filter-group">
          <div style="display: flex; align-items: center; gap: 16px; flex-wrap: wrap;">
            <span class="text-secondary">Tổng: <strong>${result.summary.totalDeals}</strong> deals</span>
            <span class="text-secondary">Giá trị: <strong class="text-success">${Utils.formatCurrency(result.summary.totalValue)}</strong></span>
          </div>
        </div>
        
        <button class="btn btn-primary desktop-only" onclick="DealsPage.openCreateModal()">
          <i class="lucide-plus"></i> Thêm deal
        </button>
      </div>
      
      <!-- Pipeline (Desktop: Kanban, Mobile: List) -->
      <div class="desktop-table">
        <div class="pipeline-container">
          ${this.renderPipeline(this.pipelineData)}
        </div>
      </div>
      
      <!-- Mobile Deal List -->
      <div class="mobile-cards">
        ${this.renderMobileDeals(this.pipelineData)}
      </div>
    `;

    this.initDragDrop();
  },

  renderPipeline(pipeline) {
    const stages = ['new', 'qualified', 'proposal', 'negotiation', 'won', 'lost'];

    return stages.map(stageId => {
      const stage = pipeline[stageId];
      if (!stage) return '';

      return `
        <div class="pipeline-column" data-stage="${stageId}">
          <div class="pipeline-header">
            <div class="pipeline-title">
              <span class="pipeline-dot" style="background: ${stage.color}"></span>
              <span class="pipeline-name">${stage.name}</span>
              <span class="pipeline-count">${stage.count}</span>
            </div>
            <div class="pipeline-value">${Utils.formatCurrency(stage.totalValue)}</div>
          </div>
          
          <div class="pipeline-cards" id="stage-${stageId}">
            ${stage.deals.length > 0
          ? stage.deals.map(deal => this.renderDealCard(deal)).join('')
          : '<p class="text-center text-secondary" style="padding: 20px; font-size: 13px;">Chưa có deal</p>'
        }
          </div>
        </div>
      `;
    }).join('');
  },

  renderDealCard(deal) {
    const company = deal.company;
    const contact = deal.contact;

    return `
      <div class="deal-card" data-id="${deal.id}" onclick="DealsPage.viewDeal('${deal.id}')">
        <div class="deal-card-title">${deal.title}</div>
        ${company ? `<div class="deal-card-company">🏢 ${company.name}</div>` : ''}
        ${contact ? `<div class="deal-card-company">👤 ${Utils.getFullName(contact.first_name, contact.last_name)}</div>` : ''}
        <div class="deal-card-footer">
          <span class="deal-card-value">${Utils.formatCurrency(deal.value)}</span>
          ${deal.expected_close ? `<span class="deal-card-date">${Utils.formatDate(deal.expected_close)}</span>` : ''}
        </div>
      </div>
    `;
  },

  // Mobile-friendly deal cards grouped by stage
  renderMobileDeals(pipeline) {
    const stages = ['new', 'qualified', 'proposal', 'negotiation', 'won', 'lost'];
    let html = '';

    stages.forEach(stageId => {
      const stage = pipeline[stageId];
      if (!stage || stage.deals.length === 0) return;

      html += `
        <div class="mobile-stage-group">
          <div class="mobile-stage-header" style="display: flex; align-items: center; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid var(--border-color-light); margin-bottom: 12px;">
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="width: 12px; height: 12px; border-radius: 50%; background: ${stage.color};"></span>
              <strong>${stage.name}</strong>
              <span class="badge">${stage.count}</span>
            </div>
            <span class="text-success font-semibold">${Utils.formatCurrency(stage.totalValue)}</span>
          </div>
          ${stage.deals.map(deal => this.renderMobileDealCard(deal, stage)).join('')}
        </div>
      `;
    });

    return html || '<div class="empty-state"><p>Chưa có deal nào. Nhấn + để thêm.</p></div>';
  },

  // Single mobile deal card
  renderMobileDealCard(deal, stage) {
    const company = deal.company;
    const contact = deal.contact;

    return `
      <div class="mobile-card" onclick="DealsPage.viewDeal('${deal.id}')">
        <div class="mobile-card-header">
          <div class="mobile-card-title">${deal.title}</div>
          <span class="text-success font-semibold">${Utils.formatCurrency(deal.value)}</span>
        </div>
        
        <div class="mobile-card-body">
          ${company ? `
            <div class="mobile-card-row">
              <span class="mobile-card-label">🏢 Công ty</span>
              <span class="mobile-card-value">${company.name}</span>
            </div>
          ` : ''}
          ${contact ? `
            <div class="mobile-card-row">
              <span class="mobile-card-label">👤 Liên hệ</span>
              <span class="mobile-card-value">${Utils.getFullName(contact.first_name, contact.last_name)}</span>
            </div>
          ` : ''}
          ${deal.expected_close ? `
            <div class="mobile-card-row">
              <span class="mobile-card-label">📅 Dự kiến</span>
              <span class="mobile-card-value">${Utils.formatDate(deal.expected_close)}</span>
            </div>
          ` : ''}
        </div>
        
        <div class="mobile-card-actions" onclick="event.stopPropagation()">
          <button class="btn btn-sm btn-secondary" onclick="DealsPage.viewDeal('${deal.id}')">
            <i class="lucide-eye"></i> Xem
          </button>
          <button class="btn btn-sm btn-secondary" onclick="DealsPage.openEditModal('${deal.id}')">
            <i class="lucide-edit"></i> Sửa
          </button>
        </div>
      </div>
    `;
  },

  initDragDrop() {
    const columns = document.querySelectorAll('.pipeline-cards');

    columns.forEach(column => {
      new Sortable(column, {
        group: 'deals',
        animation: 150,
        ghostClass: 'dragging',
        onEnd: async (evt) => {
          const dealId = evt.item.dataset.id;
          const newStage = evt.to.id.replace('stage-', '');
          const oldStage = evt.from.id.replace('stage-', '');

          if (newStage !== oldStage) {
            try {
              await API.updateDealStage(dealId, newStage);
              Components.toast('Đã cập nhật trạng thái deal', 'success');

              // Update local data
              this.loadPipeline();

            } catch (error) {
              Components.toast(error.message, 'error');
              // Revert
              this.loadPipeline();
            }
          }
        }
      });
    });
  },

  openCreateModal() {
    const content = this.renderDealForm();

    Components.openModal('Thêm deal mới', content, {
      confirmText: 'Tạo deal',
      onConfirm: () => this.createDeal()
    });
  },

  async openEditModal(id) {
    Components.showLoading();

    try {
      const result = await API.getDeal(id);
      const deal = result.data;

      Components.hideLoading();

      const content = this.renderDealForm(deal);

      Components.openModal('Sửa deal', content, {
        confirmText: 'Lưu thay đổi',
        onConfirm: () => this.updateDeal(id)
      });

    } catch (error) {
      Components.hideLoading();
      Components.toast(error.message, 'error');
    }
  },

  renderDealForm(deal = {}) {
    const stages = AppData.dealStages || [
      { id: 'new', name: 'Mới' },
      { id: 'qualified', name: 'Đủ điều kiện' },
      { id: 'proposal', name: 'Đề xuất' },
      { id: 'negotiation', name: 'Đàm phán' },
      { id: 'won', name: 'Thành công' },
      { id: 'lost', name: 'Thất bại' }
    ];

    const sources = AppData.sources || ['Website', 'Facebook', 'Zalo', 'Giới thiệu', 'Khác'];

    return `
      <form id="dealForm">
        ${Components.formField('title', 'Tên deal', 'text', { value: deal.title, required: true, placeholder: 'Ví dụ: Hợp đồng dịch vụ ABC' })}
        
        <div class="form-row">
          ${Components.formField('value', 'Giá trị (VNĐ)', 'number', { value: deal.value, placeholder: '0' })}
          ${Components.formField('stage', 'Giai đoạn', 'select', {
      value: deal.stage || 'new',
      options: stages.map(s => ({ value: s.id, label: s.name }))
    })}
        </div>
        
        ${Components.formField('expected_close', 'Ngày dự kiến đóng', 'date', { value: deal.expected_close ? deal.expected_close.split('T')[0] : '' })}
        
        ${Components.formField('source', 'Nguồn', 'select', {
      value: deal.source,
      options: [{ value: '', label: '-- Chọn nguồn --' }, ...sources.map(s => ({ value: s, label: s }))]
    })}
        
        ${Components.formField('description', 'Mô tả', 'textarea', { value: deal.description })}
        
        ${deal.stage === 'lost' ? Components.formField('lost_reason', 'Lý do thất bại', 'textarea', { value: deal.lost_reason }) : ''}
      </form>
    `;
  },

  async createDeal() {
    const form = document.getElementById('dealForm');

    if (!Components.validateForm(form)) {
      Components.toast('Vui lòng điền đầy đủ thông tin bắt buộc', 'error');
      return;
    }

    const data = Components.getFormData(form);

    Components.showLoading('Đang tạo...');

    try {
      await API.createDeal(data);
      Components.hideLoading();
      Components.closeModal();
      Components.toast('Tạo deal thành công!', 'success');
      this.loadPipeline();
    } catch (error) {
      Components.hideLoading();
      Components.toast(error.message, 'error');
    }
  },

  async updateDeal(id) {
    const form = document.getElementById('dealForm');

    if (!Components.validateForm(form)) {
      Components.toast('Vui lòng điền đầy đủ thông tin bắt buộc', 'error');
      return;
    }

    const data = Components.getFormData(form);

    Components.showLoading('Đang lưu...');

    try {
      await API.updateDeal(id, data);
      Components.hideLoading();
      Components.closeModal();
      Components.toast('Cập nhật thành công!', 'success');
      this.loadPipeline();
    } catch (error) {
      Components.hideLoading();
      Components.toast(error.message, 'error');
    }
  },

  async deleteDeal(id) {
    const confirmed = await Components.confirm(
      'Bạn có chắc muốn xóa deal này?',
      { title: 'Xác nhận xóa', danger: true, confirmText: 'Xóa' }
    );

    if (!confirmed) return;

    Components.showLoading('Đang xóa...');

    try {
      await API.deleteDeal(id);
      Components.hideLoading();
      Components.toast('Đã xóa deal', 'success');
      this.loadPipeline();
    } catch (error) {
      Components.hideLoading();
      Components.toast(error.message, 'error');
    }
  },

  async viewDeal(id) {
    Components.showLoading();

    try {
      const result = await API.getDeal(id);
      const deal = result.data;

      Components.hideLoading();

      const content = `
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 24px;">
          <div>
            <h3 style="margin-bottom: 8px;">${deal.title}</h3>
            <div style="display: flex; align-items: center; gap: 12px;">
              ${Components.badge(deal.stageInfo?.name || deal.stage, Utils.getStatusBadgeClass(deal.stage).replace('badge-', ''))}
              <span class="text-success font-semibold">${Utils.formatCurrency(deal.value)}</span>
            </div>
          </div>
        </div>
        
        <div class="detail-grid">
          <div class="detail-field">
            <span class="detail-label">Công ty</span>
            <span class="detail-value">${deal.company?.name || '-'}</span>
          </div>
          <div class="detail-field">
            <span class="detail-label">Liên hệ</span>
            <span class="detail-value">${deal.contact ? Utils.getFullName(deal.contact.first_name, deal.contact.last_name) : '-'}</span>
          </div>
          <div class="detail-field">
            <span class="detail-label">Nguồn</span>
            <span class="detail-value">${deal.source || '-'}</span>
          </div>
          <div class="detail-field">
            <span class="detail-label">Xác suất</span>
            <span class="detail-value">${deal.probability || 0}%</span>
          </div>
          <div class="detail-field">
            <span class="detail-label">Ngày dự kiến đóng</span>
            <span class="detail-value">${deal.expected_close ? Utils.formatDate(deal.expected_close) : '-'}</span>
          </div>
          <div class="detail-field">
            <span class="detail-label">Ngày tạo</span>
            <span class="detail-value">${Utils.formatDate(deal.created_at)}</span>
          </div>
        </div>
        
        ${deal.description ? `
          <div class="detail-section mt-4">
            <h4 class="detail-section-title">📝 Mô tả</h4>
            <p>${deal.description}</p>
          </div>
        ` : ''}
        
        ${deal.lost_reason ? `
          <div class="detail-section mt-4">
            <h4 class="detail-section-title text-danger">❌ Lý do thất bại</h4>
            <p>${deal.lost_reason}</p>
          </div>
        ` : ''}
        
        <div style="display: flex; gap: 12px; margin-top: 24px; padding-top: 16px; border-top: 1px solid var(--border-color-light);">
          <button class="btn btn-secondary" onclick="DealsPage.openEditModal('${id}'); Components.closeModal();">
            <i class="lucide-edit"></i> Sửa
          </button>
          <button class="btn btn-danger" onclick="DealsPage.deleteDeal('${id}'); Components.closeModal();">
            <i class="lucide-trash-2"></i> Xóa
          </button>
        </div>
      `;

      Components.openModal('Chi tiết deal', content, {
        size: 'lg',
        hideFooter: true
      });

    } catch (error) {
      Components.hideLoading();
      Components.toast(error.message, 'error');
    }
  }
};
