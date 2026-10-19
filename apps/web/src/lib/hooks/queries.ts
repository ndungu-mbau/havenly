import { useTRPC } from "@/utils/trpc";
import { useQuery } from "@tanstack/react-query";

export function useRentalSummary() {
  const trpc = useTRPC();
  return useQuery(trpc.summary.rentalSummary.queryOptions());
}

export function usePaymentsView() {
  const trpc = useTRPC();
  return useQuery(trpc.summary.paymentsView.queryOptions());
}

export function useGetAllHouses() {
  const trpc = useTRPC();
  return useQuery(trpc.houses.getAll.queryOptions());
}

export function usePropertyDetails(propertyId: string) {
  const trpc = useTRPC();
  return useQuery(trpc.properties.getById.queryOptions({ id: propertyId }));
}

export function useGetAllCaretakers() {
  const trpc = useTRPC();
  return useQuery(trpc.caretakers.getAll.queryOptions());
}

export function useCaretakerDashboardData() {
  const trpc = useTRPC();
  return useQuery(trpc.caretakers.getDashboardData.queryOptions());
}

export function useGetAllUtilities() {
  const trpc = useTRPC();
  return useQuery(trpc.utilities.getAll.queryOptions());
}
