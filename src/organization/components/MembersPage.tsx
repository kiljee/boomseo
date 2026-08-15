import { useState } from "react";
import {
  useAction,
  useQuery,
  listMembers,
  listInvitations,
  listCompanyInvitations,
  inviteUser,
  removeMember,
  deleteInvitation,
} from "wasp/client/operations";
import { useAuth } from 'wasp/client/auth';

import { Role } from "@prisma/client";

export function MembersPage() {
  const { data: user, isLoading: loadingUser } = useAuth();

  const {
    data: members,
    isLoading: loadingMembers,
    refetch: refetchMembers,
  } = useQuery(listMembers);

  /*const {
    data: invitations,
    isLoading: loadingInvitations,
    refetch: refetchInvitations,
  } = useQuery(listInvitations);*/

  const {
    data: invitations,
    isLoading: loadingInvitations,
    refetch: refetchInvitations
  } = useQuery(listCompanyInvitations);

  const invite = useAction(inviteUser);
  const remove = useAction(removeMember);
  const cancel = useAction(deleteInvitation);

  const [email, setEmail] = useState("");
  const [role, setRole] = useState<Role>("MEMBER");
  const [activeOrganizationId, setActiveOrganizationId] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault();

    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      setError("Please enter an email address.");
      return;
    }

    setError("");
    setSending(true);

    try {
      await invite({
        email: trimmedEmail,
        role,
      });

      setEmail("");
      setRole("MEMBER");

      await refetchInvitations();
    } catch (err: any) {
      setError(
        err?.message || "Failed to send invitation."
      );
    } finally {
      setSending(false);
    }
  }

  async function handleRemove(id: string) {
    if (!confirm("Remove this member?")) {
      return;
    }

    try {
      await remove({
        userId: id,
      });

      await refetchMembers();
    } catch (err: any) {
      setError(
        err?.message || "Failed to remove member."
      );
    }
  }

  async function handleCancel(id: string) {
    try {
      await cancel({
        invitationId: id,
      });

      await refetchInvitations();
    } catch (err: any) {
      setError(
        err?.message || "Failed to cancel invitation."
      );
    }
  }

  if (loadingMembers || loadingInvitations || loadingUser || !user) {
    return (
      <div className="
        min-h-[calc(100vh-4rem)]
        bg-background
        flex items-center justify-center
      ">
        <p className="text-sm text-muted-foreground">
          Loading team...
        </p>
      </div>
    );
  }

  const currentMembership = members?.find(
    (m: any) => m.userId === user.id
  );

  const canManage = 
  currentMembership?.role === "OWNER" ||
  currentMembership?.role === "ADMIN";

  console.log("canManage is "+canManage);

  console.log("role:", currentMembership?.role);
console.log("is owner:", currentMembership?.role === "OWNER");
console.log("is admin:", currentMembership?.role === "ADMIN");

  console.log("user:", user);
