// =====================================================
// CRM PRO - DRAWER COMPONENT (Side Panel)
// =====================================================

const Drawer = {
    isOpen: false,
    currentContact: null,

    /**
     * Open drawer with contact details
     */
    async open(contactId) {
        try {
            // Fetch contact data
            const contact = await API.getContact(contactId);
            this.currentContact = contact;
            this.isOpen = true;

            // Create drawer if not exists
            let drawer = document.getElementById('contactDrawer');
            if (!drawer) {
                drawer = document.createElement('div');
                drawer.id = 'contactDrawer';
                drawer.className = 'drawer';
                document.body.appendChild(drawer);

                // Create overlay
                const overlay = document.createElement('div');
                overlay.id = 'drawerOverlay';
                overlay.className = 'drawer-overlay';
                overlay.onclick = () => this.close();
                document.body.appendChild(overlay);
            }

            // Render drawer content
            drawer.innerHTML = this.renderContent(contact);

            // Show drawer with animation
            requestAnimationFrame(() => {
                drawer.classList.add('open');
                document.getElementById('drawerOverlay').classList.add('active');
            });

            // Load related data
            this.loadAppointments(contactId);
            this.loadReminders(contactId);
            this.loadTimeline(contactId);

            // Refresh Lucide icons
            if (typeof lucide !== 'undefined') {
                setTimeout(() => lucide.createIcons(), 50);
            }

        } catch (error) {
            console.error('Error opening drawer:', error);
            Utils.showToast('Không thể tải thông tin liên hệ', 'error');
        }
    },

    /**
     * Close drawer
     */
    close() {
        const drawer = document.getElementById('contactDrawer');
        const overlay = document.getElementById('drawerOverlay');

        if (drawer) {
            drawer.classList.remove('open');
        }
        if (overlay) {
            overlay.classList.remove('active');
        }

        this.isOpen = false;
        this.currentContact = null;
    },

    /**
     * Render drawer content
     */
    renderContent(contact) {
        const fullName = Utils.getFullName(contact.first_name, contact.last_name);
        const initials = Utils.getInitials(contact.first_name, contact.last_name);
        const avatarColor = Utils.getAvatarColor(fullName);

        return `
            <div class="drawer-header">
                <button class="drawer-close" onclick="Drawer.close()">
                    <i data-lucide="x"></i>
                </button>
                
                <div class="drawer-profile">
                    <div class="drawer-avatar" style="background: ${avatarColor}">
                        ${contact.avatar_url
                ? `<img src="${contact.avatar_url}" alt="${fullName}">`
                : initials}
                    </div>
                    <div class="drawer-profile-info">
                        <h2>${fullName}</h2>
                        <p>${contact.position || ''} ${contact.company_name ? `tại ${contact.company_name}` : ''}</p>
                    </div>
                </div>

                <div class="drawer-quick-actions">
                    ${contact.phone ? `
                        <a href="tel:${contact.phone}" class="quick-action-btn" title="Gọi điện">
                            <i data-lucide="phone"></i>
                        </a>
                    ` : ''}
                    ${contact.email ? `
                        <a href="mailto:${contact.email}" class="quick-action-btn" title="Gửi email">
                            <i data-lucide="mail"></i>
                        </a>
                    ` : ''}
                    <button class="quick-action-btn" onclick="Drawer.openAppointmentModal()" title="Đặt lịch hẹn">
                        <i data-lucide="calendar-plus"></i>
                    </button>
                    <button class="quick-action-btn" onclick="Drawer.openReminderModal()" title="Thêm nhắc nhở">
                        <i data-lucide="bell-plus"></i>
                    </button>
                </div>
            </div>

            <div class="drawer-tabs">
                <button class="drawer-tab active" data-tab="overview" onclick="Drawer.switchTab('overview')">
                    <i data-lucide="user"></i> Tổng quan
                </button>
                <button class="drawer-tab" data-tab="appointments" onclick="Drawer.switchTab('appointments')">
                    <i data-lucide="calendar"></i> Lịch hẹn
                </button>
                <button class="drawer-tab" data-tab="reminders" onclick="Drawer.switchTab('reminders')">
                    <i data-lucide="bell"></i> Nhắc nhở
                </button>
                <button class="drawer-tab" data-tab="timeline" onclick="Drawer.switchTab('timeline')">
                    <i data-lucide="clock"></i> Hoạt động
                </button>
            </div>

            <div class="drawer-body">
                <div class="drawer-tab-content active" id="tab-overview">
                    ${this.renderOverviewTab(contact)}
                </div>
                <div class="drawer-tab-content" id="tab-appointments">
                    <div class="loading-spinner"></div>
                </div>
                <div class="drawer-tab-content" id="tab-reminders">
                    <div class="loading-spinner"></div>
                </div>
                <div class="drawer-tab-content" id="tab-timeline">
                    <div class="loading-spinner"></div>
                </div>
            </div>

            <div class="drawer-footer">
                <button class="btn btn-secondary" onclick="ContactsPage.openEditModal('${contact.id}')">
                    <i data-lucide="edit"></i> Chỉnh sửa
                </button>
                <button class="btn btn-danger-outline" onclick="ContactsPage.confirmDelete('${contact.id}')">
                    <i data-lucide="trash-2"></i> Xóa
                </button>
            </div>
        `;
    },

    /**
     * Render overview tab
     */
    renderOverviewTab(contact) {
        const tags = contact.tags || [];

        return `
            <div class="info-section">
                <h4>Thông tin liên hệ</h4>
                <div class="info-grid">
                    <div class="info-item">
                        <i data-lucide="mail"></i>
                        <span>${contact.email || 'Chưa có email'}</span>
                    </div>
                    <div class="info-item">
                        <i data-lucide="phone"></i>
                        <span>${contact.phone || 'Chưa có SĐT'}</span>
                    </div>
                    <div class="info-item">
                        <i data-lucide="building-2"></i>
                        <span>${contact.company_name || 'Chưa có công ty'}</span>
                    </div>
                    <div class="info-item">
                        <i data-lucide="map-pin"></i>
                        <span>${contact.address || 'Chưa có địa chỉ'}</span>
                    </div>
                </div>
            </div>

            <div class="info-section">
                <h4>Trạng thái</h4>
                <span class="badge ${Utils.getStatusBadgeClass(contact.status)}">
                    ${Utils.getStatusLabel(contact.status, 'contact')}
                </span>
                ${contact.source ? `<span class="badge badge-gray">${contact.source}</span>` : ''}
            </div>

            <div class="info-section">
                <h4>Tags</h4>
                <div class="tags-container">
                    ${tags.length > 0
                ? tags.map(tag => `<span class="tag">${tag}</span>`).join('')
                : '<span class="text-muted">Chưa có tag</span>'}
                    <button class="btn-add-tag" onclick="Drawer.openTagModal()">+ Thêm tag</button>
                </div>
            </div>

            ${contact.notes ? `
                <div class="info-section">
                    <h4>Ghi chú</h4>
                    <p class="notes-text">${contact.notes}</p>
                </div>
            ` : ''}

            <div class="info-section">
                <h4>Thông tin khác</h4>
                <div class="info-grid">
                    <div class="info-item">
                        <i data-lucide="calendar"></i>
                        <span>Tạo: ${Utils.formatDate(contact.created_at)}</span>
                    </div>
                    ${contact.last_contacted ? `
                        <div class="info-item">
                            <i data-lucide="clock"></i>
                            <span>Liên hệ gần nhất: ${Utils.timeAgo(contact.last_contacted)}</span>
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
    },

    /**
     * Switch tabs
     */
    switchTab(tabName) {
        // Update tab buttons
        document.querySelectorAll('.drawer-tab').forEach(tab => {
            tab.classList.toggle('active', tab.dataset.tab === tabName);
        });

        // Update tab content
        document.querySelectorAll('.drawer-tab-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(`tab-${tabName}`).classList.add('active');

        // Refresh icons
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    },

    /**
     * Load appointments for contact
     */
    async loadAppointments(contactId) {
        try {
            const appointments = await API.getAppointments(contactId);
            const container = document.getElementById('tab-appointments');

            if (appointments.length === 0) {
                container.innerHTML = `
                    <div class="empty-tab">
                        <i data-lucide="calendar-x"></i>
                        <p>Chưa có lịch hẹn</p>
                        <button class="btn btn-primary btn-sm" onclick="Drawer.openAppointmentModal()">
                            <i data-lucide="plus"></i> Đặt lịch hẹn
                        </button>
                    </div>
                `;
            } else {
                container.innerHTML = `
                    <button class="btn btn-primary btn-sm mb-3" onclick="Drawer.openAppointmentModal()">
                        <i data-lucide="plus"></i> Thêm lịch hẹn
                    </button>
                    <div class="appointments-list">
                        ${appointments.map(apt => this.renderAppointmentItem(apt)).join('')}
                    </div>
                `;
            }

            if (typeof lucide !== 'undefined') lucide.createIcons();
        } catch (error) {
            console.error('Error loading appointments:', error);
        }
    },

    renderAppointmentItem(apt) {
        const startDate = new Date(apt.start_time);
        const statusClass = apt.status === 'completed' ? 'completed' : apt.status === 'cancelled' ? 'cancelled' : '';

        return `
            <div class="appointment-item ${statusClass}">
                <div class="apt-time">
                    <span class="apt-date">${startDate.toLocaleDateString('vi-VN')}</span>
                    <span class="apt-hour">${startDate.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <div class="apt-info">
                    <h5>${apt.title}</h5>
                    ${apt.location ? `<p><i data-lucide="map-pin"></i> ${apt.location}</p>` : ''}
                </div>
                <div class="apt-actions">
                    ${apt.status === 'scheduled' ? `
                        <button class="btn-icon-sm" onclick="Drawer.completeAppointment('${apt.id}')" title="Hoàn thành">
                            <i data-lucide="check"></i>
                        </button>
                    ` : ''}
                    <button class="btn-icon-sm" onclick="Drawer.deleteAppointment('${apt.id}')" title="Xóa">
                        <i data-lucide="trash-2"></i>
                    </button>
                </div>
            </div>
        `;
    },

    /**
     * Load reminders for contact
     */
    async loadReminders(contactId) {
        try {
            const reminders = await API.getReminders(contactId);
            const container = document.getElementById('tab-reminders');

            if (reminders.length === 0) {
                container.innerHTML = `
                    <div class="empty-tab">
                        <i data-lucide="bell-off"></i>
                        <p>Chưa có nhắc nhở</p>
                        <button class="btn btn-primary btn-sm" onclick="Drawer.openReminderModal()">
                            <i data-lucide="plus"></i> Thêm nhắc nhở
                        </button>
                    </div>
                `;
            } else {
                container.innerHTML = `
                    <button class="btn btn-primary btn-sm mb-3" onclick="Drawer.openReminderModal()">
                        <i data-lucide="plus"></i> Thêm nhắc nhở
                    </button>
                    <div class="reminders-list">
                        ${reminders.map(rem => this.renderReminderItem(rem)).join('')}
                    </div>
                `;
            }

            if (typeof lucide !== 'undefined') lucide.createIcons();
        } catch (error) {
            console.error('Error loading reminders:', error);
        }
    },

    renderReminderItem(rem) {
        const remindDate = new Date(rem.remind_at);
        const isPast = remindDate < new Date();

        return `
            <div class="reminder-item ${rem.is_done ? 'done' : ''} ${isPast && !rem.is_done ? 'overdue' : ''}">
                <input type="checkbox" ${rem.is_done ? 'checked' : ''} 
                    onchange="Drawer.toggleReminder('${rem.id}', this.checked)">
                <div class="reminder-info">
                    <h5>${rem.title}</h5>
                    <span class="reminder-time">
                        <i data-lucide="clock"></i> ${Utils.formatDateTime(rem.remind_at)}
                    </span>
                    ${rem.note ? `<p class="reminder-note">${rem.note}</p>` : ''}
                </div>
                <button class="btn-icon-sm" onclick="Drawer.deleteReminder('${rem.id}')" title="Xóa">
                    <i data-lucide="trash-2"></i>
                </button>
            </div>
        `;
    },

    /**
     * Load activity timeline
     */
    async loadTimeline(contactId) {
        try {
            const activities = await API.getActivities(contactId);
            const container = document.getElementById('tab-timeline');

            if (activities.length === 0) {
                container.innerHTML = `
                    <div class="empty-tab">
                        <i data-lucide="activity"></i>
                        <p>Chưa có hoạt động nào</p>
                    </div>
                `;
            } else {
                container.innerHTML = `
                    <div class="timeline">
                        ${activities.map(act => this.renderTimelineItem(act)).join('')}
                    </div>
                `;
            }

            if (typeof lucide !== 'undefined') lucide.createIcons();
        } catch (error) {
            console.error('Error loading timeline:', error);
        }
    },

    renderTimelineItem(activity) {
        const icons = {
            'note': 'sticky-note',
            'call': 'phone',
            'email': 'mail',
            'appointment': 'calendar',
            'deal': 'handshake',
            'task': 'check-square'
        };

        return `
            <div class="timeline-item">
                <div class="timeline-icon">
                    <i data-lucide="${icons[activity.type] || 'activity'}"></i>
                </div>
                <div class="timeline-content">
                    <p>${activity.description}</p>
                    <span class="timeline-time">${Utils.timeAgo(activity.created_at)}</span>
                </div>
            </div>
        `;
    },

    /**
     * Open appointment modal
     */
    openAppointmentModal() {
        if (!this.currentContact) return;

        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(9, 0, 0, 0);
        const defaultDateTime = tomorrow.toISOString().slice(0, 16);

        Components.openModal('Đặt lịch hẹn', `
            <form id="appointmentForm">
                <div class="form-group">
                    <label>Tiêu đề *</label>
                    <input type="text" class="form-control" name="title" placeholder="VD: Họp demo sản phẩm" required>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>Thời gian bắt đầu *</label>
                        <input type="datetime-local" class="form-control" name="start_time" value="${defaultDateTime}" required>
                    </div>
                    <div class="form-group">
                        <label>Thời gian kết thúc</label>
                        <input type="datetime-local" class="form-control" name="end_time">
                    </div>
                </div>
                <div class="form-group">
                    <label>Địa điểm</label>
                    <input type="text" class="form-control" name="location" placeholder="VD: Văn phòng công ty, Zoom...">
                </div>
                <div class="form-group">
                    <label>Mô tả</label>
                    <textarea class="form-control" name="description" rows="3" placeholder="Ghi chú thêm..."></textarea>
                </div>
            </form>
        `, async () => {
            const form = document.getElementById('appointmentForm');
            const formData = new FormData(form);

            await API.createAppointment({
                contact_id: this.currentContact.id,
                title: formData.get('title'),
                start_time: formData.get('start_time'),
                end_time: formData.get('end_time') || null,
                location: formData.get('location'),
                description: formData.get('description')
            });

            Utils.showToast('Đã tạo lịch hẹn', 'success');
            this.loadAppointments(this.currentContact.id);
            this.loadTimeline(this.currentContact.id);
        }, 'Tạo lịch hẹn');
    },

    /**
     * Open reminder modal
     */
    openReminderModal() {
        if (!this.currentContact) return;

        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(9, 0, 0, 0);
        const defaultDateTime = tomorrow.toISOString().slice(0, 16);

        Components.openModal('Thêm nhắc nhở', `
            <form id="reminderForm">
                <div class="form-group">
                    <label>Tiêu đề *</label>
                    <input type="text" class="form-control" name="title" placeholder="VD: Gọi lại cho khách" required>
                </div>
                <div class="form-group">
                    <label>Thời gian nhắc *</label>
                    <input type="datetime-local" class="form-control" name="remind_at" value="${defaultDateTime}" required>
                </div>
                <div class="form-group">
                    <label>Ghi chú</label>
                    <textarea class="form-control" name="note" rows="3" placeholder="Chi tiết nhắc nhở..."></textarea>
                </div>
            </form>
        `, async () => {
            const form = document.getElementById('reminderForm');
            const formData = new FormData(form);

            await API.createReminder({
                contact_id: this.currentContact.id,
                title: formData.get('title'),
                remind_at: formData.get('remind_at'),
                note: formData.get('note')
            });

            Utils.showToast('Đã tạo nhắc nhở', 'success');
            this.loadReminders(this.currentContact.id);
        }, 'Tạo nhắc nhở');
    },

    /**
     * Open tag modal
     */
    openTagModal() {
        if (!this.currentContact) return;
        const currentTags = (this.currentContact.tags || []).join(', ');

        Components.openModal('Quản lý Tags', `
            <form id="tagForm">
                <div class="form-group">
                    <label>Tags (phân cách bằng dấu phẩy)</label>
                    <input type="text" class="form-control" name="tags" value="${currentTags}" 
                        placeholder="VIP, Hot Lead, Partner...">
                </div>
                <div class="form-group">
                    <label>Tags gợi ý:</label>
                    <div class="suggested-tags">
                        <span class="tag-suggestion" onclick="Drawer.addSuggestedTag('VIP')">VIP</span>
                        <span class="tag-suggestion" onclick="Drawer.addSuggestedTag('Hot Lead')">Hot Lead</span>
                        <span class="tag-suggestion" onclick="Drawer.addSuggestedTag('Partner')">Partner</span>
                        <span class="tag-suggestion" onclick="Drawer.addSuggestedTag('Influencer')">Influencer</span>
                    </div>
                </div>
            </form>
        `, async () => {
            const form = document.getElementById('tagForm');
            const tagsStr = form.tags.value;
            const tags = tagsStr.split(',').map(t => t.trim()).filter(t => t);

            await API.updateContact(this.currentContact.id, { tags });

            this.currentContact.tags = tags;
            Utils.showToast('Đã cập nhật tags', 'success');

            // Refresh overview tab
            document.getElementById('tab-overview').innerHTML = this.renderOverviewTab(this.currentContact);
            if (typeof lucide !== 'undefined') lucide.createIcons();
        }, 'Lưu Tags');
    },

    addSuggestedTag(tag) {
        const input = document.querySelector('#tagForm input[name="tags"]');
        const current = input.value;
        if (current) {
            input.value = current + ', ' + tag;
        } else {
            input.value = tag;
        }
    },

    async completeAppointment(id) {
        await API.updateAppointment(id, { status: 'completed' });
        Utils.showToast('Đã hoàn thành lịch hẹn', 'success');
        this.loadAppointments(this.currentContact.id);
        this.loadTimeline(this.currentContact.id);
    },

    async deleteAppointment(id) {
        if (confirm('Xóa lịch hẹn này?')) {
            await API.deleteAppointment(id);
            Utils.showToast('Đã xóa lịch hẹn', 'success');
            this.loadAppointments(this.currentContact.id);
        }
    },

    async toggleReminder(id, isDone) {
        await API.updateReminder(id, { is_done: isDone });
        Utils.showToast(isDone ? 'Đã hoàn thành' : 'Đã bỏ hoàn thành', 'success');
    },

    async deleteReminder(id) {
        if (confirm('Xóa nhắc nhở này?')) {
            await API.deleteReminder(id);
            Utils.showToast('Đã xóa nhắc nhở', 'success');
            this.loadReminders(this.currentContact.id);
        }
    }
};
