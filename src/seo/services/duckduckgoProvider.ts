import * as cheerio from 'cheerio';
import type { SERPProvider, SERPResult } from './serpService';

const DDG_LITE_URL = 'https://lite.duckduckgo.com/lite/';
const REQUEST_TIMEOUT_MS = 12_000;

export class DuckDuckGoProvider implements SERPProvider {
  readonly name = 'duckduckgo' as const;

  async search(query: string, limit = 10): Promise<SERPResult[]> {
    const trimmed = query.trim();

    if (!trimmed) {
      throw new Error('Search query is empty');
    }

    if (limit < 1) {
      return [];
    }

    const body = new URLSearchParams({ q: trimmed });

    const response = await fetch(DDG_LITE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
        Accept: 'text/html,application/xhtml+xml',
        Referer: 'https://lite.duckduckgo.com/',
      },
      body,
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });

    if (!response.ok) {
      throw new Error(`DuckDuckGo request failed with status: ${response.status}`);
    }

    const html = await response.text();

    const $ = cheerio.load(html);

	console.log('[DDG Lite] HTML length:', html.length);
	console.log('[DDG Lite] result-link count:', $('.result-link').length);
	console.log('[DDG Lite] result-link anchors:', $('a.result-link').length);
	console.log('[DDG Lite] page title:', $('title').text().trim());
	console.log('[DDG Lite] HTML preview:', html.slice(0, 1000));

    if (
      html.includes('anomaly-modal') ||
      html.includes('bots use duckduckgo') ||
      html.includes('challenge-form')
    ) {
      throw new Error('DuckDuckGo rate-limited your IP address.');
    }

    const results = parseDuckDuckGoLiteResults(html, limit);

    if (results.length === 0) {
      throw new Error(`DuckDuckGo returned 0 results for "${trimmed}"`);
    }

    return results;
  }
}

/**
 * Parses organic results from DuckDuckGo Lite HTML layout.
 */
export function parseDuckDuckGoLiteResults(
  html: string,
  limit = 10
): SERPResult[] {
  const $ = cheerio.load(html);
  const results: SERPResult[] = [];
  const seen = new Set<string>();

  $('.result-link').each((_, element) => {
  	const item = $(element);

	const link = item.is('a')
	  ? item
	  : item.find('a').first();
    const title = link.text().trim();
    const href = link.attr('href');

    if (!title || !href) return;

    const url = extractResultUrl(href);
    if (!url || seen.has(url)) return;

    seen.add(url);

    // The snippet is in the next sibling <tr>
    const snippetRow = $(element).closest('tr').next('tr');
    const snippet = snippetRow.find('.result-snippet').text().trim();

    results.push({
      position: results.length + 1,
      title,
      url,
      snippet,
    });
  });

  return results.slice(0, limit);
}

/**
 * Parses results from standard DuckDuckGo HTML layout.
 */
export function parseDuckDuckGoResults(html: string): SERPResult[] {
  const $ = cheerio.load(html);
  const results: SERPResult[] = [];
  const seen = new Set<string>();

  $('.result').each((_, element) => {
    const item = $(element);
    if (item.hasClass('result--ad') || item.hasClass('result--ads')) return;

    const link = item.find('.result__a').first();
    const title = link.text().trim();
    const href = link.attr('href');

    if (!title || !href) return;

    const url = extractResultUrl(href);
    if (!url || seen.has(url)) return;

    seen.add(url);

    results.push({
      position: results.length + 1,
      title,
      url,
      snippet: item.find('.result__snippet').first().text().trim(),
    });
  });

  return results;
}

function extractResultUrl(href: string): string | null {
  try {
    const absoluteHref = href.startsWith('//')
      ? `https:${href}`
      : href;
    const url = new URL(absoluteHref, 'https://lite.duckduckgo.com/');
    const redirectedUrl = url.searchParams.get('uddg');
    const candidate =
      redirectedUrl ??
      (url.hostname.endsWith('duckduckgo.com') ? null : url.href);

    if (!candidate) return null;

    const parsed = new URL(candidate);
    if (!['http:', 'https:'].includes(parsed.protocol)) return null;

    return parsed.href;
  } catch {
    return null;
  }
}

export async function searchDuckDuckGo(
  query: string,
  limit = 10
): Promise<SERPResult[]> {
  return new DuckDuckGoProvider().search(query, limit);
}