CREATE TYPE "BookingStatus" AS ENUM ('DRAFT', 'ACTIVE', 'COMPLETED', 'CANCELLED');
CREATE TYPE "DocumentType" AS ENUM ('QUOTE', 'INVOICE', 'RECEIPT');
CREATE TYPE "DocumentStatus" AS ENUM ('DRAFT', 'ISSUED', 'PARTIALLY_PAID', 'PAID', 'SUPERSEDED', 'VOID');
CREATE TYPE "PaymentMethod" AS ENUM ('CASH', 'BANK_TRANSFER', 'CARD', 'OTHER');

CREATE TABLE "Booking" (
  "id" TEXT NOT NULL, "number" TEXT NOT NULL, "siteId" TEXT NOT NULL, "leadId" TEXT,
  "customerName" TEXT NOT NULL, "customerEmail" TEXT, "customerPhone" TEXT, "company" TEXT,
  "projectDescription" TEXT NOT NULL, "budgetRange" TEXT, "status" "BookingStatus" NOT NULL DEFAULT 'ACTIVE',
  "createdById" TEXT, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Booking_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "FinancialDocument" (
  "id" TEXT NOT NULL, "number" TEXT, "type" "DocumentType" NOT NULL, "status" "DocumentStatus" NOT NULL DEFAULT 'DRAFT',
  "siteId" TEXT NOT NULL, "bookingId" TEXT NOT NULL, "revisionOfId" TEXT, "convertedFromId" TEXT,
  "customerName" TEXT NOT NULL, "customerEmail" TEXT, "customerPhone" TEXT, "customerCompany" TEXT, "customerAddress" TEXT,
  "issuerSnapshot" JSONB NOT NULL, "currency" TEXT NOT NULL DEFAULT 'NAD', "validUntil" TIMESTAMP(3), "dueDate" TIMESTAMP(3),
  "discountAmount" DECIMAL(12,2) NOT NULL DEFAULT 0, "additionalCharges" DECIMAL(12,2) NOT NULL DEFAULT 0,
  "taxRate" DECIMAL(7,4) NOT NULL DEFAULT 0, "subtotal" DECIMAL(12,2) NOT NULL DEFAULT 0,
  "taxAmount" DECIMAL(12,2) NOT NULL DEFAULT 0, "total" DECIMAL(12,2) NOT NULL DEFAULT 0,
  "notes" TEXT, "paymentTerms" TEXT, "issuedAt" TIMESTAMP(3), "voidedAt" TIMESTAMP(3),
  "shareToken" TEXT, "shareRevokedAt" TIMESTAMP(3), "createdById" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "FinancialDocument_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "DocumentLineItem" (
  "id" TEXT NOT NULL, "documentId" TEXT NOT NULL, "description" TEXT NOT NULL, "category" TEXT,
  "quantity" DECIMAL(12,3) NOT NULL, "unitPrice" DECIMAL(12,2) NOT NULL, "amount" DECIMAL(12,2) NOT NULL,
  "sortOrder" INTEGER NOT NULL DEFAULT 0, CONSTRAINT "DocumentLineItem_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "Payment" (
  "id" TEXT NOT NULL, "number" TEXT NOT NULL, "siteId" TEXT NOT NULL, "bookingId" TEXT NOT NULL,
  "invoiceId" TEXT, "receiptDocumentId" TEXT, "amount" DECIMAL(12,2) NOT NULL, "method" "PaymentMethod" NOT NULL,
  "paidAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "reference" TEXT, "notes" TEXT, "reversedAt" TIMESTAMP(3),
  "recordedById" TEXT, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Booking_number_key" ON "Booking"("number"); CREATE UNIQUE INDEX "Booking_leadId_key" ON "Booking"("leadId");
CREATE INDEX "Booking_siteId_createdAt_idx" ON "Booking"("siteId", "createdAt"); CREATE INDEX "Booking_status_createdAt_idx" ON "Booking"("status", "createdAt"); CREATE INDEX "Booking_customerName_idx" ON "Booking"("customerName");
CREATE UNIQUE INDEX "FinancialDocument_number_key" ON "FinancialDocument"("number"); CREATE UNIQUE INDEX "FinancialDocument_shareToken_key" ON "FinancialDocument"("shareToken");
CREATE INDEX "FinancialDocument_siteId_createdAt_idx" ON "FinancialDocument"("siteId", "createdAt"); CREATE INDEX "FinancialDocument_bookingId_type_status_idx" ON "FinancialDocument"("bookingId", "type", "status"); CREATE INDEX "FinancialDocument_type_status_issuedAt_idx" ON "FinancialDocument"("type", "status", "issuedAt");
CREATE INDEX "DocumentLineItem_documentId_sortOrder_idx" ON "DocumentLineItem"("documentId", "sortOrder");
CREATE UNIQUE INDEX "Payment_number_key" ON "Payment"("number"); CREATE UNIQUE INDEX "Payment_receiptDocumentId_key" ON "Payment"("receiptDocumentId"); CREATE INDEX "Payment_siteId_paidAt_idx" ON "Payment"("siteId", "paidAt"); CREATE INDEX "Payment_bookingId_paidAt_idx" ON "Payment"("bookingId", "paidAt"); CREATE INDEX "Payment_invoiceId_idx" ON "Payment"("invoiceId");

ALTER TABLE "Booking" ADD CONSTRAINT "Booking_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "Site"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "FinancialDocument" ADD CONSTRAINT "FinancialDocument_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "Site"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "FinancialDocument" ADD CONSTRAINT "FinancialDocument_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "FinancialDocument" ADD CONSTRAINT "FinancialDocument_revisionOfId_fkey" FOREIGN KEY ("revisionOfId") REFERENCES "FinancialDocument"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "FinancialDocument" ADD CONSTRAINT "FinancialDocument_convertedFromId_fkey" FOREIGN KEY ("convertedFromId") REFERENCES "FinancialDocument"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "FinancialDocument" ADD CONSTRAINT "FinancialDocument_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "DocumentLineItem" ADD CONSTRAINT "DocumentLineItem_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "FinancialDocument"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "Site"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "FinancialDocument"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_receiptDocumentId_fkey" FOREIGN KEY ("receiptDocumentId") REFERENCES "FinancialDocument"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_recordedById_fkey" FOREIGN KEY ("recordedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
