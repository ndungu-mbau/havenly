import { AlertDialogProvider } from "@/lib/alert";
import type { AppRouter } from "@havenly/api/routers/index";
import { Toaster } from "@havenly/ui/components/sonner";
import { TooltipProvider } from "@havenly/ui/components/tooltip";
import type { QueryClient } from "@tanstack/react-query";
import { HeadContent, Outlet, Scripts, createRootRouteWithContext } from "@tanstack/react-router";
import type { TRPCOptionsProxy } from "@trpc/tanstack-react-query";
import { ThemeProvider } from "@/components/theme-provider";

import appCss from "../index.css?url";

export interface RouterAppContext {
  trpc: TRPCOptionsProxy<AppRouter>;
  queryClient: QueryClient;
}

export const Route = createRootRouteWithContext<RouterAppContext>()({
  head: () => ({
    meta: [
      {
        charSet: "utf-8",
      },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1",
      },
      {
        title: "Havenly | Rental management",
      },
      {
        name: "description",
        content:
          "A calm workspace for managing rental properties, homes, renters, and payments.",
      },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
    ],
  }),

  component: RootDocument,
});

function RootDocument() {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body className="bg-background text-foreground antialiased min-h-screen">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AlertDialogProvider>
            <TooltipProvider>
              <Outlet />
            </TooltipProvider>
          </AlertDialogProvider>
        </ThemeProvider>
        <Toaster richColors />
        <Scripts />
      </body>
    </html>
  );
}
