import { createFileRoute } from "@tanstack/react-router";
import { paystack } from "@havenly/api";
import { db } from "../../../services";

export const Route = createFileRoute("/api/paystack/webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const rawBody = await request.text();
        const signature = request.headers.get("x-paystack-signature");

        if (!paystack.verifyWebhookSignature(rawBody, signature)) {
          return new Response(JSON.stringify({ error: "Invalid signature" }), {
            status: 401,
            headers: { "Content-Type": "application/json" },
          });
        }

        let payload: paystack.PaystackWebhookPayload;
        try {
          payload = JSON.parse(rawBody);
        } catch {
          return new Response(JSON.stringify({ error: "Invalid JSON" }), {
            status: 400,
            headers: { "Content-Type": "application/json" },
          });
        }

        if (!payload?.event || !payload?.data) {
          return new Response(JSON.stringify({ error: "Missing event/data" }), {
            status: 400,
            headers: { "Content-Type": "application/json" },
          });
        }

        try {
          const result = await paystack.handleWebhook(payload, db);
          return new Response(JSON.stringify({ ok: true, deduped: result.deduped }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
          });
        } catch (err) {
          if (err instanceof paystack.PaystackError) {
            return new Response(JSON.stringify({ error: err.message }), {
              status: err.status,
              headers: { "Content-Type": "application/json" },
            });
          }
          console.error("[paystack/webhook] handler error", err);
          return new Response(JSON.stringify({ error: "Internal error" }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
          });
        }
      },
    },
  },
});
