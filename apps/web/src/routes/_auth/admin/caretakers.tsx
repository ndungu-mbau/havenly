import { createFileRoute } from "@tanstack/react-router";
import { useGetAllCaretakers } from "@/lib/hooks/queries";
import { CaretakerForm } from "@/components/caretaker-form";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@havenly/ui/components/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@havenly/ui/components/card";
import { Badge } from "@havenly/ui/components/badge";
import { Loader2, User, Mail, Phone } from "lucide-react";

export const Route = createFileRoute("/_auth/admin/caretakers")({
  component: CaretakersPage,
});

function CaretakersPage() {
  const { data, isLoading, error } = useGetAllCaretakers();

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
          Failed to load caretakers.
        </p>
      </div>
    );
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
              Staff
            </Badge>
            <span className="text-muted-foreground text-xs">
              · {data.length} registered caretakers
            </span>
          </div>
          <h1 className="text-foreground mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
            Caretakers
          </h1>
          <p className="text-muted-foreground mt-1 max-w-xl text-sm leading-relaxed">
            Manage the staff responsible for property maintenance and utility
            reporting.
          </p>
        </div>
        <CaretakerForm />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Caretaker Directory</CardTitle>
          <CardDescription>
            List of all registered property caretakers.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="text-muted-foreground h-24 text-center"
                    >
                      No caretakers registered yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  data.map((caretaker) => (
                    <TableRow key={caretaker.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <div className="bg-muted grid size-7 place-items-center rounded-full">
                            <User size={14} className="text-muted-foreground" />
                          </div>
                          {caretaker.name}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-muted-foreground flex items-center gap-2 text-xs">
                          <Mail size={12} />
                          {caretaker.email}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-muted-foreground flex items-center gap-2 text-xs">
                          <Phone size={12} />
                          {caretaker.phone || "Not provided"}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <CaretakerForm
                          caretaker={caretaker}
                          triggerVariant="outline"
                          triggerSize="sm"
                        />
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
