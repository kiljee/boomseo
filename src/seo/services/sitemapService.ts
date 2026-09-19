import { XMLParser } from 'fast-xml-parser'
import Sitemapper from 'sitemapper';

export async function getSiteInventory(domainOrUrl: string) {
	let sitemapUrl = domainOrUrl.trim()
	if(!sitemapUrl.startsWith('http')) {
		sitemapUrl = `https://${sitemapUrl.replace(/\/$/, '')}/sitemap.xml`;
	}

	const sitemap = new Sitemapper({
		url: sitemapUrl,
		timeout: 15000, //15 seconds
		retries: 2,
		concurrency: 5, //Fetch up to 5 child sitemaps in parallel
	});

	try {
		const { sites } = await sitemap.fetch();
		console.log(`Fetching sitemap for url: ${sitemapUrl}`);
		if(!sites || sites.length === 0) {
			console.warn(`No URLs found in sitemap for: ${sitemapUrl}`);
			return [];
		}

		return sites.filter((url) => (
			!url.includes('/tag') &&
			!url.includes('/category/') &&
			!url.includes('/author/') &&
			!url.includes('/privacy-policy') &&
			!url.includes('/terms')
		)).map((url) => {
			const slug = url.split('/').filter(Boolean).pop() || '';
			const title = slug.replace(/[-_]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

			return { url, slug, title };

		});
	} catch(error) {
		console.error(`Failed to fetch sitemap via Sitemapper for ${sitemapUrl}:`, error);
		return [];
	}
}

import * as cheerio from 'cheerio';

export interface DiscoveredPage {
	url: string;
	slug: string;
	title: string;
	keywords: string[];
};

export async function crawlSiteWithoutSitemap(
	baseUrl: string,
	maxPages: number = 20
): Promise<DiscoveredPage[]> {
	const normalizedBase = baseUrl.startsWith('http') ? baseUrl : `https://${baseUrl}`;

	const domain = new URL(normalizedBase).hostname;

	const queue: string[] = [normalizedBase];
	const visited = new Set<string>();
	const pages : DiscoveredPage[]  = [];

	while(queue.length > 0 && visited.size < maxPages) {
		const currentUrl = queue.shift();
		if(!currentUrl) continue;

		if(visited.has(currentUrl)) continue;
		visited.add(currentUrl);

		try {
			console.log(`Crawling: ${currentUrl}`);
			const response = await fetch(currentUrl, {
				headers: {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'}
			});

			if(!response.ok) continue;

			const html = await response.text();
			const $ = cheerio.load(html);

			const title  = $('title').text().trim() || $('h1').first().text().trim() || domain;

			const metaKeywords = $('meta[name="keywords"]').attr('content') || '';
			const h1Text = $('h1').map((_, el) => $(el).text()).get().join(' ');

			const keywords = Array.from(
				new Set([
					...metaKeywords.split(',').map((k) => k.trim()),
					...title.toLowerCase().split(/\s+/),
					...h1Text.toLowerCase().split(/\s+/),
				])
			).filter((word) => word.length > 3);

			const slug = new URL(currentUrl).pathname.split('/').filter(Boolean).pop() || '';

			pages.push({
				url: currentUrl,
				slug,
				title,
				keywords
			});

			$('a[href]').each((_,element) => {
				const href = $(element).attr('href');
				if(!href) return;

				try {
					const absoluteUrl = new URL(href, currentUrl).href;
					const urlObj = new URL(absoluteUrl);

					if(
						urlObj.hostname === domain &&
						!visited.has(absoluteUrl) &&
						!queue.includes(absoluteUrl) &&
						!href.match(/\.(png|jpg|jpeg|gif|css|js|pdf|svg)$/i)
					) {
						queue.push(absoluteUrl);
					}

				} catch {
					console.log("Invalid url. Skipping");
				}
			});

		} catch(err) {
			console.warn(`Failed to crawl ${currentUrl}:`, err);
		}
	}

	return pages;
}

export function extractPageTitle($: cheerio.CheerioAPI, fallbackDomain: string = ''): string {
	const ogTitle = $('meta[property="og:title"]').attr('content') || $('meta[name="twitter:title"]').attr('content');

	if(ogTitle && ogTitle.trim().length > 0) {
		return cleanTitleSuffix(ogTitle.trim());
	}

	const scopedH1 = $('main h1, article h1, [role="main"] h1').first().text().trim();

	if(scopedH1.length>0) {
		return scopedH1;
	}

	const anyH1 = $('h1').first().text().trim();
	if(anyH1.length > 0) {
		return anyH1;
	}

	const rawTitle = $('title').text().trim();
	if(rawTitle.length > 0) {
		return cleanTitleSuffix(rawTitle);
	}

	const h2Text = $('h2').first().text().trim();
	if(h2Text.length > 0) {
		return h2Text;
	}

	return fallbackDomain;
}

export async function getOrCrawlSiteInventory(domain: string) {
	let items = await getSiteInventory(domain);

	if(!items || items.length == 0) {
		console.log(`No sitemap found for ${domain}. Falling back to direct HTML crawling...`);

		const crawledPages = await crawlSiteWithoutSitemap(domain, 50);
		items = crawledPages.map((p) => ({
			url: p.url,
			slug: p.slug,
			title: p.title
		}));
	}

	return items;
}

function cleanTitleSuffix(title: string): string {
      const parts = title.split(/\s+[\|-—•:]\s+/);
      if (parts.length > 1) {
        return parts.reduce((longest, current) => (current.length > longest.
  length ? current : longest), '').trim();
      }
      return title;
    }
