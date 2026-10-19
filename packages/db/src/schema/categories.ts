import { jsonb, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { organization } from "./auth";

export const categories = pgTable("categories", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organization_id")
    .notNull()
    .references(() => organization.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  features: text("features").array().notNull().default([]),
  description: text("description").notNull().default(""),
  otherFeatures: jsonb("other_features").$type<Record<string, unknown>>().notNull().default({}),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type Category = typeof categories.$inferSelect;
