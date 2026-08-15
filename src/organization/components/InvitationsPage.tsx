import {
  getOnboardingStatus,
  acceptInvitation,
  cancelInvitation,
  useAction,
  useQuery,
} from "wasp/client/operations";
import { useAuth } from "wasp/client/auth";
import { useNavigate } from "react-router";
import { routes } from "wasp/client/router";

export function InvitationsPage() {
  const { data: user, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();

  const {
    data: onboarding,
    isLoading,
  } = useQuery(getOnboardingStatus, {
    enabled: !!user,
  });

  const accept = useAction(acceptInvitation);
  const decline = useAction(cancelInvitation);

  const invitations = onboarding?.invitations ?? [];

  const handleAccept = async (invitationId: string) => {
    await accept({ invitationId });

    // The invitation is accepted and the organization
    // can now appear in the user's workspace list.
    navigate(routes.WorkspacesRoute.to);
  };

  const handleDecline = async (invitationId: string) => {
    await decline({ invitationId });

    window.location.reload();
  };

  if (authLoading || isLoading || !user) {
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
          Loading invitations...
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
        max-w-3xl
      ">

        {/* Header */}
        <div>
          <h1 className="
            text-3xl font-bold
            tracking-tight
            text-foreground
          ">
            Invitations
          </h1>

          <p className="
            mt-2
            text-sm
            text-muted-foreground
          ">
            Review invitations to join other workspaces.
          </p>
        </div>

        {/* Empty state */}
        {invitations.length === 0 && (
          <div className="
            mt-8
            rounded-2xl
            border border-border
            bg-card
            p-10
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
              ✉️
            </div>

            <h2 className="
              mt-4
              text-lg font-semibold
              text-foreground
            ">
              No pending invitations
            </h2>

            <p className="
              mx-auto mt-2
              max-w-md
              text-sm
              text-muted-foreground
            ">
              You don't currently have any invitations
              waiting for your response.
            </p>

            <button
              onClick={() =>
                navigate(routes.WorkspacesRoute.to)
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
              View Workspaces
            </button>
          </div>
        )}

        {/* Invitations */}
        {invitations.length > 0 && (
          <div className="
            mt-8
            space-y-4
          ">
            {invitations.map(
              (invitation: any) => (
                <div
                  key={invitation.id}
                  className="
                    rounded-2xl
                    border border-border
                    bg-card
                    p-5
                    shadow-sm
                    sm:p-6
                  "
                >
                  <div className="
                    flex flex-col
                    gap-5
                    sm:flex-row
                    sm:items-center
                    sm:justify-between
                  ">

                    {/* Organization */}
                    <div className="
                      flex
                      min-w-0
                      items-center
                      gap-4
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
                        {invitation.organization
                          ?.icon || "🔎"}
                      </div>

                      <div className="min-w-0">
                        <h2 className="
                          truncate
                          text-lg font-semibold
                          text-foreground
                        ">
                          {invitation.organization?.name}
                        </h2>

                        <p className="
                          mt-1
                          text-sm
                          text-muted-foreground
                        ">
                          You've been invited to join
                          this workspace.
                        </p>

                        <div className="
                          mt-2
                          flex flex-wrap
                          items-center
                          gap-2
                        ">
                          <span className="
                            rounded-full
                            bg-primary/10
                            px-2.5 py-1
                            text-[11px]
                            font-semibold
                            text-primary
                          ">
                            {invitation.role}
                          </span>

                          {invitation.inviterName && (
                            <span className="
                              text-xs
                              text-muted-foreground
                            ">
                              Invited by{" "}
                              <span className="
                                font-medium
                                text-foreground
                              ">
                                {invitation.inviterName}
                              </span>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="
                      flex
                      w-full
                      gap-2
                      sm:w-auto
                      sm:shrink-0
                    ">
                      <button
                        onClick={() =>
                          handleDecline(invitation.id)
                        }
                        className="
                          flex-1
                          rounded-xl
                          border border-border
                          bg-background
                          px-4 py-2.5
                          text-sm font-semibold
                          text-muted-foreground
                          transition
                          hover:bg-muted
                          hover:text-foreground
                          sm:flex-none
                        "
                      >
                        Decline
                      </button>

                      <button
                        onClick={() =>
                          handleAccept(invitation.id)
                        }
                        className="
                          flex-1
                          rounded-xl
                          bg-primary
                          px-5 py-2.5
                          text-sm font-semibold
                          text-primary-foreground
                          shadow-sm
                          transition
                          hover:opacity-90
                          sm:flex-none
                        "
                      >
                        Accept & Join
                      </button>
                    </div>

                  </div>
                </div>
              )
            )}
          </div>
        )}

      </div>
    </div>
  );
}