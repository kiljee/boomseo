import { action, query, job, type Spec } from '@wasp.sh/spec';
import {
  getContentResearch,
  getWdfIdfAnalysis,
  startContentResearch,
  startWdfIdfAnalysis,
  analyzeWdfIdfKeyword,
} from './researchOperations' with { type: 'ref' };
import { runContentResearch } from './contentResearchJob' with { type: 'ref' };
import { runWdfIdfAnalysis } from './wdfIdfJob' with { type: 'ref' };
import { optimizeArticleJob } from "./optimizeArticleJob" with { type: "ref" };
import { startArticleOptimization, getArticleOptimization } from "./articleOptimization" with { type: "ref" };


export const researchAnalysisSpec: Spec = [
  query(getContentResearch, {
    entities: ['Organization', 'SEOKeyword', 'ContentResearch'],
  }),

  query(getWdfIdfAnalysis, {
    entities: ['Organization', 'SEOKeyword', 'ContentResearch'],
  }),

  action(startContentResearch, {
    entities: ['Organization', 'SEOKeyword', 'ContentResearch'],
  }),

  action(analyzeWdfIdfKeyword, {
    entities: ['Organization', 'SEOKeyword', 'ContentResearch', 'CrawledPage'],
  }),

  action(startWdfIdfAnalysis, {
    entities: ['Organization', 'SEOKeyword', 'ContentResearch', 'CrawledPage'],
  }),

  job(runContentResearch, {
    executor: 'PgBoss',
    entities: ['Organization', 'SEOKeyword', 'ContentResearch', 'CrawledPage'],
  }),

  job(runWdfIdfAnalysis, {
    executor: 'PgBoss',
    entities: ['Organization', 'SEOKeyword', 'ContentResearch', 'CrawledPage'],
  }),
  job(optimizeArticleJob, {
    executor: "PgBoss",
    entities: ["ArticleOptimization"],
  }),
  action(startArticleOptimization, {
    entities: ["ArticleOptimization"]
  }),
  query(getArticleOptimization, {
    entities: ["ArticleOptimization"]
  })
];