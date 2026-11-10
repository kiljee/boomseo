import {
  searchSERP,
  filterSERPResults,
  type SERPResult,
  type SERPOptions,
} from './serpService';
import { crawlCompetitorPages } from './contentResearchService';
import { analyzeWdfIdf } from '../utils/wdfidf';
import type { CompetitorPageData } from './pageCrawler';
import { resolveLanguageFromCountry, buildGeoTargetedQuery } from '../utils/geoUtils';
import { writeFile } from 'node:fs/promises';
import path from 'node:path';

export interface WdfIdfPipelineOptions {
  targetCountry?: string;
  targetState?: string;
  device?: 'desktop' | 'mobile';
}

export interface WdfIdfPipelineResult {
  serpResults: SERPResult[];
  competitorPages: CompetitorPageData[];
  wdfIdf: any;
}

export async function performWdfIdfAnalysis(
  keyword: string,
  context: any,
  options?: WdfIdfPipelineOptions
): Promise<WdfIdfPipelineResult> {
  // 1. Resolve language from target country (e.g. "RS" -> "sr", "DE" -> "de", "US" -> "en")
  const targetCountry = (options?.targetCountry || 'US').toUpperCase();
  const lang = resolveLanguageFromCountry(targetCountry);
  const device = options?.device || 'desktop';

  // 2. Build local query if city/state is provided (e.g., "najbolji majstor" + "Beograd")
  const searchQuery = buildGeoTargetedQuery(keyword, options?.targetState);

  const serpOptions: SERPOptions = {
    country: targetCountry,
    lang,
    device,
  };

  console.log(
    `[WdfIdfService] 1/4 Fetching search engine results for: "${searchQuery}" [Country: ${targetCountry}, Lang: ${lang}, Device: ${device}]`
  );

  const serpResults = await searchSERP(searchQuery, 15, 'openserp', serpOptions);

  const filteredResults = filterSERPResults(serpResults);
  console.log(
    `[WdfIdfService] 2/4 Found ${filteredResults.length} organic competitor pages to crawl`
  );

  if (filteredResults.length === 0) {
    throw new Error(
      `No organic search competitors found for query: "${searchQuery}"`
    );
  }

  console.log(`[WdfIdfService] 3/4 Crawling competitor content...`);
  const competitorPages = await crawlCompetitorPages(filteredResults, context);

  // Save crawled output for debugging
  const outputPath = path.join(process.cwd(), 'wdf-idf-crawl-debug.txt');

  await writeFile(
    outputPath,
    competitorPages
      .map((page, index) => {
        return `
  ${'='.repeat(100)}
  PAGE ${index + 1}
  ${'='.repeat(100)}

  ${JSON.stringify(page, null, 2)}
  `;
      })
      .join('\n\n'),
    'utf-8'
  );

  console.log(`Saved ${competitorPages.length} pages to ${outputPath}`);

  if (!competitorPages || competitorPages.length === 0) {
    throw new Error(`Failed to crawl content from any competitor pages.`);
  }

  console.log(
    `[WdfIdfService] 4/4 Computing WDF-IDF scores across ${competitorPages.length} pages (Language: ${lang})...`
  );

  // Pass resolved language so analyzeWdfIdf loads the matching language dictionary (e.g. Serbian, German, English)
  const wdfIdf = analyzeWdfIdf(competitorPages, lang);

  return {
    serpResults: filteredResults,
    competitorPages,
    wdfIdf,
  };
}