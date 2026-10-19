import { alertDialog } from "@/lib/alert";
import { toaster } from "@/lib/toast";
import { useTRPC, useTRPCClient } from "@/utils/trpc";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useAddProperty() {
  const trpc = useTRPC();
  const client = useTRPCClient();
  const qc = useQueryClient();
  return useMutation({
    ...trpc.properties.add.mutationOptions(),
    mutationFn: async (args: any) => {
      const input = args?.data ?? args;
      return client.properties.add.mutate(input);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: trpc.summary.rentalSummary.queryKey() });
      toaster.success({
        title: "Property added",
        description: "New property has been created.",
      });
    },
    onError: (err: Error) => {
      toaster.error({ title: "Failed to add property", description: err.message });
    },
  });
}

export function useUpdateProperty() {
  const trpc = useTRPC();
  const client = useTRPCClient();
  const qc = useQueryClient();
  return useMutation({
    ...trpc.properties.update.mutationOptions(),
    mutationFn: async (args: any) => {
      const input = args?.data ?? args;
      return client.properties.update.mutate(input);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: trpc.summary.rentalSummary.queryKey() });
      toaster.success({
        title: "Property updated",
        description: "Changes have been saved.",
      });
    },
    onError: (err: Error) => {
      toaster.error({ title: "Failed to update property", description: err.message });
    },
  });
}

export function useDeleteProperty() {
  const trpc = useTRPC();
  const client = useTRPCClient();
  const qc = useQueryClient();
  return useMutation({
    ...trpc.properties.delete.mutationOptions(),
    mutationFn: async (idOrObj: any) => {
      const id = typeof idOrObj === "string" ? idOrObj : idOrObj?.id;
      return client.properties.delete.mutate({ id });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: trpc.summary.rentalSummary.queryKey() });
      toaster.success({
        title: "Property deleted",
        description: "The property and its units have been removed.",
      });
    },
    onError: (err: Error) => {
      alertDialog.error("Property deletion failed", err.message);
    },
  });
}

export function useAddCategory() {
  const trpc = useTRPC();
  const client = useTRPCClient();
  const qc = useQueryClient();
  return useMutation({
    ...trpc.categories.add.mutationOptions(),
    mutationFn: async (args: any) => {
      const input = args?.data ?? args;
      return client.categories.add.mutate(input);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: trpc.summary.rentalSummary.queryKey() });
      toaster.success({
        title: "Category added",
        description: "New category template has been created.",
      });
    },
    onError: (err: Error) => {
      toaster.error({ title: "Failed to add category", description: err.message });
    },
  });
}

export function useUpdateCategory() {
  const trpc = useTRPC();
  const client = useTRPCClient();
  const qc = useQueryClient();
  return useMutation({
    ...trpc.categories.update.mutationOptions(),
    mutationFn: async (args: any) => {
      const input = args?.data ?? args;
      return client.categories.update.mutate(input);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: trpc.summary.rentalSummary.queryKey() });
      toaster.success({
        title: "Category updated",
        description: "Changes have been saved.",
      });
    },
    onError: (err: Error) => {
      toaster.error({ title: "Failed to update category", description: err.message });
    },
  });
}

export function useDeleteCategory() {
  const trpc = useTRPC();
  const client = useTRPCClient();
  const qc = useQueryClient();
  return useMutation({
    ...trpc.categories.delete.mutationOptions(),
    mutationFn: async (idOrObj: any) => {
      const id = typeof idOrObj === "string" ? idOrObj : idOrObj?.id;
      return client.categories.delete.mutate({ id });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: trpc.summary.rentalSummary.queryKey() });
      toaster.success({
        title: "Category deleted",
        description: "The category template has been removed.",
      });
    },
    onError: (err: Error) => {
      alertDialog.error("Category deletion failed", err.message);
    },
  });
}

export function useAddHouse() {
  const trpc = useTRPC();
  const client = useTRPCClient();
  const qc = useQueryClient();
  return useMutation({
    ...trpc.houses.add.mutationOptions(),
    mutationFn: async (args: any) => {
      const input = args?.data ?? args;
      return client.houses.add.mutate(input);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: trpc.summary.rentalSummary.queryKey() });
      qc.invalidateQueries({ queryKey: trpc.houses.getAll.queryKey() });
      toaster.success({
        title: "House added",
        description: "New unit has been added to the property.",
      });
    },
    onError: (err: Error) => {
      toaster.error({ title: "Failed to add house", description: err.message });
    },
  });
}

