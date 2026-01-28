// =====================================================
// CRM PRO - UTILITY FUNCTIONS
// =====================================================

const Utils = {

    /**
     * Format currency VND
     */
    formatCurrency(amount) {
        if (!amount) return '0 ₫';
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

        if (seconds < 60) return 'Vừa xong';

        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) return `${minutes} phút trước`;

        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours} giờ trước`;

        const days = Math.floor(hours / 24);
        if (days < 7) return `${days} ngày trước`;

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
        return `${firstName || ''} ${lastName || ''}`.trim() || 'Không tên';
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
                'prospect': 'Tiềm năng',
                'customer': 'Khách hàng',
                'inactive': 'Không hoạt động'
            },
            company: {
                'active': 'Hoạt động',
                'inactive': 'Không hoạt động',
                'potential': 'Tiềm năng'
            },
            deal: {
                'new': 'Mới',
                'qualified': 'Đủ điều kiện',
                'proposal': 'Đề xuất',
                'negotiation': 'Đàm phán',
                'won': 'Thành công',
                'lost': 'Thất bại'
            },
            task: {
                'pending': 'Chờ xử lý',
                'in_progress': 'Đang làm',
                'completed': 'Hoàn thành',
                'cancelled': 'Đã hủy'
            }
        };

        return labels[type]?.[status] || status;
    },

    /**
     * Show toast notification
     */
    showToast(message, type = 'info') {
        // Remove existing toast
        const existingToast = document.querySelector('.toast-notification');
        if (existingToast) existingToast.remove();

        // Create toast
        const toast = document.createElement('div');
        toast.className = `toast-notification toast-${type}`;
        toast.innerHTML = `
            <span>${message}</span>
            <button onclick="this.parentElement.remove()">&times;</button>
        `;

        // Add styles if not exists
        if (!document.getElementById('toast-styles')) {
            const style = document.createElement('style');
            style.id = 'toast-styles';
            style.textContent = `
                .toast-notification {
                    position: fixed;
                    bottom: 20px;
                    right: 20px;
                    padding: 12px 20px;
                    border-radius: 8px;
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    z-index: 10000;
                    animation: slideIn 0.3s ease;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                    font-size: 14px;
                }
                .toast-success { background: #22c55e; color: white; }
                .toast-error { background: #ef4444; color: white; }
                .toast-warning { background: #f59e0b; color: white; }
                .toast-info { background: #3b82f6; color: white; }
                .toast-notification button {
                    background: none;
                    border: none;
                    color: inherit;
                    font-size: 18px;
                    cursor: pointer;
                    opacity: 0.7;
                }
                .toast-notification button:hover { opacity: 1; }
                @keyframes slideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
            `;
            document.head.appendChild(style);
        }

        document.body.appendChild(toast);

        // Auto remove after 4 seconds
        setTimeout(() => toast.remove(), 4000);
    }
};
