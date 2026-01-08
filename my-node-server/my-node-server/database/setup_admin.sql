-- Add role column to users table
ALTER TABLE users ADD COLUMN role ENUM('member', 'admin') DEFAULT 'member' AFTER password;

-- Create an admin user
-- Password: admin123 (hashed with bcrypt)
-- You should change this password after first login!
INSERT INTO users (userName, email, phone, password, role) 
VALUES (
    'Admin User', 
    'admin@focm.com', 
    '555-0100',
    '$2a$10$rOzJw5K5EHVJxH7YxXxCaO9rL4Z8.2vQN6FJPxYxGBE2wQJ5xGxK2',
    'admin'
);

-- Note: The default admin credentials are:
-- Email: admin@focm.com
-- Password: admin123
-- 
-- IMPORTANT: Change the admin password after first login for security!

-- Verify the admin user was created
SELECT id, userName, email, role FROM users WHERE role = 'admin';
