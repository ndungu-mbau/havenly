"use client";

import { useState } from "react";
import { useForm } from "@tanstack/react-form";
import { useAddRenter, useUpdateRenter } from "@/lib/hooks/mutations";
import { Button } from "@havenly/ui/components/button";
import { Input } from "@havenly/ui/components/input";
import { Label } from "@havenly/ui/components/label";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@havenly/ui/components/sheet";
import { Plus, Edit2 } from "lucide-react";

type House = { id: string; unitNumber: string; monthlyRent?: number };

interface RenterFormProps {
  houses: House[];
  renter?: {
    id: string;
    houseId: string;
    name: string;
    email?: string | null;
    phone?: string | null;
    leaseStart?: string | null;
    leaseEnd?: string | null;
  };
  triggerVariant?: "default" | "outline" | "ghost";
  triggerSize?: "default" | "sm" | "icon";
}

export function RenterForm({
  houses,
  renter,
  triggerSize = "default",
}: RenterFormProps) {
  const [open, setOpen] = useState(false);
  const addRenter = useAddRenter();
  const updateRenter = useUpdateRenter();

  const isEdit = Boolean(renter);
  const isPending = addRenter.isPending || updateRenter.isPending;

  const today = new Date().toISOString().slice(0, 10);
  const oneYearLater = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10);

  const form = useForm({
    defaultValues: {
      houseId: renter?.houseId ?? houses[0]?.id ?? "",
      name: renter?.name ?? "",
      email: renter?.email ?? "",
      phone: renter?.phone ?? "",
      leaseStart: renter?.leaseStart
        ? String(renter.leaseStart).slice(0, 10)
        : today,
      leaseEnd: renter?.leaseEnd
        ? String(renter.leaseEnd).slice(0, 10)
        : oneYearLater,
    },
    onSubmit: async ({ value }) => {
      try {
        const payload = {
          houseId: value.houseId,
          name: value.name,
          email: value.email || undefined,
          phone: value.phone || undefined,
          leaseStart: value.leaseStart || undefined,
          leaseEnd: value.leaseEnd || undefined,
        };

        if (renter) {
          await updateRenter.mutateAsync({ ...payload, id: renter.id });
        } else {
          await addRenter.mutateAsync(payload);
        }
        setOpen(false);
      } catch (e) {
        // error state handled by mutation
      }
    },
  });

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        render={
          isEdit ? (
            <Button
              variant="outline"
              size={triggerSize}
              className="text-xs"
              aria-label="Edit renter"
            >
              <Edit2 className="mr-1 size-3.5" /> Edit
            </Button>
          ) : (
            <Button
              disabled={houses.length === 0}
              className="rounded-full shadow-xs"
            >
              <Plus className="mr-1.5 size-4" /> Add Renter
            </Button>
          )
        }
      />
      <SheetContent side="right">
        <SheetHeader>
          <p className="text-muted-foreground text-xs font-semibold tracking-widest uppercase">
            Tenant Profile
          </p>
          <SheetTitle className="text-xl font-semibold">
            {isEdit ? `Edit ${renter?.name}` : "Register New Renter"}
          </SheetTitle>
        </SheetHeader>

        {(addRenter.isError || updateRenter.isError) && (
          <p className="text-destructive text-sm font-medium">
            {addRenter.error?.message ??
              updateRenter.error?.message ??
              "Could not save renter."}
          </p>
        )}

        <form
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit();
          }}
          className="grid gap-6 py-4"
        >
          <form.Field name="houseId">
            {(field) => (
              <div className="grid gap-2">
                <Label htmlFor="houseId" className="text-sm font-medium">
                  Assigned Apartment Unit
                </Label>
                <select
                  id="houseId"
                  required
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
                >
                  {houses.map((h) => (
                    <option key={h.id} value={h.id}>
                      Unit {h.unitNumber}
                      {h.monthlyRent
                        ? ` — KSh ${h.monthlyRent.toLocaleString()}/mo`
                        : ""}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </form.Field>

          <form.Field name="name">
            {(field) => (
              <div className="grid gap-2">
                <Label htmlFor="name" className="text-sm font-medium">
                  Full Name
                </Label>
                <Input
                  id="name"
                  required
                  placeholder="e.g. Jane Doe"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                />
              </div>
            )}
          </form.Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <form.Field name="email">
              {(field) => (
                <div className="grid gap-2">
                  <Label htmlFor="email" className="text-sm font-medium">
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="jane.doe@example.com"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                </div>
              )}
            </form.Field>

            <form.Field name="phone">
              {(field) => (
                <div className="grid gap-2">
                  <Label htmlFor="phone" className="text-sm font-medium">
                    Phone (e.g. 2547XXXXXXXX)
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="254712345678"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                </div>
              )}
            </form.Field>
          </div>

          <div className="border-border/50 grid gap-4 border-t pt-4 sm:grid-cols-2">
            <form.Field name="leaseStart">
              {(field) => (
                <div className="grid gap-2">
                  <Label htmlFor="leaseStart" className="text-sm font-medium">
                    Lease Start Date
                  </Label>
                  <Input
                    id="leaseStart"
                    type="date"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                </div>
              )}
            </form.Field>

            <form.Field name="leaseEnd">
              {(field) => (
                <div className="grid gap-2">
                  <Label htmlFor="leaseEnd" className="text-sm font-medium">
                    Lease End Date
                  </Label>
                  <Input
                    id="leaseEnd"
                    type="date"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                </div>
              )}
            </form.Field>
          </div>

          <p className="text-muted-foreground text-xs">
            Registering a renter with an email automatically provisions a
            customer profile on Paystack for instant M-Pesa/Card invoice
            charging.
          </p>

          <Button
            disabled={isPending || houses.length === 0}
            type="submit"
            className="mt-2 w-full"
          >
            {isPending
              ? "Saving..."
              : isEdit
                ? "Update Renter"
                : "Save Renter Profile"}
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  );
}
