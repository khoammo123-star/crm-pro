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
                '⚠️',
                'Không thể tải dữ liệu',
                error.message,
                'Thử lại',
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
            <strong>${overdueTasks.length}</strong> quá hạn • 
            <strong>${todayTasks.length}</strong> hôm nay • 
            <strong>${upcomingTasks.length}</strong> sắp tới
          </span>
        </div>
        
        <button class="btn btn-primary" onclick="TasksPage.openCreateModal()">
          <i class="lucide-plus"></i> Thêm công việc
        </button>
      </div>
      
      <!-- Task Sections -->
      <div class="task-sections">
        ${overdueTasks.length > 0 ? `
          <div class="task-section">
            <div class="task-section-header">
              <h4 class="task-section-title overdue">
                <span>⚠️</span> Quá hạn (${overdueTasks.length})
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
              <span>📅</span> Hôm nay (${todayTasks.length})
            </h4>
          </div>
          <div class="task-list">
            ${todayTasks.length > 0
                ? todayTasks.map(t => this.renderTaskItem(t)).join('')
                : '<p class="text-center text-secondary p-4">Không có công việc hôm nay 🎉</p>'
            }
          </div>
        </div>
        
        <div class="task-section">
          <div class="task-section-header">
            <h4 class="task-section-title">
              <span>📋</span> Sắp tới (${upcomingTasks.length})
            </h4>
          </div>
          <div class="task-list">
            ${upcomingTasks.length > 0
                ? upcomingTasks.map(t => this.renderTaskItem(t)).join('')
                : '<p class="text-center text-secondary p-4">Chưa có công việc nào</p>'
            }
          </div>
        </div>
      </div>
    `;
    },

    renderTaskItem(task, isOverdue = false) {
        const typeInfo = task.typeInfo || { icon: '✅', name: task.type };
        const priorityClass = task.priority || 'medium';
        const priorityLabels = { low: 'Thấp', medium: 'TB', high: 'Cao', urgent: 'Khẩn' };

        return `
      <div class="task-item ${task.status === 'completed' ? 'completed' : ''}">
        <div class="task-checkbox ${task.status === 'completed' ? 'checked' : ''}" 
             onclick="TasksPage.toggleComplete('${task.id}', ${task.status !== 'completed'})">
          ${task.status === 'completed' ? '✓' : ''}
        </div>
        
        <div class="task-content" onclick="TasksPage.viewTask('${task.id}')">
          <div class="task-title">${task.title}</div>
          <div class="task-meta">
            <span class="task-type">${typeInfo.icon} ${typeInfo.name}</span>
            <span class="task-priority ${priorityClass}">${priorityLabels[priorityClass]}</span>
            ${task.due_date ? `
              <span class="task-due ${isOverdue ? 'overdue' : ''}">
                📅 ${Utils.formatDate(task.due_date)}
                ${task.daysOverdue ? `(${task.daysOverdue} ngày)` : ''}
              </span>
            ` : ''}
            ${task.contact ? `<span>👤 ${Utils.getFullName(task.contact.first_name, task.contact.last_name)}</span>` : ''}
          </div>
        </div>
        
        <div class="table-actions">
          <button class="btn-icon" onclick="TasksPage.openEditModal('${task.id}')" title="Sửa">
            <i class="lucide-edit"></i>
          </button>
          <button class="btn-icon" onclick="TasksPage.deleteTask('${task.id}')" title="Xóa">
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
                Components.toast('Đã hoàn thành công việc!', 'success');
            } else {
                await API.updateTask(id, { status: 'pending' });
                Components.toast('Đã đánh dấu chưa hoàn thành', 'info');
            }
            this.loadTasks();
        } catch (error) {
            Components.toast(error.message, 'error');
        }
    },

    openCreateModal() {
        const content = this.renderTaskForm();

        Components.openModal('Thêm công việc mới', content, {
            confirmText: 'Tạo công việc',
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

            Components.openModal('Sửa công việc', content, {
                confirmText: 'Lưu thay đổi',
                onConfirm: () => this.updateTask(id)
            });

        } catch (error) {
            Components.hideLoading();
            Components.toast(error.message, 'error');
        }
    },

    renderTaskForm(task = {}) {
        const types = AppData.taskTypes || [
            { id: 'call', name: 'Gọi điện' },
            { id: 'email', name: 'Email' },
            { id: 'meeting', name: 'Họp' },
            { id: 'task', name: 'Công việc' },
            { id: 'deadline', name: 'Deadline' }
        ];

        const priorities = AppData.taskPriorities || [
            { id: 'low', name: 'Thấp' },
            { id: 'medium', name: 'Trung bình' },
            { id: 'high', name: 'Cao' },
            { id: 'urgent', name: 'Khẩn cấp' }
        ];

        return `
      <form id="taskForm">
        ${Components.formField('title', 'Tiêu đề', 'text', { value: task.title, required: true, placeholder: 'Mô tả công việc' })}
        
        <div class="form-row">
          ${Components.formField('type', 'Loại', 'select', {
            value: task.type || 'task',
            options: types.map(t => ({ value: t.id, label: t.name }))
        })}
          ${Components.formField('priority', 'Độ ưu tiên', 'select', {
            value: task.priority || 'medium',
            options: priorities.map(p => ({ value: p.id, label: p.name }))
        })}
        </div>
        
        ${Components.formField('due_date', 'Hạn hoàn thành', 'datetime-local', {
            value: task.due_date ? task.due_date.slice(0, 16) : ''
        })}
        
        ${Components.formField('description', 'Mô tả chi tiết', 'textarea', { value: task.description })}
      </form>
    `;
    },

    async createTask() {
        const form = document.getElementById('taskForm');

        if (!Components.validateForm(form)) {
            Components.toast('Vui lòng điền đầy đủ thông tin bắt buộc', 'error');
            return;
        }

        const data = Components.getFormData(form);

        Components.showLoading('Đang tạo...');

        try {
            await API.createTask(data);
            Components.hideLoading();
            Components.closeModal();
            Components.toast('Tạo công việc thành công!', 'success');
            this.loadTasks();
        } catch (error) {
            Components.hideLoading();
            Components.toast(error.message, 'error');
        }
    },

    async updateTask(id) {
        const form = document.getElementById('taskForm');

        if (!Components.validateForm(form)) {
            Components.toast('Vui lòng điền đầy đủ thông tin bắt buộc', 'error');
            return;
        }

        const data = Components.getFormData(form);

        Components.showLoading('Đang lưu...');

        try {
            await API.updateTask(id, data);
            Components.hideLoading();
            Components.closeModal();
            Components.toast('Cập nhật thành công!', 'success');
            this.loadTasks();
        } catch (error) {
            Components.hideLoading();
            Components.toast(error.message, 'error');
        }
    },

    async deleteTask(id) {
        const confirmed = await Components.confirm(
            'Bạn có chắc muốn xóa công việc này?',
            { title: 'Xác nhận xóa', danger: true, confirmText: 'Xóa' }
        );

        if (!confirmed) return;

        Components.showLoading('Đang xóa...');

        try {
            await API.deleteTask(id);
            Components.hideLoading();
            Components.toast('Đã xóa công việc', 'success');
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

            const typeInfo = task.typeInfo || { icon: '✅', name: task.type };
            const priorityLabels = { low: 'Thấp', medium: 'Trung bình', high: 'Cao', urgent: 'Khẩn cấp' };

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
            <span class="detail-label">Hạn hoàn thành</span>
            <span class="detail-value ${task.isOverdue ? 'text-danger' : ''}">${task.due_date ? Utils.formatDateTime(task.due_date) : '-'}</span>
          </div>
          <div class="detail-field">
            <span class="detail-label">Ngày tạo</span>
            <span class="detail-value">${Utils.formatDateTime(task.created_at)}</span>
          </div>
          ${task.completed_at ? `
            <div class="detail-field">
              <span class="detail-label">Hoàn thành lúc</span>
              <span class="detail-value">${Utils.formatDateTime(task.completed_at)}</span>
            </div>
          ` : ''}
          ${task.contact ? `
            <div class="detail-field">
              <span class="detail-label">Liên hệ</span>
              <span class="detail-value">${Utils.getFullName(task.contact.first_name, task.contact.last_name)}</span>
            </div>
          ` : ''}
        </div>
        
        ${task.description ? `
          <div class="detail-section mt-4">
            <h4 class="detail-section-title">📝 Mô tả</h4>
            <p>${task.description}</p>
          </div>
        ` : ''}
        
        <div style="display: flex; gap: 12px; margin-top: 24px; padding-top: 16px; border-top: 1px solid var(--border-color-light);">
          ${task.status !== 'completed' ? `
            <button class="btn btn-success" onclick="TasksPage.toggleComplete('${id}', true); Components.closeModal();">
              <i class="lucide-check"></i> Hoàn thành
            </button>
          ` : ''}
          <button class="btn btn-secondary" onclick="TasksPage.openEditModal('${id}'); Components.closeModal();">
            <i class="lucide-edit"></i> Sửa
          </button>
          <button class="btn btn-danger" onclick="TasksPage.deleteTask('${id}'); Components.closeModal();">
            <i class="lucide-trash-2"></i> Xóa
          </button>
        </div>
      `;

            Components.openModal('Chi tiết công việc', content, {
                hideFooter: true
            });

        } catch (error) {
            Components.hideLoading();
            Components.toast(error.message, 'error');
        }
    }
};
