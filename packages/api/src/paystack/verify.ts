/**
 * Verification helpers for Paystack.
 *
 * - verifyTransaction(reference): verifies transaction status on Paystack by reference.
 * - verifyPayout(reference): verifies transfer status on Paystack by reference.
 */

import { PaystackError, paystackFetch } from "./client";
import { fromSubunit } from "./charges";

export type PaystackVerification = {
  paystackId: string;
  status: string; // "successful" | "failed" | "pending"
  amount?: number;
  currency?: string;
  channel?: string;
  raw: Record<string, unknown>;
};

function normalizeStatus(rawStatus?: string): string {
  if (!rawStatus) return "unknown";
  const s = rawStatus.toLowerCase();
  if (s === "success" || s === "successful") return "successful";
  if (s === "failed" || s === "abandoned" || s === "reversed") return "failed";
  return "pending";
}

/**
 * Verify a transaction by reference on Paystack.
 */
export async function verifyTransaction(reference: string): Promise<PaystackVerification | null> {
  try {
    const payload = await paystackFetch<{
      id: number | string;
      status: string;
      amount?: number;
      currency?: string;
      channel?: string;
      reference?: string;
    }>(`/transaction/verify/${encodeURIComponent(reference)}`, {
      method: "GET",
    });

    const data = payload.data;
    if (!data?.id) return null;

    return {
      paystackId: String(data.id),
      status: normalizeStatus(data.status),
      amount: data.amount != null ? fromSubunit(data.amount) : undefined,
      currency: data.currency,
      channel: data.channel,
      raw: payload as unknown as Record<string, unknown>,
    };
  } catch (err) {
    if (err instanceof PaystackError && err.status === 404) {
      return null;
    }
    throw err;
  }
}

/**
 * Verify a payout transfer by reference on Paystack.
 */
export async function verifyPayout(reference: string): Promise<PaystackVerification | null> {
  try {
    const payload = await paystackFetch<{
      id: number | string;
      status: string;
      amount?: number;
      currency?: string;
      transfer_code?: string;
      reference?: string;
    }>(`/transfer/verify/${encodeURIComponent(reference)}`, {
      method: "GET",
    });

    const data = payload.data;
    if (!data?.id && !data?.transfer_code) return null;

    return {
      paystackId: data.id != null ? String(data.id) : (data.transfer_code ?? reference),
      status: normalizeStatus(data.status),
      amount: data.amount != null ? fromSubunit(data.amount) : undefined,
      currency: data.currency,
      raw: payload as unknown as Record<string, unknown>,
    };
  } catch (err) {
    if (err instanceof PaystackError && err.status === 404) {
      return null;
    }
    throw err;
  }
}
