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
      include: {
        pages: true,
        issues: true,
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

  let crawl: any = null;
  if (analysis.status === "RUNNING") {
    try {
      crawl = await getCrawlStatus();
    } catch (e) {
      console.warn("Could not fetch LibreCrawl status:", e);
    }
  }

  const rawIssues = crawl?.issues ?? analysis.issues ?? [];
  const issueCount = Array.isArray(rawIssues)
    ? rawIssues.length
    : typeof rawIssues === "number"
    ? rawIssues
    : 0;

  return {
    analysis,
    completed: analysis.status === "COMPLETED",
    status: analysis.status.toLowerCase(),
    progress: crawl?.progress ?? (analysis.status === "COMPLETED" ? 100 : 0),
    crawled: crawl?.stats?.crawled ?? crawl?.urls?.length ?? analysis.pagesCrawled ?? 0,
    discovered: crawl?.stats?.discovered ?? 0,
    issues: issueCount,
    issueList: Array.isArray(rawIssues) ? rawIssues : [],
    crawl: crawl
      ? {
          status: crawl.status,
          progress: crawl.progress ?? 0,
          stats: crawl.stats ?? null,
          pages: crawl.urls?.length ?? 0,
          issues: Array.isArray(crawl.issues)
            ? crawl.issues.length
            : crawl.issues ?? 0,
        }
      : null,
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


export const getSEOAudits = async (
  _args: void,
  context: any
) => {
  if (!context.user) {
    throw new Error("Not authenticated");
  }

  const organizationId =
    context.user.activeOrganizationId;

  if (!organizationId) {
    throw new Error("No active organization");
  }

  return context.entities.SEOAnalysis.findMany({
    where: {
      organizationId,
    },
    orderBy: {
      startedAt: "desc",
    },
  });
};

export const getSEOAudit = async (
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
        include: {
          pages: true,
          issues: true,
        }
      });

    if (!analysis) {
      throw new Error("Audit not found");
    }

    if (
      analysis.organizationId !==
      context.user.activeOrganizationId
    ) {
      throw new Error("Unauthorized");
    }

    return analysis;
};



export const getCrawlStatusQuery = async (
    args: { analysisId: string },
    context: any
  ) => {
    if (!context.user) {
      throw new Error("Not authenticated");
    }

    const crawl =
      await getCrawlStatus();

    console.log("Got status: "+crawl)

    return crawl;
};

export const getGSCStats = async (
  _args: void,
  context: any
) => {
  if (!context.user) {
    throw new Error("Not authenticated");
  }

  const organizationId =
    context.user.activeOrganizationId;

  if (!organizationId) {
    return null;
  }

  const gscImport =
    await context.entities.GSCImport.findUnique({
      where: {
        organizationId,
      },
      include: {
        rows: true,
      },
    });

  if (!gscImport) {
    return null;
  }

  const rows = gscImport.rows;

  const totalImpressions = rows.reduce(
    (sum: number, row: any) => sum + row.impressions,
    0
  );

  const totalClicks = rows.reduce(
    (sum: number, row: any) => sum + row.clicks,
    0
  );

  const averagePosition =
    rows.length > 0
      ? rows.reduce(
          (sum: number, row: any) => sum + row.position,
          0
        ) / rows.length
      : 0;

  const ctr =
    totalImpressions > 0
      ? totalClicks / totalImpressions
      : 0;

  const topKeywords = [...rows]
    .sort((a, b) => b.clicks - a.clicks)
    .slice(0, 10);

  return {
    importedAt: gscImport.importedAt,

    totalImpressions,
    totalClicks,
    ctr,
    averagePosition,

    keywordCount: rows.length,

    topKeywords,
  };
};

export const getSEOPlan = async (_args: void, context: any) => {
  if (!context.user) {
    throw new Error("Not authenticated");
  }

  const organizationId = context.user.activeOrganizationId;

  if (!organizationId) {
    throw new Error("No active organization");
  }

  const plan = await context.entities.SEOPlan.findUnique({
    where: {
      organizationId,
    },
  });

  return plan;
};
