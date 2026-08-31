type LibreCrawlPage = {
	url? : string;
	title? : string;
	meta_description? : string;
	status_code? : number;
	word_count?: number;
	internal_links?: number;
	response_time?: number;
	size: number;
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
  if (pages.length === 0) return 0;

  const severityWeights: Record<string, number> = {
    critical: 10,
    high: 5,
    medium: 2,
    low: 1,
  };

  let totalPenalty = 0;

  for (const issue of issues) {
    const severity =
      issue.severity?.toLowerCase() ?? "low";

    totalPenalty +=
      severityWeights[severity] ?? 1;
  }

  // Normalize issue penalty by number of pages.
  const penaltyPerPage =
    totalPenalty / pages.length;

  // Convert to a 0–100 score.
  const score =
    100 - penaltyPerPage * 10;

  return Math.round(
    Math.max(0, Math.min(100, score))
  );
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