-- ===========================================
-- ROW LEVEL SECURITY POLICIES FOR CHURCH TABLES
-- Multi-Church Contribution Management System
-- ===========================================
-- NOTE: This app uses custom JWT authentication with service role key.
-- Service role bypasses RLS, so backend operations work without RLS restrictions.
-- These policies provide basic security for any direct database access.
-- ===========================================

-- Enable RLS on all church-related tables
ALTER TABLE churches ENABLE ROW LEVEL SECURITY;
ALTER TABLE church_contribution_targets ENABLE ROW LEVEL SECURITY;
ALTER TABLE church_contributions ENABLE ROW LEVEL SECURITY;

-- ===========================================
-- CHURCHES TABLE POLICIES
-- ===========================================

-- Allow service role full access (backend operations)
CREATE POLICY "service_role_full_access_churches"
ON churches
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Authenticated users can view active churches
CREATE POLICY "authenticated_view_churches"
ON churches
FOR SELECT
TO authenticated
USING (is_active = TRUE);

-- Public: Can view active churches (for public pages)
CREATE POLICY "public_view_active_churches"
ON churches
FOR SELECT
TO anon
USING (is_active = TRUE);

-- ===========================================
-- CHURCH CONTRIBUTION TARGETS POLICIES
-- ===========================================

-- Allow service role full access (backend operations)
CREATE POLICY "service_role_full_access_targets"
ON church_contribution_targets
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Authenticated users can view targets
CREATE POLICY "authenticated_view_targets"
ON church_contribution_targets
FOR SELECT
TO authenticated
USING (true);

-- ===========================================
-- CHURCH CONTRIBUTIONS POLICIES
-- ===========================================

-- Allow service role full access (backend operations)
CREATE POLICY "service_role_full_access_contributions"
ON church_contributions
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Authenticated users can view contributions
CREATE POLICY "authenticated_view_contributions"
ON church_contributions
FOR SELECT
TO authenticated
USING (true);

-- ===========================================
-- GRANT PERMISSIONS
-- ===========================================

-- Grant usage on sequences (if they exist)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_sequences WHERE schemaname = 'public' AND sequencename = 'churches_id_seq') THEN
        GRANT USAGE ON SEQUENCE churches_id_seq TO authenticated;
        GRANT USAGE ON SEQUENCE churches_id_seq TO service_role;
    END IF;
    
    IF EXISTS (SELECT 1 FROM pg_sequences WHERE schemaname = 'public' AND sequencename = 'church_contribution_targets_id_seq') THEN
        GRANT USAGE ON SEQUENCE church_contribution_targets_id_seq TO authenticated;
        GRANT USAGE ON SEQUENCE church_contribution_targets_id_seq TO service_role;
    END IF;
    
    IF EXISTS (SELECT 1 FROM pg_sequences WHERE schemaname = 'public' AND sequencename = 'church_contributions_id_seq') THEN
        GRANT USAGE ON SEQUENCE church_contributions_id_seq TO authenticated;
        GRANT USAGE ON SEQUENCE church_contributions_id_seq TO service_role;
    END IF;
END $$;

-- Grant select on the progress view (if it exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_views WHERE schemaname = 'public' AND viewname = 'church_contribution_progress') THEN
        GRANT SELECT ON church_contribution_progress TO authenticated;
        GRANT SELECT ON church_contribution_progress TO service_role;
    END IF;
END $$;

-- ===========================================
-- NOTES:
-- ===========================================
-- 1. Run setup_churches.sql FIRST to create the tables
-- 2. Then run this file to add the RLS policies
-- 3. Your backend uses service_role key in db.js, which BYPASSES RLS
--    All authorization is handled by your backend middleware (adminAuth, superAdminAuth)
-- 4. These RLS policies provide basic security for any direct database access
-- 5. Role-based access control is enforced at the API level, not database level
-- ===========================================
