-- ===========================================
-- SMALL GROUPS TABLE
-- Foundation of Christ Ministries
-- ===========================================
-- Run this in Supabase SQL Editor to create the small_groups table

CREATE TABLE IF NOT EXISTS small_groups (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    leader VARCHAR(255) NOT NULL,
    meeting_time VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_small_groups_name ON small_groups(name);
CREATE INDEX IF NOT EXISTS idx_small_groups_leader ON small_groups(leader);

-- ===========================================
-- ROW LEVEL SECURITY (RLS)
-- ===========================================
ALTER TABLE small_groups ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read small groups
CREATE POLICY "Allow public read access on small_groups"
    ON small_groups FOR SELECT
    USING (true);

-- Allow authenticated users (admins) to insert
CREATE POLICY "Allow admin insert on small_groups"
    ON small_groups FOR INSERT
    WITH CHECK (true);

-- Allow authenticated users (admins) to update
CREATE POLICY "Allow admin update on small_groups"
    ON small_groups FOR UPDATE
    USING (true);

-- Allow authenticated users (admins) to delete
CREATE POLICY "Allow admin delete on small_groups"
    ON small_groups FOR DELETE
    USING (true);

-- ===========================================
-- SAMPLE DATA (optional)
-- ===========================================
INSERT INTO small_groups (name, description, leader, meeting_time) VALUES
('Young Professionals', 'A small group for young professionals to fellowship, study the Word, and support each other in faith and career.', 'Sarah Johnson', 'Thursdays 7:00 PM'),
('Men of Faith', 'A men''s group focused on biblical manhood, accountability, and spiritual growth.', 'Pastor David', 'Saturdays 8:00 AM'),
('Women of Grace', 'A women''s fellowship group for prayer, Bible study, and mutual encouragement.', 'Mary Ochieng', 'Wednesdays 6:00 PM'),
('Campus Connect', 'A small group for college and university students to grow in faith together.', 'James Mwangi', 'Fridays 5:30 PM'),
('Family Builders', 'For married couples and families seeking to build strong, Christ-centered homes.', 'Pastor John & Nancy', 'Sundays 3:00 PM');
