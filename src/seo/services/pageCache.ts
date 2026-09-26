import { extractCompetitorPage } from './pageCrawler';

const CACHE_DAYS = 7;

export async function getCachedPage(
	url: string,
	context: any
) {
	const cached = await context.entities.CrawledPage.findUnique({
		where: { url },
	});

	if( cached && cached.expiresAt > new Date()) {
		return cached;
	}

	const page = await extractCompetitorPage(url);

	const expiresAt = new Date();

	expiresAt.setDate(
		expiresAt.getDate() + CACHE_DAYS
	)

	return context.entities.CrawledPage.upsert({
		where: { url },
		create: {
			url: page.url,
			title: page.title,
			metaDescription:
				page.metaDescription,
			headings: {
				h1: page.h1,
				h2: page.h2,
				h3: page.h3
			},
			text: page.text,
			wordCount: page.wordCount,
			crawledAt: new Date(),
			expiresAt,
		},

		update: {
			title: page.title,
			metaDescription:
				page.metaDescription,
			headings: {
				h1: page.h1,
				h2: page.h2,
				h3: page.h3
			},
			text: page.text,
			wordCount: page.wordCount,
			crawledAt: new Date(),
			expiresAt,
		},
	});



}