"use client";

import { useState } from "react";
import { useForm } from "@tanstack/react-form";
import { useAddPayoutDestination } from "@/lib/hooks/mutations";
import { Button } from "@havenly/ui/components/button";
import { Input } from "@havenly/ui/components/input";
import { Label } from "@havenly/ui/components/label";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@havenly/ui/components/sheet";
import { Plus } from "lucide-react";

export function AddDestinationButton() {
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<"mpesa" | "bank">("mpesa");
  const addDestination = useAddPayoutDestination();

  const form = useForm({
    defaultValues: {
      phone: "",
      bankCode: "",
      bankName: "",
      accountNumber: "",
      accountName: "",
      isDefault: false,
    },
    onSubmit: async ({ value }) => {
      try {
        await addDestination.mutateAsync({
          type,
          phone: value.phone || undefined,
          bankCode: value.bankCode || undefined,
          bankName: value.bankName || undefined,
          accountNumber: value.accountNumber || undefined,
          accountName: value.accountName || undefined,
          isDefault: value.isDefault,
        } as any);
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
          <Button className="rounded-full shadow-xs">
            <Plus className="mr-1.5 size-4" /> Add Destination
          </Button>
        }
      />
      <SheetContent side="right">
        <SheetHeader>
          <p className="text-muted-foreground text-xs font-semibold tracking-widest uppercase">
            Disbursement Target
          </p>
          <SheetTitle className="text-xl font-semibold">Add Payout Destination</SheetTitle>
        </SheetHeader>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit();
          }}
          className="grid gap-5 py-4"
        >
          <div className="grid gap-2">
            <Label className="text-sm font-medium">Channel Type</Label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as "mpesa" | "bank")}
              className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
            >
              <option value="mpesa">M-Pesa Mobile Money</option>
              <option value="bank">Bank Account</option>
            </select>
          </div>

          {type === "mpesa" ? (
            <form.Field name="phone">
              {(field) => (
                <div className="grid gap-2">
                  <Label htmlFor="dest-phone" className="text-sm font-medium">
                    Phone Number (e.g. 2547XXXXXXXX)
                  </Label>
                  <Input
                    id="dest-phone"
                    type="tel"
                    required
                    placeholder="254712345678"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                </div>
              )}
            </form.Field>
          ) : (
            <>
              <div className="grid gap-4 sm:grid-cols-2">
                <form.Field name="bankCode">
                  {(field) => (
                    <div className="grid gap-2">
                      <Label htmlFor="dest-bankCode" className="text-sm font-medium">
                        Bank Code
                      </Label>
                      <Input
                        id="dest-bankCode"
                        type="text"
                        required
                        placeholder="e.g. 01, KCBK"
                        value={field.state.value}
                        onChange={(e) => field.handleChange(e.target.value)}
                      />
                    </div>
                  )}
                </form.Field>
                <form.Field name="bankName">
                  {(field) => (
                    <div className="grid gap-2">
                      <Label htmlFor="dest-bankName" className="text-sm font-medium">
                        Bank Name
                      </Label>
                      <Input
                        id="dest-bankName"
                        type="text"
                        placeholder="e.g. KCB Bank"
                        value={field.state.value}
                        onChange={(e) => field.handleChange(e.target.value)}
                      />
                    </div>
                  )}
                </form.Field>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <form.Field name="accountNumber">
                  {(field) => (
                    <div className="grid gap-2">
                      <Label htmlFor="dest-accountNumber" className="text-sm font-medium">
                        Account Number
                      </Label>
                      <Input
                        id="dest-accountNumber"
                        type="text"
                        required
                        placeholder="1234567890"
                        value={field.state.value}
                        onChange={(e) => field.handleChange(e.target.value)}
                      />
                    </div>
                  )}
                </form.Field>
                <form.Field name="accountName">
                  {(field) => (
                    <div className="grid gap-2">
                      <Label htmlFor="dest-accountName" className="text-sm font-medium">
                        Account Holder Name
                      </Label>
                      <Input
                        id="dest-accountName"
                        type="text"
                        required
                        placeholder="John Doe"
                        value={field.state.value}
                        onChange={(e) => field.handleChange(e.target.value)}
                      />
                    </div>
                  )}
                </form.Field>
              </div>
            </>
          )}

          <form.Field name="isDefault">
            {(field) => (
              <div className="flex items-center gap-2 pt-1">
                <input
                  id="dest-isDefault"
                  type="checkbox"
                  checked={field.state.value}
                  onChange={(e) => field.handleChange(e.target.checked)}
                  className="border-input accent-primary size-4 rounded"
                />
                <Label
                  htmlFor="dest-isDefault"
                  className="text-muted-foreground cursor-pointer text-xs font-normal"
                >
                  Set as primary payout destination
                </Label>
              </div>
            )}
          </form.Field>

          {addDestination.isError && (
            <p className="text-destructive text-sm font-medium">
              {addDestination.error?.message ?? "Could not save destination"}
            </p>
          )}

          <Button disabled={addDestination.isPending} type="submit" className="mt-4 w-full">
            {addDestination.isPending ? "Saving..." : "Save Destination"}
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  );
}
