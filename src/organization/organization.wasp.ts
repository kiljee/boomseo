import { action, query, type Spec } from "@wasp.sh/spec";

import {
    getCurrentOrganization,
    listMembers
} from "./queries" with { type: "ref" }

import {
    inviteUser,
    changeMemberRole,
    removeMember,
    setActiveOrganization
} from "./actions" with { type: "ref" }

export const organizationSpec : Spec = [
    query(getCurrentOrganization, {
        entities: ["User", "Organization", "Membership"]
    }),

    query(listMembers, {
        entities: ["User", "Organization", "Membership"]
    }),

    action(inviteUser, {
        entities: ["User", "Membership"]
    }),

    action(changeMemberRole, {
        entities: ["Membership"]
    }),

    action(removeMember, {
        entities: ["Membership"]
    }),
    
    action(setActiveOrganization, {
        entities: ["User", "Membership"]
    })
];