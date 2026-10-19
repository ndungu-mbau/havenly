import { houses, renters } from "@havenly/db";
import { TRPCError } from "@trpc/server";
import { and, desc, eq } from "drizzle-orm";
import { z } from "zod";

import { adminProcedure, router } from "../index";
import {
  createCustomer,
  findCustomerByEmail,
  PaystackCustomerError,
} from "../paystack/customers";

export const rentersRouter = router({
  getAll: adminProcedure.query(async ({ ctx }) => {
    return ctx.db
      .select()
      .from(renters)
      .where(eq(renters.organizationId, ctx.session.user.organizationId))
      .orderBy(desc(renters.createdAt));
  }),

  add: adminProcedure
    .input(
      z.object({
        houseId: z.string(),
        name: z.string().min(1),
        email: z.string().email().optional(),
        phone: z.string().optional(),
        leaseStart: z.string().optional(),
        leaseEnd: z.string().optional(),
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

      const [renter] = await ctx.db
        .insert(renters)
        .values({
          ...input,
          organizationId,
          leaseStart: input.leaseStart || null,
          leaseEnd: input.leaseEnd || null,
        })
        .returning();
      if (!renter) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create renter",
        });
      }

      await ctx.db
        .update(houses)
        .set({ status: "Occupied" })
        .where(
          and(
            eq(houses.id, input.houseId),
            eq(houses.organizationId, organizationId),
          ),
        );

      if (!input.email) {
        return {
          renter,
          paystackWarning:
            "Renter saved without an email, so a Paystack customer was not created.",
        };
      }

      try {
        const existing = await findCustomerByEmail(input.email);
        const customer =
          existing ??
          (await createCustomer({
            email: input.email,
            name: input.name,
            phone: input.phone,
          }));

        const [updated] = await ctx.db
          .update(renters)
          .set({
            paystackCustomerCode: customer.customerCode,
            paystackCustomerId: customer.id,
            paystackCustomerSyncedAt: new Date(),
          })
          .where(eq(renters.id, renter.id))
          .returning();

        return {
          renter: updated ?? renter,
          paystackCustomerCode: customer.customerCode,
          paystackCustomerId: customer.id,
        };
      } catch (err) {
        const message =
          err instanceof PaystackCustomerError
            ? err.message
            : ((err as Error).message ?? "Unknown Paystack error");
        console.error("[addRenter] Paystack customer sync failed", err);
        return {
          renter,
          paystackWarning: `Renter saved, but could not create the Paystack customer: ${message}`,
        };
      }
    }),

  update: adminProcedure
    .input(
      z.object({
        id: z.string(),
        houseId: z.string(),
        name: z.string().min(1),
        email: z.string().optional(),
        phone: z.string().optional(),
        leaseStart: z.string().optional(),
        leaseEnd: z.string().optional(),
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

      const [renter] = await ctx.db
        .update(renters)
        .set({
          houseId: input.houseId,
          name: input.name,
          email: input.email || null,
          phone: input.phone || null,
          leaseStart: input.leaseStart || null,
          leaseEnd: input.leaseEnd || null,
        })
        .where(
          and(
            eq(renters.id, input.id),
            eq(renters.organizationId, organizationId),
          ),
        )
        .returning();
      if (!renter) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Renter not found",
        });
      }
      return renter;
    }),

  delete: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const organizationId = ctx.session.user.organizationId;
      await ctx.db
        .delete(renters)
        .where(
          and(
            eq(renters.id, input.id),
            eq(renters.organizationId, organizationId),
          ),
        );
      return { success: true };
    }),
});
