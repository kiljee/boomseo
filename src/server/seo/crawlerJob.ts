import { type CrawlWebsiteJob } from "wasp/server/jobs";
import { prisma } from "wasp/server";
import { getCrawlStatus, isCrawlRunning } from "./libreCrawlClient";
import { parseCrawlResults } from "./analyzer";

export const crawlWebsiteJob: CrawlWebsiteJob<
  { analysisId: string },
  void
> = async ({ analysisId }, context) => {
  console.log(`[CrawlWebsiteJob] Starting background monitoring for analysis: ${analysisId}`);
  const maxAttempts = 120; // 10 minutes max with 5s polling interval
  let attempts = 0;
  let lastCrawlData: any = null;

  try {
    // Give LibreCrawl a few seconds to start up before polling
    await new Promise((r) => setTimeout(r, 3000));

    while (attempts < maxAttempts) {
      attempts++;

      try {
        const crawl = await getCrawlStatus();
        lastCrawlData = crawl;

        const running = isCrawlRunning(crawl);
        console.log(
          `[CrawlWebsiteJob] Poll #${attempts}: status=${crawl?.status}, progress=${crawl?.progress}%, isRunning=${running}, crawled=${crawl?.stats?.crawled ?? crawl?.urls?.length ?? 0}`
        );

        if (!running) {
          console.log(`[CrawlWebsiteJob] Crawl finished. Processing results...`);
          break;
        }
      } catch (pollError) {
        console.warn(`[CrawlWebsiteJob] Warning: Poll attempt ${attempts} failed:`, pollError);
      }

      await new Promise((r) => setTimeout(r, 5000));
    }

    if (!lastCrawlData) {
      throw new Error("No crawl data received from LibreCrawl");
    }

    const parsed = parseCrawlResults(lastCrawlData);
    console.log(`[CrawlWebsiteJob] Parsed ${parsed.pages.length} pages and ${parsed.issues.length} issues. Score: ${parsed.seoScore}`);

    // Atomically save pages, issues, and completed analysis status
    await prisma.$transaction([
      context.entities.SEOPage.deleteMany({ where: { analysisId } }),
      context.entities.SEOIssue.deleteMany({ where: { analysisId } }),
      ...(parsed.pages.length > 0
        ? [
            context.entities.SEOPage.createMany({
              data: parsed.pages
                .filter((p) => p.url)
                .map((page) => ({
                  analysisId,
                  url: page.url!,
                  title: page.title ?? null,
                  metaDescription: page.meta_description ?? null,
                  statusCode: page.status_code ?? null,
                  wordCount: page.word_count ?? null,
                  internalLinks: page.internal_links ?? null,
                  responseTime: page.response_time ?? null,
                  size: page.size ?? null,
                  lang: page.lang ?? null,
                  robots: page.robots ?? null,
                })),
            }),
          ]
        : []),
      ...(parsed.issues.length > 0
        ? [
            context.entities.SEOIssue.createMany({
              data: parsed.issues.map((issue) => ({
                analysisId,
                type: issue.type ?? "unknown",
                severity: issue.severity ?? null,
                message: issue.message ?? null,
                url: issue.url ?? null,
                details: issue as any,
              })),
            }),
          ]
        : []),
      context.entities.SEOAnalysis.update({
        where: { id: analysisId },
        data: {
          status: "COMPLETED",
          seoScore: parsed.seoScore,
          pagesCrawled: parsed.pages.length,
          issueCount: parsed.issues.length,
          completedAt: new Date(),
        },
      }),
    ]);

    console.log(`[CrawlWebsiteJob] Analysis ${analysisId} successfully completed and saved.`);
  } catch (error) {
    console.error(`[CrawlWebsiteJob] Crawl job failed for analysis ${analysisId}:`, error);
    try {
      await context.entities.SEOAnalysis.update({
        where: { id: analysisId },
        data: { status: "FAILED" },
      });
    } catch (dbError) {
      console.error(`[CrawlWebsiteJob] Failed to update analysis status to FAILED:`, dbError);
    }
  }
};