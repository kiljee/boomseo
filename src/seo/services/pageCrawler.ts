import * as cheerio from 'cheerio';
import { Readability } from '@mozilla/readability';
import { JSDOM } from 'jsdom';

export interface PageHeadings {
  h1: string[];
  h2: string[];
  h3: string[];
}

export interface CompetitorPageData {
  url: string;
  title: string;
  metaDescription: string;
  headings: PageHeadings;
  h1: string[];
  h2: string[];
  h3: string[];
  text: string;
  wordCount: number;
}

const LIBRECRAWL_BASE_URL = (
  process.env.LIBRECRAWL_URL || 'http://localhost:5000'
).replace(/\/+$/, '');

const DIRECT_FETCH_TIMEOUT_MS = 10_000;
const LIBRECRAWL_TIMEOUT_MS = 25_000;

const BOILERPLATE_SELECTORS = [
  'script',
  'style',
  'noscript',
  'template',
  'svg',
  'canvas',

  'nav',
  'footer',
  'header',
  'aside',
  'form',
  'button',
  'input',
  'select',
  'textarea',

  '[role="navigation"]',
  '[role="banner"]',
  '[role="contentinfo"]',
  '[aria-hidden="true"]',

  '.cookie',
  '.cookies',
  '.cookie-banner',
  '.cookie-consent',
  '.popup',
  '.modal',
  '.newsletter',
  '.advertisement',
  '.advertising',
  '.ads',
  '.sidebar',
  '.social-share',
  '.social-sharing',
  '.related-posts',
  '.related-articles',
  '.comments',
  '#comments',
  '.menu',
  '.navbar',
  '.navigation',
  '.nav',
  '.header',
  '.footer',
  '.breadcrumb',
  '.breadcrumbs',
  '.pagination',
  '.related',
  '.recommended',
  '.categories',
  '.category',
  '.tags',
  '.tag',
  '.share',
  '.sharing',
  '.social',
  '.social-links',
  '.search',
  '.search-form',
  '.login',
  '.signup',
  '.account',
  '.mobile-menu',
  '.mobile-navigation',
];

const CONTENT_SELECTORS = [
  'article',
  'main',
  '[role="main"]',
  '.post-content',
  '.entry-content',
  '.article-content',
  '.article-body',
  '.post-body',
  '.content',
];

function getMainContent(
  $: cheerio.CheerioAPI
): cheerio.Cheerio<any> | null {
  const candidates: cheerio.Cheerio<any>[] = [];

  for (const selector of CONTENT_SELECTORS) {
    $(selector).each((_, element) => {
      candidates.push($(element));
    });
  }

  if (candidates.length > 0) {
    let bestCandidate: cheerio.Cheerio<any> | null = null;
    let bestScore = 0;

    for (const candidate of candidates) {
      const paragraphs = candidate.find('p').length;
      const headings = candidate.find(
        'h1, h2, h3, h4'
      ).length;

      const textLength = candidate
        .find('p, li, h1, h2, h3, h4, blockquote')
        .map((_, element) =>
          $(element).text().trim()
        )
        .get()
        .join(' ')
        .length;

      const score =
        textLength +
        paragraphs * 500 +
        headings * 100;

      if (score > bestScore) {
        bestScore = score;
        bestCandidate = candidate;
      }
    }

    if (bestCandidate) {
      return bestCandidate;
    }
  }

  /*
   * Fallback:
   * Use body if no semantic main-content container
   * was found.
   */
  const body = $('body').first();

  if (body.length) {
    return body;
  }

  return null;
}

function extractTextBlocks(
  $: cheerio.CheerioAPI,
  content: cheerio.Cheerio<any>
): string[] {
  return content
    .find(
      'p, h1, h2, h3, h4, blockquote'
    )
    .map((_, element) =>
      getElementText($, element)
    )
    .get()
    .map((text) =>
      text
        .replace(/\s+/g, ' ')
        .trim()
    )
    .filter(isUsefulTextBlock);
}

function extractHeadings(
  $: cheerio.CheerioAPI,
  content: cheerio.Cheerio<any>,
  selector: string
): string[] {
  return content
    .find(selector)
    .map((_, element) => getElementText($, element))
    .get()
    .filter(Boolean);
}

/**
 * Walk direct child nodes so inline elements do not get flattened
 * without spaces (e.g. best<span>contractor</span>).
 */
function getElementText(
  $: cheerio.CheerioAPI,
  element: any
): string {
  const parts: string[] = [];

  $(element).contents().each((_, node) => {
    if (node.type === 'text') {
      const value = $(node).text();

      if (value) {
        parts.push(value);
      }

      return;
    }

    if (node.type === 'tag') {
      const nested = getElementText($, node);

      if (nested) {
        parts.push(nested);
      }
    }
  });

  return parts.join(' ').replace(/\s+/g, ' ').trim();
}

function isUsefulTextBlock(text: string): boolean {
  const words = text.split(/\s+/).filter(Boolean);

  if (words.length < 3) {
    return false;
  }

  // Extremely long unbroken tokens are usually
  // navigation/HTML extraction garbage.
  const longestWord = Math.max(
    ...words.map((word) => word.length)
  );

  if (longestWord > 40) {
    return false;
  }

  // Reject blocks containing excessive concatenated text.
  const longWords = words.filter(
    (word) => word.length > 25
  );

  if (longWords.length > 0) {
    return false;
  }

  return true;
}

