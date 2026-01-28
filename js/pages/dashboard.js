// =====================================================
// CRM PRO - DASHBOARD PAGE
// =====================================================

const DashboardPage = {

    async render() {
        const container = document.getElementById('dashboardPage');

        if (!AppConfig.isConfigured()) {
            container.innerHTML = this.renderSetupGuide();
            return;
        }

        container.innerHTML = '<div class="loading-spinner"></div>';

        try {
            const result = await API.getDashboardStats();
            const stats = result.data;

            container.innerHTML = this.renderDashboard(stats);
            this.initCharts(stats);

        } catch (error) {
            container.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">⚠️</div>
          <div class="empty-state-title">Không thể tải dữ liệu</div>
          <p class="empty-state-desc">${error.message}</p>
          <button class="btn btn-primary" onclick="DashboardPage.render()">Thử lại</button>
        </div>
      `;
        }
    },

    renderSetupGuide() {
        return `
      <div class="card" style="max-width: 600px; margin: 40px auto;">
        <div class="card-header">
          <h2 class="card-title">🚀 Chào mừng đến CRM Pro!</h2>
        </div>
        <div class="card-body">
          <p>Để bắt đầu sử dụng, bạn cần thực hiện các bước sau:</p>
          
          <div style="margin: 24px 0;">
            <h4 style="margin-bottom: 12px;">1. Tạo Google Sheets</h4>
            <p class="text-secondary">Tạo một Google Sheets mới làm database</p>
          </div>
          
          <div style="margin: 24px 0;">
            <h4 style="margin-bottom: 12px;">2. Thêm Apps Script</h4>
            <p class="text-secondary">Vào Extensions → Apps Script, copy toàn bộ code từ thư mục <code>apps-script</code></p>
          </div>
          
          <div style="margin: 24px 0;">
            <h4 style="margin-bottom: 12px;">3. Cấu hình</h4>
            <p class="text-secondary">Mở file <code>Config.gs</code>, thay <code>SPREADSHEET_ID</code> bằng ID của Sheets</p>
          </div>
          
          <div style="margin: 24px 0;">
            <h4 style="margin-bottom: 12px;">4. Deploy Web App</h4>
            <p class="text-secondary">Deploy → New deployment → Web app → Execute as: Me → Who has access: Anyone</p>
          </div>
          
          <div style="margin: 24px 0;">
            <h4 style="margin-bottom: 12px;">5. Nhập URL</h4>
            <p class="text-secondary">Copy URL Web App và paste vào ô bên dưới:</p>
            
            <div style="margin-top: 12px;">
              <input type="text" id="setupApiUrl" class="form-input" placeholder="https://script.google.com/macros/s/...">
            </div>
          </div>
          
          <button class="btn btn-primary btn-lg w-full" onclick="DashboardPage.saveApiUrl()">
            Kết nối & Bắt đầu
          </button>
        </div>
      </div>
    `;
    },

    async saveApiUrl() {
        const input = document.getElementById('setupApiUrl');
        const url = input.value.trim();

        if (!url) {
            Components.toast('Vui lòng nhập URL', 'error');
            return;
        }

        Components.showLoading('Đang kết nối...');

        try {
            AppConfig.setApiUrl(url);

            // Test connection
            await API.testConnection();

            // Initialize database
            await API.initializeDatabase();

            // Load config
            const configResult = await API.getConfig();
            Object.assign(AppData, configResult.data, { loaded: true });

            Components.hideLoading();
            Components.toast('Kết nối thành công!', 'success');

            this.render();

        } catch (error) {
            Components.hideLoading();
            Components.toast('Kết nối thất bại: ' + error.message, 'error');
            AppConfig.setApiUrl('');
        }
    },

    renderDashboard(stats) {
        return `
      <!-- Stats Cards -->
      <div class="stats-grid">
        ${Components.statCard('👥', 'Liên hệ', stats.contacts.total, null, 'blue')}
        ${Components.statCard('🏢', 'Công ty', stats.companies.total, null, 'purple')}
        ${Components.statCard('💰', 'Deals đang mở', stats.deals.active, null, 'green')}
        ${Components.statCard('✅', 'Tasks hôm nay', stats.tasks.dueToday, null, 'orange')}
      </div>
      
      <!-- Charts -->
      <div class="dashboard-charts">
        <div class="card">
          <div class="card-header">
            <h3 class="card-title">📈 Doanh thu theo tháng</h3>
          </div>
          <div class="card-body">
            <div class="chart-container">
              <canvas id="revenueChart"></canvas>
            </div>
          </div>
        </div>
        
        <div class="card">
          <div class="card-header">
            <h3 class="card-title">📊 Pipeline</h3>
          </div>
          <div class="card-body">
            <div class="chart-container">
              <canvas id="pipelineChart"></canvas>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Bottom Section -->
      <div class="grid-2">
        <!-- Top Deals -->
        <div class="card">
          <div class="card-header">
            <h3 class="card-title">🔥 Top Deals</h3>
          </div>
          <div class="card-body">
            ${this.renderTopDeals(stats.topDeals)}
          </div>
        </div>
        
        <!-- Recent Contacts -->
        <div class="card">
          <div class="card-header">
            <h3 class="card-title">👤 Liên hệ mới</h3>
          </div>
          <div class="card-body">
            ${this.renderRecentContacts(stats.recentContacts)}
          </div>
        </div>
      </div>
      
      <!-- Summary Stats -->
      <div class="card mt-4">
        <div class="card-body">
          <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 24px; text-align: center;">
            <div>
              <div class="stat-label">Doanh thu tháng này</div>
              <div class="stat-value text-success">${Utils.formatCurrency(stats.deals.wonValueThisMonth)}</div>
            </div>
            <div>
              <div class="stat-label">Doanh thu năm nay</div>
              <div class="stat-value">${Utils.formatCurrency(stats.deals.wonValueThisYear)}</div>
            </div>
            <div>
              <div class="stat-label">Tỷ lệ chốt deal</div>
              <div class="stat-value">${stats.deals.winRate}%</div>
            </div>
            <div>
              <div class="stat-label">Tasks quá hạn</div>
              <div class="stat-value ${stats.tasks.overdue > 0 ? 'text-danger' : ''}">${stats.tasks.overdue}</div>
            </div>
          </div>
        </div>
      </div>
    `;
    },

    renderTopDeals(deals) {
        if (!deals || deals.length === 0) {
            return '<p class="text-secondary text-center">Chưa có deal nào</p>';
        }

        return deals.map(deal => `
      <div class="activity-item" style="cursor: pointer" onclick="App.navigateTo('deals', '${deal.id}')">
        <div class="activity-icon" style="background: ${deal.stageInfo?.color || '#3b82f6'}20; color: ${deal.stageInfo?.color || '#3b82f6'}">
          💰
        </div>
        <div class="activity-content">
          <div class="activity-text">${deal.title}</div>
          <div class="activity-time">${Utils.formatCurrency(deal.value)}</div>
        </div>
        ${Components.badge(deal.stageInfo?.name || deal.stage, Utils.getStatusBadgeClass(deal.stage).replace('badge-', ''))}
      </div>
    `).join('');
    },

    renderRecentContacts(contacts) {
        if (!contacts || contacts.length === 0) {
            return '<p class="text-secondary text-center">Chưa có liên hệ nào</p>';
        }

        return contacts.map(contact => `
      <div class="activity-item" style="cursor: pointer" onclick="App.navigateTo('contacts', '${contact.id}')">
        ${Components.avatar(contact.name.split(' ')[0], contact.name.split(' ').slice(1).join(' '), 'sm')}
        <div class="activity-content">
          <div class="activity-text">${contact.name}</div>
          <div class="activity-time">${contact.email || 'Chưa có email'}</div>
        </div>
        ${Components.statusBadge(contact.status, 'contact')}
      </div>
    `).join('');
    },

    initCharts(stats) {
        // Revenue Chart
        const revenueCtx = document.getElementById('revenueChart');
        if (revenueCtx && stats.monthlyRevenue) {
            new Chart(revenueCtx, {
                type: 'bar',
                data: {
                    labels: stats.monthlyRevenue.map(m => m.month),
                    datasets: [{
                        label: 'Doanh thu',
                        data: stats.monthlyRevenue.map(m => m.value),
                        backgroundColor: 'rgba(59, 130, 246, 0.8)',
                        borderRadius: 6
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { display: false }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: {
                                callback: value => Utils.formatCurrency(value)
                            }
                        }
                    }
                }
            });
        }

        // Pipeline Chart
        const pipelineCtx = document.getElementById('pipelineChart');
        if (pipelineCtx && stats.pipeline) {
            const activeStages = stats.pipeline.filter(s => !['won', 'lost'].includes(s.id));

            new Chart(pipelineCtx, {
                type: 'doughnut',
                data: {
                    labels: activeStages.map(s => s.name),
                    datasets: [{
                        data: activeStages.map(s => s.count),
                        backgroundColor: activeStages.map(s => s.color),
                        borderWidth: 0
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'bottom'
                        }
                    }
                }
            });
        }
    }
};
