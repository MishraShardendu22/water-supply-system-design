"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type React from "react";
import { useEffect, useState } from "react";
import { useAuth } from "../../lib/auth/AuthContext";
import type { UserRole } from "../../lib/types";

interface NavItem {
  label: string;
  shortLabel: string;
  href: string;
  roles: UserRole[];
}

const NAV_ITEMS: NavItem[] = [
  {
    label: "Admin Dashboard",
    shortLabel: "DB",
    href: "/dashboard",
    roles: ["Admin"],
  },
  {
    label: "Requests Queue",
    shortLabel: "RQ",
    href: "/requests",
    roles: ["Admin", "DistrictManager"],
  },
  {
    label: "Driver Operations",
    shortLabel: "DR",
    href: "/driver-dashboard",
    roles: ["Driver"],
  },
  {
    label: "District Manager Area",
    shortLabel: "DM",
    href: "/district-manager-dashboard",
    roles: ["DistrictManager"],
  },
  { label: "Drivers", shortLabel: "DV", href: "/drivers", roles: ["Admin"] },
  { label: "Vehicles", shortLabel: "VH", href: "/vehicles", roles: ["Admin"] },
  {
    label: "Filling Stations",
    shortLabel: "FS",
    href: "/filling-stations",
    roles: ["Admin"],
  },
  {
    label: "Drop-Off Locations",
    shortLabel: "LOC",
    href: "/locations",
    roles: ["Admin"],
  },
  {
    label: "District Managers",
    shortLabel: "MGR",
    href: "/district-managers",
    roles: ["Admin"],
  },
  {
    label: "Administration",
    shortLabel: "ADM",
    href: "/admins",
    roles: ["Admin"],
  },
];

