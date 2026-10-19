/**
 * Typed client and configuration wrapper for Paystack.
 *
 * Goals:
 * - Single place to read and validate env configuration.
 * - Sensible error normalization with status and payload.
 * - Idempotency reference generation.
 * - Reusable typed request helper for Paystack REST endpoints.
 */

export type PaystackChannel = "card" | "bank" | "ussd" | "qr" | "mobile_money" | "mpesa";

export class PaystackError extends Error {
  status: number;
  payload: unknown;
  constructor(message: string, status = 500, payload?: unknown) {
    super(message);
    this.name = "PaystackError";
    this.status = status;
    this.payload = payload;
  }
}

export function readEnv(name: string, fallback?: string): string {
  const v = process.env[name] ?? fallback;
  if (!v) throw new PaystackError(`Missing env var: ${name}`, 500);
  return v;
}

export function getPaystackConfig() {
  return {
    secretKey: readEnv("PAYSTACK_SECRET_KEY"),
    publicKey: process.env.PAYSTACK_PUBLIC_KEY ?? process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY ?? "",
    apiUrl: process.env.PAYSTACK_API_URL ?? "https://api.paystack.co",
    country: process.env.PAYSTACK_COUNTRY ?? "KE",
    currency: process.env.PAYSTACK_CURRENCY ?? "KES",
    appUrl: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  };
}

export function getBaseUrl(): string {
  return process.env.PAYSTACK_API_URL ?? "https://api.paystack.co";
}

/**
 * Perform an authenticated request against the Paystack REST API.
 */
export async function paystackFetch<T = Record<string, unknown>>(
  endpoint: string,
  options: {
    method?: "GET" | "POST" | "PUT" | "DELETE";
    body?: Record<string, unknown>;
  } = {}
): Promise<{ status: boolean; message: string; data: T }> {
  const cfg = getPaystackConfig();
  const url = `${cfg.apiUrl}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;

  let res: Response;
  try {
    res = await fetch(url, {
      method: options.method ?? (options.body ? "POST" : "GET"),
      headers: {
        Authorization: `Bearer ${cfg.secretKey}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: options.body ? JSON.stringify(options.body) : undefined,
    });
  } catch (err) {
    throw new PaystackError(
      `Network error calling Paystack (${endpoint}): ${(err as Error).message}`,
      502
    );
  }

  let payload: { status?: boolean; message?: string; data?: T };
  try {
    payload = (await res.json()) as { status?: boolean; message?: string; data?: T };
  } catch {
    throw new PaystackError(
      `Invalid JSON from Paystack (${endpoint}, status ${res.status})`,
      res.status
    );
  }

  if (!res.ok || payload.status === false) {
    throw new PaystackError(
      payload.message ?? `Paystack API error on ${endpoint} (status ${res.status})`,
      res.status || 500,
      payload
    );
  }

  return payload as { status: boolean; message: string; data: T };
}

/**
 * Generate a unique transaction reference for Paystack.
 */
export function generateReference(prefix: string): string {
  const rand = Math.floor(Math.random() * 0xffffffff)
    .toString(16)
    .padStart(8, "0");
  return `${prefix}_${Date.now()}_${rand}`;
}
