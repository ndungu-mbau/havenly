"use client";

import { useState } from "react";
import { useForm } from "@tanstack/react-form";
import {
  useCreatePayout,
  useDeletePayoutDestination,
  useInitiatePayout,
} from "@/lib/hooks/mutations";
import { Button } from "@havenly/ui/components/button";
import { Input } from "@havenly/ui/components/input";
import { DeleteDialog } from "@/components/delete-dialog";
import { ConfirmAction } from "@/components/confirm-action";
import { Label } from "@havenly/ui/components/label";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@havenly/ui/components/sheet";
import { SendHorizontal } from "lucide-react";

export type Destination = {
  id: string;
  type: string;
  phone?: string | null;
  bankCode?: string | null;
  bankName?: string | null;
  accountNumber?: string | null;
  accountName?: string | null;
  isDefault?: boolean | null;
};

function label(d: Destination) {
  if (d.type === "mpesa") return `M-Pesa · ${d.phone ?? "?"}`;
  return `${d.bankName ?? d.bankCode ?? "Bank"} · ${d.accountNumber ?? "?"} (${d.accountName ?? "?"})`;
}

export function PayoutButton({
  destinations,
  defaultAmount,
}: {
  destinations: Destination[];
  defaultAmount?: number;
}) {
  const [open, setOpen] = useState(false);
  const createPayout = useCreatePayout();
  const initiatePayout = useInitiatePayout();
  const defaultDest = destinations.find((d) => d.isDefault) ?? destinations[0];

  const isPending = createPayout.isPending || initiatePayout.isPending;

  const form = useForm({
    defaultValues: {
      destinationId: defaultDest?.id ?? "",
      amount: defaultAmount ?? 0,
      narration: "",
    },
    onSubmit: async ({ value }) => {
      try {
        if (!value.destinationId || !value.amount || value.amount <= 0) return;

        const created = await createPayout.mutateAsync({
          destinationId: value.destinationId,
          amount: value.amount,
          narration: value.narration || undefined,
        } as any);

        await initiatePayout.mutateAsync({ payoutId: created.id });
        setOpen(false);
      } catch {
        // error state handled by mutation
      }
    },
  });

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        render={
          <Button
            disabled={destinations.length === 0}
            className="rounded-full shadow-xs"
          >
            <SendHorizontal className="mr-1.5 size-4" /> New Payout
          </Button>
        }
      />
      <SheetContent side="right">
        <SheetHeader>
          <p className="text-muted-foreground text-xs font-semibold tracking-widest uppercase">
            Disbursement
          </p>
          <SheetTitle className="text-xl font-semibold">
            Initiate Payout Transfer
          </SheetTitle>
        </SheetHeader>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit();
          }}
          className="grid gap-5 py-4"
        >
          <form.Field name="destinationId">
            {(field) => (
              <div className="grid gap-2">
                <Label htmlFor="payout-dest" className="text-sm font-medium">
                  Payout Destination
                </Label>
                <select
                  id="payout-dest"
                  required
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
                >
                  {destinations.map((d) => (
                    <option key={d.id} value={d.id}>
                      {label(d)}
                      {d.isDefault ? " (Default)" : ""}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </form.Field>

          <form.Field name="amount">
            {(field) => (
              <div className="grid gap-2">
                <Label htmlFor="payout-amount" className="text-sm font-medium">
                  Amount (KES)
                </Label>
                <Input
                  id="payout-amount"
                  type="number"
                  min={1}
                  required
                  value={field.state.value}
                  onChange={(e) => field.handleChange(Number(e.target.value))}
                />
              </div>
            )}
          </form.Field>

          <form.Field name="narration">
            {(field) => (
              <div className="grid gap-2">
                <Label
                  htmlFor="payout-narration"
                  className="text-sm font-medium"
                >
                  Narration (optional)
                </Label>
                <Input
                  id="payout-narration"
                  type="text"
                  placeholder="e.g. August rent disbursement"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                />
              </div>
            )}
          </form.Field>

          {(createPayout.isError || initiatePayout.isError) && (
            <p className="text-destructive text-sm font-medium">
              {createPayout.error?.message ??
                initiatePayout.error?.message ??
                "Payout failed"}
            </p>
          )}

          <ConfirmAction
            title="Confirm payout"
            description={`You are about to disburse ${form.state.values.amount ? `KES ${form.state.values.amount.toLocaleString()}` : ""} to ${defaultDest ? label(defaultDest) : "the selected destination"}. This action cannot be undone.`}
            confirmText="Yes, send payout"
            onConfirm={() => form.handleSubmit()}
          >
            <Button disabled={isPending} type="button" className="mt-4 w-full">
              {isPending ? "Initiating Paystack Transfer..." : "Send Payout"}
            </Button>
          </ConfirmAction>

          <p className="text-muted-foreground text-center text-xs">
            Transfers are processed through Paystack Transfers and automatically
            reconciled via webhook.
          </p>
        </form>
      </SheetContent>
    </Sheet>
  );
}

export function DeleteDestinationButton({ id }: { id: string }) {
  const deleteDestination = useDeletePayoutDestination();

  return (
    <DeleteDialog
      title="Delete payout destination?"
      description="This destination will be removed. You can add it again later if needed."
      onDelete={() => deleteDestination.mutateAsync(id as any)}
      triggerText="Delete"
      triggerVariant="outline"
    />
  );
}
