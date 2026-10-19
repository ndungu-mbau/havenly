/**
 * Customer operations for Paystack.
 *
 * Paystack exposes customer APIs at:
 *   POST /customer
 *   GET  /customer/:email_or_code
 *   GET  /customer
 *
 * Creating/syncing a customer ahead of time gives us:
 * - A stable `customer_code` (e.g. CUS_xxxxxx) and `id` to reference.
 * - Single place to audit tenant profiles on the payment provider.
 */

import { PaystackError, paystackFetch } from "./client";

export type PaystackCustomerInput = {
  email: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  metadata?: Record<string, unknown>;
};

export type PaystackCustomer = {
  id: number;
  customerCode: string;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  phone?: string | null;
  createdAt?: string;
  raw: Record<string, unknown>;
};

type PaystackCustomerData = {
  id?: number;
  customer_code?: string;
  email?: string;
  first_name?: string | null;
  last_name?: string | null;
  phone?: string | null;
  created_at?: string;
  [k: string]: unknown;
};

export class PaystackCustomerError extends PaystackError {
  constructor(message: string, status = 500, payload?: unknown) {
    super(message, status, payload);
    this.name = "PaystackCustomerError";
  }
}

function parseName(name?: string, firstName?: string, lastName?: string) {
  if (firstName || lastName) {
    return { first_name: firstName, last_name: lastName };
  }
  if (!name) return {};
  const parts = name.trim().split(/\s+/);
  return {
    first_name: parts[0] || undefined,
    last_name: parts.slice(1).join(" ") || undefined,
  };
}

/**
 * Create a customer on Paystack.
 */
export async function createCustomer(input: PaystackCustomerInput): Promise<PaystackCustomer> {
  if (!input.email) {
    throw new PaystackCustomerError("email is required", 400);
  }

  const { first_name, last_name } = parseName(input.name, input.firstName, input.lastName);

  const payload = await paystackFetch<PaystackCustomerData>("/customer", {
    method: "POST",
    body: {
      email: input.email,
      first_name,
      last_name,
      phone: input.phone,
      metadata: input.metadata,
    },
  });

  const data = payload.data;
  if (!data?.id || !data?.customer_code) {
    throw new PaystackCustomerError("Customer creation returned invalid data", 500, payload);
  }

  return {
    id: data.id,
    customerCode: data.customer_code,
    email: data.email ?? input.email,
    firstName: data.first_name,
    lastName: data.last_name,
    phone: data.phone ?? input.phone ?? null,
    createdAt: data.created_at,
    raw: data,
  };
}

/**
 * Fetch a customer from Paystack by their email or customer code.
 */
export async function getCustomer(emailOrCode: string | number): Promise<PaystackCustomer | null> {
  try {
    const payload = await paystackFetch<PaystackCustomerData>(
      `/customer/${encodeURIComponent(String(emailOrCode))}`,
      { method: "GET" }
    );
    const data = payload.data;
    if (!data?.id || !data?.customer_code) return null;
    return {
      id: data.id,
      customerCode: data.customer_code,
      email: data.email ?? "",
      firstName: data.first_name,
      lastName: data.last_name,
      phone: data.phone ?? null,
      createdAt: data.created_at,
      raw: data,
    };
  } catch (err) {
    if (err instanceof PaystackError && (err.status === 404 || (err.payload as Record<string, unknown>)?.status === false)) {
      return null;
    }
    throw err;
  }
}

/**
 * Look up a customer by email. Used for idempotency before creating a duplicate.
 */
export async function findCustomerByEmail(email: string): Promise<PaystackCustomer | null> {
  return getCustomer(email);
}
