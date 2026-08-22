/*
  Warnings:

  - The `status` column on the `SEOAnalysis` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `pageUrl` on the `SEOIssue` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "SEOAnalysisStatus" AS ENUM ('RUNNING', 'COMPLETED', 'FAILED');

-- DropIndex
DROP INDEX "SEOIssue_pageUrl_idx";

-- AlterTable
ALTER TABLE "SEOAnalysis" ADD COLUMN     "issueCount" INTEGER NOT NULL DEFAULT 0,
DROP COLUMN "status",
ADD COLUMN     "status" "SEOAnalysisStatus" NOT NULL DEFAULT 'RUNNING';

-- AlterTable
ALTER TABLE "SEOIssue" DROP COLUMN "pageUrl",
ADD COLUMN     "url" TEXT,
ALTER COLUMN "message" DROP NOT NULL;

-- AlterTable
ALTER TABLE "SEOPage" ADD COLUMN     "lang" TEXT,
ADD COLUMN     "robots" TEXT;

-- CreateIndex
CREATE INDEX "SEOIssue_url_idx" ON "SEOIssue"("url");
