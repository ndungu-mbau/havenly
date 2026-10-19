import { integer, jsonb, numeric, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { categories, type Category } from "./categories";
import { organization } from "./auth";
import { properties } from "./properties";

export const houses = pgTable("houses", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organization_id")
    .notNull()
    .references(() => organization.id, { onDelete: "cascade" }),
  propertyId: uuid("property_id")
    .notNull()
    .references(() => properties.id, { onDelete: "cascade" }),
  categoryId: uuid("category_id").references(() => categories.id),
  unitNumber: text("unit_number").notNull(),
  bedrooms: integer("bedrooms").notNull().default(1),
  bathrooms: numeric("bathrooms", { precision: 3, scale: 1 }).notNull().default("1"),
  sizeSqft: integer("size_sqft").notNull().default(0),
  monthlyRent: integer("monthly_rent").notNull().default(0),
  status: text("status").notNull().default("vacant"),
  overrideTitle: text("override_title"),
  overrideFeatures: text("override_features").array(),
  overrideDescription: text("override_description"),
  overrideOtherFeatures: jsonb("override_other_features").$type<Record<string, unknown>>(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type House = typeof houses.$inferSelect;

export function resolveHouseCategory(house: House, category?: Category) {
  return {
    title: house.overrideTitle ?? category?.title ?? house.unitNumber,
    features: house.overrideFeatures ?? category?.features ?? [],
    description: house.overrideDescription ?? category?.description ?? "",
    otherFeatures: house.overrideOtherFeatures ?? category?.otherFeatures ?? {},
  };
}
