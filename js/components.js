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
            success: '✓',
            error: '✕',
            warning: '⚠',
            info: 'ℹ'
        };

        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.innerHTML = `
      <div class="toast-icon">${icons[type]}</div>
      <div class="toast-content">
        <div class="toast-message">${message}</div>
      </div>
      <button class="btn-icon toast-close" onclick="this.parentElement.remove()">
        <span>✕</span>
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
    showLoading(message = 'Đang tải...') {
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
            confirmBtn.textContent = options.confirmText || 'Xác nhận';
            cancelBtn.textContent = options.cancelText || 'Hủy';

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
                options.title || 'Xác nhận',
                `<p>${message}</p>`,
                {
                    confirmText: options.confirmText || 'Xác nhận',
                    cancelText: options.cancelText || 'Hủy',
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
          <button class="pagination-btn" data-page="${current - 1}" ${current <= 1 ? 'disabled' : ''}>‹</button>
          ${buttonsHtml}
          <button class="pagination-btn" data-page="${current + 1}" ${current >= total ? 'disabled' : ''}>›</button>
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
           ${change >= 0 ? '↑' : '↓'} ${Math.abs(change)}% so với tháng trước
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

    Components.toast('Đã lưu cài đặt', 'success');
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
