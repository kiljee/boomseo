type LibreCrawlPage = {
	url? : string;
	title? : string;
	meta_description? : string;
	status_code? : number;
	word_count?: number;
	internal_links?: number;
	response_time?: number;
	size? : number;
	lang? : string;
	robots? : string;
};

type LibreCrawlIssue = {
	type? : string;
	severity?: string;
	message? :string;
	url? : string;
	[key: string]: unknown;
};

export function calculateSEOScore(
	pages: LibreCrawlPage[],
	issues: LibreCrawlIssue[]
) {
	if(pages.length == 0)
		return 0;

	let score = 100;

	for(const issue of issues) {
		const severity = issue.severity?.toLowerCase();

		if(severity === "critical") {
			score -= 8;
		}
		else if(severity == "high") {
			score -= 5;
		}
		else if(severity === "medium") {
			score -= 3;
		}
		else {
			score -= 1;
		}
	}


	return Math.max(0, Math.min(100, score));
}

export function parseCrawlResults(crawl: any) {
	const pages: LibreCrawlPage[] = Array.isArray(crawl.urls) ? crawl.urls : [];

	const issues: LibreCrawlIssue[] = Array.isArray(crawl.issues) ? crawl.issues : [];


	return {
		pages,
		issues,

		stats: {
			crawled:
				crawl.stats?.crawled ?? pages.length,

			discovered:
				crawl.stats?.discovered ?? 0,

			depth:
				crawl.stats?.depth ?? 0,

			speed:
				crawl.stats?.speed ?? 0,
		},

		seoScore: calculateSEOScore(
			pages,
			issues
		),
	};

}