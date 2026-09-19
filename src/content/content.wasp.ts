import { action, query, job, type Spec } from "@wasp.sh/spec";
import { getWorkspaceArticles, generateSEOArticle, deleteSEOArticle } from "./operations" with {type: "ref"};
import { generateSEOArticleJob } from "./generateSEOArticleJob" with { type: "ref" };


export const contentSpec: Spec = [
	query(getWorkspaceArticles, {
		entities: ["Organization", "SEOArticle", "SEOKeyword"],
	}),

	action(generateSEOArticle, {
		entities: ["Organization", "Competitor", "SEOKeyword", "SEOArticle"],
	}),

	action(deleteSEOArticle, {
		entities: ["Organization", "SEOArticle"],
	}),

	job(generateSEOArticleJob, {
		executor: "PgBoss",
		entities: ["Organization", "Competitor", "SEOKeyword", "SEOArticle"]
	}),
];