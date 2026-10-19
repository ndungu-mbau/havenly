import { RentalActions } from "@/components/rental-actions";
import { useRentalSummary } from "@/lib/hooks/queries";
import { Link } from "@tanstack/react-router";

type Kind = "properties" | "renters" | "payments";

export function RentalSection({ kind }: { kind: Kind }) {
  const { data, isLoading } = useRentalSummary();
  const title =
    kind === "properties"
      ? "Properties"
      : kind === "renters"
        ? "Renters"
        : "Payments";

  if (isLoading || !data) {
    return (
      <div className="bg-background text-foreground p-8 text-center text-sm">
        Loading {title.toLowerCase()}...
      </div>
    );
  }

  const rows =
    kind === "properties"
      ? data.properties
      : kind === "renters"
        ? data.renters
        : data.payments;

  return (
    <div className="bg-background text-foreground">
      <div className="border-border bg-card flex h-16 items-center justify-between border-b px-5 sm:px-8">
        <div>
          <h1 className="text-lg font-semibold tracking-tight sm:text-xl">
            {title}
          </h1>
        </div>
        <RentalActions
          kind={kind}
          houses={data.houses.map((house) => ({
            id: house.id,
            unitNumber: house.unitNumber,
          }))}
        />
      </div>
      <div className="mx-auto max-w-[1500px] px-5 py-8 sm:px-8">
        <p className="text-muted-foreground text-sm font-medium">
          Live records
        </p>
        <h2 className="mt-2 text-3xl font-semibold tracking-tight">{title}</h2>
        <p className="text-muted-foreground mt-2 text-sm leading-6">
          Only records owned by your account are shown.
        </p>

        <div className="border-border bg-card mt-8 overflow-hidden rounded-2xl border shadow-sm">
          {rows.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <h3 className="font-semibold">No {title.toLowerCase()} yet</h3>
              <p className="text-muted-foreground mt-2 text-sm">
                Create your first record from the dashboard.
              </p>
            </div>
          ) : (
            <div className="divide-border divide-y">
              {rows.map((row) => {
                const item = row as Record<string, unknown>;
                return kind === "properties" ? (
                  <Link
                    key={String(item.id)}
                    to={`/admin/properties/$id`}
                    params={{ id: String(item.id) }}
                    className="hover:bg-muted flex flex-col gap-2 px-6 py-5 transition-colors sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <p className="font-medium">
                        {String(item.name ?? `Record #${item.id}`)}
                      </p>
                      <p className="text-muted-foreground mt-1 text-sm">
                        {String(item.address ?? "Rental property")}
                      </p>
                    </div>
                    <p className="text-primary font-semibold">
                      Manage apartments →
                    </p>
                  </Link>
                ) : (
                  <div
                    key={String(item.id)}
                    className="flex flex-col gap-2 px-6 py-5 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <p className="font-medium">
                        {String(
                          item.name ??
                            item.unitNumber ??
                            item.period ??
                            `Record #${item.id}`,
                        )}
                      </p>
                      <p className="text-muted-foreground mt-1 text-sm">
                        {String(
                          item.email ??
                            item.address ??
                            item.paymentDate ??
                            "Rental record",
                        )}
                      </p>
                    </div>
                    <p className="font-semibold">
                      {kind === "payments"
                        ? `KSh ${Number(item.amount).toLocaleString()}`
                        : `Record #${item.id}`}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
