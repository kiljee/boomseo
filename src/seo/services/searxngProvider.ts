import * as cheerio from 'cheerio';
import type { SERPProvider, SERPResult } from './serpService';

/**
 * Public SearXNG instances used when no custom self-hosted instance is set.
 * If you set SEARXNG_URL in your .env, that instance will always be preferred.
 */
const FALLBACK_INSTANCES = [
  'https://searx.tiekoetter.com',
  'https://search.ononoki.org',
  'https://priv.au',
  'https://searx.work',
];

const REQUEST_TIMEOUT_MS = 12_000;

const CLOUDFLARE_BLOCK_MARKERS = [
  'just a moment...',
  'challenge-platform',
  'attention required!',
  'cloudflare-static',
  'cf-browser-verification',
];

interface SearXNGResultItem {
  url: string;
  title: string;
  content?: string;
  score?: number;
}

interface SearXNGResponse {
  results?: SearXNGResultItem[];
}

export class SearXNGProvider implements SERPProvider {
  readonly name = 'searxng' as const;
  private readonly instances: string[];

  constructor(customBaseUrl?: string) {
    const configuredUrl = customBaseUrl || process.env.SEARXNG_URL;
    if (configuredUrl) {
      this.instances = [configuredUrl.replace(/\/+$/, '')];
    } else {
      this.instances = FALLBACK_INSTANCES;
    }
  }

  async search(query: string, limit = 10): Promise<SERPResult[]> {
    const trimmed = query.trim();

    if (!trimmed) {
      throw new Error('Search query is empty');
    }

    if (limit < 1) {
      return [];
    }

    let lastError: Error | null = null;

    // Try instances in the pool until one successfully returns organic results
    for (const baseUrl of this.instances) {
      try {
        console.log(`[SearXNGProvider] Querying instance: ${baseUrl}`);
        const results = await this._searchInstance(baseUrl, trimmed, limit);

        if (results && results.length > 0) {
          console.log(`[SearXNGProvider] Retrieved ${results.length} results from ${baseUrl}`);
          return results;
        }
      } catch (err: any) {
        lastError = err;
        console.warn(
          `[SearXNGProvider] Instance ${baseUrl} failed: ${err.message}. Trying next instance...`
        );
      }
    }

    throw new Error(
      `All SearXNG instances failed or were blocked by bot challenges. Last error: ${
        lastError?.message || 'No organic results found'
      }`
    );
  }

  private async _searchInstance(
    baseUrl: string,
    query: string,
    limit: number
  ): Promise<SERPResult[]> {
    const targetUrl = new URL(`${baseUrl}/search`);
    targetUrl.searchParams.set('q', query);
    targetUrl.searchParams.set('format', 'json');
    targetUrl.searchParams.set('categories', 'general');

    const response = await fetch(targetUrl.toString(), {
      method: 'GET',
      headers: {
        Accept: 'text/html,application/xhtml+xml,application/json,*/*;q=0.9',
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
      },
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });

    if (!response.ok) {
      throw new Error(
        `HTTP ${response.status} ${response.statusText}`
      );
    }

    const contentType = response.headers.get('content-type') ?? '';
    const rawText = await response.text();

    // Check if Cloudflare or a bot protection page intercepted the request
    const lowerText = rawText.toLowerCase();
    if (CLOUDFLARE_BLOCK_MARKERS.some((marker) => lowerText.includes(marker))) {
      throw new Error('Instance is protected by Cloudflare bot challenge');
    }

    // 1. Parse JSON if the instance supports it
    if (
      contentType.includes('application/json') ||
      rawText.trim().startsWith('{')
    ) {
      try {
        const data = JSON.parse(rawText) as SearXNGResponse;
        if (data.results && Array.isArray(data.results)) {
          return data.results.slice(0, limit).map((item, index) => ({
            position: index + 1,
            title: item.title,
            url: item.url,
            snippet: item.content ?? '',
          }));
        }
      } catch {
        // Fall back to HTML parsing if JSON parse fails
      }
    }

    // 2. Parse HTML if the instance returned a standard web page
    const htmlResults = parseSearXNGHtmlResults(rawText);

    if (htmlResults.length > 0) {
      return htmlResults.slice(0, limit);
    }

    throw new Error('No organic results found in page HTML');
  }
}

/**
 * Parses organic search results from SearXNG HTML responses
 * across themes (simple, oscar, classic).
 */
export function parseSearXNGHtmlResults(html: string): SERPResult[] {
  const $ = cheerio.load(html);
  const results: SERPResult[] = [];
  const seen = new Set<string>();

  $('article.result, .result').each((_, element) => {
    const item = $(element);

    if (item.hasClass('infobox') || item.hasClass('result--ad')) {
      return;
    }

    const link = item
      .find('h3 a, h4 a, .result-header a, .result__title a, .result_header a')
      .first();

    const title = link.text().trim();
    let href = link.attr('href');

    if (!href) {
      href = item.find('a[href^="http"]').first().attr('href');
    }

    if (!title || !href) {
      return;
    }

    const url = normalizeUrl(href);
    if (!url || seen.has(url)) {
      return;
    }

    seen.add(url);

    const snippet = item
      .find('.result-content, .content, .result__snippet, p.content, p')
      .first()
      .text()
      .trim();

    results.push({
      position: results.length + 1,
      title,
      url,
      snippet,
    });
  });

  return results;
}

function normalizeUrl(rawUrl: string): string | null {
  try {
    const parsed = new URL(rawUrl);

    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return null;
    }

    return parsed.href;
  } catch {
    return null;
  }
}

/** Convenience function that wraps the class for callers that prefer a function API. */
export async function searchSearXNG(
  query: string,
  limit = 10,
  baseUrl?: string
): Promise<SERPResult[]> {
  return new SearXNGProvider(baseUrl).search(query, limit);
}