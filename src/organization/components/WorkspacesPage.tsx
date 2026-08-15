import {
  getUserOrganizations,
  getCurrentOrganization,
  setActiveOrganization,
  getOnboardingStatus,
  useAction,
  useQuery,
} from "wasp/client/operations";
import { useAuth } from "wasp/client/auth";
import { useNavigate } from "react-router";
import { routes } from "wasp/client/router";

export function WorkspacesPage() {
  const { data: user, isLoading } = useAuth();
  const navigate = useNavigate();

  /*const {
    data: organization,
    isLoading: organizationLoading,
  } = useQuery(getCurrentOrganization, {
    enabled: !!user,
  });*/

  const { data: onboarding } = useQuery(getOnboardingStatus, {
    enabled: !!user,
  });

  const pendingInvitations = onboarding?.invitations ?? [];


  const {
    data: organizations,
    isLoading: organizationsLoading,
  } = useQuery(getUserOrganizations, {
    enabled: !!user,
  });
  const currentOrganizationId = user?.activeOrganizationId;

  const switchOrganization =
    useAction(setActiveOrganization);

  const handleSwitch = async (orgId: string) => {
    await switchOrganization({ orgId });

    // Refresh so the rest of the application
    // uses the newly selected organization.
    //window.location.reload();
    navigate("/dashboard");
  };

  if (
    isLoading ||
    organizationsLoading ||
    !user
  ) {
    return (
      <div className="
        min-h-[calc(100vh-4rem)]
        bg-background
        flex items-center justify-center
      ">
        <p className="
          text-sm
          text-muted-foreground
        ">
          Loading workspaces...
        </p>
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
      <div className="
        mx-auto
        w-full
        max-w-6xl
      ">

        {/* Header */}
        <div className="
          flex flex-col gap-4
          sm:flex-row
          sm:items-center
          sm:justify-between
        ">
          <div>
            <h1 className="
              text-3xl font-bold
              tracking-tight
              text-foreground
            ">
              Your Workspaces
            </h1>

            <p className="
              mt-2
              text-sm
              text-muted-foreground
            ">
              Switch between your SEO projects and
              manage your workspaces.
            </p>
          </div>

          <div className="flex flex-row gap-2"> 

          <button
              onClick={() => navigate(routes.InvitationsRoute.to)}
              className="
                flex w-full items-center justify-center gap-2
                rounded-xl
                border border-border
                bg-card
                px-4 py-2.5
                text-sm font-semibold
                text-foreground
                transition
                hover:bg-muted
                sm:w-auto
              "
            >
              Pending Invitations

              {(
                <span className="
                  rounded-full
                  bg-primary
                  px-2 py-0.5
                  text-[10px] font-bold
                  text-primary-foreground
                ">
                  {pendingInvitations.length}
                </span>
              )}
            </button>

          <button
            onClick={() =>
              navigate(
                routes.CreateOrganizationRoute.to
              )
            }
            className="
              w-full
              rounded-xl
              bg-primary
              px-4 py-2.5
              text-sm font-semibold
              text-primary-foreground
              shadow-sm
              transition
              hover:opacity-90
              sm:w-auto
            "
          >
            + Create Workspace
          </button>

          </div>

          
        </div>



        {/* Workspace list */}
        {!organizations ||
        organizations.length === 0 ? (
          <div className="
            mt-8
            rounded-2xl
            border border-border
            bg-card
            p-8
            text-center
            shadow-sm
          ">
            <div className="
              mx-auto
              flex h-14 w-14
              items-center justify-center
              rounded-2xl
              bg-primary/10
              text-2xl
            ">
              🔎
            </div>

            <h2 className="
              mt-4
              text-lg font-semibold
              text-foreground
            ">
              No workspaces
            </h2>

            <p className="
              mx-auto mt-2
              max-w-md
              text-sm
              text-muted-foreground
            ">
              Create a workspace to start managing
              your SEO projects.
            </p>

            <button
              onClick={() =>
                navigate(
                  routes.CreateOrganizationRoute.to
                )
              }
              className="
                mt-6
                rounded-xl
                bg-primary
                px-5 py-2.5
                text-sm font-semibold
                text-primary-foreground
                transition
                hover:opacity-90
              "
            >
              Create Workspace
            </button>
          </div>
        ) : (
          <div className="
            mt-8
            grid grid-cols-1
            gap-5
            sm:grid-cols-2
            lg:grid-cols-3
          ">
            {organizations.map(
              (membership: any) => {
                const workspace =
                  membership.organization;

                const isCurrent =
                  workspace.id === currentOrganizationId;

                return (
                  <div
                    key={workspace.id}
                    className={`
                      flex flex-col
                      rounded-2xl
                      border
                      bg-card
                      p-5
                      shadow-sm
                      transition-all
                      ${
                        isCurrent
                          ? "border-primary ring-1 ring-primary/20"
                          : "border-border hover:shadow-md"
                      }
                    `}
                  >

                    {/* Top */}
                    <div className="
                      flex items-start
                      justify-between
                      gap-3
                    ">
                      <div className="
                        flex h-12 w-12
                        shrink-0
                        items-center justify-center
                        rounded-xl
                        border border-primary/20
                        bg-primary/10
                        text-2xl
                      ">
                        {workspace.icon || "🔎"}
                      </div>

                      <div className="
                        flex items-center
                        gap-2
                      ">
                        {isCurrent && (
                          <span className="
                            rounded-full
                            bg-primary/10
                            px-2.5 py-1
                            text-[10px]
                            font-semibold
                            text-primary
                          ">
                            CURRENT
                          </span>
                        )}

                        <span className="
                          rounded-full
                          bg-muted
                          px-2.5 py-1
                          text-[10px]
                          font-semibold
                          text-muted-foreground
                        ">
                          {membership.role}
                        </span>
                      </div>
                    </div>

                    {/* Details */}
                    <div className="
                      mt-5
                      flex-1
                    ">
                      <h2 className="
                        truncate
                        text-lg font-semibold
                        text-foreground
                      ">
                        {workspace.name}
                      </h2>

                      <p className="
                        mt-1
                        truncate
                        font-mono
                        text-xs
                        text-muted-foreground
                      ">
                        /{workspace.slug}
                      </p>

                      <p className="
                        mt-4
                        line-clamp-3
                        min-h-[60px]
                        text-sm leading-5
                        text-muted-foreground
                      ">
                        {workspace.description ||
                          "No workspace description provided."}
                      </p>
                    </div>

                    {/* Action */}
                    <div className="
                      mt-5
                      border-t border-border
                      pt-4
                    ">
                      <button
                        //disabled={isCurrent}
                        onClick={() =>
                          handleSwitch(workspace.id)
                        }
                        className={`
                          w-full
                          rounded-xl
                          px-4 py-2.5
                          text-sm font-semibold
                          transition
                          ${
                            isCurrent
                              ? "cursor-default bg-muted text-muted-foreground"
                              : "border border-border bg-background text-foreground hover:bg-muted"
                          }
                        `}
                      >
                        {isCurrent
                          ? "Current Workspace"
                          : "Switch to Workspace →"}
                      </button>
                    </div>

                  </div>
                );
              }
            )}
          </div>
        )}

      </div>
    </div>
  );
}