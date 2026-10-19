"use client";

import React from 'react';
import { User, RolePermission } from '@/lib/storeData';
import { FeatureName } from '@/lib/permissions';
import {
  LayoutDashboard,
  Database,
  FileSpreadsheet,
  FileCheck,
  Package,
  Layers,
  ArrowDownLeft,
  ArrowUpRight,
  CreditCard,
  History,
  Bell,
  LogOut,
  Sliders,
  ShoppingBag,
  X
} from 'lucide-react';

export type SidebarTab =
  | 'dashboard'
  | 'masters'
  | 'pr'
  | 'po'
  | 'grn'
  | 'stock'
  | 'outward'
  | 'bills'
  | 'payment-req'
  | 'payments'
  | 'reports'
  | 'audit'
  | 'notifications'
  | 'permissions';

interface SidebarProps {
  activeTab: SidebarTab;
  setActiveTab: (tab: SidebarTab) => void;
  currentUser: User | null;
  rolePermissions: RolePermission[];
  onLogout: () => void;
  unreadNotificationsCount: number;
  isMobileNavOpen?: boolean;
  onCloseMobile?: () => void;
}

export function SidebarNav({
  activeTab,
  setActiveTab,
  currentUser,
  rolePermissions,
  onLogout,
  unreadNotificationsCount,
  isMobileNavOpen = false,
  onCloseMobile
}: SidebarProps) {
  const currentRole = currentUser?.role || '';
  const rolePerm = rolePermissions.find(rp => rp.role.toLowerCase() === currentRole.toLowerCase());

  // Mapping from SidebarTab to FeatureName in Permission Matrix
  const tabFeatureMap: Partial<Record<SidebarTab, FeatureName>> = {
    masters: 'Product',
    pr: 'Purchase Requests',
    po: 'Purchase Orders',
    grn: 'Goods Receipt (GRN)',
    stock: 'Stock',
    outward: 'Store Outward',
    bills: 'Vendor Invoices',
    'payment-req': 'Payment Requests',
    payments: 'Payment Entries',
    reports: 'Reports',
  };

  const DEFAULT_ROLE_MODULES: Record<string, SidebarTab[]> = {
    Admin: ['dashboard', 'masters', 'pr', 'po', 'grn', 'stock', 'outward', 'bills', 'payment-req', 'payments', 'reports', 'audit', 'notifications', 'permissions'],
    Purchase: ['dashboard', 'masters', 'pr', 'po', 'grn', 'reports', 'notifications'],
    Store: ['dashboard', 'grn', 'stock', 'outward', 'reports', 'notifications'],
    Accounts: ['dashboard', 'bills', 'payment-req', 'payments', 'reports', 'notifications'],
    Approver: ['dashboard', 'pr', 'po', 'payment-req', 'reports', 'notifications'],
    Requester: ['dashboard', 'pr', 'stock', 'reports', 'notifications'],
    Management: ['dashboard', 'reports', 'audit', 'notifications'],
  };

  const isTabVisible = (tabId: SidebarTab): boolean => {
    if (currentRole === 'Admin') return true;
    if (tabId === 'dashboard' || tabId === 'notifications') return true;
    if (tabId === 'permissions' || tabId === 'audit') return false; // Admin/Management only

    const featureName = tabFeatureMap[tabId];
    if (featureName && rolePerm && rolePerm.permissions && Object.keys(rolePerm.permissions).length > 0) {
      const p = rolePerm.permissions[featureName];
      if (p) {
        return !!(p.viewGlobal || p.viewOwn);
      }
    }

    // Fallback to allowedModules or system defaults for standard roles
    const allowedModules = (rolePerm?.modules && rolePerm.modules.length > 0)
      ? rolePerm.modules
      : (DEFAULT_ROLE_MODULES[currentRole] || ['dashboard', 'pr', 'stock', 'reports']);
    return allowedModules.includes(tabId);
  };

  const menuItems: { id: SidebarTab; label: string; icon: React.ReactNode; badge?: number }[] = [
    { id: 'dashboard', label: 'Overview', icon: <LayoutDashboard className="h-4.5 w-4.5" /> },
    { id: 'masters', label: 'Master Management', icon: <Database className="h-4.5 w-4.5" /> },
    { id: 'pr', label: 'Purchase Requests', icon: <FileSpreadsheet className="h-4.5 w-4.5" /> },
    { id: 'po', label: 'Purchase Orders', icon: <FileCheck className="h-4.5 w-4.5" /> },
    { id: 'grn', label: 'GRN / Inward', icon: <ArrowDownLeft className="h-4.5 w-4.5" /> },
    { id: 'stock', label: 'Inventory Stock', icon: <Package className="h-4.5 w-4.5" /> },
    { id: 'outward', label: 'Store Outward', icon: <ArrowUpRight className="h-4.5 w-4.5" /> },
    { id: 'bills', label: 'Vendor Bills', icon: <Layers className="h-4.5 w-4.5" /> },
    { id: 'payment-req', label: 'Payment Requests', icon: <CreditCard className="h-4.5 w-4.5" /> },
    { id: 'payments', label: 'Payment Entries', icon: <CreditCard className="h-4.5 w-4.5" /> },
    { id: 'reports', label: 'Store Reports', icon: <FileSpreadsheet className="h-4.5 w-4.5" /> },
    { id: 'permissions', label: 'Roles & Access', icon: <Sliders className="h-4.5 w-4.5" /> },
  ];

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isMobileNavOpen && (
        <div
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-40 lg:hidden transition-opacity duration-300"
          onClick={onCloseMobile}
        />
      )}

      <aside
        className={`w-64 max-w-[85vw] bg-white border-r border-slate-200/90 flex flex-col h-screen fixed lg:sticky top-0 left-0 z-50 select-none transition-transform duration-300 ease-in-out shrink-0 ${
          isMobileNavOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Brand Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white shadow-md shadow-blue-600/20 flex items-center justify-center flex-shrink-0">
              <ShoppingBag className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-base font-black tracking-tight text-[#0F172C] leading-tight">
                Purchase Store
              </h1>
              <p className="text-[11px] font-semibold text-slate-400 leading-tight">
                Procurement &amp; Store
              </p>
            </div>
          </div>

          {/* Close button on mobile drawer */}
          <button
            type="button"
            onClick={onCloseMobile}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            title="Close navigation"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation Links */}
        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-0.5">
          <p className="px-3 pb-2 text-xs font-bold text-slate-500">
            Main Modules
          </p>

          {menuItems.map((item) => {
            const isAllowed = isTabVisible(item.id);
            if (!isAllowed) return null;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setActiveTab(item.id);
                  onCloseMobile?.();
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm transition-all cursor-pointer ${
                  isActive
                    ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-600/20'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 font-semibold'
                }`}
              >
                <div className="flex items-center space-x-2.5 truncate">
                  <span className={`flex-shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`}>
                    {item.icon}
                  </span>
                  <span className="truncate">{item.label}</span>
                </div>
                {item.badge && item.badge > 0 && (
                  <span className="flex-shrink-0 ml-2 px-1.5 py-0.5 rounded-full bg-rose-500 text-white font-bold text-[10px]">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Modern Unified User Profile & Logout Footer Card */}
        <div className="p-3 border-t border-slate-100 bg-slate-50/60">
          <div className="flex items-center justify-between p-2 rounded-xl bg-white border border-slate-200/80 shadow-xs">
            <div className="flex items-center space-x-2.5 truncate min-w-0 pr-1">
              <div className="w-8 h-8 rounded-lg bg-blue-600 text-white font-bold text-xs flex items-center justify-center flex-shrink-0 shadow-xs">
                {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : (currentUser?.email ? currentUser.email.charAt(0).toUpperCase() : 'U')}
              </div>
              <div className="truncate min-w-0">
                <p className="text-xs font-bold text-[#0F172C] truncate leading-tight">
                  {currentUser?.name || currentUser?.email || 'User'}
                </p>
                <span className="inline-block text-xs font-semibold text-blue-600 leading-none mt-0.5 capitalize">
                  {currentRole}
                </span>
              </div>
            </div>

            {/* Logout Action Button */}
            <button
              type="button"
              onClick={() => {
                onLogout();
                onCloseMobile?.();
              }}
              title="Sign Out"
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all cursor-pointer flex-shrink-0"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}