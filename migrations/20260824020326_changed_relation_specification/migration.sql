-- DropForeignKey
ALTER TABLE "Membership" DROP CONSTRAINT "Membership_orgId_fkey";

-- DropForeignKey
ALTER TABLE "OrganizationInvitation" DROP CONSTRAINT "OrganizationInvitation_activeOrganizationId_fkey";

-- DropForeignKey
ALTER TABLE "SEOAnalysis" DROP CONSTRAINT "SEOAnalysis_organizationId_fkey";

-- DropForeignKey
ALTER TABLE "SEOIssue" DROP CONSTRAINT "SEOIssue_analysisId_fkey";

-- DropForeignKey
ALTER TABLE "SEOPage" DROP CONSTRAINT "SEOPage_analysisId_fkey";

-- AddForeignKey
ALTER TABLE "Membership" ADD CONSTRAINT "Membership_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrganizationInvitation" ADD CONSTRAINT "OrganizationInvitation_activeOrganizationId_fkey" FOREIGN KEY ("activeOrganizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SEOAnalysis" ADD CONSTRAINT "SEOAnalysis_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SEOPage" ADD CONSTRAINT "SEOPage_analysisId_fkey" FOREIGN KEY ("analysisId") REFERENCES "SEOAnalysis"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SEOIssue" ADD CONSTRAINT "SEOIssue_analysisId_fkey" FOREIGN KEY ("analysisId") REFERENCES "SEOAnalysis"("id") ON DELETE CASCADE ON UPDATE CASCADE;
