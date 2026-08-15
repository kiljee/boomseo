import { useState } from "react";
import { useNavigate } from "react-router";
import { useAction, useQuery } from "wasp/client/operations";
import { getOnboardingStep } from "wasp/client/operations";
import { routes } from "wasp/client/router";
import { useAuth } from "wasp/client/auth";
import { CreateOrganizationPage } from "../organization/components/CreateOrganizationPage" with {type: "ref"}
import { WebsiteAnalysis } from "./WebsiteAnalysis" with {type: "ref"}


export function OnboardingPage() {
  const navigate = useNavigate();

  const { data: onboarding, isLoading } =
    useQuery(getOnboardingStep);

  if (isLoading || !onboarding) {
    return <div>Loading...</div>;
  }

  switch (onboarding.step) {
    //case 1:
    //  return <CreateOrganizationPage />;

    case 1:
      return <WebsiteAnalysis
          websiteUrl={"example.com"}
          onContinue ={() => {}}
          onBack ={() => {}}
       />;

    /*case 3:
      return <GSCImportStep />;

    case 4:
      return <SEOContextStep />;

    case 5:
      return <CompetitorsStep />;

    case 6:
      return <SEOPlanStep />;*/

    //default:
    //  return <Navigate to={routes.DashboardRoute.to} />;
  }
}