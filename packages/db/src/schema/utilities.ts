import { index, pgTable, text, timestamp, uuid, integer, uniqueIndex } from "drizzle-orm/pg-core";
import { user } from "./auth";
import { houses } from "./houses";
import { invoices } from "./invoices";

export const utilities = pgTable("utilities", {
  id: uuid("id").primaryKey().defaultRandom(),
  houseId: uuid("house_id")
    .notNull()
    .references(() => houses.id, { onDelete: "cascade" }),
  amount: integer("amount").notNull(),
  period: text("period").notNull(), // Format: "YYYY-MM"
  invoiceId: uuid("invoice_id").references(() => invoices.id, { onDelete: "set null" }),
  updatedBy: uuid("updated_by")
    .notNull()
    .references(() => user.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
}, (table) => [
  index("utilities_house_period_idx").on(table.houseId, table.period),
  uniqueIndex("utilities_house_period_unique_idx").on(table.houseId, table.period),
]);
