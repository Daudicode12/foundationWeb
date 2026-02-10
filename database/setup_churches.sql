-- ===========================================
-- CHURCHES AND CONTRIBUTION TRACKING SCHEMA
-- Multi-Church Contribution Management System
-- ===========================================

-- ===========================================
-- 1. CHURCHES TABLE
-- ===========================================
CREATE TABLE IF NOT EXISTS churches (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,  -- Unique church code/identifier
    address TEXT,
    city VARCHAR(100),
    region VARCHAR(100),
    phone VARCHAR(50),
    email VARCHAR(255),
    pastor_name VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_churches_code ON churches(code);
CREATE INDEX IF NOT EXISTS idx_churches_name ON churches(name);
CREATE INDEX IF NOT EXISTS idx_churches_is_active ON churches(is_active);

-- ===========================================
-- 2. CHURCH CONTRIBUTION TARGETS TABLE
-- Yearly contribution targets for each church
-- ===========================================
CREATE TABLE IF NOT EXISTS church_contribution_targets (
    id SERIAL PRIMARY KEY,
    church_id INT NOT NULL REFERENCES churches(id) ON DELETE CASCADE,
    year INT NOT NULL,
    target_amount DECIMAL(12, 2) NOT NULL,
    description TEXT,
    created_by INT REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(church_id, year)  -- One target per church per year
);

CREATE INDEX IF NOT EXISTS idx_targets_church_id ON church_contribution_targets(church_id);
CREATE INDEX IF NOT EXISTS idx_targets_year ON church_contribution_targets(year);

-- ===========================================
-- 3. CHURCH CONTRIBUTIONS TABLE
-- Individual contribution records for each church
-- ===========================================
CREATE TABLE IF NOT EXISTS church_contributions (
    id SERIAL PRIMARY KEY,
    church_id INT NOT NULL REFERENCES churches(id) ON DELETE CASCADE,
    amount DECIMAL(12, 2) NOT NULL,
    contribution_date DATE NOT NULL,
    payment_method VARCHAR(30) NOT NULL DEFAULT 'cash' CHECK (payment_method IN ('cash', 'check', 'bank_transfer', 'mobile_money', 'online')),
    reference_number VARCHAR(100),
    description TEXT,
    recorded_by INT REFERENCES users(id) ON DELETE SET NULL,
    receipt_number VARCHAR(100),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_contributions_church_id ON church_contributions(church_id);
CREATE INDEX IF NOT EXISTS idx_contributions_date ON church_contributions(contribution_date);
CREATE INDEX IF NOT EXISTS idx_contributions_year ON church_contributions(EXTRACT(YEAR FROM contribution_date));

-- ===========================================
-- 4. UPDATE USERS TABLE
-- Add church_id and super_admin role
-- ===========================================

-- Add church_id column to users
ALTER TABLE users ADD COLUMN IF NOT EXISTS church_id INT REFERENCES churches(id) ON DELETE SET NULL;

-- Update role check constraint to include super_admin
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;
ALTER TABLE users ADD CONSTRAINT users_role_check CHECK (role IN ('member', 'admin', 'super_admin'));

CREATE INDEX IF NOT EXISTS idx_users_church_id ON users(church_id);

-- ===========================================
-- 5. VIEW: CHURCH CONTRIBUTION PROGRESS
-- Helpful view for tracking progress
-- ===========================================
CREATE OR REPLACE VIEW church_contribution_progress AS
SELECT 
    c.id AS church_id,
    c.name AS church_name,
    c.code AS church_code,
    c.city,
    c.region,
    c.pastor_name,
    t.year,
    t.target_amount,
    COALESCE(SUM(cc.amount), 0) AS total_contributed,
    t.target_amount - COALESCE(SUM(cc.amount), 0) AS remaining_amount,
    CASE 
        WHEN t.target_amount > 0 
        THEN ROUND((COALESCE(SUM(cc.amount), 0) / t.target_amount) * 100, 2)
        ELSE 0 
    END AS progress_percentage
FROM churches c
LEFT JOIN church_contribution_targets t ON c.id = t.church_id
LEFT JOIN church_contributions cc ON c.id = cc.church_id 
    AND EXTRACT(YEAR FROM cc.contribution_date) = t.year
WHERE c.is_active = TRUE
GROUP BY c.id, c.name, c.code, c.city, c.region, c.pastor_name, t.year, t.target_amount;

-- ===========================================
-- 6. SAMPLE DATA (Optional - comment out if not needed)
-- ===========================================

-- Insert sample churches
-- INSERT INTO churches (name, code, address, city, region, phone, email, pastor_name) VALUES
-- ('Foundation Church Main', 'FCM-001', '123 Main Street', 'Nairobi', 'Nairobi County', '+254700000001', 'main@foundation.church', 'Pastor John Doe'),
-- ('Foundation Church West', 'FCM-002', '456 West Avenue', 'Kisumu', 'Kisumu County', '+254700000002', 'west@foundation.church', 'Pastor Jane Smith'),
-- ('Foundation Church Coast', 'FCM-003', '789 Beach Road', 'Mombasa', 'Mombasa County', '+254700000003', 'coast@foundation.church', 'Pastor David Omondi');

-- Insert sample targets for current year
-- INSERT INTO church_contribution_targets (church_id, year, target_amount, description) VALUES
-- (1, 2026, 500000.00, 'Annual contribution target for main church'),
-- (2, 2026, 300000.00, 'Annual contribution target for west church'),
-- (3, 2026, 350000.00, 'Annual contribution target for coast church');

-- ===========================================
-- 7. FUNCTION: Update timestamps automatically
-- ===========================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply trigger to new tables
DROP TRIGGER IF EXISTS update_churches_updated_at ON churches;
CREATE TRIGGER update_churches_updated_at
    BEFORE UPDATE ON churches
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_targets_updated_at ON church_contribution_targets;
CREATE TRIGGER update_targets_updated_at
    BEFORE UPDATE ON church_contribution_targets
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_contributions_updated_at ON church_contributions;
CREATE TRIGGER update_contributions_updated_at
    BEFORE UPDATE ON church_contributions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
