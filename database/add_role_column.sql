-- Add role column to users table
USE usersdb;

ALTER TABLE users
  ADD COLUMN role VARCHAR(32) DEFAULT 'member';

-- Update existing users to have member role
UPDATE users SET role = 'member' WHERE role IS NULL;
