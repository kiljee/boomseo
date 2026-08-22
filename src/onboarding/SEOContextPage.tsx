import { useState } from "react";
import { useNavigate } from "react-router";
import { useAction, useQuery } from "wasp/client/operations";
import { getOnboardingStep } from "wasp/client/operations";
import { routes } from "wasp/client/router";
import { useAuth } from "wasp/client/auth";
import { CreateOrganizationPage } from "../organization/components/CreateOrganizationPage" with {type: "ref"}
import { WebsiteAnalysis } from "./WebsiteAnalysis" with {type: "ref"}
import { GSCImportPage } from "./GSCImportPage" with {type: "ref"}
import { CompetitorPage } from "./CompetitorPage" with {type: "ref"}
import { SEOPlanPage } from "./SEOPlanPage" with {type: "ref"}
import { Props } from "./types"

export function SEOContextPage({
  onContinue,
  onBack,
}: Props) {
  return (
    <div className="mx-auto max-w-2xl p-8">
      <h1 className="text-2xl font-bold">
        SEO Context
      </h1>

      <p className="mt-2 text-muted-foreground">
        Tell us your goals so we generate the right content.
      </p>

      <div className="mt-8 rounded-xl border p-6">
        <p className="text-sm text-muted-foreground">
          SEO goals, audience, and tone will be configured here.
        </p>
      </div>

      <div className="mt-6 flex justify-between">
        <button
          onClick={onBack}
          className="rounded-lg border px-4 py-2"
        >
          Back
        </button>

        <button
          onClick={onContinue}
          className="rounded-lg bg-primary px-4 py-2 text-primary-foreground"
        >
          Continue
        </button>
      </div>
    </div>
  );
}