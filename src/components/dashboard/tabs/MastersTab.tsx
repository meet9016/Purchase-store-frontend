"use client";

import React, { useState } from 'react';
import { User, Project, Vendor, Category, Item } from '@/lib/storeData';
import { Table } from '@/components/ui/Table';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { DeleteConfirmModal } from '@/components/ui/DeleteConfirmModal';
import { Plus, Users, Building, Truck, Tags, Package, Edit2, Trash2 } from 'lucide-react';

interface MastersTabProps {
  users: User[];
  projects: Project[];
  vendors: Vendor[];
  categories: Category[];
  items: Item[];
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

  onAddItem: (item: Omit<Item, 'id'>) => void;
  onEditItem?: (id: string, item: Partial<Item>) => void;
  onDeleteItem?: (id: string) => void;
}

export function MastersTab({
  users,
  projects,
  vendors,
  categories,
  items,
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
  onAddItem,
  onEditItem,
  onDeleteItem
}: MastersTabProps) {
  const [subTab, setSubTab] = useState<'items' | 'categories' | 'vendors' | 'projects' | 'users'>('items');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Check create permission based on current sub-tab
  const canCreateCurrentSubTab = currentUser?.role === 'Admin' || (() => {
    const featureMap: Record<string, string> = {
      items: 'Product',
      categories: 'Category',
      vendors: 'Leads',
      projects: 'Department Management',
      users: 'User',
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
    type: 'item' | 'category' | 'vendor' | 'project' | 'user';
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
  const [itemForm, setItemForm] = useState({
    itemCode: '', name: '', categoryId: '', subCategory: '', unit: 'Pcs',
    description: '', minStock: 0, reorderLevel: 0
  });

  const getSubTabLabel = (tab: string) => {
    switch (tab) {
      case 'items': return 'Item';
      case 'categories': return 'Category';
      case 'vendors': return 'Vendor';
      case 'projects': return 'Project';
      case 'users': return 'User';
      default: return 'Record';
    }
  };

  const handleOpenAdd = () => {
    setEditingId(null);
    setUserForm({ name: '', email: '', role: 'Requester', department: '', active: true, password: '' });
    setProjectForm({ name: '', location: '', status: 'Active' });
    setVendorForm({ name: '', contactPerson: '', email: '', phone: '', gstNo: '', panNo: '', bankName: '', accountNo: '', ifscCode: '', creditPeriod: 30, address: '' });
    setCategoryForm({ name: '', description: '' });
    setItemForm({ itemCode: '', name: '', categoryId: '', subCategory: '', unit: 'Pcs', description: '', minStock: 0, reorderLevel: 0 });
    setShowModal(true);
  };

  const handleOpenEdit = (item: any) => {
    setEditingId(item.id);
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
    }
    setShowModal(true);
  };

  const handleTriggerDelete = (id: string, name: string, type: 'item' | 'category' | 'vendor' | 'project' | 'user') => {
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
    else if (type === 'vendor' && onDeleteVendor) onDeleteVendor(id);
    else if (type === 'project' && onDeleteProject) onDeleteProject(id);
    else if (type === 'user' && onDeleteUser) onDeleteUser(id);
  };

  return (
    <div className="space-y-6">
      {/* Sub-tab Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-2">
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: 'items', label: 'Item Master', icon: <Package className="w-4 h-4" /> },
            { id: 'categories', label: 'Categories', icon: <Tags className="w-4 h-4" /> },
            { id: 'vendors', label: 'Vendors', icon: <Truck className="w-4 h-4" /> },
            { id: 'projects', label: 'Projects', icon: <Building className="w-4 h-4" /> },
            { id: 'users', label: 'Users & Staff', icon: <Users className="w-4 h-4" /> },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setSubTab(tab.id as any)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                subTab === tab.id
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-sm shadow-blue-600/20'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
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
          >
            Add New {getSubTabLabel(subTab)}
          </Button>
        )}
      </div>

      {/* SubTab Views with Polished Action Icon Buttons */}
      {subTab === 'items' && (
        <Table
          headers={['Code', 'Item Name', 'Category', 'Unit', 'Min Stock', 'Reorder Level', 'Actions']}
          data={items}
          itemsPerPage={10}
          emptyMessage="No master items found. Click 'Add New Item' to create one."
          renderRow={(item) => (
            <tr key={item.id} className="hover:bg-slate-50 transition-colors">
              <td className="px-4 py-3 font-semibold text-slate-900 text-xs">{item.itemCode || '-'}</td>
              <td className="px-4 py-3 font-semibold text-slate-900 text-xs">{item.name}</td>
              <td className="px-4 py-3 text-slate-800 text-xs font-medium">{item.categoryName || 'General'}</td>
              <td className="px-4 py-3 text-slate-800 text-xs font-medium">{item.unit}</td>
              <td className="px-4 py-3 text-slate-800 text-xs font-medium">{item.minStock || 0}</td>
              <td className="px-4 py-3 text-slate-800 text-xs font-medium">{item.reorderLevel || 0}</td>
              <td className="px-4 py-3 text-right whitespace-nowrap">
                <div className="inline-flex items-center space-x-1.5 justify-end">
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(item)}
                    className="p-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white border border-blue-200/80 transition-all cursor-pointer shadow-2xs"
                    title="Edit Item"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleTriggerDelete(item.id, item.name, 'item')}
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
          emptyMessage="No categories created yet. Click 'Add New Category' to create one."
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

      {subTab === 'vendors' && (
        <Table
          headers={['Vendor Name', 'Contact Person', 'Phone / Email', 'GST / PAN', 'Credit Period', 'Actions']}
          data={vendors}
          itemsPerPage={10}
          emptyMessage="No vendors registered yet. Click 'Add New Vendor' to create one."
          renderRow={(ven) => (
            <tr key={ven.id} className="hover:bg-slate-50 transition-colors">
              <td className="px-4 py-3 font-semibold text-slate-900 text-xs">{ven.name}</td>
              <td className="px-4 py-3 text-slate-900 text-xs font-medium">{ven.contactPerson}</td>
              <td className="px-4 py-3 text-slate-800 text-xs font-medium">
                <div className="font-semibold text-slate-900">{ven.phone}</div>
                <div className="text-slate-600 text-[11px]">{ven.email}</div>
              </td>
              <td className="px-4 py-3 text-slate-800 text-xs font-medium">
                <div>GST: <span className="font-semibold">{ven.gstNo || '-'}</span></div>
                <div>PAN: <span className="font-semibold">{ven.panNo || '-'}</span></div>
              </td>
              <td className="px-4 py-3 text-slate-900 text-xs font-semibold">{ven.creditPeriod} Days</td>
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
          emptyMessage="No project sites configured yet. Click 'Add New Project' to create one."
          renderRow={(prj) => (
            <tr key={prj.id} className="hover:bg-slate-50 transition-colors">
              <td className="px-4 py-3 font-semibold text-slate-900 text-xs">{prj.name}</td>
              <td className="px-4 py-3 text-slate-800 text-xs font-medium">{prj.location}</td>
              <td className="px-4 py-3">
                <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold ${
                  prj.status === 'Active' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/70' : 'bg-slate-100 text-slate-700 border border-slate-200'
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
              <form onSubmit={(e) => {
                e.preventDefault();
                const selectedCat = categories.find(c => c.id === itemForm.categoryId);
                if (editingId && onEditItem) {
                  onEditItem(editingId, { ...itemForm, categoryName: selectedCat?.name || '' });
                } else {
                  onAddItem({ ...itemForm, categoryName: selectedCat?.name || '' });
                }
                setShowModal(false);
              }} className="space-y-3">
                <Input label="Item Code" value={itemForm.itemCode} onChange={e => setItemForm({...itemForm, itemCode: e.target.value})} required />
                <Input label="Item Name" value={itemForm.name} onChange={e => setItemForm({...itemForm, name: e.target.value})} required />
                <Select label="Category" options={categories.map(c => ({ value: c.id, label: c.name }))} value={itemForm.categoryId} onChange={e => setItemForm({...itemForm, categoryId: e.target.value})} />
                <Input label="Unit (e.g. MT, Pcs, Bag, Kg)" value={itemForm.unit} onChange={e => setItemForm({...itemForm, unit: e.target.value})} required />
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

            {subTab === 'vendors' && (
              <form onSubmit={(e) => {
                e.preventDefault();
                const payload = {
                  name: vendorForm.name,
                  contactPerson: vendorForm.contactPerson,
                  email: vendorForm.email,
                  phone: vendorForm.phone,
                  gstNo: vendorForm.gstNo,
                  panNo: vendorForm.panNo,
                  creditPeriod: vendorForm.creditPeriod,
                  address: vendorForm.address,
                  bankDetails: {
                    bankName: vendorForm.bankName,
                    accountNo: vendorForm.accountNo,
                    ifscCode: vendorForm.ifscCode
                  }
                };
                if (editingId && onEditVendor) {
                  onEditVendor(editingId, payload);
                } else {
                  onAddVendor(payload);
                }
                setShowModal(false);
              }} className="space-y-3">
                <Input label="Vendor Name" value={vendorForm.name} onChange={e => setVendorForm({...vendorForm, name: e.target.value})} required />
                <Input label="Contact Person" value={vendorForm.contactPerson} onChange={e => setVendorForm({...vendorForm, contactPerson: e.target.value})} required />
                <div className="grid grid-cols-2 gap-3">
                  <Input label="Phone Number" value={vendorForm.phone} onChange={e => setVendorForm({...vendorForm, phone: e.target.value})} required />
                  <Input label="Email Address" type="email" value={vendorForm.email} onChange={e => setVendorForm({...vendorForm, email: e.target.value})} required />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Input label="GST Number" value={vendorForm.gstNo} onChange={e => setVendorForm({...vendorForm, gstNo: e.target.value})} required />
                  <Input label="Credit Period (Days)" type="number" value={vendorForm.creditPeriod} onChange={e => setVendorForm({...vendorForm, creditPeriod: Number(e.target.value)})} />
                </div>
                <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
                  <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
                  <Button variant="primary" type="submit">{editingId ? 'Update Vendor' : 'Save Vendor'}</Button>
                </div>
              </form>
            )}

            {subTab === 'projects' && (
              <form onSubmit={(e) => {
                e.preventDefault();
                if (editingId && onEditProject) {
                  onEditProject(editingId, projectForm);
                } else {
                  onAddProject(projectForm);
                }
                setShowModal(false);
              }} className="space-y-3">
                <Input label="Project Name" value={projectForm.name} onChange={e => setProjectForm({...projectForm, name: e.target.value})} required />
                <Input label="Project Location" value={projectForm.location} onChange={e => setProjectForm({...projectForm, location: e.target.value})} required />
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
              <form onSubmit={(e) => {
                e.preventDefault();
                if (editingId && onEditUser) {
                  onEditUser(editingId, userForm);
                } else {
                  onAddUser({ ...userForm, active: true });
                }
                setShowModal(false);
              }} className="space-y-3">
                <Input label="Full Name" value={userForm.name} onChange={e => setUserForm({...userForm, name: e.target.value})} required />
                <Input label="Email Address" type="email" value={userForm.email} onChange={e => setUserForm({...userForm, email: e.target.value})} required />
                <Input
                  label={editingId ? "Reset Password (Optional)" : "Password (Default: 123456)"}
                  type="password"
                  value={userForm.password}
                  onChange={e => setUserForm({...userForm, password: e.target.value})}
                  placeholder={editingId ? "Leave blank to keep existing, or enter new password" : "Enter account password"}
                />
                <Select
                  label="Assign Role"
                  options={[
                    { value: 'Requester', label: 'Requester (Site Engineer)' },
                    { value: 'Approver', label: 'Approver (Project Manager)' },
                    { value: 'Purchase', label: 'Purchase Manager (Procurement)' },
                    { value: 'Store', label: 'Store Incharge (Inventory/GRN)' },
                    { value: 'Accounts', label: 'Accounts Team (Bills & Payments)' },
                    { value: 'Management', label: 'Management (Executive Oversight)' },
                    { value: 'Admin', label: 'System Administrator' }
                  ]}
                  value={userForm.role}
                  onChange={e => setUserForm({...userForm, role: e.target.value})}
                />
                <Input label="Department" value={userForm.department} onChange={e => setUserForm({...userForm, department: e.target.value})} required />
                <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
                  <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
                  <Button variant="primary" type="submit">{editingId ? 'Update User' : 'Save User'}</Button>
                </div>
              </form>
            )}

            {subTab === 'categories' && (
              <form onSubmit={(e) => {
                e.preventDefault();
                if (editingId && onEditCategory) {
                  onEditCategory(editingId, categoryForm);
                } else {
                  onAddCategory(categoryForm);
                }
                setShowModal(false);
              }} className="space-y-3">
                <Input label="Category Name" value={categoryForm.name} onChange={e => setCategoryForm({...categoryForm, name: e.target.value})} required />
                <Input label="Description" value={categoryForm.description} onChange={e => setCategoryForm({...categoryForm, description: e.target.value})} />
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
