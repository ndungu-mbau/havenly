import { createFileRoute } from "@tanstack/react-router";
import { paystack } from "@havenly/api";
import { db, auth } from "../../../services";
import { paystackCharges } from "@havenly/db/schema/charges";
import { invoices } from "@havenly/db/schema/invoices";
import { and, eq } from "@havenly/db";

export const Route = createFileRoute("/api/paystack/charge")({
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

        if (!body.invoiceId) {
          return new Response(
            JSON.stringify({ error: "invoiceId is required" }),
            {
              status: 400,
              headers: { "Content-Type": "application/json" },
            },
          );
        }

        // Fetch the invoice, scoped to caller
        const [invoice] = await db
          .select()
          .from(invoices)
          .where(
            and(
              eq(invoices.id, body.invoiceId),
              eq(invoices.organizationId, session.user.organizationId),
            ),
          );

        if (!invoice) {
          return new Response(JSON.stringify({ error: "Invoice not found" }), {
            status: 404,
            headers: { "Content-Type": "application/json" },
          });
        }

        if (invoice.status === "paid") {
          return new Response(
            JSON.stringify({ error: "Invoice already paid" }),
            {
              status: 409,
              headers: { "Content-Type": "application/json" },
            },
          );
        }

        const reference = `rent_${invoice.id}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
        const channel = body.channel ?? "mpesa";

        // Create pending charge row first
        const [charge] = await db
          .insert(paystackCharges)
          .values({
            organizationId: session.user.organizationId,
            invoiceId: invoice.id,
            reference,
            amount: invoice.amount,
            currency: invoice.currency,
            channel,
            customerEmail: body.email ?? session.user.email,
            customerPhone: body.phone ?? null,
            status: "pending",
          })
          .returning();

        if (!charge) {
          return new Response(
            JSON.stringify({ error: "Failed to create charge" }),
            {
              status: 500,
              headers: { "Content-Type": "application/json" },
            },
          );
        }

        try {
          const result = await paystack.startCharge({
            amount: invoice.amount,
            currency: invoice.currency,
            email:
              charge.customerEmail ??
              session.user.email ??
              "tenant@example.com",
            phone: body.phone,
            name: session.user.name,
            channel,
            reference: charge.reference,
            invoiceId: invoice.id,
          });

          await db
            .update(paystackCharges)
            .set({
              paystackId: result.accessCode ?? result.paystackId ?? null,
              rawResponse: result.raw,
              updatedAt: new Date(),
            })
            .where(eq(paystackCharges.id, charge.id));

          return new Response(
            JSON.stringify({
              chargeId: charge.id,
              reference: charge.reference,
              status: result.status,
              authorizationUrl: result.authorizationUrl,
              accessCode: result.accessCode,
            }),
            {
              status: 200,
              headers: { "Content-Type": "application/json" },
            },
          );
        } catch (err: any) {
          await db
            .update(paystackCharges)
            .set({
              status: "failed",
              rawResponse: { error: err.message },
              updatedAt: new Date(),
            })
            .where(eq(paystackCharges.id, charge.id));

          if (err.status) {
            return new Response(JSON.stringify({ error: err.message }), {
              status: err.status,
              headers: { "Content-Type": "application/json" },
            });
          }

          console.error("[paystack/charge] error", err);
          return new Response(JSON.stringify({ error: "Charge failed" }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
          });
        }
      },
    },
  },
});
