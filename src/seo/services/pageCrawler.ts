import * as cheerio from 'cheerio';

export interface CompetitorPageData {
  url: string;
  title: string;
  metaDescription: string;
  h1: string[];
  h2: string[];
  h3: string[];
  text: string;
  wordCount: number;
}

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
    .map((_, element) =>
      $(element)
        .text()
        .replace(/\s+/g, ' ')
        .trim()
    )
    .get()
    .filter(Boolean);
}

function getElementText(
  $: cheerio.CheerioAPI,
  element: any
): string {
  return $(element)
    .contents()
    .map((_, node) => {
      if (node.type === 'text') {
        return $(node).text();
      }

      if (node.type === 'tag') {
        return ` ${$(node).text()} `;
      }

      return '';
    })
    .get()
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim();
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

export async function extractCompetitorPage(
  url: string
): Promise<CompetitorPageData> {
  const response = await fetch(url, {
	  headers: {
	    'User-Agent':
	      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36',
	    'Accept':
	      'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
	    'Accept-Language': 'en-US,en;q=0.9',
	    'Accept-Encoding': 'gzip, deflate, br',
	    'Cache-Control': 'no-cache',
	  },
	  redirect: 'follow',
	});
  
  if (!response.ok) {
    throw new Error(
      `Failed to fetch ${url}: ${response.status}`
    );
  }

  const contentType =
    response.headers.get('content-type') ?? '';

  if (!contentType.includes('text/html')) {
    throw new Error(
      `Not an HTML page: ${url}`
    );
  }

  const html = await response.text();
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

  const content = getMainContent($);

  if (!content) {
    throw new Error(
      `Could not identify main content for ${url}`
    );
  }

  // Remove navigation, ads, popups, comments, etc.
  content
    .find(BOILERPLATE_SELECTORS.join(','))
    .remove();

  const h1 = extractHeadings(
    $,
    content,
    'h1'
  );

  const h2 = extractHeadings(
    $,
    content,
    'h2'
  );

  const h3 = extractHeadings(
    $,
    content,
    'h3'
  );

  /*
   * Extract individual text blocks rather than
   * calling content.text() directly.
   *
   * This prevents adjacent HTML elements from
   * accidentally being concatenated.
   */
  const textBlocks = extractTextBlocks(
    $,
    content
  );

  const text = textBlocks
    .join('\n')
    .normalize('NFKC')
    .replace(/\s+/g, ' ')
    .trim();

  const wordCount = text
    .split(/\s+/)
    .filter(Boolean)
    .length;

  if (wordCount < 100) {
    throw new Error(
      `Not enough meaningful content on ${url} (${wordCount} words)`
    );
  }

  return {
    url,
    title,
    metaDescription,
    h1,
    h2,
    h3,
    text,
    wordCount,
  };
}