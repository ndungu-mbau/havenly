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
import { payoutDestinations } from "./destinations";
import { invoices } from "./invoices";

/**
 * Every attempt to disburse money to a landlord via Paystack Transfers.
 */
export const paystackPayouts = pgTable(
  "paystack_payouts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    destinationId: uuid("destination_id")
      .notNull()
      .references(() => payoutDestinations.id, { onDelete: "cascade" }),
    invoiceId: uuid("invoice_id").references(() => invoices.id),
    reference: text("reference").notNull(),
    paystackTransferCode: text("paystack_transfer_code"),
    paystackId: text("paystack_id"),
    amount: integer("amount").notNull(),
    currency: text("currency").notNull().default("KES"),
    narration: text("narration"),
    status: text("status").notNull().default("pending"), // pending | successful | failed | reversed
    rawResponse: jsonb("raw_response").$type<Record<string, unknown>>(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    uniqPayoutReference: uniqueIndex("uniq_paystack_payouts_reference").on(table.reference),
    paystackIdIdx: index("idx_paystack_payouts_paystack_id").on(table.paystackId),
  })
);

export type PaystackPayout = typeof paystackPayouts.$inferSelect;
export type NewPaystackPayout = typeof paystackPayouts.$inferInsert;
