import { boolean, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { organization } from "./auth";

/**
 * A landlord's saved payout destination (M-Pesa phone or bank account).
 * Created once, referenced by many `paystack_payouts`.
 */
export const payoutDestinations = pgTable("payout_destinations", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organization_id")
    .notNull()
    .references(() => organization.id, { onDelete: "cascade" }),
  type: text("type").notNull(), // mpesa | bank
  // For mpesa:
  phone: text("phone"),
  // For bank:
  bankCode: text("bank_code"),
  bankName: text("bank_name"),
  accountNumber: text("account_number"),
  accountName: text("account_name"),
  paystackRecipientCode: text("paystack_recipient_code"), // e.g. RCP_xxxxxx from Paystack Transfers API
  isDefault: boolean("is_default").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type PayoutDestination = typeof payoutDestinations.$inferSelect;
export type NewPayoutDestination = typeof payoutDestinations.$inferInsert;
