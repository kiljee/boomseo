-- CreateTable
CREATE TABLE "SEOAnalysis" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "seoScore" INTEGER,
    "pagesCrawled" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "SEOAnalysis_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SEOPage" (
    "id" TEXT NOT NULL,
    "analysisId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "statusCode" INTEGER,
    "title" TEXT,
    "metaDescription" TEXT,
    "wordCount" INTEGER,
    "responseTime" DOUBLE PRECISION,
    "size" INTEGER,
    "internalLinks" INTEGER,

    CONSTRAINT "SEOPage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SEOIssue" (
    "id" TEXT NOT NULL,
    "analysisId" TEXT NOT NULL,
    "pageUrl" TEXT,
    "type" TEXT NOT NULL,
    "severity" TEXT,
    "message" TEXT NOT NULL,
    "details" JSONB,

    CONSTRAINT "SEOIssue_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SEOAnalysis_organizationId_idx" ON "SEOAnalysis"("organizationId");

-- CreateIndex
CREATE INDEX "SEOPage_analysisId_idx" ON "SEOPage"("analysisId");

-- CreateIndex
CREATE INDEX "SEOPage_url_idx" ON "SEOPage"("url");

-- CreateIndex
CREATE INDEX "SEOIssue_analysisId_idx" ON "SEOIssue"("analysisId");

-- CreateIndex
CREATE INDEX "SEOIssue_pageUrl_idx" ON "SEOIssue"("pageUrl");

-- AddForeignKey
ALTER TABLE "SEOAnalysis" ADD CONSTRAINT "SEOAnalysis_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SEOPage" ADD CONSTRAINT "SEOPage_analysisId_fkey" FOREIGN KEY ("analysisId") REFERENCES "SEOAnalysis"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SEOIssue" ADD CONSTRAINT "SEOIssue_analysisId_fkey" FOREIGN KEY ("analysisId") REFERENCES "SEOAnalysis"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
