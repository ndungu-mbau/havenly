"use client";

import { useDeleteInvoice } from "@/lib/hooks/mutations";
import { DeleteDialog } from "@/components/delete-dialog";

export function DeleteInvoiceButton({ id }: { id: string }) {
  const deleteInvoice = useDeleteInvoice();

  return (
    <DeleteDialog
      title="Delete this invoice?"
      description="This will remove the invoice and all its associated charges. This action cannot be undone."
      onDelete={() => deleteInvoice.mutateAsync({ id })}
      triggerText="Delete"
      triggerVariant="outline"
    />
  );
}
