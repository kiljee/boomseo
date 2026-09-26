import { getCachedPage } from './pageCache';
import { extractCompetitorPage } from './pageCrawler';
import { runContentResearch } from 'wasp/server/jobs';

import {
  searchDuckDuckGo,
  filterSERPResults,
} from './serpService';


export async function crawlCompetitorPages(
  results: {
    url: string;
  }[],
  context: any
) {
  const pages : any[] = [];

  for(const result of results) {
    try {
      const page = await getCachedPage(
        result.url,
        context
      )


      pages.push(page);
    } catch(error) {
      console.warn(
        `Could not crawl ${result.url}:`,
        error
      );
    }
  }

  return pages;
}

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

export function analyzeCompetitorContent(
  pages: any[],
  targetKeyword: string
): ContentResearchResult {
  const headings = pages.flatMap(
    (page) => {
      const data = page.headings ?? {};

      return [
        ...(data.h2 ?? []),
        ...(data.h3 ?? []),
      ];
    }
  );

  const normalized = headings
    .map(normalizeHeading)
    .filter(Boolean);

  const topicCounts = new Map<string, number>();

  for(const heading of normalized) {
    topicCounts.set(
      heading,
      (topicCounts.get(heading) ?? 0) + 1
    );
  }

  const competitorTopics = [
    ...topicCounts.entries(),
  ]
  .sort((a,b) => b[1] - a[1])
  .slice(0, 10)
  .map(([topic]) => topic);

  const averageWordCount =
    pages.length === 0
    ? 0
    : Math.round(
      pages.reduce(
        (sum, page) =>
          sum + (page.wordCount ?? 0),
        0
      ) / pages.length
    );

  return {
    competitorsAnalyzed: pages.length,
    competitorTopics,
    averageWordCount,
    recommendedWordCount:
      Math.max(1000, averageWordCount),
    recommendedOutline:
    competitorTopics.map((topic) => ({
      level: 'h2',
      title: topic,
      rationale:
        'Topic appears in competitor content.',
    })),
  };
}

function normalizeHeading(
  heading: string
): string {
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
    rationale: string
  }[];
  targetWordCount: number;
}

