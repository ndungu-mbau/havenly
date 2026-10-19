import { Link, createFileRoute } from "@tanstack/react-router";
import { usePropertyDetails, useRentalSummary } from "@/lib/hooks/queries";
import { useDeleteHouse } from "@/lib/hooks/mutations";
import { HouseForm } from "@/components/house-form";
import { DeleteDialog } from "@/components/delete-dialog";
import UtilitiesManager from "@/components/admin/utilities-manager";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@havenly/ui/components/card";
import { Badge } from "@havenly/ui/components/badge";
import {
  Home,
  MapPin,
  Bed,
  Bath,
  Maximize2,
  Sparkles,
  Code2,
  ArrowLeft,
  CheckCircle2,
  Clock,
  Wrench,
  Loader2,
} from "lucide-react";

export const Route = createFileRoute("/_auth/admin/properties/$id")({
  component: PropertyDetailPage,
});

function PropertyDetailPage() {
  const { id: propertyId } = Route.useParams();
  const { data: result, isLoading, error } = usePropertyDetails(propertyId);
  const { data: summary } = useRentalSummary();
  const deleteHouse = useDeleteHouse();

  const categories = summary?.categories ?? [];

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="text-primary size-6 animate-spin" />
      </div>
    );
  }

  if (error || !result) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-muted-foreground text-sm">Property not found.</p>
      </div>
    );
  }

  const { property, houses } = result;
  const categoryMap = new Map(categories.map((c) => [c.id, c]));

  const totalUnits = houses.length;
  const occupiedCount = houses.filter(
    (h) => (h.status || "").toLowerCase() === "occupied",
  ).length;
  const vacantCount = houses.filter(
    (h) => (h.status || "").toLowerCase() === "vacant",
  ).length;
  const maintenanceCount = totalUnits - occupiedCount - vacantCount;
  const occupancyRate =
    totalUnits > 0 ? Math.round((occupiedCount / totalUnits) * 100) : 0;
  const monthlyRentRoll = houses.reduce(
    (sum, h) => sum + Number(h.monthlyRent || 0),
    0,
  );

  const getStatusBadge = (status: string) => {
    const s = (status || "").toLowerCase();
    if (s === "occupied") {
      return (
        <Badge className="border-emerald-500/20 bg-emerald-500/10 text-xs font-semibold text-emerald-600 capitalize dark:text-emerald-400">
          <CheckCircle2 className="mr-1 size-3" /> Occupied
        </Badge>
      );
    }
    if (s === "maintenance") {
      return (
        <Badge
          variant="outline"
          className="border-amber-500/20 bg-amber-500/10 text-xs font-semibold text-amber-600 capitalize dark:text-amber-400"
        >
          <Wrench className="mr-1 size-3" /> Maintenance
        </Badge>
      );
    }
    return (
      <Badge variant="secondary" className="text-xs font-semibold capitalize">
        <Clock className="text-muted-foreground mr-1 size-3" /> Vacant
      </Badge>
    );
  };

  return (
    <main className="mx-auto max-w-[1500px] space-y-8 px-4 py-8 sm:px-8">
      <div>
        <Link
          to="/admin/properties"
          className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 text-xs font-medium transition-colors"
        >
          <ArrowLeft size={14} /> Back to all properties
        </Link>
      </div>

      <Card className="border-border overflow-hidden shadow-xs">
        <CardHeader className="flex flex-col gap-4 pb-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Badge
                variant="outline"
                className="text-primary border-primary/20 bg-primary/5 text-xs font-semibold"
              >
                {property.propertyType || "Residential Property"}
              </Badge>
              <span className="text-muted-foreground text-xs">
                ID #{property.id}
              </span>
            </div>
            <CardTitle className="text-2xl font-bold tracking-tight sm:text-3xl">
              {property.name}
            </CardTitle>
            <CardDescription className="flex items-center gap-1 text-sm">
              <MapPin size={14} className="text-muted-foreground shrink-0" />
              <span>
                {property.address}, {property.city}, {property.state}
              </span>
            </CardDescription>
          </div>

          <div className="flex items-center gap-2">
            <HouseForm
              propertyId={property.id}
              categories={categories.map((c) => ({ id: c.id, title: c.title }))}
            />
          </div>
        </CardHeader>

        <CardContent className="border-border/50 bg-muted/20 border-t pt-4">
          <div className="grid grid-cols-2 gap-4 text-center sm:grid-cols-4">
            <div className="bg-background border-border/40 rounded-lg border p-3">
              <p className="text-muted-foreground text-xs">Total Units</p>
              <p className="text-foreground mt-0.5 text-xl font-bold">
                {totalUnits}
              </p>
            </div>
            <div className="bg-background border-border/40 rounded-lg border p-3">
              <p className="text-muted-foreground text-xs">Occupancy Rate</p>
              <p className="text-foreground mt-0.5 text-xl font-bold">
                {occupancyRate}%
              </p>
              <p className="text-muted-foreground text-[11px]">
                {occupiedCount} occupied
              </p>
            </div>
            <div className="bg-background border-border/40 rounded-lg border p-3">
              <p className="text-muted-foreground text-xs">Vacant Units</p>
              <p className="text-foreground mt-0.5 text-xl font-bold">
                {vacantCount}
              </p>
              <p className="text-muted-foreground text-[11px]">
                {maintenanceCount} maintenance
              </p>
            </div>
            <div className="bg-background border-border/40 rounded-lg border p-3">
              <p className="text-muted-foreground text-xs">Monthly Rent Roll</p>
              <p className="text-foreground mt-0.5 text-xl font-bold">
                KSh {monthlyRentRoll.toLocaleString()}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold tracking-tight">
              Apartments & Units
            </h2>
            <p className="text-muted-foreground text-xs">
              {totalUnits} registered units in {property.name}
            </p>
          </div>
          <HouseForm
            propertyId={property.id}
            categories={categories.map((c) => ({ id: c.id, title: c.title }))}
          />
        </div>

        <UtilitiesManager propertyId={property.id} propertyName={property.name} />

        {houses.length === 0 ? (
          <Card className="border-border/80 border-dashed p-12 text-center">
            <div className="bg-primary/10 text-primary mx-auto grid size-12 place-items-center rounded-xl">
              <Home className="size-6" />
            </div>
            <h3 className="mt-4 text-lg font-semibold">
              No apartments added yet
            </h3>
            <p className="text-muted-foreground mx-auto mt-1 max-w-sm text-sm">
              Add your first apartment unit to start tracking leases, rents, and
              custom specifications.
            </p>
            <div className="mt-6">
              <HouseForm
                propertyId={property.id}
                categories={categories.map((c) => ({
                  id: c.id,
                  title: c.title,
                }))}
              />
            </div>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {houses.map((house) => {
              const linkedCategory = house.categoryId
                ? categoryMap.get(house.categoryId)
                : null;
              const featuresList = (house.overrideFeatures ??
                linkedCategory?.features ??
                []) as string[];
              const otherFeaturesObj = (house.overrideOtherFeatures ??
                linkedCategory?.otherFeatures ??
                {}) as Record<string, unknown>;
              const otherEntries = Object.entries(otherFeaturesObj);

              return (
                <Card
                  key={house.id}
                  className="border-border flex flex-col justify-between shadow-xs transition-shadow hover:shadow-sm"
                >
                  <CardHeader className="space-y-2.5 pb-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <CardTitle className="text-lg font-bold">
                            Unit {house.unitNumber}
                          </CardTitle>
                          {linkedCategory && (
                            <Badge
                              variant="outline"
                              className="py-0 text-[10px]"
                            >
                              {linkedCategory.title}
                            </Badge>
                          )}
                        </div>
                        {house.overrideTitle && (
                          <p className="text-primary mt-0.5 text-xs font-medium">
                            {house.overrideTitle}
                          </p>
                        )}
                      </div>
                      {getStatusBadge(house.status)}
                    </div>

                    <div className="text-muted-foreground border-border/40 flex flex-wrap items-center gap-3 border-t pt-1 text-xs">
                      <span className="flex items-center gap-1">
                        <Bed size={13} className="text-foreground" />{" "}
                        {house.bedrooms} Bed
                      </span>
                      <span>·</span>
                      <span className="flex items-center gap-1">
                        <Bath size={13} className="text-foreground" />{" "}
                        {house.bathrooms} Bath
                      </span>
                      <span>·</span>
                      <span className="flex items-center gap-1">
                        <Maximize2 size={13} className="text-foreground" />{" "}
                        {Number(house.sizeSqft || 0).toLocaleString()} sq ft
                      </span>
                    </div>

                    {house.overrideDescription && (
                      <p className="text-muted-foreground pt-1 text-xs leading-relaxed">
                        {house.overrideDescription}
                      </p>
                    )}
                  </CardHeader>

                  <CardContent className="space-y-3 pt-0">
                    <div className="bg-muted/40 border-border/40 flex items-center justify-between rounded-lg border p-2.5">
                      <span className="text-muted-foreground text-xs font-medium">
                        Monthly Rent
                      </span>
                      <span className="text-foreground text-sm font-bold">
                        KSh {Number(house.monthlyRent).toLocaleString()}
                      </span>
                    </div>

                    {featuresList.length > 0 && (
                      <div>
                        <p className="text-muted-foreground mb-1.5 flex items-center gap-1 text-[10px] font-medium tracking-wider uppercase">
                          <Sparkles className="text-primary size-2.5" />{" "}
                          Amenities
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {featuresList.slice(0, 4).map((f) => (
                            <Badge
                              key={f}
                              variant="secondary"
                              className="px-2 py-0 text-[10px] font-normal"
                            >
                              {f}
                            </Badge>
                          ))}
                          {featuresList.length > 4 && (
                            <Badge
                              variant="outline"
                              className="px-1.5 py-0 text-[10px]"
                            >
                              +{featuresList.length - 4} more
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}

                    {otherEntries.length > 0 && (
                      <div className="border-border/40 border-t pt-2">
                        <p className="text-muted-foreground mb-1.5 flex items-center gap-1 text-[10px] font-medium tracking-wider uppercase">
                          <Code2 className="text-primary size-2.5" /> Custom
                          Specs (JSON)
                        </p>
                        <div className="grid grid-cols-2 gap-1 text-[11px]">
                          {otherEntries.slice(0, 4).map(([k, v]) => (
                            <div
                              key={k}
                              className="bg-muted/50 truncate rounded px-1.5 py-1 font-mono"
                            >
                              <span className="text-muted-foreground">
                                {k}:{" "}
                              </span>
                              <span className="text-foreground font-semibold">
                                {String(v)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="border-border/50 flex items-center justify-between border-t pt-3">
                      <HouseForm
                        propertyId={property.id}
                        categories={categories.map((c) => ({
                          id: c.id,
                          title: c.title,
                        }))}
                        house={{
                          id: house.id,
                          unitNumber: house.unitNumber,
                          categoryId: house.categoryId,
                          monthlyRent: house.monthlyRent,
                          bedrooms: house.bedrooms,
                          bathrooms: house.bathrooms,
                          sizeSqft: house.sizeSqft,
                          status: house.status,
                          overrideTitle: house.overrideTitle,
                          overrideFeatures: house.overrideFeatures as
                            | string[]
                            | null,
                          overrideDescription: house.overrideDescription,
                          overrideOtherFeatures:
                            house.overrideOtherFeatures as Record<
                              string,
                              unknown
                            > | null,
                        }}
                      />

                      <DeleteDialog
                        title={`Delete Unit ${house.unitNumber}?`}
                        description={`Are you sure you want to delete Unit ${house.unitNumber} from ${property.name}? This action cannot be undone.`}
                        onDelete={() =>
                          deleteHouse.mutateAsync({ id: house.id })
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
      </div>
    </main>
  );
}
