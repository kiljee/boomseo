import { action, query, type Spec } from "@wasp.sh/spec";

import {
    getCurrentOrganization,
    getOnboardingStatus,
    getUserOrganizations,
    listInvitations,
    listCompanyInvitations,
    listMembers,
    getOnboardingStep
} from "./queries" with { type: "ref" }

import {
    inviteUser,
    changeMemberRole,
    removeMember,
    setActiveOrganization,
    createOrganization,
    acceptInvitation,
    cancelInvitation,
    leaveOrganization,
    deleteInvitation
} from "./actions" with { type: "ref" }

export const organizationSpec : Spec = [
    query(getCurrentOrganization, {
        entities: ["User", "Organization", "Membership"]
    }),

    query(listMembers, {
        entities: ["User", "Organization", "Membership"]
    }),

    query(getUserOrganizations, {
        entities: ["User", "Membership", "Organization"]
    }),

    query(getOnboardingStatus, {
        entities: [ "User", "Membership", "Organization", "OrganizationInvitation"],
    }),

    query(listInvitations, {
        entities: ["User", "Membership", "OrganizationInvitation"]
    }),

    query(listCompanyInvitations, {
        entities: ["User", "Membership", "OrganizationInvitation"]
    }),

    query(getOnboardingStep, {
        entities: ["User", "Organization"]
    }),

    action(inviteUser, {
        entities: ["User", "Membership", "OrganizationInvitation"]
    }),

    action(changeMemberRole, {
        entities: ["Membership"]
    }),

    action(removeMember, {
        entities: ["Membership"]
    }),
    
    action(setActiveOrganization, {
        entities: ["User", "Membership"]
    }),
    
    action(createOrganization, {
        entities: ["User", "Organization", "Membership"]
    }),

    action(acceptInvitation, {
        entities: ["User", "Organization", "Membership", "OrganizationInvitation"]
    }),

    action(cancelInvitation, {
        entities: ["User", "Membership", "OrganizationInvitation"]
    }),

    action(leaveOrganization, {
        entities: ["User", "Membership"]
    }),

    action(deleteInvitation, {
        entities: ["User", "OrganizationInvitation"]
    })

];