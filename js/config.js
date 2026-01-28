// =====================================================
// CRM PRO - CONFIGURATION
// =====================================================

const AppConfig = {
    // Version
    VERSION: '2.0.0',

    // Database type: 'sheets' or 'supabase'
    DATABASE_TYPE: localStorage.getItem('crm_database_type') || 'supabase',

    // Google Sheets API URL
    API_URL: localStorage.getItem('crm_api_url') || '',

    // Supabase config (hardcoded for easy deployment)
    SUPABASE_URL: localStorage.getItem('crm_supabase_url') || 'https://nkjakqtffuowajsmioff.supabase.co',
    SUPABASE_ANON_KEY: localStorage.getItem('crm_supabase_key') || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5ramFrcXRmZnVvd2Fqc21pb2ZmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk1ODU1MDQsImV4cCI6MjA4NTE2MTUwNH0.kJ4B9yzSYuJAUMF9VPbR2oxP4K0b7KhDy813joeFJQs',

    // Default settings
    DEFAULT_PAGE_SIZE: 20,

    // Local storage keys
    STORAGE_KEYS: {
        DATABASE_TYPE: 'crm_database_type',
        API_URL: 'crm_api_url',
        SUPABASE_URL: 'crm_supabase_url',
        SUPABASE_KEY: 'crm_supabase_key',
        THEME: 'crm_theme',
        SIDEBAR_COLLAPSED: 'crm_sidebar_collapsed'
    },

    // Get current database type
    getDatabaseType() {
        return localStorage.getItem(this.STORAGE_KEYS.DATABASE_TYPE) || 'sheets';
    },

    // Set database type
    setDatabaseType(type) {
        localStorage.setItem(this.STORAGE_KEYS.DATABASE_TYPE, type);
        this.DATABASE_TYPE = type;
    },

    // Check if using Supabase
    isSupabase() {
        return this.getDatabaseType() === 'supabase';
    },

    // Get Google Sheets API URL
    getApiUrl() {
        return localStorage.getItem(this.STORAGE_KEYS.API_URL) || this.API_URL;
    },

    // Set Google Sheets API URL
    setApiUrl(url) {
        localStorage.setItem(this.STORAGE_KEYS.API_URL, url);
        this.API_URL = url;
    },

    // Get Supabase config
    getSupabaseConfig() {
        return {
            url: localStorage.getItem(this.STORAGE_KEYS.SUPABASE_URL) || this.SUPABASE_URL,
            anonKey: localStorage.getItem(this.STORAGE_KEYS.SUPABASE_KEY) || this.SUPABASE_ANON_KEY
        };
    },

    // Set Supabase config
    setSupabaseConfig(url, anonKey) {
        localStorage.setItem(this.STORAGE_KEYS.SUPABASE_URL, url);
        localStorage.setItem(this.STORAGE_KEYS.SUPABASE_KEY, anonKey);
        this.SUPABASE_URL = url;
        this.SUPABASE_ANON_KEY = anonKey;
    },

    // Check if API is configured
    isConfigured() {
        if (this.isSupabase()) {
            const config = this.getSupabaseConfig();
            return !!(config.url && config.anonKey);
        }
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
