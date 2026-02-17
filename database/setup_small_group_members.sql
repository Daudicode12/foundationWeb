-- ===========================================
-- SMALL GROUP MEMBERS TABLE (Join Table)
-- Foundation of Christ Ministries
-- ===========================================
-- Run this in Supabase SQL Editor to create the small_group_members table

CREATE TABLE IF NOT EXISTS small_group_members (
    id SERIAL PRIMARY KEY,
    group_id INTEGER NOT NULL REFERENCES small_groups(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(group_id, user_id)
);

-- Indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_sgm_group_id ON small_group_members(group_id);
CREATE INDEX IF NOT EXISTS idx_sgm_user_id ON small_group_members(user_id);

-- ===========================================
-- ROW LEVEL SECURITY (RLS)
-- ===========================================
ALTER TABLE small_group_members ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read memberships
CREATE POLICY "Allow public read access on small_group_members"
    ON small_group_members FOR SELECT
    USING (true);

-- Allow authenticated users to join (insert)
CREATE POLICY "Allow insert on small_group_members"
    ON small_group_members FOR INSERT
    WITH CHECK (true);

-- Allow authenticated users to leave (delete)
CREATE POLICY "Allow delete on small_group_members"
    ON small_group_members FOR DELETE
    USING (true);
