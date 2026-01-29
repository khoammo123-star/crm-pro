-- =====================================================
-- CRM PRO - Migration 002: CRM Redesign
-- Products, Sources, Simplified Contacts
-- =====================================================

-- ===== PRODUCTS TABLE =====
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    price DECIMAL(15,2),
    unit TEXT DEFAULT 'cái',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Policy cho products (public read, authenticated write)
CREATE POLICY "Products are viewable by everyone" ON products
    FOR SELECT USING (true);

CREATE POLICY "Products are insertable by everyone" ON products
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Products are updatable by everyone" ON products
    FOR UPDATE USING (true);

CREATE POLICY "Products are deletable by everyone" ON products
    FOR DELETE USING (true);

-- ===== LEAD SOURCES TABLE =====
CREATE TABLE IF NOT EXISTS lead_sources (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    icon TEXT,
    color TEXT,
    is_system BOOLEAN DEFAULT false,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE lead_sources ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Lead sources are viewable by everyone" ON lead_sources
    FOR SELECT USING (true);

CREATE POLICY "Lead sources are manageable by everyone" ON lead_sources
    FOR ALL USING (true);

-- Insert preset sources
INSERT INTO lead_sources (id, name, icon, color, is_system, sort_order) VALUES
    ('facebook', 'Facebook', '📘', '#1877F2', true, 1),
    ('youtube', 'YouTube', '📺', '#FF0000', true, 2),
    ('tiktok', 'TikTok', '🎵', '#000000', true, 3),
    ('instagram', 'Instagram', '📸', '#E4405F', true, 4),
    ('zalo', 'Zalo', '💬', '#0068FF', true, 5),
    ('website', 'Website', '🌐', '#4CAF50', true, 6),
    ('n8n', 'N8N Automation', '🤖', '#FF6D5A', true, 7),
    ('referral', 'Giới thiệu', '👥', '#9C27B0', true, 8),
    ('phone', 'Gọi điện', '📞', '#2196F3', true, 9),
    ('other', 'Khác', '📋', '#607D8B', true, 10)
ON CONFLICT (id) DO NOTHING;

-- ===== UPDATE CONTACTS TABLE =====

-- Thêm columns mới
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS product_needed TEXT;
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS province TEXT;
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS district TEXT;
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS google_map_url TEXT;

-- Comments
COMMENT ON COLUMN contacts.product_needed IS 'Sản phẩm khách cần';
COMMENT ON COLUMN contacts.province IS 'Tỉnh/Thành phố';
COMMENT ON COLUMN contacts.district IS 'Quận/Huyện';
COMMENT ON COLUMN contacts.google_map_url IS 'Link Google Maps địa chỉ';

-- Indexes
CREATE INDEX IF NOT EXISTS idx_contacts_province ON contacts(province);
CREATE INDEX IF NOT EXISTS idx_contacts_product ON contacts(product_needed);
CREATE INDEX IF NOT EXISTS idx_contacts_source ON contacts(source);

-- ===== RPC: GET CONTACTS BY ALERT LEVEL =====
CREATE OR REPLACE FUNCTION get_contacts_by_alert_level(p_level TEXT DEFAULT NULL)
RETURNS TABLE (
    id UUID,
    first_name TEXT,
    last_name TEXT,
    phone TEXT,
    zalo_phone TEXT,
    product_needed TEXT,
    expected_need_date DATE,
    province TEXT,
    district TEXT,
    google_map_url TEXT,
    source TEXT,
    status TEXT,
    notes TEXT,
    days_left INT,
    alert_level TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        c.id,
        c.first_name,
        c.last_name,
        c.phone,
        c.zalo_phone,
        c.product_needed,
        c.expected_need_date,
        c.province,
        c.district,
        c.google_map_url,
        c.source,
        c.status,
        c.notes,
        (c.expected_need_date - CURRENT_DATE)::INT as days_left,
        CASE 
            WHEN (c.expected_need_date - CURRENT_DATE) <= 5 THEN 'critical'
            WHEN (c.expected_need_date - CURRENT_DATE) <= 7 THEN 'urgent'
            WHEN (c.expected_need_date - CURRENT_DATE) <= 10 THEN 'warning'
            WHEN (c.expected_need_date - CURRENT_DATE) <= 15 THEN 'info'
            ELSE 'normal'
        END as alert_level
    FROM contacts c
    WHERE c.expected_need_date IS NOT NULL
    AND c.status != 'inactive'
    AND (
        p_level IS NULL 
        OR (p_level = 'critical' AND (c.expected_need_date - CURRENT_DATE) <= 5)
        OR (p_level = 'urgent' AND (c.expected_need_date - CURRENT_DATE) BETWEEN 6 AND 7)
        OR (p_level = 'warning' AND (c.expected_need_date - CURRENT_DATE) BETWEEN 8 AND 10)
        OR (p_level = 'info' AND (c.expected_need_date - CURRENT_DATE) BETWEEN 11 AND 15)
        OR (p_level = 'all_alerts' AND (c.expected_need_date - CURRENT_DATE) <= 15)
    )
    ORDER BY c.expected_need_date ASC;
END;
$$ LANGUAGE plpgsql;

-- ===== RPC: COUNT BY ALERT LEVEL =====
CREATE OR REPLACE FUNCTION count_contacts_by_alert()
RETURNS TABLE (
    critical_count INT,
    urgent_count INT,
    warning_count INT,
    info_count INT,
    total_alerts INT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*) FILTER (WHERE (expected_need_date - CURRENT_DATE) <= 5)::INT as critical_count,
        COUNT(*) FILTER (WHERE (expected_need_date - CURRENT_DATE) BETWEEN 6 AND 7)::INT as urgent_count,
        COUNT(*) FILTER (WHERE (expected_need_date - CURRENT_DATE) BETWEEN 8 AND 10)::INT as warning_count,
        COUNT(*) FILTER (WHERE (expected_need_date - CURRENT_DATE) BETWEEN 11 AND 15)::INT as info_count,
        COUNT(*) FILTER (WHERE (expected_need_date - CURRENT_DATE) <= 15)::INT as total_alerts
    FROM contacts
    WHERE expected_need_date IS NOT NULL
    AND status != 'inactive';
END;
$$ LANGUAGE plpgsql;

-- ===== Sample Products =====
INSERT INTO products (name, description, unit) VALUES
    ('Máy bơm nước', 'Máy bơm nước gia đình', 'cái'),
    ('Bồn inox 1000L', 'Bồn chứa nước inox 1000 lít', 'cái'),
    ('Bồn inox 500L', 'Bồn chứa nước inox 500 lít', 'cái'),
    ('Ống nước PVC', 'Ống nhựa PVC các loại', 'mét'),
    ('Van khóa', 'Van khóa nước các loại', 'cái')
ON CONFLICT DO NOTHING;
