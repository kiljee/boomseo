import * as cheerio from 'cheerio';
import { crawlSiteWithoutSitemap, DiscoveredPage } from './sitemapService';

export interface CompetitorHeadingData {
	url: string;
	h1: string[];
	h2: string[];
}

export interface ContentGapAnalysisResult {
	competitorsAnalyzed: number;
	extractedH1s: string[];
	extractedH2s: string[];
	contentGaps: string[];
	recommendedOutline: {
		level: 'h2' | 'h3';
		title: string;
		rationale: string;
	}[];
	targetWordCount: number;
}

export async function extractCompetitorHeadings(
	competitorUrls: string[]
): Promise<CompetitorHeadingData[]> {
	const results: CompetitorHeadingData[] = [];

	for (const url of competitorUrls.slice(0, 5)) { // Limit to top 5 ompetitors
		try {
		  const pages: DiscoveredPage[] = await crawlSiteWithoutSitemap(url,
		5);
		  
		  for (const page of pages.slice(0, 3)) {
		    const response = await fetch(page.url, {
				headers: {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'}
			});

		    if (!response.ok) continue;

		    const html = await response.text();
		    const $ = cheerio.load(html);

		    const h1s = $('h1').map((_, el) => $(el).text().trim()).get().
		filter(Boolean);
		    const h2s = $('h2').map((_, el) => $(el).text().trim()).get().
		filter((text) => text.length > 3);

		    results.push({
		      url: page.url,
		      h1: h1s,
		      h2: h2s,
		    });
		  }
		} catch (err) {
		  console.warn(`Could not extract headings from competitor ${url}:`,
		err);
		}
	}

	return results;
}

/**
 * Analyzes competitor headings against a target keyword to find missing content gaps
 * */

export async function analyzeContentGaps(
      targetKeyword: string,
      competitorUrls: string[]
    ): Promise<ContentGapAnalysisResult> {
      const competitorData = await extractCompetitorHeadings(competitorUrls);
    
      const allH1s: string[] = [];
      const allH2s: string[] = [];
    
      competitorData.forEach((data) => {
        allH1s.push(...data.h1);
        allH2s.push(...data.h2);
      });
    
      // Normalize and deduplicate headings
      const uniqueH2s = Array.from(new Set(allH2s.map((h) => h.
  toLowerCase())));
    
      // Identify common sub-topics across competitors (Content Gaps)
      const keywordTerms = targetKeyword.toLowerCase().split(/\s+/);
      
      // Find topics competitors discuss that are related to secondary angles
      const contentGaps = uniqueH2s.filter((h2) => {
        const isGeneric = /related|comments|footer|share|about|recent/i.
  test(h2);
        return !isGeneric && h2.length > 10;
      }).slice(0, 8);
    
      // Build an SEO-optimized heading outline bridging the content gaps
      const recommendedOutline = [
        { level: 'h2' as const, title: `What is ${targetKeyword}?`,
  rationale: 'Core definition and target search intent' },
        ...contentGaps.slice(0, 4).map((gap) => ({
          level: 'h2' as const,
          title: gap.charAt(0).toUpperCase() + gap.slice(1),
          rationale: 'Identified as a critical competitor content gap',
        })),
        { level: 'h2' as const, title: `Key Benefits & Use Cases`, rationale:
  'Drives user engagement and conversion' },
        { level: 'h2' as const, title: `Frequently Asked Questions (FAQ)`,
  rationale: 'Targets Google "People Also Ask" SERP snippets' },
      ];
    
      return {
        competitorsAnalyzed: competitorData.length,
        extractedH1s: Array.from(new Set(allH1s)),
        extractedH2s: Array.from(new Set(allH2s)),
        contentGaps,
        recommendedOutline,
        targetWordCount: Math.max(1500, contentGaps.length * 300),
      };
    }

