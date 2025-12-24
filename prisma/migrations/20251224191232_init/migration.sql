-- CreateEnum
CREATE TYPE "ExamStatus" AS ENUM ('FOCUS', 'ACTIVE', 'PAUSED');

-- CreateEnum
CREATE TYPE "TopicCoverage" AS ENUM ('INTEGRAL', 'PARTIAL');

-- CreateEnum
CREATE TYPE "SessionStatus" AS ENUM ('PENDING', 'CATEGORIZED');

-- CreateEnum
CREATE TYPE "StudyFocus" AS ENUM ('LEI_SECA', 'JURISPRUDENCIA', 'DOUTRINA', 'CARDS', 'QUESTOES');

-- CreateEnum
CREATE TYPE "TimerSource" AS ENUM ('PRESET', 'MANUAL');

-- CreateEnum
CREATE TYPE "PlanStatus" AS ENUM ('DRAFT', 'ACTIVE', 'ARCHIVED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserSettings" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "defaultSessionMin" INTEGER NOT NULL DEFAULT 50,
    "weeklyTargetBlocks" INTEGER NOT NULL DEFAULT 10,
    "maxSameDisciplineInRow" INTEGER NOT NULL DEFAULT 2,

    CONSTRAINT "UserSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Exam" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "status" "ExamStatus" NOT NULL DEFAULT 'ACTIVE',
    "priorityWeight" INTEGER NOT NULL DEFAULT 60,
    "examDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Exam_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Discipline" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "basePriority" INTEGER NOT NULL DEFAULT 3,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Discipline_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Topic" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "disciplineId" TEXT NOT NULL,
    "parentId" TEXT,
    "title" TEXT NOT NULL,
    "difficulty" INTEGER NOT NULL DEFAULT 3,
    "personalPriority" INTEGER NOT NULL DEFAULT 3,
    "mastery" INTEGER NOT NULL DEFAULT 0,
    "lastTouchAt" TIMESTAMP(3),
    "touchCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Topic_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExamTopic" (
    "id" TEXT NOT NULL,
    "examId" TEXT NOT NULL,
    "topicId" TEXT NOT NULL,
    "coverage" "TopicCoverage" NOT NULL DEFAULT 'INTEGRAL',
    "examImportance" INTEGER NOT NULL DEFAULT 3,
    "notes" TEXT,

    CONSTRAINT "ExamTopic_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StudySession" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "startAt" TIMESTAMP(3) NOT NULL,
    "durationMin" INTEGER NOT NULL,
    "status" "SessionStatus" NOT NULL DEFAULT 'PENDING',
    "topicId" TEXT,
    "disciplineId" TEXT,
    "examId" TEXT,
    "focus" "StudyFocus",
    "quality" INTEGER,
    "performance" INTEGER,
    "notes" TEXT,
    "timerSource" "TimerSource" NOT NULL DEFAULT 'MANUAL',
    "timerPresetMin" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StudySession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TrailTemplate" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TrailTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TrailStep" (
    "id" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    "stepIndex" INTEGER NOT NULL,
    "offsetDays" INTEGER NOT NULL,
    "focus" "StudyFocus" NOT NULL,
    "minMinutes" INTEGER NOT NULL,
    "maxMinutes" INTEGER NOT NULL,
    "label" TEXT,

    CONSTRAINT "TrailStep_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TopicTrailState" (
    "id" TEXT NOT NULL,
    "topicId" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    "nextStepIndex" INTEGER NOT NULL DEFAULT 0,
    "nextDueAt" TIMESTAMP(3),
    "lastTouchAt" TIMESTAMP(3),
    "active" BOOLEAN NOT NULL DEFAULT true,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TopicTrailState_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlanRun" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "weekStart" TIMESTAMP(3) NOT NULL,
    "status" "PlanStatus" NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlanRun_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlanItem" (
    "id" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "dayIndex" INTEGER NOT NULL,
    "orderIndex" INTEGER NOT NULL,
    "topicId" TEXT NOT NULL,
    "examId" TEXT,
    "focus" "StudyFocus" NOT NULL,
    "minutes" INTEGER NOT NULL,
    "reason" TEXT,
    "score" DOUBLE PRECISION,

    CONSTRAINT "PlanItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "UserSettings_userId_key" ON "UserSettings"("userId");

-- CreateIndex
CREATE INDEX "Exam_userId_status_idx" ON "Exam"("userId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "Discipline_userId_name_key" ON "Discipline"("userId", "name");

-- CreateIndex
CREATE INDEX "Topic_userId_disciplineId_idx" ON "Topic"("userId", "disciplineId");

-- CreateIndex
CREATE INDEX "Topic_userId_lastTouchAt_idx" ON "Topic"("userId", "lastTouchAt");

-- CreateIndex
CREATE INDEX "ExamTopic_topicId_idx" ON "ExamTopic"("topicId");

-- CreateIndex
CREATE UNIQUE INDEX "ExamTopic_examId_topicId_key" ON "ExamTopic"("examId", "topicId");

-- CreateIndex
CREATE INDEX "StudySession_userId_status_startAt_idx" ON "StudySession"("userId", "status", "startAt");

-- CreateIndex
CREATE INDEX "StudySession_topicId_startAt_idx" ON "StudySession"("topicId", "startAt");

-- CreateIndex
CREATE INDEX "TrailTemplate_userId_isDefault_idx" ON "TrailTemplate"("userId", "isDefault");

-- CreateIndex
CREATE UNIQUE INDEX "TrailStep_templateId_stepIndex_key" ON "TrailStep"("templateId", "stepIndex");

-- CreateIndex
CREATE UNIQUE INDEX "TopicTrailState_topicId_key" ON "TopicTrailState"("topicId");

-- CreateIndex
CREATE INDEX "PlanRun_userId_weekStart_idx" ON "PlanRun"("userId", "weekStart");

-- CreateIndex
CREATE INDEX "PlanItem_planId_dayIndex_idx" ON "PlanItem"("planId", "dayIndex");

-- AddForeignKey
ALTER TABLE "UserSettings" ADD CONSTRAINT "UserSettings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Exam" ADD CONSTRAINT "Exam_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Discipline" ADD CONSTRAINT "Discipline_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Topic" ADD CONSTRAINT "Topic_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Topic" ADD CONSTRAINT "Topic_disciplineId_fkey" FOREIGN KEY ("disciplineId") REFERENCES "Discipline"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Topic" ADD CONSTRAINT "Topic_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Topic"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExamTopic" ADD CONSTRAINT "ExamTopic_examId_fkey" FOREIGN KEY ("examId") REFERENCES "Exam"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExamTopic" ADD CONSTRAINT "ExamTopic_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "Topic"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudySession" ADD CONSTRAINT "StudySession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudySession" ADD CONSTRAINT "StudySession_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "Topic"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudySession" ADD CONSTRAINT "StudySession_disciplineId_fkey" FOREIGN KEY ("disciplineId") REFERENCES "Discipline"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudySession" ADD CONSTRAINT "StudySession_examId_fkey" FOREIGN KEY ("examId") REFERENCES "Exam"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrailTemplate" ADD CONSTRAINT "TrailTemplate_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrailStep" ADD CONSTRAINT "TrailStep_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "TrailTemplate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TopicTrailState" ADD CONSTRAINT "TopicTrailState_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "Topic"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TopicTrailState" ADD CONSTRAINT "TopicTrailState_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "TrailTemplate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlanRun" ADD CONSTRAINT "PlanRun_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlanItem" ADD CONSTRAINT "PlanItem_planId_fkey" FOREIGN KEY ("planId") REFERENCES "PlanRun"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlanItem" ADD CONSTRAINT "PlanItem_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "Topic"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlanItem" ADD CONSTRAINT "PlanItem_examId_fkey" FOREIGN KEY ("examId") REFERENCES "Exam"("id") ON DELETE SET NULL ON UPDATE CASCADE;
