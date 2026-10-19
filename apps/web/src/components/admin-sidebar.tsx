import { ThemeToggleSwitch } from "@/components/theme-toggle";
import { signOut } from "@/lib/auth-client";
import { Link, useLocation } from "@tanstack/react-router";
import { Building2, Home, LogOut, Tags, UserCog, Users, Wallet } from "lucide-react";

const nav = [
  ["Overview", "/admin", Home],
  ["Properties", "/admin/properties", Building2],
  ["Categories", "/admin/categories", Tags],
  ["Caretakers", "/admin/caretakers", UserCog],
  ["Renters", "/admin/renters", Users],
  ["Payments", "/admin/payments", Wallet],
  ["Payouts", "/admin/payouts", Wallet],
] as const;

function Navigation({ pathname, onNavigate }: { pathname: string; onNavigate?: () => void }) {
  return (
    <nav aria-label="Admin navigation" className="flex flex-col gap-1">
      <p className="text-sidebar-foreground/70 px-3 pb-3 text-[10px] font-bold tracking-[.18em] uppercase">
        Workspace
      </p>
      {nav.map(([label, href, Icon]) => (
        <Link
          key={label}
          to={href}
          onClick={onNavigate}
          className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm transition ${
            pathname === href
              ? "bg-sidebar-accent text-sidebar-accent-foreground"
              : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
          }`}
        >
          <Icon size={18} aria-hidden="true" />
          <span>{label}</span>
        </Link>
      ))}
    </nav>
  );
}

export default function AdminSidebar({ user }: { user: { name: string; email: string } }) {
  const location = useLocation();
  const pathname = location.pathname;
  const logout = () => signOut().then(() => window.location.assign("/"));

  return (
    <aside className="bg-sidebar text-sidebar-foreground border-sidebar-border fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r px-5 py-6 lg:flex">
      <Link to="/admin" className="flex items-center gap-3 px-2">
        <span className="bg-accent text-accent-foreground grid size-9 place-items-center rounded-xl font-bold">
          H
        </span>
        <span className="text-lg font-semibold tracking-tight">Havenly</span>
      </Link>
      <div className="mt-10">
        <Navigation pathname={pathname} />
      </div>
      <div className="border-sidebar-border mt-auto border-t px-3 pt-5">
        <div className="mb-4">
          <ThemeToggleSwitch />
        </div>
        <p className="truncate text-sm font-medium">{user.name}</p>
        <p className="text-sidebar-foreground/70 truncate text-xs">{user.email}</p>
        <button
          onClick={logout}
          className="text-sidebar-foreground/70 hover:text-sidebar-foreground mt-4 flex items-center gap-2 text-sm"
        >
          <LogOut size={16} aria-hidden="true" />
          Sign out
        </button>
      </div>
    </aside>
  );
}
