import { createFileRoute } from "@tanstack/react-router";
import { useRentalSummary } from "@/lib/hooks/queries";
import { useDeleteRenter } from "@/lib/hooks/mutations";
import { RenterForm } from "@/components/renter-form";
import { CreateInvoiceButton } from "@/components/payments/invoice-form";
import { DeleteDialog } from "@/components/delete-dialog";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@havenly/ui/components/card";
import { Badge } from "@havenly/ui/components/badge";
import { Avatar, AvatarFallback } from "@havenly/ui/components/avatar";
import {
  Users,
  Mail,
  Phone,
  CheckCircle2,
  AlertCircle,
  Clock,
  ShieldCheck,
  Loader2,
} from "lucide-react";

export const Route = createFileRoute("/_auth/admin/renters")({
  component: RentersPage,
});

function RentersPage() {
  const { data, isLoading, error } = useRentalSummary();
  const deleteRenter = useDeleteRenter();

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
        <p className="text-muted-foreground text-sm">Failed to load renters.</p>
      </div>
    );
  }

  const { renters, houses, properties } = data;

  const houseMap = new Map(houses.map((h) => [h.id, h]));
  const propertyMap = new Map(properties.map((p) => [p.id, p]));

  const now = new Date();
  const thirtyDaysFromNow = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

  let activeCount = 0;
  let expiringSoonCount = 0;
  let expiredCount = 0;
  let syncedPaystackCount = 0;

  for (const r of renters) {
    if (r.paystackCustomerCode || r.paystackCustomerId) syncedPaystackCount++;
    if (r.leaseEnd) {
      const end = new Date(r.leaseEnd);
      if (end < now) {
        expiredCount++;
      } else if (end <= thirtyDaysFromNow) {
        expiringSoonCount++;
        activeCount++;
      } else {
        activeCount++;
      }
    } else {
      activeCount++;
    }
  }

  const getLeaseBadge = (
    _leaseStart?: string | null,
    leaseEnd?: string | null,
  ) => {
    if (!leaseEnd) {
      return (
        <Badge variant="secondary" className="text-[11px] font-medium">
          Open Lease
        </Badge>
      );
    }
    const end = new Date(leaseEnd);
    if (end < now) {
      return (
        <Badge variant="destructive" className="text-[11px] font-semibold">
          Expired ({leaseEnd})
        </Badge>
      );
    }
    if (end <= thirtyDaysFromNow) {
      return (
        <Badge className="border-amber-500/20 bg-amber-500/10 text-[11px] font-semibold text-amber-600 dark:text-amber-400">
          Expiring Soon ({leaseEnd})
        </Badge>
      );
    }
    return (
      <Badge className="border-emerald-500/20 bg-emerald-500/10 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
        Active (until {leaseEnd})
      </Badge>
    );
  };

  const getInitials = (name: string) => {
    if (!name) return "TN";
    const p = name.trim().split(/\s+/);
    if (p.length === 1) return p[0].slice(0, 2).toUpperCase();
    return (p[0][0] + p[p.length - 1][0]).toUpperCase();
  };

  return (
    <main className="mx-auto max-w-[1500px] space-y-8 px-4 py-8 sm:px-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className="text-primary border-primary/20 bg-primary/5 text-xs font-semibold"
            >
              Tenants & Leases
            </Badge>
            <span className="text-muted-foreground text-xs">
              · {renters.length} registered profiles
            </span>
          </div>
          <h1 className="text-foreground mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
            Renters
          </h1>
          <p className="text-muted-foreground mt-1 max-w-xl text-sm leading-relaxed">
            Manage tenant contact information, active lease terms, and Paystack
            customer billing connections.
          </p>
        </div>

        <RenterForm
          houses={houses.map((h) => ({
            id: h.id,
            unitNumber: h.unitNumber,
            monthlyRent: h.monthlyRent,
          }))}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card className="border-border shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-muted-foreground text-xs font-medium">
              Total Tenants
            </CardTitle>
            <div className="bg-primary/10 text-primary grid size-8 place-items-center rounded-lg">
              <Users size={16} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{renters.length}</div>
            <p className="text-muted-foreground mt-1 text-xs">
              {activeCount} with active leases
            </p>
          </CardContent>
        </Card>

        <Card className="border-border shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-muted-foreground text-xs font-medium">
              Expiring in 30 Days
            </CardTitle>
            <div className="grid size-8 place-items-center rounded-lg bg-amber-500/10 text-amber-600">
              <Clock size={16} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{expiringSoonCount}</div>
            <p className="text-muted-foreground mt-1 text-xs">
              Requiring renewal follow-up
            </p>
          </CardContent>
        </Card>

        <Card className="border-border shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-muted-foreground text-xs font-medium">
              Paystack Connected
            </CardTitle>
            <div className="grid size-8 place-items-center rounded-lg bg-emerald-500/10 text-emerald-600">
              <ShieldCheck size={16} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{syncedPaystackCount}</div>
            <p className="text-muted-foreground mt-1 text-xs">
              Ready for automated charge
            </p>
          </CardContent>
        </Card>

        <Card className="border-border shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-muted-foreground text-xs font-medium">
              Expired Leases
            </CardTitle>
            <div className="bg-destructive/10 text-destructive grid size-8 place-items-center rounded-lg">
              <AlertCircle size={16} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{expiredCount}</div>
            <p className="text-muted-foreground mt-1 text-xs">
              Pending lease extension
            </p>
          </CardContent>
        </Card>
      </div>

      {renters.length === 0 ? (
        <Card className="border-border/80 border-dashed p-12 text-center">
          <div className="bg-primary/10 text-primary mx-auto grid size-12 place-items-center rounded-xl">
            <Users className="size-6" />
          </div>
          <h3 className="mt-4 text-lg font-semibold">
            No renters registered yet
          </h3>
          <p className="text-muted-foreground mx-auto mt-1 max-w-sm text-sm">
            Assign your first tenant to an apartment unit to track leases and
            automate invoicing.
          </p>
          <div className="mt-6">
            <RenterForm
              houses={houses.map((h) => ({
                id: h.id,
                unitNumber: h.unitNumber,
                monthlyRent: h.monthlyRent,
              }))}
            />
          </div>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {renters.map((renter) => {
            const house = houseMap.get(renter.houseId);
            const property = house ? propertyMap.get(house.propertyId) : null;

            return (
              <Card
                key={renter.id}
                className="border-border flex flex-col justify-between shadow-xs transition-shadow hover:shadow-sm"
              >
                <CardHeader className="space-y-3 pb-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <Avatar size="default" className="size-10">
                        <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                          {getInitials(renter.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-base font-semibold">
                          {renter.name}
                        </CardTitle>
                        <p className="text-muted-foreground mt-0.5 text-xs">
                          {property?.name ? `${property.name} · ` : ""}Unit{" "}
                          {house?.unitNumber ?? `Unit #${renter.houseId}`}
                        </p>
                      </div>
                    </div>

                    {getLeaseBadge(
                      new Date(renter.leaseStart!).toISOString(),
                      new Date(renter.leaseEnd!).toISOString(),
                    )}
                  </div>
                </CardHeader>

                <CardContent className="space-y-4 pt-0">
                  <div className="bg-muted/40 border-border/40 space-y-1.5 rounded-lg border p-3 text-xs">
                    {renter.email ? (
                      <a
                        href={`mailto:${renter.email}`}
                        className="text-muted-foreground hover:text-foreground flex items-center gap-2 truncate transition-colors"
                      >
                        <Mail size={13} className="text-primary shrink-0" />
                        <span className="truncate">{renter.email}</span>
                      </a>
                    ) : (
                      <span className="text-muted-foreground/60 flex items-center gap-2 italic">
                        <Mail size={13} className="shrink-0" /> No email address
                      </span>
                    )}

                    {renter.phone ? (
                      <a
                        href={`tel:${renter.phone}`}
                        className="text-muted-foreground hover:text-foreground flex items-center gap-2 truncate transition-colors"
                      >
                        <Phone
                          size={13}
                          className="shrink-0 text-emerald-500"
                        />
                        <span>{renter.phone}</span>
                      </a>
                    ) : (
                      <span className="text-muted-foreground/60 flex items-center gap-2 italic">
                        <Phone size={13} className="shrink-0" /> No phone number
                      </span>
                    )}
                  </div>

                  <div className="border-border/40 flex items-center justify-between border-t pt-2.5 text-xs">
                    <div>
                      <span className="text-muted-foreground text-[11px]">
                        Monthly Rent:{" "}
                      </span>
                      <strong className="text-foreground">
                        KSh {Number(house?.monthlyRent ?? 0).toLocaleString()}
                      </strong>
                    </div>

                    {renter.paystackCustomerCode ||
                    renter.paystackCustomerId ? (
                      <Badge
                        variant="outline"
                        className="border-emerald-500/30 text-[10px] text-emerald-600 dark:text-emerald-400"
                      >
                        <CheckCircle2 className="mr-1 size-2.5" /> Paystack
                        Synced
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="text-[10px]">
                        Not Synced
                      </Badge>
                    )}
                  </div>

                  <div className="border-border/50 flex items-center justify-between gap-2 border-t pt-3">
                    <div className="flex items-center gap-1.5">
                      <CreateInvoiceButton
                        preselectedHouseId={renter.houseId}
                        preselectedRenterId={renter.id}
                        triggerText="Invoice"
                        triggerVariant="outline"
                        triggerSize="sm"
                      />

                      <RenterForm
                        houses={houses.map((h) => ({
                          id: h.id,
                          unitNumber: h.unitNumber,
                          monthlyRent: h.monthlyRent,
                        }))}
                        renter={{
                          id: renter.id,
                          houseId: renter.houseId,
                          name: renter.name,
                          email: renter.email,
                          phone: renter.phone,
                          leaseStart: renter.leaseStart
                            ? String(renter.leaseStart).slice(0, 10)
                            : null,
                          leaseEnd: renter.leaseEnd
                            ? String(renter.leaseEnd).slice(0, 10)
                            : null,
                        }}
                      />
                    </div>

                    <DeleteDialog
                      title={`Remove ${renter.name}?`}
                      description={`Are you sure you want to remove ${renter.name} from Unit ${house?.unitNumber ?? ""}? Historical payment records will be preserved.`}
                      onDelete={() =>
                        deleteRenter.mutateAsync({ id: renter.id })
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
