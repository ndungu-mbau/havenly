import { toast } from "sonner";

interface ToastOptions {
  title?: string;
  description?: string;
  timeout?: number;
}

function success(opts: ToastOptions | string) {
  const o = typeof opts === "string" ? { description: opts } : opts;
  toast.success(o.title ?? "Success", {
    description: o.description,
    duration: o.timeout ?? 4000,
  });
}

function error(opts: ToastOptions | string) {
  const o = typeof opts === "string" ? { description: opts } : opts;
  toast.error(o.title ?? "Error", {
    description: o.description ?? "Something went wrong.",
    duration: o.timeout ?? 6000,
  });
}

function info(opts: ToastOptions | string) {
  const o = typeof opts === "string" ? { description: opts } : opts;
  toast.info(o.title ?? "Info", {
    description: o.description,
    duration: o.timeout ?? 4000,
  });
}

function warning(opts: ToastOptions | string) {
  const o = typeof opts === "string" ? { description: opts } : opts;
  toast.warning(o.title ?? "Warning", {
    description: o.description,
    duration: o.timeout ?? 5000,
  });
}

function loading(opts: ToastOptions | string) {
  const o = typeof opts === "string" ? { description: opts } : opts;
  return toast.loading(o.title ?? "Loading", {
    description: o.description,
  });
}

export const toaster = { success, error, info, warning, loading };
