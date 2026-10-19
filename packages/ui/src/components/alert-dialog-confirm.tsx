"use client";

import * as React from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
} from "@havenly/ui/components/alert-dialog";
import { CircleCheckIcon, OctagonXIcon, TriangleAlertIcon, InfoIcon } from "lucide-react";

type AlertDialogVariant = "success" | "error" | "warning" | "info";

export interface AlertDialogConfirmProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  variant?: AlertDialogVariant;
  title: string;
  description?: string;
  confirmText?: string;
  onConfirm?: () => void;
}

const variantConfig: Record<
  AlertDialogVariant,
  { icon: React.ReactNode; mediaClass: string; buttonClass: string }
> = {
  success: {
    icon: <CircleCheckIcon className="text-emerald-600 dark:text-emerald-400" />,
    mediaClass: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
    buttonClass: "bg-emerald-600 text-white hover:bg-emerald-700",
  },
  error: {
    icon: <OctagonXIcon className="text-destructive" />,
    mediaClass: "bg-destructive/10 text-destructive",
    buttonClass: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
  },
  warning: {
    icon: <TriangleAlertIcon className="text-amber-600 dark:text-amber-400" />,
    mediaClass: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
    buttonClass: "bg-amber-600 text-white hover:bg-amber-700",
  },
  info: {
    icon: <InfoIcon className="text-blue-600 dark:text-blue-400" />,
    mediaClass: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    buttonClass: "bg-blue-600 text-white hover:bg-blue-700",
  },
};

export function AlertDialogConfirm({
  open,
  onOpenChange,
  variant = "info",
  title,
  description,
  confirmText = "OK",
  onConfirm,
}: AlertDialogConfirmProps) {
  const config = variantConfig[variant];

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogMedia className={config.mediaClass}>
            {config.icon}
          </AlertDialogMedia>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          {description && (
            <AlertDialogDescription>{description}</AlertDialogDescription>
          )}
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction
            className={config.buttonClass}
            onClick={() => {
              onConfirm?.();
              onOpenChange(false);
            }}
          >
            {confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

/** Programmatic hook for showing urgent alert dialogs anywhere. */
export function useAlertDialog() {
  const [state, setState] = React.useState<{
    open: boolean;
    variant: AlertDialogVariant;
    title: string;
    description?: string;
    confirmText?: string;
    onConfirm?: () => void;
  }>({ open: false, variant: "info", title: "" });

  const show = React.useCallback(
    (opts: Omit<typeof state, "open">) => setState({ ...opts, open: true }),
    []
  );

  const hide = React.useCallback(() => setState((s) => ({ ...s, open: false })), []);

  const alertSuccess = React.useCallback(
    (title: string, description?: string, onConfirm?: () => void) =>
      show({ variant: "success", title, description, onConfirm }),
    [show]
  );

  const alertError = React.useCallback(
    (title: string, description?: string, onConfirm?: () => void) =>
      show({ variant: "error", title, description, onConfirm }),
    [show]
  );

  const alertWarning = React.useCallback(
    (title: string, description?: string, onConfirm?: () => void) =>
      show({ variant: "warning", title, description, onConfirm }),
    [show]
  );

  const alertInfo = React.useCallback(
    (title: string, description?: string, onConfirm?: () => void) =>
      show({ variant: "info", title, description, onConfirm }),
    [show]
  );

  return { state, show, hide, alertSuccess, alertError, alertWarning, alertInfo };
}
