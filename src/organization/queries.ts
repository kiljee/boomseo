import { HttpError } from "wasp/server";
import { getCurrentOrganization as getCurrentOrganizationService } from "../server/organizations";

export const getCurrentOrganization = async (
    _args: void,
    context: any
) => {
    if(!context.user) {
        throw new HttpError(401);
    }

    return getCurrentOrganizationService(
        context.entities,
        context.user.id
    );
}

export const listMembers = async (
    _args : void,
    context: any
) => {
    if(!context.user) {
        throw new HttpError(401);
    }

    const organization = await context.entities.Organization.findUnique({
        where: {
            id: context.user.activeOrganizationId
        }
    });

    if(!organization) {
        throw new HttpError(404, "No active organization.");
    }

    return context.entities.Membership.findMany({
        where: {
            orgId: organization.id
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