/**
 * Barrel re-export of all schema tables, types, and helpers.
 */

// Auth
export {
  userRoles,
  user,
  session,
  account,
  verification,
  authRelations,
  organization,
  member,
  memberRole,
  memberAssignment,
} from "./auth";

// Landlords
export { landlord } from "./landlords";

// Business entities
export { properties, type Property } from "./properties";
export { categories, type Category } from "./categories";
export { houses, type House, resolveHouseCategory } from "./houses";
export { renters, type Renter } from "./renters";
export { caretakers, type Caretaker } from "./caretakers";
export { payments, type Payment } from "./payments";
export { utilities } from "./utilities";

// Paystack integration
export { invoices, type Invoice, type NewInvoice } from "./invoices";
export {
  paystackCharges,
  type PaystackCharge,
  type NewPaystackCharge,
} from "./charges";
export {
  payoutDestinations,
  type PayoutDestination,
  type NewPayoutDestination,
} from "./destinations";
export {
  paystackPayouts,
  type PaystackPayout,
  type NewPaystackPayout,
} from "./payouts";
export { paystackWebhookEvents, type PaystackWebhookEvent } from "./webhooks";

// Audit
export {
  auditLog,
  type AuditLogEntry,
  type NewAuditLogEntry,
  type AuditMetadata,
} from "./audit-log";

// Messages
export {
  messages,
  type Message,
  type NewMessage,
  type MessageMetadata,
} from "./messages";
