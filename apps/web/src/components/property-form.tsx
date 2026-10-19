"use client";

import { useState } from "react";
import { useForm } from "@tanstack/react-form";
import { useAddProperty, useUpdateProperty } from "@/lib/hooks/mutations";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@havenly/ui/components/select";
import { Plus, Edit2 } from "lucide-react";
import { useGetAllCaretakers } from "@/lib/hooks/queries";

interface PropertyFormProps {
  property?: {
    id: string;
    name: string;
    address: string;
    city: string;
    state: string;
    caretakerId?: string | null;
  };
  triggerVariant?: "default" | "outline" | "ghost";
  triggerSize?: "default" | "sm" | "icon";
}

export function PropertyForm({
  property,
  triggerVariant: _triggerVariant = "default",
  triggerSize = "default",
}: PropertyFormProps) {
  const [open, setOpen] = useState(false);
  const { data: caretakersData } = useGetAllCaretakers();
  const caretakers = (caretakersData ?? []).map((c) => ({
    id: c.id,
    name: c.name,
  }));
  const addProperty = useAddProperty();
  const updateProperty = useUpdateProperty();

  const isEdit = Boolean(property);
  const isPending = addProperty.isPending || updateProperty.isPending;

  const form = useForm({
    defaultValues: {
      name: property?.name ?? "",
      address: property?.address ?? "",
      city: property?.city ?? "Nairobi",
      state: property?.state ?? "Nairobi",
      caretakerId: property?.caretakerId ?? "",
    },
    onSubmit: async ({ value }) => {
      try {
        if (property) {
          await updateProperty.mutateAsync({
            ...value,
            id: property.id,
          } as any);
        } else {
          await addProperty.mutateAsync(value as any);
        }
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
          isEdit ? (
            <Button
              variant="outline"
              size={triggerSize}
              className="text-xs"
              aria-label="Edit property"
            >
              <Edit2 className="mr-1 size-3.5" /> Edit
            </Button>
          ) : (
            <Button className="rounded-full shadow-xs">
              <Plus className="mr-1.5 size-4" /> Add Property
            </Button>
          )
        }
      />
      <SheetContent side="right">
        <SheetHeader>
          <p className="text-muted-foreground text-xs font-semibold tracking-widest uppercase">
            Property Location
          </p>
          <SheetTitle className="text-xl font-semibold">
            {isEdit ? "Edit Property" : "Add New Property"}
          </SheetTitle>
        </SheetHeader>

        {(addProperty.isError || updateProperty.isError) && (
          <p className="text-destructive text-sm font-medium">
            Could not save property. Please check the fields.
          </p>
        )}

        <form
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit();
          }}
          className="grid gap-6 py-4"
        >
          <form.Field name="name">
            {(field) => (
              <div className="grid gap-2">
                <Label htmlFor="name" className="text-sm font-medium">
                  Property Name
                </Label>
                <Input
                  id="name"
                  required
                  placeholder="e.g. Kilimani Heights Residence"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                />
              </div>
            )}
          </form.Field>

          <form.Field name="address">
            {(field) => (
              <div className="grid gap-2">
                <Label htmlFor="address" className="text-sm font-medium">
                  Street Address
                </Label>
                <Input
                  id="address"
                  required
                  placeholder="e.g. 14 Wood Avenue, Kilimani"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                />
              </div>
            )}
          </form.Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <form.Field name="city">
              {(field) => (
                <div className="grid gap-2">
                  <Label htmlFor="city" className="text-sm font-medium">
                    City / Town
                  </Label>
                  <Input
                    id="city"
                    required
                    placeholder="e.g. Nairobi"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                </div>
              )}
            </form.Field>

            <form.Field name="state">
              {(field) => (
                <div className="grid gap-2">
                  <Label htmlFor="state" className="text-sm font-medium">
                    County / State
                  </Label>
                  <Input
                    id="state"
                    required
                    placeholder="e.g. Nairobi County"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                </div>
              )}
            </form.Field>
          </div>

          <form.Field name="caretakerId">
            {(field) => (
              <div className="grid gap-2">
                <Label htmlFor="caretaker" className="text-sm font-medium">
                  Caretaker
                </Label>
                <Select
                  value={field.state.value}
                  onValueChange={(value) =>
                    field.handleChange(!value || value === "none" ? "" : value)
                  }
                >
                  <SelectTrigger id="caretaker" className="w-full">
                    <SelectValue placeholder="Select a caretaker" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {caretakers.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </form.Field>

          <Button disabled={isPending} type="submit" className="mt-4 w-full">
            {isPending
              ? "Saving..."
              : isEdit
                ? "Update Property"
                : "Save Property"}
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  );
}
