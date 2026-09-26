import { searchDuckDuckGo, filterSERPResults } from "./serpService"
import { crawlCompetitorPages, analyzeCompetitorContent } from "./contentResearchService";

export const runContentResearch = async(
	{
		researchId,
	}: {
		researchId: string;
	},
	context: any
) => {
	const research =
		await context.entities.ContentResearch.findUnique({
			where: { id:researchId},
			include: {
				keyword: true,
			},
		});

	if(!research) {
		throw new Error(
			'Content research not found'
		);
	}

	try {
		await context.entities.ContentResearch.update({
			where: {id: researchId},
			data: {
				status: 'RUNNING',
			},
		});

		const keyword = research.keyword.keyword;

		//SERP
		const serpResults = await searchDuckDuckGo(keyword, 15);

		console.log("SERP results: "+serpResults);

		//Filter to relevant competitors
		const competitors =
			filterSERPResults(
				serpResults,
				undefined
			);
		console.log("Competitors: "+competitors);

		const competitorPages = 
			await crawlCompetitorPages(
				competitors,
				context
			);
		console.log("CompetitorPages: "+JSON.stringify(competitorPages, null, 2));

		const analysis =
			analyzeCompetitorContent(
				competitorPages,
				keyword
			);
		console.log("AnalyzeCompetitorContent: "+JSON.stringify(analysis, null, 2));

		await context.entities.ContentResearch.update({
			where: { id: researchId },
			data: {
				status: 'COMPLETED',
				serpResults,
				competitorPages: competitorPages.map(
					(page) => ({
						url: page.url,
						title: page.title,
						metaDescription:
							page.metaDescription,
						text: page.text,
						headings: page.headings,
						wordCount: page.wordCount,
					})
				),
				contentGaps: analysis.competitorTopics,
				recommendedOutline:
					analysis.recommendedOutline,
			},
		});


		return {
			success: true,
			researchId,
		};
	} catch(error) {
		await context.entities.ContentResearch.update({
			where: {id: researchId},
			data: {
				status: 'FAILED',
			},
		});

		throw error;
	}
};