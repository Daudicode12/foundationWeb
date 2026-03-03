-- ===========================================
-- ADD ADMIN APPROVAL COLUMN TO USERS TABLE
-- Run this in Supabase SQL Editor
-- ===========================================

-- Add is_approved column (defaults to false for new admins)
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_approved BOOLEAN DEFAULT FALSE;

-- Auto-approve all existing super_admin users
UPDATE users SET is_approved = TRUE WHERE role = 'super_admin';

-- Auto-approve all existing admin users (they were already active)
UPDATE users SET is_approved = TRUE WHERE role = 'admin';

-- Auto-approve all regular members (approval only matters for admins)
UPDATE users SET is_approved = TRUE WHERE role = 'member';

-- Index for faster lookups on pending approvals
CREATE INDEX IF NOT EXISTS idx_users_is_approved ON users(is_approved);
