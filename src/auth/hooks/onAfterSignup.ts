import type { OnAfterSignupHook } from "wasp/server/auth";

export const onAfterSignup: OnAfterSignupHook = async ({
    user,
    prisma
}) => {
    //await createInitialOrganization(prisma, user.id);
}