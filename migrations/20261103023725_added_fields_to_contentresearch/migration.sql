-- AlterTable
ALTER TABLE "ContentResearch" ADD COLUMN     "device" TEXT NOT NULL DEFAULT 'desktop',
ADD COLUMN     "targetCountry" TEXT NOT NULL DEFAULT 'US',
ADD COLUMN     "targetState" TEXT,
ADD COLUMN     "targetUrl" TEXT;
