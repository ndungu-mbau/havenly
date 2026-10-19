import { createFileRoute } from "@tanstack/react-router";
import { usePaymentsView } from "@/lib/hooks/queries";
import { AddDestinationButton } from "@/components/payments/destination-form";
import {
  PayoutButton,
  DeleteDestinationButton,
} from "@/components/payments/payout-form";
import { VerifyButton } from "@/components/payments/charge-modal";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@havenly/ui/components/card";
import { Badge } from "@havenly/ui/components/badge";
import {
  Smartphone,
  Landmark,
  CheckCircle2,
  Clock,
  AlertCircle,
  Loader2,
} from "lucide-react";

import type { Destination } from "@/components/payments/payout-form";

export const Route = createFileRoute("/_auth/admin/payouts")({
  component: PayoutsPage,
});

const STATUS_CONFIG: Record<
  string,
  {
    label: string;
    className: string;
    icon: React.ComponentType<{ className?: string }>;
  }
> = {
  pending: {
    label: "Pending",
    className:
      "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
    icon: Clock,
  },
  successful: {
    label: "Successful",
    className:
      "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
    icon: CheckCircle2,
  },
  failed: {
    label: "Failed",
    className: "bg-destructive/10 text-destructive border-destructive/20",
    icon: AlertCircle,
  },
};

function destLabel(d: {
  type: string;
  phone?: string | null;
  bankName?: string | null;
  bankCode?: string | null;
  accountNumber?: string | null;
  accountName?: string | null;
}) {
  if (d.type === "mpesa") return `M-Pesa · ${d.phone ?? "?"}`;
  return `${d.bankName ?? d.bankCode ?? "Bank"} · ${d.accountNumber ?? "?"} (${d.accountName ?? "?"})`;
}

function PayoutsPage() {
  const { data, isLoading, error } = usePaymentsView();

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
          Failed to load payouts data.
        </p>
      </div>
    );
  }

  const { destinations, payouts } = data;

  const totalPaidOut = payouts
    .filter((p) => p.status === "successful")
    .reduce((s, p) => s + Number(p.amount || 0), 0);
  const pending = payouts
    .filter((p) => p.status === "pending")
    .reduce((s, p) => s + Number(p.amount || 0), 0);

  return (
    <main className="mx-auto max-w-[1500px] space-y-8 px-4 py-8 sm:px-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className="text-primary border-primary/20 bg-primary/5 text-xs font-semibold"
            >
              Owner Disbursements
            </Badge>
            <span className="text-muted-foreground text-xs">
              · Paystack Transfers
            </span>
          </div>
          <h1 className="text-foreground mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
            Disbursements & Payouts
          </h1>
          <p className="text-muted-foreground mt-1 max-w-xl text-sm leading-relaxed">
            Manage M-Pesa phone numbers and bank accounts for owner profit
            settlements via Paystack.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <AddDestinationButton />
          <PayoutButton destinations={destinations as any as Destination[]} />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="border-border shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-muted-foreground text-xs font-medium">
              Saved Destinations
            </CardTitle>
            <div className="bg-primary/10 text-primary grid size-8 place-items-center rounded-lg">
              <Landmark size={16} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{destinations.length}</div>
            <p className="text-muted-foreground mt-1 text-xs">
              M-Pesa and bank accounts
            </p>
          </CardContent>
        </Card>

        <Card className="border-border shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-muted-foreground text-xs font-medium">
              Total Disbursed (KES)
            </CardTitle>
            <div className="grid size-8 place-items-center rounded-lg bg-emerald-500/10 text-emerald-600">
              <CheckCircle2 size={16} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              KSh {totalPaidOut.toLocaleString()}
            </div>
            <p className="text-muted-foreground mt-1 text-xs">
              Settled payouts
            </p>
          </CardContent>
        </Card>

        <Card className="border-border shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-muted-foreground text-xs font-medium">
              Pending Transfers (KES)
            </CardTitle>
            <div className="grid size-8 place-items-center rounded-lg bg-amber-500/10 text-amber-600">
              <Clock size={16} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              KSh {pending.toLocaleString()}
            </div>
            <p className="text-muted-foreground mt-1 text-xs">
              Processing via network
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border overflow-hidden shadow-xs">
        <CardHeader className="border-border/50 bg-muted/20 flex flex-col border-b pb-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="text-base font-semibold">
              Saved Payout Destinations
            </CardTitle>
            <CardDescription className="text-xs">
              M-Pesa phone numbers and bank accounts you can disburse funds to
            </CardDescription>
          </div>
          <AddDestinationButton />
        </CardHeader>

        {destinations.length === 0 ? (
          <div className="text-muted-foreground py-12 text-center text-sm">
            No payout destinations added. Click &quot;Add Destination&quot; to
            register your M-Pesa or bank details.
          </div>
        ) : (
          <div className="grid gap-4 p-5 sm:grid-cols-2 lg:grid-cols-3">
            {destinations.map((d) => (
              <div
                key={d.id}
                className="border-border/60 bg-card hover:bg-muted/30 flex items-center justify-between rounded-xl border p-4 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="bg-primary/10 text-primary grid size-10 place-items-center rounded-xl">
                    {d.type === "mpesa" ? (
                      <Smartphone size={18} />
                    ) : (
                      <Landmark size={18} />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-semibold">
                      {destLabel(d as any as Destination)}
                    </p>
                    <div className="mt-0.5 flex items-center gap-1.5">
                      {d.isDefault ? (
                        <Badge className="bg-primary/10 text-primary py-0 text-[10px]">
                          Default
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground text-xs">
                          Saved destination
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <DeleteDestinationButton id={d.id} />
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card className="border-border overflow-hidden shadow-xs">
        <CardHeader className="border-border/50 bg-muted/20 flex flex-col border-b pb-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="text-base font-semibold">
              Disbursement History
            </CardTitle>
            <CardDescription className="text-xs">
              Transfers sent to destinations, automatically updated via Paystack
              webhooks
            </CardDescription>
          </div>
          <PayoutButton destinations={destinations as any as Destination[]} />
        </CardHeader>

        {payouts.length === 0 ? (
          <div className="text-muted-foreground py-12 text-center text-sm">
            No payouts recorded yet.
          </div>
        ) : (
          <div className="divide-border/60 divide-y">
            {payouts.map((p) => {
              const dest = destinations.find((d) => d.id === p.destinationId);
              const statusCfg =
                STATUS_CONFIG[p.status] ?? STATUS_CONFIG.pending;
              const StatusIcon = statusCfg.icon;

              return (
                <div
                  key={p.id}
                  className="hover:bg-muted/30 flex flex-col gap-3 p-5 transition-colors sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="space-y-0.5">
                    <p className="text-foreground text-sm font-semibold">
                      {dest
                        ? destLabel(dest as any as Destination)
                        : `Destination #${p.destinationId}`}
                    </p>
                    <p className="text-muted-foreground font-mono text-xs">
                      {p.narration ?? "Disbursement"} · ref {p.reference}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <Badge
                      variant="outline"
                      className={`text-xs ${statusCfg.className}`}
                    >
                      <StatusIcon className="mr-1 size-3" /> {statusCfg.label}
                    </Badge>

                    <span className="text-foreground text-base font-bold">
                      {p.currency} {Number(p.amount).toLocaleString()}
                    </span>

                    {(p.status === "pending" || p.status === "failed") && (
                      <VerifyButton reference={p.reference} kind="payout" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </main>
  );
}
