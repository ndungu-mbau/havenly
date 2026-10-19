import { createFileRoute } from "@tanstack/react-router";
import { useRentalSummary } from "@/lib/hooks/queries";
import { useDeleteCategory } from "@/lib/hooks/mutations";
import { CategoryForm } from "@/components/category-form";
import { DeleteDialog } from "@/components/delete-dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@havenly/ui/components/card";
import { Badge } from "@havenly/ui/components/badge";
import { Tags, Sparkles, Code2, Layers, Loader2 } from "lucide-react";

export const Route = createFileRoute("/_auth/admin/categories")({
  component: CategoriesPage,
});

function CategoriesPage() {
  const { data, isLoading, error } = useRentalSummary();
  const deleteCategory = useDeleteCategory();

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="text-primary size-6 animate-spin" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-muted-foreground text-sm">
          Failed to load categories.
        </p>
      </div>
    );
  }

  const { categories, houses } = data;

  const unitCountByCategory = new Map<string, number>();
  for (const h of houses) {
    if (h.categoryId) {
      unitCountByCategory.set(
        h.categoryId,
        (unitCountByCategory.get(h.categoryId) ?? 0) + 1,
      );
    }
  }

  return (
    <main className="mx-auto max-w-[1500px] space-y-8 px-4 py-8 sm:px-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className="text-primary border-primary/20 bg-primary/5 text-xs font-semibold"
            >
              Apartment Templates
            </Badge>
            <span className="text-muted-foreground text-xs">
              · Reusable floor plans
            </span>
          </div>
          <h1 className="text-foreground mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
            Categories & Specs
          </h1>
          <p className="text-muted-foreground mt-1 max-w-xl text-sm leading-relaxed">
            Define blueprint templates and feature packages. Individual
            apartments can inherit and override any field.
          </p>
        </div>

        <CategoryForm />
      </div>

      {categories.length === 0 ? (
        <Card className="border-border/80 border-dashed p-12 text-center">
          <div className="bg-primary/10 text-primary mx-auto grid size-12 place-items-center rounded-xl">
            <Tags className="size-6" />
          </div>
          <h3 className="mt-4 text-lg font-semibold">
            No apartment categories yet
          </h3>
          <p className="text-muted-foreground mx-auto mt-1 max-w-sm text-sm">
            Create reusable category templates with standard amenities and
            custom JSON specifications.
          </p>
          <div className="mt-6">
            <CategoryForm />
          </div>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {categories.map((category) => {
            const linkedUnits = unitCountByCategory.get(category.id) ?? 0;
            const otherFeaturesObj =
              category.otherFeatures &&
              typeof category.otherFeatures === "object"
                ? (category.otherFeatures as Record<string, unknown>)
                : {};
            const otherEntries = Object.entries(otherFeaturesObj);

            return (
              <Card
                key={category.id}
                className="border-border flex flex-col justify-between shadow-xs transition-shadow hover:shadow-sm"
              >
                <CardHeader className="space-y-2">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className="bg-primary/10 text-primary grid size-9 place-items-center rounded-lg font-bold">
                        <Layers size={18} />
                      </div>
                      <div>
                        <CardTitle className="text-base font-semibold">
                          {category.title}
                        </CardTitle>
                        <CardDescription className="mt-0.5 text-xs">
                          {linkedUnits} unit{linkedUnits === 1 ? "" : "s"} using
                          this template
                        </CardDescription>
                      </div>
                    </div>
                    <Badge
                      variant="secondary"
                      className="shrink-0 text-[11px] font-medium"
                    >
                      ID #{category.id}
                    </Badge>
                  </div>

                  {category.description && (
                    <p className="text-muted-foreground pt-1 text-xs leading-relaxed">
                      {category.description}
                    </p>
                  )}
                </CardHeader>

                <CardContent className="space-y-4 pt-0">
                  <div>
                    <p className="text-muted-foreground mb-2 flex items-center gap-1 text-[11px] font-medium tracking-wider uppercase">
                      <Sparkles className="text-primary size-3" /> Amenities &
                      Features
                    </p>
                    {category.features.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5">
                        {category.features.map((feature) => (
                          <Badge
                            key={feature}
                            variant="secondary"
                            className="bg-muted/70 text-foreground border-border/50 border text-xs font-normal"
                          >
                            {feature}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground text-xs italic">
                        No amenities specified
                      </p>
                    )}
                  </div>

                  {otherEntries.length > 0 && (
                    <div className="border-border/50 border-t pt-3">
                      <p className="text-muted-foreground mb-2 flex items-center gap-1 text-[11px] font-medium tracking-wider uppercase">
                        <Code2 className="text-primary size-3" /> Custom JSON
                        Specs
                      </p>
                      <div className="grid grid-cols-2 gap-1.5 text-xs">
                        {otherEntries.map(([k, v]) => (
                          <div
                            key={k}
                            className="bg-muted/40 border-border/40 rounded-md border p-2"
                          >
                            <span className="text-muted-foreground block truncate font-mono text-[11px]">
                              {k}
                            </span>
                            <span className="text-foreground mt-0.5 block truncate font-semibold">
                              {String(v)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="border-border/50 flex items-center justify-between border-t pt-3">
                    <CategoryForm
                      category={{
                        id: category.id,
                        title: category.title,
                        description: category.description,
                        features: category.features,
                        otherFeatures: otherFeaturesObj,
                      }}
                      triggerVariant="outline"
                      triggerSize="sm"
                    />

                    <DeleteDialog
                      title={`Delete "${category.title}"?`}
                      description={`Are you sure you want to delete this category? Apartments linked to this category will revert to standalone templates.`}
                      onDelete={() =>
                        deleteCategory.mutateAsync({ id: category.id })
                      }
                      triggerText="Delete"
                      triggerVariant="ghost"
                    />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </main>
  );
}
