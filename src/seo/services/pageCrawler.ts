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

export async function extractCompetitorPage(
	url: string
): Promise<CompetitorPageData> {
	const response = await fetch(url, {
		headers: {
			'User-Agent':
				'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:124.0) Gecko/20100101 Firefox/124.0',
				Accept: 'text/html,application/xhtml+xml',			
		},
		redirect: 'follow',
	});

	if(!response.ok) {
		throw new Error(
			`Failed to fetch ${url}: ${response.status}`
		);
	}

	const contentType = response.headers.get('content-type') ?? '';

	if(!contentType.includes('text/html')) {
		throw new Error(`Not an HTML page: ${url}`);
	}

	const html = await response.text();
	const $ = cheerio.load(html);

	const title = $('title')
		.first()
		.text()
		.trim();

	const metaDescription =
		$('meta[name="description"]')
		.attr('content')
		?.trim() ?? '';

	let content = $('article').first();

	if (!content.length) {
	  content = $('main').first();
	}

	if (!content.length) {
	  content = $('[role="main"]').first();
	}

	if (!content.length) {
	  content = $('.content, .post-content, .entry-content, .article-content').first();
	}

	if (!content.length) {
	  throw new Error(`Could not identify main content for ${url}`);
	}

	content.find('script, style, noscript, nav, footer, header, aside, form')
	.remove();

	const extractHeadings = (selector: string) =>
		content.find(selector)
			.map((_, el) => $(el).text().trim())
			.get()
			.filter(Boolean);

	const h1 = extractHeadings('h1');
	const h2 = extractHeadings('h2');
	const h3 = extractHeadings('h3');

	const text = content
	.text()
	.replace(/\s+/g, ' ')
	.trim();

	const wordCount = text
		.split(/\s+/)
		.filter(Boolean)
		.length;

	return {
		url,
		title,
		metaDescription,
		h1,
		h2,
		h3,
		text,
		wordCount
	};
}