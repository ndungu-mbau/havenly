import {
  categories,
  houses as pgHouses,
  properties,
  renters,
} from "@havenly/db";
import { TRPCError } from "@trpc/server";
import { and, desc, eq } from "drizzle-orm";
import { z } from "zod";

import { adminProcedure, router } from "../index";

export const propertiesRouter = router({
  getAll: adminProcedure.query(async ({ ctx }) => {
    const props = await ctx.db
      .select()
      .from(properties)
      .where(eq(properties.organizationId, ctx.orgId.id))
      .orderBy(desc(properties.createdAt));

    console.log({
      props,
      orgId: ctx.orgId,
    });

    return props;
  }),

  getById: adminProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const organizationId = ctx.orgId;

      const rows = await ctx.db
        .select({
          propertyId: properties.id,
          propertyName: properties.name,
          propertyAddress: properties.address,
          propertyCity: properties.city,
          propertyState: properties.state,
          propertyPostalCode: properties.postalCode,
          propertyType: properties.propertyType,
          propertyCaretakerId: properties.caretakerId,

          houseId: pgHouses.id,
          unitNumber: pgHouses.unitNumber,
          bedrooms: pgHouses.bedrooms,
          bathrooms: pgHouses.bathrooms,
          sizeSqft: pgHouses.sizeSqft,
          monthlyRent: pgHouses.monthlyRent,
          houseStatus: pgHouses.status,
          overrideTitle: pgHouses.overrideTitle,
          overrideFeatures: pgHouses.overrideFeatures,
          overrideDescription: pgHouses.overrideDescription,
          overrideOtherFeatures: pgHouses.overrideOtherFeatures,

          categoryId: categories.id,
          categoryTitle: categories.title,
          categoryFeatures: categories.features,
          categoryDescription: categories.description,
          categoryOtherFeatures: categories.otherFeatures,

          renterId: renters.id,
          renterName: renters.name,
          renterEmail: renters.email,
          renterPhone: renters.phone,
          leaseStart: renters.leaseStart,
          leaseEnd: renters.leaseEnd,
          paystackCustomerCode: renters.paystackCustomerCode,
          paystackCustomerId: renters.paystackCustomerId,

          organizationId: properties.organizationId,
        })
        .from(properties)
        .leftJoin(pgHouses, eq(pgHouses.propertyId, properties.id))
        .leftJoin(categories, eq(categories.id, pgHouses.categoryId))
        .leftJoin(renters, eq(renters.houseId, pgHouses.id))
        .where(
          and(
            eq(properties.id, input.id),
            eq(properties.organizationId, organizationId.id),
          ),
        )
        .orderBy(desc(pgHouses.unitNumber));

      const first = rows[0];
      if (!first) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Property not found",
        });
      }

      const property = {
        id: first.propertyId!,
        organizationId: first.organizationId!,
        name: first.propertyName!,
        address: first.propertyAddress!,
        city: first.propertyCity!,
        state: first.propertyState!,
        postalCode: first.propertyPostalCode,
        propertyType: first.propertyType!,
        caretakerId: first.propertyCaretakerId,
        unitsCount: rows.filter((r) => r.houseId != null).length,
        createdAt: new Date(),
      };

      const housesList = rows
        .filter((r) => r.houseId != null)
        .map((r) => ({
          id: r.houseId!,
          organizationId,
          propertyId: r.propertyId!,
          categoryId: r.categoryId,
          unitNumber: r.unitNumber!,
          bedrooms: r.bedrooms!,
          bathrooms: r.bathrooms!,
          sizeSqft: r.sizeSqft!,
          monthlyRent: r.monthlyRent!,
          status: r.houseStatus!,
          overrideTitle: r.overrideTitle,
          overrideFeatures: r.overrideFeatures,
          overrideDescription: r.overrideDescription,
          overrideOtherFeatures: r.overrideOtherFeatures as Record<
            string,
            unknown
          > | null,
          createdAt: new Date(),
        }));

      return { property, houses: housesList };
    }),

  add: adminProcedure
    .input(
      z.object({
        name: z.string().min(1),
        address: z.string().min(1),
        city: z.string().min(1),
        state: z.string().min(1),
        caretakerId: z.string().nullable().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { id: organizationId } = ctx.orgId;
      const [property] = await ctx.db
        .insert(properties)
        .values({ ...input, organizationId, propertyType: "Residential" })
        .returning();
      return property;
    }),

  update: adminProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(1),
        address: z.string().min(1),
        city: z.string().min(1),
        state: z.string().min(1),
        caretakerId: z.string().nullable().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { id: organizationId } = ctx.orgId;
      const { id, ...data } = input;
      const [property] = await ctx.db
        .update(properties)
        .set(data)
        .where(
          and(
            eq(properties.id, id),
            eq(properties.organizationId, organizationId),
          ),
        )
        .returning();
      if (!property) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Property not found",
        });
      }
      return property;
    }),

  delete: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { id: organizationId } = ctx.orgId;
      await ctx.db
        .delete(properties)
        .where(
          and(
            eq(properties.id, input.id),
            eq(properties.organizationId, organizationId),
          ),
        );
      return { success: true };
    }),
});
