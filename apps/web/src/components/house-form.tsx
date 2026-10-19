"use client";

import { useState } from "react";
import { useForm } from "@tanstack/react-form";
import { useAddHouse, useUpdateHouse } from "@/lib/hooks/mutations";
import { Button } from "@havenly/ui/components/button";
import { Input } from "@havenly/ui/components/input";
import { Label } from "@havenly/ui/components/label";
import { Textarea } from "@havenly/ui/components/textarea";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@havenly/ui/components/sheet";
import { FeaturesManager } from "@/components/features-manager";
import { Plus, Edit2 } from "lucide-react";

type HouseFormProps = {
  propertyId: string;
  categories?: Array<{ id: string; title: string }>;
  house?: {
    id: string;
    unitNumber: string;
    categoryId: string | null;
    monthlyRent: number;
    bedrooms: number;
    bathrooms: string;
    sizeSqft: number;
    status: string;
    overrideTitle: string | null;
    overrideFeatures: string[] | null;
    overrideDescription: string | null;
    overrideOtherFeatures?: Record<string, unknown> | null;
  };
};

export function HouseForm({ propertyId, categories = [], house }: HouseFormProps) {
  const [open, setOpen] = useState(false);
  const addHouse = useAddHouse();
  const updateHouse = useUpdateHouse();

  const isEdit = Boolean(house);
  const isPending = addHouse.isPending || updateHouse.isPending;

  const [overrideFeatures, setOverrideFeatures] = useState<string[]>(house?.overrideFeatures ?? []);
  const [overrideOtherFeatures, setOverrideOtherFeatures] = useState<Record<string, unknown>>(
    house?.overrideOtherFeatures ?? {}
  );

  const form = useForm({
    defaultValues: {
      unitNumber: house?.unitNumber ?? "",
      monthlyRent: house?.monthlyRent ?? 0,
      bedrooms: house?.bedrooms ?? 1,
      bathrooms: house?.bathrooms ?? "1",
      sizeSqft: house?.sizeSqft ?? 0,
      status: house?.status ?? "vacant",
      categoryId: house?.categoryId ?? "none",
      overrideTitle: house?.overrideTitle ?? "",
      overrideDescription: house?.overrideDescription ?? "",
    },
    onSubmit: async ({ value }) => {
      try {
        const categoryId =
          value.categoryId && value.categoryId !== "none" ? value.categoryId : undefined;

        const payload = {
          propertyId,
          unitNumber: value.unitNumber,
          categoryId,
          monthlyRent: value.monthlyRent,
          bedrooms: value.bedrooms,
          bathrooms: value.bathrooms,
          sizeSqft: value.sizeSqft,
          status: value.status,
          overrideTitle: value.overrideTitle || undefined,
          overrideDescription: value.overrideDescription || undefined,
          overrideFeatures,
          overrideOtherFeatures,
        };

        if (house) await updateHouse.mutateAsync({ ...payload, id: house.id } as any);
        else await addHouse.mutateAsync(payload as any);
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
            <Button variant="outline" size="sm" className="text-xs">
              <Edit2 className="mr-1 size-3.5" /> Edit
            </Button>
          ) : (
            <Button className="rounded-full shadow-xs">
              <Plus className="mr-1.5 size-4" /> Add Apartment
            </Button>
          )
        }
      />
      <SheetContent side="right">
        <SheetHeader>
          <p className="text-muted-foreground text-xs font-semibold tracking-widest uppercase">
            Apartment Unit Details
          </p>
          <SheetTitle className="text-xl font-semibold">
            {isEdit ? `Edit Unit ${house?.unitNumber}` : "Add New Apartment Unit"}
          </SheetTitle>
        </SheetHeader>

        {(addHouse.isError || updateHouse.isError) && (
          <p className="text-destructive text-sm font-medium">
            Could not save this house. Check the fields and try again.
          </p>
        )}

        <form
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit();
          }}
          className="grid gap-6 py-4"
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <form.Field name="unitNumber">
              {(field) => (
                <div className="grid gap-2">
                  <Label htmlFor="unitNumber" className="text-sm font-medium">
                    Unit Number
                  </Label>
                  <Input
                    id="unitNumber"
                    required
                    placeholder="e.g. 4B, 102, Penthouse"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                </div>
              )}
            </form.Field>

            <form.Field name="monthlyRent">
              {(field) => (
                <div className="grid gap-2">
                  <Label htmlFor="monthlyRent" className="text-sm font-medium">
                    Monthly Rent (KSh)
                  </Label>
                  <Input
                    id="monthlyRent"
                    type="number"
                    required
                    placeholder="e.g. 65000"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(Number(e.target.value))}
                  />
                </div>
              )}
            </form.Field>

            <form.Field name="bedrooms">
              {(field) => (
                <div className="grid gap-2">
                  <Label htmlFor="bedrooms" className="text-sm font-medium">
                    Bedrooms
                  </Label>
                  <Input
                    id="bedrooms"
                    type="number"
                    required
                    value={field.state.value}
                    onChange={(e) => field.handleChange(Number(e.target.value))}
                  />
                </div>
              )}
            </form.Field>

            <form.Field name="bathrooms">
              {(field) => (
                <div className="grid gap-2">
                  <Label htmlFor="bathrooms" className="text-sm font-medium">
                    Bathrooms
                  </Label>
                  <Input
                    id="bathrooms"
                    required
                    placeholder="e.g. 1 or 2.5"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                </div>
              )}
            </form.Field>

            <form.Field name="sizeSqft">
              {(field) => (
                <div className="grid gap-2">
                  <Label htmlFor="sizeSqft" className="text-sm font-medium">
                    Size (sq ft)
                  </Label>
                  <Input
                    id="sizeSqft"
                    type="number"
                    placeholder="e.g. 850"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(Number(e.target.value))}
                  />
                </div>
              )}
            </form.Field>

            <form.Field name="status">
              {(field) => (
                <div className="grid gap-2">
                  <Label htmlFor="status" className="text-sm font-medium">
                    Occupancy Status
                  </Label>
                  <select
                    id="status"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
                  >
                    <option value="vacant">Vacant</option>
                    <option value="occupied">Occupied</option>
                    <option value="maintenance">Under Maintenance</option>
                  </select>
                </div>
              )}
            </form.Field>
          </div>

          {categories.length > 0 && (
            <div className="border-border/50 grid gap-2 border-t pt-4">
              <form.Field name="categoryId">
                {(field) => (
                  <>
                    <Label htmlFor="categoryId" className="text-sm font-medium">
                      Category Template (optional)
                    </Label>
                    <select
                      id="categoryId"
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
                    >
                      <option value="none">None (Standalone unit)</option>
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.title}
                        </option>
                      ))}
                    </select>
                  </>
                )}
              </form.Field>
            </div>
          )}

          <div className="border-border/50 space-y-4 border-t pt-4">
            <form.Field name="overrideTitle">
              {(field) => (
                <div className="grid gap-2">
                  <Label htmlFor="overrideTitle" className="text-sm font-medium">
                    Custom Title / Label (optional)
                  </Label>
                  <Input
                    id="overrideTitle"
                    placeholder="e.g. Corner Penthouse with Panoramic Balcony"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                </div>
              )}
            </form.Field>

            <form.Field name="overrideDescription">
              {(field) => (
                <div className="grid gap-2">
                  <Label htmlFor="overrideDescription" className="text-sm font-medium">
                    Unit Description (optional)
                  </Label>
                  <Textarea
                    id="overrideDescription"
                    rows={2}
                    placeholder="Special notes or description for this specific apartment unit..."
                    className="resize-none text-sm"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                </div>
              )}
            </form.Field>

            <FeaturesManager
              initialFeatures={house?.overrideFeatures ?? []}
              initialOtherFeatures={house?.overrideOtherFeatures ?? {}}
              onFeaturesChange={setOverrideFeatures}
              onOtherFeaturesChange={setOverrideOtherFeatures}
              tagsLabel="Unit Amenities & Feature Tags"
              customAttributesLabel="Unit Custom Specifications (JSON)"
            />
          </div>

          <Button disabled={isPending} type="submit" className="mt-4 w-full">
            {isPending ? "Saving..." : isEdit ? "Update Apartment" : "Save Apartment"}
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  );
}
