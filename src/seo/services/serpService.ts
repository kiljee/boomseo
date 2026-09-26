import * as cheerio from 'cheerio'

export interface SERPResult {
	position: number;
	title: string;
	url: string;
	snippet: string;
}

const DDG_URL = 'https://html.duckduckgo.com/html/';

export async function searchDuckDuckGo(
	query: string,
	limit = 10
): Promise<SERPResult[]> {
	const response = await fetch(DDG_URL, {
		method: 'POST',
		headers: {
			'Content-Type':
				'application/x-www-form-urlencoded',
			'User-Agent':
				'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebkit/537.36 Chrome/140 Safari/537.36',
				Accept: 'text/html',
				Referer: 'https://html.duckduckgo.com/',
		},
		body: new URLSearchParams({
			q: query
		}),
	});

	if(!response.ok) {
		throw new Error(`DuckDuckGo request failed: ${response.status}`);
	}

	const html = await response.text();

	return parseDuckDuckGoResults(html)
		.slice(0, limit);
}

function parseDuckDuckGoResults(
	html: string
): SERPResult[] {
	const $ = cheerio.load(html);
	const results: SERPResult[] = [];

	$('.result').each((index, element) => {
		const result = $(element);

		const link = result
			.find('.result__a')
			.first();

		const title = link
			.text()
			.trim();

		const href = link.attr('href');

		if(!title || !href) {
			return;
		}

		const snippet = result
			.find('.result__snippet')
			.first()
			.text()
			.trim();

		const url = extractResultUrl(href);

		if(!url) {
			return;
		}

		results.push({
			position: index + 1,
			title,
			url,
			snippet,
		});

	})

	return results;
}


function extractResultUrl(
	href: string
): string | null {
	try {
		const absoluteUrl = href.startsWith('//')
		? `https:${href}`
		: href;

		const url = new URL(absoluteUrl);

		const redirectedUrl = 
		url.searchParams.get('uddg');

		return redirectedUrl
			? decodeURIComponent(redirectedUrl)
			: absoluteUrl;
		} catch {
			return null;
		}
}

export function filterSERPResults(
	results: SERPResult[],
	ownDomain?: string,
): SERPResult[] {
	return results
	.filter((result) => {
		try {
			const url = new URL(result.url);

			if(!['http:', 'https:'].includes(
				url.protocol
			)) {
				return false;
			}

			if(ownDomain &&
				url.hostname
				.replace(/^www\./, '')
				.endsWith(
					ownDomain
					.replace(/^www\./,'')
				)
			) {
				return false;
			}

			return true;
		} catch {
			return false;
		}
	})
	.filter((result) => {
		const url = result.url.toLowerCase();

		return !(
			url.includes('youtube.com') ||
			url.includes('reddit.com') ||
			url.includes('facebook.com') ||
			url.includes('instagram.com') ||
			url.includes('linkedin.com')
		);
	})
	.slice(0, 10);
}

