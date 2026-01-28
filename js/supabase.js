// =====================================================
// CRM PRO - SUPABASE API CLIENT
// Direct REST API calls to Supabase PostgreSQL
// =====================================================

const SupabaseAPI = {

    /**
     * Make authenticated request to Supabase REST API
     */
    async request(endpoint, options = {}) {
        const config = AppConfig.getSupabaseConfig();

        if (!config.url || !config.anonKey) {
            throw new Error('Supabase chưa được cấu hình. Vui lòng vào Cài đặt.');
        }

        const url = `${config.url}/rest/v1/${endpoint}`;

        const headers = {
            'apikey': config.anonKey,
            'Authorization': `Bearer ${config.anonKey}`,
            'Content-Type': 'application/json',
            'Prefer': options.prefer || 'return=representation'
        };

        try {
            const response = await fetch(url, {
                method: options.method || 'GET',
                headers,
                body: options.body ? JSON.stringify(options.body) : undefined
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || `HTTP ${response.status}`);
            }

            // Handle empty responses (DELETE)
            const text = await response.text();
            return text ? JSON.parse(text) : null;

        } catch (error) {
            console.error('[Supabase] Error:', error);
            throw error;
        }
    },

    /**
     * Call Supabase RPC function
     */
    async rpc(functionName, params = {}) {
        const config = AppConfig.getSupabaseConfig();
        const url = `${config.url}/rest/v1/rpc/${functionName}`;

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'apikey': config.anonKey,
                'Authorization': `Bearer ${config.anonKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(params)
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || `RPC Error`);
        }

        return response.json();
    },

    // ===== CONFIG =====
    async getConfig() {
        // Return static config for Supabase
        return {
            success: true,
            data: {
                contactStatuses: [
                    { id: 'lead', name: 'Lead', color: '#6366f1' },
                    { id: 'prospect', name: 'Tiềm năng', color: '#8b5cf6' },
                    { id: 'customer', name: 'Khách hàng', color: '#10b981' },
                    { id: 'inactive', name: 'Không hoạt động', color: '#6b7280' }
                ],
                dealStages: [
                    { id: 'new', name: 'Mới', color: '#6366f1' },
                    { id: 'qualified', name: 'Đủ điều kiện', color: '#8b5cf6' },
                    { id: 'proposal', name: 'Đề xuất', color: '#ec4899' },
                    { id: 'negotiation', name: 'Đàm phán', color: '#f59e0b' },
                    { id: 'won', name: 'Thành công', color: '#10b981' },
                    { id: 'lost', name: 'Thất bại', color: '#ef4444' }
                ],
                taskPriorities: [
                    { id: 'low', name: 'Thấp', color: '#6b7280' },
                    { id: 'medium', name: 'Trung bình', color: '#f59e0b' },
                    { id: 'high', name: 'Cao', color: '#ef4444' }
                ]
            }
        };
    },

    async testConnection() {
        try {
            await this.request('contacts?select=id&limit=1');
            return { success: true, message: 'Kết nối Supabase thành công!' };
        } catch (error) {
            return { success: false, error: error.message };
        }
    },

    // ===== DASHBOARD =====
    async getDashboardStats() {
        const [contacts, companies, deals, tasks] = await Promise.all([
            this.request('contacts?select=id'),
            this.request('companies?select=id'),
            this.request('deals?select=id,value,stage'),
            this.request('tasks?select=id,status,due_date')
        ]);

        const activeDeals = deals.filter(d => !['won', 'lost'].includes(d.stage));
        const pipelineValue = activeDeals.reduce((sum, d) => sum + (parseFloat(d.value) || 0), 0);
        const pendingTasks = tasks.filter(t => t.status === 'pending');
        const overdueTasks = pendingTasks.filter(t => t.due_date && new Date(t.due_date) < new Date());

        return {
            success: true,
            data: {
                totalContacts: contacts.length,
                totalCompanies: companies.length,
                activeDeals: activeDeals.length,
                pipelineValue,
                pendingTasks: pendingTasks.length,
                overdueTasks: overdueTasks.length
            }
        };
    },

    async getRecentActivities(limit = 20) {
        const activities = await this.request(`activities?select=*&order=created_at.desc&limit=${limit}`);
        return { success: true, data: activities };
    },

    // ===== CONTACTS =====
    async getContacts(params = {}) {
        let query = 'contacts?select=*,company:companies(id,name)';

        // Add filters
        const filters = [];
        if (params.status) filters.push(`status=eq.${params.status}`);
        if (params.search) filters.push(`or=(first_name.ilike.*${params.search}*,last_name.ilike.*${params.search}*,email.ilike.*${params.search}*)`);

        if (filters.length) query += '&' + filters.join('&');

        // Pagination
        const page = params.page || 1;
        const limit = params.limit || 20;
        const offset = (page - 1) * limit;
        query += `&order=created_at.desc&limit=${limit}&offset=${offset}`;

        const contacts = await this.request(query);
        const total = await this.request('contacts?select=id', { prefer: 'count=exact' });

        return {
            success: true,
            data: contacts,
            pagination: {
                page,
                limit,
                total: total.length,
                totalPages: Math.ceil(total.length / limit)
            }
        };
    },

    async getContact(id) {
        const contacts = await this.request(`contacts?id=eq.${id}&select=*,company:companies(id,name)`);
        return { success: true, data: contacts[0] || null };
    },

    async createContact(data) {
        const contact = await this.request('contacts', {
            method: 'POST',
            body: data
        });

        // Log activity
        await this.logActivity('contact_created', `Tạo liên hệ: ${data.first_name} ${data.last_name || ''}`, 'contact', contact[0]?.id);

        return { success: true, data: contact[0] };
    },

    async updateContact(id, data) {
        const { id: _, ...updateData } = data;
        const contact = await this.request(`contacts?id=eq.${id}`, {
            method: 'PATCH',
            body: updateData
        });
        return { success: true, data: contact[0] };
    },

    async deleteContact(id) {
        await this.request(`contacts?id=eq.${id}`, { method: 'DELETE' });
        return { success: true };
    },

    async searchContacts(q, limit = 10) {
        const contacts = await this.request(
            `contacts?select=id,first_name,last_name,email&or=(first_name.ilike.*${q}*,last_name.ilike.*${q}*,email.ilike.*${q}*)&limit=${limit}`
        );
        return { success: true, data: contacts };
    },

    // ===== COMPANIES =====
    async getCompanies(params = {}) {
        let query = 'companies?select=*';

        const page = params.page || 1;
        const limit = params.limit || 20;
        const offset = (page - 1) * limit;
        query += `&order=created_at.desc&limit=${limit}&offset=${offset}`;

        const companies = await this.request(query);
        const total = await this.request('companies?select=id');

        return {
            success: true,
            data: companies,
            pagination: {
                page,
                limit,
                total: total.length,
                totalPages: Math.ceil(total.length / limit)
            }
        };
    },

    async getCompany(id) {
        const companies = await this.request(`companies?id=eq.${id}`);
        return { success: true, data: companies[0] || null };
    },

    async createCompany(data) {
        const company = await this.request('companies', {
            method: 'POST',
            body: data
        });
        await this.logActivity('company_created', `Tạo công ty: ${data.name}`, 'company', company[0]?.id);
        return { success: true, data: company[0] };
    },

    async updateCompany(id, data) {
        const { id: _, ...updateData } = data;
        const company = await this.request(`companies?id=eq.${id}`, {
            method: 'PATCH',
            body: updateData
        });
        return { success: true, data: company[0] };
    },

    async deleteCompany(id) {
        await this.request(`companies?id=eq.${id}`, { method: 'DELETE' });
        return { success: true };
    },

    // ===== DEALS =====
    async getDeals(params = {}) {
        let query = 'deals?select=*,contact:contacts(id,first_name,last_name),company:companies(id,name)';

        if (params.stage) query += `&stage=eq.${params.stage}`;

        const page = params.page || 1;
        const limit = params.limit || 50;
        const offset = (page - 1) * limit;
        query += `&order=created_at.desc&limit=${limit}&offset=${offset}`;

        const deals = await this.request(query);
        return { success: true, data: deals };
    },

    async getDeal(id) {
        const deals = await this.request(`deals?id=eq.${id}&select=*,contact:contacts(id,first_name,last_name),company:companies(id,name)`);
        return { success: true, data: deals[0] || null };
    },

    async createDeal(data) {
        const deal = await this.request('deals', {
            method: 'POST',
            body: data
        });
        await this.logActivity('deal_created', `Tạo deal: ${data.title}`, 'deal', deal[0]?.id);
        return { success: true, data: deal[0] };
    },

    async updateDeal(id, data) {
        const { id: _, ...updateData } = data;
        const deal = await this.request(`deals?id=eq.${id}`, {
            method: 'PATCH',
            body: updateData
        });
        return { success: true, data: deal[0] };
    },

    async updateDealStage(id, stage) {
        return this.updateDeal(id, { stage });
    },

    async deleteDeal(id) {
        await this.request(`deals?id=eq.${id}`, { method: 'DELETE' });
        return { success: true };
    },

    async getDealsPipeline() {
        const deals = await this.request('deals?select=*,contact:contacts(id,first_name,last_name),company:companies(id,name)');

        const stages = {
            new: { name: 'Mới', color: '#6366f1', count: 0, totalValue: 0, deals: [] },
            qualified: { name: 'Đủ điều kiện', color: '#8b5cf6', count: 0, totalValue: 0, deals: [] },
            proposal: { name: 'Đề xuất', color: '#ec4899', count: 0, totalValue: 0, deals: [] },
            negotiation: { name: 'Đàm phán', color: '#f59e0b', count: 0, totalValue: 0, deals: [] },
            won: { name: 'Thành công', color: '#10b981', count: 0, totalValue: 0, deals: [] },
            lost: { name: 'Thất bại', color: '#ef4444', count: 0, totalValue: 0, deals: [] }
        };

        deals.forEach(deal => {
            const stage = stages[deal.stage] || stages.new;
            stage.deals.push(deal);
            stage.count++;
            stage.totalValue += parseFloat(deal.value) || 0;
        });

        const summary = {
            totalDeals: deals.length,
            totalValue: deals.reduce((sum, d) => sum + (parseFloat(d.value) || 0), 0)
        };

        return { success: true, data: stages, summary };
    },

    // ===== TASKS =====
    async getTasks(params = {}) {
        let query = 'tasks?select=*,contact:contacts(id,first_name,last_name),deal:deals(id,title)';

        if (params.status) query += `&status=eq.${params.status}`;

        const page = params.page || 1;
        const limit = params.limit || 50;
        query += `&order=due_date.asc.nullslast,created_at.desc&limit=${limit}`;

        const tasks = await this.request(query);
        return { success: true, data: tasks };
    },

    async getTask(id) {
        const tasks = await this.request(`tasks?id=eq.${id}&select=*,contact:contacts(id,first_name,last_name),deal:deals(id,title)`);
        return { success: true, data: tasks[0] || null };
    },

    async createTask(data) {
        const task = await this.request('tasks', {
            method: 'POST',
            body: data
        });
        await this.logActivity('task_created', `Tạo công việc: ${data.title}`, 'task', task[0]?.id);
        return { success: true, data: task[0] };
    },

    async updateTask(id, data) {
        const { id: _, ...updateData } = data;
        const task = await this.request(`tasks?id=eq.${id}`, {
            method: 'PATCH',
            body: updateData
        });
        return { success: true, data: task[0] };
    },

    async completeTask(id) {
        return this.updateTask(id, { status: 'completed' });
    },

    async deleteTask(id) {
        await this.request(`tasks?id=eq.${id}`, { method: 'DELETE' });
        return { success: true };
    },

    async getOverdueTasks() {
        const today = new Date().toISOString().split('T')[0];
        const tasks = await this.request(`tasks?status=eq.pending&due_date=lt.${today}&select=*`);
        return { success: true, data: tasks };
    },

    async getTodayTasks() {
        const today = new Date().toISOString().split('T')[0];
        const tasks = await this.request(`tasks?status=eq.pending&due_date=eq.${today}&select=*`);
        return { success: true, data: tasks };
    },

    // ===== NOTES =====
    async getNotes(params = {}) {
        let query = `notes?entity_type=eq.${params.entityType}&entity_id=eq.${params.entityId}&order=created_at.desc`;
        const notes = await this.request(query);
        return { success: true, data: notes };
    },

    async createNote(data) {
        const note = await this.request('notes', {
            method: 'POST',
            body: data
        });
        return { success: true, data: note[0] };
    },

    async deleteNote(id) {
        await this.request(`notes?id=eq.${id}`, { method: 'DELETE' });
        return { success: true };
    },

    // ===== ACTIVITY LOG =====
    async logActivity(type, description, entityType = null, entityId = null) {
        try {
            await this.request('activities', {
                method: 'POST',
                body: { type, description, entity_type: entityType, entity_id: entityId }
            });
        } catch (e) {
            console.warn('[Supabase] Activity log failed:', e);
        }
    },

    // ===== APPOINTMENTS (Lịch hẹn) =====
    async getAppointments(contactId) {
        const appointments = await this.request(
            `appointments?contact_id=eq.${contactId}&order=start_time.asc`
        );
        return appointments || [];
    },

    async createAppointment(data) {
        const appointment = await this.request('appointments', {
            method: 'POST',
            body: data
        });
        // Log activity
        await this.logActivity('appointment', `Đặt lịch hẹn: ${data.title}`, 'contact', data.contact_id);
        return { success: true, data: appointment[0] };
    },

    async updateAppointment(id, data) {
        const appointment = await this.request(`appointments?id=eq.${id}`, {
            method: 'PATCH',
            body: data
        });
        return { success: true, data: appointment[0] };
    },

    async deleteAppointment(id) {
        await this.request(`appointments?id=eq.${id}`, { method: 'DELETE' });
        return { success: true };
    },

    // ===== REMINDERS (Nhắc nhở) =====
    async getReminders(contactId) {
        const reminders = await this.request(
            `reminders?contact_id=eq.${contactId}&order=remind_at.asc`
        );
        return reminders || [];
    },

    async createReminder(data) {
        const reminder = await this.request('reminders', {
            method: 'POST',
            body: data
        });
        await this.logActivity('reminder', `Thêm nhắc nhở: ${data.title}`, 'contact', data.contact_id);
        return { success: true, data: reminder[0] };
    },

    async updateReminder(id, data) {
        const reminder = await this.request(`reminders?id=eq.${id}`, {
            method: 'PATCH',
            body: data
        });
        return { success: true, data: reminder[0] };
    },

    async deleteReminder(id) {
        await this.request(`reminders?id=eq.${id}`, { method: 'DELETE' });
        return { success: true };
    },

    // ===== CONTACT ACTIVITIES (Timeline) =====
    async getActivities(contactId, limit = 50) {
        // Get activities related to this contact
        const activities = await this.request(
            `activities?entity_type=eq.contact&entity_id=eq.${contactId}&order=created_at.desc&limit=${limit}`
        );
        return activities || [];
    },

    // ===== UPCOMING APPOINTMENTS (Dashboard) =====
    async getUpcomingAppointments(limit = 5) {
        const now = new Date().toISOString();
        const appointments = await this.request(
            `appointments?start_time=gte.${now}&status=eq.scheduled&order=start_time.asc&limit=${limit}&select=*,contact:contacts(id,first_name,last_name)`
        );
        return { success: true, data: appointments || [] };
    },

    // ===== PENDING REMINDERS =====
    async getPendingReminders(limit = 10) {
        const now = new Date().toISOString();
        const reminders = await this.request(
            `reminders?remind_at=lte.${now}&is_done=eq.false&order=remind_at.asc&limit=${limit}&select=*,contact:contacts(id,first_name,last_name)`
        );
        return { success: true, data: reminders || [] };
    },

    // ===== N8N INTEGRATION RPC FUNCTIONS =====

    // Lấy danh sách khách cần gọi hôm nay (dùng RPC)
    async getDueReminders() {
        try {
            const data = await this.rpc('get_due_reminders');
            return { success: true, data: data || [] };
        } catch (error) {
            console.error('[Supabase] getDueReminders error:', error);
            return { success: false, error: error.message, data: [] };
        }
    },

    // Lấy khách sắp cần SP trong N ngày tới
    async getUpcomingNeeds(daysAhead = 7) {
        try {
            const data = await this.rpc('get_upcoming_needs', { days_ahead: daysAhead });
            return { success: true, data: data || [] };
        } catch (error) {
            console.error('[Supabase] getUpcomingNeeds error:', error);
            return { success: false, error: error.message, data: [] };
        }
    },

    // Đếm số khách cần gọi hôm nay
    async countDueReminders() {
        try {
            const data = await this.rpc('count_due_reminders');
            return { success: true, count: data || 0 };
        } catch (error) {
            console.error('[Supabase] countDueReminders error:', error);
            return { success: false, count: 0 };
        }
    },

    // Đếm khách sắp cần SP
    async countUpcomingNeeds(daysAhead = 7) {
        try {
            const data = await this.rpc('count_upcoming_needs', { days_ahead: daysAhead });
            return { success: true, count: data || 0 };
        } catch (error) {
            console.error('[Supabase] countUpcomingNeeds error:', error);
            return { success: false, count: 0 };
        }
    },

    // Đánh dấu đã liên hệ
    async markContacted(contactId, nextReminderDate = null) {
        try {
            await this.rpc('mark_contacted', {
                contact_id: contactId,
                next_reminder: nextReminderDate
            });
            return { success: true };
        } catch (error) {
            console.error('[Supabase] markContacted error:', error);
            return { success: false, error: error.message };
        }
    }
};

// Make globally available
window.SupabaseAPI = SupabaseAPI;
