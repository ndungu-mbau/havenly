import { date, integer, pgTable, text, timestamp, uniqueIndex, uuid } from "drizzle-orm/pg-core";
import { organization } from "./auth";
import { houses } from "./houses";
import { renters } from "./renters";

/**
 * Invoices issued to a tenant for a given period. These are the source of
 * truth for "rent owed" and are linked to one or more `paystack_charges` once a
 * tenant pays. Creating an invoice is what kicks off a charge attempt.
 */
export const invoices = pgTable(
  "invoices",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    houseId: uuid("house_id")
      .notNull()
      .references(() => houses.id, { onDelete: "cascade" }),
    renterId: uuid("renter_id")
      .notNull()
      .references(() => renters.id, { onDelete: "cascade" }),
    amount: integer("amount").notNull(),
    currency: text("currency").notNull().default("KES"),
    period: text("period").notNull(), // e.g. "2026-08"
    dueDate: date("due_date").notNull(),
    status: text("status").notNull().default("pending"), // pending | paid | failed | cancelled
    paidAt: timestamp("paid_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    uniqInvoicePerPeriod: uniqueIndex("uniq_invoice_per_period").on(table.houseId, table.period),
  })
);

export type Invoice = typeof invoices.$inferSelect;
export type NewInvoice = typeof invoices.$inferInsert;
