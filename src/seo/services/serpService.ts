import {
  DuckDuckGoProvider,
  parseDuckDuckGoLiteResults,
  parseDuckDuckGoResults,
} from './duckduckgoProvider';
import { SearXNGProvider } from './searxngProvider';
import { OpenSERPProvider } from './openserpProvider';

export interface SERPResult {
  position: number;
  title: string;
  url: string;
  snippet: string;
}

export interface SERPOptions {
  country?: string;
  lang?: string;
  device?: 'desktop' | 'mobile';
}

export interface SERPProvider {
  readonly name: string;
  search(query: string, limit?: number, options?: SERPOptions): Promise<SERPResult[]>;
}

export type SERPProviderName = 'openserp' | 'duckduckgo' | 'searxng';

export {
  DuckDuckGoProvider,
  parseDuckDuckGoLiteResults,
  parseDuckDuckGoResults,
  searchDuckDuckGo,
} from './duckduckgoProvider';

export { SearXNGProvider, searchSearXNG } from './searxngProvider';
export { OpenSERPProvider, searchOpenSERP } from './openserpProvider';

const LIBRECRAWL_BASE_URL = (
  process.env.LIBRECRAWL_URL || 'http://localhost:5000'
).replace(/\/+$/, '');

export function createSERPProvider(name: SERPProviderName): SERPProvider {
  switch (name) {
    case 'openserp':
      return new OpenSERPProvider();
    case 'duckduckgo':
      return new DuckDuckGoProvider();
    case 'searxng':
      return new SearXNGProvider();
    default: {
      const _never: never = name;
      throw new Error(`Unknown SERP provider: ${String(_never)}`);
    }
  }
}

/**
 * Ultimate Fallback: Opens search inside LibreCrawl's Playwright instance
 * when raw HTTP scrapers are blocked by IP bot limits.
 */
async function searchWithLibreCrawl(
  query: string,
  limit = 10
): Promise<SERPResult[]> {
  const searchUrl = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`;

  console.log(`[searchSERP] Delegating blocked search to LibreCrawl Playwright for: "${query}"...`);

  const response = await fetch(`${LIBRECRAWL_BASE_URL}/api/render`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url: searchUrl }),
    signal: AbortSignal.timeout(25_000),
  });

  if (!response.ok) {
    throw new Error(`LibreCrawl returned HTTP ${response.status}`);
  }

  const data = (await response.json()) as {
    success?: boolean;
    html?: string;
    error?: string;
  };

  if (!data.html) {
    throw new Error(data.error || 'LibreCrawl did not return HTML content.');
  }

  let results = parseDuckDuckGoResults(data.html);

  if (results.length === 0) {
    results = parseDuckDuckGoLiteResults(data.html, limit);
  }

  if (results.length === 0) {
    throw new Error('LibreCrawl rendered DuckDuckGo, but no organic results were found.');
  }

  return results.slice(0, limit);
}

/**
 * Multi-Tier Search Pipeline:
 * 1. OpenSERP (Local Go binary/container - fast, clean JSON, geo & device support)
 * 2. DuckDuckGo / SearXNG (HTTP scrapers)
 * 3. LibreCrawl Playwright (Ultimate headless fallback)
 */
export async function searchSERP(
  query: string,
  limit = 10,
  preferredProvider: SERPProviderName = 'openserp',
  options?: SERPOptions
): Promise<SERPResult[]> {
  // Ordered provider fallback chain starting with user's preferred provider
  const candidateProviders: SERPProviderName[] = [
    preferredProvider,
    ...(['openserp', 'duckduckgo', 'searxng'] as SERPProviderName[]).filter(
      (p) => p !== preferredProvider
    ),
  ];

  // Try each API/HTTP provider in sequence
  for (let i = 0; i < candidateProviders.length; i++) {
    const providerName = candidateProviders[i];
    const tierNumber = i + 1;

    try {
      console.log(`[searchSERP] Trying Tier ${tierNumber} (${providerName})...`);
      const provider = createSERPProvider(providerName);
      const results = await provider.search(query, limit, options);

      if (results && results.length > 0) {
        return results;
      }
    } catch (err: any) {
      console.warn(`[searchSERP] Tier ${tierNumber} (${providerName}) failed: ${err.message}`);
    }
  }

  // Final Tier: Fallback to LibreCrawl Playwright
  try {
    console.log(`[searchSERP] All API tiers failed. Activating Final Tier: LibreCrawl Playwright...`);
    return await searchWithLibreCrawl(query, limit);
  } catch (err: any) {
    console.error(`[searchSERP] All search tiers failed:`, err.message);
    throw new Error(`Could not fetch search results: ${err.message}`);
  }
}

const EXCLUDED_HOSTS = [
  'youtube.com',
  'youtu.be',
  'reddit.com',
  'facebook.com',
  'fb.com',
  'instagram.com',
  'linkedin.com',
  'twitter.com',
  'x.com',
  'pinterest.com',
  'tiktok.com',
];

export function filterSERPResults(
  results: SERPResult[],
  ownDomain?: string
): SERPResult[] {
  return results.filter((result) => {
    try {
      const parsedUrl = new URL(result.url);

      if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
        return false;
      }

      if (ownDomain && hostnameMatchesDomain(parsedUrl.hostname, ownDomain)) {
        return false;
      }

      if (isExcludedHost(parsedUrl.hostname)) {
        return false;
      }

      return true;
    } catch {
      return false;
    }
  });
}

function hostnameMatchesDomain(hostname: string, domain: string): boolean {
  const host = normalizeHostname(hostname);
  const root = normalizeHostname(domain);

  if (!host || !root) return false;
  return host === root || host.endsWith(`.${root}`);
}

function isExcludedHost(hostname: string): boolean {
  const host = normalizeHostname(hostname);
  return EXCLUDED_HOSTS.some(
    (blocked) => host === blocked || host.endsWith(`.${blocked}`)
  );
}

function normalizeHostname(value: string): string {
  return value.trim().toLowerCase().replace(/^www\./, '');
}