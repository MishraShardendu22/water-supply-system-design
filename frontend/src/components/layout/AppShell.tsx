'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '../../lib/auth/AuthContext';
import { UserRole } from '../../lib/types';

interface NavItem {
  label: string;
  href: string;
  icon: string;
  roles?: UserRole[];
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Admin Dashboard', href: '/dashboard', icon: '📊', roles: ['Admin', 'Manager', 'Dispatcher'] },
  { label: 'Requests Queue', href: '/requests', icon: '🚰' },
  { label: 'Driver Operations', href: '/driver-dashboard', icon: '🚛', roles: ['Driver', 'Admin'] },
  { label: 'District Manager Area', href: '/district-manager-dashboard', icon: '🏙️', roles: ['DistrictManager', 'Admin'] },
  { label: 'Drivers', href: '/drivers', icon: '👨‍✈️' },
  { label: 'Vehicles', href: '/vehicles', icon: '🚚' },
  { label: 'Filling Stations', href: '/filling-stations', icon: '⛽' },
  { label: 'Drop-Off Locations', href: '/locations', icon: '📍' },
  { label: 'District Managers', href: '/district-managers', icon: '👔' },
  { label: 'Administration', href: '/admins', icon: '🛡️', roles: ['Admin'] },
];

export const AppShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const pathname = usePathname();
  const router = useRouter();
  const { userRole, userName, setUserRole, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newRole = e.target.value as UserRole;
    setUserRole(newRole);
    if (newRole === 'Driver') {
      router.push('/driver-dashboard');
    } else if (newRole === 'DistrictManager') {
      router.push('/district-manager-dashboard');
    } else {
      router.push('/dashboard');
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <div className="min-h-screen flex bg-[#f9f8f0] text-[#2E2910]">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 bg-[#2C5745] text-white border-r border-[#1e3d30]">
        <div className="p-5 border-b border-[#3d725c]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#EB7D00] flex items-center justify-center text-xl font-bold text-white shadow">
              💧
            </div>
            <div>
              <h1 className="font-bold text-base tracking-wide text-[#EBE3A7]">MUNI WATER</h1>
              <p className="text-[11px] text-emerald-200">District Supply System</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                  isActive
                    ? 'bg-[#EB7D00] text-white shadow'
                    : 'text-[#EBE3A7] hover:bg-[#3d725c] hover:text-white'
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Role Simulation Switcher Footer */}
        <div className="p-4 border-t border-[#3d725c] bg-[#1e3d30]/60">
          <label className="block text-[10px] uppercase font-bold text-[#EBE3A7] tracking-wider mb-1">
            Simulate Active User Role
          </label>
          <select
            value={userRole}
            onChange={handleRoleChange}
            className="w-full text-xs font-semibold px-2.5 py-2 rounded bg-[#2C5745] text-white border border-[#3d725c] focus:ring-2 focus:ring-[#EB7D00] outline-none"
          >
            <option value="Admin">Admin / Operator</option>
            <option value="Driver">Tanker Driver</option>
            <option value="DistrictManager">District Manager</option>
          </select>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="bg-white border-b border-[#e2dab0] px-6 py-3 flex items-center justify-between shadow-sm sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-md bg-[#f4f1db] text-[#2C5745] font-bold text-xl"
              aria-label="Toggle menu"
            >
              ☰
            </button>
            <div>
              <h2 className="text-lg font-bold text-[#2E2910]">
                Water Tanker Operations Control
              </h2>
              <p className="text-xs text-[#857c4c]">Municipal Distribution & Dispatch Platform</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Role Badge */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-[#f7f4d9] border border-[#dcd499] rounded-full text-xs font-bold text-[#2E2910]">
              <span className="w-2 h-2 rounded-full bg-[#EB7D00] animate-pulse" />
              <span>Role: {userRole}</span>
            </div>

            {/* Profile Menu */}
            <div className="flex items-center gap-3 pl-3 border-l border-[#e2dab0]">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-bold text-[#2E2910]">{userName}</p>
                <p className="text-[10px] text-[#857c4c]">Municipal Officer</p>
              </div>
              <button
                onClick={handleLogout}
                className="px-3 py-1.5 bg-[#f4f1db] hover:bg-red-50 hover:text-red-700 text-[#58512b] text-xs font-bold rounded-md transition-colors border border-[#dcd499]"
              >
                Logout
              </button>
            </div>
          </div>
        </header>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-[#2C5745] text-white p-4 space-y-2 border-b border-[#1e3d30]">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-semibold text-[#EBE3A7] hover:bg-[#3d725c]"
              >
                <span>{item.icon}</span>
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
