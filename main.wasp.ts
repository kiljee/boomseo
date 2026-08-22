import { app, page, route } from "@wasp.sh/spec";

import { App } from "./src/client/App" with { type: "ref" };
import { NotFoundPage } from "./src/client/components/NotFoundPage" with { type: "ref" };
import { serverEnvValidationSchema } from "./src/env" with { type: "ref" };
import { LandingPage } from "./src/landing-page/LandingPage" with { type: "ref" };
import { seedMockUsers } from "./src/server/scripts/dbSeeds" with { type: "ref" };

import { adminSpec } from "./src/admin/admin.wasp";
import { analyticsSpec } from "./src/analytics/analytics.wasp";
import { authConfig, authSpec } from "./src/auth/auth.wasp";
import { head } from "./src/client/head.wasp";
import { demoAiAppSpec } from "./src/demo-ai-app/demo-ai-app.wasp";
import { fileUploadSpec } from "./src/file-upload/file-upload.wasp";
import { paymentSpec } from "./src/payment/payment.wasp";
import { emailSender } from "./src/server/emailSender.wasp";
import { userSpec } from "./src/user/user.wasp";
import { organizationSpec } from "./src/organization/organization.wasp";
import { analysisSpec } from "./src/server/seo/analysis.wasp";
import { DashboardPage } from "./src/seo/dashboard/DashboardPage" with { type : "ref" }
import { CreateOrganizationPage } from "./src/organization/components/CreateOrganizationPage" with { type : "ref" }
import { WelcomePage } from "./src/onboarding/WelcomePage" with { type : "ref" }
import { MembersPage } from "./src/organization/components/MembersPage" with { type : "ref"}
import { WorkspacesPage } from "./src/organization/components/WorkspacesPage" with { type : "ref"}
import { InvitationsPage } from "./src/organization/components/InvitationsPage" with { type : "ref"}
import { OnboardingPage } from "./src/onboarding/OnboardingPage.tsx" with { type : "ref" }
import { AnalysisTestPage } from "./src/onboarding/AnalysisTestPage.tsx" with { type : "ref" }
import { SEOAuditPage } from "./src/seo/audit/SEOAuditPage.tsx" with { type: "ref" }

export default app({
  name: "OpenSaaS",
  wasp: { version: "^0.24.0" },
  title: "My Open SaaS App",
  head,
  auth: authConfig,
  db: {
    // Run `wasp db seed` to seed the database with the seed functions below:
    seeds: [
      // Populates the database with a bunch of fake users to work with during development.
      seedMockUsers,
    ],
  },
  client: {
    rootComponent: App,
  },
  server: {
    envValidationSchema: serverEnvValidationSchema,
  },
  emailSender,
  spec: [
    // Prerendering routes with static content creates HTML files at build time that are served immediately,
    // improving SEO, search engine/AI crawling, and performance: https://wasp.sh/docs/advanced/prerendering
    route("LandingPageRoute", "/", page(LandingPage), { prerender: true }),
    route("NotFoundRoute", "*", page(NotFoundPage)),
    route("DashboardRoute",
      "/dashboard",
      page(DashboardPage, {authRequired: true})
    ),
    route("CreateOrganizationRoute",
      "/create-workspace",
      page(CreateOrganizationPage, {authRequired: true})
    ),
    route("WorkspacesRoute",
      "/workspaces",
      page(WorkspacesPage, {authRequired: true})
    ),
    route("InvitationsRoute",
      "/invitations",
      page(InvitationsPage, {authRequired: true})
    ),
    route("WelcomePage",
      "/welcome-page",
      page(WelcomePage, {authRequired: true})
    ),
    route("MembersRoute",
      "/members-page",
      page(MembersPage, {authRequired: true})
    ),
    route("OnboardingRoute",
      "/onboarding",
      page(OnboardingPage, {authRequired: true})
    ),
    route("AnalysisRoute",
      "/analysis-test",
      page(AnalysisTestPage, {authRequired: true})
    ),
    route("AuditRoute",
      "/audit",
      page(SEOAuditPage, {authRequired: true})
    ),
    authSpec,
    userSpec,
    demoAiAppSpec,
    paymentSpec,
    fileUploadSpec,
    analyticsSpec,
    adminSpec,
    organizationSpec,
    analysisSpec
  ],
});
