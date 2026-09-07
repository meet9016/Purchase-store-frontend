"use client";

import React from 'react';
import { AuditLog, Notification, RolePermission } from '@/lib/storeData';
import { Table } from '@/components/ui/Table';
import { ShieldCheck, History, Bell, Sliders, CheckCircle2, Lock, Check } from 'lucide-react';

interface AuditLogsTabProps {
  auditLogs: AuditLog[];
}

export function AuditLogsTab({ auditLogs }: AuditLogsTabProps) {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center space-x-3 bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
        <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
          <History className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-[#0F172C]">System Audit Logs &amp; Activity Trail</h2>
          <p className="text-xs text-slate-500 font-medium">Immutable real-time audit ledger of all procurement and inventory events</p>
        </div>
      </div>

      <Table
        headers={['Timestamp', 'User', 'Action', 'Module', 'Description']}
        data={auditLogs}
        itemsPerPage={15}
        emptyMessage="No audit logs recorded yet."
        renderRow={(log) => (
          <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
            <td className="px-4 py-2.5 text-xs font-mono text-slate-500 whitespace-nowrap">
              {new Date(log.timestamp).toLocaleString('en-IN', {
                day: '2-digit', month: 'short', year: 'numeric',
                hour: '2-digit', minute: '2-digit', second: '2-digit'
              })}
            </td>
            <td className="px-4 py-2.5 text-xs font-medium text-slate-800">{log.userName || log.userId}</td>
            <td className="px-4 py-2.5">
              <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-blue-50 text-blue-700 border border-blue-200/60">
                {log.action}
              </span>
            </td>
            <td className="px-4 py-2.5 text-xs font-normal text-slate-600">{log.module}</td>
            <td className="px-4 py-2.5 text-xs font-normal text-slate-700">{log.newValue || log.oldValue || '-'}</td>
          </tr>
        )}
      />
    </div>
  );
}

interface NotificationsTabProps {
  notifications: Notification[];
  onMarkRead: (id: string) => void;
}

export function NotificationsTab({ notifications, onMarkRead }: NotificationsTabProps) {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center space-x-3 bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
        <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
          <Bell className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-[#0F172C]">Alerts &amp; Notifications Center</h2>
          <p className="text-xs text-slate-500 font-medium">Requisition alerts, approval triggers and stock notifications</p>
        </div>
      </div>

      <div className="space-y-3">
        {notifications.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 shadow-xs">
            <CheckCircle2 className="h-10 w-10 text-emerald-500 mx-auto mb-2" />
            <p className="text-sm font-bold text-[#0F172C]">All Caught Up!</p>
            <p className="text-xs text-slate-400 mt-1">No pending unread alerts or notifications.</p>
          </div>
        ) : (
          notifications.map((notif) => (
            <div
              key={notif.id}
              className={`p-4 rounded-2xl border transition-all flex items-start justify-between gap-4 bg-white ${
                notif.read ? 'border-slate-200/80 opacity-70' : 'border-blue-200/90 shadow-xs ring-1 ring-blue-500/10'
              }`}
            >
              <div className="flex items-start space-x-3.5">
                <div className={`p-2 rounded-xl mt-0.5 ${notif.read ? 'bg-slate-100 text-slate-500' : 'bg-blue-50 text-blue-600'}`}>
                  <Bell className="h-4.5 w-4.5" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h4 className="text-sm font-bold text-[#0F172C]">{notif.title}</h4>
                    {!notif.read && (
                      <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-blue-600 text-white">
                        New
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">{notif.message}</p>
                  <span className="text-[11px] font-medium text-slate-400 mt-2 block">
                    {new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • Role: {notif.recipientRole}
                  </span>
                </div>
              </div>

              {!notif.read && (
                <button
                  type="button"
                  onClick={() => onMarkRead(notif.id)}
                  className="px-3 py-1 text-xs font-semibold text-blue-600 hover:bg-blue-50 rounded-lg border border-blue-200 transition-colors cursor-pointer flex-shrink-0"
                >
                  Mark Read
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

interface RolePermissionsTabProps {
  rolePermissions: RolePermission[];
  onToggleModule: (role: string, module: string) => void;
}

export function RolePermissionsTab({ rolePermissions, onToggleModule }: RolePermissionsTabProps) {
  const modulesList = [
    { id: 'dashboard', label: 'Workspace Overview' },
    { id: 'masters', label: 'Master Management' },
    { id: 'pr', label: 'Purchase Requests' },
    { id: 'po', label: 'Purchase Orders' },
    { id: 'grn', label: 'GRN / Inward' },
    { id: 'stock', label: 'Inventory Stock' },
    { id: 'outward', label: 'Store Outward' },
    { id: 'bills', label: 'Vendor Bills' },
    { id: 'payment-req', label: 'Payment Requests' },
    { id: 'payments', label: 'Payment Entries' },
    { id: 'reports', label: 'Store Reports' },
    { id: 'audit', label: 'Audit Trail' },
    { id: 'notifications', label: 'Alerts & Notifications' },
    { id: 'permissions', label: 'Roles Matrix' }
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center space-x-3 bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
        <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
          <Sliders className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-[#0F172C]">Role Access Control Matrix</h2>
          <p className="text-xs text-slate-500 font-medium">Configure module access permissions for standard system roles</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-xs">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="bg-slate-50/90 text-slate-700 font-bold text-xs border-b border-slate-200">
                <th className="px-6 py-4">Module Name</th>
                {rolePermissions.map((rp) => (
                  <th key={rp.role} className="px-5 py-4 text-center">
                    <span className="inline-block px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-xs font-bold text-[#0F172C] shadow-2xs">
                      {rp.role}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {modulesList.map((mod) => (
                <tr key={mod.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="px-6 py-3.5 font-semibold text-[#0F172C] text-sm">
                    {mod.label}
                  </td>
                  {rolePermissions.map((rp) => {
                    const isEnabled = rp.modules.includes(mod.id);
                    const isAdmin = rp.role === 'Admin';
                    return (
                      <td key={rp.role} className="px-5 py-3.5 text-center">
                        <div className="inline-flex items-center justify-center">
                          {isAdmin ? (
                            <div className="w-6 h-6 rounded-md bg-blue-600 text-white flex items-center justify-center shadow-xs">
                              <Check className="h-4 w-4 stroke-[3]" />
                            </div>
                          ) : (
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                checked={isEnabled}
                                onChange={() => onToggleModule(rp.role, mod.id)}
                                className="w-5 h-5 rounded-md border-slate-300 text-blue-600 accent-blue-600 focus:ring-blue-600/20 focus:ring-2 transition-all cursor-pointer"
                              />
                            </label>
                          )}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
