"use client";

import React, { useState } from 'react';
import { RolePermission, ActionCapability, User } from '@/lib/storeData';
import { Table } from '@/components/ui/Table';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Edit3, X, Shield, Search, Plus, Trash2, Lock, Sparkles, Check } from 'lucide-react';

interface RolePermissionsTabProps {
  rolePermissions: RolePermission[];
  onSaveRolePermission: (role: string, payload: { modules?: string[]; permissions?: Record<string, ActionCapability>; newRoleName?: string }) => void;
  onDeleteRolePermission?: (role: string) => void;
}

// Fixed system roles in Purchase Store ERP
export const FIXED_SYSTEM_ROLES = [
  { role: 'Admin', description: 'Complete system control, user administration, & full override permissions' },
  { role: 'Requester', description: 'Site engineer / user raising Purchase Requests (PR) and tracking inventory' },
  { role: 'Approver', description: 'Authorizer approving/rejecting PRs, POs, and Payment Requests' },
  { role: 'Purchase', description: 'Procurement team generating POs, managing vendors, and materials' },
  { role: 'Store', description: 'Storekeeper managing material inward (GRN), inventory, and outward issues' },
  { role: 'Accounts', description: 'Finance team managing vendor invoices/bills and payment disbursements' },
  { role: 'Management', description: 'Executive team reviewing audit trails, KPIs, and reports' }
];

export const PERMISSION_FEATURES = [
  'Purchase Requests',
  'Purchase Orders',
  'Goods Receipt (GRN)',
  'Store Outward',
  'Stock',
  'Vendor Invoices',
  'Payment Requests',
  'Payment Entries',
  'Product',
  'Category',
  'User',
  'Department Management',
  'Leads',
  'Lead Statuses',
  'Lead Sources',
  'City Master',
  'Reports'
];

