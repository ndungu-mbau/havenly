import { createFileRoute } from "@tanstack/react-router";
import { useGetAllUtilities } from "@/lib/hooks/queries";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@havenly/ui/components/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@havenly/ui/components/card";
import { Badge } from "@havenly/ui/components/badge";
import { Calendar, User, Home, Loader2 } from "lucide-react";

export const Route = createFileRoute("/_auth/admin/utilities")({
  component: UtilitiesPage,
});

function UtilitiesPage() {
  const { data, isLoading, error } = useGetAllUtilities();

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
        <p className="text-destructive text-sm font-medium">
          {error?.message || "Failed to load utilities."}
        </p>
      </div>
    );
  }

  return (
    <main className="mx-auto max-w-[1500px] space-y-8 px-4 py-8 sm:px-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Badge variant="outline" className="text-primary border-primary/20 bg-primary/5 text-xs font-semibold">
            Financials
          </Badge>
          <h1 className="text-foreground mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
            Utility Audit
          </h1>
          <p className="text-muted-foreground mt-1 max-w-xl text-sm leading-relaxed">
            Global view of utility costs entered by caretakers across all properties.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Utility Records</CardTitle>
          <CardDescription>Track monthly utility charges per house.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Period</TableHead>
                  <TableHead>Property</TableHead>
                  <TableHead>Unit</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Entered By</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                      No utility records found.
                    </TableCell>
                  </TableRow>
                ) : (
                  data.map((row) => (
                    <TableRow key={row.utility.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <Calendar size={14} className="text-muted-foreground" />
                          {row.utility.period}
                        </div>
                      </TableCell>
                      <TableCell>{row.property.name}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Home size={14} className="text-muted-foreground" />
                          {row.house.unitNumber}
                        </div>
                      </TableCell>
                      <TableCell className="font-semibold">
                        KSh {Number(row.utility.amount).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <User size={14} className="text-muted-foreground" />
                          {row.user.name}
                        </div>
                      </TableCell>
                      <TableCell>
                        {row.utility.invoiceId ? (
                          <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200">
                            Billed
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-amber-50 text-amber-600 border-amber-200">
                            Unbilled
                          </Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
