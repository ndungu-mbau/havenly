/**
 * org-permissions.ts
 *
 * Organization-level access control — used by the organization plugin.
 *
 * This defines what a member can do INSIDE a specific organization
 * (one of a provider's fleet organizations). A single user can belong
 * to multiple organizations with a different role in each.
 *
 * ─── Org Member Roles ───────────────────────────────────────────────────────
 *
 *  owner       The person who created this org or someone they promoted.
 *              Full control: can delete the org, manage all members, and
 *              perform all operations. Stored in member.role = "owner".
 *
 *  manager     A trusted operations manager promoted by the owner.
 *              Full operational control but cannot delete the org or demote
 *              the owner. Stored in member.role = "manager".
 *
 *  landlord    A property owner in this organization.
 *              Can view and manage their own properties, collect rent,
 *              view payment history. Stored in member.role = "landlord".
 *
 *  caretaker   A caretaker assigned to specific properties.
 *              Can view and manage their assigned properties, houses,
 *              renters, and utility costs. Stored in member.role = "caretaker".
 *
 *  tenant      A renter (member) living in one of the org's properties.
 *              Can view their house, pay invoices, view payment history.
 *              Stored in member.role = "tenant".
 *
 * ─── Two-layer permission model ───────────────────────────────────────────────
 *
 *  Platform role (admin plugin)   → who you are on the platform
 *  Org role     (org plugin)      → what you can do inside ONE org
 *
 *  A user with platform role "caretaker" will typically hold org role "caretaker"
 *  inside an org — but these are stored in completely separate columns and
 *  enforced by completely separate systems.
 *
 * ─── Usage ───────────────────────────────────────────────────────────────────
 *
 *  Import { orgAc, orgRoles } into auth.ts (server).
 *  Import { orgAc, orgRoles } into auth-client.ts (client).
 */

import { createAccessControl } from 'better-auth/plugins/access';
import {
	defaultStatements,
	adminAc as orgPluginAdminAc,
	ownerAc as orgPluginOwnerAc,
} from 'better-auth/plugins/organization/access';

// ─── Statement ────────────────────────────────────────────────────────────────
//
// The org plugin's defaultStatements ships with:
//   organization: ["update", "delete"]
//   member:       ["create", "update", "delete"]
//   invitation:   ["create", "cancel"]
//   team:         ["create", "update", "delete"]
//   ac:           ["create", "read", "update", "delete"]
//
// We extend it with all domain resources, so orgAc.hasPermission() covers
// both org management and rental operations in one call.

export const orgStatement = {
	...defaultStatements,

	// ── Rental Management ─────────────────────────────────────────────────────
	properties: ['create', 'read', 'update', 'delete'] as const,
	houses: ['create', 'read', 'update', 'delete'] as const,
	renters: ['create', 'read', 'update', 'delete'] as const,
	caretakers: ['create', 'read', 'update', 'delete'] as const,

	// ── Financials ───────────────────────────────────────────────────────────
	invoices: ['create', 'read', 'update', 'delete'] as const,
	payments: ['create', 'read'] as const,
	payouts: ['create', 'read'] as const,
	payoutDestinations: ['create', 'read', 'update', 'delete'] as const,
	utilities: ['create', 'read', 'update', 'delete'] as const,

	// ── Communications ───────────────────────────────────────────────────────
	messages: ['create', 'read', 'update', 'delete'] as const,
} as const;

export const orgAc = createAccessControl(orgStatement);

// ─── Roles ────────────────────────────────────────────────────────────────────

/**
 * OWNER
 * Full access to org management and all rental operations.
 * Inherits the org plugin's ownerAc (includes organization:delete).
 */
