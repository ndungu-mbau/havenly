"use client";

import { Button } from "@havenly/ui/components/button";
import { Input } from "@havenly/ui/components/input";
import { Label } from "@havenly/ui/components/label";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@havenly/ui/components/sheet";
import { Plus, Edit2 } from "lucide-react";
import { useState } from "react";
import { useForm } from "@tanstack/react-form";
import { useAddCaretaker, useUpdateCaretaker } from "@/lib/hooks/mutations";

interface CaretakerFormProps {
  caretaker?: {
    id: string;
    name: string;
    email: string;
    phone?: string | null;
  };
  triggerVariant?: "default" | "outline" | "ghost";
  triggerSize?: "default" | "sm" | "icon";
}

export function CaretakerForm({
  caretaker,
  triggerVariant: _triggerVariant = "default",
  triggerSize = "default",
}: CaretakerFormProps) {
  const [open, setOpen] = useState(false);
  const addCaretaker = useAddCaretaker();
  const updateCaretaker = useUpdateCaretaker();

  const isEdit = Boolean(caretaker);

  const form = useForm({
    defaultValues: {
      name: caretaker?.name ?? "",
      email: caretaker?.email ?? "",
      phone: caretaker?.phone ?? "",
    },
    onSubmit: async ({ value }) => {
      try {
        if (caretaker) {
          await updateCaretaker.mutateAsync({ id: caretaker.id, ...value });
        } else {
          await addCaretaker.mutateAsync(value);
        }
        setOpen(false);
      } catch {
        // Handled in mutation onError
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
              aria-label="Edit caretaker"
            >
              <Edit2 className="mr-1 size-3.5" /> Edit
            </Button>
          ) : (
            <Button className="rounded-full shadow-xs">
              <Plus className="mr-1.5 size-4" /> Add Caretaker
            </Button>
          )
        }
      />
      <SheetContent side="right">
        <SheetHeader>
          <p className="text-muted-foreground text-xs font-semibold tracking-widest uppercase">
            Staff Management
          </p>
          <SheetTitle className="text-xl font-semibold">
            {isEdit ? "Edit Caretaker" : "Add New Caretaker"}
          </SheetTitle>
        </SheetHeader>

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

          <form.Field name="email">
            {(field) => (
              <div className="grid gap-2">
                <Label htmlFor="email" className="text-sm font-medium">
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  required
                  placeholder="jane@example.com"
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
                  Phone Number
                </Label>
                <Input
                  id="phone"
                  placeholder="+254..."
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                />
              </div>
            )}
          </form.Field>

          <Button type="submit" className="mt-4 w-full">
            {isEdit ? "Update Caretaker" : "Save Caretaker"}
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  );
}
