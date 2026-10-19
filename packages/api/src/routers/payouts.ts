import { payoutDestinations, paystackPayouts } from "@havenly/db";
import { TRPCError } from "@trpc/server";
import { and, desc, eq } from "drizzle-orm";
import { z } from "zod";

import { adminProcedure, router } from "../index";
import { createTransferRecipient, startPayout } from "../paystack/payouts";

export const payoutsRouter = router({
  getDestinations: adminProcedure.query(async ({ ctx }) => {
    return ctx.db
      .select()
      .from(payoutDestinations)
      .where(eq(payoutDestinations.organizationId, ctx.session.user.organizationId))
      .orderBy(desc(payoutDestinations.createdAt));
  }),

  addDestination: adminProcedure
    .input(
      z.object({
        type: z.enum(["mpesa", "bank"]),
        phone: z.string().optional(),
        bankCode: z.string().optional(),
        bankName: z.string().optional(),
        accountNumber: z.string().optional(),
        accountName: z.string().optional(),
        isDefault: z.boolean().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const organizationId = ctx.session.user.organizationId;
      if (input.type === "mpesa" && !input.phone) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Phone is required for M-Pesa destinations",
        });
      }
      if (input.type === "bank" && (!input.bankCode || !input.accountNumber)) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Bank code and account number are required for bank destinations",
        });
      }

      if (input.isDefault) {
        await ctx.db
          .update(payoutDestinations)
          .set({ isDefault: false })
          .where(eq(payoutDestinations.organizationId, organizationId));
      }

      const [row] = await ctx.db
        .insert(payoutDestinations)
        .values({
          organizationId,
          type: input.type,
          phone: input.phone ?? null,
          bankCode: input.bankCode ?? null,
          bankName: input.bankName ?? null,
          accountNumber: input.accountNumber ?? null,
          accountName: input.accountName ?? null,
          isDefault: input.isDefault ?? false,
        })
        .returning();
      return row;
    }),

  deleteDestination: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const organizationId = ctx.session.user.organizationId;
      await ctx.db
        .delete(payoutDestinations)
        .where(
          and(
            eq(payoutDestinations.id, input.id),
            eq(payoutDestinations.organizationId, organizationId),
          ),
        );
      return { success: true };
    }),

  createPayout: adminProcedure
    .input(
      z.object({
        destinationId: z.string(),
        amount: z.number().positive(),
        currency: z.string().optional(),
        invoiceId: z.string().nullable().optional(),
        narration: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const organizationId = ctx.session.user.organizationId;
      const [dest] = await ctx.db
        .select()
        .from(payoutDestinations)
        .where(
          and(
            eq(payoutDestinations.id, input.destinationId),
            eq(payoutDestinations.organizationId, organizationId),
          ),
        );
      if (!dest) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Destination not found",
        });
      }

      const reference = `payout_${dest.id}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
      const [row] = await ctx.db
        .insert(paystackPayouts)
        .values({
          organizationId,
          destinationId: dest.id,
          invoiceId: input.invoiceId ?? null,
          reference,
          amount: input.amount,
          currency: input.currency ?? "KES",
          narration: input.narration ?? null,
          status: "pending",
        })
        .returning();
      return row;
    }),

  initiatePayout: adminProcedure
    .input(z.object({ payoutId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const organizationId = ctx.session.user.organizationId;
      const [payout] = await ctx.db
        .select()
        .from(paystackPayouts)
        .where(
          and(
            eq(paystackPayouts.id, input.payoutId),
            eq(paystackPayouts.organizationId, organizationId),
          ),
        );
      if (!payout) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Payout not found",
        });
      }

      const [dest] = await ctx.db
        .select()
        .from(payoutDestinations)
        .where(eq(payoutDestinations.id, payout.destinationId));
      if (!dest) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Destination not found",
        });
      }

      let recipientCode = dest.paystackRecipientCode;
      if (!recipientCode) {
        try {
          const rec = await createTransferRecipient({
            type: dest.type === "mpesa" ? "mpesa" : "bank",
            phone: dest.phone ?? undefined,
            bankCode: dest.bankCode ?? undefined,
            bankName: dest.bankName ?? undefined,
            accountNumber: dest.accountNumber ?? undefined,
            accountName: dest.accountName ?? undefined,
          });
          recipientCode = rec.recipientCode;
          await ctx.db
            .update(payoutDestinations)
            .set({ paystackRecipientCode: recipientCode })
            .where(eq(payoutDestinations.id, dest.id));
        } catch (recErr) {
          console.error("[paystack/payout/initiate] failed to create recipient", recErr);
        }
      }

      try {
        const result = await startPayout({
          amount: payout.amount,
          currency: payout.currency,
          destination: {
            type: dest.type === "mpesa" ? "mpesa" : "bank",
            phone: dest.phone ?? undefined,
            bankCode: dest.bankCode ?? undefined,
            accountNumber: dest.accountNumber ?? undefined,
            accountName: dest.accountName ?? undefined,
          },
          recipientCode: recipientCode ?? undefined,
          narration: payout.narration ?? undefined,
          reference: payout.reference,
          invoiceId: payout.invoiceId ?? undefined,
        });

        await ctx.db
          .update(paystackPayouts)
          .set({
            paystackTransferCode: result.transferCode ?? null,
            paystackId: result.paystackId ?? null,
            rawResponse: result.raw as Record<string, unknown>,
            updatedAt: new Date(),
          })
          .where(eq(paystackPayouts.id, payout.id));

        return {
          payoutId: payout.id,
          reference: payout.reference,
          status: result.status,
        };
      } catch (err) {
        await ctx.db
          .update(paystackPayouts)
          .set({
            status: "failed",
            rawResponse: { error: (err as Error).message },
            updatedAt: new Date(),
          })
          .where(eq(paystackPayouts.id, payout.id));

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: (err as Error).message || "Payout failed to initiate",
        });
      }
    }),
});