export const orgOwner = orgAc.newRole({
	...orgPluginOwnerAc.statements,

	properties: ['create', 'read', 'update', 'delete'],
	houses: ['create', 'read', 'update', 'delete'],
	renters: ['create', 'read', 'update', 'delete'],
	caretakers: ['create', 'read', 'update', 'delete'],
	invoices: ['create', 'read', 'update', 'delete'],
	payments: ['create', 'read'],
	payouts: ['create', 'read'],
	payoutDestinations: ['create', 'read', 'update', 'delete'],
	utilities: ['create', 'read', 'update', 'delete'],
	messages: ['create', 'read', 'update', 'delete'],
});

/**
 * MANAGER (operations manager)
 * Full operational access but cannot delete the org or demote the owner.
 * Inherits the org plugin's adminAc (no organization:delete).
 */
export const orgManager = orgAc.newRole({
	...orgPluginAdminAc.statements,

	properties: ['create', 'read', 'update', 'delete'],
	houses: ['create', 'read', 'update', 'delete'],
	renters: ['create', 'read', 'update', 'delete'],
	caretakers: ['create', 'read', 'update', 'delete'],
	invoices: ['create', 'read', 'update', 'delete'],
	payments: ['create', 'read'],
	payouts: ['create', 'read'],
	payoutDestinations: ['create', 'read', 'update', 'delete'],
	utilities: ['create', 'read', 'update', 'delete'],
	messages: ['create', 'read', 'update', 'delete'],
});

/**
 * LANDLORD
 * Can view and manage their own properties and associated financials.
 * Cannot manage org-wide settings or other members' properties.
 */
export const orgLandlord = orgAc.newRole({
	organization: ['read'],
	member: ['read'],
	invitation: ['read'],
	team: [],

	// Can only access their own properties via query logic in routes
	// (the AC grants the action type, row-level security is in the query)
	properties: ['read'],
	houses: ['read'],
	renters: ['read'], // only their tenants
	caretakers: ['read'], // caretakers of their properties

	invoices: ['read'],
	payments: ['read'],
	payouts: ['read'],
	payoutDestinations: ['read'],
	utilities: ['read'],

	messages: ['read', 'create'], // can send/receive messages related to their properties
});

/**
 * CARETAKER
 * Can view and manage their assigned properties and related operations.
 * Cannot access properties they're not assigned to.
 */
export const orgCaretaker = orgAc.newRole({
	organization: ['read'],
	member: ['read'],
	invitation: [],
	team: [],

	// Can only access assigned properties via query logic in routes
	properties: ['read'],
	houses: ['read', 'update'], // can update house status, rent, etc.
	renters: ['read'], // renters in their assigned houses
	caretakers: [], // cannot manage other caretakers

	invoices: ['read'], // invoices for their properties
	payments: ['read'], // payments for their properties
	payouts: ['read'], // payouts for their properties
	payoutDestinations: [], // cannot manage payout destinations
	utilities: ['create', 'read', 'update', 'delete'], // manage utility costs

	messages: ['read', 'create'], // can communicate about their assigned properties
});

/**
 * TENANT
 * Can view their own house, lease, and pay invoices.
 * Cannot manage properties or view other tenants' data.
 */
export const orgTenant = orgAc.newRole({
	organization: ['read'],
	member: ['read'],
	invitation: [],
	team: [],

	// Can only access their own house/lease via query logic
	properties: ['read'],
	houses: ['read'], // only their assigned house
	renters: [], // cannot manage other renters
	caretakers: ['read'], // can view their caretaker's contact info

	invoices: ['read'], // can view their invoices
	payments: ['create'], // can make payments
	payouts: [], // cannot initiate payouts
	payoutDestinations: [],
	utilities: [], // cannot manage utilities

	messages: ['read', 'create'], // can communicate with property manager/caretaker
});

// ─── Roles map ────────────────────────────────────────────────────────────────
//
// The string keys ("owner", "manager", "landlord", "caretaker", "tenant") are what gets stored
// in the member.role column. We intentionally replace the default "member" role
// with the more domain-specific roles.

export const orgRoles = {
	owner: orgOwner,
	manager: orgManager,
	landlord: orgLandlord,
	caretaker: orgCaretaker,
	tenant: orgTenant,
};