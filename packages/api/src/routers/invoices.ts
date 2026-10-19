import { houses, invoices, paystackCharges, renters, utilities } from "@havenly/db";
import { TRPCError } from "@trpc/server";
import { and, desc, eq, inArray, isNull, lte } from "drizzle-orm";
import { z } from "zod";

import { adminProcedure, router } from "../index";

function isUniqueViolation(err: unknown): boolean {
  if (typeof err === "object" && err !== null && "code" in err) {
    return (err as { code?: string }).code === "23505";
  }
  return false;
}

export const invoicesRouter = router({
  getAll: adminProcedure.query(async ({ ctx }) => {
    return ctx.db
      .select()
      .from(invoices)
      .where(eq(invoices.organizationId, ctx.session.user.organizationId))
      .orderBy(desc(invoices.createdAt));
  }),

  create: adminProcedure
    .input(
      z.object({
        houseId: z.string(),
        renterId: z.string().nullable().optional(),
        period: z.string(),
        dueDate: z.string(),
        amount: z.number().nullable().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const organizationId = ctx.session.user.organizationId;
      const [house] = await ctx.db
        .select({ id: houses.id, monthlyRent: houses.monthlyRent })
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

      // Calculate utility total with rollover logic
      const utilityRecords = await ctx.db
        .select({ id: utilities.id, amount: utilities.amount })
        .from(utilities)
        .where(
          and(
            eq(utilities.houseId, input.houseId),
            lte(utilities.period, input.period),
            isNull(utilities.invoiceId),
          ),
        );

      const utilitySum = utilityRecords.reduce((sum, rec) => sum + rec.amount, 0);
      const baseAmount =
        input.amount && input.amount > 0 ? input.amount : house.monthlyRent;
      const totalAmount = baseAmount + utilitySum;

      if (!totalAmount || totalAmount <= 0) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Invoice amount must be positive",
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
            message: "Cannot create invoice for a vacant house without a renter",
          });
        }
        renterId = activeRenter.id;
      }

      try {
        const [row] = await ctx.db
          .insert(invoices)
          .values({
            organizationId,
            houseId: input.houseId,
            renterId,
            amount: totalAmount,
            currency: "KES",
            period: input.period,
            dueDate: input.dueDate,
            status: "pending",
          })
          .returning();

        if (!row) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to create invoice",
          });
        }

        if (utilityRecords.length > 0) {
          const utilityIds = utilityRecords.map((r) => r.id);
          await ctx.db
            .update(utilities)
            .set({ invoiceId: row.id })
            .where(inArray(utilities.id, utilityIds));
        }

        return row;
      } catch (err) {
        if (isUniqueViolation(err)) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "An invoice for this house and period already exists",
          });
        }
        throw err;
      }
    }),

  delete: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const organizationId = ctx.session.user.organizationId;
      const [inv] = await ctx.db
        .select({ status: invoices.status })
        .from(invoices)
        .where(
          and(
            eq(invoices.id, input.id),
            eq(invoices.organizationId, organizationId),
          ),
        );
      if (!inv) return { success: true };
      if (inv.status === "paid") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Cannot delete a paid invoice",
        });
      }

      await ctx.db
        .delete(paystackCharges)
        .where(
          and(
            eq(paystackCharges.invoiceId, input.id),
            eq(paystackCharges.organizationId, organizationId),
          ),
        );

      await ctx.db
        .delete(invoices)
        .where(
          and(
            eq(invoices.id, input.id),
            eq(invoices.organizationId, organizationId),
          ),
        );

      return { success: true };
    }),
});
