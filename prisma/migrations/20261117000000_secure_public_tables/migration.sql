-- Server-only Prisma/Better Auth tables: API roles have no direct access.
-- Run as table owner after verifying the deployed DATABASE_URL role bypasses RLS
-- and has privileges independent of PUBLIC. Reapply after prisma db push.
BEGIN;
DO $secure$
DECLARE
  table_name text;
  api_role text;
  column_names text;
  table_oid oid;
BEGIN
  FOREACH api_role IN ARRAY ARRAY['anon', 'authenticated'] LOOP
    IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = api_role AND (rolsuper OR rolbypassrls)) THEN
      RAISE EXCEPTION 'API role % bypasses RLS', api_role;
    END IF;
  END LOOP;
  FOREACH table_name IN ARRAY ARRAY['User', 'Site', 'Session', 'Account', 'Verification', 'Project', 'BlogPost', 'Lead', 'Contact', 'Booking', 'FinancialDocument', 'DocumentLineItem', 'Payment', 'ContactMessage', 'Testimonial', 'FAQ', 'ChatSession', 'ChatMessage', 'Notification', 'AnalyticsEvent', 'SiteSetting', 'CleanupRun', 'BusinessDocument', 'BusinessDocumentTemplate', 'BusinessDocumentAuditLog', 'SharedDocument', 'DocumentSettings', '_BlogPostToSite', '_FAQToSite', '_ProjectToSite', '_SiteToTestimonial', '_prisma_migrations'] LOOP
    table_oid := to_regclass(format('public.%I', table_name));
    IF table_oid IS NULL THEN CONTINUE; END IF;
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', table_name);
    EXECUTE format('REVOKE ALL PRIVILEGES ON TABLE public.%I FROM PUBLIC, anon, authenticated', table_name);
    -- Table revokes do not remove column-level grants.
    SELECT string_agg(quote_ident(attname), ', ') INTO column_names
      FROM pg_attribute WHERE attrelid = table_oid AND attnum > 0 AND NOT attisdropped;
    EXECUTE format('REVOKE ALL PRIVILEGES (%s) ON TABLE public.%I FROM PUBLIC, anon, authenticated', column_names, table_name);
    EXECUTE format('DROP POLICY IF EXISTS deny_public_api ON public.%I', table_name);
    EXECUTE format('CREATE POLICY deny_public_api ON public.%I AS RESTRICTIVE FOR ALL TO anon, authenticated USING (false) WITH CHECK (false)', table_name);
    FOREACH api_role IN ARRAY ARRAY['anon', 'authenticated'] LOOP
      IF has_table_privilege(api_role, table_oid, 'SELECT, INSERT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER')
        OR has_any_column_privilege(api_role, table_oid, 'SELECT, INSERT, UPDATE, REFERENCES') THEN
        -- Fail atomically rather than altering shared inherited roles behind callers' backs.
        RAISE EXCEPTION 'Inherited API privileges remain for % on %; resolve role grants before rollout', api_role, table_name;
      END IF;
      IF current_setting('server_version_num')::integer >= 170000 AND has_table_privilege(api_role, table_oid, 'MAINTAIN') THEN
        RAISE EXCEPTION 'Inherited MAINTAIN remains for % on %', api_role, table_name;
      END IF;
    END LOOP;
  END LOOP;
END
$secure$;
COMMIT;
