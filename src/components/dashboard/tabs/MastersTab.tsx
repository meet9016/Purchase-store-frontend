"use client";

import React, { useState } from 'react';
import { User, Project, Vendor, Category, Unit, Item, RolePermission } from '@/lib/storeData';
import { Table } from '@/components/ui/Table';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { DeleteConfirmModal } from '@/components/ui/DeleteConfirmModal';
import { Plus, Users, Building, Truck, Tags, Package, Scale, Edit2, Trash2, Shield, Lock, ShieldCheck } from 'lucide-react';
import { isValidEmail, isValidPhone, formatPhone, isValidGST, formatGST, formatPAN, isValidPAN } from '@/lib/validation';

interface MastersTabProps {
  users: User[];
  projects: Project[];
  vendors: Vendor[];
  categories: Category[];
  units?: Unit[];
  items: Item[];
  roles?: RolePermission[];
  currentUser?: any;
  rolePermissions?: any[];
  
  onAddUser: (user: Omit<User, 'id'>) => void;
  onEditUser?: (id: string, user: Partial<User>) => void;
  onDeleteUser?: (id: string) => void;

  onAddProject: (project: Omit<Project, 'id'>) => void;
  onEditProject?: (id: string, project: Partial<Project>) => void;
  onDeleteProject?: (id: string) => void;

  onAddVendor: (vendor: Omit<Vendor, 'id'>) => void;
  onEditVendor?: (id: string, vendor: Partial<Vendor>) => void;
  onDeleteVendor?: (id: string) => void;

  onAddCategory: (category: Omit<Category, 'id'>) => void;
  onEditCategory?: (id: string, category: Partial<Category>) => void;
  onDeleteCategory?: (id: string) => void;

  onAddUnit?: (unit: Omit<Unit, 'id'>) => void;
  onEditUnit?: (id: string, unit: Partial<Unit>) => void;
  onDeleteUnit?: (id: string) => void;

  onAddItem: (item: Omit<Item, 'id'>) => void;
  onEditItem?: (id: string, item: Partial<Item>) => void;
  onDeleteItem?: (id: string) => void;

  onAddRole?: (role: Partial<RolePermission>) => void;
  onEditRole?: (id: string, role: Partial<RolePermission>) => void;
  onDeleteRole?: (id: string) => void;
}

const DEFAULT_SYSTEM_ROLES = [
  { role: 'Admin', description: 'System Administrator with full system control' },
  { role: 'Requester', description: 'Site Engineer / Requisitioner' },
  { role: 'Approver', description: 'Project Manager / Authorizer' },
  { role: 'PurchaseManager', description: 'Procurement Officer' },
  { role: 'StoreKeeper', description: 'Inventory & Store Controller' },
  { role: 'Accounts', description: 'Finance & Invoice Settlement' },
  { role: 'Auditor', description: 'Read-only compliance & log reviewer' },
  { role: 'Viewer', description: 'General read-only viewer' }
];

