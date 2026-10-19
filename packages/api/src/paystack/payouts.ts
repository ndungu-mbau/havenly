/**
 * Payout (Transfer / Disbursement) operations for Paystack.
 *
 * Flow:
 * 1. Create a Transfer Recipient on Paystack (/transferrecipient) to obtain a `recipient_code`.
 * 2. Initiate Transfer from balance (/transfer) using the recipient code and unique reference.
 */

import { generateReference, getPaystackConfig, PaystackError, paystackFetch } from "./client";
import { toSubunit } from "./charges";

export type DestinationInput = {
  type: "mpesa" | "bank";
  phone?: string;
  bankCode?: string;
  bankName?: string;
  accountNumber?: string;
  accountName?: string;
  currency?: string;
};

export type TransferRecipientResult = {
  recipientCode: string;
  id?: number;
  name?: string;
  raw: Record<string, unknown>;
};

export type PayoutInput = {
  amount: number; // in standard currency units (e.g. KES 10,000)
  currency?: string;
  destination: DestinationInput;
  recipientCode?: string; // cached recipient_code if already created
  narration?: string;
  reference?: string;
  invoiceId?: string;
  metadata?: Record<string, unknown>;
};

export type PayoutResult = {
  reference: string;
  transferCode?: string;
  paystackId?: string;
  status: string;
  raw: Record<string, unknown>;
};

/**
 * Create a Transfer Recipient on Paystack.
 */
export async function createTransferRecipient(
  dest: DestinationInput
): Promise<TransferRecipientResult> {
  const cfg = getPaystackConfig();
  const currency = dest.currency ?? cfg.currency;

  let body: Record<string, unknown>;

  if (dest.type === "mpesa") {
    if (!dest.phone) throw new PaystackError("Phone number is required for M-Pesa recipient", 400);
    body = {
      type: "mobile_money",
      name: dest.accountName ?? `M-Pesa ${dest.phone}`,
      account_number: dest.phone,
      bank_code: dest.bankCode ?? "MPESA",
      currency,
    };
  } else {
    if (!dest.bankCode || !dest.accountNumber) {
      throw new PaystackError("bankCode and accountNumber are required for bank recipient", 400);
    }
    body = {
      type: "nuban",
      name: dest.accountName ?? "Landlord Bank Account",
      account_number: dest.accountNumber,
      bank_code: dest.bankCode,
      currency,
    };
  }

  const payload = await paystackFetch<{
    recipient_code: string;
    id?: number;
    name?: string;
  }>("/transferrecipient", {
    method: "POST",
    body,
  });

  if (!payload.data?.recipient_code) {
    throw new PaystackError("Failed to create transfer recipient", 500, payload);
  }

  return {
    recipientCode: payload.data.recipient_code,
    id: payload.data.id,
    name: payload.data.name,
    raw: payload as unknown as Record<string, unknown>,
  };
}

/**
 * Initiate a transfer disbursement on Paystack.
 */
export async function startPayout(input: PayoutInput): Promise<PayoutResult> {
  const cfg = getPaystackConfig();
  const reference = input.reference ?? generateReference(`payout_${input.destination.type}`);
  const currency = input.currency ?? cfg.currency;
  const amountSubunit = toSubunit(input.amount);

  // Obtain or reuse recipient code
  let recipientCode = input.recipientCode;
  if (!recipientCode) {
    const rec = await createTransferRecipient(input.destination);
    recipientCode = rec.recipientCode;
  }

  const payload = await paystackFetch<{
    reference: string;
    transfer_code?: string;
    id?: number;
    status?: string;
  }>("/transfer", {
    method: "POST",
    body: {
      source: "balance",
      amount: amountSubunit,
      recipient: recipientCode,
      reference,
      reason: input.narration ?? `Rent payout ${reference}`,
      currency,
    },
  });

  const data = payload.data;
  return {
    reference: data?.reference ?? reference,
    transferCode: data?.transfer_code,
    paystackId: data?.id != null ? String(data.id) : data?.transfer_code,
    status: data?.status ?? "pending",
    raw: payload as unknown as Record<string, unknown>,
  };
}
