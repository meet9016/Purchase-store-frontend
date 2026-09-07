"use client";

import React from 'react';
import { Project, User } from '@/lib/storeData';
import { Select } from '@/components/ui/Select';
import { Search, Bell, Building, Sliders, X, Shield } from 'lucide-react';
import { SidebarTab } from './SidebarNav';

interface HeaderNavProps {
  currentUser: User | null;
  projects: Project[];
  globalSearch: string;
  setGlobalSearch: (val: string) => void;
  filterProject: string;
  setFilterProject: (val: string) => void;
  activeTab: SidebarTab;
  setActiveTab: (tab: SidebarTab) => void;
  unreadNotificationsCount: number;
  navLayout: 'sidebar' | 'header';
  setNavLayout: (layout: 'sidebar' | 'header') => void;
  rolePermissions: any[];
  simulateRole: (role: string) => void;
  onOpenCreatePRModal?: () => void;
}

export function HeaderNav({
  currentUser,
  projects,
  globalSearch,
  setGlobalSearch,
  filterProject,
  setFilterProject,
  activeTab,
  setActiveTab,
  unreadNotificationsCount,
  navLayout,
  setNavLayout,
  rolePermissions,
  simulateRole
}: HeaderNavProps) {
  const FIXED_ROLES = ['Admin', 'Requester', 'Purchase', 'Store', 'Accounts', 'Management'];
  const roles = Array.from(new Set([...FIXED_ROLES, ...rolePermissions.map(rp => rp.role).filter(Boolean)]));

  const projectOptions = [
    { value: '', label: 'All Projects' },
    ...projects.map(p => ({ value: p.id, label: p.name }))
  ];

  const roleOptions = roles.map(r => ({ value: r, label: r }));

  return (
    <header className="bg-white border-b border-slate-200/90 px-6 py-2.5 sticky top-0 z-20 shadow-xs flex flex-wrap items-center justify-between gap-3.5">
      <div className="flex items-center space-x-3 flex-1 min-w-[280px] max-w-2xl">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={globalSearch}
            onChange={(e) => setGlobalSearch(e.target.value)}
            placeholder="Search PR, PO, Item, GRN, Bill or Vendor..."
            className="w-full pl-10 pr-4 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-sm font-semibold text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-blue-600 focus:bg-white focus:ring-2 focus:ring-blue-600/10 transition-all shadow-xs"
          />
          {globalSearch && (
            <button
              type="button"
              onClick={() => setGlobalSearch('')}
              className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-700 cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <div className="w-[190px] flex-shrink-0">
          <Select
            options={projectOptions}
            value={filterProject}
            onChange={(e) => setFilterProject(e.target.value)}
            icon={<Building className="h-4 w-4 text-blue-600" />}
            size="sm"
          />
        </div>
      </div>
      <div className="flex items-center space-x-2.5">
        {/* Current User Role Badge (Read-only Display) */}
        <div className="flex items-center space-x-1.5 px-3 py-1.5 bg-blue-50/80 border border-blue-200/80 rounded-xl text-xs font-semibold text-blue-800 shadow-2xs">
          <Shield className="h-3.5 w-3.5 text-blue-600 flex-shrink-0" />
          <span className="truncate max-w-[120px] font-medium">{currentUser?.role || 'Admin'}</span>
        </div>
        <button
          type="button"
          onClick={() => setNavLayout(navLayout === 'sidebar' ? 'header' : 'sidebar')}
          title="Toggle Navigation Layout"
          className="p-2 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition-all cursor-pointer shadow-xs"
        >
          <Sliders className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('notifications')}
          title="Alerts & Notifications"
          className="relative p-2 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition-all cursor-pointer shadow-xs"
        >
          <Bell className="h-4 w-4 text-slate-700" />
          {unreadNotificationsCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white font-bold text-[10px] flex items-center justify-center animate-pulse">
              {unreadNotificationsCount}
            </span>
          )}
        </button>
      </div>
    </header>
  );
}
