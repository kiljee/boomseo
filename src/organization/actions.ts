import { HttpError } from "wasp/server";
import { Role } from "@prisma/client";

export const inviteUser = async (
    args: {
        email: string,
        role: Role
    },
    context: any
) => {
    if(!context.user) {
        throw new HttpError(401);
    }

    const orgId = context.user.activeOrganizationId;

    if(!orgId) {
        throw new HttpError(400, "No active organization");
    }

    const requester = await context.entities.Membership.findUnique({
        where: {
            userId_orgId: {
                userId: context.user.id,
                orgId
            }
        }
    });

    if(
        !requester || (requester.role !== "OWNER" && requester.role !== "ADMIN")
    ) {
       throw new HttpError(403, "Not allowed");
    }

    const user = await context.entities.User.findUnique({
        where: {
            email: args.email
        }
    });

    if(!user) {
        throw new HttpError(404, "User not found");
    }

    const existing = await context.entities.Membership.findUnique({
        where: {
            userId_orgId: {
                userID: user.id,
                orgId
            }
        }
    });

    if(existing) {
        throw new HttpError(400, "User already belongs to organization");
    }

    return context.entities.Membership.create({
        data: {
            userId: user.id,
            orgId,
            role: args.role
        }
    })



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