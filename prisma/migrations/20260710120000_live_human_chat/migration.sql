CREATE TYPE "ChatMode" AS ENUM ('AI', 'WAITING_FOR_HUMAN', 'HUMAN');
ALTER TYPE "ChatMessageRole" RENAME VALUE 'USER' TO 'VISITOR';
ALTER TYPE "ChatMessageRole" RENAME VALUE 'ASSISTANT' TO 'AI';
ALTER TYPE "ChatMessageRole" ADD VALUE 'HUMAN';

ALTER TABLE "ChatSession"
  ADD COLUMN "mode" "ChatMode" NOT NULL DEFAULT 'AI',
  ADD COLUMN "visitorToken" TEXT,
  ADD COLUMN "handoverRequestedAt" TIMESTAMP(3),
  ADD COLUMN "humanJoinedAt" TIMESTAMP(3),
  ADD COLUMN "assignedAdminId" TEXT;

UPDATE "ChatSession"
SET "mode" = CASE WHEN "handedToHuman" THEN 'WAITING_FOR_HUMAN'::"ChatMode" ELSE 'AI'::"ChatMode" END,
    "handoverRequestedAt" = CASE WHEN "handedToHuman" THEN "updatedAt" ELSE NULL END,
    "visitorToken" = md5(random()::text || clock_timestamp()::text || "id");

ALTER TABLE "ChatSession" ALTER COLUMN "visitorToken" SET NOT NULL;
ALTER TABLE "ChatSession" DROP COLUMN "handedToHuman";
CREATE UNIQUE INDEX "ChatSession_visitorToken_key" ON "ChatSession"("visitorToken");
CREATE INDEX "ChatSession_mode_updatedAt_idx" ON "ChatSession"("mode", "updatedAt");
CREATE INDEX "ChatSession_assignedAdminId_idx" ON "ChatSession"("assignedAdminId");
ALTER TABLE "ChatSession" ADD CONSTRAINT "ChatSession_assignedAdminId_fkey" FOREIGN KEY ("assignedAdminId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "ChatMessage" ADD COLUMN "senderId" TEXT, ADD COLUMN "senderName" TEXT;
ALTER TABLE "ChatMessage" ADD CONSTRAINT "ChatMessage_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
