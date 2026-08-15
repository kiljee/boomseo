import { PrismaClient, Role } from '@prisma/client';
import { canManageMembers } from './permissions';

//const prisma = new PrismaClient();

function slugify(name: string) {
    return name
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '')
}

/*export async function createInitialOrganization(prisma : PrismaClient, userId: string) {
    const user = await prisma.user.findUnique({
        where: { id: userId }
    });

    if(!user) {
        throw new Error("User not found");
    }

    const baseName = 
        user.username ??
        user.email?.split("@")[0] ??
        "Workspace"

    const orgName = `${baseName}'s Workspace`;

    const slug = `${slugify(baseName)}-${Date.now()}`;

    const organization = await prisma.organization.create({
        data: {
            name: orgName,
            slug,

            memberships: {
                create: {
                    userId,
                    role: "OWNER"
                }
            }
        }

    });

    await prisma.user.update({
        where: { 
            id: userId
        },
        data: {
            activeOrganizationId: organization.id
        }
    });
    

    return organization;
}*/

export async function getCurrentOrganization(prisma : PrismaClient, userId: string) {
    const user = await prisma.user.findUnique({
        where: {
            id: userId
        },
        include: {
            activeOrganization: true
        }
    });

    if(!user?.activeOrganization) {
        throw new Error("No active organization.");
    }
    
    return user.activeOrganizationId;
}

//invite user to organization

export async function inviteUser(
    prisma: PrismaClient,
    currentUserId: string,
    orgId: string,
    email: string,
    role: Role
) {
    if(!(await canManageMembers(prisma, currentUserId, orgId))) {
        throw new Error("Unauthorized");
    }

    const user = await prisma.user.findUnique({
        where: { email }
    })

    if(!user) {
        throw new Error("User not found");
    }

    const existing = await prisma.membership.findUnique({
        where: {
            userId_orgId: {
                userId: user.id,
                orgId
            }
        }
    });

    if(existing)
        throw new Error("Already a member");

    return prisma.membership.create({
        data: {
            userId: user.id,
            orgId,
            role
        }
    });
}

export async function listMembers(prisma : PrismaClient, orgId: string) {
    return prisma.membership.findMany({
        where: {
            orgId
        },
        include: {
            user: true
        }

    });
}

export async function removeMember(prisma : PrismaClient, currentUserId : string, userId : string, orgId: string) {
    if(!(await canManageMembers(prisma, currentUserId, orgId))) {
        throw new Error("Unauthorized");
    }
    
    const member = await prisma.membership.findUnique({
        where: {
            userId_orgId: {
                userId,
                orgId
            }
        }

    });

    if(!member) {
        throw new Error("Member not found");
    }

    if(member.role === "OWNER") {
        const ownerCount = await prisma.membership.count({
            where: {
                orgId,
                role: "OWNER"
            }
        })

        if(ownerCount === 1) {
            throw new Error("Cannot remove the last owner");
        }
    }



    return prisma.membership.delete({
        where: {
            userId_orgId: {
                userId,
                orgId
            }
        }
    });
}

export async function changeMemberRole(
    prisma : PrismaClient,
    currentUserId : string,
    userId : string,
    orgId: string,
    newRole: Role) {
        if(!(await canManageMembers(prisma, currentUserId, orgId))) {
            throw new Error("Unauthorized");
        }

        const member = await prisma.membership.findUnique({
            where: {
                userId_orgId: {
                    userId,
                    orgId
                }
            }
        });

        if(!member) {
            throw new Error("Member not found");
        }

        if(member.role === "OWNER" && newRole !== "OWNER") {
            const ownerCount = await prisma.membership.count( {
                where: {
                    orgId,
                    role: "OWNER"
                }
            })
            if(ownerCount === 1) {
                throw new Error("Cannot demote the last owner");
            }
        }

        return prisma.membership.update({
            where: {
                userId_orgId: {
                    userId,
                    orgId
                },
            },
            data: {
                role: newRole
            }
        });
}

export async function setActiveOrganization(
    prisma : PrismaClient,
    userId : string,
    orgId: string) {
        const membership = await prisma.membership.findUnique({
            where: {
                userId_orgId: {
                    userId,
                    orgId
                }
            }
        });

        if(!membership) {
            throw new Error("User is not a member of this organization");
        }

        return prisma.user.update({
            where: {
                id: userId
            },
            data: {
                activeOrganizationId: orgId
            }
        });
}


