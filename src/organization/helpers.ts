import { HttpError } from "wasp/server";
import { Role } from "@prisma/client";

type Context = {
    user?: {
        id: string;
        email?: string;
        activeOrganizationId: string;
    },

    entities: {
        User: any;
        Membership: any;
    }
}

//Makes sure a user is authenticated
export function requireUser(context: Context) {
    if(!context.user) {
        throw new HttpError(401, "You must be logged in.");
    }

    return context.user;
}


//Gets the authenticated user and their active organization
export async function requireActiveOrganization(context: Context) {
    const user = requireUser(context);

    const dbUser = await context.entities.User.findUnique({
        where: {
            id: user.id
        }
    });

    if(!dbUser) {
        throw new HttpError(401, "User not found");
    }

    if(!dbUser.activeOrganizationId) {
        throw new HttpError(400, "No active organization selected.");
    }

    return {
        user: dbUser,
        organizationId: dbUser.activeOrganizationId
    };

}

//Make sure the user belongs to their active organization.
export async function requireMembership(context: Context) {
    const { user, organizationId } = await requireActiveOrganization(context);

    const membership = await context.entities.Membership.findUnique({
        where: {
            userId_orgId: {
                userId: user.id,
                orgId: organizationId
            }
        }
    });

    if(!membership) {
        throw new HttpError(403, "You are not a member of this organization");
    }

    return {
        user,
        organizationId,
        membership
    }
}

//Make sure the user has one of the required roles.

export async function requireRole(
    context: Context,
    allowedRoles: Role[]
) {
    const result = await requireMembership(context);

    if(!allowedRoles.includes(result.membership.role)) {
        throw new HttpError(403, "You do not have permission to perform this action");
    }

    return result;
}

//Shortcut for actions that only owners can perform
export function requireOwner(context: Context) {
    return requireRole(context, [Role.OWNER]);
}


//Shortcut for actions that owners and admins can perform.
export function requireAdmin(context: Context) {
    return requireRole(context, [Role.OWNER, Role.ADMIN]);
}


export async function createInvitation(
  args: {
    email: string;
    role: Role;
    activeOrganizationId: string;
    token: string;
    expiresAt: Date;
    accepted: Boolean;
  },
  context: any
) {
    if(!context.user) {
        throw new HttpError(401);
    }

    const orgId = args.activeOrganizationId;//context.user.activeOrganizationId;

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
                userId: user.id,
                orgId
            }
        }
    });

    if(existing) {
        throw new HttpError(400, "User already belongs to organization");
    }

    console.log("Email: "+args.email);
    console.log("Role: "+args.role);
    console.log("activeOrganizationId: "+args.activeOrganizationId)

    console.log(Object.keys(context.entities));

    return context.entities.OrganizationInvitation.create({
        data: {
            email: args.email,
            role: args.role,
            activeOrganizationId: args.activeOrganizationId,
            token: args.token,
            expiresAt: args.expiresAt,
            accepted: args.accepted
        }
    })
}