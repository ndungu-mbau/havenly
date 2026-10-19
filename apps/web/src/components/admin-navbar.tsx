import { useState } from "react";
import { Link, useLocation } from "@tanstack/react-router";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@havenly/ui/components/breadcrumb";
import { Avatar, AvatarFallback, AvatarImage } from "@havenly/ui/components/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@havenly/ui/components/dropdown-menu";
import { Button } from "@havenly/ui/components/button";
import { ThemeToggleSwitch } from "@/components/theme-toggle";
import { signOut } from "@/lib/auth-client";
import { Building2, Home, LogOut, Menu, Tags, Users, Wallet, X } from "lucide-react";

const NAV_ITEMS = [
  { label: "Overview", href: "/admin", icon: Home },
  { label: "Properties", href: "/admin/properties", icon: Building2 },
  { label: "Categories", href: "/admin/categories", icon: Tags },
  { label: "Renters", href: "/admin/renters", icon: Users },
  { label: "Payments", href: "/admin/payments", icon: Wallet },
  { label: "Payouts", href: "/admin/payouts", icon: Wallet },
] as const;

function getPageDetails(pathname: string): {
  title: string;
  crumbs: Array<{ label: string; href?: string }>;
} {
  if (pathname === "/admin") {
    return {
      title: "Overview",
      crumbs: [{ label: "Workspace", href: "/admin" }, { label: "Overview" }],
    };
  }
  if (pathname.startsWith("/admin/properties")) {
    if (pathname.includes("/admin/properties/") && pathname !== "/admin/properties") {
      return {
        title: "Property Details",
        crumbs: [
          { label: "Workspace", href: "/admin" },
          { label: "Properties", href: "/admin/properties" },
          { label: "Details" },
        ],
      };
    }
    return {
      title: "Properties",
      crumbs: [{ label: "Workspace", href: "/admin" }, { label: "Properties" }],
    };
  }
  if (pathname.startsWith("/admin/categories")) {
    return {
      title: "Categories",
      crumbs: [{ label: "Workspace", href: "/admin" }, { label: "Categories" }],
    };
  }
  if (pathname.startsWith("/admin/renters")) {
    return {
      title: "Renters",
      crumbs: [{ label: "Workspace", href: "/admin" }, { label: "Renters" }],
    };
  }
  if (pathname.startsWith("/admin/payments")) {
    return {
      title: "Payments & Invoices",
      crumbs: [{ label: "Workspace", href: "/admin" }, { label: "Payments" }],
    };
  }
  if (pathname.startsWith("/admin/payouts")) {
    return {
      title: "Disbursements & Payouts",
      crumbs: [{ label: "Workspace", href: "/admin" }, { label: "Payouts" }],
    };
  }
  return {
    title: "Admin",
    crumbs: [{ label: "Workspace", href: "/admin" }, { label: "Dashboard" }],
  };
}

