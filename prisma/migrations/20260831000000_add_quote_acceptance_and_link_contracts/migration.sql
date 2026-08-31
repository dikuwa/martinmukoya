-- AlterEnum
ALTER TYPE "DocumentStatus" ADD VALUE IF NOT EXISTS 'ACCEPTED';
ALTER TYPE "DocumentStatus" ADD VALUE IF NOT EXISTS 'DECLINED';

-- AlterTable: FinancialDocument
ALTER TABLE "FinancialDocument" ADD COLUMN "acceptedAt" TIMESTAMP(3),
                                ADD COLUMN "acceptedName" TEXT,
                                ADD COLUMN "declinedAt" TIMESTAMP(3);

-- AlterTable: BusinessDocument
ALTER TABLE "BusinessDocument" ADD COLUMN "financialDocumentId" TEXT;

-- AddForeignKey
ALTER TABLE "BusinessDocument" ADD CONSTRAINT "BusinessDocument_financialDocumentId_fkey"
  FOREIGN KEY ("financialDocumentId") REFERENCES "FinancialDocument"("id") ON DELETE SET NULL ON UPDATE CASCADE;
