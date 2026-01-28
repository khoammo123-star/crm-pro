// =====================================================
// CRM PRO - CONFIGURATION
// =====================================================

const AppConfig = {
    // API URL - Ä‘Ã£ Ä‘Æ°á»£c cáº¥u hÃ¬nh sáºµn
    API_URL: localStorage.getItem('crm_api_url') || 'https://script.google.com/macros/s/AKfycbxEuqM1rxgBehOuV927htc6UF6FuX5dqH1fZsRuY26hBSKsC9CvAxUOuSk1V6kELPke/exec',

    // Version
    VERSION: '1.0.0',

    // Default settings
    DEFAULT_PAGE_SIZE: 20,

    // Local storage keys
    STORAGE_KEYS: {
        API_URL: 'crm_api_url',
        THEME: 'crm_theme',
        SIDEBAR_COLLAPSED: 'crm_sidebar_collapsed'
    },

    // Get API URL
    getApiUrl() {
        return localStorage.getItem(this.STORAGE_KEYS.API_URL) || this.API_URL;
    },

    // Set API URL
    setApiUrl(url) {
        localStorage.setItem(this.STORAGE_KEYS.API_URL, url);
        this.API_URL = url;
    },

    // Check if API is configured
    isConfigured() {
        return !!this.getApiUrl();
    }
};

// Configuration data loaded from API
let AppData = {
    dealStages: [],
    contactStatuses: [],
    taskTypes: [],
    taskPriorities: [],
    sources: [],
    industries: [],
    loaded: false
};

// =====================================================
// CRM PRO - API CLIENT
// =====================================================

const API = {

    /**
     * Make API request - sá»­ dá»¥ng GET Ä‘Æ¡n giáº£n nháº¥t Ä‘á»ƒ trÃ¡nh CORS
     */
    async request(action, data = {}, method = 'GET') {
        const apiUrl = AppConfig.getApiUrl();

        if (!apiUrl) {
            throw new Error('API chÆ°a Ä‘Æ°á»£c cáº¥u hÃ¬nh. Vui lÃ²ng vÃ o CÃ i Ä‘áº·t Ä‘á»ƒ nháº­p URL.');
        }

        try {
            // Build URL vá»›i params
            const params = new URLSearchParams({ action });

            Object.keys(data).forEach(key => {
                const value = data[key];
                if (value !== null && value !== undefined && value !== '') {
                    if (typeof value === 'object') {
                        params.append(key, JSON.stringify(value));
                    } else {
                        params.append(key, value);
                    }
                }
            });

            const url = `${apiUrl}?${params.toString()}`;

            // DÃ¹ng fetch Ä‘Æ¡n giáº£n nháº¥t - khÃ´ng options Ä‘á»ƒ trÃ¡nh preflight
            const response = await fetch(url);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();

            if (!result.success) {
                throw new Error(result.error || 'CÃ³ lá»—i xáº£y ra');
            }

            return result;

        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    },

    // ===== CONFIG =====
    async getConfig() {
        return this.request('getConfig', {}, 'GET');
    },

    async testConnection() {
        return this.request('testConnection', {}, 'GET');
    },

    async initializeDatabase() {
        return this.request('initializeDatabase');
    },

    // ===== DASHBOARD =====
    async getDashboardStats() {
        return this.request('getDashboardStats', {}, 'GET');
    },

    async getRecentActivities(limit = 20) {
        return this.request('getRecentActivities', { limit }, 'GET');
    },

    // ===== CONTACTS =====
    async getContacts(params = {}) {
        return this.request('getContacts', params, 'GET');
    },

    async getContact(id) {
        return this.request('getContact', { id }, 'GET');
    },

    async createContact(data) {
        return this.request('createContact', data);
    },

    async updateContact(id, data) {
        return this.request('updateContact', { id, ...data });
    },

    async deleteContact(id) {
        return this.request('deleteContact', { id });
    },

    async searchContacts(q, limit = 10) {
        return this.request('searchContacts', { q, limit }, 'GET');
    },

    // ===== COMPANIES =====
    async getCompanies(params = {}) {
        return this.request('getCompanies', params, 'GET');
    },

    async getCompany(id) {
        return this.request('getCompany', { id }, 'GET');
    },

    async createCompany(data) {
        return this.request('createCompany', data);
    },

    async updateCompany(id, data) {
        return this.request('updateCompany', { id, ...data });
    },

    async deleteCompany(id) {
        return this.request('deleteCompany', { id });
    },

    // ===== DEALS =====
    async getDeals(params = {}) {
        return this.request('getDeals', params, 'GET');
    },

    async getDeal(id) {
        return this.request('getDeal', { id }, 'GET');
    },

    async createDeal(data) {
        return this.request('createDeal', data);
    },

    async updateDeal(id, data) {
        return this.request('updateDeal', { id, ...data });
    },

    async updateDealStage(id, stage) {
        return this.request('updateDealStage', { id, stage });
    },

    async deleteDeal(id) {
        return this.request('deleteDeal', { id });
    },

    async getDealsPipeline() {
        return this.request('getDealsPipeline', {}, 'GET');
    },

    // ===== TASKS =====
    async getTasks(params = {}) {
        return this.request('getTasks', params, 'GET');
    },

    async getTask(id) {
        return this.request('getTask', { id }, 'GET');
    },

    async createTask(data) {
        return this.request('createTask', data);
    },

    async updateTask(id, data) {
        return this.request('updateTask', { id, ...data });
    },

    async completeTask(id) {
        return this.request('completeTask', { id });
    },

    async deleteTask(id) {
        return this.request('deleteTask', { id });
    },

    async getOverdueTasks() {
        return this.request('getOverdueTasks', {}, 'GET');
    },

    async getTodayTasks() {
        return this.request('getTodayTasks', {}, 'GET');
    },

    // ===== NOTES =====
    async getNotes(params = {}) {
        return this.request('getNotes', params, 'GET');
    },

    async createNote(data) {
        return this.request('createNote', data);
    },

    async updateNote(id, data) {
        return this.request('updateNote', { id, ...data });
    },

    async deleteNote(id) {
        return this.request('deleteNote', { id });
    },

    // ===== FILES =====
    async uploadFile(file, entityType, entityId) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = async () => {
                try {
                    const base64 = reader.result.split(',')[1];
                    const result = await this.request('uploadFile', {
                        fileName: file.name,
                        fileContent: base64,
                        mimeType: file.type,
                        entityType,
                        entityId
                    });
                    resolve(result);
                } catch (error) {
                    reject(error);
                }
            };
            reader.onerror = () => reject(new Error('KhÃ´ng thá»ƒ Ä‘á»c file'));
            reader.readAsDataURL(file);
        });
    },

    async getFiles(entityType, entityId) {
        return this.request('getFiles', { entityType, entityId }, 'GET');
    },

    async deleteFile(fileId) {
        return this.request('deleteFile', { fileId });
    }
};

// =====================================================
// CRM PRO - UTILITY FUNCTIONS
// =====================================================

