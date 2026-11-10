import { useState } from "react";
import {
  getUserOrganizations,
  setActiveOrganization,
  getOnboardingStatus,
  deleteOrganization,
  useAction,
  useQuery,
} from "wasp/client/operations";
import { useAuth } from "wasp/client/auth";
import { useNavigate } from "react-router";
import { routes } from "wasp/client/router";

export function WorkspacesPage() {
  const { data: user, isLoading } = useAuth();
  const navigate = useNavigate();

  const [deletingOrgId, setDeletingOrgId] = useState<string | null>(null);

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

  const switchOrganization = useAction(setActiveOrganization);
  const deleteOrgAction = useAction(deleteOrganization);

  const handleSwitch = async (orgId: string) => {
    await switchOrganization({ orgId });
    navigate("/dashboard");
  };

  const handleDelete = async (orgId: string, orgName: string) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${orgName}"?\n\nThis will permanently delete all associated SEO data, crawl reports, and keyword rankings.`
    );

    if (!confirmed) return;

    try {
      setDeletingOrgId(orgId);
      await deleteOrgAction({ orgId });
    } catch (err: any) {
      alert(err?.message || "Failed to delete workspace. Please try again.");
    } finally {
      setDeletingOrgId(null);
    }
  };

  if (isLoading || organizationsLoading || !user) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-background">
        <p className="text-sm text-muted-foreground">Loading workspaces...</p>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-background px-4 py-10 sm:px-6 sm:py-12 lg:px-8">
      <div className="mx-auto w-full max-w-6xl">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              Your Workspaces
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Switch between your SEO projects and manage your workspaces.
            </p>
          </div>

          <div className="flex flex-row gap-2">
            <button
              onClick={() => navigate(routes.InvitationsRoute.to)}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-semibold text-foreground transition hover:bg-muted sm:w-auto"
            >
              Pending Invitations
              <span className="rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold text-primary-foreground">
                {pendingInvitations.length}
              </span>
            </button>

            <button
              onClick={() => navigate(routes.OnboardingRoute.to)}
              className="w-full rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition hover:opacity-90 sm:w-auto"
            >
              + Create Workspace
            </button>
          </div>
        </div>

        {/* Workspace list */}
        {!organizations || organizations.length === 0 ? (
          <div className="mt-8 rounded-2xl border border-border bg-card p-8 text-center shadow-sm">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-2xl">
              🔎
            </div>
            <h2 className="mt-4 text-lg font-semibold text-foreground">
              No workspaces
            </h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
              Create a workspace to start managing your SEO projects.
            </p>
            <button
              onClick={() => navigate(routes.CreateOrganizationRoute.to)}
              className="mt-6 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
            >
              Create Workspace
            </button>
          </div>
        ) : (
          <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {organizations.map((membership: any) => {
              const workspace = membership.organization;
              const isCurrent = workspace.id === currentOrganizationId;
              const isOwner = membership.role === "OWNER";
              const isDeleting = deletingOrgId === workspace.id;

              return (
                <div
                  key={workspace.id}
                  className={`flex flex-col rounded-2xl border bg-card p-5 shadow-sm transition-all ${
                    isCurrent
                      ? "border-primary ring-1 ring-primary/20"
                      : "border-border hover:shadow-md"
                  }`}
                >
                  {/* Top */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-primary/20 bg-primary/10 text-2xl">
                      {workspace.icon || "🔎"}
                    </div>

                    <div className="flex items-center gap-2">
                      {isCurrent && (
                        <span className="rounded-full bg-primary/10 px-2.5 py-1 text-[10px] font-semibold text-primary">
                          CURRENT
                        </span>
                      )}

                      <span className="rounded-full bg-muted px-2.5 py-1 text-[10px] font-semibold text-muted-foreground">
                        {membership.role}
                      </span>
                    </div>
                  </div>

                  {/* Details */}
                  <div className="mt-5 flex-1">
                    <h2 className="truncate text-lg font-semibold text-foreground">
                      {workspace.name}
                    </h2>

                    <p className="mt-1 truncate font-mono text-xs text-muted-foreground">
                      /{workspace.slug}
                    </p>

                    <p className="mt-4 line-clamp-3 min-h-[60px] text-sm leading-5 text-muted-foreground">
                      {workspace.description ||
                        "No workspace description provided."}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="mt-5 flex items-center gap-2 border-t border-border pt-4">
                    <button
                      onClick={() => handleSwitch(workspace.id)}
                      disabled={isDeleting}
                      className="flex-1 rounded-xl border border-border bg-background px-4 py-2.5 text-sm font-semibold text-foreground transition hover:bg-muted disabled:opacity-50"
                    >
                      Open workspace →
                    </button>

                    {isOwner && (
                      <button
                        type="button"
                        aria-label={`Delete ${workspace.name}`}
                        title="Delete workspace"
                        disabled={isDeleting}
                        onClick={() => handleDelete(workspace.id, workspace.name)}
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-border bg-background text-muted-foreground transition hover:border-destructive hover:bg-destructive/10 hover:text-destructive disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {isDeleting ? (
                          <svg
                            className="h-4 w-4 animate-spin text-destructive"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            />
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                            />
                          </svg>
                        ) : (
                          <svg
                            className="h-4 w-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            strokeWidth={1.8}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
                            />
                          </svg>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}