console.log("members:", members);
console.log(
  "current membership:",
  members?.find((m: any) => m.userId === user.id)
);


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
        max-w-4xl
      ">

        {/* Header */}
        <div>
          <h1 className="
            text-3xl font-bold
            tracking-tight
            text-foreground
          ">
            Team Members
          </h1>

          <p className="
            mt-2
            text-sm
            text-muted-foreground
          ">
            Manage your organization members and invitations.
          </p>
        </div>

        {error && (
          <div className="
            mt-6
            rounded-xl
            border border-destructive/20
            bg-destructive/10
            px-4 py-3
            text-sm
            text-destructive
          ">
            {error}
          </div>
        )}

        {canManage && (

        <>

        {/* Invite */}
        <div className="
          mt-8
          rounded-2xl
          border border-border
          bg-card
          p-5
          shadow-sm
          sm:p-6
        ">
          <div>
            <h2 className="
              text-lg font-semibold
              text-foreground
            ">
              Invite team member
            </h2>

            <p className="
              mt-1
              text-sm
              text-muted-foreground
            ">
              Send an invitation by email and assign
              their workspace role.
            </p>
          </div>

          <form
            onSubmit={handleInvite}
            className="
              mt-5
              flex flex-col gap-3
              sm:flex-row
            "
          >
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError("");
              }}
              placeholder="colleague@company.com"
              className="
                min-w-0 flex-1
                rounded-xl
                border border-input
                bg-background
                px-4 py-2.5
                text-sm text-foreground
                outline-none
                placeholder:text-muted-foreground
                focus:border-primary
                focus:ring-1
                focus:ring-primary
              "
            />

            <select
              value={role}
              onChange={(e) =>
                setRole(e.target.value as Role)
              }
              className="
                rounded-xl
                border border-input
                bg-background
                px-3 py-2.5
                text-sm text-foreground
                outline-none
                focus:border-primary
              "
            >
              <option value="MEMBER">
                MEMBER
              </option>
              <option value="ADMIN">
                ADMIN
              </option>
            </select>

            <button
              type="submit"
              disabled={
                sending || !email.trim()
              }
              className="
                rounded-xl
                bg-primary
                px-5 py-2.5
                text-sm font-semibold
                text-primary-foreground
                transition
                hover:opacity-90
                disabled:cursor-not-allowed
                disabled:opacity-50
              "
            >
              {sending
                ? "Sending..."
                : "Send Invitation"}
            </button>
          </form>

          <p className="
            mt-3
            text-xs
            text-muted-foreground
          ">
            ADMIN members can help manage the workspace.
            MEMBER members have regular workspace access.
          </p>
        </div>

        {/* Pending Invitations */}
        <div className="
          mt-6
          rounded-2xl
          border border-border
          bg-card
          shadow-sm
        ">
          <div className="
            border-b border-border
            p-5
            sm:p-6
          ">
            <div className="
              flex items-center
              justify-between
            ">
              <div>
                <h2 className="
                  text-lg font-semibold
                  text-foreground
                ">
                  Pending Invitations
                </h2>

                <p className="
                  mt-1
                  text-sm
                  text-muted-foreground
                ">
                  Invitations that haven't been accepted yet.
                </p>
              </div>

              {invitations &&
                invitations.length > 0 && (
                  <span className="
                    rounded-full
                    bg-primary/10
                    px-2.5 py-1
                    text-xs font-semibold
                    text-primary
                  ">
                    {invitations.length}
                  </span>
                )}
            </div>
          </div>

          {!invitations ||
          invitations.length === 0 ? (
            <div className="
              p-6
              text-center
              text-sm
              text-muted-foreground
            ">
              No pending invitations.
            </div>
          ) : (
            <div>
              {invitations.map(
                (invitation: any) => (
                  <div
                    key={invitation.id}
                    className="
                      flex flex-col gap-3
                      border-b border-border
                      p-5
                      last:border-0
                      sm:flex-row
                      sm:items-center
                      sm:justify-between
                    "
                  >
                    <div>
                      <div className="
                        font-medium
                        text-foreground
                      ">
                        {invitation.email}
                      </div>

                      <div className="
                        mt-1
                        text-xs
                        text-muted-foreground
                      ">
                        Role:{" "}
                        <span className="
                          font-medium
                          text-foreground
                        ">
                          {invitation.role}
                        </span>
                        &nbsp;
                        Expires at:
                        <span className="
                          font-medium
                          text-foreground
                        ">
                          {invitation.expiresAt.toLocaleDateString()}
                        </span>
                      </div>

          
                    </div>
                    {!invitation.accepted &&
                      <button
                        onClick={() =>
                          handleCancel(invitation.id)
                        }
                        className="
                          rounded-lg
                          border border-border
                          px-3 py-2
                          text-xs font-medium
                          text-muted-foreground
                          transition
                          hover:bg-muted
                          hover:text-destructive
                        "
                      >
                        Cancel
                      </button>
                    }

                    {invitation.accepted &&
                      <span className="
                          rounded-full
                          bg-green-100
                          px-2.5 py-1
                          text-[10px]
                          font-semibold
                          text-muted-foreground
                        ">
                          Accepted
                        </span>
                    }
                  </div>
                )
              )}
            </div>
          )}
        </div>

        </>

        )}

        {/* Members */}
        <div className="
          mt-6
          rounded-2xl
          border border-border
          bg-card
          shadow-sm
        ">
          <div className="
            border-b border-border
            p-5
            sm:p-6
          ">
            <h2 className="
              text-lg font-semibold
              text-foreground
            ">
              Members
            </h2>

            <p className="
              mt-1
              text-sm
              text-muted-foreground
            ">
              People who currently belong to this workspace.
            </p>
          </div>

          {!members ||
          members.length === 0 ? (
            <div className="
              p-6
              text-center
              text-sm
              text-muted-foreground
            ">
              No members found.
            </div>
          ) : (
            <div>
              {members.map(
                (member: any) => (
                  <div
                    key={member.id}
                    className="
                      flex flex-col gap-3
                      border-b border-border
                      p-5
                      last:border-0
                      sm:flex-row
                      sm:items-center
                      sm:justify-between
                    "
                  >
                    <div>
                      <div className="
                        font-medium
                        text-foreground
                      ">
                        {member.user.email}
                      </div>

                      <div className="
                        mt-1
                        text-xs
                        text-muted-foreground
                      ">
                        Role:{" "}
                        <span className="
                          font-medium
                          text-foreground
                        ">
                          {member.role}
                        </span>
                      </div>
                    </div>

                    {canManage && member.role !== "OWNER" && (
                      <button
                        onClick={() =>
                          handleRemove(member.id)
                        }
                        className="
                          rounded-lg
                          border border-border
                          px-3 py-2
                          text-xs font-medium
                          text-muted-foreground
                          transition
                          hover:bg-destructive/10
                          hover:text-destructive
                        "
                      >
                        Remove
                      </button>
                    )}
                  </div>
                )
              )}
            </div>
          )}
        </div>

        {/* Owner notice */}
        <div className="
          mt-6
          rounded-xl
          border border-primary/20
          bg-primary/5
          p-4
          text-xs
          text-muted-foreground
        ">
          <span className="
            font-semibold
            text-foreground
          ">
            Workspace permissions:
          </span>{" "}
          Owners have full workspace control. Admins can
          help manage the team, while Members have regular
          workspace access.
        </div>

      </div>
    </div>
  );
}