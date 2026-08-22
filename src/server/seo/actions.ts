import {
  startCrawl,
  getCrawlStatus,
} from "./libreCrawlClient";

import {
  parseCrawlResults,
} from "./analyzer";

export const startSEOAnalysis = async (
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

  const organization =
    await context.entities.Organization.findUnique({
      where: {
        id: organizationId,
      },
    });

  if (!organization?.websiteUrl) {
    throw new Error("No website configured");
  }

  const analysis =
    await context.entities.SEOAnalysis.create({
      data: {
        organizationId,
        status: "RUNNING",
      },
    });

  try {
    await startCrawl(
      organization.websiteUrl
    );

    return {
      analysisId: analysis.id,
    };
  } catch (error) {
    await context.entities.SEOAnalysis.update({
      where: {
        id: analysis.id,
      },
      data: {
        status: "FAILED",
      },
    });

    throw error;
  }
};


export const syncSEOAnalysis = async (
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

  const crawl = await getCrawlStatus();

  if (crawl.is_running || crawl.stats?.crawled === 0) {
    return {
      status: "running",
      progress: crawl.progress ?? 0,
      completed: false,
      crawled: crawl.stats?.crawled ?? 0,
      discovered: crawl.stats?.discovered ?? 0,
      issues: crawl.issues ?? [],
    };
  }

  const parsed =
    parseCrawlResults(crawl);

  await context.entities.SEOPage.deleteMany({
    where: {
      analysisId: analysis.id,
    },
  });

  await context.entities.SEOIssue.deleteMany({
    where: {
      analysisId: analysis.id,
    },
  });

  if (parsed.pages.length > 0) {
    await context.entities.SEOPage.createMany({
      data: parsed.pages
        .filter((page) => page.url)
        .map((page) => ({
          analysisId: analysis.id,

          url: page.url!,
          title: page.title ?? null,
          metaDescription:
            page.meta_description ?? null,

          statusCode:
            page.status_code ?? null,

          wordCount:
            page.word_count ?? null,

          internalLinks:
            page.internal_links ?? null,

          responseTime:
            page.response_time ?? null,

          size:
            page.size ?? null,

          lang:
            page.lang ?? null,

          robots:
            page.robots ?? null,
        })),
    });
  }

  if (parsed.issues.length > 0) {
    await context.entities.SEOIssue.createMany({
      data: parsed.issues.map((issue) => ({
        analysisId: analysis.id,

        type:
          issue.type ?? "unknown",

        severity:
          issue.severity ?? null,

        message:
          issue.message ?? null,

        url:
          issue.url ?? null,

        details: issue,
      })),
    });
  }

  const updated =
    await context.entities.SEOAnalysis.update({
      where: {
        id: analysis.id,
      },

      data: {
        status: "COMPLETED",

        seoScore:
          parsed.seoScore,

        pagesCrawled:
          parsed.pages.length,

        issueCount:
          parsed.issues.length,

        completedAt:
          new Date(),
      },
    });

  return {
    completed: true,
    analysis: updated,
    stats: parsed.stats,
  };
};