import {
  date,
  integer,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { organization, user } from "./auth";
import { houses } from "./houses";

export const renters = pgTable(
  "renters",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").references(() => user.id, { onDelete: "cascade" }),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    houseId: uuid("house_id")
      .notNull()
      .references(() => houses.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    email: text("email"),
    phone: text("phone"),
    leaseStart: date("lease_start").defaultNow(),
    leaseEnd: date("lease_end"),
    paystackCustomerCode: text("paystack_customer_code"),
    paystackCustomerId: integer("paystack_customer_id"),
    paystackCustomerSyncedAt: timestamp("paystack_customer_synced_at", {
      withTimezone: true,
    }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    uniqPaystackCustomerPerOwner: uniqueIndex(
      "uniq_renters_paystack_customer_per_owner",
    )
      .on(table.organizationId, table.paystackCustomerCode)
      .where(sql`${table.paystackCustomerCode} IS NOT NULL`),
  }),
);

export type Renter = typeof renters.$inferSelect;
