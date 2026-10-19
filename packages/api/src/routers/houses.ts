import { houses, properties, renters } from "@havenly/db";
import { TRPCError } from "@trpc/server";
import { and, eq } from "drizzle-orm";
import { z } from "zod";

import { adminProcedure, router } from "../index";

export const housesRouter = router({
  getAll: adminProcedure.query(async ({ ctx }) => {
    const organizationId = ctx.session.user.organizationId;
    return ctx.db
      .select({
        id: houses.id,
        unitNumber: houses.unitNumber,
        monthlyRent: houses.monthlyRent,
        status: houses.status,
        propertyId: houses.propertyId,

        renterId: renters.id,
        renterEmail: renters.email,
        renterPhone: renters.phone,
        renterName: renters.name,
        renterHouseId: renters.houseId,
      })
      .from(houses)
      .innerJoin(renters, eq(renters.houseId, houses.id))
      .where(eq(houses.organizationId, organizationId));
  }),

  add: adminProcedure
    .input(
      z.object({
        propertyId: z.string(),
        unitNumber: z.string(),
        categoryId: z.string().optional(),
        monthlyRent: z.number(),
        bedrooms: z.number().optional(),
        bathrooms: z.string().optional(),
        sizeSqft: z.number().optional(),
        status: z.string().optional(),
        overrideTitle: z.string().optional(),
        overrideFeatures: z.array(z.string()).optional(),
        overrideDescription: z.string().optional(),
        overrideOtherFeatures: z.record(z.string(), z.unknown()).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const organizationId = ctx.session.user.organizationId;
      const [property] = await ctx.db
        .select({ id: properties.id })
        .from(properties)
        .where(
          and(
            eq(properties.id, input.propertyId),
            eq(properties.organizationId, organizationId),
          ),
        );
      if (!property) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Property not found",
        });
      }
      const [house] = await ctx.db
        .insert(houses)
        .values({ ...input, organizationId })
        .returning();
      return house;
    }),

  update: adminProcedure
    .input(
      z.object({
        id: z.string(),
        propertyId: z.string(),
        unitNumber: z.string(),
        categoryId: z.string().optional(),
        monthlyRent: z.number(),
        bedrooms: z.number().optional(),
        bathrooms: z.string().optional(),
        sizeSqft: z.number().optional(),
        status: z.string().optional(),
        overrideTitle: z.string().optional(),
        overrideFeatures: z.array(z.string()).optional(),
        overrideDescription: z.string().optional(),
        overrideOtherFeatures: z.record(z.string(), z.unknown()).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const organizationId = ctx.session.user.organizationId;
      const [house] = await ctx.db
        .update(houses)
        .set({
          unitNumber: input.unitNumber,
          categoryId: input.categoryId ?? null,
          monthlyRent: input.monthlyRent,
          bedrooms: input.bedrooms ?? 1,
          bathrooms: input.bathrooms ?? "1",
          sizeSqft: input.sizeSqft ?? 0,
          status: input.status ?? "vacant",
          overrideTitle: input.overrideTitle || null,
          overrideFeatures: input.overrideFeatures ?? null,
          overrideDescription: input.overrideDescription || null,
          overrideOtherFeatures: input.overrideOtherFeatures ?? null,
        })
        .where(and(eq(houses.id, input.id), eq(houses.organizationId, organizationId)))
        .returning();
      if (!house) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "House not found",
        });
      }
      return house;
    }),

  delete: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const organizationId = ctx.session.user.organizationId;
      await ctx.db
        .delete(houses)
        .where(and(eq(houses.id, input.id), eq(houses.organizationId, organizationId)));
      return { success: true };
    }),
});
