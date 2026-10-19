import {
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import { organization } from "./auth";
import { invoices } from "./invoices";

/**
 * Every attempt to collect a payment via Paystack, regardless of outcome.
 * Multiple charges can exist for one invoice (e.g. a retry after a failure).
 * `paystackId` is Paystack's transaction id and `reference` is our unique idempotency key.
 */
export const paystackCharges = pgTable(
  "paystack_charges",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    invoiceId: uuid("invoice_id")
      .notNull()
      .references(() => invoices.id, { onDelete: "cascade" }),
    reference: text("reference").notNull(), // our own idempotency key, sent to Paystack
    paystackId: text("paystack_id"), // Paystack's transaction id / access_code
    amount: integer("amount").notNull(),
    currency: text("currency").notNull().default("KES"),
    channel: text("channel").notNull(), // mpesa | card | bank | mobile_money
    customerEmail: text("customer_email"),
    customerPhone: text("customer_phone"),
    status: text("status").notNull().default("pending"), // pending | successful | failed
    rawResponse: jsonb("raw_response").$type<Record<string, unknown>>(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    uniqReference: uniqueIndex("uniq_paystack_charges_reference").on(table.reference),
    paystackIdIdx: index("idx_paystack_charges_paystack_id").on(table.paystackId),
    invoiceIdx: index("idx_paystack_charges_invoice_id").on(table.invoiceId),
  })
);

export type PaystackCharge = typeof paystackCharges.$inferSelect;
export type NewPaystackCharge = typeof paystackCharges.$inferInsert;
