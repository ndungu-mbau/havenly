"use client";

import { useState } from "react";
import { useForm } from "@tanstack/react-form";
import { useAddCategory, useUpdateCategory } from "@/lib/hooks/mutations";
import { Button } from "@havenly/ui/components/button";
import { Input } from "@havenly/ui/components/input";
import { Label } from "@havenly/ui/components/label";
import { Textarea } from "@havenly/ui/components/textarea";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@havenly/ui/components/sheet";
import { FeaturesManager } from "@/components/features-manager";
import { Plus, Edit2 } from "lucide-react";

interface CategoryFormProps {
  category?: {
    id: string;
    title: string;
    features: string[];
    description: string;
    otherFeatures: Record<string, unknown>;
  };
  triggerVariant?: "default" | "outline" | "ghost";
  triggerSize?: "default" | "sm" | "icon";
}

export function CategoryForm({
  category,
  triggerVariant: _triggerVariant = "default",
  triggerSize = "default",
}: CategoryFormProps) {
  const [open, setOpen] = useState(false);
  const addCategory = useAddCategory();
  const updateCategory = useUpdateCategory();

  const isEdit = Boolean(category);
  const isPending = addCategory.isPending || updateCategory.isPending;

  const [features, setFeatures] = useState<string[]>(category?.features ?? []);
  const [otherFeatures, setOtherFeatures] = useState<Record<string, unknown>>(
    category?.otherFeatures ?? {}
  );

  const form = useForm({
    defaultValues: {
      title: category?.title ?? "",
      description: category?.description ?? "",
    },
    onSubmit: async ({ value }) => {
      try {
        const payload = {
          title: value.title,
          description: value.description,
          features,
          otherFeatures,
        };

        if (category) {
          await updateCategory.mutateAsync({ ...payload, id: category.id } as any);
        } else {
          await addCategory.mutateAsync(payload as any);
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
              aria-label="Edit category"
            >
              <Edit2 className="mr-1 size-3.5" /> Edit
            </Button>
          ) : (
            <Button className="rounded-full shadow-xs">
              <Plus className="mr-1.5 size-4" /> Add Category
            </Button>
          )
        }
      />
      <SheetContent side="right">
        <SheetHeader>
          <p className="text-muted-foreground text-xs font-semibold tracking-widest uppercase">
            Apartment Template
          </p>
          <SheetTitle className="text-xl font-semibold">
            {isEdit ? "Edit Category" : "New Apartment Category"}
          </SheetTitle>
        </SheetHeader>

        {(addCategory.isError || updateCategory.isError) && (
          <p className="text-destructive text-sm font-medium">
            Could not save category. Please check fields.
          </p>
        )}

        <form
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit();
          }}
          className="grid gap-6 py-4"
        >
          <form.Field name="title">
            {(field) => (
              <div className="grid gap-2">
                <Label htmlFor="title" className="text-sm font-medium">
                  Category Title
                </Label>
                <Input
                  id="title"
                  required
                  placeholder="e.g. 2-Bedroom Executive Deluxe"
                  className="text-sm"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                />
              </div>
            )}
          </form.Field>

          <form.Field name="description">
            {(field) => (
              <div className="grid gap-2">
                <Label htmlFor="description" className="text-sm font-medium">
                  Description (optional)
                </Label>
                <Textarea
                  id="description"
                  rows={3}
                  placeholder="Describe this unit template (e.g. Spacious modern floor plan with master ensuite and natural lighting)..."
                  className="resize-none text-sm"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                />
              </div>
            )}
          </form.Field>

          <FeaturesManager
            initialFeatures={category?.features ?? []}
            initialOtherFeatures={category?.otherFeatures ?? {}}
            onFeaturesChange={setFeatures}
            onOtherFeaturesChange={setOtherFeatures}
            tagsLabel="Standard Amenities"
            customAttributesLabel="Category Custom Specifications (JSON)"
          />

          <Button disabled={isPending} type="submit" className="mt-4 w-full">
            {isPending ? "Saving..." : isEdit ? "Update Category" : "Save Category"}
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  );
}
