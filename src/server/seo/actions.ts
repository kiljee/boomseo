import {
  startCrawl,
  getCrawlStatus,
  isCrawlRunning,
} from "./libreCrawlClient";

import { crawlWebsiteJob } from "wasp/server/jobs";

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

    // Enqueue the background worker job to poll and finalize the crawl
    await crawlWebsiteJob.submit({
      analysisId: analysis.id,
    });

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

  if (analysis.status === "COMPLETED") {
    return {
      completed: true,
      status: "completed",
      analysis,
      crawled: analysis.pagesCrawled,
      issues: analysis.issues,
    };
  }

  if (analysis.status === "FAILED") {
    return {
      completed: true,
      status: "failed",
      analysis,
      crawled: 0,
      issues: [],
    };
  }

  const crawl = await getCrawlStatus();

  if (isCrawlRunning(crawl)) {
    return {
      status: "running",
      progress: crawl.progress ?? 0,
      completed: false,
      crawled: crawl.stats?.crawled ?? crawl.urls?.length ?? 0,
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

  console.log("CRAWL: "+crawl);

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

export const importGSCData = async (
  args: {
    rows: {
      query: string;
      impressions: number;
      clicks: number;
      ctr: number;
      position: number;
    }[];
  },
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

    const membership =
      await context.entities.Membership.findFirst({
        where: {
          userId: context.user.id,
          orgId: organizationId,
        },
      });

    if (!membership) {
      throw new Error("Unauthorized");
    }

    // Remove the previous import and its rows.
    await context.entities.GSCImport.deleteMany({
      where: {
        organizationId,
      },
    });

    const imported =
      await context.entities.GSCImport.create({
        data: {
          organizationId,

          rows: {
            create: args.rows.map((row) => ({
              query: row.query,
              impressions: row.impressions,
              clicks: row.clicks,
              ctr: row.ctr,
              position: row.position,
            })),
          },
        },

        include: {
          rows: true,
        },
      });

    return imported;
};


import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const saveSEOContext = async (
  args: {
    goal: string;
    audience: string;
    tone: string;
    language: string;
  },
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

  return context.entities.Organization.update({
    where: {
      id: organizationId,
    },
    data: {
      seoGoal: args.goal,
      seoAudience: args.audience,
      seoTone: args.tone,
      seoLanguage: args.language,
    },
  });
};

export const saveCompetitors = async (
  args: {
    urls: string[];
  },
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

  const urls = args.urls
    .map((url) => url.trim())
    .filter(Boolean)
    .slice(0, 5);

  await context.entities.Competitor.deleteMany({
    where: {
      organizationId,
    },
  });

  if (urls.length > 0) {
    await context.entities.Competitor.createMany({
      data: urls.map((url) => ({
        organizationId,
        url,
      })),
    });
  }

  return { success: true };
};


export const generateSEOPlan = async (
  _args: {},
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

  if (!organization) {
    throw new Error("Organization not found");
  }

  const audit =
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

  const competitors =
    await context.entities.Competitor.findMany({
      where: {
        organizationId,
      },
    });

  const gsc =
    await context.entities.GSCImport.findUnique({
      where: {
        organizationId,
      },
    });

  const prompt = `
You are an SEO strategist.

Create an actionable SEO plan for this website.

WEBSITE
${organization.websiteUrl ?? "Unknown"}

SEO CONTEXT
Goal: ${organization.seoGoal ?? "Not specified"}
Audience: ${organization.seoAudience ?? "Not specified"}
Tone: ${organization.seoTone ?? "Not specified"}
Language: ${organization.seoLanguage ?? "English"}

COMPETITORS
${competitors.map((c: any) => c.url).join("\n") || "None provided"}

SEO AUDIT
SEO score: ${audit?.seoScore ?? "Unknown"}
Pages crawled: ${audit?.pagesCrawled ?? 0}
Issues: ${audit?.issueCount ?? 0}

TOP SEO ISSUES
${JSON.stringify(audit?.issues?.slice(0, 30) ?? [])}

GSC DATA
${JSON.stringify(
  gsc?.rows?.slice(0, 100) ?? []
)}

Return ONLY valid JSON with this structure:

{
  "summary": "short strategic summary",
  "keywordClusters": [
    {
      "name": "cluster name",
      "keywords": ["keyword 1", "keyword 2"],
      "priority": "HIGH"
    }
  ],
  "blogTopics": [
    {
      "title": "article title",
      "primaryKeyword": "keyword",
      "priority": "HIGH"
    }
  ],
  "opportunities": [
    {
      "title": "opportunity",
      "description": "what should be done",
      "priority": "HIGH"
    }
  ]
}

Generate practical recommendations based on the supplied data.
Do not invent GSC statistics.
`;

  console.log("START generateSEOPlan");

  const start = Date.now();

  const response = await openai.responses.create({
    model: "gpt-4o-mini",
    input: prompt,
  });

  console.log(
    "OpenAI finished in",
    Date.now() - start,
    "ms"
  );

  const text = response.output_text;

  console.log(text);

  let plan;

  try {
    const cleaned = text
      .replace(/```json\s*/i, "")
      .replace(/```\s*/g, "")
      .trim();

    plan = JSON.parse(cleaned);
  } catch {
    console.error("OpenAI output:", text);

    throw new Error(
      "OpenAI returned invalid SEO plan JSON"
    );
  }

  await context.entities.SEOPlan.upsert({
    where: {
      organizationId,
    },
    create: {
      organizationId,
      status: "COMPLETED",
      data: plan,
      completedAt: new Date(),
    },
    update: {
      status: "COMPLETED",
      data: plan,
      completedAt: new Date(),
    },
  });

  return plan;
};