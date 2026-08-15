import { HttpError } from "wasp/server";
import { getCurrentOrganization as getCurrentOrganizationService } from "../server/organizations";
import { Membership, Organization } from ".prisma/client";
import {requireUser, requireMembership} from "./helpers";


export const getCurrentOrganization = async (
    _args: void,
    context: any
) : Promise<Organization> => {
    const { organizationId } = await requireMembership(context);

    const organization = await context.entities.Organization.findUnique({
        where: {
            id: organizationId
        }
    });

    if(!organization) {
        throw new HttpError(404, "Organization not found");
    }

    return organization;
}

export const listMembers = async (
    _args : void,
    context: any
) => {
    const { organizationId } = await requireMembership(context);

    if(!context.user) {
        throw new HttpError(401);
    }



    return context.entities.Membership.findMany({
        where: {
            orgId: organizationId
        },
        include: {
            user: {
                select: {
                    id:true,
                    username:true,
                    email:true
                }
            }
        }
    });
}

type MembershipWithOrganization = Membership & {
    organization: Organization;
};

/*export const getUserOrganizations = async (
    _args : void,
    context: any
) : Promise<MembershipWithOrganization[]> => {
    if(!context.user) {
        throw new HttpError(401);
    }

    return context.entities.Membership.findMany({
        where: {
            userId: context.user.id
        },
        include: {
            organization: true
        }
    });
}*/

export const getUserOrganizations = async (
    _args : void,
    context: any
) => {
    const user = requireUser(context);

    return context.entities.Membership.findMany({
        where: {
            userId: user.id,
        },
        include: {
            organization: true
        },
    });

}


export async function getOnboardingStatus(
    _args : void,
    context : any
) {
    const user = requireUser(context);

    const memberships = await context.entities.Membership.findMany({
        where: {
            userId: user.id
        }
    });

    const invitations = await context.entities.OrganizationInvitation.findMany({
        where: {
            email: user.email,
            acceptedAt: null
        },
        include: {
            organization: true
        }
    })

    return {
        hasWorkspace: memberships.length > 0,
        invitations
    }
}

export const listInvitations = async (
  _args: void,
  context: any
) => {
    const user = requireUser(context);

    return context.entities.OrganizationInvitation.findMany({
        where: {
            email: user.email,
            //activeOrganizationId: user.activeOrganizationId,
            acceptedAt: null,
        },
        include: {
            organization: true
        },
        orderBy: {
          expiresAt: "desc",
        },
    });
};


export const listCompanyInvitations = async (
  _args: void,
  context: any
) => {
    const user = requireUser(context);

    if(!user.activeOrganizationId) {
        throw new HttpError(
            400,
            "No workspace selected"
        )
    }

    return context.entities.OrganizationInvitation.findMany({
        where: {
            activeOrganizationId: user.activeOrganizationId,
        },
        orderBy: {
          expiresAt: "desc",
        },
    });
};


export const getOnboardingStep = async (
    _args: void,
    context: any
) => {
    if(!context.user) {
        throw new HttpError(401);
    }

    const user = await context.entities.User.findUnique({
        where: {
            id: context.user.id,
        },
    });

    if(!user?.activeOrganizationId) {
        return {
            hasWorkspace: false,
            step: 1,
            onboardingComplete: false
        };
    }

    const organization = await context.entities.Organization.findUnique({
        where: {
            id: user.activeOrganizationId
        },
        select: {
            id: true,
            onboardingStep: true,
            onboardingComplete: true
        },
    });

    if(!organization) {
        return {
            hasWorkspace: false,
            step: 1,
            onboardingComplete: false
        };
    }

    return {
        hasWorkspace: true,
        step: organization.onboardingStep,
        onboardingComplete: organization.onboardingComplete,
    };
}