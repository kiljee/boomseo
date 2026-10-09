import { action, query, job, type Spec } from "@wasp.sh/spec";
import {  getContentResearch } from "./researchOperations" with { type: "ref" };
import { runContentResearch } from "./contentResearchJob" with { type: "ref" };
import { startContentResearch, analyzeWdfIdfKeyword } from "./contentResearchService" with { type: "ref" }

export const researchAnalysisSpec: Spec = [
  query(getContentResearch, {
    entities: ["Organization", "SEOKeyword", "ContentResearch"],
  }),

  action(startContentResearch, {
    entities: ["Organization", "SEOKeyword", "ContentResearch"],
  }),

  action(analyzeWdfIdfKeyword, {
    entities: ["Organization", "SEOKeyword", "ContentResearch", "CrawledPage"],
  }),

  job(runContentResearch, {
    executor: "PgBoss",
    entities: ["Organization", "SEOKeyword", "ContentResearch", "CrawledPage"],
  }),
];