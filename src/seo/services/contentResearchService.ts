import { getCachedPage } from './pageCache';
import { extractCompetitorPage, type CompetitorPageData } from './pageCrawler';
import { searchSERP, filterSERPResults } from './serpService';
import { analyzeWdfIdf } from '../utils/wdfidf';

export interface ContentResearchResult {
  competitorsAnalyzed: number;
  competitorTopics: string[];
  averageWordCount: number;
  recommendedWordCount: number;
  recommendedOutline: {
    level: 'h2' | 'h3';
    title: string;
    rationale: string;
  }[];
}

export async function crawlCompetitorPages(
  results: {
    url: string;
  }[],
  context: any,
  batchSize = 4
): Promise<CompetitorPageData[]> {
  const pages: CompetitorPageData[] = [];

  for (let i = 0; i < results.length; i += batchSize) {
    const batch = results.slice(i, i + batchSize);
    const settled = await Promise.allSettled(
      batch.map((result) => getCachedPage(result.url, context))
    );

    for (const outcome of settled) {
      if (outcome.status === 'fulfilled' && outcome.value) {
        pages.push(outcome.value);
      } else if (outcome.status === 'rejected') {
        console.warn(`Could not crawl page:`, outcome.reason?.message ?? outcome.reason);
      }
    }
  }

  return pages;
}

// Helper to support both pageCrawler (h1, h2, h3) and database cached pages (headings: { h1, h2, h3 })
function extractHeadingsFromPage(page: any): {
  h1: string[];
  h2: string[];
  h3: string[];
} {
  const headings = page.headings;
  if (headings) {
    return {
      h1: headings.h1 ?? [],
      h2: headings.h2 ?? [],
      h3: headings.h3 ?? [],
    };
  }

  return {
    h1: page.h1 ?? [],
    h2: page.h2 ?? [],
    h3: page.h3 ?? [],
  };
}

export function analyzeCompetitorContent(
  pages: CompetitorPageData[],
  targetKeyword: string
): ContentResearchResult {
  const headings = pages.flatMap((page) => {
    const data = extractHeadingsFromPage(page);

    return [
      ...(data.h2 ?? []),
      ...(data.h3 ?? []),
    ];
  });

  const normalized = headings
    .map(normalizeHeading)
    .filter(Boolean);

  const topicCounts = new Map<string, number>();

  for (const heading of normalized) {
    topicCounts.set(
      heading,
      (topicCounts.get(heading) ?? 0) + 1
    );
  }

  const competitorTopics = [
    ...topicCounts.entries(),
  ]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([topic]) => topic);

  const averageWordCount =
    pages.length === 0
      ? 0
      : Math.round(
          pages.reduce(
            (sum, page) => sum + (page.wordCount ?? 0),
            0
          ) / pages.length
        );

  return {
    competitorsAnalyzed: pages.length,
    competitorTopics,
    averageWordCount,
    recommendedWordCount: Math.max(1000, averageWordCount),
    recommendedOutline: competitorTopics.map((topic) => ({
      level: 'h2',
      title: topic,
      rationale: `Topic appears in competitor content for "${targetKeyword}".`,
    })),
  };
}

function normalizeHeading(heading: string): string {
  return heading
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export interface ContentGapAnalysisResult {
  competitorsAnalyzed: number;
  contentGaps: string[];
  recommendedOutline: {
    level: 'h2' | 'h3';
    title: string;
    rationale: string;
  }[];
  targetWordCount: number;
}

export async function analyzeContentGaps(
  targetKeyword: string,
  competitorUrls: string[]
): Promise<ContentGapAnalysisResult> {
  const pages: CompetitorPageData[] = [];

  for (const url of competitorUrls.slice(0, 5)) {
    try {
      const pageData = await extractCompetitorPage(url);
      pages.push(pageData);
    } catch (err) {
      console.warn(`Could not analyze content gap for ${url}:`, err);
    }
  }

  const analysis = analyzeCompetitorContent(pages, targetKeyword);

  return {
    competitorsAnalyzed: analysis.competitorsAnalyzed,
    contentGaps: analysis.competitorTopics,
    recommendedOutline: analysis.recommendedOutline,
    targetWordCount: analysis.recommendedWordCount,
  };
}

export async function executeContentResearch(
  researchId: string,
  context: any
) {
  const research =
    await context.entities.ContentResearch.findUnique({
      where: { id: researchId },
      include: {
        keyword: true,
      },
    });

  if (!research) {
    throw new Error('Content research not found');
  }

  const keyword = research.keyword?.keyword;
  if (!keyword) {
    throw new Error('Keyword not found for content research');
  }

  await context.entities.ContentResearch.update({
    where: { id: researchId },
    data: {
      status: 'RUNNING',
    },
  });

  try {
    const serpResults = await searchSERP(keyword, 15);
    const competitors = filterSERPResults(serpResults);
    const competitorPages = await crawlCompetitorPages(competitors, context);
    const analysis = analyzeCompetitorContent(competitorPages, keyword);
    const wdfIdfAnalysisOutput = analyzeWdfIdf(competitorPages);

    await context.entities.ContentResearch.update({
      where: { id: researchId },
      data: {
        status: 'COMPLETED',
        serpResults,
        competitorPages: competitorPages.map((page) => ({
          url: page.url,
          title: page.title,
          metaDescription: page.metaDescription,
          headings: extractHeadingsFromPage(page),
          text: page.text,
          wordCount: page.wordCount,
        })),
        contentGaps: analysis.competitorTopics,
        recommendedOutline: analysis.recommendedOutline,
        wdfIdfAnalysis: wdfIdfAnalysisOutput ?? null,
      },
    });

    return {
      success: true,
      researchId,
      ...analysis,
    };
  } catch (error) {
    await context.entities.ContentResearch.update({
      where: { id: researchId },
      data: {
        status: 'FAILED',
      },
    });

    throw error;
  }
}

/**
 * Backward compatibility export for external jobs like generateSEOArticleJob.ts
 */
export async function performContentResearch(
  researchId: string,
  context: any
) {
  return executeContentResearch(researchId, context);
}