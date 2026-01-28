-- =====================================================
-- CRM PRO - CONTACT MODULE UPGRADE MIGRATION
-- Run this in Supabase SQL Editor
-- =====================================================

-- 1. Add new columns to contacts table
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS department TEXT;
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS social_links JSONB DEFAULT '{}';
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS last_contacted TIMESTAMPTZ;
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS birthday DATE;
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS gender TEXT;

-- 2. Create appointments table (Lịch hẹn)
CREATE TABLE IF NOT EXISTS appointments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    contact_id UUID REFERENCES contacts(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ,
    location TEXT,
    status TEXT DEFAULT 'scheduled',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create reminders table (Nhắc nhở)
CREATE TABLE IF NOT EXISTS reminders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    contact_id UUID REFERENCES contacts(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    remind_at TIMESTAMPTZ NOT NULL,
    note TEXT,
    is_done BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_appointments_contact ON appointments(contact_id);
CREATE INDEX IF NOT EXISTS idx_appointments_start_time ON appointments(start_time);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status);

CREATE INDEX IF NOT EXISTS idx_reminders_contact ON reminders(contact_id);
CREATE INDEX IF NOT EXISTS idx_reminders_remind_at ON reminders(remind_at);
CREATE INDEX IF NOT EXISTS idx_reminders_is_done ON reminders(is_done);

CREATE INDEX IF NOT EXISTS idx_contacts_tags ON contacts USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_contacts_last_contacted ON contacts(last_contacted);

-- 5. Trigger for appointments updated_at
CREATE TRIGGER update_appointments_updated_at BEFORE UPDATE ON appointments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 6. View for upcoming appointments
CREATE OR REPLACE VIEW upcoming_appointments AS
SELECT 
    a.*,
    c.first_name,
    c.last_name,
    c.email,
    c.phone
FROM appointments a
JOIN contacts c ON a.contact_id = c.id
WHERE a.start_time >= NOW() AND a.status = 'scheduled'
ORDER BY a.start_time ASC;

-- 7. View for pending reminders
CREATE OR REPLACE VIEW pending_reminders AS
SELECT 
    r.*,
    c.first_name,
    c.last_name,
    c.phone
FROM reminders r
JOIN contacts c ON r.contact_id = c.id
WHERE r.is_done = false AND r.remind_at >= NOW()
ORDER BY r.remind_at ASC;

SELECT 'Contact Module Upgrade completed successfully!' as status;
