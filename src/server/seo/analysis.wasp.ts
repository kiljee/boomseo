import { action, query, job, type Spec } from "@wasp.sh/spec";
import { getSEOAnalysisStatus, getLatestSEOAudit, getSEOAudits, getSEOAudit, getCrawlStatusQuery, getGSCStats, getSEOPlan } from "./queries" with {type: "ref"};
import { startSEOAnalysis, syncSEOAnalysis, importGSCData, saveSEOContext, saveCompetitors, generateSEOPlan } from "./actions" with {type: "ref"};
import { crawlWebsiteJob } from "./crawlerJob" with { type: "ref" };


export const analysisSpec : Spec = [
    query(getSEOAnalysisStatus, {
      entities: ["Organization", "SEOAnalysis", "SEOPage", "SEOIssue"]
    }),

    query(getLatestSEOAudit, {
      entities: ["Organization", "SEOAnalysis"]
    }),

    query(getSEOAudits, {
      entities: ["Organization", "SEOAnalysis", "SEOPage", "SEOIssue"],
    }),

    query(getSEOAudit, {
      entities: ["Organization", "SEOAnalysis", "SEOPage", "SEOIssue"],
    }),

    query(getCrawlStatusQuery, {
      entities: ["Organization", "SEOAnalysis", "SEOPage", "SEOIssue"],
    }),

    query(getGSCStats, {
      entities: ["Organization", "GSCImport", "GSCQuery", "Membership"],
    }),

    query(getSEOPlan, {
      entities: ["Organization", "SEOPlan"],
    }),

    action(startSEOAnalysis, {
      entities: ["Organization", "SEOAnalysis"]   
    }),

    action(syncSEOAnalysis, {
      entities: ["Organization", "SEOAnalysis", "SEOPage", "SEOIssue"]
    }),

    action(importGSCData, {
      entities: ["Organization", "GSCImport", "GSCQuery", "Membership"]
    }),

    action(saveSEOContext, {
      entities: ["Organization"]
    }),

    action(saveCompetitors, {
      entities: ["Organization", "Competitor"]
    }),

    action(generateSEOPlan, {
      entities: ["Organization", "Competitor", "SEOPlan", "SEOAnalysis", "GSCImport"]
    }),

    job(crawlWebsiteJob, {
      executor: "PgBoss",
      entities: ["SEOAnalysis", "SEOPage", "SEOIssue", "Organization"],
    }),
];