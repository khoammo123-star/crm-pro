// =====================================================
// CRM PRO - CONFIGURATION (Supabase Only)
// =====================================================

const AppConfig = {
    // Version
    VERSION: '2.1.0',

    // Supabase config (fixed - no need to configure)
    SUPABASE_URL: 'https://nkjakqtffuowajsmioff.supabase.co',
    SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5ramFrcXRmZnVvd2Fqc21pb2ZmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk1ODU1MDQsImV4cCI6MjA4NTE2MTUwNH0.kJ4B9yzSYuJAUMF9VPbR2oxP4K0b7KhDy813joeFJQs',

    // Default settings
    DEFAULT_PAGE_SIZE: 20,

    // Local storage keys
    STORAGE_KEYS: {
        THEME: 'crm_theme',
        SIDEBAR_COLLAPSED: 'crm_sidebar_collapsed'
    },

    // Always using Supabase
    isSupabase() {
        return true;
    },

    // Get Supabase config
    getSupabaseConfig() {
        return {
            url: this.SUPABASE_URL,
            anonKey: this.SUPABASE_ANON_KEY
        };
    },

    // Always configured (Supabase is hardcoded)
    isConfigured() {
        return true;
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
