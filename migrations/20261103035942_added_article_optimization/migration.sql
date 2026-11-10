-- CreateEnum
CREATE TYPE "OptimizationStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED');

-- CreateTable
CREATE TABLE "ArticleOptimization" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "status" "OptimizationStatus" NOT NULL DEFAULT 'PENDING',
    "originalContent" TEXT NOT NULL,
    "optimizedContent" TEXT,
    "targetKeyword" TEXT NOT NULL,
    "keywords" JSONB NOT NULL,
    "tone" TEXT,
    "model" TEXT NOT NULL,
    "wordCount" INTEGER,
    "error" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ArticleOptimization_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ArticleOptimization" ADD CONSTRAINT "ArticleOptimization_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
