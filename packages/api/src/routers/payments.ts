import { houses, payments, renters } from "@havenly/db";
import { TRPCError } from "@trpc/server";
import { and, desc, eq } from "drizzle-orm";
import { z } from "zod";

import { adminProcedure, router } from "../index";

export const paymentsRouter = router({
  getAll: adminProcedure.query(async ({ ctx }) => {
    return ctx.db
      .select()
      .from(payments)
      .where(eq(payments.organizationId, ctx.session.user.organizationId))
      .orderBy(desc(payments.createdAt));
  }),

  record: adminProcedure
    .input(
      z.object({
        houseId: z.string(),
        renterId: z.string().optional(),
        amount: z.number().positive(),
        paymentDate: z.string(),
        period: z.string(),
        method: z.string().default("Bank transfer"),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const organizationId = ctx.session.user.organizationId;
      const [house] = await ctx.db
        .select({ id: houses.id })
        .from(houses)
        .where(
          and(
            eq(houses.id, input.houseId),
            eq(houses.organizationId, organizationId),
          ),
        );
      if (!house) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "House not found",
        });
      }

      let renterId = input.renterId;
      if (!renterId) {
        const [activeRenter] = await ctx.db
          .select({ id: renters.id })
          .from(renters)
          .where(eq(renters.houseId, input.houseId))
          .limit(1);
        if (!activeRenter) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Cannot record payment for a house without a renter",
          });
        }
        renterId = activeRenter.id;
      }

      const [payment] = await ctx.db
        .insert(payments)
        .values({
          organizationId,
          houseId: input.houseId,
          renterId,
          amount: input.amount,
          paymentDate: input.paymentDate,
          period: input.period,
          method: input.method,
          status: "Paid",
        })
        .returning();
      return payment;
    }),

  delete: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const organizationId = ctx.session.user.organizationId;
      await ctx.db
        .delete(payments)
        .where(
          and(
            eq(payments.id, input.id),
            eq(payments.organizationId, organizationId),
          ),
        );
      return { success: true };
    }),
});
