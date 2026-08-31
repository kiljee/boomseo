-- AlterTable
ALTER TABLE "Organization" ADD COLUMN     "seoAudience" TEXT,
ADD COLUMN     "seoGoal" TEXT,
ADD COLUMN     "seoLanguage" TEXT,
ADD COLUMN     "seoTone" TEXT;

-- CreateTable
CREATE TABLE "Competitor" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Competitor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SEOPlan" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'GENERATING',
    "data" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "SEOPlan_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Competitor_organizationId_idx" ON "Competitor"("organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "SEOPlan_organizationId_key" ON "SEOPlan"("organizationId");

-- AddForeignKey
ALTER TABLE "Competitor" ADD CONSTRAINT "Competitor_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SEOPlan" ADD CONSTRAINT "SEOPlan_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