export function RolePermissionsTab({
  rolePermissions,
  onSaveRolePermission,
  onDeleteRolePermission
}: RolePermissionsTabProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [editModalRole, setEditModalRole] = useState<RolePermission | null>(null);
  const [showAddRoleModal, setShowAddRoleModal] = useState(false);
  const [currentPerms, setCurrentPerms] = useState<Record<string, ActionCapability>>({});

  // Add Role Form State
  const [newRoleForm, setNewRoleForm] = useState({
    role: '',
    name: ''
  });
  const [addRoleErrors, setAddRoleErrors] = useState<Record<string, string>>({});

  // Merge dynamic roles with fixed system roles
  const allRolesMap = new Map<string, { role: string; description?: string; modules: string[]; permissions: Record<string, ActionCapability>; isSystemRole?: boolean }>();

  // Add default system roles
  FIXED_SYSTEM_ROLES.forEach(fixed => {
    allRolesMap.set(fixed.role.toLowerCase(), {
      role: fixed.role,
      modules: [],
      permissions: {},
      isSystemRole: true
    });
  });

  // Overlay / add all roles from rolePermissions state
  rolePermissions.forEach(rp => {
    const key = (rp.role || '').toLowerCase();
    if (!key) return;
    const existing = allRolesMap.get(key);
    allRolesMap.set(key, {
      role: rp.name || rp.role,
      modules: rp.modules || existing?.modules || [],
      permissions: rp.permissions || existing?.permissions || {},
      isSystemRole: rp.isSystemRole ?? existing?.isSystemRole ?? false
    });
  });

  const displayRoles = Array.from(allRolesMap.values()).filter(r =>
    r.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleOpenEdit = (rp: RolePermission & { description?: string }) => {
    const existingPerms: Record<string, ActionCapability> = {};
    const isAdmin = rp.role === 'Admin';
    PERMISSION_FEATURES.forEach(f => {
      if (isAdmin) {
        existingPerms[f] = {
          viewGlobal: true,
          viewOwn: false,
          create: true,
          update: true,
          delete: true,
        };
      } else {
        const p = rp.permissions?.[f] || {};
        existingPerms[f] = {
          viewGlobal: !!p.viewGlobal,
          viewOwn: !p.viewGlobal && !!p.viewOwn,
          create: !!p.create,
          update: !!p.update,
          delete: !!p.delete,
        };
      }
    });
    setCurrentPerms(existingPerms);
    setEditModalRole(rp);
  };

  const toggleCapability = (feature: string, cap: keyof ActionCapability) => {
    if (editModalRole?.role === 'Admin') return;

    setCurrentPerms(prev => {
      const featPerm = prev[feature] || { viewGlobal: false, viewOwn: false, create: false, update: false, delete: false };
      const nextPerm = { ...featPerm };

      if (cap === 'viewGlobal') {
        const nextVal = !featPerm.viewGlobal;
        nextPerm.viewGlobal = nextVal;
        if (nextVal) nextPerm.viewOwn = false;
      } else if (cap === 'viewOwn') {
        const nextVal = !featPerm.viewOwn;
        nextPerm.viewOwn = nextVal;
        if (nextVal) nextPerm.viewGlobal = false;
      } else {
        nextPerm[cap] = !featPerm[cap];
      }

      return {
        ...prev,
        [feature]: nextPerm
      };
    });
  };

  const handleSaveModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editModalRole) return;

    if (editModalRole.role === 'Admin') {
      setEditModalRole(null);
      return;
    }

    onSaveRolePermission(editModalRole.role, {
      permissions: currentPerms,
      modules: editModalRole.modules || ['dashboard']
    });

    setEditModalRole(null);
  };

  const handleCreateNewRole = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};
    if (!newRoleForm.role?.trim()) errors.role = 'Role code / identifier is required';
    if (!newRoleForm.name?.trim()) errors.name = 'Role display name is required';

    const normalizedRole = newRoleForm.role.trim().replace(/\s+/g, '');
    if (allRolesMap.has(normalizedRole.toLowerCase())) {
      errors.role = 'A role with this identifier already exists';
    }

    if (Object.keys(errors).length > 0) {
      setAddRoleErrors(errors);
      return;
    }

    // Default initial permissions (blank)
    const initialPerms: Record<string, ActionCapability> = {};
    PERMISSION_FEATURES.forEach(f => {
      initialPerms[f] = { viewGlobal: false, viewOwn: false, create: false, update: false, delete: false };
    });

    onSaveRolePermission(normalizedRole, {
      newRoleName: newRoleForm.name.trim(),
      permissions: initialPerms,
      modules: ['dashboard']
    });

    setShowAddRoleModal(false);
    setNewRoleForm({ role: '', name: '' });
    setAddRoleErrors({});
  };

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative min-w-[260px] max-w-sm flex-1">
          <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search role..."
            className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-white border border-slate-200 text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/10 transition-all shadow-2xs"
          />
        </div>

        <Button
          variant="primary"
          icon={<Plus className="h-4 w-4" />}
          onClick={() => {
            setNewRoleForm({ role: '', name: '' });
            setAddRoleErrors({});
            setShowAddRoleModal(true);
          }}
        >
          Add New Role
        </Button>
      </div>

      {/* Roles Table */}
      <Table
        headers={['Role Name', 'Capability Status', 'Actions']}
        data={displayRoles}
        itemsPerPage={10}
        emptyMessage="No system roles found."
        renderRow={(rp, idx) => {
          const permCount = Object.values(rp.permissions || {}).reduce((acc, cap) => {
            return acc + (cap.viewGlobal ? 1 : 0) + (cap.viewOwn ? 1 : 0) + (cap.create ? 1 : 0) + (cap.update ? 1 : 0) + (cap.delete ? 1 : 0);
          }, 0);
          const isSystem = rp.isSystemRole || FIXED_SYSTEM_ROLES.some(f => f.role.toLowerCase() === rp.role.toLowerCase());

          return (
            <tr key={`${rp.role}-${idx}`} className="hover:bg-slate-50 transition-colors">
              <td className="px-4 py-3 text-xs font-semibold text-slate-900">
                <div className="flex items-center space-x-2.5">
                  <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs">
                    <Shield className="h-3.5 w-3.5" />
                  </div>
                  <span className="font-bold text-[#0F172C]">{rp.role}</span>
                  {rp.role === 'Admin' ? (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
                      Superuser
                    </span>
                  ) : !isSystem ? (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Custom
                    </span>
                  ) : null}
                </div>
              </td>
              <td className="px-4 py-3 text-xs">
                <div className="flex items-center space-x-2">
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200/80">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mr-1.5" />
                    {permCount} Capabilities Enabled
                  </span>
                </div>
              </td>
              <td className="px-4 py-3 text-right">
                <div className="inline-flex items-center space-x-2 justify-end">
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(rp)}
                    className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-all cursor-pointer shadow-xs shadow-blue-600/20"
                  >
                    <Edit3 className="h-3.5 w-3.5" />
                    <span>Configure</span>
                  </button>

                  {!isSystem && onDeleteRolePermission && (
                    <button
                      type="button"
                      onClick={() => {
                        if (confirm(`Are you sure you want to delete custom role "${rp.role}"?`)) {
                          onDeleteRolePermission(rp.role);
                        }
                      }}
                      className="p-1.5 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white border border-rose-200 transition-all cursor-pointer shadow-2xs"
                      title="Delete Custom Role"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </td>
            </tr>
          );
        }}
      />

      {/* Add New Role Modal */}
      {showAddRoleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0F172C]/70 backdrop-blur-xs animate-backdrop-fade">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full p-6 animate-modal-zoom space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
                  <Shield className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-bold text-[#0F172C]">Add New System Role</h3>
              </div>
              <button
                onClick={() => setShowAddRoleModal(false)}
                className="text-slate-400 hover:text-slate-700 font-bold text-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form noValidate onSubmit={handleCreateNewRole} className="space-y-3.5">
              <Input
                label="Role Code / Identifier"
                value={newRoleForm.role}
                onChange={(e) => {
                  setNewRoleForm({
                    ...newRoleForm,
                    role: e.target.value,
                    name: newRoleForm.name === newRoleForm.role ? e.target.value : newRoleForm.name
                  });
                  setAddRoleErrors(prev => ({ ...prev, role: '' }));
                }}
                placeholder="e.g. QualityInspector or SiteSupervisor"
                error={addRoleErrors.role}
                required
              />

              <Input
                label="Display Role Name"
                value={newRoleForm.name}
                onChange={(e) => {
                  setNewRoleForm({ ...newRoleForm, name: e.target.value });
                  setAddRoleErrors(prev => ({ ...prev, name: '' }));
                }}
                placeholder="e.g. Quality Inspector"
                error={addRoleErrors.name}
                required
              />

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
                <Button variant="secondary" onClick={() => setShowAddRoleModal(false)}>
                  Cancel
                </Button>
                <Button variant="primary" type="submit">
                  Save Role
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Granular Permission Matrix Modal */}
      {editModalRole && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0F172C]/75 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-4xl w-full flex flex-col max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-[#0F172C] via-[#1E293B] to-[#0F172C] text-white px-6 py-4 flex items-center justify-between flex-shrink-0 border-b border-slate-800">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-400">
                  <Shield className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold tracking-tight text-white flex items-center space-x-2">
                    <span>Edit Role Permissions:</span>
                    <span className="text-blue-400 font-extrabold">{editModalRole.role}</span>
                  </h3>
                  <p className="text-[11px] text-slate-300 mt-0.5">Toggle checkboxes to enable or restrict specific features &amp; action buttons</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditModalRole(null)}
                className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Modal Body */}
            <form noValidate onSubmit={handleSaveModal} className="flex-1 flex flex-col overflow-hidden">
              <div className="p-6 space-y-5 overflow-y-auto flex-1 bg-slate-50/40">
                {/* Role Header Info */}
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <span className="text-xs font-semibold text-slate-500">Target Role</span>
                    <h4 className="text-sm font-bold text-[#0F172C]">{editModalRole.role}</h4>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={() => {
                        const newPerms: Record<string, ActionCapability> = {};
                        PERMISSION_FEATURES.forEach(f => {
                          newPerms[f] = { viewGlobal: true, viewOwn: true, create: true, update: true, delete: true };
                        });
                        setCurrentPerms(newPerms);
                      }}
                      className="px-3 py-1 rounded-lg text-xs font-semibold bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 transition-colors cursor-pointer"
                    >
                      Grant All
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const newPerms: Record<string, ActionCapability> = {};
                        PERMISSION_FEATURES.forEach(f => {
                          newPerms[f] = { viewGlobal: false, viewOwn: false, create: false, update: false, delete: false };
                        });
                        setCurrentPerms(newPerms);
                      }}
                      className="px-3 py-1 rounded-lg text-xs font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200 transition-colors cursor-pointer"
                    >
                      Clear All
                    </button>
                  </div>
                </div>

                {/* Permissions Grid Table */}
                <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
                  {editModalRole.role === 'Admin' && (
                    <div className="bg-purple-50 border-b border-purple-200 px-5 py-3 flex items-center justify-between text-xs text-purple-800 font-medium">
                      <span className="flex items-center space-x-2">
                        <Shield className="h-4 w-4 text-purple-600" />
                        <span><strong>Admin Superuser:</strong> All permissions and action capabilities are permanently enabled by default.</span>
                      </span>
                      <span className="px-2 py-0.5 rounded bg-purple-200/70 text-purple-900 font-bold text-[10px]">LOCKED</span>
                    </div>
                  )}
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                          <th className="px-5 py-3 w-1/3">Feature / Module</th>
                          <th className="px-5 py-3">Granted Action Capabilities</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {PERMISSION_FEATURES.map((feature) => {
                          const cap = currentPerms[feature] || {};
                          const isReportOnly = feature === 'Reports';
                          const isAdminRole = editModalRole.role === 'Admin';

                          return (
                            <tr key={feature} className="hover:bg-blue-50/30 transition-colors">
                              <td className="px-5 py-3 font-semibold text-slate-800 text-xs">
                                <span className="inline-block px-2 py-0.5 rounded bg-slate-100 text-slate-800 font-medium text-[11px] mr-2">
                                  {feature}
                                </span>
                              </td>
                              <td className="px-5 py-3">
                                <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
                                  {/* View Global */}
                                  <label className={`inline-flex items-center space-x-1.5 select-none text-slate-700 text-xs ${isAdminRole ? 'cursor-not-allowed opacity-80' : 'cursor-pointer hover:text-slate-900'}`}>
                                    <input
                                      type="checkbox"
                                      disabled={isAdminRole}
                                      checked={!!cap.viewGlobal}
                                      onChange={() => toggleCapability(feature, 'viewGlobal')}
                                      className="w-4 h-4 rounded border-slate-300 text-blue-600 accent-blue-600 focus:ring-0 cursor-pointer disabled:cursor-not-allowed"
                                    />
                                    <span>View (Global)</span>
                                  </label>

                                  {/* View Own */}
                                  {!isReportOnly && (
                                    <label className={`inline-flex items-center space-x-1.5 select-none text-slate-700 text-xs ${isAdminRole ? 'cursor-not-allowed opacity-80' : 'cursor-pointer hover:text-slate-900'}`}>
                                      <input
                                        type="checkbox"
                                        disabled={isAdminRole}
                                        checked={!!cap.viewOwn}
                                        onChange={() => toggleCapability(feature, 'viewOwn')}
                                        className="w-4 h-4 rounded border-slate-300 text-blue-600 accent-blue-600 focus:ring-0 cursor-pointer disabled:cursor-not-allowed"
                                      />
                                      <span>View (Own)</span>
                                    </label>
                                  )}

                                  {/* Create */}
                                  {!isReportOnly && (
                                    <label className={`inline-flex items-center space-x-1.5 select-none text-xs ${isAdminRole ? 'cursor-not-allowed opacity-80' : 'cursor-pointer hover:text-blue-900'}`}>
                                      <input
                                        type="checkbox"
                                        disabled={isAdminRole}
                                        checked={!!cap.create}
                                        onChange={() => toggleCapability(feature, 'create')}
                                        className="w-4 h-4 rounded border-slate-300 text-blue-600 accent-blue-600 focus:ring-0 cursor-pointer disabled:cursor-not-allowed"
                                      />
                                      <span className={`font-bold ${cap.create ? 'text-blue-700' : 'text-slate-700'}`}>Create</span>
                                    </label>
                                  )}

                                  {/* Update */}
                                  {!isReportOnly && (
                                    <label className={`inline-flex items-center space-x-1.5 select-none text-slate-700 text-xs ${isAdminRole ? 'cursor-not-allowed opacity-80' : 'cursor-pointer hover:text-slate-900'}`}>
                                      <input
                                        type="checkbox"
                                        disabled={isAdminRole}
                                        checked={!!cap.update}
                                        onChange={() => toggleCapability(feature, 'update')}
                                        className="w-4 h-4 rounded border-slate-300 text-blue-600 accent-blue-600 focus:ring-0 cursor-pointer disabled:cursor-not-allowed"
                                      />
                                      <span>Update</span>
                                    </label>
                                  )}

                                  {/* Delete */}
                                  {!isReportOnly && (
                                    <label className={`inline-flex items-center space-x-1.5 select-none text-slate-700 text-xs ${isAdminRole ? 'cursor-not-allowed opacity-80' : 'cursor-pointer hover:text-slate-900'}`}>
                                      <input
                                        type="checkbox"
                                        disabled={isAdminRole}
                                        checked={!!cap.delete}
                                        onChange={() => toggleCapability(feature, 'delete')}
                                        className="w-4 h-4 rounded border-slate-300 text-blue-600 accent-blue-600 focus:ring-0 cursor-pointer disabled:cursor-not-allowed"
                                      />
                                      <span>Delete</span>
                                    </label>
                                  )}
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="border-t border-slate-200 px-6 py-4 bg-white flex items-center justify-end space-x-3 flex-shrink-0">
                <button
                  type="button"
                  onClick={() => setEditModalRole(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-all cursor-pointer shadow-2xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-bold transition-all cursor-pointer shadow-xs shadow-blue-600/20"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
