"use client";

import { useState } from "react";
import { useForm } from "@tanstack/react-form";
import {
  useAddProperty,
  useAddRenter,
  useRecordPayment,
} from "@/lib/hooks/mutations";
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

type Kind = "properties" | "renters" | "payments";

export function RentalActions({
  kind,
  houses,
}: {
  kind: Kind;
  houses: Array<{ id: string; unitNumber: string }>;
}) {
  const [open, setOpen] = useState(false);
  const addProperty = useAddProperty();
  const addRenter = useAddRenter();
  const recordPayment = useRecordPayment();

  const isPending =
    addProperty.isPending || addRenter.isPending || recordPayment.isPending;
  const isError =
    addProperty.isError || addRenter.isError || recordPayment.isError;

  const form = useForm({
    defaultValues: {
      name: "",
      address: "",
      city: "Nairobi",
      state: "Nairobi",
      houseId: houses[0]?.id ?? "",
      email: "",
      phone: "",
      amount: 0,
      paymentDate: "",
      period: "",
      method: "",
    },
    onSubmit: async ({ value }) => {
      try {
        if (kind === "properties")
          await addProperty.mutateAsync({
            name: value.name,
            address: value.address,
            city: value.city,
            state: value.state,
          });
        if (kind === "renters") {
          await addRenter.mutateAsync({
            houseId: value.houseId,
            name: value.name,
            email: value.email || undefined,
            phone: value.phone || undefined,
          });
        }
        if (kind === "payments")
          await recordPayment.mutateAsync({
            houseId: value.houseId,
            amount: value.amount,
            paymentDate: value.paymentDate,
            period: value.period,
            method: value.method,
          });
        setOpen(false);
      } catch {
        // error state handled by mutation
      }
    },
  });

  const title =
    kind === "properties"
      ? "Add Property"
      : kind === "renters"
        ? "Add Renter"
        : "Record Payment";

  return (
    <>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger
          render={
            <Button className="rounded-full shadow-xs">
              <Plus className="mr-1.5 size-4" /> {title}
            </Button>
          }
        />
        <SheetContent side="right">
          <SheetHeader>
            <p className="text-muted-foreground text-xs font-semibold tracking-widest uppercase">
              New Record
            </p>
            <SheetTitle className="text-xl font-semibold">{title}</SheetTitle>
          </SheetHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              form.handleSubmit();
            }}
            className="mt-2 grid gap-5 py-4"
          >
            <div className="grid gap-4">
              {kind === "properties" ? (
                <>
                  <form.Field name="name">
                    {(field) => (
                      <FieldBase
                        label="Property Name"
                        placeholder="e.g. Kilimani Heights"
                        value={field.state.value}
                        onChange={field.handleChange}
                      />
                    )}
                  </form.Field>
                  <form.Field name="address">
                    {(field) => (
                      <FieldBase
                        label="Address"
                        placeholder="e.g. 14 Wood Ave"
                        value={field.state.value}
                        onChange={field.handleChange}
                      />
                    )}
                  </form.Field>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <form.Field name="city">
                      {(field) => (
                        <FieldBase
                          label="City"
                          value={field.state.value}
                          onChange={field.handleChange}
                        />
                      )}
                    </form.Field>
                    <form.Field name="state">
                      {(field) => (
                        <FieldBase
                          label="County / State"
                          value={field.state.value}
                          onChange={field.handleChange}
                        />
                      )}
                    </form.Field>
                  </div>
                </>
              ) : (
                <>
                  <div className="grid gap-2">
                    <Label htmlFor="houseId" className="text-sm font-medium">
                      Apartment Unit
                    </Label>
                    <select
                      id="houseId"
                      required
                      value={form.state.values.houseId}
                      onChange={(e) =>
                        form.setFieldValue("houseId", e.target.value)
                      }
                      className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
                    >
                      {houses.map((h) => (
                        <option key={h.id} value={h.id}>
                          Unit {h.unitNumber}
                        </option>
                      ))}
                    </select>
                  </div>
                  {kind === "renters" ? (
                    <>
                      <form.Field name="name">
                        {(field) => (
                          <FieldBase
                            label="Renter Name"
                            placeholder="e.g. Jane Doe"
                            value={field.state.value}
                            onChange={field.handleChange}
                          />
                        )}
                      </form.Field>
                      <form.Field name="email">
                        {(field) => (
                          <FieldBase
                            label="Email"
                            type="email"
                            placeholder="jane@example.com"
                            required={false}
                            value={field.state.value}
                            onChange={field.handleChange}
                          />
                        )}
                      </form.Field>
                      <form.Field name="phone">
                        {(field) => (
                          <FieldBase
                            label="Phone"
                            placeholder="2547XXXXXXXX"
                            required={false}
                            value={field.state.value}
                            onChange={field.handleChange}
                          />
                        )}
                      </form.Field>
                    </>
                  ) : (
                    <>
                      <form.Field name="amount">
                        {(field) => (
                          <FieldBase
                            label="Amount (KSh)"
                            type="number"
                            placeholder="e.g. 50000"
                            value={field.state.value}
                            onChange={(v) => field.handleChange(Number(v))}
                          />
                        )}
                      </form.Field>
                      <form.Field name="paymentDate">
                        {(field) => (
                          <FieldBase
                            label="Payment Date"
                            type="date"
                            value={field.state.value}
                            onChange={field.handleChange}
                          />
                        )}
                      </form.Field>
                      <form.Field name="period">
                        {(field) => (
                          <FieldBase
                            label="Rent Period"
                            placeholder="e.g. August 2026"
                            value={field.state.value}
                            onChange={field.handleChange}
                          />
                        )}
                      </form.Field>
                      <form.Field name="method">
                        {(field) => (
                          <FieldBase
                            label="Payment Method"
                            placeholder="e.g. M-Pesa or Bank"
                            value={field.state.value}
                            onChange={field.handleChange}
                          />
                        )}
                      </form.Field>
                    </>
                  )}
                </>
              )}
            </div>
            <Button disabled={isPending} type="submit" className="mt-4 w-full">
              {isPending ? "Saving..." : "Save Record"}
            </Button>
          </form>
        </SheetContent>
      </Sheet>
      {isError && (
        <p className="text-destructive mt-2 text-xs">
          Could not save this record.
        </p>
      )}
    </>
  );
}

function FieldBase({
  label,
  type = "text",
  placeholder,
  required = true,
  value,
  onChange,
}: {
  label: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
  value: string | number;
  onChange: (val: string) => void;
}) {
  return (
    <div className="grid gap-2">
      <Label className="text-sm font-medium">{label}</Label>
      <Input
        type={type}
        placeholder={placeholder}
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
