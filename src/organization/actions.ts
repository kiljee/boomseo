import { HttpError } from "wasp/server";
import { Role } from "@prisma/client";
import { createInvitation } from "./helpers";

export const inviteUser = async (
    args: {
        email: string,
        role: Role
    },
    context: any
) => {

    return await createInvitation({
        email: args.email,
        role: args.role,
        activeOrganizationId: context.user.activeOrganizationId,
        token: crypto.randomUUID(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        accepted: false,
    }, context);
}

export const changeMemberRole = async(
    args: {
        userId : string;
        role: Role;
    },
    context: any
) => {
    if(!context.user) {
        throw new HttpError(401);
    }

    const orgId = context.user.activeOrganizationId;

    if(!orgId) {
        throw new HttpError(400);
    }

    const requester = await context.entities.Membership.findUnique({
        where: {
            userId_orgId: {
                userId: context.user.id,
                orgId
            }
        }
    });

    if(!requester || requester.role !== "OWNER") {
        throw new HttpError(403, "Only owner can change roles");
    }

    return context.entities.Membership.update({
        where: {
            userId_orgId: {
                userId: args.userId,
                orgId
            }
        },
        data: {
            role: args.role
        }
    });
}

export const removeMember = async (
    args: {
        userId : string;
    },
    context: any
) => {
    if(!context.user) {
        throw new HttpError(401);
    }

    const orgId = context.user.activeOrganizationId;

    if(!orgId) {
        throw new HttpError(400);
    }

    const requester = await context.entities.Membership.findUnique({
        where: {
            userId_orgId: {
                userId: context.user.id,
                orgId
            }
        }
    });

    if(!requester || (requester.role !== "OWNER" && requester.role !== "ADMIN")) {
        throw new HttpError(403);
    }

    const member = await context.entities.Membership.findUnique({
        where: {
            userId_orgId: {
                userId: args.userId,
                orgId
            }   
        }
    });

    if(!member) {
        throw new HttpError(404);
    }

    if(member.role === "OWNER") {
        throw new HttpError(
            400,
            "Cannot remove owner"
        );
    }

    return context.entities.Membership.delete({
        where: {
            userId_orgId: {
                userId: args.userId,
                orgId
            }
        }
    });
}

export const setActiveOrganization = async (
    args: {
        orgId : string;
    },
    context: any
) => {
    if(!context.user) {
        throw new HttpError(401);
    }

    const membership = await context.entities.Membership.findUnique({
        where: {
            userId_orgId: {
                userId: context.user.id,
                orgId: args.orgId
            }
        }
    });

    if(!membership) {
        throw new HttpError(403, "You are not a member of this organization");
    }

    return context.entities.User.update({
        where: {
            id: context.user.id
        },
        data: {
            activeOrganizationId: args.orgId
        }

    })
}

export const createOrganization = async (
    args: {
        name : string;
        slug?: string;
        icon?: string;
        description?: string;
        websiteUrl: string;
        industry: string;
        country: string;
        language: string;
        invites?: {
            email: string;
            role: "ADMIN" | "MEMBER" | "OWNER";
        }[];
    },
    context: any
) => {
    if(!context.user) {
        throw new HttpError(401);
    }

    /*const existingMembership = await context.entities.Membership.findFirst({
        where: {
            userId: context.user.id
        }
    });

    if(existingMembership) {
        throw new HttpError(400, "User already belongs to a workspace");
    }*/

    const baseSlug = args.name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-|-$/g,"");

    const slug = `${baseSlug}-${Date.now()}`;

    const organization = await context.entities.Organization.create({
        data: {
            name: args.name,
            slug,
            icon: args.icon || "🔎",
            description: args.description || null,

            websiteUrl: args.websiteUrl,
            industry: args.industry,
            country: args.country,
            language: args.language,
        }
    });

    await context.entities.Membership.create({
        data: {
            userId: context.user.id,
            orgId: organization.id,
            role: "OWNER"
        }
    });

    for(const invite of args.invites ?? []) {
        await createInvitation({
            email: invite.email,
            role: invite.role,
            activeOrganizationId: organization.id,
            token: crypto.randomUUID(),
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            accepted: false,
        }, context);

    }

    await context.entities.User.update({
        where: {
            id: context.user.id
        },
        data: {
            activeOrganizationId: organization.id
        }
    });

    return organization;
}

