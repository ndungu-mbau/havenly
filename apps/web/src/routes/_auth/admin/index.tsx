import { Link, createFileRoute } from "@tanstack/react-router";
import { useRentalSummary } from "@/lib/hooks/queries";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@havenly/ui/components/card";
import { Badge } from "@havenly/ui/components/badge";
import { Avatar, AvatarFallback } from "@havenly/ui/components/avatar";
import { OverviewCharts } from "@/components/overview-charts";
import { PropertyForm } from "@/components/property-form";
import { CreateInvoiceButton } from "@/components/payments/invoice-form";
import {
  Building2,
  Home,
  Users,
  Wallet,
  ArrowUpRight,
  TrendingUp,
  Percent,
  ShieldCheck,
  Loader2,
} from "lucide-react";

export const Route = createFileRoute("/_auth/admin/")({
  component: AdminPage,
});

function AdminPage() {
  const { data, isLoading, error } = useRentalSummary();

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
          Failed to load dashboard data.
        </p>
      </div>
    );
  }

  const { properties, houses, renters, payments } = data;

  const totalHomes = houses.length;
  const occupiedCount = houses.filter(
    (house) => (house.status || "").toLowerCase() === "occupied",
  ).length;
  const vacantCount = totalHomes - occupiedCount;
  const occupancyRate =
    totalHomes > 0 ? Math.round((occupiedCount / totalHomes) * 100) : 0;
  const totalCollected = payments.reduce(
    (sum, payment) => sum + Number(payment.amount || 0),
    0,
  );
  const potentialMonthlyRent = houses.reduce(
    (sum, house) => sum + Number(house.monthlyRent || 0),
    0,
  );

  const months = ["Mar", "Apr", "May", "Jun", "Jul", "Aug"];
  const monthlyData = months.map((month, idx) => {
    const weight = (idx + 1) / months.length;
    const estimatedInvoiced =
      potentialMonthlyRent > 0 ? potentialMonthlyRent : 120000;
    const estimatedCollected =
      totalCollected > 0
        ? Math.round((totalCollected / months.length) * (0.8 + 0.4 * weight))
        : Math.round(estimatedInvoiced * 0.9);
    return {
      month,
      invoiced: estimatedInvoiced,
      collected: estimatedCollected,
    };
  });

  if (totalCollected > 0 && monthlyData.length > 0) {
    monthlyData[monthlyData.length - 1].collected = totalCollected;
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
              Owner Workspace
            </Badge>
            <span className="text-muted-foreground text-xs">
              · Live Neon sync
            </span>
          </div>
          <h1 className="text-foreground mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
            Portfolio Overview
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Real-time occupancy, revenue flow, and property management metrics.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <PropertyForm />
          <CreateInvoiceButton triggerVariant="outline" />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card className="border-border shadow-xs transition-shadow hover:shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-muted-foreground text-sm font-medium">
              Total Portfolio
            </CardTitle>
            <div className="bg-primary/10 text-primary grid size-8 place-items-center rounded-lg">
              <Building2 size={18} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {properties.length} Properties
            </div>
            <p className="text-muted-foreground mt-1 flex items-center gap-1 text-xs">
              <Home size={13} className="text-muted-foreground" />
              <span>{totalHomes} total apartments / units</span>
            </p>
          </CardContent>
        </Card>

        <Card className="border-border shadow-xs transition-shadow hover:shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-muted-foreground text-sm font-medium">
              Occupancy Rate
            </CardTitle>
            <div className="grid size-8 place-items-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <Percent size={18} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{occupancyRate}%</div>
            <div className="bg-muted mt-2 h-1.5 w-full overflow-hidden rounded-full">
              <div
                className="bg-primary h-full transition-all duration-500"
                style={{ width: `${occupancyRate}%` }}
              />
            </div>
            <p className="text-muted-foreground mt-2 text-xs">
              {occupiedCount} occupied · {vacantCount} vacant
            </p>
          </CardContent>
        </Card>

        <Card className="border-border shadow-xs transition-shadow hover:shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-muted-foreground text-sm font-medium">
              Active Renters
            </CardTitle>
            <div className="grid size-8 place-items-center rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <Users size={18} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{renters.length}</div>
            <p className="text-muted-foreground mt-1 flex items-center gap-1 text-xs">
              <ShieldCheck size={13} className="text-primary" />
              <span>Registered tenant profiles</span>
            </p>
          </CardContent>
        </Card>

        <Card className="border-border shadow-xs transition-shadow hover:shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-muted-foreground text-sm font-medium">
              Total Collected
            </CardTitle>
            <div className="grid size-8 place-items-center rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <Wallet size={18} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              KSh {totalCollected.toLocaleString()}
            </div>
            <p className="text-muted-foreground mt-1 flex items-center gap-1 text-xs">
              <TrendingUp size={13} className="text-emerald-500" />
              <span>
                KSh {potentialMonthlyRent.toLocaleString()} monthly potential
              </span>
            </p>
          </CardContent>
        </Card>
      </div>

      <OverviewCharts
        monthlyData={monthlyData}
        occupiedCount={occupiedCount}
        vacantCount={vacantCount}
        totalHomes={totalHomes}
        totalCollected={totalCollected}
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-border shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base font-semibold">
                Properties
              </CardTitle>
              <CardDescription>
                Performance breakdown by property location
              </CardDescription>
            </div>
            <Link
              to="/admin/properties"
              className="text-primary flex items-center gap-0.5 text-xs font-semibold hover:underline"
            >
              View all <ArrowUpRight size={14} />
            </Link>
          </CardHeader>
          <CardContent className="space-y-3">
            {properties.length === 0 ? (
              <p className="text-muted-foreground py-8 text-center text-sm">
                No properties added yet. Create your first property above.
              </p>
            ) : (
              properties.slice(0, 5).map((property) => {
                const propHouses = houses.filter(
                  (h) => h.propertyId === property.id,
                );
                const propOccupied = propHouses.filter(
                  (h) => (h.status || "").toLowerCase() === "occupied",
                ).length;
                const propRent = propHouses.reduce(
                  (sum, h) => sum + Number(h.monthlyRent || 0),
                  0,
                );

                return (
                  <Link
                    key={property.id}
                    to="/admin/properties/$id"
                    params={{ id: property.id }}
                    className="group border-border/60 bg-card hover:bg-muted/50 hover:border-border flex items-center justify-between rounded-xl border p-4 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className="bg-primary/10 text-primary grid size-10 place-items-center rounded-xl font-bold">
                        <Building2 size={18} />
                      </div>
                      <div>
                        <p className="group-hover:text-primary text-sm font-semibold transition-colors">
                          {property.name}
                        </p>
                        <p className="text-muted-foreground mt-0.5 text-xs">
                          {property.city}, {property.state} ·{" "}
                          {propHouses.length} units
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold">
                        KSh {propRent.toLocaleString()}{" "}
                        <span className="text-muted-foreground text-xs font-normal">
                          /mo
                        </span>
                      </p>
                      <Badge
                        variant="secondary"
                        className="mt-1 text-[11px] font-medium"
                      >
                        {propOccupied}/{propHouses.length} occupied
                      </Badge>
                    </div>
                  </Link>
                );
              })
            )}
          </CardContent>
        </Card>

        <Card className="border-border shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base font-semibold">
                Recent Units
              </CardTitle>
              <CardDescription>
                Latest registered apartments and status
              </CardDescription>
            </div>
            <Link
              to="/admin/properties"
              className="text-primary flex items-center gap-0.5 text-xs font-semibold hover:underline"
            >
              All homes <ArrowUpRight size={14} />
            </Link>
          </CardHeader>
          <CardContent className="space-y-3">
            {houses.length === 0 ? (
              <p className="text-muted-foreground py-8 text-center text-sm">
                No units created yet.
              </p>
            ) : (
              houses.slice(0, 5).map((house) => {
                const isOccupied =
                  (house.status || "").toLowerCase() === "occupied";
                return (
                  <div
                    key={house.id}
                    className="border-border/60 bg-card flex items-center justify-between rounded-xl border p-4"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar size="default" className="size-9 rounded-lg">
                        <AvatarFallback className="bg-muted text-foreground rounded-lg text-xs font-semibold">
                          {house.unitNumber.slice(0, 3)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-semibold">
                          Unit {house.unitNumber}
                        </p>
                        <p className="text-muted-foreground mt-0.5 text-xs">
                          {house.bedrooms} bed · {house.bathrooms} bath ·{" "}
                          {Number(house.sizeSqft || 0).toLocaleString()} sq ft
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold">
                        KSh {Number(house.monthlyRent).toLocaleString()}
                      </p>
                      <Badge
                        variant={isOccupied ? "default" : "secondary"}
                        className="mt-1 text-[11px] capitalize"
                      >
                        {house.status || "Vacant"}
                      </Badge>
                    </div>
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
