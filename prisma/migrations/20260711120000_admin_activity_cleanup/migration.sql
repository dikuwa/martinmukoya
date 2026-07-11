CREATE TABLE "CleanupRun" (
  "id" TEXT NOT NULL,
  "adminId" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'EXPORTED',
  "cutoffAt" TIMESTAMP(3) NOT NULL,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "exportedCounts" JSONB NOT NULL,
  "deletedCounts" JSONB,
  "completedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "CleanupRun_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "CleanupRun_adminId_status_createdAt_idx" ON "CleanupRun"("adminId", "status", "createdAt");
CREATE INDEX "CleanupRun_expiresAt_idx" ON "CleanupRun"("expiresAt");
ALTER TABLE "CleanupRun" ADD CONSTRAINT "CleanupRun_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