function getInitials(name: string): string {
  if (!name) return "AD";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function AdminNavbar({
  user,
}: {
  user: { name: string; email: string; image?: string | null };
}) {
  const location = useLocation();
  const pathname = location.pathname;
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { title, crumbs } = getPageDetails(pathname);
  const initials = getInitials(user.name);

  const handleLogout = () => {
    signOut().then(() => window.location.assign("/"));
  };

  return (
    <>
      <header className="border-border bg-background/95 sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b px-4 backdrop-blur sm:px-8">
        {/* Left: Mobile menu toggle + Dynamic Breadcrumbs */}
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            aria-label="Open menu"
            onClick={() => setMobileMenuOpen(true)}
            className="lg:hidden"
          >
            <Menu size={20} />
          </Button>

          <Breadcrumb className="hidden sm:block">
            <BreadcrumbList>
              {crumbs.map((crumb, idx) => {
                const isLast = idx === crumbs.length - 1;
                return (
                  <span key={crumb.label} className="inline-flex items-center gap-1.5">
                    {idx > 0 && <BreadcrumbSeparator />}
                    <BreadcrumbItem>
                      {isLast || !crumb.href ? (
                        <BreadcrumbPage className="text-foreground font-medium">
                          {crumb.label}
                        </BreadcrumbPage>
                      ) : (
                        <BreadcrumbLink render={<Link to={crumb.href}>{crumb.label}</Link>} />
                      )}
                    </BreadcrumbItem>
                  </span>
                );
              })}
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        {/* Middle: Page Name */}
        <div className="text-center">
          <span className="text-foreground text-sm font-semibold tracking-tight sm:text-base">
            {title}
          </span>
        </div>

        {/* Right: Theme Switcher + User Avatar */}
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="hidden items-center sm:flex">
            <ThemeToggleSwitch />
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <button
                  type="button"
                  className="ring-offset-background focus-visible:ring-ring rounded-full transition-opacity hover:opacity-80 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
                  aria-label="User account menu"
                >
                  <Avatar size="default" className="border-border size-9 cursor-pointer border">
                    {user.image && <AvatarImage src={user.image} alt={user.name} />}
                    <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                </button>
              }
            />
            <DropdownMenuContent align="end" sideOffset={8} className="w-56">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm leading-none font-medium">{user.name}</p>
                  <p className="text-muted-foreground truncate text-xs leading-none">
                    {user.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem
                  render={
                    <Link to="/admin" className="cursor-pointer">
                      Overview
                    </Link>
                  }
                />
                <DropdownMenuItem
                  render={
                    <Link to="/admin/properties" className="cursor-pointer">
                      Properties
                    </Link>
                  }
                />
                <DropdownMenuItem
                  render={
                    <Link to="/admin/payments" className="cursor-pointer">
                      Invoices & Payments
                    </Link>
                  }
                />
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <div className="p-2 sm:hidden">
                <ThemeToggleSwitch />
              </div>
              <DropdownMenuSeparator className="sm:hidden" />
              <DropdownMenuItem
                onClick={handleLogout}
                className="text-destructive focus:text-destructive cursor-pointer"
              >
                <LogOut className="mr-2 size-4" />
                <span>Sign out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Close navigation overlay"
            className="bg-background/80 fixed inset-0 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />
          <aside className="bg-sidebar text-sidebar-foreground relative flex h-full w-72 flex-col p-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <Link
                to="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3"
              >
                <span className="bg-accent text-accent-foreground grid size-9 place-items-center rounded-xl font-bold">
                  H
                </span>
                <span className="text-lg font-semibold tracking-tight">Havenly</span>
              </Link>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Close navigation"
                onClick={() => setMobileMenuOpen(false)}
              >
                <X size={20} />
              </Button>
            </div>

            <nav className="mt-8 flex flex-col gap-1">
              <p className="text-sidebar-foreground/70 px-3 pb-2 text-[10px] font-bold tracking-[.18em] uppercase">
                Workspace
              </p>
              {NAV_ITEMS.map(({ label, href, icon: Icon }) => (
                <Link
                  key={label}
                  to={href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm transition ${
                    pathname === href
                      ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                      : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                  }`}
                >
                  <Icon size={18} />
                  <span>{label}</span>
                </Link>
              ))}
            </nav>

            <div className="border-sidebar-border mt-auto border-t pt-4">
              <div className="mb-4">
                <ThemeToggleSwitch />
              </div>
              <p className="truncate text-sm font-medium">{user.name}</p>
              <p className="text-sidebar-foreground/70 truncate text-xs">{user.email}</p>
              <button
                onClick={handleLogout}
                className="text-sidebar-foreground/70 hover:text-sidebar-foreground mt-4 flex items-center gap-2 text-sm"
              >
                <LogOut size={16} />
                Sign out
              </button>
            </div>
          </aside>
        </div>
      )}
    </>
  );
}
