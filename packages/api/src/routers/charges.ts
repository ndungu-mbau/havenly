import { invoices, paystackCharges, paystackPayouts } from "@havenly/db";
import { TRPCError } from "@trpc/server";
import { and, eq } from "drizzle-orm";
import { z } from "zod";

import { adminProcedure, protectedProcedure, router } from "../index";
import { startCharge } from "../paystack/charges";
import { verifyPayout, verifyTransaction } from "../paystack/verify";

export const chargesRouter = router({
  initiateCharge: protectedProcedure
    .input(
      z.object({
        invoiceId: z.string(),
        channel: z.enum(["card", "bank", "ussd", "qr", "mobile_money", "mpesa"]).default("mpesa"),
        phone: z.string().optional(),
        email: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const currentUser = ctx.session.user;
      const userRole = (currentUser as { role?: string }).role ?? "admin";

      // If user is tenant, check invoice belongs to them; if admin, check invoice belongs to their portfolio
      const [invoice] = await ctx.db
        .select()
        .from(invoices)
        .where(
          userRole === "admin"
            ? and(eq(invoices.id, input.invoiceId), eq(invoices.organizationId, currentUser.organizationId))
            : eq(invoices.id, input.invoiceId),
        );

      if (!invoice) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Invoice not found",
        });
      }

      if (invoice.status === "paid") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Invoice already paid",
        });
      }

      const reference = `rent_${invoice.id}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
      const channel = input.channel;

      const [charge] = await ctx.db
        .insert(paystackCharges)
        .values({
          organizationId: invoice.organizationId,
          invoiceId: invoice.id,
          reference,
          amount: invoice.amount,
          currency: invoice.currency,
          channel,
          customerEmail: input.email ?? currentUser.email,
          customerPhone: input.phone ?? null,
          status: "pending",
        })
        .returning();

      if (!charge) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create charge record",
        });
      }

      try {
        const result = await startCharge({
          amount: invoice.amount,
          currency: invoice.currency,
          email: charge.customerEmail ?? currentUser.email ?? "tenant@example.com",
          phone: input.phone,
          name: currentUser.name,
          channel,
          reference: charge.reference,
          invoiceId: invoice.id,
        });

        await ctx.db
          .update(paystackCharges)
          .set({
            paystackId: result.accessCode ?? result.paystackId ?? null,
            rawResponse: result.raw as Record<string, unknown>,
            updatedAt: new Date(),
          })
          .where(eq(paystackCharges.id, charge.id));

        return {
          chargeId: charge.id,
          reference: charge.reference,
          status: result.status,
          authorizationUrl: result.authorizationUrl,
          accessCode: result.accessCode,
        };
      } catch (err) {
        await ctx.db
          .update(paystackCharges)
          .set({
            status: "failed",
            rawResponse: { error: (err as Error).message },
            updatedAt: new Date(),
          })
          .where(eq(paystackCharges.id, charge.id));

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: (err as Error).message || "Charge initiation failed",
        });
      }
    }),

  verify: adminProcedure
    .input(
      z.object({
        kind: z.enum(["charge", "payout"]),
        reference: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const organizationId = ctx.session.user.organizationId;

      if (input.kind === "charge") {
        const result = await verifyTransaction(input.reference);
        if (!result) return { status: "unknown" };

        const [updated] = await ctx.db
          .update(paystackCharges)
          .set({
            paystackId: result.paystackId,
            status: result.status,
            updatedAt: new Date(),
          })
          .where(
            and(
              eq(paystackCharges.reference, input.reference),
              eq(paystackCharges.organizationId, organizationId),
            ),
          )
          .returning({ id: paystackCharges.id, invoiceId: paystackCharges.invoiceId });

        if (updated && result.status === "successful") {
          await ctx.db
            .update(invoices)
            .set({ status: "paid", paidAt: new Date() })
            .where(eq(invoices.id, updated.invoiceId));
        }

        return {
          status: result.status,
          paystackId: result.paystackId,
          amount: result.amount,
          currency: result.currency,
          channel: result.channel,
        };
      }

      const result = await verifyPayout(input.reference);
      if (!result) return { status: "unknown" };

      await ctx.db
        .update(paystackPayouts)
        .set({
          paystackId: result.paystackId,
          status: result.status,
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(paystackPayouts.reference, input.reference),
            eq(paystackPayouts.organizationId, organizationId),
          ),
        );

      return {
        status: result.status,
        paystackId: result.paystackId,
        amount: result.amount,
        currency: result.currency,
      };
    }),
});
