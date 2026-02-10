-- ===========================================
-- CREATE SUPER ADMIN USER
-- Run this after setup_churches.sql
-- ===========================================

-- IMPORTANT: Change the password hash and email before running!
-- The default password below is 'SuperAdmin123!' - CHANGE THIS IN PRODUCTION!

-- Password hash for 'SuperAdmin123!' (bcrypt with 10 rounds)
-- You should generate your own hash using bcrypt

-- Option 1: Update an existing admin user to super_admin
-- UPDATE users SET role = 'super_admin' WHERE email = 'your-admin-email@example.com';

-- Option 2: Create a new super admin user
-- Note: Generate the password hash using bcrypt (10 rounds) in your application
-- INSERT INTO users (username, email, phone, password, role)
-- VALUES (
--   'Super Admin',
--   'superadmin@focm.org',
--   '+254700000000',
--   '$2a$10$YOUR_BCRYPT_HASH_HERE',  -- Replace with actual bcrypt hash
--   'super_admin'
-- );

-- For testing purposes, you can use this Node.js script to generate a hash:
-- const bcrypt = require('bcryptjs');
-- const hash = await bcrypt.hash('YourSecurePassword123!', 10);
-- console.log(hash);

-- ===========================================
-- SAMPLE DATA FOR TESTING (Optional)
-- ===========================================

-- Insert sample churches
INSERT INTO churches (name, code, address, city, region, phone, email, pastor_name) VALUES
('Foundation Church Main', 'FCM-001', '123 Main Street', 'Nairobi', 'Nairobi County', '+254700000001', 'main@focm.org', 'Pastor John Doe'),
('Foundation Church West', 'FCM-002', '456 West Avenue', 'Kisumu', 'Kisumu County', '+254700000002', 'west@focm.org', 'Pastor Jane Smith'),
('Foundation Church Coast', 'FCM-003', '789 Beach Road', 'Mombasa', 'Mombasa County', '+254700000003', 'coast@focm.org', 'Pastor David Omondi'),
('Foundation Church Rift', 'FCM-004', '321 Valley Road', 'Nakuru', 'Nakuru County', '+254700000004', 'rift@focm.org', 'Pastor Sarah Wanjiku'),
('Foundation Church Central', 'FCM-005', '555 Central Plaza', 'Nyeri', 'Nyeri County', '+254700000005', 'central@focm.org', 'Pastor Peter Kamau')
ON CONFLICT (code) DO NOTHING;

-- Insert contribution targets for current year (2026)
INSERT INTO church_contribution_targets (church_id, year, target_amount, description) 
SELECT id, 2026, 
  CASE 
    WHEN code = 'FCM-001' THEN 500000.00
    WHEN code = 'FCM-002' THEN 300000.00
    WHEN code = 'FCM-003' THEN 350000.00
    WHEN code = 'FCM-004' THEN 250000.00
    WHEN code = 'FCM-005' THEN 200000.00
  END,
  'Annual contribution target for ' || name
FROM churches 
WHERE code IN ('FCM-001', 'FCM-002', 'FCM-003', 'FCM-004', 'FCM-005')
ON CONFLICT (church_id, year) DO NOTHING;

-- Insert sample contributions
INSERT INTO church_contributions (church_id, amount, contribution_date, payment_method, reference_number, description)
SELECT c.id, amounts.amount, amounts.date, amounts.method, amounts.ref, 'Monthly contribution'
FROM churches c
CROSS JOIN (
  VALUES 
    (50000.00, '2026-01-15'::date, 'bank_transfer', 'TXN-001-JAN'),
    (45000.00, '2026-02-10'::date, 'bank_transfer', 'TXN-001-FEB')
) AS amounts(amount, date, method, ref)
WHERE c.code = 'FCM-001';

INSERT INTO church_contributions (church_id, amount, contribution_date, payment_method, reference_number, description)
SELECT c.id, amounts.amount, amounts.date, amounts.method, amounts.ref, 'Monthly contribution'
FROM churches c
CROSS JOIN (
  VALUES 
    (25000.00, '2026-01-20'::date, 'mobile_money', 'MPE-002-JAN'),
    (30000.00, '2026-02-12'::date, 'bank_transfer', 'TXN-002-FEB')
) AS amounts(amount, date, method, ref)
WHERE c.code = 'FCM-002';

INSERT INTO church_contributions (church_id, amount, contribution_date, payment_method, reference_number, description)
SELECT c.id, amounts.amount, amounts.date, amounts.method, amounts.ref, 'Monthly contribution'
FROM churches c
CROSS JOIN (
  VALUES 
    (35000.00, '2026-01-18'::date, 'bank_transfer', 'TXN-003-JAN'),
    (28000.00, '2026-02-08'::date, 'check', 'CHK-003-FEB')
) AS amounts(amount, date, method, ref)
WHERE c.code = 'FCM-003';

-- Add more sample contributions for other churches...