export function useUpdateHouse() {
  const trpc = useTRPC();
  const client = useTRPCClient();
  const qc = useQueryClient();
  return useMutation({
    ...trpc.houses.update.mutationOptions(),
    mutationFn: async (args: any) => {
      const input = args?.data ?? args;
      return client.houses.update.mutate(input);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: trpc.summary.rentalSummary.queryKey() });
      qc.invalidateQueries({ queryKey: trpc.houses.getAll.queryKey() });
      toaster.success({
        title: "House updated",
        description: "Changes have been saved.",
      });
    },
    onError: (err: Error) => {
      toaster.error({ title: "Failed to update house", description: err.message });
    },
  });
}

export function useDeleteHouse() {
  const trpc = useTRPC();
  const client = useTRPCClient();
  const qc = useQueryClient();
  return useMutation({
    ...trpc.houses.delete.mutationOptions(),
    mutationFn: async (idOrObj: any) => {
      const id = typeof idOrObj === "string" ? idOrObj : idOrObj?.id;
      return client.houses.delete.mutate({ id });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: trpc.summary.rentalSummary.queryKey() });
      qc.invalidateQueries({ queryKey: trpc.houses.getAll.queryKey() });
      toaster.success({
        title: "House deleted",
        description: "The unit has been removed.",
      });
    },
    onError: (err: Error) => {
      alertDialog.error("House deletion failed", err.message);
    },
  });
}

export function useAddRenter() {
  const trpc = useTRPC();
  const client = useTRPCClient();
  const qc = useQueryClient();
  return useMutation({
    ...trpc.renters.add.mutationOptions(),
    mutationFn: async (args: any) => {
      const input = args?.data ?? args;
      return client.renters.add.mutate(input);
    },
    onSuccess: (result: any) => {
      qc.invalidateQueries({ queryKey: trpc.summary.rentalSummary.queryKey() });
      qc.invalidateQueries({ queryKey: trpc.summary.paymentsView.queryKey() });
      qc.invalidateQueries({ queryKey: trpc.houses.getAll.queryKey() });
      if (result?.paystackWarning) {
        toaster.warning({
          title: "Renter added with notice",
          description: result.paystackWarning,
        });
      } else {
        toaster.success({
          title: "Renter added",
          description: "New tenant has been assigned to the unit.",
        });
      }
    },
    onError: (err: Error) => {
      alertDialog.error("Renter onboarding failed", err.message);
    },
  });
}

export function useUpdateRenter() {
  const trpc = useTRPC();
  const client = useTRPCClient();
  const qc = useQueryClient();
  return useMutation({
    ...trpc.renters.update.mutationOptions(),
    mutationFn: async (args: any) => {
      const input = args?.data ?? args;
      return client.renters.update.mutate(input);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: trpc.summary.rentalSummary.queryKey() });
      qc.invalidateQueries({ queryKey: trpc.summary.paymentsView.queryKey() });
      toaster.success({
        title: "Renter updated",
        description: "Changes have been saved.",
      });
    },
    onError: (err: Error) => {
      toaster.error({ title: "Failed to update renter", description: err.message });
    },
  });
}

export function useDeleteRenter() {
  const trpc = useTRPC();
  const client = useTRPCClient();
  const qc = useQueryClient();
  return useMutation({
    ...trpc.renters.delete.mutationOptions(),
    mutationFn: async (idOrObj: any) => {
      const id = typeof idOrObj === "string" ? idOrObj : idOrObj?.id;
      return client.renters.delete.mutate({ id });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: trpc.summary.rentalSummary.queryKey() });
      qc.invalidateQueries({ queryKey: trpc.summary.paymentsView.queryKey() });
      toaster.success({
        title: "Renter deleted",
        description: "The renter has been removed.",
      });
    },
    onError: (err: Error) => {
      alertDialog.error("Renter deletion failed", err.message);
    },
  });
}

export function useRecordPayment() {
  const trpc = useTRPC();
  const client = useTRPCClient();
  const qc = useQueryClient();
  return useMutation({
    ...trpc.payments.record.mutationOptions(),
    mutationFn: async (args: any) => {
      const input = args?.data ?? args;
      return client.payments.record.mutate(input);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: trpc.summary.rentalSummary.queryKey() });
      toaster.success({
        title: "Payment recorded",
        description: "Payment has been logged.",
      });
    },
    onError: (err: Error) => {
      alertDialog.error("Payment recording failed", err.message);
    },
  });
}

