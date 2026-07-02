-- Fix: Grant table permissions to roles (lost after DROP SCHEMA public CASCADE)
-- Without these, RLS policies work but the tables themselves are inaccessible

GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;

GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;

GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;

-- Grant anon role SELECT only (for public read access if needed)
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;
