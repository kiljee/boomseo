-- CreateEnum
CREATE TYPE "ContentResearchStatus" AS ENUM ('PENDING', 'RUNNING', 'COMPLETED', 'FAILED');

-- CreateTable
CREATE TABLE "CrawledPage" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "title" TEXT,
    "metaDescription" TEXT,
    "headings" JSONB,
    "text" TEXT,
    "wordCount" INTEGER,
    "crawledAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CrawledPage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContentResearch" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "keywordId" TEXT NOT NULL,
    "status" "ContentResearchStatus" NOT NULL DEFAULT 'PENDING',
    "serpResults" JSONB,
    "competitorPages" JSONB,
    "wdfIdfAnalayis" JSONB,
    "contentGaps" JSONB,
    "recommendedOutline" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ContentResearch_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CrawledPage_url_key" ON "CrawledPage"("url");

-- CreateIndex
CREATE INDEX "CrawledPage_expiresAt_idx" ON "CrawledPage"("expiresAt");

-- CreateIndex
CREATE INDEX "ContentResearch_organizationId_idx" ON "ContentResearch"("organizationId");

-- CreateIndex
CREATE INDEX "ContentResearch_keywordId_idx" ON "ContentResearch"("keywordId");

-- AddForeignKey
ALTER TABLE "ContentResearch" ADD CONSTRAINT "ContentResearch_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContentResearch" ADD CONSTRAINT "ContentResearch_keywordId_fkey" FOREIGN KEY ("keywordId") REFERENCES "SEOKeyword"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
