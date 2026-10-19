import { integer, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { organization } from "./auth";
import { caretakers } from "./caretakers";

export const properties = pgTable("properties", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organization_id")
    .notNull()
    .references(() => organization.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  address: text("address").notNull(),
  city: text("city").notNull(),
  state: text("state").notNull(),
  postalCode: text("postal_code"),
  propertyType: text("property_type").notNull().default("Residential"),
  unitsCount: integer("units_count").notNull().default(0),
  caretakerId: uuid("caretaker_id").references(() => caretakers.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type Property = typeof properties.$inferSelect;
