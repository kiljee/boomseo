/*import { searchDuckDuckGo } from './searchEngineService';
import { filterSERPResults } from './searchEngineService';
import { crawlCompetitorPages } from './competitorResearch';
import { analyzeCompetitorContent } from './competitorResearch';

export async function testCompetitorResearch() {
  const keyword = 'best seo tools';

  console.log(`Searching SERP for: "${keyword}"`);

  const serpResults = await searchDuckDuckGo(keyword, 10);

  console.log('SERP results:', serpResults);

  const competitors = filterSERPResults(
    serpResults
  ).slice(0, 5);

  console.log('Competitors:', competitors);

  const pages = await crawlCompetitorPages(
    competitors
  );

  console.log('Crawled pages:', pages);

  const analysis = analyzeCompetitorContent(
    pages,
    keyword
  );

  console.log('Analysis:', analysis);

  return analysis;
}

await testCompetitorResearch();*/