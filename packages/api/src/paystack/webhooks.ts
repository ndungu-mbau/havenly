/**
 * Webhook signature verification and event dispatch for Paystack.
 *
 * Paystack Webhook Specs:
 * - Signed with HMAC-SHA512 of the raw request body using PAYSTACK_SECRET_KEY.
 * - Signature is sent in the `x-paystack-signature` header.
 * - Payload structure:
 *     { event: "charge.success" | "transfer.success" | "transfer.failed" | ...,
 *       data: { id, reference, status, amount, currency, channel, ... } }
 */

import crypto from "node:crypto";
import type { Database } from "@havenly/db";
import { invoices, paystackCharges, paystackPayouts, paystackWebhookEvents } from "@havenly/db";
import { eq } from "drizzle-orm";
import { getPaystackConfig } from "./client";

export function verifyWebhookSignature(rawBody: string, signature: string | null): boolean {
  const { secretKey } = getPaystackConfig();
  if (!signature || !secretKey) return false;
  const expected = crypto.createHmac("sha512", secretKey).update(rawBody).digest("hex");
  const a = Buffer.from(expected, "utf8");
  const b = Buffer.from(signature, "utf8");
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

type PaystackWebhookData = {
  id?: number | string;
  reference?: string;
  transfer_code?: string;
  status?: string;
  amount?: number;
  currency?: string;
  channel?: string;
  [k: string]: unknown;
};

export type PaystackWebhookPayload = {
  event: string;
  data: PaystackWebhookData;
};

export async function handleWebhook(
  payload: PaystackWebhookPayload,
  database: Database
): Promise<{ deduped: boolean }> {
  const paystackEventId = String(
    payload.data?.id ?? payload.data?.reference ?? `${payload.event}-${Date.now()}`
  );
  const reference = payload.data?.reference ?? payload.data?.transfer_code;

  // 1. Record event for idempotency
  try {
    await database.insert(paystackWebhookEvents).values({
      event: payload.event,
      paystackEventId,
      reference: reference ?? null,
      payload: payload as unknown as Record<string, unknown>,
    });
  } catch (err) {
    if (isUniqueViolation(err)) return { deduped: true };
    throw err;
  }

  // 2. Dispatch event
  switch (payload.event) {
    case "charge.success":
      await markChargeFromWebhook(database, payload.data, "successful");
      break;
    case "charge.failed":
      await markChargeFromWebhook(database, payload.data, "failed");
      break;
    case "transfer.success":
      await markPayoutFromWebhook(database, payload.data, "successful");
      break;
    case "transfer.failed":
    case "transfer.reversed":
      await markPayoutFromWebhook(database, payload.data, "failed");
      break;
    default:
      break;
  }

  return { deduped: false };
}

async function markChargeFromWebhook(
  database: Database,
  data: PaystackWebhookData,
  status: "successful" | "failed"
) {
  if (!data.reference) return;
  const paystackId = data.id != null ? String(data.id) : null;
  const [updated] = await database
    .update(paystackCharges)
    .set({ status, paystackId, updatedAt: new Date() })
    .where(eq(paystackCharges.reference, data.reference))
    .returning({ id: paystackCharges.id, invoiceId: paystackCharges.invoiceId });

  if (updated && status === "successful") {
    await database
      .update(invoices)
      .set({ status: "paid", paidAt: new Date() })
      .where(eq(invoices.id, updated.invoiceId));
  }
}

async function markPayoutFromWebhook(
  database: Database,
  data: PaystackWebhookData,
  status: "successful" | "failed"
) {
  const ref = data.reference ?? data.transfer_code;
  if (!ref) return;
  const paystackId = data.id != null ? String(data.id) : null;
  await database
    .update(paystackPayouts)
    .set({ status, paystackId, updatedAt: new Date() })
    .where(eq(paystackPayouts.reference, ref));
}

function isUniqueViolation(err: unknown): boolean {
  if (typeof err === "object" && err !== null && "code" in err) {
    return (err as { code?: string }).code === "23505";
  }
  return false;
}
