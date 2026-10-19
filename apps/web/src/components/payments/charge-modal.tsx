"use client";

import { useState } from "react";
import { useForm } from "@tanstack/react-form";
import { useChargePaystack, useVerifyPaystack } from "@/lib/hooks/mutations";
import { Button } from "@havenly/ui/components/button";
import { Input } from "@havenly/ui/components/input";
import { Label } from "@havenly/ui/components/label";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@havenly/ui/components/sheet";
import { ConfirmAction } from "@/components/confirm-action";
import { RefreshCw } from "lucide-react";

type Renter = {
  id?: string;
  name?: string | null;
  email?: string | null;
  phone?: string | null;
};

type Props = {
  invoiceId: string;
  amount: number;
  currency: string;
  renter: Renter | null;
  appUrl: string;
};

export function ChargeButton({ invoiceId, amount, currency, renter, appUrl }: Props) {
  const [open, setOpen] = useState(false);
  const [result, setResult] = useState<{
    status: string;
    authUrl?: string;
    message?: string;
  } | null>(null);

  const chargeMutation = useChargePaystack();

  const form = useForm({
    defaultValues: {
      channel: "mpesa" as "mpesa" | "card",
      phone: renter?.phone ?? "",
      email: renter?.email ?? "",
    },
    onSubmit: async ({ value }) => {
      setResult(null);
      try {
        const data = await chargeMutation.mutateAsync({
          invoiceId,
          channel: value.channel,
          phone: value.phone,
          email: value.email,
        });
        setResult({ status: data.status ?? "pending", authUrl: data.authorizationUrl });
        if (data.authorizationUrl) {
          window.location.assign(data.authorizationUrl);
          return;
        }
      } catch (e) {
        setResult({
          status: "error",
          message: e instanceof Error ? e.message : "Network error",
        });
      }
    },
  });

  const redirectUrl = `${appUrl}/admin/payments?invoice=${invoiceId}`;

  const channelLabel = form.state.values.channel === "mpesa" ? "M-Pesa" : "Card";

  return (
    <Sheet
      open={open}
      onOpenChange={(val) => {
        setOpen(val);
        if (val) setResult(null);
      }}
    >
      <SheetTrigger
        render={
          <Button variant="default" size="sm" className="rounded-lg text-xs font-semibold">
            Charge
          </Button>
        }
      />
      <SheetContent side="right">
        <SheetHeader>
          <p className="text-muted-foreground text-xs font-semibold tracking-widest uppercase">
            Collect Payment
          </p>
          <SheetTitle className="text-xl font-semibold">
            {currency} {amount.toLocaleString()}
          </SheetTitle>
          {renter?.name && <p className="text-muted-foreground text-xs">Tenant: {renter.name}</p>}
        </SheetHeader>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit();
          }}
          className="grid gap-5 py-4"
        >
          <input type="hidden" name="redirectUrl" value={redirectUrl} />

          <form.Field name="channel">
            {(field) => (
              <div className="grid gap-2">
                <Label htmlFor="charge-channel" className="text-sm font-medium">
                  Payment Channel
                </Label>
                <select
                  id="charge-channel"
                  required
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value as "mpesa" | "card")}
                  className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
                >
                  <option value="mpesa">M-Pesa (Mobile Money)</option>
                  <option value="card">Debit / Credit Card (Paystack Checkout)</option>
                </select>
              </div>
            )}
          </form.Field>

          <form.Field name="phone">
            {(field) => (
              <div className="grid gap-2">
                <Label htmlFor="charge-phone" className="text-sm font-medium">
                  M-Pesa Phone Number
                </Label>
                <Input
                  id="charge-phone"
                  type="tel"
                  placeholder="2547XXXXXXXX"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                />
              </div>
            )}
          </form.Field>

          <form.Field name="email">
            {(field) => (
              <div className="grid gap-2">
                <Label htmlFor="charge-email" className="text-sm font-medium">
                  Receipt Email
                </Label>
                <Input
                  id="charge-email"
                  type="email"
                  required
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                />
              </div>
            )}
          </form.Field>

          {result && (
            <div
              className={`rounded-xl p-4 text-xs leading-relaxed ${
                result.status === "error"
                  ? "bg-destructive/10 text-destructive border-destructive/20 border"
                  : "bg-primary/10 text-primary border-primary/20 border"
              }`}
            >
              {result.status === "error" ? (
                <p className="font-medium">{result.message}</p>
              ) : result.authUrl ? (
                <p className="font-medium">Redirecting to Paystack checkout...</p>
              ) : (
                <p className="font-medium">
                  ✓ Payment initiated. Please request the tenant to complete the transaction on their
                  phone. Status will update automatically upon confirmation.
                </p>
              )}
            </div>
          )}

          <ConfirmAction
            title="Confirm charge"
            description={`You are about to charge ${currency} ${amount.toLocaleString()} via ${channelLabel}${form.state.values.channel === "mpesa" ? ` to ${form.state.values.phone || "the provided phone number"}` : ""}. The tenant will receive a payment request.`}
            confirmText="Yes, send charge"
            onConfirm={() => form.handleSubmit()}
          >
            <Button type="button" disabled={chargeMutation.isPending} className="mt-4 w-full">
              {chargeMutation.isPending
                ? "Initiating Charge..."
                : `Charge ${currency} ${amount.toLocaleString()}`}
            </Button>
          </ConfirmAction>
        </form>
      </SheetContent>
    </Sheet>
  );
}

export function VerifyButton({
  reference,
  txRef,
  kind,
}: {
  reference?: string;
  txRef?: string;
  kind: "charge" | "payout";
}) {
  const ref = reference ?? txRef ?? "";
  const verifyMutation = useVerifyPaystack();
  const [msg, setMsg] = useState("");

  function run() {
    if (!ref) return;
    setMsg("");
    verifyMutation.mutate(
      { kind, reference: ref },
      {
        onSuccess: (data) => {
          setMsg(`Status: ${data.status}`);
        },
        onError: (e) => {
          setMsg(e instanceof Error ? e.message : "Network error");
        },
      },
    );
  }

  return (
    <span className="inline-flex items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={run}
        disabled={verifyMutation.isPending}
        className="h-7 rounded-md px-2.5 text-xs font-semibold"
      >
        {verifyMutation.isPending ? (
          <RefreshCw className="mr-1 size-3 animate-spin" />
        ) : null}
        {verifyMutation.isPending ? "Checking..." : "Verify Status"}
      </Button>
      {msg && <span className="text-muted-foreground text-xs">{msg}</span>}
    </span>
  );
}
