import { createFileRoute } from "@tanstack/react-router";
import { useCaretakerDashboardData } from "@/lib/hooks/queries";
import { UtilityEntryForm } from "@/components/utility-entry-form";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@havenly/ui/components/card";
import { Building2, Home, Loader2 } from "lucide-react";
import UserMenu from "@/components/user-menu";
import { ThemeToggle } from "@/components/theme-toggle";

export const Route = createFileRoute("/_auth/caretaker")({
  component: CaretakerPage,
});

function CaretakerPage() {
  const { session } = Route.useRouteContext();
  const { data, isLoading, error } = useCaretakerDashboardData();

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
          {error?.message || "Failed to load caretaker workspace."}
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-border border-b bg-card/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-8">
          <div className="flex items-center gap-3 font-semibold text-lg">
            <span className="bg-primary text-primary-foreground grid size-8 place-items-center rounded-lg">
              <Building2 size={16} />
            </span>
            Havenly Caretaker
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            {session?.user && <UserMenu user={session.user} />}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-10 lg:px-8">
        <div className="mb-10">
          <h1 className="text-3xl font-semibold tracking-tight">
            Caretaker Workspace
          </h1>
          <p className="text-muted-foreground mt-2">
            Manage utility costs for your assigned properties.
          </p>
        </div>

        {data.properties.length === 0 ? (
          <div className="flex h-[50vh] flex-col items-center justify-center px-6 text-center">
            <div className="rounded-full bg-muted p-4 mb-4">
              <Building2 className="h-8 w-8 text-muted-foreground" />
            </div>
            <h2 className="text-2xl font-semibold">No properties assigned</h2>
            <p className="text-muted-foreground mt-2 max-w-xs">
              You haven't been assigned as a caretaker for any properties yet.
              Please contact your administrator.
            </p>
          </div>
        ) : (
          <div className="grid gap-8">
            {data.properties.map((property) => (
              <div key={property.id} className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="bg-primary text-primary-foreground grid size-8 place-items-center rounded-lg">
                    <Building2 size={16} />
                  </div>
                  <h2 className="text-xl font-semibold">{property.name}</h2>
                </div>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {data.houses
                    .filter((h) => h.propertyId === property.id)
                    .map((house) => (
                      <Card key={house.id} className="overflow-hidden">
                        <CardHeader className="bg-muted/30 py-4">
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-lg flex items-center gap-2">
                              <Home
                                size={16}
                                className="text-muted-foreground"
                              />
                              Unit {house.unitNumber}
                            </CardTitle>
                          </div>
                        </CardHeader>
                        <CardContent className="p-6">
                          <UtilityEntryForm house={house} />
                        </CardContent>
                      </Card>
                    ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
