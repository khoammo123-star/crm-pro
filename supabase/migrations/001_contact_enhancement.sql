-- =====================================================
-- CRM PRO - CONTACT ENHANCEMENT MIGRATION
-- Version: 2.1.0
-- Description: Thêm fields cho reminder, Zalo và N8N integration
-- =====================================================

-- 1. Ngày dự kiến khách cần sản phẩm
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS expected_need_date DATE;
COMMENT ON COLUMN contacts.expected_need_date IS 'Ngày dự kiến khách cần sản phẩm';

-- 2. Ngày nhắc gọi lại
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS reminder_date DATE;
COMMENT ON COLUMN contacts.reminder_date IS 'Ngày cần nhắc nhở liên hệ khách';

-- 3. Ghi chú cho lần nhắc
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS reminder_note TEXT;

-- 4. Mức độ ưu tiên chăm sóc (low/normal/high/urgent)
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS care_priority TEXT DEFAULT 'normal';

-- 5. Lần liên hệ cuối
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS last_contacted_at TIMESTAMPTZ;

-- 6. SĐT Zalo (có thể khác SĐT chính)
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS zalo_phone TEXT;

-- 7. Tạo indexes cho performance
CREATE INDEX IF NOT EXISTS idx_contacts_expected_need ON contacts(expected_need_date);
CREATE INDEX IF NOT EXISTS idx_contacts_reminder ON contacts(reminder_date);
CREATE INDEX IF NOT EXISTS idx_contacts_care_priority ON contacts(care_priority);

-- =====================================================
-- RPC FUNCTIONS CHO N8N
-- =====================================================

-- Lấy danh sách khách cần gọi hôm nay
CREATE OR REPLACE FUNCTION get_due_reminders()
RETURNS TABLE (
    id UUID,
    first_name TEXT,
    last_name TEXT,
    phone TEXT,
    email TEXT,
    reminder_date DATE,
    reminder_note TEXT,
    care_priority TEXT,
    expected_need_date DATE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        c.id, c.first_name, c.last_name, c.phone, c.email,
        c.reminder_date, c.reminder_note, c.care_priority, c.expected_need_date
    FROM contacts c
    WHERE c.reminder_date <= CURRENT_DATE
    AND c.status != 'inactive'
    ORDER BY 
        CASE c.care_priority
            WHEN 'urgent' THEN 1
            WHEN 'high' THEN 2
            WHEN 'normal' THEN 3
            WHEN 'low' THEN 4
        END,
        c.reminder_date ASC;
END;
$$ LANGUAGE plpgsql;

-- Lấy khách sắp cần SP trong N ngày tới
CREATE OR REPLACE FUNCTION get_upcoming_needs(days_ahead INT DEFAULT 7)
RETURNS TABLE (
    id UUID,
    first_name TEXT,
    last_name TEXT,
    phone TEXT,
    expected_need_date DATE,
    care_priority TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        c.id, c.first_name, c.last_name, c.phone,
        c.expected_need_date, c.care_priority
    FROM contacts c
    WHERE c.expected_need_date BETWEEN CURRENT_DATE AND (CURRENT_DATE + days_ahead)
    AND c.status != 'inactive'
    ORDER BY c.expected_need_date ASC;
END;
$$ LANGUAGE plpgsql;

-- Đếm số khách cần gọi hôm nay (cho Dashboard)
CREATE OR REPLACE FUNCTION count_due_reminders()
RETURNS INTEGER AS $$
    SELECT COUNT(*)::INTEGER FROM contacts 
    WHERE reminder_date <= CURRENT_DATE AND status != 'inactive';
$$ LANGUAGE SQL;

-- Đếm khách sắp cần SP (cho Dashboard)  
CREATE OR REPLACE FUNCTION count_upcoming_needs(days_ahead INT DEFAULT 7)
RETURNS INTEGER AS $$
    SELECT COUNT(*)::INTEGER FROM contacts 
    WHERE expected_need_date BETWEEN CURRENT_DATE AND (CURRENT_DATE + days_ahead)
    AND status != 'inactive';
$$ LANGUAGE SQL;

-- Cập nhật trạng thái "đã liên hệ" cho N8N
CREATE OR REPLACE FUNCTION mark_contacted(contact_id UUID, next_reminder DATE DEFAULT NULL)
RETURNS VOID AS $$
BEGIN
    UPDATE contacts 
    SET 
        last_contacted_at = NOW(),
        reminder_date = next_reminder
    WHERE id = contact_id;
END;
$$ LANGUAGE plpgsql;