const Utils = {

    /**
     * Format currency VND
     */
    formatCurrency(amount) {
        if (!amount) return '0 â‚«';
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
            maximumFractionDigits: 0
        }).format(amount);
    },

    /**
     * Format date to Vietnamese locale
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
     * Format datetime
     */
    formatDateTime(dateString) {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    },

    /**
     * Format relative time
     */
    timeAgo(dateString) {
        if (!dateString) return '';

        const now = new Date();
        const date = new Date(dateString);
        const seconds = Math.floor((now - date) / 1000);

        if (seconds < 60) return 'Vá»«a xong';

        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) return `${minutes} phÃºt trÆ°á»›c`;

        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours} giá» trÆ°á»›c`;

        const days = Math.floor(hours / 24);
        if (days < 7) return `${days} ngÃ y trÆ°á»›c`;

        return this.formatDate(dateString);
    },

    /**
     * Get initials from name
     */
    getInitials(firstName, lastName) {
        const first = firstName ? firstName.charAt(0).toUpperCase() : '';
        const last = lastName ? lastName.charAt(0).toUpperCase() : '';
        return first + last || '?';
    },

    /**
     * Get full name
     */
    getFullName(firstName, lastName) {
        return `${firstName || ''} ${lastName || ''}`.trim() || 'KhÃ´ng tÃªn';
    },

    /**
     * Generate random color for avatar
     */
    getAvatarColor(name) {
        const colors = [
            '#3b82f6', '#8b5cf6', '#ec4899', '#ef4444',
            '#f97316', '#eab308', '#22c55e', '#14b8a6'
        ];

        let hash = 0;
        for (let i = 0; i < (name || '').length; i++) {
            hash = name.charCodeAt(i) + ((hash << 5) - hash);
        }

        return colors[Math.abs(hash) % colors.length];
    },

    /**
     * Truncate text
     */
    truncate(text, length = 50) {
        if (!text) return '';
        if (text.length <= length) return text;
        return text.substring(0, length) + '...';
    },

    /**
     * Debounce function
     */
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    /**
     * Parse query string  
     */
    parseQuery(queryString) {
        const params = {};
        const pairs = (queryString[0] === '?' ? queryString.substr(1) : queryString).split('&');

        for (let pair of pairs) {
            const [key, value] = pair.split('=');
            if (key) {
                params[decodeURIComponent(key)] = decodeURIComponent(value || '');
            }
        }

        return params;
    },

    /**
     * Build query string
     */
    buildQuery(params) {
        return Object.entries(params)
            .filter(([, value]) => value !== null && value !== undefined && value !== '')
            .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
            .join('&');
    },

    /**
     * Check if date is today
     */
    isToday(dateString) {
        if (!dateString) return false;
        const date = new Date(dateString);
        const today = new Date();
        return date.toDateString() === today.toDateString();
    },

    /**
     * Check if date is overdue
     */
    isOverdue(dateString) {
        if (!dateString) return false;
        const date = new Date(dateString);
        const now = new Date();
        return date < now;
    },

    /**
     * Format file size
     */
    formatFileSize(bytes) {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    },

    /**
     * Escape HTML
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    },

    /**
     * Sleep/delay
     */
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    },

    /**
     * Copy to clipboard
     */
    async copyToClipboard(text) {
        try {
            await navigator.clipboard.writeText(text);
            return true;
        } catch (err) {
            console.error('Copy failed:', err);
            return false;
        }
    },

    /**
     * Get status badge class
     */
    getStatusBadgeClass(status) {
        const classes = {
            'lead': 'badge-primary',
            'prospect': 'badge-purple',
            'customer': 'badge-success',
            'inactive': 'badge-gray',
            'active': 'badge-success',
            'potential': 'badge-warning',
            'new': 'badge-primary',
            'qualified': 'badge-purple',
            'proposal': 'badge-warning',
            'negotiation': 'badge-orange',
            'won': 'badge-success',
            'lost': 'badge-danger',
            'pending': 'badge-warning',
            'in_progress': 'badge-primary',
            'completed': 'badge-success',
            'cancelled': 'badge-gray'
        };
        return classes[status] || 'badge-gray';
    },

    /**
     * Get status label
     */
    getStatusLabel(status, type = 'contact') {
        const labels = {
            contact: {
                'lead': 'Lead',
                'prospect': 'Tiá»m nÄƒng',
                'customer': 'KhÃ¡ch hÃ ng',
                'inactive': 'KhÃ´ng hoáº¡t Ä‘á»™ng'
            },
            company: {
                'active': 'Hoáº¡t Ä‘á»™ng',
                'inactive': 'KhÃ´ng hoáº¡t Ä‘á»™ng',
                'potential': 'Tiá»m nÄƒng'
            },
            deal: {
                'new': 'Má»›i',
                'qualified': 'Äá»§ Ä‘iá»u kiá»‡n',
                'proposal': 'Äá» xuáº¥t',
                'negotiation': 'ÄÃ m phÃ¡n',
                'won': 'ThÃ nh cÃ´ng',
                'lost': 'Tháº¥t báº¡i'
            },
            task: {
                'pending': 'Chá» xá»­ lÃ½',
                'in_progress': 'Äang lÃ m',
                'completed': 'HoÃ n thÃ nh',
                'cancelled': 'ÄÃ£ há»§y'
            }
        };

        return labels[type]?.[status] || status;
    }
};

// =====================================================
// CRM PRO - UI COMPONENTS
// =====================================================

const Components = {

    /**
     * Show toast notification
     */
    toast(message, type = 'info', duration = 3000) {
        const container = document.getElementById('toastContainer');

        const icons = {
            success: 'âœ“',
            error: 'âœ•',
            warning: 'âš ',
            info: 'â„¹'
        };

        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.innerHTML = `
      <div class="toast-icon">${icons[type]}</div>
      <div class="toast-content">
        <div class="toast-message">${message}</div>
      </div>
      <button class="btn-icon toast-close" onclick="this.parentElement.remove()">
        <span>âœ•</span>
      </button>
    `;

        container.appendChild(toast);

        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(100%)';
            setTimeout(() => toast.remove(), 300);
        }, duration);
    },

    /**
     * Show loading overlay
     */
    showLoading(message = 'Äang táº£i...') {
        const overlay = document.getElementById('loadingOverlay');
        overlay.querySelector('p').textContent = message;
        overlay.style.display = 'flex';
    },

    /**
     * Hide loading overlay
     */
    hideLoading() {
        document.getElementById('loadingOverlay').style.display = 'none';
    },

    /**
     * Open modal
     */
    openModal(title, content, options = {}) {
        const overlay = document.getElementById('modalOverlay');
        const modal = document.getElementById('modal');
        const titleEl = document.getElementById('modalTitle');
        const bodyEl = document.getElementById('modalBody');
        const footerEl = document.getElementById('modalFooter');
        const confirmBtn = document.getElementById('modalConfirm');
        const cancelBtn = document.getElementById('modalCancel');

        titleEl.textContent = title;
        bodyEl.innerHTML = content;

        // Handle modal size
        modal.className = 'modal';
        if (options.size === 'lg') modal.classList.add('modal-lg');

        // Configure buttons
        if (options.hideFooter) {
            footerEl.style.display = 'none';
        } else {
            footerEl.style.display = 'flex';
            confirmBtn.textContent = options.confirmText || 'XÃ¡c nháº­n';
            cancelBtn.textContent = options.cancelText || 'Há»§y';

            if (options.confirmClass) {
                confirmBtn.className = `btn ${options.confirmClass}`;
            } else {
                confirmBtn.className = 'btn btn-primary';
            }
        }

        // Set callbacks
        confirmBtn.onclick = () => {
            if (options.onConfirm) {
                options.onConfirm();
            }
        };

        cancelBtn.onclick = () => {
            this.closeModal();
            if (options.onCancel) options.onCancel();
        };

        document.getElementById('modalClose').onclick = () => {
            this.closeModal();
        };

        overlay.classList.add('active');

        // Focus first input
        setTimeout(() => {
            const firstInput = bodyEl.querySelector('input, textarea, select');
            if (firstInput) firstInput.focus();
        }, 100);
    },

    /**
     * Close modal
     */
    closeModal() {
        document.getElementById('modalOverlay').classList.remove('active');
    },

    /**
     * Confirm dialog
     */
    confirm(message, options = {}) {
        return new Promise((resolve) => {
            this.openModal(
                options.title || 'XÃ¡c nháº­n',
                `<p>${message}</p>`,
                {
                    confirmText: options.confirmText || 'XÃ¡c nháº­n',
                    cancelText: options.cancelText || 'Há»§y',
                    confirmClass: options.danger ? 'btn-danger' : 'btn-primary',
                    onConfirm: () => {
                        this.closeModal();
                        resolve(true);
                    },
                    onCancel: () => {
                        resolve(false);
                    }
                }
            );
        });
    },

    /**
     * Create avatar element
     */
    avatar(firstName, lastName, size = '') {
        const initials = Utils.getInitials(firstName, lastName);
        const color = Utils.getAvatarColor(firstName + lastName);
        const sizeClass = size ? `avatar-${size}` : '';

        return `<div class="avatar ${sizeClass}" style="background: ${color}">${initials}</div>`;
    },

    /**
     * Create badge element
     */
    badge(text, type = 'gray') {
        return `<span class="badge badge-${type}">${text}</span>`;
    },

    /**
     * Create status badge
     */
    statusBadge(status, entityType = 'contact') {
        const label = Utils.getStatusLabel(status, entityType);
        const badgeClass = Utils.getStatusBadgeClass(status);
        return `<span class="badge ${badgeClass}">${label}</span>`;
    },

    /**
     * Create empty state
     */
    emptyState(icon, title, description, actionText, actionHandler) {
        const actionHtml = actionText
            ? `<button class="btn btn-primary" onclick="${actionHandler}">${actionText}</button>`
            : '';

        return `
      <div class="empty-state">
        <div class="empty-state-icon">${icon}</div>
        <div class="empty-state-title">${title}</div>
        <p class="empty-state-desc">${description}</p>
        ${actionHtml}
      </div>
    `;
    },

    /**
     * Create pagination
     */
    pagination(current, total, onPageChange) {
        if (total <= 1) return '';

        let pages = [];

        // Always show first page
        pages.push(1);

        // Show pages around current
        for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) {
            if (pages[pages.length - 1] !== i - 1) {
                pages.push('...');
            }
            pages.push(i);
        }

        // Always show last page
        if (total > 1) {
            if (pages[pages.length - 1] !== total - 1 && pages[pages.length - 1] !== '...') {
                if (pages[pages.length - 1] < total - 1) {
                    pages.push('...');
                }
            }
            if (pages[pages.length - 1] !== total) {
                pages.push(total);
            }
        }

        const buttonsHtml = pages.map(page => {
            if (page === '...') {
                return '<span class="pagination-btn" disabled>...</span>';
            }
            const activeClass = page === current ? 'active' : '';
            return `<button class="pagination-btn ${activeClass}" data-page="${page}">${page}</button>`;
        }).join('');

        return `
      <div class="pagination">
        <span class="pagination-info">Trang ${current} / ${total}</span>
        <div class="pagination-buttons">
          <button class="pagination-btn" data-page="${current - 1}" ${current <= 1 ? 'disabled' : ''}>â€¹</button>
          ${buttonsHtml}
          <button class="pagination-btn" data-page="${current + 1}" ${current >= total ? 'disabled' : ''}>â€º</button>
        </div>
      </div>
    `;
    },

    /**
     * Create stat card
     */
    statCard(icon, label, value, change = null, colorClass = 'blue') {
        const changeHtml = change !== null
            ? `<div class="stat-change ${change >= 0 ? 'positive' : 'negative'}">
           ${change >= 0 ? 'â†‘' : 'â†“'} ${Math.abs(change)}% so vá»›i thÃ¡ng trÆ°á»›c
         </div>`
            : '';

        return `
      <div class="stat-card">
        <div class="stat-icon ${colorClass}">${icon}</div>
        <div class="stat-content">
          <div class="stat-label">${label}</div>
          <div class="stat-value">${value}</div>
          ${changeHtml}
        </div>
      </div>
    `;
    },

    /**
     * Create form field
     */
    formField(name, label, type = 'text', options = {}) {
        const required = options.required ? 'required' : '';
        const value = options.value || '';
        const placeholder = options.placeholder || '';
        const hint = options.hint ? `<small class="form-hint">${options.hint}</small>` : '';

        let input;

        if (type === 'textarea') {
            input = `<textarea name="${name}" class="form-textarea" placeholder="${placeholder}" ${required}>${value}</textarea>`;
        } else if (type === 'select') {
            const optionsHtml = (options.options || []).map(opt =>
                `<option value="${opt.value}" ${opt.value === value ? 'selected' : ''}>${opt.label}</option>`
            ).join('');
            input = `<select name="${name}" class="form-select" ${required}>${optionsHtml}</select>`;
        } else {
            input = `<input type="${type}" name="${name}" class="form-input" value="${value}" placeholder="${placeholder}" ${required}>`;
        }

        return `
      <div class="form-group">
        <label>${label}${options.required ? ' *' : ''}</label>
        ${input}
        ${hint}
      </div>
    `;
    },

    /**
     * Get form data as object
     */
    getFormData(formElement) {
        const formData = new FormData(formElement);
        const data = {};

        for (let [key, value] of formData.entries()) {
            data[key] = value;
        }

        return data;
    },

    /**
     * Validate form
     */
    validateForm(formElement) {
        const inputs = formElement.querySelectorAll('[required]');
        let valid = true;

        inputs.forEach(input => {
            if (!input.value.trim()) {
                input.classList.add('error');
                valid = false;
            } else {
                input.classList.remove('error');
            }
        });

        return valid;
    }
};

// Global functions for onclick handlers
function closeSettingsModal() {
    document.getElementById('settingsOverlay').style.display = 'none';
}

function saveSettings() {
    const apiUrl = document.getElementById('apiUrlInput').value.trim();
    const theme = document.getElementById('themeSelect').value;

    if (apiUrl) {
        AppConfig.setApiUrl(apiUrl);
    }

    localStorage.setItem(AppConfig.STORAGE_KEYS.THEME, theme);
    applyTheme(theme);

    Components.toast('ÄÃ£ lÆ°u cÃ i Ä‘áº·t', 'success');
    closeSettingsModal();

    // Reload data if API was just configured
    if (apiUrl) {
        location.reload();
    }
}

function applyTheme(theme) {
    if (theme === 'auto') {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        document.documentElement.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
    } else {
        document.documentElement.setAttribute('data-theme', theme);
    }
}

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
          <div class="empty-state-icon">âš ï¸</div>
          <div class="empty-state-title">KhÃ´ng thá»ƒ táº£i dá»¯ liá»‡u</div>
          <p class="empty-state-desc">${error.message}</p>
          <button class="btn btn-primary" onclick="DashboardPage.render()">Thá»­ láº¡i</button>
        </div>
      `;
        }
    },

    renderSetupGuide() {
        return `
      <div class="card" style="max-width: 600px; margin: 40px auto;">
        <div class="card-header">
          <h2 class="card-title">ðŸš€ ChÃ o má»«ng Ä‘áº¿n CRM Pro!</h2>
        </div>
        <div class="card-body">
          <p>Äá»ƒ báº¯t Ä‘áº§u sá»­ dá»¥ng, báº¡n cáº§n thá»±c hiá»‡n cÃ¡c bÆ°á»›c sau:</p>
          
          <div style="margin: 24px 0;">
            <h4 style="margin-bottom: 12px;">1. Táº¡o Google Sheets</h4>
            <p class="text-secondary">Táº¡o má»™t Google Sheets má»›i lÃ m database</p>
          </div>
          
          <div style="margin: 24px 0;">
            <h4 style="margin-bottom: 12px;">2. ThÃªm Apps Script</h4>
            <p class="text-secondary">VÃ o Extensions â†’ Apps Script, copy toÃ n bá»™ code tá»« thÆ° má»¥c <code>apps-script</code></p>
          </div>
          
          <div style="margin: 24px 0;">
            <h4 style="margin-bottom: 12px;">3. Cáº¥u hÃ¬nh</h4>
            <p class="text-secondary">Má»Ÿ file <code>Config.gs</code>, thay <code>SPREADSHEET_ID</code> báº±ng ID cá»§a Sheets</p>
          </div>
          
          <div style="margin: 24px 0;">
            <h4 style="margin-bottom: 12px;">4. Deploy Web App</h4>
            <p class="text-secondary">Deploy â†’ New deployment â†’ Web app â†’ Execute as: Me â†’ Who has access: Anyone</p>
          </div>
          
          <div style="margin: 24px 0;">
            <h4 style="margin-bottom: 12px;">5. Nháº­p URL</h4>
            <p class="text-secondary">Copy URL Web App vÃ  paste vÃ o Ã´ bÃªn dÆ°á»›i:</p>
            
            <div style="margin-top: 12px;">
              <input type="text" id="setupApiUrl" class="form-input" placeholder="https://script.google.com/macros/s/...">
            </div>
          </div>
          
          <button class="btn btn-primary btn-lg w-full" onclick="DashboardPage.saveApiUrl()">
            Káº¿t ná»‘i & Báº¯t Ä‘áº§u
          </button>
        </div>
      </div>
    `;
    },

    async saveApiUrl() {
        const input = document.getElementById('setupApiUrl');
        const url = input.value.trim();

        if (!url) {
            Components.toast('Vui lÃ²ng nháº­p URL', 'error');
            return;
        }

        Components.showLoading('Äang káº¿t ná»‘i...');

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
            Components.toast('Káº¿t ná»‘i thÃ nh cÃ´ng!', 'success');

            this.render();

        } catch (error) {
            Components.hideLoading();
            Components.toast('Káº¿t ná»‘i tháº¥t báº¡i: ' + error.message, 'error');
            AppConfig.setApiUrl('');
        }
    },

    renderDashboard(stats) {
        return `
      <!-- Stats Cards -->
      <div class="stats-grid">
        ${Components.statCard('ðŸ‘¥', 'LiÃªn há»‡', stats.contacts.total, null, 'blue')}
        ${Components.statCard('ðŸ¢', 'CÃ´ng ty', stats.companies.total, null, 'purple')}
        ${Components.statCard('ðŸ’°', 'Deals Ä‘ang má»Ÿ', stats.deals.active, null, 'green')}
        ${Components.statCard('âœ…', 'Tasks hÃ´m nay', stats.tasks.dueToday, null, 'orange')}
      </div>
      
      <!-- Charts -->
      <div class="dashboard-charts">
        <div class="card">
          <div class="card-header">
            <h3 class="card-title">ðŸ“ˆ Doanh thu theo thÃ¡ng</h3>
          </div>
          <div class="card-body">
            <div class="chart-container">
              <canvas id="revenueChart"></canvas>
            </div>
          </div>
        </div>
        
        <div class="card">
          <div class="card-header">
            <h3 class="card-title">ðŸ“Š Pipeline</h3>
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
            <h3 class="card-title">ðŸ”¥ Top Deals</h3>
          </div>
          <div class="card-body">
            ${this.renderTopDeals(stats.topDeals)}
          </div>
        </div>
        
        <!-- Recent Contacts -->
        <div class="card">
          <div class="card-header">
            <h3 class="card-title">ðŸ‘¤ LiÃªn há»‡ má»›i</h3>
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
              <div class="stat-label">Doanh thu thÃ¡ng nÃ y</div>
              <div class="stat-value text-success">${Utils.formatCurrency(stats.deals.wonValueThisMonth)}</div>
            </div>
            <div>
              <div class="stat-label">Doanh thu nÄƒm nay</div>
              <div class="stat-value">${Utils.formatCurrency(stats.deals.wonValueThisYear)}</div>
            </div>
            <div>
              <div class="stat-label">Tá»· lá»‡ chá»‘t deal</div>
              <div class="stat-value">${stats.deals.winRate}%</div>
            </div>
            <div>
              <div class="stat-label">Tasks quÃ¡ háº¡n</div>
              <div class="stat-value ${stats.tasks.overdue > 0 ? 'text-danger' : ''}">${stats.tasks.overdue}</div>
            </div>
          </div>
        </div>
      </div>
    `;
    },

    renderTopDeals(deals) {
        if (!deals || deals.length === 0) {
            return '<p class="text-secondary text-center">ChÆ°a cÃ³ deal nÃ o</p>';
        }

        return deals.map(deal => `
      <div class="activity-item" style="cursor: pointer" onclick="App.navigateTo('deals', '${deal.id}')">
        <div class="activity-icon" style="background: ${deal.stageInfo?.color || '#3b82f6'}20; color: ${deal.stageInfo?.color || '#3b82f6'}">
          ðŸ’°
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
            return '<p class="text-secondary text-center">ChÆ°a cÃ³ liÃªn há»‡ nÃ o</p>';
        }

        return contacts.map(contact => `
      <div class="activity-item" style="cursor: pointer" onclick="App.navigateTo('contacts', '${contact.id}')">
        ${Components.avatar(contact.name.split(' ')[0], contact.name.split(' ').slice(1).join(' '), 'sm')}
        <div class="activity-content">
          <div class="activity-text">${contact.name}</div>
          <div class="activity-time">${contact.email || 'ChÆ°a cÃ³ email'}</div>
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
                'âš ï¸',
                'KhÃ´ng thá»ƒ táº£i dá»¯ liá»‡u',
                error.message,
                'Thá»­ láº¡i',
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
            <i class="lucide-search"></i>
            <input type="text" id="contactSearch" placeholder="TÃ¬m liÃªn há»‡..." value="${this.currentFilters.search || ''}">
          </div>
          
          <select class="form-select" id="contactStatusFilter" style="width: auto;">
            <option value="">Táº¥t cáº£ tráº¡ng thÃ¡i</option>
            <option value="lead" ${this.currentFilters.status === 'lead' ? 'selected' : ''}>Lead</option>
            <option value="prospect" ${this.currentFilters.status === 'prospect' ? 'selected' : ''}>Tiá»m nÄƒng</option>
            <option value="customer" ${this.currentFilters.status === 'customer' ? 'selected' : ''}>KhÃ¡ch hÃ ng</option>
            <option value="inactive" ${this.currentFilters.status === 'inactive' ? 'selected' : ''}>KhÃ´ng hoáº¡t Ä‘á»™ng</option>
          </select>
        </div>
        
        <button class="btn btn-primary" onclick="ContactsPage.openCreateModal()">
          <i class="lucide-plus"></i> ThÃªm liÃªn há»‡
        </button>
      </div>
      
      <!-- Table -->
      <div class="card">
        <div class="table-container">
          <table class="table">
            <thead>
              <tr>
                <th>LiÃªn há»‡</th>
                <th>CÃ´ng ty</th>
                <th>Äiá»‡n thoáº¡i</th>
                <th>Tráº¡ng thÃ¡i</th>
                <th>Nguá»“n</th>
                <th>NgÃ y táº¡o</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              ${contacts.length > 0 ? contacts.map(c => this.renderContactRow(c)).join('') : `
                <tr>
                  <td colspan="7">
                    ${Components.emptyState('ðŸ‘¥', 'ChÆ°a cÃ³ liÃªn há»‡ nÃ o', 'ThÃªm liÃªn há»‡ Ä‘áº§u tiÃªn cá»§a báº¡n', 'ThÃªm liÃªn há»‡', 'ContactsPage.openCreateModal()')}
                  </td>
                </tr>
              `}
            </tbody>
          </table>
        </div>
        
        ${Components.pagination(pagination.page, pagination.totalPages)}
      </div>
    `;

        this.initEventListeners();
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
              <i class="lucide-eye"></i>
            </button>
            <button class="btn-icon" onclick="ContactsPage.openEditModal('${contact.id}')" title="Sá»­a">
              <i class="lucide-edit"></i>
            </button>
            <button class="btn-icon" onclick="ContactsPage.deleteContact('${contact.id}')" title="XÃ³a">
              <i class="lucide-trash-2"></i>
            </button>
          </div>
        </td>
      </tr>
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

    openCreateModal() {
        const content = this.renderContactForm();

        Components.openModal('ThÃªm liÃªn há»‡ má»›i', content, {
            confirmText: 'Táº¡o liÃªn há»‡',
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

            Components.openModal('Sá»­a liÃªn há»‡', content, {
                confirmText: 'LÆ°u thay Ä‘á»•i',
                onConfirm: () => this.updateContact(id)
            });

        } catch (error) {
            Components.hideLoading();
            Components.toast(error.message, 'error');
        }
    },

    renderContactForm(contact = {}) {
        const sources = AppData.sources || ['Website', 'Facebook', 'Zalo', 'Giá»›i thiá»‡u', 'KhÃ¡c'];
        const statuses = AppData.contactStatuses || [
            { id: 'lead', name: 'Lead' },
            { id: 'prospect', name: 'Tiá»m nÄƒng' },
            { id: 'customer', name: 'KhÃ¡ch hÃ ng' },
            { id: 'inactive', name: 'KhÃ´ng hoáº¡t Ä‘á»™ng' }
        ];

        return `
      <form id="contactForm">
        <div class="form-row">
          ${Components.formField('first_name', 'TÃªn', 'text', { value: contact.first_name, required: true, placeholder: 'Nháº­p tÃªn' })}
          ${Components.formField('last_name', 'Há»', 'text', { value: contact.last_name, placeholder: 'Nháº­p há»' })}
        </div>
        
        <div class="form-row">
          ${Components.formField('email', 'Email', 'email', { value: contact.email, placeholder: 'email@example.com' })}
          ${Components.formField('phone', 'Äiá»‡n thoáº¡i', 'tel', { value: contact.phone, placeholder: '0912345678' })}
        </div>
        
        ${Components.formField('position', 'Chá»©c vá»¥', 'text', { value: contact.position, placeholder: 'VÃ­ dá»¥: GiÃ¡m Ä‘á»‘c' })}
        
        <div class="form-row">
          ${Components.formField('status', 'Tráº¡ng thÃ¡i', 'select', {
            value: contact.status || 'lead',
            options: statuses.map(s => ({ value: s.id, label: s.name }))
        })}
          ${Components.formField('source', 'Nguá»“n', 'select', {
            value: contact.source,
            options: [{ value: '', label: '-- Chá»n nguá»“n --' }, ...sources.map(s => ({ value: s, label: s }))]
        })}
        </div>
        
        ${Components.formField('address', 'Äá»‹a chá»‰', 'text', { value: contact.address })}
        
        ${Components.formField('notes', 'Ghi chÃº', 'textarea', { value: contact.notes })}
      </form>
    `;
    },

    async createContact() {
        const form = document.getElementById('contactForm');

        if (!Components.validateForm(form)) {
            Components.toast('Vui lÃ²ng Ä‘iá»n Ä‘áº§y Ä‘á»§ thÃ´ng tin báº¯t buá»™c', 'error');
            return;
        }

        const data = Components.getFormData(form);

        Components.showLoading('Äang táº¡o...');

        try {
            await API.createContact(data);
            Components.hideLoading();
            Components.closeModal();
            Components.toast('Táº¡o liÃªn há»‡ thÃ nh cÃ´ng!', 'success');
            this.loadContacts();
        } catch (error) {
            Components.hideLoading();
            Components.toast(error.message, 'error');
        }
    },

    async updateContact(id) {
        const form = document.getElementById('contactForm');

        if (!Components.validateForm(form)) {
            Components.toast('Vui lÃ²ng Ä‘iá»n Ä‘áº§y Ä‘á»§ thÃ´ng tin báº¯t buá»™c', 'error');
            return;
        }

        const data = Components.getFormData(form);

        Components.showLoading('Äang lÆ°u...');

        try {
            await API.updateContact(id, data);
            Components.hideLoading();
            Components.closeModal();
            Components.toast('Cáº­p nháº­t thÃ nh cÃ´ng!', 'success');
            this.loadContacts();
        } catch (error) {
            Components.hideLoading();
            Components.toast(error.message, 'error');
        }
    },

    async deleteContact(id) {
        const confirmed = await Components.confirm(
            'Báº¡n cÃ³ cháº¯c muá»‘n xÃ³a liÃªn há»‡ nÃ y?',
            { title: 'XÃ¡c nháº­n xÃ³a', danger: true, confirmText: 'XÃ³a' }
        );

        if (!confirmed) return;

        Components.showLoading('Äang xÃ³a...');

        try {
            await API.deleteContact(id);
            Components.hideLoading();
            Components.toast('ÄÃ£ xÃ³a liÃªn há»‡', 'success');
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
            <span class="detail-label">Äiá»‡n thoáº¡i</span>
            <span class="detail-value">${contact.phone || '-'}</span>
          </div>
          <div class="detail-field">
            <span class="detail-label">Nguá»“n</span>
            <span class="detail-value">${contact.source || '-'}</span>
          </div>
          <div class="detail-field">
            <span class="detail-label">NgÃ y táº¡o</span>
            <span class="detail-value">${Utils.formatDate(contact.created_at)}</span>
          </div>
        </div>
        
        ${contact.notes ? `
          <div class="detail-section mt-4">
            <h4 class="detail-section-title">ðŸ“ Ghi chÃº</h4>
            <p>${contact.notes}</p>
          </div>
        ` : ''}
        
        <div class="detail-section mt-4">
          <h4 class="detail-section-title">ðŸ“Š Thá»‘ng kÃª</h4>
          <div class="detail-grid">
            <div class="detail-field">
              <span class="detail-label">Tá»•ng deals</span>
              <span class="detail-value">${contact.stats?.totalDeals || 0}</span>
            </div>
            <div class="detail-field">
              <span class="detail-label">Deals thÃ nh cÃ´ng</span>
              <span class="detail-value">${contact.stats?.wonDeals || 0}</span>
            </div>
            <div class="detail-field">
              <span class="detail-label">Tá»•ng giÃ¡ trá»‹</span>
              <span class="detail-value">${Utils.formatCurrency(contact.stats?.totalValue || 0)}</span>
            </div>
            <div class="detail-field">
              <span class="detail-label">Tasks chá» xá»­ lÃ½</span>
              <span class="detail-value">${contact.stats?.pendingTasks || 0}</span>
            </div>
          </div>
        </div>
      `;

            Components.openModal('Chi tiáº¿t liÃªn há»‡', content, {
                size: 'lg',
                hideFooter: true
            });

        } catch (error) {
            Components.hideLoading();
            Components.toast(error.message, 'error');
        }
    }
};

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
                'âš ï¸',
                'KhÃ´ng thá»ƒ táº£i dá»¯ liá»‡u',
                error.message,
                'Thá»­ láº¡i',
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
            <i class="lucide-search"></i>
            <input type="text" id="companySearch" placeholder="TÃ¬m cÃ´ng ty..." value="${this.currentFilters.search || ''}">
          </div>
          
          <select class="form-select" id="companyStatusFilter" style="width: auto;">
            <option value="">Táº¥t cáº£ tráº¡ng thÃ¡i</option>
            <option value="active" ${this.currentFilters.status === 'active' ? 'selected' : ''}>Hoáº¡t Ä‘á»™ng</option>
            <option value="potential" ${this.currentFilters.status === 'potential' ? 'selected' : ''}>Tiá»m nÄƒng</option>
            <option value="inactive" ${this.currentFilters.status === 'inactive' ? 'selected' : ''}>KhÃ´ng hoáº¡t Ä‘á»™ng</option>
          </select>
        </div>
        
        <button class="btn btn-primary" onclick="CompaniesPage.openCreateModal()">
          <i class="lucide-plus"></i> ThÃªm cÃ´ng ty
        </button>
      </div>
      
      <!-- Grid -->
      <div class="grid-3">
        ${companies.length > 0 ? companies.map(c => this.renderCompanyCard(c)).join('') : `
          <div style="grid-column: 1 / -1;">
            ${Components.emptyState('ðŸ¢', 'ChÆ°a cÃ³ cÃ´ng ty nÃ o', 'ThÃªm cÃ´ng ty Ä‘áº§u tiÃªn', 'ThÃªm cÃ´ng ty', 'CompaniesPage.openCreateModal()')}
          </div>
        `}
      </div>
      
      ${companies.length > 0 ? Components.pagination(pagination.page, pagination.totalPages) : ''}
    `;

        this.initEventListeners();
    },

    renderCompanyCard(company) {
        return `
      <div class="card" style="cursor: pointer" onclick="CompaniesPage.viewCompany('${company.id}')">
        <div class="card-body">
          <div style="display: flex; align-items: start; gap: 12px; margin-bottom: 16px;">
            <div class="avatar" style="background: linear-gradient(135deg, ${Utils.getAvatarColor(company.name)}, ${Utils.getAvatarColor(company.name + '2')})">
              ðŸ¢
            </div>
            <div style="flex: 1">
              <h4 style="margin-bottom: 4px">${company.name}</h4>
              <p class="text-secondary" style="font-size: 12px; margin: 0">${company.industry || 'ChÆ°a phÃ¢n loáº¡i'}</p>
            </div>
            ${Components.statusBadge(company.status || 'active', 'company')}
          </div>
          
          <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; text-align: center; padding-top: 12px; border-top: 1px solid var(--border-color-light);">
            <div>
              <div class="stat-label">LiÃªn há»‡</div>
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

        Components.openModal('ThÃªm cÃ´ng ty má»›i', content, {
            confirmText: 'Táº¡o cÃ´ng ty',
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

            Components.openModal('Sá»­a cÃ´ng ty', content, {
                confirmText: 'LÆ°u thay Ä‘á»•i',
                onConfirm: () => this.updateCompany(id)
            });

        } catch (error) {
            Components.hideLoading();
            Components.toast(error.message, 'error');
        }
    },

    renderCompanyForm(company = {}) {
        const industries = AppData.industries || [
            'CÃ´ng nghá»‡', 'TÃ i chÃ­nh - NgÃ¢n hÃ ng', 'Báº¥t Ä‘á»™ng sáº£n',
            'GiÃ¡o dá»¥c', 'Y táº¿ - Sá»©c khá»e', 'BÃ¡n láº»', 'Sáº£n xuáº¥t', 'Dá»‹ch vá»¥', 'KhÃ¡c'
        ];

        const sizes = [
            { value: '1-10', label: '1-10 nhÃ¢n viÃªn' },
            { value: '11-50', label: '11-50 nhÃ¢n viÃªn' },
            { value: '51-200', label: '51-200 nhÃ¢n viÃªn' },
            { value: '201-500', label: '201-500 nhÃ¢n viÃªn' },
            { value: '500+', label: 'TrÃªn 500 nhÃ¢n viÃªn' }
        ];

        return `
      <form id="companyForm">
        ${Components.formField('name', 'TÃªn cÃ´ng ty', 'text', { value: company.name, required: true, placeholder: 'Nháº­p tÃªn cÃ´ng ty' })}
        
        <div class="form-row">
          ${Components.formField('industry', 'NgÃ nh nghá»', 'select', {
            value: company.industry,
            options: [{ value: '', label: '-- Chá»n ngÃ nh --' }, ...industries.map(i => ({ value: i, label: i }))]
        })}
          ${Components.formField('size', 'Quy mÃ´', 'select', {
            value: company.size,
            options: [{ value: '', label: '-- Chá»n quy mÃ´ --' }, ...sizes]
        })}
        </div>
        
        <div class="form-row">
          ${Components.formField('email', 'Email', 'email', { value: company.email, placeholder: 'info@company.com' })}
          ${Components.formField('phone', 'Äiá»‡n thoáº¡i', 'tel', { value: company.phone, placeholder: '0912345678' })}
        </div>
        
        ${Components.formField('website', 'Website', 'url', { value: company.website, placeholder: 'https://company.com' })}
        
        ${Components.formField('address', 'Äá»‹a chá»‰', 'text', { value: company.address })}
        
        ${Components.formField('description', 'MÃ´ táº£', 'textarea', { value: company.description })}
        
        ${Components.formField('status', 'Tráº¡ng thÃ¡i', 'select', {
            value: company.status || 'active',
            options: [
                { value: 'active', label: 'Hoáº¡t Ä‘á»™ng' },
                { value: 'potential', label: 'Tiá»m nÄƒng' },
                { value: 'inactive', label: 'KhÃ´ng hoáº¡t Ä‘á»™ng' }
            ]
        })}
      </form>
    `;
    },

    async createCompany() {
        const form = document.getElementById('companyForm');

        if (!Components.validateForm(form)) {
            Components.toast('Vui lÃ²ng Ä‘iá»n Ä‘áº§y Ä‘á»§ thÃ´ng tin báº¯t buá»™c', 'error');
            return;
        }

        const data = Components.getFormData(form);

        Components.showLoading('Äang táº¡o...');

        try {
            await API.createCompany(data);
            Components.hideLoading();
            Components.closeModal();
            Components.toast('Táº¡o cÃ´ng ty thÃ nh cÃ´ng!', 'success');
            this.loadCompanies();
        } catch (error) {
            Components.hideLoading();
            Components.toast(error.message, 'error');
        }
    },

    async updateCompany(id) {
        const form = document.getElementById('companyForm');

        if (!Components.validateForm(form)) {
            Components.toast('Vui lÃ²ng Ä‘iá»n Ä‘áº§y Ä‘á»§ thÃ´ng tin báº¯t buá»™c', 'error');
            return;
        }

        const data = Components.getFormData(form);

        Components.showLoading('Äang lÆ°u...');

        try {
            await API.updateCompany(id, data);
            Components.hideLoading();
            Components.closeModal();
            Components.toast('Cáº­p nháº­t thÃ nh cÃ´ng!', 'success');
            this.loadCompanies();
        } catch (error) {
            Components.hideLoading();
            Components.toast(error.message, 'error');
        }
    },

    async deleteCompany(id) {
        const confirmed = await Components.confirm(
            'Báº¡n cÃ³ cháº¯c muá»‘n xÃ³a cÃ´ng ty nÃ y?',
            { title: 'XÃ¡c nháº­n xÃ³a', danger: true, confirmText: 'XÃ³a' }
        );

        if (!confirmed) return;

        Components.showLoading('Äang xÃ³a...');

        try {
            await API.deleteCompany(id);
            Components.hideLoading();
            Components.toast('ÄÃ£ xÃ³a cÃ´ng ty', 'success');
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
            ðŸ¢
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
            <span class="detail-label">Äiá»‡n thoáº¡i</span>
            <span class="detail-value">${company.phone || '-'}</span>
          </div>
          <div class="detail-field">
            <span class="detail-label">Website</span>
            <span class="detail-value">${company.website ? `<a href="${company.website}" target="_blank">${company.website}</a>` : '-'}</span>
          </div>
          <div class="detail-field">
            <span class="detail-label">Quy mÃ´</span>
            <span class="detail-value">${company.size || '-'}</span>
          </div>
        </div>
        
        ${company.address ? `
          <div class="detail-field mt-4">
            <span class="detail-label">Äá»‹a chá»‰</span>
            <span class="detail-value">${company.address}</span>
          </div>
        ` : ''}
        
        <div class="detail-section mt-4">
          <h4 class="detail-section-title">ðŸ“Š Thá»‘ng kÃª</h4>
          <div class="detail-grid">
            <div class="detail-field">
              <span class="detail-label">Tá»•ng liÃªn há»‡</span>
              <span class="detail-value">${company.stats?.totalContacts || 0}</span>
            </div>
            <div class="detail-field">
              <span class="detail-label">Tá»•ng deals</span>
              <span class="detail-value">${company.stats?.totalDeals || 0}</span>
            </div>
            <div class="detail-field">
              <span class="detail-label">Deals Ä‘ang má»Ÿ</span>
              <span class="detail-value">${company.stats?.activeDeals || 0}</span>
            </div>
            <div class="detail-field">
              <span class="detail-label">Tá»•ng doanh thu</span>
              <span class="detail-value text-success">${Utils.formatCurrency(company.stats?.wonValue || 0)}</span>
            </div>
          </div>
        </div>
        
        <div style="display: flex; gap: 12px; margin-top: 24px; padding-top: 16px; border-top: 1px solid var(--border-color-light);">
          <button class="btn btn-secondary" onclick="CompaniesPage.openEditModal('${id}'); Components.closeModal();">
            <i class="lucide-edit"></i> Sá»­a
          </button>
          <button class="btn btn-danger" onclick="CompaniesPage.deleteCompany('${id}'); Components.closeModal();">
            <i class="lucide-trash-2"></i> XÃ³a
          </button>
        </div>
      `;

            Components.openModal('Chi tiáº¿t cÃ´ng ty', content, {
                size: 'lg',
                hideFooter: true
            });

        } catch (error) {
            Components.hideLoading();
            Components.toast(error.message, 'error');
        }
    }
};

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
                'âš ï¸',
                'KhÃ´ng thá»ƒ táº£i dá»¯ liá»‡u',
                error.message,
                'Thá»­ láº¡i',
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
          <div style="display: flex; align-items: center; gap: 16px;">
            <span class="text-secondary">Tá»•ng: <strong>${result.summary.totalDeals}</strong> deals</span>
            <span class="text-secondary">GiÃ¡ trá»‹: <strong class="text-success">${Utils.formatCurrency(result.summary.totalValue)}</strong></span>
          </div>
        </div>
        
        <button class="btn btn-primary" onclick="DealsPage.openCreateModal()">
          <i class="lucide-plus"></i> ThÃªm deal
        </button>
      </div>
      
      <!-- Pipeline -->
      <div class="pipeline-container">
        ${this.renderPipeline(this.pipelineData)}
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
                    : '<p class="text-center text-secondary" style="padding: 20px; font-size: 13px;">ChÆ°a cÃ³ deal</p>'
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
        ${company ? `<div class="deal-card-company">ðŸ¢ ${company.name}</div>` : ''}
        ${contact ? `<div class="deal-card-company">ðŸ‘¤ ${Utils.getFullName(contact.first_name, contact.last_name)}</div>` : ''}
        <div class="deal-card-footer">
          <span class="deal-card-value">${Utils.formatCurrency(deal.value)}</span>
          ${deal.expected_close ? `<span class="deal-card-date">${Utils.formatDate(deal.expected_close)}</span>` : ''}
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
                            Components.toast('ÄÃ£ cáº­p nháº­t tráº¡ng thÃ¡i deal', 'success');

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

        Components.openModal('ThÃªm deal má»›i', content, {
            confirmText: 'Táº¡o deal',
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

            Components.openModal('Sá»­a deal', content, {
                confirmText: 'LÆ°u thay Ä‘á»•i',
                onConfirm: () => this.updateDeal(id)
            });

        } catch (error) {
            Components.hideLoading();
            Components.toast(error.message, 'error');
        }
    },

    renderDealForm(deal = {}) {
        const stages = AppData.dealStages || [
            { id: 'new', name: 'Má»›i' },
            { id: 'qualified', name: 'Äá»§ Ä‘iá»u kiá»‡n' },
            { id: 'proposal', name: 'Äá» xuáº¥t' },
            { id: 'negotiation', name: 'ÄÃ m phÃ¡n' },
            { id: 'won', name: 'ThÃ nh cÃ´ng' },
            { id: 'lost', name: 'Tháº¥t báº¡i' }
        ];

        const sources = AppData.sources || ['Website', 'Facebook', 'Zalo', 'Giá»›i thiá»‡u', 'KhÃ¡c'];

        return `
      <form id="dealForm">
        ${Components.formField('title', 'TÃªn deal', 'text', { value: deal.title, required: true, placeholder: 'VÃ­ dá»¥: Há»£p Ä‘á»“ng dá»‹ch vá»¥ ABC' })}
        
        <div class="form-row">
          ${Components.formField('value', 'GiÃ¡ trá»‹ (VNÄ)', 'number', { value: deal.value, placeholder: '0' })}
          ${Components.formField('stage', 'Giai Ä‘oáº¡n', 'select', {
            value: deal.stage || 'new',
            options: stages.map(s => ({ value: s.id, label: s.name }))
        })}
        </div>
        
        ${Components.formField('expected_close', 'NgÃ y dá»± kiáº¿n Ä‘Ã³ng', 'date', { value: deal.expected_close ? deal.expected_close.split('T')[0] : '' })}
        
        ${Components.formField('source', 'Nguá»“n', 'select', {
            value: deal.source,
            options: [{ value: '', label: '-- Chá»n nguá»“n --' }, ...sources.map(s => ({ value: s, label: s }))]
        })}
        
        ${Components.formField('description', 'MÃ´ táº£', 'textarea', { value: deal.description })}
        
        ${deal.stage === 'lost' ? Components.formField('lost_reason', 'LÃ½ do tháº¥t báº¡i', 'textarea', { value: deal.lost_reason }) : ''}
      </form>
    `;
    },

    async createDeal() {
        const form = document.getElementById('dealForm');

        if (!Components.validateForm(form)) {
            Components.toast('Vui lÃ²ng Ä‘iá»n Ä‘áº§y Ä‘á»§ thÃ´ng tin báº¯t buá»™c', 'error');
            return;
        }

        const data = Components.getFormData(form);

        Components.showLoading('Äang táº¡o...');

        try {
            await API.createDeal(data);
            Components.hideLoading();
            Components.closeModal();
            Components.toast('Táº¡o deal thÃ nh cÃ´ng!', 'success');
            this.loadPipeline();
        } catch (error) {
            Components.hideLoading();
            Components.toast(error.message, 'error');
        }
    },

    async updateDeal(id) {
        const form = document.getElementById('dealForm');

        if (!Components.validateForm(form)) {
            Components.toast('Vui lÃ²ng Ä‘iá»n Ä‘áº§y Ä‘á»§ thÃ´ng tin báº¯t buá»™c', 'error');
            return;
        }

        const data = Components.getFormData(form);

        Components.showLoading('Äang lÆ°u...');

        try {
            await API.updateDeal(id, data);
            Components.hideLoading();
            Components.closeModal();
            Components.toast('Cáº­p nháº­t thÃ nh cÃ´ng!', 'success');
            this.loadPipeline();
        } catch (error) {
            Components.hideLoading();
            Components.toast(error.message, 'error');
        }
    },

    async deleteDeal(id) {
        const confirmed = await Components.confirm(
            'Báº¡n cÃ³ cháº¯c muá»‘n xÃ³a deal nÃ y?',
            { title: 'XÃ¡c nháº­n xÃ³a', danger: true, confirmText: 'XÃ³a' }
        );

        if (!confirmed) return;

        Components.showLoading('Äang xÃ³a...');

        try {
            await API.deleteDeal(id);
            Components.hideLoading();
            Components.toast('ÄÃ£ xÃ³a deal', 'success');
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
            <span class="detail-label">CÃ´ng ty</span>
            <span class="detail-value">${deal.company?.name || '-'}</span>
          </div>
          <div class="detail-field">
            <span class="detail-label">LiÃªn há»‡</span>
            <span class="detail-value">${deal.contact ? Utils.getFullName(deal.contact.first_name, deal.contact.last_name) : '-'}</span>
          </div>
          <div class="detail-field">
            <span class="detail-label">Nguá»“n</span>
            <span class="detail-value">${deal.source || '-'}</span>
          </div>
          <div class="detail-field">
            <span class="detail-label">XÃ¡c suáº¥t</span>
            <span class="detail-value">${deal.probability || 0}%</span>
          </div>
          <div class="detail-field">
            <span class="detail-label">NgÃ y dá»± kiáº¿n Ä‘Ã³ng</span>
            <span class="detail-value">${deal.expected_close ? Utils.formatDate(deal.expected_close) : '-'}</span>
          </div>
          <div class="detail-field">
            <span class="detail-label">NgÃ y táº¡o</span>
            <span class="detail-value">${Utils.formatDate(deal.created_at)}</span>
          </div>
        </div>
        
        ${deal.description ? `
          <div class="detail-section mt-4">
            <h4 class="detail-section-title">ðŸ“ MÃ´ táº£</h4>
            <p>${deal.description}</p>
          </div>
        ` : ''}
        
        ${deal.lost_reason ? `
          <div class="detail-section mt-4">
            <h4 class="detail-section-title text-danger">âŒ LÃ½ do tháº¥t báº¡i</h4>
            <p>${deal.lost_reason}</p>
          </div>
        ` : ''}
        
        <div style="display: flex; gap: 12px; margin-top: 24px; padding-top: 16px; border-top: 1px solid var(--border-color-light);">
          <button class="btn btn-secondary" onclick="DealsPage.openEditModal('${id}'); Components.closeModal();">
            <i class="lucide-edit"></i> Sá»­a
          </button>
          <button class="btn btn-danger" onclick="DealsPage.deleteDeal('${id}'); Components.closeModal();">
            <i class="lucide-trash-2"></i> XÃ³a
          </button>
        </div>
      `;

            Components.openModal('Chi tiáº¿t deal', content, {
                size: 'lg',
                hideFooter: true
            });

        } catch (error) {
            Components.hideLoading();
            Components.toast(error.message, 'error');
        }
    }
};

