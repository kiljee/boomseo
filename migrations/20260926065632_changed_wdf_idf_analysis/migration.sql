/*
  Warnings:

  - You are about to drop the column `wdfIdfAnalayis` on the `ContentResearch` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "ContentResearch" DROP COLUMN "wdfIdfAnalayis",
ADD COLUMN     "wdfIdfAnalysis" JSONB;