export function MastersTab({
  users = [],
  projects = [],
  vendors = [],
  categories = [],
  units = [],
  items = [],
  roles = [],
  currentUser,
  rolePermissions = [],
  onAddUser,
  onEditUser,
  onDeleteUser,
  onAddProject,
  onEditProject,
  onDeleteProject,
  onAddVendor,
  onEditVendor,
  onDeleteVendor,
  onAddCategory,
  onEditCategory,
  onDeleteCategory,
  onAddUnit,
  onEditUnit,
  onDeleteUnit,
  onAddItem,
  onEditItem,
  onDeleteItem,
  onAddRole,
  onEditRole,
  onDeleteRole
}: MastersTabProps) {
  const [subTab, setSubTab] = useState<'items' | 'categories' | 'units' | 'vendors' | 'projects' | 'users' | 'roles'>('items');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const clearError = (field: string) => {
    setFormErrors((prev) => ({ ...prev, [field]: '' }));
  };

  // Check create permission based on current sub-tab
  const canCreateCurrentSubTab = currentUser?.role === 'Admin' || (() => {
    const featureMap: Record<string, string> = {
      items: 'Product',
      categories: 'Category',
      units: 'Category',
      vendors: 'Leads',
      projects: 'Department Management',
      users: 'User',
      roles: 'User',
    };
    const featureName = featureMap[subTab];
    if (!featureName) return true;
    const rp = rolePermissions.find((r: any) => r.role?.toLowerCase() === currentUser?.role?.toLowerCase());
    if (!rp || !rp.permissions || !rp.permissions[featureName]) return true;
    return !!rp.permissions[featureName].create;
  })();

  // Delete Confirmation Modal State
  const [deleteModalState, setDeleteModalState] = useState<{
    isOpen: boolean;
    id: string;
    name: string;
    type: 'item' | 'category' | 'unit' | 'vendor' | 'project' | 'user' | 'role';
  }>({
    isOpen: false,
    id: '',
    name: '',
    type: 'item'
  });

  // Forms
  const [userForm, setUserForm] = useState({ name: '', email: '', role: 'Requester', department: '', active: true, password: '' });
  const [projectForm, setProjectForm] = useState({ name: '', location: '', status: 'Active' as const });
  const [vendorForm, setVendorForm] = useState({
    name: '', contactPerson: '', email: '', phone: '', gstNo: '', panNo: '',
    bankName: '', accountNo: '', ifscCode: '', creditPeriod: 30, address: ''
  });
  const [categoryForm, setCategoryForm] = useState({ name: '', description: '' });
  const [unitForm, setUnitForm] = useState({
    code: '',
    name: '',
    status: 'Active' as 'Active' | 'Inactive'
  });
  const [itemForm, setItemForm] = useState({
    itemCode: '', name: '', categoryId: '', subCategory: '', unit: 'Pcs',
    description: '', minStock: 0, reorderLevel: 0
  });
  const [roleForm, setRoleForm] = useState({
    role: '',
    name: '',
    description: '',
    status: 'Active' as 'Active' | 'Inactive'
  });

  const getSubTabLabel = (tab: string) => {
    switch (tab) {
      case 'items': return 'Item';
      case 'categories': return 'Category';
      case 'units': return 'Unit';
      case 'vendors': return 'Vendor';
      case 'projects': return 'Project';
      case 'users': return 'User';
      case 'roles': return 'Role';
      default: return 'Record';
    }
  };

  const handleOpenAdd = () => {
    setEditingId(null);
    setFormErrors({});
    setUserForm({ name: '', email: '', role: roles?.[0]?.role || 'Requester', department: '', active: true, password: '' });
    setProjectForm({ name: '', location: '', status: 'Active' });
    setVendorForm({ name: '', contactPerson: '', email: '', phone: '', gstNo: '', panNo: '', bankName: '', accountNo: '', ifscCode: '', creditPeriod: 30, address: '' });
    setCategoryForm({ name: '', description: '' });
    setUnitForm({ code: '', name: '', status: 'Active' });
    setItemForm({ itemCode: '', name: '', categoryId: '', subCategory: '', unit: units?.[0]?.code || 'Pcs', description: '', minStock: 0, reorderLevel: 0 });
    setRoleForm({ role: '', name: '', description: '', status: 'Active' });
    setShowModal(true);
  };

  const handleOpenEdit = (item: any) => {
    setEditingId(item.id || item._id || item.role || item.code);
    setFormErrors({});
    if (subTab === 'items') {
      setItemForm({
        itemCode: item.itemCode || '',
        name: item.name || '',
        categoryId: item.categoryId || '',
        subCategory: item.subCategory || '',
        unit: item.unit || 'Pcs',
        description: item.description || '',
        minStock: item.minStock || 0,
        reorderLevel: item.reorderLevel || 0
      });
    } else if (subTab === 'categories') {
      setCategoryForm({
        name: item.name || '',
        description: item.description || ''
      });
    } else if (subTab === 'units') {
      setUnitForm({
        code: item.code || '',
        name: item.name || '',
        status: item.status || 'Active'
      });
    } else if (subTab === 'vendors') {
      setVendorForm({
        name: item.name || '',
        contactPerson: item.contactPerson || '',
        email: item.email || '',
        phone: item.phone || '',
        gstNo: item.gstNo || '',
        panNo: item.panNo || '',
        bankName: item.bankDetails?.bankName || '',
        accountNo: item.bankDetails?.accountNo || '',
        ifscCode: item.bankDetails?.ifscCode || '',
        creditPeriod: item.creditPeriod || 30,
        address: item.address || ''
      });
    } else if (subTab === 'projects') {
      setProjectForm({
        name: item.name || '',
        location: item.location || '',
        status: item.status || 'Active'
      });
    } else if (subTab === 'users') {
      setUserForm({
        name: item.name || '',
        email: item.email || '',
        role: item.role || 'Requester',
        department: item.department || '',
        active: item.active !== false,
        password: ''
      });
    } else if (subTab === 'roles') {
      setRoleForm({
        role: item.role || '',
        name: item.name || item.role || '',
        description: item.description || '',
        status: item.status || 'Active'
      });
    }
    setShowModal(true);
  };

  const handleTriggerDelete = (id: string, name: string, type: 'item' | 'category' | 'unit' | 'vendor' | 'project' | 'user' | 'role') => {
    setDeleteModalState({
      isOpen: true,
      id,
      name,
      type
    });
  };

  const handleConfirmDelete = () => {
    const { id, type } = deleteModalState;
    if (type === 'item' && onDeleteItem) onDeleteItem(id);
    else if (type === 'category' && onDeleteCategory) onDeleteCategory(id);
    else if (type === 'unit' && onDeleteUnit) onDeleteUnit(id);
    else if (type === 'vendor' && onDeleteVendor) onDeleteVendor(id);
    else if (type === 'project' && onDeleteProject) onDeleteProject(id);
    else if (type === 'user' && onDeleteUser) onDeleteUser(id);
    else if (type === 'role' && onDeleteRole) onDeleteRole(id);
    setDeleteModalState(prev => ({ ...prev, isOpen: false }));
  };

  const availableRolesList = (roles && roles.length > 0)
    ? roles
    : DEFAULT_SYSTEM_ROLES.map(r => ({
        id: r.role,
        role: r.role,
        name: r.role,
        description: r.description,
        isSystemRole: true,
        status: 'Active' as const,
        modules: []
      }));

  return (
    <div className="space-y-6">
      {/* Sub-tab Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-2">
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: 'items', label: 'Item Master', icon: <Package className="w-4 h-4" /> },
            { id: 'categories', label: 'Categories', icon: <Tags className="w-4 h-4" /> },
            { id: 'units', label: 'Unit Master', icon: <Scale className="w-4 h-4" /> },
            { id: 'vendors', label: 'Vendors', icon: <Truck className="w-4 h-4" /> },
            { id: 'projects', label: 'Projects', icon: <Building className="w-4 h-4" /> },
            { id: 'users', label: 'Users & Staff', icon: <Users className="w-4 h-4" /> },
            { id: 'roles', label: 'Role Master', icon: <Shield className="w-4 h-4" /> },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setSubTab(tab.id as any)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                subTab === tab.id
                  ? 'bg-blue-600 text-white shadow-xs font-bold'
                  : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200/80 hover:text-slate-900'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {canCreateCurrentSubTab && (
          <Button
            variant="primary"
            icon={<Plus className="w-4 h-4" />}
            onClick={handleOpenAdd}
            className="whitespace-nowrap shrink-0 shadow-sm"
          >
            Add New {getSubTabLabel(subTab)}
          </Button>
        )}
      </div>

      {/* Tables Content */}
      {subTab === 'items' && (
        <Table
          headers={['Item Code', 'Item Name', 'Category', 'Unit', 'Min Stock', 'Reorder Level', 'Actions']}
          data={items}
          itemsPerPage={10}
          emptyMessage="No items registered yet."
          renderRow={(itm) => (
            <tr key={itm.id} className="hover:bg-slate-50 transition-colors">
              <td className="px-4 py-3 font-semibold text-slate-800 text-xs">{itm.itemCode}</td>
              <td className="px-4 py-3 font-semibold text-slate-900 text-xs">{itm.name}</td>
              <td className="px-4 py-3 text-slate-800 text-xs font-medium">
                {categories.find(c => c.id === itm.categoryId)?.name || itm.categoryName || '-'}
              </td>
              <td className="px-4 py-3 text-slate-800 text-xs font-medium">
                <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 font-bold text-[11px] border border-blue-200/60">
                  {itm.unit}
                </span>
              </td>
              <td className="px-4 py-3 text-slate-800 text-xs font-medium">{itm.minStock}</td>
              <td className="px-4 py-3 text-slate-800 text-xs font-medium">{itm.reorderLevel}</td>
              <td className="px-4 py-3 text-right whitespace-nowrap">
                <div className="inline-flex items-center space-x-1.5 justify-end">
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(itm)}
                    className="p-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white border border-blue-200/80 transition-all cursor-pointer shadow-2xs"
                    title="Edit Item"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleTriggerDelete(itm.id, itm.name, 'item')}
                    className="p-1.5 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white border border-rose-200/80 transition-all cursor-pointer shadow-2xs"
                    title="Delete Item"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </td>
            </tr>
          )}
        />
      )}

      {subTab === 'categories' && (
        <Table
          headers={['Category Name', 'Description', 'Actions']}
          data={categories}
          itemsPerPage={10}
          emptyMessage="No categories created yet."
          renderRow={(cat) => (
            <tr key={cat.id} className="hover:bg-slate-50 transition-colors">
              <td className="px-4 py-3 font-semibold text-slate-900 text-xs">{cat.name}</td>
              <td className="px-4 py-3 text-slate-800 text-xs font-medium">{cat.description || '-'}</td>
              <td className="px-4 py-3 text-right whitespace-nowrap">
                <div className="inline-flex items-center space-x-1.5 justify-end">
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(cat)}
                    className="p-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white border border-blue-200/80 transition-all cursor-pointer shadow-2xs"
                    title="Edit Category"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleTriggerDelete(cat.id, cat.name, 'category')}
                    className="p-1.5 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white border border-rose-200/80 transition-all cursor-pointer shadow-2xs"
                    title="Delete Category"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </td>
            </tr>
          )}
        />
      )}

      {subTab === 'units' && (
        <Table
          headers={['Unit Code / Symbol', 'Unit Full Name', 'Status', 'Actions']}
          data={units}
          itemsPerPage={10}
          emptyMessage="No units of measurement created yet."
          renderRow={(unt) => {
            const untKey = unt.id || (unt as any)._id || unt.code;
            return (
              <tr key={untKey} className="hover:bg-slate-50 transition-colors">
                <td className="px-4 py-3 font-bold text-blue-700 text-xs">
                  <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-blue-50 border border-blue-200/80 text-blue-700 font-bold">
                    {unt.code}
                  </span>
                </td>
                <td className="px-4 py-3 font-semibold text-slate-900 text-xs">{unt.name}</td>
                <td className="px-4 py-3 text-xs">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-md font-semibold text-[11px] ${
                    unt.status === 'Inactive' ? 'bg-slate-100 text-slate-600 border border-slate-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200/70'
                  }`}>
                    {unt.status || 'Active'}
                  </span>
                </td>
                <td className="px-4 py-3 text-right whitespace-nowrap">
                  <div className="inline-flex items-center space-x-1.5 justify-end">
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(unt)}
                      className="p-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white border border-blue-200/80 transition-all cursor-pointer shadow-2xs"
                      title="Edit Unit"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleTriggerDelete(untKey, unt.name || unt.code, 'unit')}
                      className="p-1.5 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white border border-rose-200/80 transition-all cursor-pointer shadow-2xs"
                      title="Delete Unit"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            );
          }}
        />
      )}

      {subTab === 'vendors' && (
        <Table
          headers={['Vendor Name', 'Contact Person', 'Phone', 'Email', 'GST No', 'Credit Days', 'Actions']}
          data={vendors}
          itemsPerPage={10}
          emptyMessage="No vendors registered yet."
          renderRow={(ven) => (
            <tr key={ven.id} className="hover:bg-slate-50 transition-colors">
              <td className="px-4 py-3 font-semibold text-slate-900 text-xs">{ven.name}</td>
              <td className="px-4 py-3 text-slate-800 text-xs font-medium">{ven.contactPerson}</td>
              <td className="px-4 py-3 text-slate-800 text-xs font-medium">{ven.phone}</td>
              <td className="px-4 py-3 text-slate-800 text-xs font-medium">{ven.email}</td>
              <td className="px-4 py-3 text-slate-800 text-xs font-medium">{ven.gstNo || '-'}</td>
              <td className="px-4 py-3 text-slate-800 text-xs font-medium">{ven.creditPeriod || 30} Days</td>
              <td className="px-4 py-3 text-right whitespace-nowrap">
                <div className="inline-flex items-center space-x-1.5 justify-end">
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(ven)}
                    className="p-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white border border-blue-200/80 transition-all cursor-pointer shadow-2xs"
                    title="Edit Vendor"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleTriggerDelete(ven.id, ven.name, 'vendor')}
                    className="p-1.5 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white border border-rose-200/80 transition-all cursor-pointer shadow-2xs"
                    title="Delete Vendor"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </td>
            </tr>
          )}
        />
      )}

      {subTab === 'projects' && (
        <Table
          headers={['Project Name', 'Location', 'Status', 'Actions']}
          data={projects}
          itemsPerPage={10}
          emptyMessage="No projects recorded yet."
          renderRow={(prj) => (
            <tr key={prj.id} className="hover:bg-slate-50 transition-colors">
              <td className="px-4 py-3 font-semibold text-slate-900 text-xs">{prj.name}</td>
              <td className="px-4 py-3 text-slate-800 text-xs font-medium">{prj.location}</td>
              <td className="px-4 py-3">
                <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold ${
                  prj.status === 'Active' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/70' :
                  prj.status === 'Completed' ? 'bg-blue-50 text-blue-700 border border-blue-200/70' :
                  'bg-amber-50 text-amber-700 border border-amber-200/70'
                }`}>
                  {prj.status}
                </span>
              </td>
              <td className="px-4 py-3 text-right whitespace-nowrap">
                <div className="inline-flex items-center space-x-1.5 justify-end">
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(prj)}
                    className="p-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white border border-blue-200/80 transition-all cursor-pointer shadow-2xs"
                    title="Edit Project"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleTriggerDelete(prj.id, prj.name, 'project')}
                    className="p-1.5 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white border border-rose-200/80 transition-all cursor-pointer shadow-2xs"
                    title="Delete Project"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </td>
            </tr>
          )}
        />
      )}

      {subTab === 'users' && (
        <Table
          headers={['User Name', 'Email Address', 'System Role', 'Department', 'Status', 'Actions']}
          data={users}
          itemsPerPage={10}
          emptyMessage="No users registered yet."
          renderRow={(usr) => (
            <tr key={usr.id} className="hover:bg-slate-50 transition-colors">
              <td className="px-4 py-3 font-semibold text-slate-900 text-xs">{usr.name}</td>
              <td className="px-4 py-3 text-slate-800 text-xs font-medium">{usr.email}</td>
              <td className="px-4 py-3">
                <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200/70 text-[11px] font-semibold">
                  <ShieldCheck className="w-3 h-3 mr-1 text-blue-500" />
                  {usr.role}
                </span>
              </td>
              <td className="px-4 py-3 text-slate-800 text-xs font-medium">{usr.department || '-'}</td>
              <td className="px-4 py-3">
                <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold ${
                  usr.active ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/70' : 'bg-rose-50 text-rose-700 border border-rose-200/70'
                }`}>
                  {usr.active ? 'Active' : 'Inactive'}
                </span>
              </td>
              <td className="px-4 py-3 text-right whitespace-nowrap">
                <div className="inline-flex items-center space-x-1.5 justify-end">
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(usr)}
                    className="p-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white border border-blue-200/80 transition-all cursor-pointer shadow-2xs"
                    title="Edit User"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleTriggerDelete(usr.id, usr.name, 'user')}
                    className="p-1.5 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white border border-rose-200/80 transition-all cursor-pointer shadow-2xs"
                    title="Delete User"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </td>
            </tr>
          )}
        />
      )}

      {subTab === 'roles' && (
        <Table
          headers={['Role Name', 'Role Type', 'Status', 'Actions']}
          data={availableRolesList}
          itemsPerPage={10}
          emptyMessage="No roles created yet."
          renderRow={(r, idx) => {
            const isSystem = r.isSystemRole || ['admin', 'requester', 'approver', 'purchase', 'store', 'accounts', 'management'].includes(r.role?.toLowerCase());
            const isAdmin = r.role?.toLowerCase() === 'admin';
            const roleKey = r.id || r._id || `${r.role}-${idx}`;

            return (
              <tr key={roleKey} className="hover:bg-slate-50 transition-colors">
                <td className="px-4 py-3 font-semibold text-slate-900 text-xs">
                  <div className="flex items-center space-x-2">
                    <span className="p-1 rounded-md bg-indigo-50 text-indigo-600 border border-indigo-100">
                      <Shield className="w-3.5 h-3.5" />
                    </span>
                    <span className="font-bold text-slate-900">{r.name || r.role}</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  {isSystem ? (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200 text-[11px] font-semibold">
                      <Lock className="w-2.5 h-2.5 mr-1 text-slate-500" /> System Default
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 border border-purple-200/70 text-[11px] font-semibold">
                      Custom Role
                    </span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold ${
                    r.status !== 'Inactive' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/70' : 'bg-rose-50 text-rose-700 border border-rose-200/70'
                  }`}>
                    {r.status || 'Active'}
                  </span>
                </td>
                <td className="px-4 py-3 text-right whitespace-nowrap">
                  <div className="inline-flex items-center space-x-1.5 justify-end">
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(r)}
                      className="p-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white border border-blue-200/80 transition-all cursor-pointer shadow-2xs"
                      title="Edit Role"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </button>
                    {!isAdmin && (
                      <button
                        type="button"
                        onClick={() => handleTriggerDelete(roleKey, r.name || r.role, 'role')}
                        className="p-1.5 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white border border-rose-200/80 transition-all cursor-pointer shadow-2xs"
                        title="Delete Role"
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
      )}

      {/* Modal Dialog for Add / Edit */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0F172C]/70 backdrop-blur-xs animate-backdrop-fade">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 animate-modal-zoom space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-bold text-[#0F172C]">
                {editingId ? `Update ${getSubTabLabel(subTab)}` : `Add New ${getSubTabLabel(subTab)}`}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-700 font-bold text-lg cursor-pointer">✕</button>
            </div>

            {subTab === 'items' && (
              <form noValidate onSubmit={(e) => {
                e.preventDefault();
                const errors: Record<string, string> = {};
                if (!itemForm.itemCode?.trim()) errors.itemCode = 'Item code is required';
                if (!itemForm.name?.trim()) errors.name = 'Item name is required';
                if (!itemForm.categoryId) errors.categoryId = 'Please select a category';
                if (!itemForm.unit?.trim()) errors.unit = 'Unit is required';

                if (Object.keys(errors).length > 0) {
                  setFormErrors(errors);
                  return;
                }

                const selectedCat = categories.find(c => c.id === itemForm.categoryId);
                if (editingId && onEditItem) {
                  onEditItem(editingId, { ...itemForm, categoryName: selectedCat?.name || '' });
                } else {
                  onAddItem({ ...itemForm, categoryName: selectedCat?.name || '' });
                }
                setShowModal(false);
              }} className="space-y-3">
                <Input
                  label="Item Code"
                  value={itemForm.itemCode}
                  onChange={e => { setItemForm({...itemForm, itemCode: e.target.value}); clearError('itemCode'); }}
                  error={formErrors.itemCode}
                  required
                />
                <Input
                  label="Item Name"
                  value={itemForm.name}
                  onChange={e => { setItemForm({...itemForm, name: e.target.value}); clearError('name'); }}
                  error={formErrors.name}
                  required
                />
                <Select
                  label="Category"
                  options={categories.map(c => ({ value: c.id, label: c.name }))}
                  value={itemForm.categoryId}
                  onChange={e => { setItemForm({...itemForm, categoryId: e.target.value}); clearError('categoryId'); }}
                  error={formErrors.categoryId}
                  required
                />
                <Select
                  label="Unit of Measurement (UOM)"
                  options={
                    (units && units.length > 0
                      ? units.filter(u => u.status !== 'Inactive').map(u => ({ value: u.code, label: `${u.code} - ${u.name}` }))
                      : [
                          { value: 'Pcs', label: 'Pcs - Pieces' },
                          { value: 'MT', label: 'MT - Metric Ton' },
                          { value: 'Bag', label: 'Bag - Bags' },
                          { value: 'Kg', label: 'Kg - Kilograms' },
                          { value: 'Mtrs', label: 'Mtrs - Meters' },
                          { value: 'Cu.M', label: 'Cu.M - Cubic Meters' },
                          { value: 'Ltr', label: 'Ltr - Liters' },
                          { value: 'Box', label: 'Box - Boxes' },
                          { value: 'Nos', label: 'Nos - Numbers' },
                          { value: 'SqFt', label: 'SqFt - Square Feet' },
                          { value: 'Bundle', label: 'Bundle - Bundles' },
                        ])
                  }
                  value={itemForm.unit}
                  onChange={e => { setItemForm({...itemForm, unit: e.target.value}); clearError('unit'); }}
                  error={formErrors.unit}
                  required
                />
                <div className="grid grid-cols-2 gap-3">
                  <Input label="Minimum Stock" type="number" value={itemForm.minStock} onChange={e => setItemForm({...itemForm, minStock: Number(e.target.value)})} />
                  <Input label="Reorder Level" type="number" value={itemForm.reorderLevel} onChange={e => setItemForm({...itemForm, reorderLevel: Number(e.target.value)})} />
                </div>
                <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
                  <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
                  <Button variant="primary" type="submit">{editingId ? 'Update Item' : 'Save Item'}</Button>
                </div>
              </form>
            )}

            {subTab === 'units' && (
              <form noValidate onSubmit={(e) => {
                e.preventDefault();
                const errors: Record<string, string> = {};
                if (!unitForm.code?.trim()) errors.code = 'Unit code / symbol is required (e.g. MT, Pcs, Bag, Kg)';
                if (!unitForm.name?.trim()) errors.name = 'Unit name is required (e.g. Metric Ton, Pieces, Bags)';

                if (Object.keys(errors).length > 0) {
                  setFormErrors(errors);
                  return;
                }

                const payload = {
                  code: unitForm.code.trim(),
                  name: unitForm.name.trim(),
                  status: unitForm.status
                };

                if (editingId && onEditUnit) {
                  onEditUnit(editingId, payload);
                } else if (onAddUnit) {
                  onAddUnit(payload);
                }
                setShowModal(false);
              }} className="space-y-3">
                <Input
                  label="Unit Code / Symbol (e.g. MT, Pcs, Bag, Kg)"
                  value={unitForm.code}
                  onChange={e => { setUnitForm({...unitForm, code: e.target.value}); clearError('code'); }}
                  placeholder="e.g. Pcs, MT, Bag, Kg, Mtrs, Cu.M"
                  error={formErrors.code}
                  required
                />
                <Input
                  label="Unit Full Name"
                  value={unitForm.name}
                  onChange={e => { setUnitForm({...unitForm, name: e.target.value}); clearError('name'); }}
                  placeholder="e.g. Pieces, Metric Ton, Bags, Kilograms"
                  error={formErrors.name}
                  required
                />
                <Select
                  label="Status"
                  options={[
                    { value: 'Active', label: 'Active' },
                    { value: 'Inactive', label: 'Inactive' }
                  ]}
                  value={unitForm.status}
                  onChange={e => setUnitForm({...unitForm, status: e.target.value as any})}
                />
                <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
                  <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
                  <Button variant="primary" type="submit">{editingId ? 'Update Unit' : 'Save Unit'}</Button>
                </div>
              </form>
            )}

            {subTab === 'vendors' && (
              <form noValidate onSubmit={(e) => {
                e.preventDefault();
                const errors: Record<string, string> = {};
                if (!vendorForm.name?.trim()) errors.name = 'Vendor name is required';
                if (!vendorForm.contactPerson?.trim()) errors.contactPerson = 'Contact person is required';
                
                if (!vendorForm.phone?.trim()) {
                  errors.phone = 'Phone number is required';
                } else if (!isValidPhone(vendorForm.phone)) {
                  errors.phone = 'Enter a valid 10-digit mobile number';
                }

                if (!vendorForm.email?.trim()) {
                  errors.email = 'Email address is required';
                } else if (!isValidEmail(vendorForm.email)) {
                  errors.email = 'Please enter a valid email address';
                }

                if (!vendorForm.gstNo?.trim()) {
                  errors.gstNo = 'GST number is required';
                } else if (!isValidGST(vendorForm.gstNo)) {
                  errors.gstNo = 'Enter a valid 15-character GSTIN (e.g. 27AAAAA0000A1Z5)';
                }

                if (Object.keys(errors).length > 0) {
                  setFormErrors(errors);
                  return;
                }

                const payload = {
                  name: vendorForm.name.trim(),
                  contactPerson: vendorForm.contactPerson.trim(),
                  email: vendorForm.email.trim().toLowerCase(),
                  phone: vendorForm.phone.trim(),
                  gstNo: vendorForm.gstNo.trim().toUpperCase(),
                  panNo: vendorForm.panNo.trim().toUpperCase(),
                  creditPeriod: vendorForm.creditPeriod,
                  address: vendorForm.address.trim(),
                  bankDetails: {
                    bankName: vendorForm.bankName.trim(),
                    accountNo: vendorForm.accountNo.trim(),
                    ifscCode: vendorForm.ifscCode.trim().toUpperCase()
                  }
                };
                if (editingId && onEditVendor) {
                  onEditVendor(editingId, payload);
                } else {
                  onAddVendor(payload);
                }
                setShowModal(false);
              }} className="space-y-3">
                <Input
                  label="Vendor Name"
                  value={vendorForm.name}
                  onChange={e => { setVendorForm({...vendorForm, name: e.target.value}); clearError('name'); }}
                  error={formErrors.name}
                  required
                />
                <Input
                  label="Contact Person"
                  value={vendorForm.contactPerson}
                  onChange={e => { setVendorForm({...vendorForm, contactPerson: e.target.value}); clearError('contactPerson'); }}
                  error={formErrors.contactPerson}
                  required
                />
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    label="Phone Number"
                    value={vendorForm.phone}
                    maxLength={10}
                    onChange={e => { setVendorForm({...vendorForm, phone: formatPhone(e.target.value)}); clearError('phone'); }}
                    placeholder="10-digit mobile"
                    error={formErrors.phone}
                    required
                  />
                  <Input
                    label="Email Address"
                    type="email"
                    value={vendorForm.email}
                    onChange={e => { setVendorForm({...vendorForm, email: e.target.value}); clearError('email'); }}
                    placeholder="vendor@company.com"
                    error={formErrors.email}
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    label="GST Number"
                    value={vendorForm.gstNo}
                    maxLength={15}
                    onChange={e => { setVendorForm({...vendorForm, gstNo: formatGST(e.target.value)}); clearError('gstNo'); }}
                    placeholder="15-digit GSTIN"
                    error={formErrors.gstNo}
                    required
                  />
                  <Input
                    label="PAN Number (Optional)"
                    value={vendorForm.panNo}
                    maxLength={10}
                    onChange={e => { setVendorForm({...vendorForm, panNo: formatPAN(e.target.value)}); clearError('panNo'); }}
                    placeholder="10-digit PAN"
                    error={formErrors.panNo}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Input label="Credit Period (Days)" type="number" value={vendorForm.creditPeriod} onChange={e => setVendorForm({...vendorForm, creditPeriod: Number(e.target.value)})} />
                  <Input label="Address" value={vendorForm.address} onChange={e => setVendorForm({...vendorForm, address: e.target.value})} placeholder="City, State" />
                </div>
                <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
                  <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
                  <Button variant="primary" type="submit">{editingId ? 'Update Vendor' : 'Save Vendor'}</Button>
                </div>
              </form>
            )}

            {subTab === 'projects' && (
              <form noValidate onSubmit={(e) => {
                e.preventDefault();
                const errors: Record<string, string> = {};
                if (!projectForm.name?.trim()) errors.name = 'Project name is required';
                if (!projectForm.location?.trim()) errors.location = 'Location is required';

                if (Object.keys(errors).length > 0) {
                  setFormErrors(errors);
                  return;
                }

                if (editingId && onEditProject) {
                  onEditProject(editingId, projectForm);
                } else {
                  onAddProject(projectForm);
                }
                setShowModal(false);
              }} className="space-y-3">
                <Input
                  label="Project Name"
                  value={projectForm.name}
                  onChange={e => { setProjectForm({...projectForm, name: e.target.value}); clearError('name'); }}
                  error={formErrors.name}
                  required
                />
                <Input
                  label="Location"
                  value={projectForm.location}
                  onChange={e => { setProjectForm({...projectForm, location: e.target.value}); clearError('location'); }}
                  error={formErrors.location}
                  required
                />
                <Select
                  label="Status"
                  options={[
                    { value: 'Active', label: 'Active' },
                    { value: 'Completed', label: 'Completed' },
                    { value: 'On Hold', label: 'On Hold' }
                  ]}
                  value={projectForm.status}
                  onChange={e => setProjectForm({...projectForm, status: e.target.value as any})}
                />
                <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
                  <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
                  <Button variant="primary" type="submit">{editingId ? 'Update Project' : 'Save Project'}</Button>
                </div>
              </form>
            )}

            {subTab === 'users' && (
              <form noValidate onSubmit={(e) => {
                e.preventDefault();
                const errors: Record<string, string> = {};
                if (!userForm.name?.trim()) errors.name = 'Full name is required';
                
                if (!userForm.email?.trim()) {
                  errors.email = 'Email address is required';
                } else if (!isValidEmail(userForm.email)) {
                  errors.email = 'Please enter a valid email address';
                }

                if (!userForm.department?.trim()) errors.department = 'Department is required';

                if (Object.keys(errors).length > 0) {
                  setFormErrors(errors);
                  return;
                }

                if (editingId && onEditUser) {
                  onEditUser(editingId, userForm);
                } else {
                  onAddUser({ ...userForm, active: true });
                }
                setShowModal(false);
              }} className="space-y-3">
                <Input
                  label="Full Name"
                  value={userForm.name}
                  onChange={e => { setUserForm({...userForm, name: e.target.value}); clearError('name'); }}
                  error={formErrors.name}
                  required
                />
                <Input
                  label="Email Address"
                  type="email"
                  value={userForm.email}
                  onChange={e => { setUserForm({...userForm, email: e.target.value}); clearError('email'); }}
                  placeholder="user@company.com"
                  error={formErrors.email}
                  required
                />
                <Input
                  label={editingId ? "Reset Password (Optional)" : "Password (Default: 123456)"}
                  type="password"
                  value={userForm.password}
                  onChange={e => setUserForm({...userForm, password: e.target.value})}
                  placeholder={editingId ? "Leave blank to keep existing, or enter new password" : "Enter account password"}
                />
                <Select
                  label="Assign Role (Dynamic Role Master)"
                  options={availableRolesList.map(r => ({
                    value: r.role,
                    label: `${r.name || r.role}${r.description ? ` - ${r.description.slice(0, 35)}${r.description.length > 35 ? '...' : ''}` : ''}`
                  }))}
                  value={userForm.role}
                  onChange={e => setUserForm({...userForm, role: e.target.value})}
                />
                <Input
                  label="Department"
                  value={userForm.department}
                  onChange={e => { setUserForm({...userForm, department: e.target.value}); clearError('department'); }}
                  error={formErrors.department}
                  required
                />
                <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
                  <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
                  <Button variant="primary" type="submit">{editingId ? 'Update User' : 'Save User'}</Button>
                </div>
              </form>
            )}

            {subTab === 'roles' && (
              <form noValidate onSubmit={(e) => {
                e.preventDefault();
                const errors: Record<string, string> = {};
                if (!roleForm.role?.trim()) errors.role = 'Role code is required';
                if (!roleForm.name?.trim()) errors.name = 'Display role name is required';

                if (Object.keys(errors).length > 0) {
                  setFormErrors(errors);
                  return;
                }

                const payload = {
                  role: roleForm.role.trim(),
                  name: roleForm.name.trim() || roleForm.role.trim(),
                  status: roleForm.status
                };

                if (editingId && onEditRole) {
                  onEditRole(editingId, payload);
                } else if (onAddRole) {
                  onAddRole(payload);
                }
                setShowModal(false);
              }} className="space-y-3">
                <Input
                  label="Role Code / Identifier"
                  value={roleForm.role}
                  onChange={e => {
                    setRoleForm({
                      ...roleForm,
                      role: e.target.value,
                      name: roleForm.name === roleForm.role ? e.target.value : roleForm.name
                    });
                    clearError('role');
                  }}
                  placeholder="e.g. QualityInspector or SiteSupervisor"
                  disabled={!!(editingId && roleForm.role.toLowerCase() === 'admin')}
                  error={formErrors.role}
                  required
                />
                <Input
                  label="Display Role Name"
                  value={roleForm.name}
                  onChange={e => { setRoleForm({...roleForm, name: e.target.value}); clearError('name'); }}
                  placeholder="e.g. Quality Inspector"
                  error={formErrors.name}
                  required
                />
                <Select
                  label="Status"
                  options={[
                    { value: 'Active', label: 'Active' },
                    { value: 'Inactive', label: 'Inactive' }
                  ]}
                  value={roleForm.status}
                  onChange={e => setRoleForm({...roleForm, status: e.target.value as any})}
                />
                <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
                  <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
                  <Button variant="primary" type="submit">{editingId ? 'Update Role' : 'Save Role'}</Button>
                </div>
              </form>
            )}

            {subTab === 'categories' && (
              <form noValidate onSubmit={(e) => {
                e.preventDefault();
                const errors: Record<string, string> = {};
                if (!categoryForm.name?.trim()) errors.name = 'Category name is required';

                if (Object.keys(errors).length > 0) {
                  setFormErrors(errors);
                  return;
                }

                if (editingId && onEditCategory) {
                  onEditCategory(editingId, categoryForm);
                } else {
                  onAddCategory(categoryForm);
                }
                setShowModal(false);
              }} className="space-y-3">
                <Input
                  label="Category Name"
                  value={categoryForm.name}
                  onChange={e => { setCategoryForm({...categoryForm, name: e.target.value}); clearError('name'); }}
                  error={formErrors.name}
                  required
                />
                <Input
                  label="Description"
                  value={categoryForm.description}
                  onChange={e => setCategoryForm({...categoryForm, description: e.target.value})}
                />
                <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
                  <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
                  <Button variant="primary" type="submit">{editingId ? 'Update Category' : 'Save Category'}</Button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={deleteModalState.isOpen}
        onClose={() => setDeleteModalState({ ...deleteModalState, isOpen: false })}
        onConfirm={handleConfirmDelete}
        title={`Delete ${getSubTabLabel(deleteModalState.type)}`}
        itemName={deleteModalState.name}
      />
    </div>
  );
}
