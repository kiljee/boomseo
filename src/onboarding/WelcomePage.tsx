import { useEffect } from "react";
import { useQuery } from "wasp/client/operations";
import { getOnboardingStatus } from "wasp/client/operations";
import { routes } from "wasp/client/router";
import { useNavigate } from "react-router";
import { Props } from "./types"

export function WelcomePage() {
  const navigate = useNavigate();

  const {
    data: onboarding,
    isLoading,
  } = useQuery(getOnboardingStatus);

  useEffect(() => {
    if (!onboarding) {
      return;
    }

    // User already belongs to a workspace
    //if (onboarding.hasWorkspace) {
      //navigate(routes.DashboardRoute.to);
    //}
  }, [onboarding, navigate]);

  if (isLoading || !onboarding) {
    return (
      <div className="
        min-h-[calc(100vh-4rem)]
        bg-background
        flex items-center justify-center
      ">
        <div className="text-sm text-muted-foreground">
          Loading...
        </div>
      </div>
    );
  }

  return (
    <div className="
      min-h-[calc(100vh-4rem)]
      bg-background
      px-4 py-10
      sm:px-6 sm:py-12
      lg:px-8
    ">
      <div className="mx-auto w-full max-w-5xl">

        {/* Header */}
        <div className="mb-10 text-center">
          <div className="
            inline-flex items-center gap-2
            rounded-full
            border border-primary/20
            bg-primary/10
            px-3 py-1
            text-xs font-medium
            text-primary
          ">
            <span>✦</span>
            SEO Project Setup
          </div>

          <h1 className="
            mt-4
            text-3xl font-extrabold tracking-tight
            text-foreground
            sm:text-4xl
          ">
            Welcome to BoomSEO!
          </h1>

          <p className="
            mx-auto mt-3
            max-w-xl
            text-sm leading-6
            text-muted-foreground
          ">
            Create a workspace to get started or join
            an existing project through an invitation.
          </p>
        </div>

        {/* Main cards */}
        <div className="
          grid grid-cols-1 gap-5
          md:grid-cols-2
        ">

          {/* Create workspace */}
          <div className="
            rounded-2xl
            border border-border
            bg-card
            p-6
            shadow-sm
            transition-shadow
            hover:shadow-md
            sm:p-8
          ">

            <div className="
              flex h-12 w-12
              items-center justify-center
              rounded-xl
              border border-primary/20
              bg-primary/10
              text-xl
            ">
              🔎
            </div>

            <h2 className="
              mt-5
              text-xl font-bold
              text-foreground
            ">
              Create an SEO project
            </h2>

            <p className="
              mt-2
              text-sm leading-6
              text-muted-foreground
            ">
              Create a workspace for your website/organization and
              manage technical audits, keywords, rankings,
              content opportunities, and SEO reports.
            </p>

            <button
              onClick={() =>
                //navigate(routes.CreateOrganizationRoute.to)
                navigate(routes.OnboardingRoute.to)
              }
              className="
                mt-8
                w-full rounded-xl
                bg-primary
                px-4 py-3.5
                text-sm font-semibold
                text-primary-foreground
                shadow-sm
                transition
                hover:opacity-90
              "
            >
              Create SEO Project
              <span className="ml-1">→</span>
            </button>
          </div>

          {/* Join workspace */}
          <div className="
            rounded-2xl
            border border-border
            bg-card
            p-6
            shadow-sm
            transition-shadow
            hover:shadow-md
            sm:p-8
          ">

            <div className="
              flex h-12 w-12
              items-center justify-center
              rounded-xl
              border border-primary/20
              bg-primary/10
              text-xl
            ">
              👥
            </div>

            <h2 className="
              mt-5
              text-xl font-bold
              text-foreground
            ">
              Join an existing project
            </h2>

            <p className="
              mt-2
              text-sm leading-6
              text-muted-foreground
            ">
              Have an invitation from an SEO project
              administrator? Accept it to start working
              with your team.
            </p>

            {onboarding.invitations.length === 0 ? (
              <div className="
                mt-8
                rounded-xl
                border border-border
                bg-muted/40
                p-5
              ">
                <p className="
                  text-sm font-medium
                  text-foreground
                ">
                  No pending invitations
                </p>

                <p className="
                  mt-1
                  text-xs leading-5
                  text-muted-foreground
                ">
                  Ask a project administrator to invite
                  you to their SEO workspace.
                </p>
              </div>
            ) : (
              <div className="mt-6 space-y-3">
                {onboarding.invitations.map(
                  (invitation: any) => (
                    <div
                      key={invitation.id}
                      className="
                        rounded-xl
                        border border-border
                        bg-background
                        p-4
                      "
                    >
                      <div className="
                        flex flex-col gap-2
                        sm:flex-row
                        sm:items-center
                        sm:justify-between
                      ">
                        <div className="min-w-0">
                          <div className="
                            truncate
                            font-semibold
                            text-foreground
                          ">
                            {invitation.organization.name}
                          </div>

                          <div className="
                            mt-1
                            text-xs
                            text-muted-foreground
                          ">
                            Invited as{" "}
                            <span className="font-medium text-primary">
                              {invitation.role}
                            </span>
                          </div>
                        </div>

                        <span className="
                          w-fit
                          rounded-full
                          bg-primary/10
                          px-2 py-1
                          text-[10px]
                          font-semibold
                          text-primary
                        ">
                          INVITATION
                        </span>
                      </div>

                      <button
                        className="
                          mt-4
                          w-full
                          rounded-lg
                          border border-border
                          bg-background
                          px-4 py-2.5
                          text-xs font-semibold
                          text-foreground
                          transition
                          hover:bg-muted
                        "
                      >
                        Accept Invitation
                      </button>
                    </div>
                  )
                )}
              </div>
            )}
          </div>
        </div>

        {/* Bottom information */}
        <div className="
          mt-6
          rounded-xl
          border border-border
          bg-muted/30
          p-4
          text-center
        ">
          <p className="
            text-xs leading-5
            text-muted-foreground
          ">
            Your workspace keeps your website data,
            SEO analysis, keywords, reports, and team
            members organized in one place.
          </p>
        </div>

      </div>
    </div>
  );
}

/**
 * Small reusable feature row.
 */
function Feature({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="
      flex items-center gap-3
      text-sm text-foreground
    ">
      <span className="
        flex h-5 w-5
        shrink-0
        items-center justify-center
        rounded-full
        bg-primary/10
        text-xs
        font-bold
        text-primary
      ">
        ✓
      </span>

      {children}
    </div>
  );
}