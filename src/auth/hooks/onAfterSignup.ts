import type { OnAfterSignupHook } from "wasp/server/auth";
import { createInitialOrganization } from "../../server/organizations";

export const onAfterSignup: OnAfterSignupHook = async ({
    user,
    prisma
}) => {
    await createInitialOrganization(prisma, user.id);
}