BEGIN;
-- Reuse the existing contact directory as the customer master.
-- All alterations are additive; historical leads, bookings and documents remain intact.
ALTER TABLE "Contact" ADD COLUMN "address" TEXT;
ALTER TABLE "Contact" ADD COLUMN "town" TEXT;
ALTER TABLE "Contact" ADD COLUMN "status" TEXT NOT NULL DEFAULT 'CUSTOMER';

ALTER TABLE "Booking" ADD COLUMN "contactId" TEXT;
ALTER TABLE "Booking" ADD COLUMN "kind" TEXT NOT NULL DEFAULT 'PROJECT';
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_contactId_fkey"
  FOREIGN KEY ("contactId") REFERENCES "Contact"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;
CREATE INDEX "Booking_contactId_idx" ON "Booking"("contactId");

CREATE TABLE "ServiceCatalogItem" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "description" TEXT,
  "price" DECIMAL(12,2) NOT NULL DEFAULT 0,
  "active" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "ServiceCatalogItem_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "InvoiceReminder" (
  "id" TEXT NOT NULL,
  "invoiceId" TEXT NOT NULL,
  "channel" TEXT NOT NULL,
  "destination" TEXT,
  "message" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "InvoiceReminder_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "InvoiceReminder_invoiceId_fkey"
    FOREIGN KEY ("invoiceId") REFERENCES "FinancialDocument"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE
);
CREATE INDEX "InvoiceReminder_invoiceId_createdAt_idx"
  ON "InvoiceReminder"("invoiceId", "createdAt");

-- Server-only private tables. Fail atomically if an API role inherits privileges.
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
  FOREACH table_name IN ARRAY ARRAY['ServiceCatalogItem', 'InvoiceReminder'] LOOP
    table_oid := to_regclass(format('public.%I', table_name));
    IF table_oid IS NULL THEN CONTINUE; END IF;
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', table_name);
    EXECUTE format('REVOKE ALL PRIVILEGES ON TABLE public.%I FROM PUBLIC, anon, authenticated', table_name);
    SELECT string_agg(quote_ident(attname), ', ') INTO column_names
      FROM pg_attribute WHERE attrelid = table_oid AND attnum > 0 AND NOT attisdropped;
    EXECUTE format('REVOKE ALL PRIVILEGES (%s) ON TABLE public.%I FROM PUBLIC, anon, authenticated', column_names, table_name);
    EXECUTE format('DROP POLICY IF EXISTS deny_public_api ON public.%I', table_name);
    EXECUTE format('CREATE POLICY deny_public_api ON public.%I AS RESTRICTIVE FOR ALL TO anon, authenticated USING (false) WITH CHECK (false)', table_name);
    FOREACH api_role IN ARRAY ARRAY['anon', 'authenticated'] LOOP
      IF has_table_privilege(api_role, table_oid, 'SELECT, INSERT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER')
        OR has_any_column_privilege(api_role, table_oid, 'SELECT, INSERT, UPDATE, REFERENCES') THEN
        RAISE EXCEPTION 'Inherited API privileges remain for % on %', api_role, table_name;
      END IF;
      IF current_setting('server_version_num')::integer >= 170000
        AND has_table_privilege(api_role, table_oid, 'MAINTAIN') THEN
        RAISE EXCEPTION 'Inherited MAINTAIN remains for % on %', api_role, table_name;
      END IF;
    END LOOP;
  END LOOP;
END
$secure$;

COMMIT;
