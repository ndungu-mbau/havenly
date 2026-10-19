"use client";

import * as React from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@havenly/ui/components/alert-dialog";
import { Button } from "@havenly/ui/components/button";
import { toaster } from "@/lib/toast";
import { Trash2 } from "lucide-react";

interface DeleteDialogProps {
  title: string;
  description: string;
  onDelete: () => Promise<unknown> | unknown;
  triggerText?: string;
  triggerVariant?: "ghost" | "outline" | "destructive";
  iconOnly?: boolean;
}

export function DeleteDialog({
  title,
  description,
  onDelete,
  triggerText = "Delete",
  triggerVariant = "ghost",
  iconOnly = false,
}: DeleteDialogProps) {
  const [open, setOpen] = React.useState(false);
  const [busy, setBusy] = React.useState(false);

  const handleDelete = async () => {
    setBusy(true);
    try {
      await onDelete();
      setOpen(false);
      window.location.reload();
    } catch {
      toaster.error("Failed to delete record. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger
        render={
          iconOnly ? (
            <Button
              variant={triggerVariant}
              size="icon"
              className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 size-8"
              aria-label={title}
            >
              <Trash2 className="size-4" />
            </Button>
          ) : (
            <Button
              variant={triggerVariant}
              size="sm"
              className="text-destructive hover:bg-destructive/10 text-xs"
            >
              <Trash2 className="mr-1 size-3.5" /> {triggerText}
            </Button>
          )
        }
      />
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="text-lg font-semibold">{title}</AlertDialogTitle>
          <AlertDialogDescription className="text-muted-foreground text-sm">
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="mt-4 flex gap-2">
          <AlertDialogCancel disabled={busy}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={busy}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {busy ? "Deleting..." : "Confirm Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
