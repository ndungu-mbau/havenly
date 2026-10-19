"use client";

import { useState } from "react";
import { useForm } from "@tanstack/react-form";
import { useCreateInvoice } from "@/lib/hooks/mutations";
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
import { Plus } from "lucide-react";
import { useGetAllHouses } from "@/lib/hooks/queries";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@havenly/ui/components/card";

export function CreateInvoiceButton({
  preselectedHouseId,
  preselectedRenterId,
  triggerText = "New Invoice",
  triggerVariant = "default",
  triggerSize = "default",
}: {
  preselectedHouseId?: string;
  preselectedRenterId?: string;
  triggerText?: string;
  triggerVariant?: "default" | "outline" | "ghost";
  triggerSize?: "default" | "sm" | "icon";
}) {
  const [open, setOpen] = useState(false);
  const createInvoice = useCreateInvoice();
  const { data: houses } = useGetAllHouses();

  const today = new Date();
  const defaultPeriod = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`;
  const defaultDue = new Date(today.getFullYear(), today.getMonth(), 5)
    .toISOString()
    .slice(0, 10);

  const form = useForm({
    defaultValues: {
      houseId: preselectedHouseId ?? houses?.[0]?.id ?? "",
      renterId: preselectedRenterId ?? "",
      period: defaultPeriod,
      dueDate: defaultDue,
      amount: "",
    },
    onSubmit: async ({ value }) => {
      try {
        const house = houses?.find((h) => h.id === value.houseId);
        await createInvoice.mutateAsync({
          houseId: value.houseId,
          renterId: value.renterId || null,
          period: value.period,
          dueDate: value.dueDate,
          amount: value.amount
            ? Number(value.amount)
            : (house?.monthlyRent ?? null),
        } as any);
        setOpen(false);
      } catch {
        // error state handled by mutation
      }
    },
  });

  if (!houses)
    return (
      <Card>
        <CardHeader>
          <CardTitle>No Houses</CardTitle>
        </CardHeader>
        <CardContent>
          <CardDescription>No houses found</CardDescription>
        </CardContent>
        {/* <CardFooter>
          <CardAction>
            <SheetClose>
              <Button variant="outline">Close</Button>
            </SheetClose>
          </CardAction>
        </CardFooter> */}
      </Card>
    );

  const renters = houses
    .filter((h) => h.renterId && h.renterName && h.renterHouseId)
    .map((h) => {
      return {
        id: h.renterId,
        name: h.renterName,
        email: h.renterEmail,
        phone: h.renterPhone,
        houseId: h.renterHouseId,
      };
    })
    .filter((r) => !!r && r !== null && r.id !== null);

  if (!renters || renters.every((r) => !r))
    return (
      <Card>
        <CardHeader>
          <CardTitle>No Renters</CardTitle>
        </CardHeader>
        <CardContent>
          <CardDescription>
            You have yet to register any renters in any of your houses
          </CardDescription>
        </CardContent>
        {/* <CardFooter>
          <CardAction>
            <SheetClose>
              <Button variant="outline">Close</Button>
            </SheetClose>
          </CardAction>
        </CardFooter> */}
      </Card>
    );

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        render={
          <Button
            variant={triggerVariant}
            size={triggerSize}
            className={
              triggerVariant === "default"
                ? "rounded-full shadow-xs"
                : "text-xs"
            }
          >
            <Plus className="mr-1.5 size-4" /> {triggerText}
          </Button>
        }
      />
      <SheetContent side="right">
        <SheetHeader>
          <p className="text-muted-foreground text-xs font-semibold tracking-widest uppercase">
            Billing & Invoicing
          </p>
          <SheetTitle className="text-xl font-semibold">
            Issue Rent Invoice
          </SheetTitle>
        </SheetHeader>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit();
          }}
          className="grid gap-5 py-4"
        >
          <form.Field name="houseId">
            {(field) => (
              <div className="grid gap-2">
                <Label
                  htmlFor="invoice-houseId"
                  className="text-sm font-medium"
                >
                  Apartment Unit
                </Label>
                <select
                  id="invoice-houseId"
                  required
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
                >
                  {houses.map((h) => (
                    <option key={h.id} value={h.id}>
                      Unit {h.unitNumber} — KSh {h.monthlyRent.toLocaleString()}
                      /mo
                    </option>
                  ))}
                </select>
              </div>
            )}
          </form.Field>

          <form.Field name="renterId">
            {(field) => (
              <div className="grid gap-2">
                <Label
                  htmlFor="invoice-renterId"
                  className="text-sm font-medium"
                >
                  Renter (optional)
                </Label>
                <select
                  id="invoice-renterId"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
                >
                  <option value="">— Auto-match current tenant —</option>
                  {renters.map((r) => (
                    <option key={r?.id} value={r?.id}>
                      {r.name} (Unit{" "}
                      {houses.find((h) => h.id === r.houseId)?.unitNumber ??
                        "?"}
                      )
                    </option>
                  ))}
                </select>
              </div>
            )}
          </form.Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <form.Field name="period">
              {(field) => (
                <div className="grid gap-2">
                  <Label
                    htmlFor="invoice-period"
                    className="text-sm font-medium"
                  >
                    Billing Period (YYYY-MM)
                  </Label>
                  <Input
                    id="invoice-period"
                    type="text"
                    required
                    pattern="\d{4}-\d{2}"
                    placeholder="2026-08"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                </div>
              )}
            </form.Field>
            <form.Field name="dueDate">
              {(field) => (
                <div className="grid gap-2">
                  <Label
                    htmlFor="invoice-dueDate"
                    className="text-sm font-medium"
                  >
                    Due Date
                  </Label>
                  <Input
                    id="invoice-dueDate"
                    type="date"
                    required
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                </div>
              )}
            </form.Field>
          </div>

          <form.Field name="amount">
            {(field) => (
              <div className="grid gap-2">
                <Label htmlFor="invoice-amount" className="text-sm font-medium">
                  Amount Override (KSh) — leave blank for standard rent
                </Label>
                <Input
                  id="invoice-amount"
                  type="number"
                  min={0}
                  placeholder="Auto (uses unit rent)"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                />
              </div>
            )}
          </form.Field>

          {createInvoice.isError && (
            <p className="text-destructive text-sm font-medium">
              {createInvoice.error?.message ?? "Could not create invoice"}
            </p>
          )}

          <Button
            disabled={createInvoice.isPending || houses.length === 0}
            type="submit"
            className="mt-4 w-full"
          >
            {createInvoice.isPending
              ? "Generating Invoice..."
              : "Create & Send Invoice"}
          </Button>

          {houses.length === 0 && (
            <p className="text-muted-foreground text-center text-xs">
              Add a property and at least one apartment first.
            </p>
          )}
        </form>
      </SheetContent>
    </Sheet>
  );
}
