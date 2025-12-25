/*
  Warnings:

  - Added the required column `endedAt` to the `StudySession` table without a default value. This is not possible if the table is not empty.
  - Added the required column `startedAt` to the `StudySession` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "StudySession" ADD COLUMN     "endedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "qualityScore" INTEGER,
ADD COLUMN     "startedAt" TIMESTAMP(3) NOT NULL;

-- CreateIndex
CREATE INDEX "StudySession_userId_status_endedAt_idx" ON "StudySession"("userId", "status", "endedAt");

-- CreateIndex
CREATE INDEX "StudySession_topicId_endedAt_idx" ON "StudySession"("topicId", "endedAt");