export const acceptInvitation = async (
    args: {
        invitationId : String
    },
    context: any
) => {
    const invitation =
        await context.entities.OrganizationInvitation.findUnique({
            where: {
                id: args.invitationId
            }
        });

    if(!invitation) {
        throw new HttpError(404);
    }

    if(
        invitation.email !== context.user.email
    ) {
        throw new HttpError(403);
    }

    await context.entities.Membership.create({
        data: {
            userId: context.user.id,
            orgId: invitation.activeOrganizationId,
            role: invitation.role
        }
    });

    await context.entities.User.update({
        where: {
            id: context.user.id
        },
        data: {
            activeOrganizationId:
                invitation.activeOrganizationId
        }
    });

    await context.entities.OrganizationInvitation.update({
        where: {
            id: invitation.id
        },
        data: {
            acceptedAt: new Date(Date.now()),
            accepted : true
        }
    });

}

export const cancelInvitation = async (
  args: {
    invitationId: string;
  },
  context: any
) => {
  if (!context.user) {
    throw new HttpError(401);
  }

  const invitation =
    await context.entities.OrganizationInvitation.findUnique({
      where: {
        id: args.invitationId,
      },
    });

  if (!invitation) {
    throw new HttpError(404, "Invitation not found");
  }

  const membership =
    await context.entities.Membership.findUnique({
      where: {
        userId_orgId: {
          userId: context.user.id,
          orgId: invitation.activeOrganizationId,
        },
      },
    });

  if (!membership) {
    throw new HttpError(403);
  }

  if (
    membership.role !== "OWNER" &&
    membership.role !== "ADMIN"
  ) {
    throw new HttpError(403);
  }

    await context.entities.OrganizationInvitation.update({
        where: {
            id: invitation.id
        },
        data: {
            acceptedAt: new Date(Date.now()),
            accepted : false
        }
    });

  return {
    success: true,
  };
};

export const leaveOrganization = async (
    _args: {},
    context: any
) => {
    if(!context.user) {
        throw new HttpError(401, "Not authenticated");
    }

    const user = await context.entities.User.findUnique({
        where: {
            id: context.user.id,
        }
    });

    if(!user?.activeOrganizationId) {
        throw new HttpError(
            400,
            "No active workspace selected"
        );
    }

    const orgId = user.activeOrganizationId;

    const membership = await context.entities.Membership.findFirst({
        where: {
            userId: context.user.id,
            orgId,
        },
    });

    if(!membership) {
        throw new HttpError(
            400,
            "You are not a member of this workspace"
        );
    }

    await context.entities.Membership.delete({
        where: {
            id: membership.id,
        },
    });

    await context.entities.User.update({
        where: {
            id: context.user.id,
        },
        data: {
            activeOrganizationId: null
        },
    });


    return {
        success: true
    };
}

export const deleteInvitation = async (
    args: { invitationId: string },
    context: any
) => {
    if(!context.user) {
        throw new HttpError(401, "Not authenticated");
    }

    const user = await context.entities.User.findUnique({
        where: {
            id: context.user.id,
        }
    });

    if(!user.activeOrganizationId) {
        throw new HttpError(400, "No workspace selected");
    }

    const invitation = await context.entities.OrganizationInvitation.findFirst({
        where: {
            id: args.invitationId,
            activeOrganizationId: user.activeOrganizationId
        },
    });

    if(!invitation) {
        throw new HttpError(404, "Invitation not found");
    }

    await context.entities.OrganizationInvitation.delete({
        where: {
            id: invitation.id
        }
    })
    return { success: true };

}