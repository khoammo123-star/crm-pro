// =====================================================
// CRM PRO - MAIN APPLICATION
// =====================================================

const App = {
    currentPage: 'dashboard',

    // Check if mobile viewport
    isMobile() {
        return window.innerWidth <= 768;
    },

    // Update mobile/desktop views visibility
    updateMobileView() {
        const isMobile = this.isMobile();

        document.querySelectorAll('.desktop-table, .desktop-only').forEach(el => {
            el.style.display = isMobile ? 'none' : '';
        });

        document.querySelectorAll('.mobile-cards').forEach(el => {
            el.style.display = isMobile ? 'block' : 'none';
        });
    },

    async init() {
        // Initialize Lucide icons
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }

        // Apply saved theme
        const savedTheme = localStorage.getItem(AppConfig.STORAGE_KEYS.THEME) || 'light';
        applyTheme(savedTheme);
        document.getElementById('themeSelect').value = savedTheme;

        // Apply saved API URL
        const savedUrl = AppConfig.getApiUrl();
        if (savedUrl) {
            document.getElementById('apiUrlInput').value = savedUrl;
        }

        // Apply sidebar state
        const sidebarCollapsed = localStorage.getItem(AppConfig.STORAGE_KEYS.SIDEBAR_COLLAPSED) === 'true';
        if (sidebarCollapsed) {
            document.getElementById('sidebar').classList.add('collapsed');
        }

        // Setup event listeners
        this.setupEventListeners();

        // Handle window resize for mobile/desktop toggle
        window.addEventListener('resize', () => this.updateMobileView());

        // Check for hash navigation
        const hash = window.location.hash.slice(1) || 'dashboard';

        // Load config if API is set
        if (AppConfig.isConfigured()) {
            try {
                const configResult = await API.getConfig();
                Object.assign(AppData, configResult.data, { loaded: true });
            } catch (error) {
                console.error('Failed to load config:', error);
            }
        }

        // Navigate to initial page
        this.navigateTo(hash);

        // Initial mobile view update
        setTimeout(() => this.updateMobileView(), 100);
    },

    setupEventListeners() {
        // Sidebar toggle
        document.getElementById('sidebarToggle').addEventListener('click', () => {
            const sidebar = document.getElementById('sidebar');
            sidebar.classList.toggle('collapsed');
            localStorage.setItem(
                AppConfig.STORAGE_KEYS.SIDEBAR_COLLAPSED,
                sidebar.classList.contains('collapsed')
            );
        });

        // Mobile menu
        document.getElementById('mobileMenuBtn').addEventListener('click', () => {
            const sidebar = document.getElementById('sidebar');
            sidebar.classList.toggle('mobile-open');

            // Create/toggle overlay
            let overlay = document.querySelector('.mobile-overlay');
            if (!overlay) {
                overlay = document.createElement('div');
                overlay.className = 'mobile-overlay';
                overlay.onclick = () => {
                    sidebar.classList.remove('mobile-open');
                    overlay.classList.remove('active');
                };
                document.body.appendChild(overlay);
            }
            overlay.classList.toggle('active');
        });

        // Navigation
        document.querySelectorAll('.nav-item[data-page]').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const page = item.dataset.page;
                this.navigateTo(page);

                // Close mobile menu
                document.getElementById('sidebar').classList.remove('mobile-open');
                const overlay = document.querySelector('.mobile-overlay');
                if (overlay) overlay.classList.remove('active');
            });
        });

        // Theme toggle button
        document.getElementById('themeToggle').addEventListener('click', () => {
            const current = document.documentElement.getAttribute('data-theme');
            const newTheme = current === 'dark' ? 'light' : 'dark';
            applyTheme(newTheme);
            localStorage.setItem(AppConfig.STORAGE_KEYS.THEME, newTheme);
            document.getElementById('themeSelect').value = newTheme;
        });

        // Settings button (desktop - in sidebar)
        document.getElementById('settingsBtn').addEventListener('click', () => {
            this.showDatabaseSettings();
        });

        // Settings button (mobile - in header)
        const mobileSettingsBtn = document.getElementById('mobileSettingsBtn');
        if (mobileSettingsBtn) {
            mobileSettingsBtn.addEventListener('click', () => {
                this.showDatabaseSettings();
            });
        }

        // Close settings on overlay click
        document.getElementById('settingsOverlay').addEventListener('click', (e) => {
            if (e.target === document.getElementById('settingsOverlay')) {
                closeSettingsModal();
            }
        });

        // Modal overlay close
        document.getElementById('modalOverlay').addEventListener('click', (e) => {
            if (e.target === document.getElementById('modalOverlay')) {
                Components.closeModal();
            }
        });

        // Global search
        const globalSearch = document.getElementById('globalSearch');
        if (globalSearch) {
            globalSearch.addEventListener('input', Utils.debounce((e) => {
                const query = e.target.value.trim();
                if (query.length >= 2) {
                    this.globalSearch(query);
                }
            }, 500));
        }

        // Add new button
        document.getElementById('addNewBtn').addEventListener('click', () => {
            this.showAddNewMenu();
        });

        // Hash change
        window.addEventListener('hashchange', () => {
            const hash = window.location.hash.slice(1) || 'dashboard';
            this.navigateTo(hash);
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            // Escape to close modals
            if (e.key === 'Escape') {
                Components.closeModal();
                closeSettingsModal();
            }

            // Ctrl+K for global search
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                document.getElementById('globalSearch').focus();
            }
        });

        // === MOBILE: Bottom Navigation ===
        document.querySelectorAll('.bottom-nav-item[data-page]').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const page = item.dataset.page;
                this.navigateTo(page);

                // Update bottom nav active state
                document.querySelectorAll('.bottom-nav-item').forEach(navItem => {
                    navItem.classList.toggle('active', navItem.dataset.page === page);
                });
            });
        });

        // === MOBILE: FAB (Floating Action Button) ===
        const fabBtn = document.getElementById('fabBtn');
        if (fabBtn) {
            fabBtn.addEventListener('click', () => {
                this.showAddNewMenu();
            });
        }

        // === MOBILE: Overlay close sidebar ===
        const mobileOverlay = document.getElementById('mobileOverlay');
        if (mobileOverlay) {
            mobileOverlay.addEventListener('click', () => {
                document.getElementById('sidebar').classList.remove('mobile-open');
                mobileOverlay.classList.remove('active');
            });
        }
    },

    navigateTo(page, id = null) {
        // Update URL
        window.location.hash = page;

        // Update sidebar nav
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.toggle('active', item.dataset.page === page);
        });

        // Update bottom nav (mobile)
        document.querySelectorAll('.bottom-nav-item').forEach(item => {
            item.classList.toggle('active', item.dataset.page === page);
        });

        // Hide all pages
        document.querySelectorAll('.page').forEach(p => {
            p.style.display = 'none';
        });

        // Show target page
        const pageEl = document.getElementById(`${page}Page`);
        if (pageEl) {
            pageEl.style.display = 'block';
        }

        // Update title
        const titles = {
            dashboard: 'Dashboard',
            contacts: 'Liên hệ',
            companies: 'Công ty',
            deals: 'Deals',
            tasks: 'Công việc'
        };
        document.getElementById('pageTitle').textContent = titles[page] || page;

        this.currentPage = page;

        // Render page content
        switch (page) {
            case 'dashboard':
                DashboardPage.render();
                break;
            case 'contacts':
                ContactsPage.render();
                break;
            case 'companies':
                CompaniesPage.render();
                break;
            case 'deals':
                DealsPage.render();
                break;
            case 'tasks':
                TasksPage.render();
                break;
        }

        // Update mobile/desktop view after render
        setTimeout(() => {
            this.updateMobileView();
            // Refresh Lucide icons for dynamically added content
            if (typeof lucide !== 'undefined') {
                lucide.createIcons();
            }
        }, 50);
    },

    showAddNewMenu() {
        const items = [
            { icon: '👤', label: 'Liên hệ mới', action: 'ContactsPage.openCreateModal()' },
            { icon: '🏢', label: 'Công ty mới', action: 'CompaniesPage.openCreateModal()' },
            { icon: '💰', label: 'Deal mới', action: 'DealsPage.openCreateModal()' },
            { icon: '✅', label: 'Công việc mới', action: 'TasksPage.openCreateModal()' }
        ];

        const content = `
      <div style="display: flex; flex-direction: column; gap: 8px;">
        ${items.map(item => `
          <button class="btn btn-secondary" style="justify-content: flex-start;" onclick="${item.action}; Components.closeModal();">
            <span style="font-size: 1.25rem;">${item.icon}</span>
            <span>${item.label}</span>
          </button>
        `).join('')}
      </div>
    `;

        Components.openModal('Thêm mới', content, { hideFooter: true });
    },

    async globalSearch(query) {
        try {
            const result = await API.searchContacts(query, 5);
            // TODO: Show search results dropdown
            console.log('Search results:', result.data);
        } catch (error) {
            console.error('Search error:', error);
        }
    },

    /**
     * Show database settings modal for switching between backends
     */
    showDatabaseSettings() {
        const currentType = AppConfig.getDatabaseType();
        const sheetsUrl = AppConfig.getApiUrl();
        const supabaseConfig = AppConfig.getSupabaseConfig();

        const content = `
            <div class="form-group">
                <label class="form-label">Chọn Database Backend</label>
                <div style="display: flex; gap: 10px; margin-bottom: 20px;">
                    <label style="flex: 1; padding: 15px; border: 2px solid ${currentType === 'sheets' ? 'var(--primary)' : 'var(--border)'}; border-radius: 8px; cursor: pointer; text-align: center;">
                        <input type="radio" name="dbType" value="sheets" ${currentType === 'sheets' ? 'checked' : ''} style="display: none;">
                        <div style="font-size: 24px; margin-bottom: 5px;">📊</div>
                        <div style="font-weight: 600;">Google Sheets</div>
                        <div style="font-size: 12px; color: var(--text-secondary);">Đơn giản, miễn phí</div>
                    </label>
                    <label style="flex: 1; padding: 15px; border: 2px solid ${currentType === 'supabase' ? 'var(--primary)' : 'var(--border)'}; border-radius: 8px; cursor: pointer; text-align: center;">
                        <input type="radio" name="dbType" value="supabase" ${currentType === 'supabase' ? 'checked' : ''} style="display: none;">
                        <div style="font-size: 24px; margin-bottom: 5px;">🚀</div>
                        <div style="font-weight: 600;">Supabase</div>
                        <div style="font-size: 12px; color: var(--text-secondary);">50x nhanh hơn</div>
                    </label>
                </div>
            </div>
            
            <div id="sheetsConfig" style="display: ${currentType === 'sheets' ? 'block' : 'none'};">
                <div class="form-group">
                    <label class="form-label">Google Apps Script URL</label>
                    <input type="text" class="form-input" id="sheetsUrlInput" value="${sheetsUrl}" placeholder="https://script.google.com/macros/s/...">
                    <small style="color: var(--text-secondary);">Xem HUONG_DAN_SETUP.html để lấy URL</small>
                </div>
            </div>
            
            <div id="supabaseConfig" style="display: ${currentType === 'supabase' ? 'block' : 'none'};">
                <div class="form-group">
                    <label class="form-label">Supabase Project URL</label>
                    <input type="text" class="form-input" id="supabaseUrlInput" value="${supabaseConfig.url}" placeholder="https://xxxxx.supabase.co">
                </div>
                <div class="form-group">
                    <label class="form-label">Supabase Anon Key</label>
                    <input type="text" class="form-input" id="supabaseKeyInput" value="${supabaseConfig.anonKey}" placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...">
                </div>
                <div style="background: var(--bg-secondary); padding: 10px; border-radius: 8px; margin-bottom: 15px;">
                    <strong>📋 Hướng dẫn:</strong>
                    <ol style="margin: 10px 0 0 0; padding-left: 20px; font-size: 13px;">
                        <li>Đăng nhập <a href="https://supabase.com" target="_blank">supabase.com</a></li>
                        <li>Tạo project mới</li>
                        <li>Copy URL và Anon Key từ Settings → API</li>
                        <li>Vào SQL Editor → Chạy file <code>supabase/schema.sql</code></li>
                    </ol>
                </div>
            </div>
        `;

        Components.openModal('⚙️ Cấu hình Database', content, {
            confirmText: 'Lưu & Kiểm tra',
            onConfirm: async () => {
                const selectedType = document.querySelector('input[name="dbType"]:checked').value;

                if (selectedType === 'sheets') {
                    const url = document.getElementById('sheetsUrlInput').value.trim();
                    if (!url) {
                        Utils.showToast('Vui lòng nhập Google Apps Script URL', 'error');
                        return;
                    }
                    AppConfig.setApiUrl(url);
                    AppConfig.setDatabaseType('sheets');
                } else {
                    const url = document.getElementById('supabaseUrlInput').value.trim();
                    const key = document.getElementById('supabaseKeyInput').value.trim();
                    if (!url || !key) {
                        Utils.showToast('Vui lòng nhập đầy đủ thông tin Supabase', 'error');
                        return;
                    }
                    AppConfig.setSupabaseConfig(url, key);
                    AppConfig.setDatabaseType('supabase');
                }

                // Test connection
                try {
                    Utils.showToast('Đang kiểm tra kết nối...', 'info');
                    const result = await API.testConnection();
                    if (result.success) {
                        Utils.showToast(`✅ Kết nối ${selectedType === 'supabase' ? 'Supabase' : 'Google Sheets'} thành công!`, 'success');
                        Components.closeModal();
                        // Reload config
                        const configResult = await API.getConfig();
                        Object.assign(AppData, configResult.data, { loaded: true });
                        // Refresh current page
                        this.navigateTo(this.currentPage);
                    } else {
                        Utils.showToast('❌ Lỗi kết nối: ' + (result.error || 'Unknown'), 'error');
                    }
                } catch (error) {
                    Utils.showToast('❌ Lỗi: ' + error.message, 'error');
                }
            }
        });

        // Add event listeners to toggle sections
        setTimeout(() => {
            document.querySelectorAll('input[name="dbType"]').forEach(radio => {
                radio.addEventListener('change', (e) => {
                    document.getElementById('sheetsConfig').style.display = e.target.value === 'sheets' ? 'block' : 'none';
                    document.getElementById('supabaseConfig').style.display = e.target.value === 'supabase' ? 'block' : 'none';

                    // Update border colors
                    document.querySelectorAll('input[name="dbType"]').forEach(r => {
                        r.closest('label').style.borderColor = r.checked ? 'var(--primary)' : 'var(--border)';
                    });
                });
            });
        }, 100);
    }
};

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    App.init();
});
