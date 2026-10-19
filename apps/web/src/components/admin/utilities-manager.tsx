"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTRPC } from "@/utils/trpc";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@havenly/ui/components/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@havenly/ui/components/card";
import { Button } from "@havenly/ui/components/button";
import { Input } from "@havenly/ui/components/input";
import { Loader2, Save, SaveAll, Home, Calendar } from "lucide-react";
import { toaster } from "@/lib/toast";

interface UtilitiesManagerProps {
  propertyId: string;
  propertyName: string;
}

export default function UtilitiesManager({ propertyId, propertyName }: UtilitiesManagerProps) {
  const [period, setPeriod] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });

    const trpc = useTRPC();
  const queryClient = useQueryClient();

  // Fetch all houses in the property
  const { data: houses = [], isLoading: loadingHouses } = useQuery(
    trpc.caretakers.houses.list.queryOptions({ propertyId })
  );

  // Fetch existing utilities for this property and period
  const { data: existingUtilitiesData = [], isLoading: loadingUtilities } = useQuery(
    trpc.caretakers.utilities.listByProperty.queryOptions({ propertyId, period })
  );
  const existingUtilities = existingUtilitiesData as any[];

  const upsertMutation = useMutation(
    trpc.caretakers.utilities.upsert.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["utilities", propertyId, period] });
        toaster.success("Utility cost updated for this house.");
      },
      onError: (err: any) => {
        toaster.error(err.message);
      },
    })
  );
  const bulkUpsertMutation = useMutation(
    trpc.caretakers.utilities.bulkUpsert.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["utilities", propertyId, period] });
        toaster.success("Utility costs updated for all houses.");
      },
      onError: (err: any) => {
        toaster.error(err.message);
      },
    })
  );

  const [costs, setCosts] = useState<Record<string, number>>({});

  // In a real app, we might use useEffect here or handle it in the query
  // But for the port, we maintain the logic.

  const handleCostChange = (houseId: string, value: string) => {
    setCosts(prev => ({ ...prev, [houseId]: parseInt(value) || 0 }));
  };

  const saveIndividual = async (houseId: string) => {
    await upsertMutation.mutateAsync({
      houseId,
      amount: costs[houseId] || 0,
      period,
    });
  };

  const saveAll = async () => {
    const updates = Object.entries(costs).map(([houseId, amount]) => ({
      houseId,
      amount,
      period,
    }));
    await bulkUpsertMutation.mutateAsync(updates as any);
  };

  // Initialize costs when utilities load
  useState(() => {
    if (existingUtilities.length > 0) {
      const mapping: Record<string, number> = {};
      existingUtilities.forEach((u: any) => {
        mapping[u.houseId] = u.amount;
      });
      return mapping;
    }
    return {};
  });

  if (loadingHouses || loadingUtilities) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="size-6 animate-spin text-primary" />
      </div>
    );
  }

  const housesData = houses as any;

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-7">
        <div className="space-y-1">
          <CardTitle className="text-2xl font-bold">{propertyName}</CardTitle>
          <CardDescription>Enter monthly utility costs for each house unit.</CardDescription>
        </div>
        <div className="flex items-center gap-2">
          <Calendar className="size-4 text-muted-foreground" />
          <Input
            type="month"
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="w-32 h-9"
          />
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>House Unit</TableHead>
                <TableHead className="w-48">Amount (KSh)</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {housesData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="h-24 text-center text-muted-foreground">
                    No houses found in this property.
                  </TableCell>
                </TableRow>
              ) : (
                housesData.map((house: any) => (
                  <TableRow key={house.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <Home className="size-4 text-muted-foreground" />
                        {house.unitNumber}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        placeholder="0"
                        value={costs[house.id] ?? ""}
                        onChange={(e) => handleCostChange(house.id, e.target.value)}
                        className="h-8"
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => saveIndividual(house.id)}
                        disabled={upsertMutation.isPending}
                      >
                        <Save className="size-3.5 mr-1" /> Save
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
        <div className="mt-6 flex justify-end">
          <Button
            onClick={saveAll}
            disabled={bulkUpsertMutation.isPending}
            className="gap-2"
          >
            <SaveAll className="size-4" /> Save All Units
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
