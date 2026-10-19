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
  AlertDialogMedia,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@havenly/ui/components/alert-dialog";
import { TriangleAlertIcon } from "lucide-react";

interface ConfirmActionProps {
  title: string;
  description: string;
  confirmText?: string;
  variant?: "warning" | "destructive";
  onConfirm: () => void | Promise<void>;
  children: React.ReactNode;
}

export function ConfirmAction({
  title,
  description,
  confirmText = "Continue",
  variant = "warning",
  onConfirm,
  children,
}: ConfirmActionProps) {
  const [open, setOpen] = React.useState(false);
  const [busy, setBusy] = React.useState(false);

  const handleConfirm = async () => {
    setBusy(true);
    try {
      await onConfirm();
      setOpen(false);
    } catch {
      // error handled by caller's mutation
    } finally {
      setBusy(false);
    }
  };

  const mediaClass =
    variant === "destructive"
      ? "bg-destructive/10 text-destructive"
      : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400";

  const buttonClass =
    variant === "destructive"
      ? "bg-destructive text-destructive-foreground hover:bg-destructive/90"
      : "bg-amber-600 text-white hover:bg-amber-700";

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger render={React.Children.only(children) as React.ReactElement} />
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogMedia className={mediaClass}>
            <TriangleAlertIcon />
          </AlertDialogMedia>
          <AlertDialogTitle className="text-lg font-semibold">{title}</AlertDialogTitle>
          <AlertDialogDescription className="text-muted-foreground text-sm">
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="mt-4 flex gap-2">
          <AlertDialogCancel disabled={busy}>Cancel</AlertDialogCancel>
          <AlertDialogAction className={buttonClass} onClick={handleConfirm} disabled={busy}>
            {busy ? "Processing..." : confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
