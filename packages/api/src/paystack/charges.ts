/**
 * Charge (collection) operations for Paystack.
 *
 * Exposes:
 * - initializeTransaction(): generates hosted checkout URL and access_code.
 * - chargeMobileMoney(): initiates direct M-Pesa STK push via /charge endpoint.
 * - startCharge(): unified wrapper handling channel routing.
 *
 * Paystack expects amount in currency subunits (e.g. 1 KES = 100 subunits/cents).
 */

import {
  generateReference,
  getPaystackConfig,
  type PaystackChannel,
  PaystackError,
  paystackFetch,
} from "./client";

export type ChargeInput = {
  amount: number; // In standard currency units (e.g. KES 5,000)
  currency?: string;
  email: string;
  phone?: string; // used for M-Pesa
  name?: string;
  channel?: PaystackChannel;
  reference?: string; // caller-supplied idempotency key; generated if absent
  invoiceId: string;
  callbackUrl?: string;
  metadata?: Record<string, unknown>;
};

export type ChargeResult = {
  reference: string;
  paystackId?: string;
  status: string;
  authorizationUrl?: string;
  accessCode?: string;
  raw: Record<string, unknown>;
};

/** Converts standard currency unit (KES) to subunit (cents) */
export function toSubunit(amount: number): number {
  return Math.round(amount * 100);
}

/** Converts subunit (cents) to standard currency unit */
export function fromSubunit(amount: number): number {
  return amount / 100;
}

/**
 * Initialize a Paystack transaction. Returns authorization_url and access_code.
 */
export async function initializeTransaction(input: ChargeInput): Promise<ChargeResult> {
  const cfg = getPaystackConfig();
  const reference = input.reference ?? generateReference(`rent_${input.invoiceId}`);
  const currency = input.currency ?? cfg.currency;
  const amountSubunit = toSubunit(input.amount);

  const channels: string[] =
    input.channel === "mpesa" || input.channel === "mobile_money"
      ? ["mobile_money", "card"]
      : input.channel === "card"
        ? ["card"]
        : ["card", "mobile_money", "bank", "ussd", "qr"];

  const payload = await paystackFetch<{
    authorization_url: string;
    access_code: string;
    reference: string;
  }>("/transaction/initialize", {
    method: "POST",
    body: {
      email: input.email,
      amount: amountSubunit,
      currency,
      reference,
      callback_url: input.callbackUrl ?? `${cfg.appUrl}/admin/payments?invoice=${input.invoiceId}`,
      channels,
      metadata: {
        ...(input.metadata ?? {}),
        invoice_id: input.invoiceId,
        customer_name: input.name,
        customer_phone: input.phone,
        custom_fields: [
          {
            display_name: "Invoice ID",
            variable_name: "invoice_id",
            value: String(input.invoiceId),
          },
          ...(input.phone
            ? [
                {
                  display_name: "Phone Number",
                  variable_name: "phone_number",
                  value: input.phone,
                },
              ]
            : []),
        ],
      },
    },
  });

  return {
    reference: payload.data.reference || reference,
    paystackId: payload.data.access_code,
    authorizationUrl: payload.data.authorization_url,
    accessCode: payload.data.access_code,
    status: "pending",
    raw: payload as unknown as Record<string, unknown>,
  };
}

/**
 * Start direct M-Pesa mobile money charge.
 * Note: If direct /charge requires OTP/offline prompt, we fall back to initializeTransaction.
 */
export async function chargeMobileMoney(input: ChargeInput): Promise<ChargeResult> {
  if (!input.phone) {
    throw new PaystackError("Phone number is required for mobile money / M-Pesa", 400);
  }

  const cfg = getPaystackConfig();
  const reference = input.reference ?? generateReference(`mpesa_${input.invoiceId}`);
  const currency = input.currency ?? cfg.currency;
  const amountSubunit = toSubunit(input.amount);

  try {
    const payload = await paystackFetch<{
      reference?: string;
      status?: string;
      id?: number;
      display_text?: string;
    }>("/charge", {
      method: "POST",
      body: {
        email: input.email,
        amount: amountSubunit,
        currency,
        reference,
        mobile_money: {
          phone: input.phone,
          provider: "mpesa",
        },
        metadata: {
          ...(input.metadata ?? {}),
          invoice_id: input.invoiceId,
        },
      },
    });

    return {
      reference: payload.data.reference ?? reference,
      paystackId: payload.data.id != null ? String(payload.data.id) : undefined,
      status: payload.data.status ?? "pending",
      raw: payload as unknown as Record<string, unknown>,
    };
  } catch (err) {
    // If direct /charge is not configured on merchant account for standalone M-Pesa API,
    // gracefully fall back to transaction initialization with mobile_money channel enabled.
    return initializeTransaction(input);
  }
}

/**
 * Start generic charge by channel.
 */
export async function startCharge(input: ChargeInput): Promise<ChargeResult> {
  if (input.channel === "mpesa" && input.phone) {
    return chargeMobileMoney(input);
  }
  return initializeTransaction(input);
}
