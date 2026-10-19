import { date, integer, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { organization } from "./auth";
import { houses } from "./houses";
import { renters } from "./renters";

export const payments = pgTable("payments", {
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
  paymentDate: date("payment_date").notNull(),
  period: text("period").notNull(),
  method: text("method").notNull().default("Bank transfer"),
  status: text("status").notNull().default("Paid"),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type Payment = typeof payments.$inferSelect;
