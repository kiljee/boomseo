-- AlterTable
ALTER TABLE "Organization" ADD COLUMN     "country" TEXT NOT NULL DEFAULT 'United States',
ADD COLUMN     "industry" TEXT NOT NULL DEFAULT 'Other',
ADD COLUMN     "language" TEXT NOT NULL DEFAULT 'English',
ADD COLUMN     "websiteUrl" TEXT NOT NULL DEFAULT 'example.com';
