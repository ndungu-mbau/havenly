import { createFileRoute } from "@tanstack/react-router";
import { paystack } from "@havenly/api";
import { db, auth } from "../../../services";
import { paystackCharges } from "@havenly/db/schema/charges";
import { paystackPayouts } from "@havenly/db/schema/payouts";
import { invoices } from "@havenly/db/schema/invoices";
import { and, eq } from "@havenly/db";

export const Route = createFileRoute("/api/paystack/verify")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const session = await auth.api.getSession({ headers: request.headers });
        if (!session?.user) {
          return new Response(JSON.stringify({ error: "Unauthorized" }), {
            status: 401,
            headers: { "Content-Type": "application/json" },
          });
        }

        let body;
        try {
          body = await request.json();
        } catch {
          return new Response(JSON.stringify({ error: "Invalid JSON" }), {
            status: 400,
            headers: { "Content-Type": "application/json" },
          });
        }

        if (!body.kind || !body.reference) {
          return new Response(
            JSON.stringify({ error: "kind and reference are required" }),
            {
              status: 400,
              headers: { "Content-Type": "application/json" },
            },
          );
        }

        try {
          if (body.kind === "charge") {
            const result = await paystack.verifyTransaction(body.reference);
            if (!result) {
              return new Response(JSON.stringify({ status: "unknown" }), {
                status: 200,
                headers: { "Content-Type": "application/json" },
              });
            }

            const [updated] = await db
              .update(paystackCharges)
              .set({
                paystackId: result.paystackId,
                status: result.status,
                updatedAt: new Date(),
              })
              .where(
                and(
                  eq(paystackCharges.reference, body.reference),
                  eq(paystackCharges.organizationId, session.user.organizationId),
                ),
              )
              .returning({
                id: paystackCharges.id,
                invoiceId: paystackCharges.invoiceId,
              });

            if (updated && result.status === "successful") {
              await db
                .update(invoices)
                .set({ status: "paid", paidAt: new Date() })
                .where(eq(invoices.id, updated.invoiceId));
            }

            return new Response(
              JSON.stringify({
                status: result.status,
                paystackId: result.paystackId,
                amount: result.amount,
                currency: result.currency,
                channel: result.channel,
              }),
              {
                status: 200,
                headers: { "Content-Type": "application/json" },
              },
            );
          }

          if (body.kind === "payout") {
            const result = await paystack.verifyPayout(body.reference);
            if (!result) {
              return new Response(JSON.stringify({ status: "unknown" }), {
                status: 200,
                headers: { "Content-Type": "application/json" },
              });
            }

            await db
              .update(paystackPayouts)
              .set({
                paystackId: result.paystackId,
                status: result.status,
                updatedAt: new Date(),
              })
              .where(
                and(
                  eq(paystackPayouts.reference, body.reference),
                  eq(paystackPayouts.organizationId, session.user.organizationId),
                ),
              );

            return new Response(
              JSON.stringify({
                status: result.status,
                paystackId: result.paystackId,
                amount: result.amount,
                currency: result.currency,
              }),
              {
                status: 200,
                headers: { "Content-Type": "application/json" },
              },
            );
          }

          return new Response(JSON.stringify({ error: "Invalid kind" }), {
            status: 400,
            headers: { "Content-Type": "application/json" },
          });
        } catch (err: any) {
          if (err.status) {
            return new Response(JSON.stringify({ error: err.message }), {
              status: err.status,
              headers: { "Content-Type": "application/json" },
            });
          }
          console.error("[paystack/verify] error", err);
          return new Response(JSON.stringify({ error: "Verify failed" }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
          });
        }
      },
    },
  },
});
