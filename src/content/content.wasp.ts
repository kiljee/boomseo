import { action, query, job, type Spec } from "@wasp.sh/spec";
import { getWorkspaceArticles, generateSEOArticle, deleteSEOArticle, getSEOArticle, updateSEOArticle, getRandomGSCKeyword } from "./operations" with {type: "ref"};
import { generateSEOArticleJob } from "./generateSEOArticleJob" with { type: "ref" };


export const contentSpec: Spec = [
	query(getWorkspaceArticles, {
		entities: ["Organization", "SEOArticle", "SEOKeyword"],
	}),

	query(getSEOArticle, {
		entities: ["SEOArticle", "SEOKeyword"],
	}),

	query(getRandomGSCKeyword, {
  		entities: ["GSCQuery"],
	}),

	action(updateSEOArticle, {
		entities: ["SEOArticle"]
	}),

	action(generateSEOArticle, {
		entities: ["Organization", "Competitor", "SEOKeyword", "SEOArticle", "ContentResearch"],
	}),

	action(deleteSEOArticle, {
		entities: ["Organization", "SEOArticle"],
	}),

	job(generateSEOArticleJob, {
		executor: "PgBoss",
		entities: ["Organization", "Competitor", "SEOKeyword", "SEOArticle", "ContentResearch", "CrawledPage"]
	}),
];