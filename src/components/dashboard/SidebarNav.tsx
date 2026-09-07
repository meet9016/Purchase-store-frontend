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
  ShoppingBag
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
}

export function SidebarNav({
  activeTab,
  setActiveTab,
  currentUser,
  rolePermissions,
  onLogout,
  unreadNotificationsCount
}: SidebarProps) {
  const currentRole = currentUser?.role || 'Admin';
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

  const isTabVisible = (tabId: SidebarTab): boolean => {
    if (currentRole === 'Admin') return true;
    if (tabId === 'dashboard' || tabId === 'notifications') return true;
    if (tabId === 'permissions' || tabId === 'audit') return false; // Admin/Management only

    const featureName = tabFeatureMap[tabId];
    if (featureName && rolePerm && rolePerm.permissions) {
      const p = rolePerm.permissions[featureName];
      // If neither viewGlobal nor viewOwn is selected, the module is hidden!
      return !!(p?.viewGlobal || p?.viewOwn);
    }

    // Default fallback to allowedModules if no granular perm defined
    const allowedModules = rolePerm?.modules || ['dashboard', 'pr', 'po', 'stock'];
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
    { id: 'audit', label: 'Audit Trail', icon: <History className="h-4.5 w-4.5" /> },
    { id: 'notifications', label: 'Alerts & Notifications', icon: <Bell className="h-4.5 w-4.5" />, badge: unreadNotificationsCount },
    { id: 'permissions', label: 'Roles & Access', icon: <Sliders className="h-4.5 w-4.5" /> },
  ];

  return (
    <aside className="w-64 bg-white border-r border-slate-200/90 flex flex-col h-screen sticky top-0 flex-shrink-0 z-30 select-none">
      {/* Brand Header */}
      <div className="px-5 py-4 border-b border-slate-100 flex items-center space-x-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-600/20 flex items-center justify-center flex-shrink-0">
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

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-0.5">
        <p className="px-3 pb-2 text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
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
              onClick={() => setActiveTab(item.id)}
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
              {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : 'A'}
            </div>
            <div className="truncate min-w-0">
              <p className="text-xs font-bold text-[#0F172C] truncate leading-tight">
                {currentUser?.name || 'Alok Sharma'}
              </p>
              <span className="inline-block text-[10px] font-bold text-blue-600 uppercase tracking-wide leading-none mt-0.5">
                {currentRole}
              </span>
            </div>
          </div>

          {/* Logout Action Button */}
          <button
            type="button"
            onClick={onLogout}
            title="Sign Out"
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all cursor-pointer flex-shrink-0"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
