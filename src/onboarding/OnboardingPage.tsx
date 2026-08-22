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
import { Props } from "./types"

export function OnboardingPage() {
  const navigate = useNavigate();

  //const { data: onboarding, isLoading } =
  //  useQuery(getOnboardingStep);

  const [step, setStep] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const currentStep = step; //onboarding.step;

  if (isLoading /*|| !onboarding*/) {
    return <div>Loading...</div>;
  }

  switch (step) {
    case 1:
      return <CreateOrganizationPage
            onContinue={() => setStep(2)}
            onBack={() => {}} //return to dashboard
       />;

    case 2:
      return <WebsiteAnalysis
          websiteUrl={"example.com"}
          onContinue ={() => setStep(3)}
          onBack ={() => setStep(1)}
       />;

    case 3:
      return <GSCImportPage
          onContinue={() => setStep(4)}
          onBack={() => setStep(2)}
       />;

    case 4:
      return <SEOContextPage
          onContinue={() => setStep(5)}
          onBack={() => setStep(3)}
       />;

    case 5:
      return <CompetitorPage
          onContinue={() => setStep(6)}
          onBack={() => setStep(4)}
       />;

    case 6:
      return <SEOPlanPage
          onContinue={() => setStep(7)}
          onBack={() => setStep(5)}
       />;


    default:
      return <div> Onboarding complete. </div>;
      //return <Navigate to={routes.DashboardRoute.to} />;
  }
}