import { Outlet, createFileRoute, redirect } from "@tanstack/react-router";
import AdminSidebar from "@/components/admin-sidebar";
import { AdminNavbar } from "@/components/admin-navbar";

export const Route = createFileRoute("/_auth/admin")({
  beforeLoad: ({ context }) => {
    // If not admin, caretaker goes to /caretaker
    if (context.session?.user?.role === "caretaker") {
      throw redirect({
        to: "/caretaker",
      });
    }

    if (context.session?.user?.role === "tenant") {
      throw redirect({
        to: "/tenant",
      });
    }

    if (context.session?.user?.role === "landlord") {
      throw redirect({
        to: "/landlord",
      });
    }
  },
  component: AdminLayout,
});

function AdminLayout() {
  const { session } = Route.useRouteContext();
  const user = session?.user;

  return (
    <div className="bg-background text-foreground min-h-screen">
      {/* Sidebar rendered first */}
      <AdminSidebar user={user} />

      {/* Main content container with top navbar */}
      <div className="flex min-h-screen flex-col lg:pl-64">
        <AdminNavbar user={user} />
        <div className="flex-1">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
