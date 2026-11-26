BEGIN;
SET LOCAL plpgsql.check_asserts = on;
DO $$
DECLARE
  t record;
  api_role text;
BEGIN
  ASSERT (SELECT count(*) = 2 AND bool_and(kind = 'PROJECT' AND source = 'unspecified' AND "contactId" IS NULL) FROM "Booking"),
    'Legacy booking defaults or links changed';
  ASSERT (SELECT status = 'CUSTOMER' AND address IS NULL AND town IS NULL FROM "Contact" WHERE id = 'contact'),
    'Legacy customer defaults changed';
  ASSERT (SELECT count(*) = 2 AND bool_and("idempotencyKey" IS NULL) FROM "Payment"),
    'Historical payments must retain nullable keys';
  ASSERT (SELECT count(*) = 2 AND bool_and("issuerSnapshot" IS NULL) FROM "BusinessDocument"),
    'Unknown legacy business issuers must not be backfilled';

  FOR t IN SELECT oid, relname, relrowsecurity FROM pg_class
           WHERE relnamespace = 'public'::regnamespace AND relkind = 'r' LOOP
    ASSERT t.relrowsecurity, format('RLS disabled on %I', t.relname);
    FOREACH api_role IN ARRAY ARRAY['anon', 'authenticated'] LOOP
      ASSERT NOT has_table_privilege(api_role, t.oid, 'SELECT,INSERT,UPDATE,DELETE,TRUNCATE,REFERENCES,TRIGGER'),
        format('%s has table privileges on %I', api_role, t.relname);
      ASSERT NOT has_any_column_privilege(api_role, t.oid, 'SELECT,INSERT,UPDATE,REFERENCES'),
        format('%s has column privileges on %I', api_role, t.relname);
    END LOOP;
  END LOOP;

  BEGIN
    UPDATE "Booking" SET "contactId" = 'missing-contact' WHERE id = 'studio';
    RAISE EXCEPTION 'Booking accepted an orphaned contact';
  EXCEPTION WHEN foreign_key_violation THEN NULL;
  END;
  BEGIN
    INSERT INTO "InvoiceReminder" (id, "invoiceId", channel, message) VALUES ('orphan', 'missing-invoice', 'COPY', 'Synthetic');
    RAISE EXCEPTION 'Reminder accepted an orphaned invoice';
  EXCEPTION WHEN foreign_key_violation THEN NULL;
  END;
END $$;

INSERT INTO "Contact" (id, name, "updatedAt") VALUES ('temporary-contact', 'Synthetic temporary contact', now());
UPDATE "Booking" SET "contactId" = 'temporary-contact' WHERE id = 'studio';
DELETE FROM "Contact" WHERE id = 'temporary-contact';
INSERT INTO "InvoiceReminder" (id, "invoiceId", channel, message) VALUES ('reminder', 'studio', 'COPY', 'Synthetic remainder: NAD 250');
INSERT INTO "ServiceCatalogItem" (id, name, "updatedAt") VALUES ('service', 'Synthetic service', now());
INSERT INTO "Payment" (id, number, "siteId", "bookingId", "invoiceId", amount, method, "idempotencyKey", "updatedAt")
VALUES ('keyed-payment', 'PAY-keyed', 'studio', 'studio', 'studio', 25, 'CASH', 'migration-fixture-key', now());

INSERT INTO "BusinessDocument" (id, "documentType", status, title, "siteId", "issuerSnapshot", "updatedAt")
SELECT 'issued-' || id, 'PROPOSAL', 'ISSUED', 'New proposal', id,
       jsonb_build_object('name', name, 'showSignature', false), now()
FROM "Site";
UPDATE "SiteSetting" SET value = to_jsonb('Renamed after issue'::text) WHERE key = 'finance.name';

DO $$
BEGIN
  ASSERT (SELECT "contactId" IS NULL FROM "Booking" WHERE id = 'studio'), 'Contact deletion must clear the booking link';
  ASSERT (SELECT active AND price = 0 FROM "ServiceCatalogItem" WHERE id = 'service'), 'Catalogue defaults changed';
  ASSERT (SELECT "issuerSnapshot" = '{"name":"Synthetic Studio","showSignature":false}'::jsonb FROM "BusinessDocument" WHERE id = 'issued-studio'),
    'Studio business issuer snapshot changed after settings update';
  ASSERT (SELECT "issuerSnapshot" = '{"name":"Synthetic Personal","showSignature":false}'::jsonb FROM "BusinessDocument" WHERE id = 'issued-personal'),
    'Personal business issuer snapshot changed after settings update';
  ASSERT (SELECT count(*) = 4 AND bool_and(f."issuerSnapshot" = jsonb_build_object('name', s.name, 'paymentMethods', jsonb_build_array('Cash'), 'showSignature', true))
          FROM "FinancialDocument" f JOIN "Site" s ON s.id = f."siteId"), 'Invoice or receipt snapshot changed';
  BEGIN
    UPDATE "Payment" SET "idempotencyKey" = 'migration-fixture-key' WHERE id = 'personal';
    RAISE EXCEPTION 'Payment accepted a duplicate idempotency key';
  EXCEPTION WHEN unique_violation THEN NULL;
  END;
END $$;
COMMIT;