export const AppShell: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const pathname = usePathname();
  const router = useRouter();
  const { userRole, userName, isAuthenticated, isLoaded, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("sidebar_collapsed");
      if (stored === "true") setIsCollapsed(true);
    }
  }, []);

  const toggleCollapse = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      if (typeof window !== "undefined") {
        localStorage.setItem("sidebar_collapsed", String(next));
      }
      return next;
    });
  };

  // Strict Role Route Guard
  useEffect(() => {
    if (!isLoaded) return;

    if (!isAuthenticated && pathname !== "/login") {
      router.push("/login");
      return;
    }

    if (isAuthenticated) {
      if (userRole === "Driver" && pathname !== "/driver-dashboard") {
        router.push("/driver-dashboard");
      } else if (
        userRole === "DistrictManager" &&
        pathname !== "/district-manager-dashboard" &&
        !pathname.startsWith("/requests")
      ) {
        router.push("/district-manager-dashboard");
      }
    }
  }, [isAuthenticated, isLoaded, userRole, pathname, router]);

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  // Filter navigation links strictly for the user's role
  const visibleNavItems = NAV_ITEMS.filter((item) =>
    item.roles.includes(userRole),
  );

  return (
    <div className="min-h-screen flex bg-[#f9f8f0] text-[#2E2910]">
      {/* Desktop Sidebar with Expand/Collapse State */}
      <aside
        className={`hidden lg:flex flex-col bg-[#2C5745] text-white border-r border-[#1e3d30] transition-all duration-300 ${
          isCollapsed ? "w-20" : "w-64"
        }`}
      >
        {/* Sidebar Header */}
        <div className="p-4 border-b border-[#3d725c] flex items-center justify-between">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-10 h-10 shrink-0 rounded-lg bg-[#EB7D00] flex items-center justify-center text-xl font-black text-white shadow">
              W
            </div>
            {!isCollapsed && (
              <div className="truncate">
                <h1 className="font-bold text-base tracking-wide text-[#EBE3A7]">
                  MUNI WATER
                </h1>
                <p className="text-[11px] text-emerald-200 truncate">
                  District Supply System
                </p>
              </div>
            )}
          </div>

          <button
            onClick={toggleCollapse}
            title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
            className="p-1.5 rounded-lg bg-[#3d725c] hover:bg-[#EB7D00] text-white text-xs font-mono font-bold transition-colors"
          >
            {isCollapsed ? ">>" : "<<"}
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
          {visibleNavItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/" && pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                title={item.label}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                  isCollapsed ? "justify-center" : ""
                } ${
                  isActive
                    ? "bg-[#EB7D00] text-white shadow"
                    : "text-[#EBE3A7] hover:bg-[#3d725c] hover:text-white"
                }`}
              >
                <span className="w-6 text-center font-bold font-mono text-xs bg-[#1e3d30]/60 px-1 py-0.5 rounded">
                  {item.shortLabel}
                </span>
                {!isCollapsed && <span className="truncate">{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Footer Profile & Toggle */}
        <div className="p-3 border-t border-[#3d725c] bg-[#1e3d30]/60">
          {!isCollapsed ? (
            <div className="space-y-1">
              <p className="text-[11px] font-semibold text-[#EBE3A7]">
                Logged in as:
              </p>
              <p className="text-xs font-bold text-white truncate">
                {userName || "User"}
              </p>
              <div className="flex items-center justify-between pt-1">
                <span className="px-2 py-0.5 bg-[#EB7D00] text-white text-[10px] font-bold rounded">
                  {userRole}
                </span>
                <button
                  onClick={toggleCollapse}
                  className="text-[10px] font-bold text-[#EBE3A7] hover:underline"
                >
                  Collapse Sidebar
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center space-y-1">
              <span className="inline-block w-8 h-8 rounded-full bg-[#EB7D00] text-white font-bold text-xs leading-8">
                {userRole[0]}
              </span>
              <button
                onClick={toggleCollapse}
                title="Expand Sidebar"
                className="block mx-auto text-[10px] font-mono text-[#EBE3A7] hover:underline"
              >
                Expand
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="bg-white border-b border-[#e2dab0] px-6 py-3 flex items-center justify-between shadow-sm sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden px-3 py-1 rounded bg-[#f4f1db] text-[#2C5745] font-bold text-sm"
              aria-label="Toggle menu"
            >
              MENU
            </button>
            <button
              onClick={toggleCollapse}
              className="hidden lg:flex items-center gap-1.5 px-3 py-1 bg-[#f7f4d9] hover:bg-[#e2dab0] border border-[#dcd499] rounded text-xs font-bold text-[#2C5745] transition-colors"
              title={
                isCollapsed
                  ? "Expand Sidebar Navigation"
                  : "Collapse Sidebar Navigation"
              }
            >
              <span className="font-mono">{isCollapsed ? ">>" : "<<"}</span>
              <span>{isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}</span>
            </button>
            <div>
              <h2 className="text-lg font-bold text-[#2E2910]">
                Water Supply Operations Control
              </h2>
              <p className="text-xs text-[#857c4c]">
                Municipal Distribution & Dispatch Platform
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Role Badge */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-[#f7f4d9] border border-[#dcd499] rounded-full text-xs font-bold text-[#2E2910]">
              <span className="w-2 h-2 rounded-full bg-[#EB7D00]" />
              <span>Role: {userRole}</span>
            </div>

            {/* Profile / Auth Menu */}
            <div className="flex items-center gap-3 pl-3 border-l border-[#e2dab0]">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-bold text-[#2E2910]">
                  {isAuthenticated ? userName : "Not Logged In"}
                </p>
                <p className="text-[10px] text-[#857c4c]">
                  {isAuthenticated ? "Authenticated Session" : "Public Access"}
                </p>
              </div>

              {isAuthenticated ? (
                <button
                  onClick={handleLogout}
                  className="px-3 py-1.5 bg-[#f4f1db] hover:bg-red-50 hover:text-red-700 text-[#58512b] text-xs font-bold rounded-md transition-colors border border-[#dcd499]"
                >
                  Logout
                </button>
              ) : (
                <Link
                  href="/login"
                  className="px-3 py-1.5 bg-[#2C5745] hover:bg-[#3d725c] text-white text-xs font-bold rounded-md shadow transition-colors"
                >
                  Sign In
                </Link>
              )}
            </div>
          </div>
        </header>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-[#2C5745] text-white p-4 space-y-2 border-b border-[#1e3d30]">
            {visibleNavItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-md text-sm font-semibold text-[#EBE3A7] hover:bg-[#3d725c]"
              >
                <span>{item.label}</span>
              </Link>
            ))}
          </div>
        )}

        {/* View Children */}
        <main className="flex-1 p-6 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
};
