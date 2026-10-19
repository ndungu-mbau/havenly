import * as React from "react";
import {
  AlertDialogConfirm,
  type AlertDialogConfirmProps,
} from "@havenly/ui/components/alert-dialog-confirm";

type DialogState = Omit<AlertDialogConfirmProps, "open" | "onOpenChange"> & {
  open: boolean;
};

type Listener = (state: DialogState) => void;

const _listeners: Set<Listener> = new Set();
let _state: DialogState = { open: false, variant: "info", title: "" };

function _emit() {
  for (const fn of _listeners) fn({ ..._state });
}

function _set(s: Partial<DialogState>) {
  _state = { ..._state, ...s };
  _emit();
}

/** Programmatic alert dialog — import and call from anywhere (even outside React). */
export const alertDialog = {
  show(opts: Omit<DialogState, "open">) {
    _set({ ...opts, open: true });
  },
  hide() {
    _set({ open: false });
  },
  error(title: string, description?: string, onConfirm?: () => void) {
    _set({ variant: "error", title, description, onConfirm, open: true });
  },
  success(title: string, description?: string, onConfirm?: () => void) {
    _set({ variant: "success", title, description, onConfirm, open: true });
  },
  warning(title: string, description?: string, onConfirm?: () => void) {
    _set({ variant: "warning", title, description, onConfirm, open: true });
  },
  info(title: string, description?: string, onConfirm?: () => void) {
    _set({ variant: "info", title, description, onConfirm, open: true });
  },
};

interface Ctx {
  subscribe: (fn: Listener) => () => void;
  getState: () => DialogState;
}

const AlertDialogContext = React.createContext<Ctx | null>(null);

function useAlertDialogContext(): Ctx {
  const ctx = React.useContext(AlertDialogContext);
  if (!ctx) throw new Error("AlertDialogProvider missing");
  return ctx;
}

/** Mount this once at the root. Renders the singleton dialog. */
export function AlertDialogProvider({ children }: { children: React.ReactNode }) {
  const ctx = React.useMemo<Ctx>(
    () => ({
      subscribe: (fn) => {
        _listeners.add(fn);
        return () => _listeners.delete(fn);
      },
      getState: () => _state,
    }),
    [],
  );

  return (
    <AlertDialogContext.Provider value={ctx}>
      {children}
      <AlertDialogSubscriber />
    </AlertDialogContext.Provider>
  );
}

function AlertDialogSubscriber() {
  const ctx = useAlertDialogContext();
  const [state, setState] = React.useState<DialogState>(ctx.getState);

  React.useEffect(() => {
    return ctx.subscribe(setState);
  }, [ctx]);

  return (
    <AlertDialogConfirm
      open={state.open}
      onOpenChange={(open) => {
        if (!open) alertDialog.hide();
      }}
      variant={state.variant}
      title={state.title}
      description={state.description}
      confirmText={state.confirmText}
      onConfirm={state.onConfirm}
    />
  );
}
