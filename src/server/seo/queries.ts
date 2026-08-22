import {
  getCrawlStatus,
} from "./libreCrawlClient";

export const getSEOAnalysisStatus = async (
  args: { analysisId: string },
  context: any
) => {
  if (!context.user) {
    throw new Error("Not authenticated");
  }

  const analysis =
    await context.entities.SEOAnalysis.findUnique({
      where: {
        id: args.analysisId,
      },
    });

  if (!analysis) {
    throw new Error("Analysis not found");
  }

  if (
    analysis.organizationId !==
    context.user.activeOrganizationId
  ) {
    throw new Error("Unauthorized");
  }

  const crawl =
    await getCrawlStatus();

  return {
    analysis,

    crawl: {
      status: crawl.status,

      progress:
        crawl.progress ?? 0,

      stats:
        crawl.stats ?? null,

      pages:
        crawl.urls?.length ?? 0,

      issues:
        crawl.issues?.length ?? 0,
    },
  };
};

export const getLatestSEOAudit = async (
  _args: void,
  context: any
) => {
  if (!context.user) {
    throw new Error("Not authenticated");
  }

  const organizationId = context.user.activeOrganizationId;

  if (!organizationId) {
    return null;
  }

  const analysis =
    await context.entities.SEOAnalysis.findFirst({
      where: {
        organizationId,
        status: "COMPLETED",
      },
      orderBy: {
        completedAt: "desc",
      },
      include: {
        pages: true,
        issues: true,
      },
    });

  if (!analysis) {
    return null;
  }

  return analysis;
};