/**
 * Calls LibreCrawl's render endpoint to open the page
 * in its existing Playwright environment and return rendered HTML.
 */
async function fetchRenderedHtmlFromLibreCrawl(url: string): Promise<string> {
  const endpoint = `${LIBRECRAWL_BASE_URL}/api/render`;

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ url }),
    signal: AbortSignal.timeout(LIBRECRAWL_TIMEOUT_MS),
  });

  if (!response.ok) {
    throw new Error(
      `LibreCrawl render request failed with status: ${response.status}`
    );
  }

  const data = (await response.json()) as {
    success?: boolean;
    html?: string;
    error?: string;
  };

  if (!data.html) {
    throw new Error(
      data.error || 'LibreCrawl did not return HTML content.'
    );
  }

  return data.html;
}

/**
 * Extracts content from HTML using Cheerio.
 */
function parsePageHtml(
  url: string,
  html: string
): CompetitorPageData {
  const $ = cheerio.load(html);

  const title = $('title')
    .first()
    .text()
    .replace(/\s+/g, ' ')
    .trim();

  const metaDescription =
    $('meta[name="description"]')
      .attr('content')
      ?.replace(/\s+/g, ' ')
      .trim() ?? '';

  let contentApi: cheerio.CheerioAPI = $;
  let content: cheerio.Cheerio<any> | null = null;

  // 1. Extract the main article using Mozilla Readability.
  const dom = new JSDOM(html, { url });

  try {
    console.log("Using Readability");
    const article = new Readability(
      dom.window.document
    ).parse();

    if (
      article?.content &&
      (article.textContent ?? '').trim().split(/\s+/).length >= 40
    ) {
      const article$ = cheerio.load(article.content);

      contentApi = article$;
      content = article$('body').first();

      if (!content.length) {
        content = article$.root() as any;
      }
    }
  } catch (error) {
    console.warn(
      `[PageCrawler] Readability failed for ${url}:`,
      error
    );
  } finally {
    dom.window.close();
  }

  // 2. Fallback to the existing Cheerio extraction.
  if (!content || !content.length) {
    console.log("Fallback to Cheerio");
    contentApi = $;
    content = getMainContent($);

    if (content) {
      content
        .find(BOILERPLATE_SELECTORS.join(','))
        .remove();
    }
  }

  if (!content || !content.length) {
    throw new Error(
      `Could not identify main content for ${url}`
    );
  }

  // 3. Extract headings from the selected content.
  const h1 = extractHeadings(contentApi, content, 'h1');
  const h2 = extractHeadings(contentApi, content, 'h2');
  const h3 = extractHeadings(contentApi, content, 'h3');

  // 4. Extract paragraphs, headings and blockquotes.
  const textBlocks = extractTextBlocks(contentApi, content);

  const text = textBlocks
    .map((block) =>
      block.normalize('NFKC').replace(/\s+/g, ' ').trim()
    )
    .filter(Boolean)
    .join('\n');

  const wordCount = text.split(/\s+/).filter(Boolean).length;

  return {
    url,
    title,
    metaDescription,
    headings: { h1, h2, h3 },
    h1,
    h2,
    h3,
    text,
    wordCount,
  };
}

export async function extractCompetitorPage(
  url: string
): Promise<CompetitorPageData> {
  let html: string | null = null;
  let fetchError: Error | null = null;

  // 1. Try fast direct HTTP fetch first
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36',
        Accept:
          'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Cache-Control': 'no-cache',
      },
      redirect: 'follow',
      signal: AbortSignal.timeout(DIRECT_FETCH_TIMEOUT_MS),
    });

    if (response.ok) {
      const contentType = response.headers.get('content-type') ?? '';
      if (contentType.includes('text/html')) {
        html = await response.text();
      }
    }
  } catch (err: any) {
    fetchError = err;
  }

  // 2. Parse direct fetch result if available
  if (html) {
    try {
      const parsedData = parsePageHtml(url, html);

      // If page had sufficient content (>100 words), direct fetch succeeded
      if (parsedData.wordCount >= 100) {
        return parsedData;
      }

      console.log(
        `[PageCrawler] Direct fetch of ${url} returned an empty shell (${parsedData.wordCount} words). Falling back to LibreCrawl Playwright...`
      );
    } catch {
      // Content extraction on direct HTML failed; fall through to LibreCrawl
    }
  } else {
    console.log(
      `[PageCrawler] Direct fetch failed for ${url} (${fetchError?.message || 'blocked/timeout'}). Delegating to LibreCrawl Playwright...`
    );
  }

  // 3. Fallback: Delegate rendering to LibreCrawl's Playwright instance
  const renderedHtml = await fetchRenderedHtmlFromLibreCrawl(url);
  const renderedData = parsePageHtml(url, renderedHtml);

  if (renderedData.wordCount < 60) {
    throw new Error(
      `Not enough meaningful content on ${url} even after Playwright render (${renderedData.wordCount} words)`
    );
  }

  return renderedData;
}