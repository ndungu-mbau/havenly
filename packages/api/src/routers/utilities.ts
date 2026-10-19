import { houses, properties, user, utilities } from "@havenly/db";
import { TRPCError } from "@trpc/server";
import { and, eq, sql } from "drizzle-orm";
import { z } from "zod";

import { adminProcedure, caretakerProcedure, router } from "../index";

export const utilitiesRouter = router({
  addOrUpdate: caretakerProcedure
    .input(
      z.object({
        houseId: z.string(),
        amount: z.number().int().nonnegative(),
        period: z.string(), // "YYYY-MM"
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const currentUser = ctx.session.user;
      const userRole = (currentUser as { role?: string }).role ?? "admin";

      if (userRole === "caretaker") {
        const [property] = await ctx.db
          .select({ id: properties.id })
          .from(properties)
          .innerJoin(houses, eq(houses.propertyId, properties.id))
          .where(
            and(
              eq(properties.caretakerId, currentUser.id),
              eq(houses.id, input.houseId),
            ),
          )
          .limit(1);

        if (!property) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message:
              "Unauthorized: You are not the assigned caretaker for this house's property.",
          });
        }
      }

      // Validation: Entry Window (current or previous period)
      const now = new Date();
      const currentPeriod = now.toISOString().slice(0, 7); // "YYYY-MM"
      const prevPeriod = new Date(now.getFullYear(), now.getMonth() - 1, 1)
        .toISOString()
        .slice(0, 7);

      if (input.period !== currentPeriod && input.period !== prevPeriod) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `Utility entries are only allowed for the current (${currentPeriod}) or previous (${prevPeriod}) period.`,
        });
      }

      const [utility] = await ctx.db
        .insert(utilities)
        .values({
          houseId: input.houseId,
          amount: input.amount,
          period: input.period,
          updatedBy: currentUser.id,
        })
        .onConflictDoUpdate({
          target: [utilities.houseId, utilities.period],
          set: {
            amount: input.amount,
            updatedBy: currentUser.id,
            updatedAt: new Date(),
          },
        })
        .returning();

      return utility;
    }),

  getCaretakerUtilities: caretakerProcedure
    .input(z.object({ caretakerId: z.string().optional() }))
    .query(async ({ ctx, input }) => {
      const caretakerId = input.caretakerId ?? ctx.session.user.id;
      return ctx.db
        .select({
          utility: utilities,
          property: properties,
        })
        .from(utilities)
        .innerJoin(
          properties,
          sql`exists (select 1 from houses where houses.id = ${utilities.houseId} and houses.property_id = properties.id)`,
        )
        .where(eq(properties.caretakerId, caretakerId));
    }),

  getAll: adminProcedure.query(async ({ ctx }) => {
    return ctx.db
      .select({
        utility: utilities,
        house: houses,
        property: properties,
        user: user,
      })
      .from(utilities)
      .innerJoin(houses, eq(utilities.houseId, houses.id))
      .innerJoin(properties, eq(houses.propertyId, properties.id))
      .innerJoin(user, eq(utilities.updatedBy, user.id));
  }),
});