export function useDeletePayment() {
  const trpc = useTRPC();
  const client = useTRPCClient();
  const qc = useQueryClient();
  return useMutation({
    ...trpc.payments.delete.mutationOptions(),
    mutationFn: async (idOrObj: any) => {
      const id = typeof idOrObj === "string" ? idOrObj : idOrObj?.id;
      return client.payments.delete.mutate({ id });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: trpc.summary.rentalSummary.queryKey() });
      toaster.success({
        title: "Payment deleted",
        description: "The payment record has been removed.",
      });
    },
    onError: (err: Error) => {
      alertDialog.error("Payment deletion failed", err.message);
    },
  });
}

export function useCreateInvoice() {
  const trpc = useTRPC();
  const client = useTRPCClient();
  const qc = useQueryClient();
  return useMutation({
    ...trpc.invoices.create.mutationOptions(),
    mutationFn: async (args: any) => {
      const input = args?.data ?? args;
      return client.invoices.create.mutate(input);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: trpc.summary.paymentsView.queryKey() });
      toaster.success({
        title: "Invoice created",
        description: "New invoice has been issued.",
      });
    },
    onError: (err: Error) => {
      alertDialog.error("Invoice creation failed", err.message);
    },
  });
}

export function useDeleteInvoice() {
  const trpc = useTRPC();
  const client = useTRPCClient();
  const qc = useQueryClient();
  return useMutation({
    ...trpc.invoices.delete.mutationOptions(),
    mutationFn: async (idOrObj: any) => {
      const id = typeof idOrObj === "string" ? idOrObj : idOrObj?.id;
      return client.invoices.delete.mutate({ id });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: trpc.summary.paymentsView.queryKey() });
      toaster.success({
        title: "Invoice deleted",
        description: "The invoice has been removed.",
      });
    },
    onError: (err: Error) => {
      toaster.error({ title: "Failed to delete invoice", description: err.message });
    },
  });
}

export function useAddPayoutDestination() {
  const trpc = useTRPC();
  const client = useTRPCClient();
  const qc = useQueryClient();
  return useMutation({
    ...trpc.payouts.addDestination.mutationOptions(),
    mutationFn: async (args: any) => {
      const input = args?.data ?? args;
      return client.payouts.addDestination.mutate(input);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: trpc.summary.paymentsView.queryKey() });
      qc.invalidateQueries({ queryKey: trpc.payouts.getDestinations.queryKey() });
      toaster.success({
        title: "Destination added",
        description: "Payout destination has been saved.",
      });
    },
    onError: (err: Error) => {
      toaster.error({ title: "Failed to add destination", description: err.message });
    },
  });
}

export function useDeletePayoutDestination() {
  const trpc = useTRPC();
  const client = useTRPCClient();
  const qc = useQueryClient();
  return useMutation({
    ...trpc.payouts.deleteDestination.mutationOptions(),
    mutationFn: async (idOrObj: any) => {
      const id = typeof idOrObj === "string" ? idOrObj : idOrObj?.id;
      return client.payouts.deleteDestination.mutate({ id });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: trpc.summary.paymentsView.queryKey() });
      qc.invalidateQueries({ queryKey: trpc.payouts.getDestinations.queryKey() });
      toaster.success({
        title: "Destination deleted",
        description: "Payout destination has been removed.",
      });
    },
    onError: (err: Error) => {
      toaster.error({ title: "Failed to delete destination", description: err.message });
    },
  });
}

export function useCreatePayout() {
  const trpc = useTRPC();
  const client = useTRPCClient();
  const qc = useQueryClient();
  return useMutation({
    ...trpc.payouts.createPayout.mutationOptions(),
    mutationFn: async (args: any) => {
      const input = args?.data ?? args;
      return client.payouts.createPayout.mutate(input);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: trpc.summary.paymentsView.queryKey() });
      toaster.success({
        title: "Payout initiated",
        description: "Payout is being processed.",
      });
    },
    onError: (err: Error) => {
      alertDialog.error("Payout initiation failed", err.message);
    },
  });
}

export function useAddCaretaker() {
  const trpc = useTRPC();
  const client = useTRPCClient();
  const qc = useQueryClient();
  return useMutation({
    ...trpc.caretakers.add.mutationOptions(),
    mutationFn: async (input: { name: string; email: string; phone?: string }) => {
      return client.caretakers.add.mutate(input);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: trpc.caretakers.getAll.queryKey() });
      toaster.success("Caretaker created");
    },
    onError: (err: Error) => {
      toaster.error(err.message || "Failed to create caretaker");
    },
  });
}

