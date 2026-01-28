-- =====================================================
-- CRM PRO - SUPABASE DATABASE SCHEMA
-- Run this in Supabase SQL Editor
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- COMPANIES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS companies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    industry TEXT,
    website TEXT,
    email TEXT,
    phone TEXT,
    address TEXT,
    size TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- CONTACTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS contacts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    first_name TEXT NOT NULL,
    last_name TEXT,
    email TEXT,
    phone TEXT,
    company_id UUID REFERENCES companies(id) ON DELETE SET NULL,
    status TEXT DEFAULT 'lead',
    source TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- DEALS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS deals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    value NUMERIC DEFAULT 0,
    stage TEXT DEFAULT 'new',
    contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
    company_id UUID REFERENCES companies(id) ON DELETE SET NULL,
    expected_close DATE,
    probability INTEGER DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- TASKS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    due_date DATE,
    priority TEXT DEFAULT 'medium',
    status TEXT DEFAULT 'pending',
    contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
    deal_id UUID REFERENCES deals(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- NOTES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS notes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    content TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id UUID NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- ACTIVITIES TABLE (for activity log)
-- =====================================================
CREATE TABLE IF NOT EXISTS activities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    type TEXT NOT NULL,
    description TEXT NOT NULL,
    entity_type TEXT,
    entity_id UUID,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_contacts_company ON contacts(company_id);
CREATE INDEX IF NOT EXISTS idx_contacts_status ON contacts(status);
CREATE INDEX IF NOT EXISTS idx_contacts_created ON contacts(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_deals_stage ON deals(stage);
CREATE INDEX IF NOT EXISTS idx_deals_contact ON deals(contact_id);
CREATE INDEX IF NOT EXISTS idx_deals_company ON deals(company_id);
CREATE INDEX IF NOT EXISTS idx_deals_created ON deals(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_tasks_contact ON tasks(contact_id);
CREATE INDEX IF NOT EXISTS idx_tasks_deal ON tasks(deal_id);

CREATE INDEX IF NOT EXISTS idx_notes_entity ON notes(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_activities_entity ON activities(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_activities_created ON activities(created_at DESC);

-- =====================================================
-- UPDATED_AT TRIGGER FUNCTION
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply trigger to all tables with updated_at
CREATE TRIGGER update_companies_updated_at BEFORE UPDATE ON companies
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_contacts_updated_at BEFORE UPDATE ON contacts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_deals_updated_at BEFORE UPDATE ON deals
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- ROW LEVEL SECURITY (Optional - for multi-tenant)
-- Uncomment if you want to enable RLS
-- =====================================================
-- ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE deals ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE activities ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- VIEWS FOR DASHBOARD
-- =====================================================
CREATE OR REPLACE VIEW dashboard_stats AS
SELECT
    (SELECT COUNT(*) FROM contacts) as total_contacts,
    (SELECT COUNT(*) FROM companies) as total_companies,
    (SELECT COUNT(*) FROM deals WHERE stage NOT IN ('won', 'lost')) as active_deals,
    (SELECT COALESCE(SUM(value), 0) FROM deals WHERE stage NOT IN ('won', 'lost')) as pipeline_value,
    (SELECT COUNT(*) FROM tasks WHERE status = 'pending') as pending_tasks,
    (SELECT COUNT(*) FROM tasks WHERE status = 'pending' AND due_date < CURRENT_DATE) as overdue_tasks;

-- =====================================================
-- FUNCTION: Get Deals Pipeline
-- =====================================================
CREATE OR REPLACE FUNCTION get_deals_pipeline()
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_build_object(
        'new', json_build_object(
            'name', 'Mới',
            'color', '#6366f1',
            'count', (SELECT COUNT(*) FROM deals WHERE stage = 'new'),
            'totalValue', (SELECT COALESCE(SUM(value), 0) FROM deals WHERE stage = 'new'),
            'deals', COALESCE((SELECT json_agg(d.*) FROM deals d WHERE d.stage = 'new'), '[]'::json)
        ),
        'qualified', json_build_object(
            'name', 'Đủ điều kiện',
            'color', '#8b5cf6',
            'count', (SELECT COUNT(*) FROM deals WHERE stage = 'qualified'),
            'totalValue', (SELECT COALESCE(SUM(value), 0) FROM deals WHERE stage = 'qualified'),
            'deals', COALESCE((SELECT json_agg(d.*) FROM deals d WHERE d.stage = 'qualified'), '[]'::json)
        ),
        'proposal', json_build_object(
            'name', 'Đề xuất',
            'color', '#ec4899',
            'count', (SELECT COUNT(*) FROM deals WHERE stage = 'proposal'),
            'totalValue', (SELECT COALESCE(SUM(value), 0) FROM deals WHERE stage = 'proposal'),
            'deals', COALESCE((SELECT json_agg(d.*) FROM deals d WHERE d.stage = 'proposal'), '[]'::json)
        ),
        'negotiation', json_build_object(
            'name', 'Đàm phán',
            'color', '#f59e0b',
            'count', (SELECT COUNT(*) FROM deals WHERE stage = 'negotiation'),
            'totalValue', (SELECT COALESCE(SUM(value), 0) FROM deals WHERE stage = 'negotiation'),
            'deals', COALESCE((SELECT json_agg(d.*) FROM deals d WHERE d.stage = 'negotiation'), '[]'::json)
        ),
        'won', json_build_object(
            'name', 'Thành công',
            'color', '#10b981',
            'count', (SELECT COUNT(*) FROM deals WHERE stage = 'won'),
            'totalValue', (SELECT COALESCE(SUM(value), 0) FROM deals WHERE stage = 'won'),
            'deals', COALESCE((SELECT json_agg(d.*) FROM deals d WHERE d.stage = 'won'), '[]'::json)
        ),
        'lost', json_build_object(
            'name', 'Thất bại',
            'color', '#ef4444',
            'count', (SELECT COUNT(*) FROM deals WHERE stage = 'lost'),
            'totalValue', (SELECT COALESCE(SUM(value), 0) FROM deals WHERE stage = 'lost'),
            'deals', COALESCE((SELECT json_agg(d.*) FROM deals d WHERE d.stage = 'lost'), '[]'::json)
        )
    ) INTO result;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- SUCCESS MESSAGE
-- =====================================================
SELECT 'CRM Pro database schema created successfully!' as status;
