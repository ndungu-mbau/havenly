import { createFileRoute } from "@tanstack/react-router";
import { usePaymentsView } from "@/lib/hooks/queries";
import { CreateInvoiceButton } from "@/components/payments/invoice-form";
import { ChargeButton, VerifyButton } from "@/components/payments/charge-modal";
import { DeleteInvoiceButton } from "@/components/payments/delete-invoice-button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@havenly/ui/components/card";
import { Badge } from "@havenly/ui/components/badge";
import {
  Wallet,
  Receipt,
  CheckCircle2,
  Clock,
  AlertCircle,
  Percent,
  CreditCard,
  Loader2,
} from "lucide-react";

export const Route = createFileRoute("/_auth/admin/payments")({
  component: PaymentsPage,
});

const APP_URL =
  typeof window !== "undefined"
    ? window.location.origin
    : "http://localhost:3001";

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
  paid: {
    label: "Paid",
    className:
      "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
    icon: CheckCircle2,
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
  cancelled: {
    label: "Cancelled",
    className: "bg-muted text-muted-foreground border-border",
    icon: AlertCircle,
  },
};

function fmtMoney(amount: number, currency = "KES") {
  return `${currency} ${Number(amount || 0).toLocaleString()}`;
}

function fmtPeriod(period: string) {
  if (!period) return "Current Month";
  const [y, m] = period.split("-");
  const date = new Date(Number(y), Number(m) - 1, 1);
  if (Number.isNaN(date.getTime())) return period;
  return date.toLocaleDateString("en-GB", { month: "long", year: "numeric" });
}

