import { PrismaClient } from "@prisma/client";

export async function getMembership(
    prisma: PrismaClient,
    userId: string,
    orgId: string
) {
    return prisma.membership.findUnique({
        where: {
            userId_orgId: {
                userId,
                orgId
            }
        }
    })


}


export async function isOwner(
    prisma: PrismaClient,
    userId: string,
    orgId: string
) {
    const membership = await getMembership(prisma, userId, orgId);

    return membership?.role === "OWNER";
}

export async function isAdmin(
    prisma: PrismaClient,
    userId: string,
    orgId: string
) {
    const membership = await getMembership(prisma, userId, orgId);

    return membership?.role === "OWNER" ||
    membership?.role === "ADMIN";
}

export async function canManageMembers(
    prisma: PrismaClient,
    userId: string,
    orgId: string
) {
    return isAdmin(prisma, userId, orgId);
}