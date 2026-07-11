ALTER TABLE "Lead"
  ADD COLUMN "linkedProjectId" TEXT,
  ADD COLUMN "followUpAt" TIMESTAMP(3);

ALTER TABLE "BusinessDocument"
  ADD COLUMN "templateVersion" INTEGER,
  ADD COLUMN "templateSnapshot" JSONB;

CREATE INDEX "Lead_followUpAt_idx" ON "Lead"("followUpAt");