// =====================================================
// CRM PRO - TASKS PAGE
// =====================================================

const TasksPage = {

    async render() {
        const container = document.getElementById('tasksPage');
        container.innerHTML = '<div class="loading-spinner" style="margin: 40px auto;"></div>';

        try {
            await this.loadTasks();
        } catch (error) {
            container.innerHTML = Components.emptyState(
                'âš ï¸',
                'KhÃ´ng thá»ƒ táº£i dá»¯ liá»‡u',
                error.message,
                'Thá»­ láº¡i',
                'TasksPage.render()'
            );
        }
    },

    async loadTasks() {
        const container = document.getElementById('tasksPage');

        // Load tasks by category
        const [overdueResult, todayResult, allResult] = await Promise.all([
            API.getOverdueTasks(),
            API.getTodayTasks(),
            API.getTasks({ status: 'pending', limit: 50 })
        ]);

        const overdueTasks = overdueResult.data || [];
        const todayTasks = todayResult.data || [];
        const upcomingTasks = (allResult.data || []).filter(t => {
            if (!t.due_date) return true;
            const dueDate = new Date(t.due_date);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);
            return dueDate >= tomorrow;
        });

        // Update badge
        const totalPending = overdueTasks.length + todayTasks.length;
        const badge = document.getElementById('taskBadge');
        if (badge) {
            if (totalPending > 0) {
                badge.textContent = totalPending;
                badge.style.display = 'inline';
            } else {
                badge.style.display = 'none';
            }
        }

        container.innerHTML = `
      <!-- Header -->
      <div class="list-toolbar">
        <div class="filter-group">
          <span class="text-secondary">
            <strong>${overdueTasks.length}</strong> quÃ¡ háº¡n â€¢ 
            <strong>${todayTasks.length}</strong> hÃ´m nay â€¢ 
            <strong>${upcomingTasks.length}</strong> sáº¯p tá»›i
          </span>
        </div>
        
        <button class="btn btn-primary" onclick="TasksPage.openCreateModal()">
          <i class="lucide-plus"></i> ThÃªm cÃ´ng viá»‡c
        </button>
      </div>
      
      <!-- Task Sections -->
      <div class="task-sections">
        ${overdueTasks.length > 0 ? `
          <div class="task-section">
            <div class="task-section-header">
              <h4 class="task-section-title overdue">
                <span>âš ï¸</span> QuÃ¡ háº¡n (${overdueTasks.length})
              </h4>
            </div>
            <div class="task-list">
              ${overdueTasks.map(t => this.renderTaskItem(t, true)).join('')}
            </div>
          </div>
        ` : ''}
        
        <div class="task-section">
          <div class="task-section-header">
            <h4 class="task-section-title today">
              <span>ðŸ“…</span> HÃ´m nay (${todayTasks.length})
            </h4>
          </div>
          <div class="task-list">
            ${todayTasks.length > 0
                ? todayTasks.map(t => this.renderTaskItem(t)).join('')
                : '<p class="text-center text-secondary p-4">KhÃ´ng cÃ³ cÃ´ng viá»‡c hÃ´m nay ðŸŽ‰</p>'
            }
          </div>
        </div>
        
        <div class="task-section">
          <div class="task-section-header">
            <h4 class="task-section-title">
              <span>ðŸ“‹</span> Sáº¯p tá»›i (${upcomingTasks.length})
            </h4>
          </div>
          <div class="task-list">
            ${upcomingTasks.length > 0
                ? upcomingTasks.map(t => this.renderTaskItem(t)).join('')
                : '<p class="text-center text-secondary p-4">ChÆ°a cÃ³ cÃ´ng viá»‡c nÃ o</p>'
            }
          </div>
        </div>
      </div>
    `;
    },

    renderTaskItem(task, isOverdue = false) {
        const typeInfo = task.typeInfo || { icon: 'âœ…', name: task.type };
        const priorityClass = task.priority || 'medium';
        const priorityLabels = { low: 'Tháº¥p', medium: 'TB', high: 'Cao', urgent: 'Kháº©n' };

        return `
      <div class="task-item ${task.status === 'completed' ? 'completed' : ''}">
        <div class="task-checkbox ${task.status === 'completed' ? 'checked' : ''}" 
             onclick="TasksPage.toggleComplete('${task.id}', ${task.status !== 'completed'})">
          ${task.status === 'completed' ? 'âœ“' : ''}
        </div>
        
        <div class="task-content" onclick="TasksPage.viewTask('${task.id}')">
          <div class="task-title">${task.title}</div>
          <div class="task-meta">
            <span class="task-type">${typeInfo.icon} ${typeInfo.name}</span>
            <span class="task-priority ${priorityClass}">${priorityLabels[priorityClass]}</span>
            ${task.due_date ? `
              <span class="task-due ${isOverdue ? 'overdue' : ''}">
                ðŸ“… ${Utils.formatDate(task.due_date)}
                ${task.daysOverdue ? `(${task.daysOverdue} ngÃ y)` : ''}
              </span>
            ` : ''}
            ${task.contact ? `<span>ðŸ‘¤ ${Utils.getFullName(task.contact.first_name, task.contact.last_name)}</span>` : ''}
          </div>
        </div>
        
        <div class="table-actions">
          <button class="btn-icon" onclick="TasksPage.openEditModal('${task.id}')" title="Sá»­a">
            <i class="lucide-edit"></i>
          </button>
          <button class="btn-icon" onclick="TasksPage.deleteTask('${task.id}')" title="XÃ³a">
            <i class="lucide-trash-2"></i>
          </button>
        </div>
      </div>
    `;
    },

    async toggleComplete(id, complete) {
        try {
            if (complete) {
                await API.completeTask(id);
                Components.toast('ÄÃ£ hoÃ n thÃ nh cÃ´ng viá»‡c!', 'success');
            } else {
                await API.updateTask(id, { status: 'pending' });
                Components.toast('ÄÃ£ Ä‘Ã¡nh dáº¥u chÆ°a hoÃ n thÃ nh', 'info');
            }
            this.loadTasks();
        } catch (error) {
            Components.toast(error.message, 'error');
        }
    },

    openCreateModal() {
        const content = this.renderTaskForm();

        Components.openModal('ThÃªm cÃ´ng viá»‡c má»›i', content, {
            confirmText: 'Táº¡o cÃ´ng viá»‡c',
            onConfirm: () => this.createTask()
        });
    },

    async openEditModal(id) {
        Components.showLoading();

        try {
            const result = await API.getTask(id);
            const task = result.data;

            Components.hideLoading();

            const content = this.renderTaskForm(task);

            Components.openModal('Sá»­a cÃ´ng viá»‡c', content, {
                confirmText: 'LÆ°u thay Ä‘á»•i',
                onConfirm: () => this.updateTask(id)
            });

        } catch (error) {
            Components.hideLoading();
            Components.toast(error.message, 'error');
        }
    },

    renderTaskForm(task = {}) {
        const types = AppData.taskTypes || [
            { id: 'call', name: 'Gá»i Ä‘iá»‡n' },
            { id: 'email', name: 'Email' },
            { id: 'meeting', name: 'Há»p' },
            { id: 'task', name: 'CÃ´ng viá»‡c' },
            { id: 'deadline', name: 'Deadline' }
        ];

        const priorities = AppData.taskPriorities || [
            { id: 'low', name: 'Tháº¥p' },
            { id: 'medium', name: 'Trung bÃ¬nh' },
            { id: 'high', name: 'Cao' },
            { id: 'urgent', name: 'Kháº©n cáº¥p' }
        ];

        return `
      <form id="taskForm">
        ${Components.formField('title', 'TiÃªu Ä‘á»', 'text', { value: task.title, required: true, placeholder: 'MÃ´ táº£ cÃ´ng viá»‡c' })}
        
        <div class="form-row">
          ${Components.formField('type', 'Loáº¡i', 'select', {
            value: task.type || 'task',
            options: types.map(t => ({ value: t.id, label: t.name }))
        })}
          ${Components.formField('priority', 'Äá»™ Æ°u tiÃªn', 'select', {
            value: task.priority || 'medium',
            options: priorities.map(p => ({ value: p.id, label: p.name }))
        })}
        </div>
        
        ${Components.formField('due_date', 'Háº¡n hoÃ n thÃ nh', 'datetime-local', {
            value: task.due_date ? task.due_date.slice(0, 16) : ''
        })}
        
        ${Components.formField('description', 'MÃ´ táº£ chi tiáº¿t', 'textarea', { value: task.description })}
      </form>
    `;
    },

    async createTask() {
        const form = document.getElementById('taskForm');

        if (!Components.validateForm(form)) {
            Components.toast('Vui lÃ²ng Ä‘iá»n Ä‘áº§y Ä‘á»§ thÃ´ng tin báº¯t buá»™c', 'error');
            return;
        }

        const data = Components.getFormData(form);

        Components.showLoading('Äang táº¡o...');

        try {
            await API.createTask(data);
            Components.hideLoading();
            Components.closeModal();
            Components.toast('Táº¡o cÃ´ng viá»‡c thÃ nh cÃ´ng!', 'success');
            this.loadTasks();
        } catch (error) {
            Components.hideLoading();
            Components.toast(error.message, 'error');
        }
    },

    async updateTask(id) {
        const form = document.getElementById('taskForm');

        if (!Components.validateForm(form)) {
            Components.toast('Vui lÃ²ng Ä‘iá»n Ä‘áº§y Ä‘á»§ thÃ´ng tin báº¯t buá»™c', 'error');
            return;
        }

        const data = Components.getFormData(form);

        Components.showLoading('Äang lÆ°u...');

        try {
            await API.updateTask(id, data);
            Components.hideLoading();
            Components.closeModal();
            Components.toast('Cáº­p nháº­t thÃ nh cÃ´ng!', 'success');
            this.loadTasks();
        } catch (error) {
            Components.hideLoading();
            Components.toast(error.message, 'error');
        }
    },

    async deleteTask(id) {
        const confirmed = await Components.confirm(
            'Báº¡n cÃ³ cháº¯c muá»‘n xÃ³a cÃ´ng viá»‡c nÃ y?',
            { title: 'XÃ¡c nháº­n xÃ³a', danger: true, confirmText: 'XÃ³a' }
        );

        if (!confirmed) return;

        Components.showLoading('Äang xÃ³a...');

        try {
            await API.deleteTask(id);
            Components.hideLoading();
            Components.toast('ÄÃ£ xÃ³a cÃ´ng viá»‡c', 'success');
            this.loadTasks();
        } catch (error) {
            Components.hideLoading();
            Components.toast(error.message, 'error');
        }
    },

    async viewTask(id) {
        Components.showLoading();

        try {
            const result = await API.getTask(id);
            const task = result.data;

            Components.hideLoading();

            const typeInfo = task.typeInfo || { icon: 'âœ…', name: task.type };
            const priorityLabels = { low: 'Tháº¥p', medium: 'Trung bÃ¬nh', high: 'Cao', urgent: 'Kháº©n cáº¥p' };

            const content = `
        <div style="margin-bottom: 24px;">
          <h3 style="margin-bottom: 12px;">${task.title}</h3>
          <div style="display: flex; gap: 12px; flex-wrap: wrap;">
            ${Components.badge(typeInfo.name, 'primary')}
            <span class="task-priority ${task.priority}">${priorityLabels[task.priority]}</span>
            ${Components.badge(Utils.getStatusLabel(task.status, 'task'), Utils.getStatusBadgeClass(task.status).replace('badge-', ''))}
          </div>
        </div>
        
        <div class="detail-grid">
          <div class="detail-field">
            <span class="detail-label">Háº¡n hoÃ n thÃ nh</span>
            <span class="detail-value ${task.isOverdue ? 'text-danger' : ''}">${task.due_date ? Utils.formatDateTime(task.due_date) : '-'}</span>
          </div>
          <div class="detail-field">
            <span class="detail-label">NgÃ y táº¡o</span>
            <span class="detail-value">${Utils.formatDateTime(task.created_at)}</span>
          </div>
          ${task.completed_at ? `
            <div class="detail-field">
              <span class="detail-label">HoÃ n thÃ nh lÃºc</span>
              <span class="detail-value">${Utils.formatDateTime(task.completed_at)}</span>
            </div>
          ` : ''}
          ${task.contact ? `
            <div class="detail-field">
              <span class="detail-label">LiÃªn há»‡</span>
              <span class="detail-value">${Utils.getFullName(task.contact.first_name, task.contact.last_name)}</span>
            </div>
          ` : ''}
        </div>
        
        ${task.description ? `
          <div class="detail-section mt-4">
            <h4 class="detail-section-title">ðŸ“ MÃ´ táº£</h4>
            <p>${task.description}</p>
          </div>
        ` : ''}
        
        <div style="display: flex; gap: 12px; margin-top: 24px; padding-top: 16px; border-top: 1px solid var(--border-color-light);">
          ${task.status !== 'completed' ? `
            <button class="btn btn-success" onclick="TasksPage.toggleComplete('${id}', true); Components.closeModal();">
              <i class="lucide-check"></i> HoÃ n thÃ nh
            </button>
          ` : ''}
          <button class="btn btn-secondary" onclick="TasksPage.openEditModal('${id}'); Components.closeModal();">
            <i class="lucide-edit"></i> Sá»­a
          </button>
          <button class="btn btn-danger" onclick="TasksPage.deleteTask('${id}'); Components.closeModal();">
            <i class="lucide-trash-2"></i> XÃ³a
          </button>
        </div>
      `;

            Components.openModal('Chi tiáº¿t cÃ´ng viá»‡c', content, {
                hideFooter: true
            });

        } catch (error) {
            Components.hideLoading();
            Components.toast(error.message, 'error');
        }
    }
};

