import { useState } from "react";
import { useNavigate } from "react-router";
import { useAction, useQuery } from "wasp/client/operations";
import { getOnboardingStep } from "wasp/client/operations";
import { routes } from "wasp/client/router";
import { useAuth } from "wasp/client/auth";
import { CreateOrganizationPage } from "../organization/components/CreateOrganizationPage" with {type: "ref"}
import { WebsiteAnalysis } from "./WebsiteAnalysis" with {type: "ref"}
import { GSCImportPage } from "./GSCImportPage" with {type: "ref"}
import { SEOContextPage } from "./SEOContextPage" with {type: "ref"}
import { CompetitorPage } from "./CompetitorPage" with {type: "ref"}
import { SEOPlanPage } from "./SEOPlanPage" with {type: "ref"}
import { AnalysisProps } from "./types"

export function AnalysisTestPage() {
  return (
    <WebsiteAnalysis
      onContinue={() =>
        console.log("Analysis complete")
      }
      onBack={() =>
        console.log("Back")
      }
    />
  );
}