function PaymentsPage() {
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
          Failed to load payments data.
        </p>
      </div>
    );
  }

  const { houses, renters, invoices, charges } = data;

  const houseById = new Map(houses.map((h) => [h.id, h]));
  const renterByInvoice = new Map<string, (typeof renters)[number]>();
  for (const r of renters) {
    if (!renterByInvoice.has(r.houseId)) renterByInvoice.set(r.houseId, r);
  }

  const chargesByInvoice = new Map<string, typeof charges>();
  for (const c of charges) {
    const list = chargesByInvoice.get(c.invoiceId) ?? [];
    list.push(c);
    chargesByInvoice.set(c.invoiceId, list);
  }

  const totalInvoiced = invoices.reduce((s, i) => s + Number(i.amount || 0), 0);
  const totalCollected = invoices
    .filter((i) => i.status === "paid")
    .reduce((s, i) => s + Number(i.amount || 0), 0);
  const outstanding = totalInvoiced - totalCollected;
  const collectionRate =
    totalInvoiced > 0 ? Math.round((totalCollected / totalInvoiced) * 100) : 0;
  const pendingInvoicesCount = invoices.filter(
    (i) => i.status === "pending",
  ).length;

  return (
    <main className="mx-auto max-w-[1500px] space-y-8 px-4 py-8 sm:px-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className="text-primary border-primary/20 bg-primary/5 text-xs font-semibold"
            >
              Billing & Collections
            </Badge>
            <span className="text-muted-foreground text-xs">
              · Paystack reconciliation
            </span>
          </div>
          <h1 className="text-foreground mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
            Invoices & Payments
          </h1>
          <p className="text-muted-foreground mt-1 max-w-xl text-sm leading-relaxed">
            Generate monthly rent invoices and collect instantly via M-Pesa STK
            push or debit/credit card.
          </p>
        </div>

        <CreateInvoiceButton />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card className="border-border shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-muted-foreground text-xs font-medium">
              Total Invoiced
            </CardTitle>
            <div className="bg-primary/10 text-primary grid size-8 place-items-center rounded-lg">
              <Receipt size={16} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{fmtMoney(totalInvoiced)}</div>
            <p className="text-muted-foreground mt-1 text-xs">
              {invoices.length} invoices generated
            </p>
          </CardContent>
        </Card>

        <Card className="border-border shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-muted-foreground text-xs font-medium">
              Total Collected
            </CardTitle>
            <div className="grid size-8 place-items-center rounded-lg bg-emerald-500/10 text-emerald-600">
              <Wallet size={16} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{fmtMoney(totalCollected)}</div>
            <p className="text-muted-foreground mt-1 text-xs">
              Settled payments
            </p>
          </CardContent>
        </Card>

        <Card className="border-border shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-muted-foreground text-xs font-medium">
              Outstanding Balance
            </CardTitle>
            <div className="grid size-8 place-items-center rounded-lg bg-amber-500/10 text-amber-600">
              <Clock size={16} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{fmtMoney(outstanding)}</div>
            <p className="text-muted-foreground mt-1 text-xs">
              {pendingInvoicesCount} unpaid invoices
            </p>
          </CardContent>
        </Card>

        <Card className="border-border shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-muted-foreground text-xs font-medium">
              Collection Rate
            </CardTitle>
            <div className="grid size-8 place-items-center rounded-lg bg-blue-500/10 text-blue-600">
              <Percent size={16} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{collectionRate}%</div>
            <div className="bg-muted mt-2 h-1.5 w-full overflow-hidden rounded-full">
              <div
                className="bg-primary h-full transition-all duration-500"
                style={{ width: `${collectionRate}%` }}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border overflow-hidden shadow-xs">
        <CardHeader className="border-border/50 bg-muted/20 flex flex-col border-b pb-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="text-base font-semibold">Invoices</CardTitle>
            <CardDescription className="text-xs">
              Chronological invoices and Paystack payment records
            </CardDescription>
          </div>
          <CreateInvoiceButton triggerVariant="outline" triggerSize="sm" />
        </CardHeader>

        {invoices.length === 0 ? (
          <div className="py-16 text-center">
            <div className="bg-primary/10 text-primary mx-auto grid size-12 place-items-center rounded-xl">
              <Receipt className="size-6" />
            </div>
            <h3 className="mt-4 text-lg font-semibold">
              No invoices issued yet
            </h3>
            <p className="text-muted-foreground mx-auto mt-1 max-w-sm text-sm">
              Create your first monthly invoice to begin collecting rent via
              M-Pesa and Card.
            </p>
            <div className="mt-6">
              <CreateInvoiceButton />
            </div>
          </div>
        ) : (
          <div className="divide-border/60 divide-y">
            {invoices.map((inv) => {
              const house = houseById.get(inv.houseId);
              const renter = inv.renterId
                ? (renters.find((r) => r.id === inv.renterId) ?? null)
                : (renterByInvoice.get(inv.houseId) ?? null);
              const invCharges = chargesByInvoice.get(inv.id) ?? [];
              const lastCharge = invCharges[0];
              const statusCfg =
                STATUS_CONFIG[inv.status] ?? STATUS_CONFIG.pending;
              const StatusIcon = statusCfg.icon;

              return (
                <div
                  key={inv.id}
                  className="hover:bg-muted/30 space-y-3 p-5 transition-colors sm:px-6"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-foreground text-sm font-semibold">
                          Unit {house?.unitNumber ?? "?"}
                        </span>
                        <span className="text-muted-foreground text-xs">·</span>
                        <span className="text-foreground text-xs font-medium">
                          {fmtPeriod(inv.period)}
                        </span>
                        <Badge
                          variant="outline"
                          className={`text-[10px] ${statusCfg.className}`}
                        >
                          <StatusIcon className="mr-1 size-2.5" />{" "}
                          {statusCfg.label}
                        </Badge>
                      </div>

                      <p className="text-muted-foreground text-xs">
                        {renter
                          ? `${renter.name}${renter.phone ? ` (${renter.phone})` : ""}`
                          : "No tenant assigned"}{" "}
                        · Due {inv.dueDate}
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-foreground text-base font-bold">
                        {fmtMoney(inv.amount, inv.currency)}
                      </span>

                      {inv.status !== "paid" && (
                        <ChargeButton
                          invoiceId={inv.id}
                          amount={inv.amount}
                          currency={inv.currency}
                          renter={
                            renter
                              ? {
                                  name: renter.name,
                                  email: renter.email,
                                  phone: renter.phone,
                                }
                              : null
                          }
                          appUrl={APP_URL}
                        />
                      )}

                      {inv.status !== "paid" && (
                        <DeleteInvoiceButton id={inv.id} />
                      )}
                    </div>
                  </div>

                  {invCharges.length > 0 && (
                    <details className="mt-2 text-xs">
                      <summary className="text-muted-foreground hover:text-foreground flex cursor-pointer items-center gap-1.5 font-medium select-none">
                        <CreditCard size={12} /> {invCharges.length} charge
                        attempt
                        {invCharges.length === 1 ? "" : "s"} — latest:{" "}
                        {lastCharge.status} via {lastCharge.channel}
                      </summary>
                      <div className="border-primary/30 mt-2.5 space-y-1.5 border-l-2 pl-3">
                        {invCharges.map((c) => (
                          <div
                            key={c.id}
                            className="bg-muted/50 flex flex-wrap items-center justify-between gap-2 rounded-lg px-3 py-1.5 text-xs"
                          >
                            <span className="text-muted-foreground font-mono text-[11px]">
                              {c.reference}
                            </span>
                            <div className="flex items-center gap-2">
                              <Badge
                                variant="outline"
                                className="text-[10px] capitalize"
                              >
                                {c.channel}
                              </Badge>
                              <Badge
                                variant="outline"
                                className={`text-[10px] capitalize ${
                                  STATUS_CONFIG[c.status]?.className ?? ""
                                }`}
                              >
                                {c.status}
                              </Badge>
                              {(c.status === "pending" ||
                                c.status === "failed") && (
                                <VerifyButton
                                  reference={c.reference}
                                  kind="charge"
                                />
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </details>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </main>
  );
}