// =====================================================
// CRM PRO - MAIN APPLICATION
// =====================================================

const App = {
    currentPage: 'dashboard',

    async init() {
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

        // Settings button
        document.getElementById('settingsBtn').addEventListener('click', () => {
            document.getElementById('settingsOverlay').style.display = 'flex';
        });

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
    },

    navigateTo(page, id = null) {
        // Update URL
        window.location.hash = page;

        // Update nav
        document.querySelectorAll('.nav-item').forEach(item => {
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
            contacts: 'LiÃªn há»‡',
            companies: 'CÃ´ng ty',
            deals: 'Deals',
            tasks: 'CÃ´ng viá»‡c'
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
    },

    showAddNewMenu() {
        const items = [
            { icon: 'ðŸ‘¤', label: 'LiÃªn há»‡ má»›i', action: 'ContactsPage.openCreateModal()' },
            { icon: 'ðŸ¢', label: 'CÃ´ng ty má»›i', action: 'CompaniesPage.openCreateModal()' },
            { icon: 'ðŸ’°', label: 'Deal má»›i', action: 'DealsPage.openCreateModal()' },
            { icon: 'âœ…', label: 'CÃ´ng viá»‡c má»›i', action: 'TasksPage.openCreateModal()' }
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

        Components.openModal('ThÃªm má»›i', content, { hideFooter: true });
    },

    async globalSearch(query) {
        try {
            const result = await API.searchContacts(query, 5);
            // TODO: Show search results dropdown
            console.log('Search results:', result.data);
        } catch (error) {
            console.error('Search error:', error);
        }
    }
};

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    App.init();
});

