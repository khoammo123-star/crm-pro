// =====================================================
// CRM BACKEND - DASHBOARD API
// =====================================================
// File: DashboardAPI.gs
// Thống kê và báo cáo tổng quan
// =====================================================

const DashboardAPI = {
  
  /**
   * Lấy thống kê tổng quan cho dashboard
   */
  getStats() {
    try {
      // Kiểm tra cache trước (cache 2 phút)
      const cached = Utils.getCache('dashboard_stats');
      if (cached) {
        return { success: true, data: cached, cached: true };
      }
      
      const contacts = Utils.getSheetData(CONFIG.SHEETS.CONTACTS);
      const companies = Utils.getSheetData(CONFIG.SHEETS.COMPANIES);
      const deals = Utils.getSheetData(CONFIG.SHEETS.DEALS);
      const tasks = Utils.getSheetData(CONFIG.SHEETS.TASKS);
      
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const startOfYear = new Date(now.getFullYear(), 0, 1);
      
      // ===== CONTACT STATS =====
      const contactStats = {
        total: contacts.length,
        byStatus: {
          lead: contacts.filter(c => c.status === 'lead').length,
          prospect: contacts.filter(c => c.status === 'prospect').length,
          customer: contacts.filter(c => c.status === 'customer').length,
          inactive: contacts.filter(c => c.status === 'inactive').length
        },
        newThisMonth: contacts.filter(c => new Date(c.created_at) >= startOfMonth).length,
        newThisYear: contacts.filter(c => new Date(c.created_at) >= startOfYear).length
      };
      
      // ===== COMPANY STATS =====
      const companyStats = {
        total: companies.length,
        active: companies.filter(c => c.status === 'active').length,
        newThisMonth: companies.filter(c => new Date(c.created_at) >= startOfMonth).length
      };
      
      // ===== DEAL STATS =====
      const activeDeals = deals.filter(d => !['won', 'lost'].includes(d.stage));
      const wonDeals = deals.filter(d => d.stage === 'won');
      const lostDeals = deals.filter(d => d.stage === 'lost');
      const wonThisMonth = wonDeals.filter(d => new Date(d.actual_close) >= startOfMonth);
      const wonThisYear = wonDeals.filter(d => new Date(d.actual_close) >= startOfYear);
      
      const dealStats = {
        total: deals.length,
        active: activeDeals.length,
        won: wonDeals.length,
        lost: lostDeals.length,
        totalValue: activeDeals.reduce((sum, d) => sum + (parseFloat(d.value) || 0), 0),
        wonValue: wonDeals.reduce((sum, d) => sum + (parseFloat(d.value) || 0), 0),
        wonValueThisMonth: wonThisMonth.reduce((sum, d) => sum + (parseFloat(d.value) || 0), 0),
        wonValueThisYear: wonThisYear.reduce((sum, d) => sum + (parseFloat(d.value) || 0), 0),
        winRate: (wonDeals.length + lostDeals.length) > 0 
          ? Math.round((wonDeals.length / (wonDeals.length + lostDeals.length)) * 100) 
          : 0,
        avgDealValue: wonDeals.length > 0
          ? Math.round(wonDeals.reduce((sum, d) => sum + (parseFloat(d.value) || 0), 0) / wonDeals.length)
          : 0
      };
      
      // ===== PIPELINE =====
      const pipeline = CONFIG.DEAL_STAGES.map(stage => ({
        id: stage.id,
        name: stage.name,
        color: stage.color,
        count: deals.filter(d => d.stage === stage.id).length,
        value: deals.filter(d => d.stage === stage.id)
          .reduce((sum, d) => sum + (parseFloat(d.value) || 0), 0)
      }));
      
      // ===== TASK STATS =====
      const pendingTasks = tasks.filter(t => t.status === 'pending' || t.status === 'in_progress');
      const today = now.toISOString().split('T')[0];
      const overdueTasks = pendingTasks.filter(t => {
        if (!t.due_date) return false;
        const dueDate = t.due_date.split('T')[0];
        return dueDate < today;
      });
      const todayTasks = pendingTasks.filter(t => {
        if (!t.due_date) return false;
        const dueDate = t.due_date.split('T')[0];
        return dueDate === today;
      });
      const upcomingTasks = pendingTasks.filter(t => {
        if (!t.due_date) return false;
        const dueDate = t.due_date.split('T')[0];
        return dueDate > today;
      });
      
      const taskStats = {
        total: tasks.length,
        pending: pendingTasks.length,
        overdue: overdueTasks.length,
        dueToday: todayTasks.length,
        upcoming: upcomingTasks.length,
        completed: tasks.filter(t => t.status === 'completed').length
      };
      
      // ===== MONTHLY REVENUE CHART (12 tháng gần nhất) =====
      const monthlyRevenue = [];
      for (let i = 11; i >= 0; i--) {
        const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
        
        const monthWon = wonDeals.filter(d => {
          const closeDate = new Date(d.actual_close);
          return closeDate >= monthStart && closeDate <= monthEnd;
        });
        
        monthlyRevenue.push({
          month: monthStart.toLocaleDateString('vi-VN', { month: 'short', year: '2-digit' }),
          value: monthWon.reduce((sum, d) => sum + (parseFloat(d.value) || 0), 0),
          count: monthWon.length
        });
      }
      
      // ===== TOP DEALS =====
      const topDeals = activeDeals
        .sort((a, b) => (parseFloat(b.value) || 0) - (parseFloat(a.value) || 0))
        .slice(0, 5)
        .map(d => ({
          id: d.id,
          title: d.title,
          value: parseFloat(d.value) || 0,
          stage: d.stage,
          stageInfo: CONFIG.DEAL_STAGES.find(s => s.id === d.stage),
          expected_close: d.expected_close
        }));
      
      // ===== RECENT CONTACTS =====
      const recentContacts = contacts
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, 5)
        .map(c => ({
          id: c.id,
          name: `${c.first_name} ${c.last_name}`.trim(),
          email: c.email,
          status: c.status,
          created_at: c.created_at
        }));
      
      const stats = {
          contacts: contactStats,
          companies: companyStats,
          deals: dealStats,
          tasks: taskStats,
          pipeline,
          monthlyRevenue,
          topDeals,
          recentContacts
        };
      
      // Lưu vào cache 2 phút
      Utils.setCache('dashboard_stats', stats, 120);
      
      return {
        success: true,
        data: stats
      };
      
    } catch (error) {
      return { success: false, error: error.message };
    }
  },
  
  /**
   * Lấy hoạt động gần đây
   */
  getRecentActivities(params = {}) {
    try {
      const limit = parseInt(params.limit) || 20;
      
      let activities = Utils.getSheetData(CONFIG.SHEETS.ACTIVITIES);
      
      // Sắp xếp mới nhất trước
      activities.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      
      // Lấy limit activities
      activities = activities.slice(0, limit);
      
      // Format relative time
      activities = activities.map(a => ({
        ...a,
        timeAgo: this.getTimeAgo(a.created_at)
      }));
      
      return {
        success: true,
        data: activities
      };
      
    } catch (error) {
      return { success: false, error: error.message };
    }
  },
  
  /**
   * Tính thời gian tương đối
   */
  getTimeAgo(dateString) {
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
    
    const weeks = Math.floor(days / 7);
    if (weeks < 4) return `${weeks} tuần trước`;
    
    const months = Math.floor(days / 30);
    if (months < 12) return `${months} tháng trước`;
    
    return Utils.formatDate(dateString);
  }
};
