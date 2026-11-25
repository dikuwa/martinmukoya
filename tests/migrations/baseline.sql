BEGIN;
CREATE ROLE anon NOLOGIN;
CREATE ROLE authenticated NOLOGIN;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO anon, authenticated;

INSERT INTO "Site" (id, name, slug, aliases, "updatedAt") VALUES
  ('studio', 'Synthetic Studio', 'flextech-media', '{}', now()),
  ('personal', 'Synthetic Personal', 'martin-mukoya', '{}', now());
INSERT INTO "SiteSetting" (id, "siteId", key, value, "updatedAt")
SELECT id, id, 'finance.name', to_jsonb(name), now() FROM "Site";
INSERT INTO "Contact" (id, name, email, notes, "updatedAt")
VALUES ('contact', 'Synthetic Client', 'client@example.invalid', 'Keep historical notes', now());
INSERT INTO "Project" (id, title, slug, summary, description, problem, solution, "caseStudyContent", "updatedAt")
VALUES ('project', 'Synthetic project', 'migration-project', 'Summary', 'Description', 'Problem', 'Solution', 'Case study', now());
INSERT INTO "_ProjectToSite" ("A", "B") VALUES ('project', 'studio');
INSERT INTO "Lead" (id, "siteId", name, email, "serviceType", "projectGoal", message, source, "preferredContact", "linkedProjectId", "updatedAt")
VALUES ('lead', 'studio', 'Synthetic Client', 'client@example.invalid', 'WEB_APP', 'Project goal', 'Original inquiry', 'manual', 'EMAIL', 'project', now());
INSERT INTO "Booking" (id, number, "siteId", "leadId", "customerName", "projectDescription", "contractAmount", "updatedAt")
SELECT id, 'BOOK-' || id, id, CASE WHEN id = 'studio' THEN 'lead' END, 'Synthetic Client', 'Original scope', 350, now()
FROM "Site";

INSERT INTO "FinancialDocument" (id, number, type, status, "siteId", "bookingId", "customerName", "issuerSnapshot", total, "updatedAt")
SELECT id, 'INV-' || id, 'INVOICE', 'PARTIALLY_PAID', id, id, 'Synthetic Client',
       jsonb_build_object('name', name, 'paymentMethods', jsonb_build_array('Cash'), 'showSignature', true), 350, now()
FROM "Site";
INSERT INTO "FinancialDocument" (id, number, type, status, "siteId", "bookingId", "customerName", "issuerSnapshot", total, "invoiceTotal", "balanceAfter", "updatedAt")
SELECT 'receipt-' || id, 'RCPT-' || id, 'RECEIPT', 'ISSUED', "siteId", "bookingId", "customerName", "issuerSnapshot", 100, 350, 250, now()
FROM "FinancialDocument";
INSERT INTO "DocumentLineItem" (id, "documentId", description, quantity, "unitPrice", amount)
SELECT id, id, 'Original scope', 1, 350, 350 FROM "Booking";
INSERT INTO "Payment" (id, number, "siteId", "bookingId", "invoiceId", "receiptDocumentId", amount, method, reference, "updatedAt")
SELECT id, 'PAY-' || id, id, id, id, 'receipt-' || id, 100, 'CASH', 'Historical payment', now()
FROM "Site";

INSERT INTO "BusinessDocumentTemplate" (id, name, "documentCategory", "defaultBodyMarkdown", "updatedAt")
VALUES ('template', 'Synthetic proposal template', 'PROPOSAL', 'Original template', now());
INSERT INTO "BusinessDocument" (id, "documentNumber", "documentType", status, title, "siteId", "contactId", "leadId", "projectId", "financialDocumentId", "templateId", "templateSnapshot", "contentMarkdown", "updatedAt")
SELECT id, 'PRO-' || id, 'PROPOSAL', 'ISSUED', 'Legacy proposal', id, 'contact', "leadId",
       CASE WHEN id = 'studio' THEN 'project' END, id, 'template', '{"body":"Original template"}', 'Original proposal', now()
FROM "Booking";
INSERT INTO "SharedDocument" (id, "shortCode", "documentType", "financialDocumentId", "businessDocumentId", "viewCount", "updatedAt")
VALUES ('finance-share', 'migration-invoice', 'financial', 'studio', NULL, 2, now()),
       ('business-share', 'migration-proposal', 'business', NULL, 'personal', 3, now());
COMMIT;