export function useUpdateCaretaker() {
  const trpc = useTRPC();
  const client = useTRPCClient();
  const qc = useQueryClient();
  return useMutation({
    ...trpc.caretakers.update.mutationOptions(),
    mutationFn: async (input: { id: string; name: string; email: string; phone?: string }) => {
      return client.caretakers.update.mutate(input);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: trpc.caretakers.getAll.queryKey() });
      toaster.success("Caretaker updated");
    },
    onError: (err: Error) => {
      toaster.error(err.message || "Failed to update caretaker");
    },
  });
}

export function useDeleteCaretaker() {
  const trpc = useTRPC();
  const client = useTRPCClient();
  const qc = useQueryClient();
  return useMutation({
    ...trpc.caretakers.delete.mutationOptions(),
    mutationFn: async (idOrObj: any) => {
      const id = typeof idOrObj === "string" ? idOrObj : idOrObj?.id;
      return client.caretakers.delete.mutate({ id });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: trpc.caretakers.getAll.queryKey() });
      toaster.success("Caretaker removed");
    },
    onError: (err: Error) => {
      toaster.error(err.message || "Failed to remove caretaker");
    },
  });
}

export function useAddOrUpdateUtility() {
  const trpc = useTRPC();
  const client = useTRPCClient();
  const qc = useQueryClient();
  return useMutation({
    ...trpc.utilities.addOrUpdate.mutationOptions(),
    mutationFn: async (args: any) => {
      const input = args?.data ?? args;
      return client.utilities.addOrUpdate.mutate(input);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: trpc.caretakers.getDashboardData.queryKey() });
      qc.invalidateQueries({ queryKey: trpc.utilities.getAll.queryKey() });
      toaster.success("Utilities updated");
    },
    onError: (err: Error) => {
      toaster.error(err.message || "Failed to update utilities");
    },
  });
}

export function useSendMessage() {
  const trpc = useTRPC();
  const client = useTRPCClient();
  return useMutation({
    ...trpc.messages.send.mutationOptions(),
    mutationFn: async (args: any) => {
      const input = args?.data ?? args;
      return client.messages.send.mutate(input);
    },
    onSuccess: () => {
      toaster.success({
        title: "Message sent",
        description: "We'll get back to you shortly.",
      });
    },
    onError: (err: Error) => {
      toaster.error({ title: "Failed to send message", description: err.message });
    },
  });
}

// ─── Paystack tRPC Mutations ───

export function useChargePaystack() {
  const trpc = useTRPC();
  const client = useTRPCClient();
  return useMutation({
    ...trpc.charges.initiateCharge.mutationOptions(),
    mutationFn: async (payload: {
      invoiceId: string;
      channel?: any;
      phone?: string;
      email?: string;
    }) => {
      return client.charges.initiateCharge.mutate(payload as any);
    },
    onSuccess: () => {
      toaster.success({
        title: "Charge initiated",
        description: "Payment request sent to Paystack.",
      });
    },
    onError: (err: Error) => {
      alertDialog.error("Paystack charge failed", err.message);
    },
  });
}

export function useVerifyPaystack() {
  const trpc = useTRPC();
  const client = useTRPCClient();
  const qc = useQueryClient();
  return useMutation({
    ...trpc.charges.verify.mutationOptions(),
    mutationFn: async (payload: { kind: "charge" | "payout"; reference: string }) => {
      return client.charges.verify.mutate(payload);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: trpc.summary.paymentsView.queryKey() });
      qc.invalidateQueries({ queryKey: trpc.summary.rentalSummary.queryKey() });
      toaster.success({
        title: "Payment verified",
        description: "Transaction has been confirmed.",
      });
    },
    onError: (err: Error) => {
      alertDialog.error("Payment verification failed", err.message);
    },
  });
}

export function useInitiatePayout() {
  const trpc = useTRPC();
  const client = useTRPCClient();
  return useMutation({
    ...trpc.payouts.initiatePayout.mutationOptions(),
    mutationFn: async (payload: { payoutId: string }) => {
      return client.payouts.initiatePayout.mutate(payload);
    },
    onSuccess: () => {
      toaster.success({
        title: "Payout initiated",
        description: "Disbursement is being processed.",
      });
    },
    onError: (err: Error) => {
      toaster.error({ title: "Payout failed", description: err.message });
    },
  });
}
