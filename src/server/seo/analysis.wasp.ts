import { action, query, type Spec } from "@wasp.sh/spec";
import { getSEOAnalysisStatus, getLatestSEOAudit } from "./queries" with {type: "ref"};
import { startSEOAnalysis, syncSEOAnalysis } from "./actions" with {type: "ref"};


export const analysisSpec : Spec = [
    query(getSEOAnalysisStatus, {
      entities: ["Organization", "SEOAnalysis", "SEOPage", "SEOIssue"]
    }),

    query(getLatestSEOAudit, {
      entities: ["Organization", "SEOAnalysis"]
    }),

    action(startSEOAnalysis, {
      entities: ["Organization", "SEOAnalysis"]   
    }),

    action(syncSEOAnalysis, {
      entities: ["Organization", "SEOAnalysis", "SEOPage", "SEOIssue"]
    })
];