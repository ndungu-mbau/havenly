import { Link, createFileRoute } from "@tanstack/react-router";
import { useRentalSummary } from "@/lib/hooks/queries";
import { useDeleteProperty } from "@/lib/hooks/mutations";
import { PropertyForm } from "@/components/property-form";
import { DeleteDialog } from "@/components/delete-dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@havenly/ui/components/card";
import { Badge } from "@havenly/ui/components/badge";
import { Button } from "@havenly/ui/components/button";
import { Building2, MapPin, ArrowRight, Percent, Loader2 } from "lucide-react";

export const Route = createFileRoute("/_auth/admin/properties/")({
  component: PropertiesPage,
});

function PropertiesPage() {
  const { data, isLoading, error } = useRentalSummary();
  const deleteProperty = useDeleteProperty();

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
          Failed to load properties.
        </p>
      </div>
    );
  }

  const { properties, houses } = data;

  return (
    <main className="mx-auto max-w-[1500px] space-y-8 px-4 py-8 sm:px-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className="text-primary border-primary/20 bg-primary/5 text-xs font-semibold"
            >
              Portfolio
            </Badge>
            <span className="text-muted-foreground text-xs">
              · {properties.length} active locations
            </span>
          </div>
          <h1 className="text-foreground mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
            Properties
          </h1>
          <p className="text-muted-foreground mt-1 max-w-xl text-sm leading-relaxed">
            Manage your real-estate buildings, locations, and view occupancy
            status across each property.
          </p>
        </div>

        <PropertyForm />
      </div>

      {properties.length === 0 ? (
        <Card className="border-border/80 border-dashed p-12 text-center">
          <div className="bg-primary/10 text-primary mx-auto grid size-12 place-items-center rounded-xl">
            <Building2 className="size-6" />
          </div>
          <h3 className="mt-4 text-lg font-semibold">
            No properties registered
          </h3>
          <p className="text-muted-foreground mx-auto mt-1 max-w-sm text-sm">
            Add your first rental building to start listing apartment units and
            tracking tenants.
          </p>
          <div className="mt-6">
            <PropertyForm />
          </div>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {properties.map((property) => {
            const propHouses = houses.filter(
              (h) => h.propertyId === property.id,
            );
            const totalUnits = propHouses.length;
            const occupiedCount = propHouses.filter(
              (h) => (h.status || "").toLowerCase() === "occupied",
            ).length;
            const vacantCount = totalUnits - occupiedCount;
            const occupancyRate =
              totalUnits > 0
                ? Math.round((occupiedCount / totalUnits) * 100)
                : 0;
            const monthlyRentRoll = propHouses.reduce(
              (sum, h) => sum + Number(h.monthlyRent || 0),
              0,
            );

            return (
              <Card
                key={property.id}
                className="border-border flex flex-col justify-between shadow-xs transition-shadow hover:shadow-sm"
              >
                <CardHeader className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="bg-primary/10 text-primary grid size-11 place-items-center rounded-xl font-bold">
                        <Building2 size={22} />
                      </div>
                      <div>
                        <CardTitle className="text-lg font-semibold tracking-tight">
                          {property.name}
                        </CardTitle>
                        <CardDescription className="mt-0.5 flex items-center gap-1 text-xs">
                          <MapPin
                            size={12}
                            className="text-muted-foreground shrink-0"
                          />
                          <span>
                            {property.city}, {property.state}
                          </span>
                        </CardDescription>
                      </div>
                    </div>
                    <Badge variant="outline" className="shrink-0 text-xs">
                      {property.propertyType || "Residential"}
                    </Badge>
                  </div>

                  <p className="text-muted-foreground text-xs">
                    {property.address}
                  </p>
                </CardHeader>

                <CardContent className="space-y-4 pt-0">
                  <div className="bg-muted/40 border-border/40 space-y-2 rounded-xl border p-3.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground flex items-center gap-1 font-medium">
                        <Percent size={12} /> Occupancy
                      </span>
                      <span className="text-foreground font-semibold">
                        {occupancyRate}% ({occupiedCount}/{totalUnits} units)
                      </span>
                    </div>
                    <div className="bg-muted h-2 w-full overflow-hidden rounded-full">
                      <div
                        className="bg-primary h-full rounded-full transition-all duration-500"
                        style={{ width: `${occupancyRate}%` }}
                      />
                    </div>
                    <div className="text-muted-foreground flex items-center justify-between pt-0.5 text-[11px]">
                      <span>{vacantCount} vacant</span>
                      <span>
                        Potential:{" "}
                        <strong>KSh {monthlyRentRoll.toLocaleString()}</strong>
                        /mo
                      </span>
                    </div>
                  </div>

                  <div className="border-border/50 flex items-center justify-between border-t pt-3">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="default"
                        size="sm"
                        render={
                          <Link
                            to="/admin/properties/$id"
                            params={{ id: property.id }}
                            className="text-xs"
                          >
                            Units ({totalUnits}){" "}
                            <ArrowRight className="ml-1 size-3.5" />
                          </Link>
                        }
                      />
                      <PropertyForm
                        property={{
                          id: property.id,
                          name: property.name,
                          address: property.address,
                          city: property.city,
                          state: property.state,
                        }}
                        triggerVariant="outline"
                        triggerSize="sm"
                      />
                    </div>

                    <DeleteDialog
                      title={`Delete "${property.name}"?`}
                      description={`Are you sure you want to delete this property? All associated apartment records for this property will also be affected.`}
                      onDelete={() =>
                        deleteProperty.mutateAsync({ id: property.id })
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