export async function analyzeContentGaps(
  targetKeyword: string,
  competitorUrls: string[]
): Promise<ContentGapAnalysisResult> {
  const pages: any[] = [];

  for(const url of competitorUrls.slice(0, 5)) {
    try {
      const pageData = await extractCompetitorPage(url);
      pages.push({
        url: pageData.url,
        wordCount: pageData.wordCount,
        headings: {
          h1: pageData.h1,
          h2: pageData.h2,
          h3: pageData.h3,
        },
      });
    } catch(err) {
      console.warn(`Could not analyze content gap for ${url}:`,err);
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

export const startContentResearch = async (
  { keyword }: { keyword: string },
  context: any
) => {
  if (!context.user) {
    throw new Error('Not authenticated');
  }

  const organizationId =
    context.user.activeOrganizationId;

  if (!organizationId) {
    throw new Error('No active organization');
  }

  const normalizedKeyword = keyword.trim();

  if (!normalizedKeyword) {
    throw new Error('Keyword is required');
  }

  // Find existing keyword
  let seoKeyword =
    await context.entities.SEOKeyword.findFirst({
      where: {
        keyword: normalizedKeyword,
        organizationId,
      },
    });

  // Create it if it doesn't exist
  if (!seoKeyword) {
    seoKeyword =
      await context.entities.SEOKeyword.create({
        data: {
          organizationId,
          keyword: normalizedKeyword,
          selected: false,
        },
      });
  }

  // Create research
  const research =
    await context.entities.ContentResearch.create({
      data: {
        organization: {
          connect: {
            id: organizationId,
          },
        },

        keyword: {
          connect: {
            id: seoKeyword.id,
          },
        },

        status: 'PENDING',
      },
    });

  // Start background job
  await runContentResearch.submit({
    researchId: research.id,
  });

  return research;
};



export async function performContentResearch(
  researchId: string,
  context: any
) {
  const research = await context.entities.ContentResearch.findUnique({
    where: { id: researchId },
    include: {
      keyword: true,
    },
  });

  if (!research) {
    throw new Error('Content research not found');
  }

  await context.entities.ContentResearch.update({
    where: { id: researchId },
    data: {
      status: 'RUNNING',
    },
  });

  try {
    const keyword = research.keyword.keyword;

    //SERP
    const serpResults = await searchDuckDuckGo(keyword, 15);

    console.log("SERP results: "+serpResults);

    //Filter to relevant competitors
    const competitors =
      filterSERPResults(
        serpResults,
        undefined
      );
    console.log("Competitors: "+competitors);

    const competitorPages = 
      await crawlCompetitorPages(
        competitors,
        context
      );
    console.log("CompetitorPages: "+JSON.stringify(competitorPages, null, 2));

    const analysis =
      analyzeCompetitorContent(
        competitorPages,
        keyword
      );
    console.log("AnalyzeCompetitorContent: "+JSON.stringify(analysis, null, 2));


    const wdfIdfAnalysisOutput = analyzeWdfIdf(competitorPages);
    console.log("WDF-IDF Analysis "+JSON.stringify(wdfIdfAnalysisOutput, null, 2));

    // 5. Save research
    await context.entities.ContentResearch.update({
      where: { id: researchId },
      data: {
        status: 'COMPLETED',

        serpResults,

        competitorPages: competitorPages.map((page) => ({
          url: page.url,
          title: page.title,
          metaDescription: page.metaDescription,
          headings: page.headings,
          text: page.text,
          wordCount: page.wordCount,
        })),

        contentGaps: analysis.competitorTopics,

        recommendedOutline: analysis.recommendedOutline,

        wdfIdfAnalysis: wdfIdfAnalysisOutput ?? null,
      },
    });



    return analysis;
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

interface WdfIdfTerm {
  term: string;
  idf: number;
  averageScore: number;
  minScore: number;
  maxScore: number;
  competitors: number;
}

export function analyzeWdfIdf(
  pages: { text: string }[]
): WdfIdfTerm[] {
  const documents = pages.map((page) =>
    tokenize(page.text)
  );

  const N = documents.length;

  if (N === 0) {
    return [];
  }

  // How many documents contain each term?
  const documentFrequency = new Map<string, number>();

  for (const document of documents) {
    const uniqueTerms = new Set(document);

    for (const term of uniqueTerms) {
      documentFrequency.set(
        term,
        (documentFrequency.get(term) ?? 0) + 1
      );
    }
  }

  const scores = new Map<
    string,
    {
      idf: number;
      scores: number[];
    }
  >();

  for (const document of documents) {
    const counts = new Map<string, number>();

    for (const term of document) {
      counts.set(term, (counts.get(term) ?? 0) + 1);
    }

    for (const [term, count] of counts) {
      const wdf = count / document.length;

      const df = documentFrequency.get(term) ?? 0;

      const idf = Math.log(N / (1 + df));

      const score = wdf * idf;

      if (!scores.has(term)) {
        scores.set(term, {
          idf,
          scores: [],
        });
      }

      scores.get(term)!.scores.push(score);
    }
  }

  return [...scores.entries()]
    .map(([term, data]) => ({
      term,
      idf: data.idf,
      averageScore:
        data.scores.reduce(
          (sum, value) => sum + value,
          0
        ) / data.scores.length,
      minScore: Math.min(...data.scores),
      maxScore: Math.max(...data.scores),
      competitors: data.scores.length,
    }))
    .sort((a, b) => b.averageScore - a.averageScore)
    .slice(0, 100);
}

const STOPWORDS = new Set([
  'i', 'ili', 'a', 'ali', 'da', 'je', 'su', 'se', 'sa', 'za', 'od',
  'do', 'u', 'na', 'o', 'po', 'iz', 'kod', 'ka', 'uz', 'bez',
  'kao', 'što', 'koji', 'koja', 'koje', 'ko', 'to', 'taj', 'ta',
  'te', 'ovaj', 'ova', 'ovo', 'biti', 'bio', 'bila', 'bilo',
  'ima', 'imao', 'imati', 'može', 'mogu', 'možeš',

  'the', 'and', 'or', 'but', 'for', 'with', 'from', 'that', 'this',
  'these', 'those', 'are', 'was', 'were', 'is', 'be', 'to', 'of',
  'in', 'on', 'at', 'by', 'as', 'an', 'a', 'it', 'its', 'can',
]);

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .split(/\s+/)
    .filter((word) => word.length >= 3)
    .filter((word) => !STOPWORDS.has(word));
}