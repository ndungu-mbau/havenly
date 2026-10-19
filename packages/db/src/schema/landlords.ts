import { pgTable, uuid, timestamp, text } from "drizzle-orm/pg-core";
import { user, organization } from "./auth";
import { properties } from "./properties";

export const landlord = pgTable("landlord", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull(),
  name: text("name").notNull(),
  phone: text("phone"),
  userId: uuid("userId")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  organizationId: uuid("organizationId")
    .notNull()
    .references(() => organization.id, { onDelete: "cascade" }),
  propertyId: uuid("propertyId")
    .notNull()
    .references(() => properties.id, { onDelete: "cascade" }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});
