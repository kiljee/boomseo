-- CreateTable
CREATE TABLE "SEOKeyword" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "keyword" TEXT NOT NULL,
    "intent" TEXT,
    "relevance" INTEGER,
    "difficulty" INTEGER,
    "selected" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SEOKeyword_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SEOArticle" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "keywordId" TEXT NOT NULL,
    "title" TEXT,
    "metaTitle" TEXT,
    "metaDescription" TEXT,
    "slug" TEXT,
    "content" TEXT,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "wordCount" INTEGER,
    "seoScore" INTEGER,
    "contentBrief" JSONB,
    "wdfIdfAnalysis" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SEOArticle_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SEOKeyword_organizationId_idx" ON "SEOKeyword"("organizationId");

-- CreateIndex
CREATE INDEX "SEOArticle_organizationId_idx" ON "SEOArticle"("organizationId");

-- CreateIndex
CREATE INDEX "SEOArticle_keywordId_idx" ON "SEOArticle"("keywordId");

-- AddForeignKey
ALTER TABLE "SEOKeyword" ADD CONSTRAINT "SEOKeyword_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SEOArticle" ADD CONSTRAINT "SEOArticle_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SEOArticle" ADD CONSTRAINT "SEOArticle_keywordId_fkey" FOREIGN KEY ("keywordId") REFERENCES "SEOKeyword"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
