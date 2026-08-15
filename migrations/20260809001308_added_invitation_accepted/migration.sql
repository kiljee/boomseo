/*
  Warnings:

  - Added the required column `accepted` to the `OrganizationInvitation` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "OrganizationInvitation" ADD COLUMN     "accepted" BOOLEAN NOT NULL;
