// =====================================================
// CRM PRO - API CLIENT (JSONP để bypass CORS)
// Supports both Google Sheets and Supabase backends
// =====================================================

const API = {

    _callbackCounter: 0,

    // Actions that should be cached
    cacheableActions: [
        'getConfig', 'getDashboardStats', 'getContacts', 'getCompanies',
        'getDealsPipeline', 'getDeals', 'getTasks', 'getRecentActivities'
    ],

    /**
     * Get the appropriate API backend based on config
     */
    getBackend() {
        if (AppConfig.isSupabase() && typeof SupabaseAPI !== 'undefined') {
            return SupabaseAPI;
        }
        return null; // Use this (Google Sheets JSONP)
    },

    /**
     * Make API request using JSONP to bypass CORS
     */
    async request(action, data = {}, method = 'GET') {
        const apiUrl = AppConfig.getApiUrl();

        if (!apiUrl) {
            throw new Error('API chưa được cấu hình. Vui lòng vào Cài đặt để nhập URL.');
        }

        // Check cache for GET requests
        const isGET = method === 'GET';
        const isCacheable = isGET && this.cacheableActions.includes(action);

        if (isCacheable && typeof CacheManager !== 'undefined') {
            const cached = CacheManager.get(action, data);
            if (cached) {
                return cached;
            }
        }

        return new Promise((resolve, reject) => {
            try {
                // Generate unique callback name
                const callbackName = `crmCallback_${Date.now()}_${++this._callbackCounter}`;

                // Build URL với params
                const params = new URLSearchParams({
                    action,
                    callback: callbackName
                });

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

                // Create script element for JSONP
                const script = document.createElement('script');
                script.src = url;

                // Setup callback
                window[callbackName] = (result) => {
                    // Cleanup
                    delete window[callbackName];
                    document.body.removeChild(script);

                    if (result.success) {
                        // Cache successful GET responses
                        if (isCacheable && typeof CacheManager !== 'undefined') {
                            CacheManager.set(action, data, result);
                        }
                        resolve(result);
                    } else {
                        reject(new Error(result.error || 'Có lỗi xảy ra'));
                    }
                };

                // Handle script errors
                script.onerror = () => {
                    delete window[callbackName];
                    document.body.removeChild(script);
                    reject(new Error('Không thể kết nối đến server'));
                };

                // Timeout after 30 seconds
                setTimeout(() => {
                    if (window[callbackName]) {
                        delete window[callbackName];
                        if (script.parentNode) {
                            document.body.removeChild(script);
                        }
                        reject(new Error('Request timeout'));
                    }
                }, 30000);

                // Add script to page to trigger request
                document.body.appendChild(script);

            } catch (error) {
                console.error('API Error:', error);
                reject(error);
            }
        });
    },

    // ===== CONFIG =====
    async getConfig() {
        const backend = this.getBackend();
        if (backend) return backend.getConfig();
        return this.request('getConfig', {}, 'GET');
    },

    async testConnection() {
        const backend = this.getBackend();
        if (backend) return backend.testConnection();
        return this.request('testConnection', {}, 'GET');
    },

    async initializeDatabase() {
        // Only for Google Sheets
        return this.request('initializeDatabase');
    },

    // ===== DASHBOARD =====
    async getDashboardStats() {
        const backend = this.getBackend();
        if (backend) return backend.getDashboardStats();
        return this.request('getDashboardStats', {}, 'GET');
    },

    async getRecentActivities(limit = 20) {
        const backend = this.getBackend();
        if (backend) return backend.getRecentActivities(limit);
        return this.request('getRecentActivities', { limit }, 'GET');
    },

    // ===== CONTACTS =====
    async getContacts(params = {}) {
        const backend = this.getBackend();
        if (backend) return backend.getContacts(params);
        return this.request('getContacts', params, 'GET');
    },

    async getContact(id) {
        const backend = this.getBackend();
        if (backend) return backend.getContact(id);
        return this.request('getContact', { id }, 'GET');
    },

    async createContact(data) {
        const backend = this.getBackend();
        if (backend) {
            const result = await backend.createContact(data);
            if (typeof CacheManager !== 'undefined') CacheManager.invalidateOnWrite('contact');
            return result;
        }
        const result = await this.request('createContact', data);
        if (typeof CacheManager !== 'undefined') CacheManager.invalidateOnWrite('contact');
        return result;
    },

    async updateContact(id, data) {
        const backend = this.getBackend();
        if (backend) {
            const result = await backend.updateContact(id, data);
            if (typeof CacheManager !== 'undefined') CacheManager.invalidateOnWrite('contact');
            return result;
        }
        const result = await this.request('updateContact', { id, ...data });
        if (typeof CacheManager !== 'undefined') CacheManager.invalidateOnWrite('contact');
        return result;
    },

    async deleteContact(id) {
        const backend = this.getBackend();
        if (backend) {
            const result = await backend.deleteContact(id);
            if (typeof CacheManager !== 'undefined') CacheManager.invalidateOnWrite('contact');
            return result;
        }
        const result = await this.request('deleteContact', { id });
        if (typeof CacheManager !== 'undefined') CacheManager.invalidateOnWrite('contact');
        return result;
    },

    async searchContacts(q, limit = 10) {
        const backend = this.getBackend();
        if (backend) return backend.searchContacts(q, limit);
        return this.request('searchContacts', { q, limit }, 'GET');
    },

    // ===== COMPANIES =====
    async getCompanies(params = {}) {
        const backend = this.getBackend();
        if (backend) return backend.getCompanies(params);
        return this.request('getCompanies', params, 'GET');
    },

    async getCompany(id) {
        const backend = this.getBackend();
        if (backend) return backend.getCompany(id);
        return this.request('getCompany', { id }, 'GET');
    },

    async createCompany(data) {
        const backend = this.getBackend();
        if (backend) {
            const result = await backend.createCompany(data);
            if (typeof CacheManager !== 'undefined') CacheManager.invalidateOnWrite('company');
            return result;
        }
        const result = await this.request('createCompany', data);
        if (typeof CacheManager !== 'undefined') CacheManager.invalidateOnWrite('company');
        return result;
    },

    async updateCompany(id, data) {
        const backend = this.getBackend();
        if (backend) {
            const result = await backend.updateCompany(id, data);
            if (typeof CacheManager !== 'undefined') CacheManager.invalidateOnWrite('company');
            return result;
        }
        const result = await this.request('updateCompany', { id, ...data });
        if (typeof CacheManager !== 'undefined') CacheManager.invalidateOnWrite('company');
        return result;
    },

    async deleteCompany(id) {
        const backend = this.getBackend();
        if (backend) {
            const result = await backend.deleteCompany(id);
            if (typeof CacheManager !== 'undefined') CacheManager.invalidateOnWrite('company');
            return result;
        }
        const result = await this.request('deleteCompany', { id });
        if (typeof CacheManager !== 'undefined') CacheManager.invalidateOnWrite('company');
        return result;
    },

    // ===== DEALS =====
    async getDeals(params = {}) {
        const backend = this.getBackend();
        if (backend) return backend.getDeals(params);
        return this.request('getDeals', params, 'GET');
    },

    async getDeal(id) {
        const backend = this.getBackend();
        if (backend) return backend.getDeal(id);
        return this.request('getDeal', { id }, 'GET');
    },

    async createDeal(data) {
        const backend = this.getBackend();
        if (backend) {
            const result = await backend.createDeal(data);
            if (typeof CacheManager !== 'undefined') CacheManager.invalidateOnWrite('deal');
            return result;
        }
        const result = await this.request('createDeal', data);
        if (typeof CacheManager !== 'undefined') CacheManager.invalidateOnWrite('deal');
        return result;
    },

    async updateDeal(id, data) {
        const backend = this.getBackend();
        if (backend) {
            const result = await backend.updateDeal(id, data);
            if (typeof CacheManager !== 'undefined') CacheManager.invalidateOnWrite('deal');
            return result;
        }
        const result = await this.request('updateDeal', { id, ...data });
        if (typeof CacheManager !== 'undefined') CacheManager.invalidateOnWrite('deal');
        return result;
    },

    async updateDealStage(id, stage) {
        const backend = this.getBackend();
        if (backend) {
            const result = await backend.updateDealStage(id, stage);
            if (typeof CacheManager !== 'undefined') CacheManager.invalidateOnWrite('deal');
            return result;
        }
        const result = await this.request('updateDealStage', { id, stage });
        if (typeof CacheManager !== 'undefined') CacheManager.invalidateOnWrite('deal');
        return result;
    },

    async deleteDeal(id) {
        const backend = this.getBackend();
        if (backend) {
            const result = await backend.deleteDeal(id);
            if (typeof CacheManager !== 'undefined') CacheManager.invalidateOnWrite('deal');
            return result;
        }
        const result = await this.request('deleteDeal', { id });
        if (typeof CacheManager !== 'undefined') CacheManager.invalidateOnWrite('deal');
        return result;
    },

    async getDealsPipeline() {
        const backend = this.getBackend();
        if (backend) return backend.getDealsPipeline();
        return this.request('getDealsPipeline', {}, 'GET');
    },

    // ===== TASKS =====
    async getTasks(params = {}) {
        const backend = this.getBackend();
        if (backend) return backend.getTasks(params);
        return this.request('getTasks', params, 'GET');
    },

    async getTask(id) {
        const backend = this.getBackend();
        if (backend) return backend.getTask(id);
        return this.request('getTask', { id }, 'GET');
    },

    async createTask(data) {
        const backend = this.getBackend();
        if (backend) {
            const result = await backend.createTask(data);
            if (typeof CacheManager !== 'undefined') CacheManager.invalidateOnWrite('task');
            return result;
        }
        const result = await this.request('createTask', data);
        if (typeof CacheManager !== 'undefined') CacheManager.invalidateOnWrite('task');
        return result;
    },

    async updateTask(id, data) {
        const backend = this.getBackend();
        if (backend) {
            const result = await backend.updateTask(id, data);
            if (typeof CacheManager !== 'undefined') CacheManager.invalidateOnWrite('task');
            return result;
        }
        const result = await this.request('updateTask', { id, ...data });
        if (typeof CacheManager !== 'undefined') CacheManager.invalidateOnWrite('task');
        return result;
    },

    async completeTask(id) {
        const backend = this.getBackend();
        if (backend) {
            const result = await backend.completeTask(id);
            if (typeof CacheManager !== 'undefined') CacheManager.invalidateOnWrite('task');
            return result;
        }
        const result = await this.request('completeTask', { id });
        if (typeof CacheManager !== 'undefined') CacheManager.invalidateOnWrite('task');
        return result;
    },

    async deleteTask(id) {
        const backend = this.getBackend();
        if (backend) {
            const result = await backend.deleteTask(id);
            if (typeof CacheManager !== 'undefined') CacheManager.invalidateOnWrite('task');
            return result;
        }
        const result = await this.request('deleteTask', { id });
        if (typeof CacheManager !== 'undefined') CacheManager.invalidateOnWrite('task');
        return result;
    },

    async getOverdueTasks() {
        const backend = this.getBackend();
        if (backend) return backend.getOverdueTasks();
        return this.request('getOverdueTasks', {}, 'GET');
    },

    async getTodayTasks() {
        const backend = this.getBackend();
        if (backend) return backend.getTodayTasks();
        return this.request('getTodayTasks', {}, 'GET');
    },

    // ===== NOTES =====
    async getNotes(params = {}) {
        const backend = this.getBackend();
        if (backend) return backend.getNotes(params);
        return this.request('getNotes', params, 'GET');
    },

    async createNote(data) {
        const backend = this.getBackend();
        if (backend) return backend.createNote(data);
        return this.request('createNote', data);
    },

    async updateNote(id, data) {
        return this.request('updateNote', { id, ...data });
    },

    async deleteNote(id) {
        const backend = this.getBackend();
        if (backend) return backend.deleteNote(id);
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
            reader.onerror = () => reject(new Error('Không thể đọc file'));
            reader.readAsDataURL(file);
        });
    },

    async getFiles(entityType, entityId) {
        return this.request('getFiles', { entityType, entityId }, 'GET');
    },

    async deleteFile(fileId) {
        return this.request('deleteFile', { fileId });
    },

    // ===== N8N & WEBHOOKS =====
    async setWebhookUrl(url) {
        return this.request('setWebhookUrl', { url });
    },

    async getWebhookUrl() {
        return this.request('getWebhookUrl', {}, 'GET');
    },

    async clearCache() {
        return this.request('clearCache');
    },

    // Webhook để n8n gọi vào CRM
    async triggerWebhook(event, payload) {
        return this.request('webhook', { event, payload });
    },

    // ===== SINGLE CONTACT =====
    async getContact(id) {
        const backend = this.getBackend();
        if (backend) return backend.getContact(id);
        return this.request('getContact', { id }, 'GET');
    },

    // ===== APPOINTMENTS (Lịch hẹn) =====
    async getAppointments(contactId) {
        const backend = this.getBackend();
        if (backend) return backend.getAppointments(contactId);
        return this.request('getAppointments', { contact_id: contactId }, 'GET');
    },

    async createAppointment(data) {
        const backend = this.getBackend();
        if (backend) return backend.createAppointment(data);
        return this.request('createAppointment', data);
    },

    async updateAppointment(id, data) {
        const backend = this.getBackend();
        if (backend) return backend.updateAppointment(id, data);
        return this.request('updateAppointment', { id, ...data });
    },

    async deleteAppointment(id) {
        const backend = this.getBackend();
        if (backend) return backend.deleteAppointment(id);
        return this.request('deleteAppointment', { id });
    },

    // ===== REMINDERS (Nhắc nhở) =====
    async getReminders(contactId) {
        const backend = this.getBackend();
        if (backend) return backend.getReminders(contactId);
        return this.request('getReminders', { contact_id: contactId }, 'GET');
    },

    async createReminder(data) {
        const backend = this.getBackend();
        if (backend) return backend.createReminder(data);
        return this.request('createReminder', data);
    },

    async updateReminder(id, data) {
        const backend = this.getBackend();
        if (backend) return backend.updateReminder(id, data);
        return this.request('updateReminder', { id, ...data });
    },

    async deleteReminder(id) {
        const backend = this.getBackend();
        if (backend) return backend.deleteReminder(id);
        return this.request('deleteReminder', { id });
    },

    // ===== ACTIVITIES (Timeline) =====
    async getActivities(contactId, limit = 50) {
        const backend = this.getBackend();
        if (backend) return backend.getActivities(contactId, limit);
        return this.request('getActivities', { contact_id: contactId, limit }, 'GET');
    }
};
