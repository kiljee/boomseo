import { SERPProvider, SERPResult, SERPOptions } from './serpService';

interface OpenSERPItem {
  id?: string;
  rank?: number;
  title: string;
  url: string;
  description?: string;
  snippet?: string;
}

interface OpenSERPResponse {
  results?: OpenSERPItem[];
  [key: string]: any;
}

const DESKTOP_USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';

const MOBILE_USER_AGENT =
  'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1';

export class OpenSERPProvider implements SERPProvider {
  readonly name = 'openserp';
  private readonly baseUrl: string;
  private readonly engine: 'bing' | 'google' | 'duckduckgo' | 'mega' | 'yandex';

  constructor(
    baseUrl = process.env.OPENSERP_URL || 'http://localhost:7000',
    // Default to 'bing' or 'mega' since Bing is much more resilient to cloud IP bans than Google
    engine: 'bing' | 'google' | 'duckduckgo' | 'mega' | 'yandex' = 'mega'
  ) {
    this.baseUrl = baseUrl.replace(/\/+$/, '');
    this.engine = engine;
  }

  async search(
    query: string,
    limit = 10,
    options?: SERPOptions
  ): Promise<SERPResult[]> {
    const country = (options?.country || 'US').toUpperCase();
    const lang = (options?.lang || 'en').toLowerCase();
    const isMobile = options?.device === 'mobile';

    // Construct query parameters including location and language
    const queryParams = new URLSearchParams({
      text: query,
      limit: String(limit),
      country,
      lang,
    });

    const url = `${this.baseUrl}/${this.engine}/search?${queryParams.toString()}`;

    console.log(
      `[OpenSERPProvider] Querying ${this.engine} [Geo: ${country}, Lang: ${lang}, Device: ${
        isMobile ? 'mobile' : 'desktop'
      }]: "${query}"`
    );

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'User-Agent': isMobile ? MOBILE_USER_AGENT : DESKTOP_USER_AGENT,
      },
      signal: AbortSignal.timeout(35_000),
    });

    if (!response.ok) {
      throw new Error(`OpenSERP (${this.engine}) returned HTTP ${response.status}`);
    }

    const json = (await response.json()) as OpenSERPResponse | OpenSERPItem[];

    // OpenSERP returns `{ results: [...] }` or a direct array depending on endpoint version
    const rawItems: OpenSERPItem[] = Array.isArray(json)
      ? json
      : Array.isArray(json.results)
      ? json.results
      : [];

    if (rawItems.length === 0) {
      return [];
    }

    return rawItems
      .filter((item) => item.url && item.url.startsWith('http'))
      .slice(0, limit)
      .map((item, index) => ({
        position: item.rank ?? index + 1,
        title: (item.title || '').trim(),
        url: (item.url || '').trim(),
        snippet: (item.snippet || item.description || '').trim(),
      }));
  }
}

export async function searchOpenSERP(
  query: string,
  limit = 10,
  options?: SERPOptions
): Promise<SERPResult[]> {
  const provider = new OpenSERPProvider();
  return provider.search(query, limit, options);
}