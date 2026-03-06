/*
  Warnings:

  - You are about to drop the `accounts` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `alert_run_jobs` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `alert_runs` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `alerts` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ingest_logs` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `jobs` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `saved_jobs` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `sessions` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `users` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `verification_tokens` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "accounts" DROP CONSTRAINT "accounts_userId_fkey";

-- DropForeignKey
ALTER TABLE "alert_run_jobs" DROP CONSTRAINT "alert_run_jobs_alertRunId_fkey";

-- DropForeignKey
ALTER TABLE "alert_run_jobs" DROP CONSTRAINT "alert_run_jobs_jobId_fkey";

-- DropForeignKey
ALTER TABLE "alert_runs" DROP CONSTRAINT "alert_runs_alertId_fkey";

-- DropForeignKey
ALTER TABLE "alerts" DROP CONSTRAINT "alerts_userId_fkey";

-- DropForeignKey
ALTER TABLE "saved_jobs" DROP CONSTRAINT "saved_jobs_jobId_fkey";

-- DropForeignKey
ALTER TABLE "saved_jobs" DROP CONSTRAINT "saved_jobs_userId_fkey";

-- DropForeignKey
ALTER TABLE "sessions" DROP CONSTRAINT "sessions_userId_fkey";

-- DropTable
DROP TABLE "accounts";

-- DropTable
DROP TABLE "alert_run_jobs";

-- DropTable
DROP TABLE "alert_runs";

-- DropTable
DROP TABLE "alerts";

-- DropTable
DROP TABLE "ingest_logs";

-- DropTable
DROP TABLE "jobs";

-- DropTable
DROP TABLE "saved_jobs";

-- DropTable
DROP TABLE "sessions";

-- DropTable
DROP TABLE "users";

-- DropTable
DROP TABLE "verification_tokens";

-- CreateTable
CREATE TABLE "job_users" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT,
    "emailVerified" TIMESTAMP(3),
    "image" TEXT,
    "role" TEXT NOT NULL DEFAULT 'user',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "job_users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "job_accounts" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "job_accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "job_sessions" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "job_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "job_verification_tokens" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "job_jobs" (
    "id" TEXT NOT NULL,
    "externalId" TEXT NOT NULL,
    "source" TEXT NOT NULL DEFAULT 'sg-jobs',
    "title" TEXT NOT NULL,
    "company" TEXT,
    "description" TEXT,
    "location" TEXT,
    "employmentType" TEXT,
    "seniority" TEXT,
    "salaryMin" INTEGER,
    "salaryMax" INTEGER,
    "currency" TEXT NOT NULL DEFAULT 'SGD',
    "postedAt" TIMESTAMP(3),
    "applyUrl" TEXT,
    "tags" TEXT[],
    "raw" JSONB NOT NULL,
    "searchVector" tsvector,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "job_jobs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "job_saved_jobs" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "job_saved_jobs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "job_alerts" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "query" TEXT,
    "filters" JSONB NOT NULL DEFAULT '{}',
    "frequency" "AlertFrequency" NOT NULL DEFAULT 'DAILY',
    "lastRunAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "job_alerts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "job_alert_runs" (
    "id" TEXT NOT NULL,
    "alertId" TEXT NOT NULL,
    "runAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "matchCount" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "job_alert_runs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "job_alert_run_jobs" (
    "alertRunId" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,

    CONSTRAINT "job_alert_run_jobs_pkey" PRIMARY KEY ("alertRunId","jobId")
);

-- CreateTable
CREATE TABLE "job_ingest_logs" (
    "id" TEXT NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finishedAt" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'running',
    "jobsFetched" INTEGER NOT NULL DEFAULT 0,
    "jobsUpserted" INTEGER NOT NULL DEFAULT 0,
    "error" TEXT,

    CONSTRAINT "job_ingest_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "job_users_email_key" ON "job_users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "job_accounts_provider_providerAccountId_key" ON "job_accounts"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "job_sessions_sessionToken_key" ON "job_sessions"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "job_verification_tokens_token_key" ON "job_verification_tokens"("token");

-- CreateIndex
CREATE UNIQUE INDEX "job_verification_tokens_identifier_token_key" ON "job_verification_tokens"("identifier", "token");

-- CreateIndex
CREATE UNIQUE INDEX "job_jobs_externalId_key" ON "job_jobs"("externalId");

-- CreateIndex
CREATE INDEX "job_jobs_postedAt_idx" ON "job_jobs"("postedAt" DESC);

-- CreateIndex
CREATE INDEX "job_jobs_employmentType_idx" ON "job_jobs"("employmentType");

-- CreateIndex
CREATE INDEX "job_jobs_location_idx" ON "job_jobs"("location");

-- CreateIndex
CREATE INDEX "job_jobs_tags_idx" ON "job_jobs"("tags");

-- CreateIndex
CREATE UNIQUE INDEX "job_saved_jobs_userId_jobId_key" ON "job_saved_jobs"("userId", "jobId");

-- AddForeignKey
ALTER TABLE "job_accounts" ADD CONSTRAINT "job_accounts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "job_users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job_sessions" ADD CONSTRAINT "job_sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "job_users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job_saved_jobs" ADD CONSTRAINT "job_saved_jobs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "job_users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job_saved_jobs" ADD CONSTRAINT "job_saved_jobs_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "job_jobs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job_alerts" ADD CONSTRAINT "job_alerts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "job_users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job_alert_runs" ADD CONSTRAINT "job_alert_runs_alertId_fkey" FOREIGN KEY ("alertId") REFERENCES "job_alerts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job_alert_run_jobs" ADD CONSTRAINT "job_alert_run_jobs_alertRunId_fkey" FOREIGN KEY ("alertRunId") REFERENCES "job_alert_runs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job_alert_run_jobs" ADD CONSTRAINT "job_alert_run_jobs_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "job_jobs"("id") ON DELETE CASCADE ON UPDATE CASCADE;
