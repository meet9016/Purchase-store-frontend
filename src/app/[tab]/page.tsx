"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  getDatabase,
  saveDatabase,
  addAuditLog,
  sendNotification,
  User,
  Project,
  Vendor,
  Category,
  Item,
  PurchaseRequest,
  PurchaseOrder,
  GRN,
  Stock,
  StoreOutward,
  VendorBill,
  PaymentRequest,
  PaymentEntry,
  StockTransaction,
  DatabaseState,
  deduplicateById
} from '@/lib/storeData';
import {
  api,
  authApi,
  purchaseRequestsApi,
  purchaseOrdersApi,
  grnsApi,
  stockApi,
  vendorBillsApi,
  paymentRequestsApi,
  paymentEntriesApi,
  outwardsApi,
  auditLogsApi,
  notificationsApi,
  rolePermissionsApi,
  rolesApi,
  projectsApi,
  vendorsApi,
  categoriesApi,
  unitsApi,
  itemsApi,
  usersApi
} from '@/lib/api';
import { toast } from 'sonner';
import { getViewScope } from '@/lib/permissions';

// Modular Components
import { SidebarNav, SidebarTab } from '@/components/dashboard/SidebarNav';
import { HeaderNav } from '@/components/dashboard/HeaderNav';
import { DashboardOverview } from '@/components/dashboard/tabs/DashboardOverview';
import { MastersTab } from '@/components/dashboard/tabs/MastersTab';
import { PurchaseRequestsTab } from '@/components/dashboard/tabs/PurchaseRequestsTab';
import { PurchaseOrdersTab } from '@/components/dashboard/tabs/PurchaseOrdersTab';
import { GrnTab } from '@/components/dashboard/tabs/GrnTab';
import { StockManagementTab } from '@/components/dashboard/tabs/StockManagementTab';
import { StoreOutwardTab } from '@/components/dashboard/tabs/StoreOutwardTab';
import { VendorBillsTab } from '@/components/dashboard/tabs/VendorBillsTab';
import { PaymentRequestsTab } from '@/components/dashboard/tabs/PaymentRequestsTab';
import { PaymentEntriesTab } from '@/components/dashboard/tabs/PaymentEntriesTab';
import { ReportsTab } from '@/components/dashboard/tabs/ReportsTab';
import { AuditLogsTab, NotificationsTab } from '@/components/dashboard/tabs/AuditLogsTab';
import { RolePermissionsTab } from '@/components/dashboard/tabs/RolePermissionsTab';
import { Modals } from '@/components/dashboard/Modals';

// ─── Helper: Call API and update DB, fallback silently on error ───────────────
async function apiCall<T>(fn: () => Promise<T>, onSuccess?: (result: T) => void): Promise<T | null> {
  try {
    const result = await fn();
    onSuccess?.(result);
    return result;
  } catch (err: any) {
    console.warn('[API Fallback]', err?.message || err);
    return null;
  }
}

export default function DashboardPage() {
  const router = useRouter();
  const params = useParams();
  const activeTab = (params?.tab as SidebarTab) || 'dashboard';

  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    if (typeof window !== 'undefined') {
      const active = localStorage.getItem('active_user');
      if (active) {
        try { return JSON.parse(active); } catch (e) { console.error(e); }
      }
    }
    return null;
  });

  const [db, setDb] = useState<DatabaseState>(() => {
    const initialDb = getDatabase();
    if (typeof window !== 'undefined') {
      const cachedRoles = localStorage.getItem('cached_roles');
      if (cachedRoles) {
        try { initialDb.rolePermissions = JSON.parse(cachedRoles); } catch (e) { console.error(e); }
      }
    }
    return initialDb;
  });
  const [navLayout, setNavLayout] = useState<'sidebar' | 'header'>('sidebar');
  const [backendOnline, setBackendOnline] = useState(false);

  const handleTabChange = useCallback((tab: SidebarTab) => {
    router.push(`/${tab}`);
  }, [router]);

  // Modal & Selected Drawer States
  const [openModal, setOpenModal] = useState<string | null>(null);
  const [selectedPrDetail, setSelectedPrDetail] = useState<PurchaseRequest | null>(null);
  const [selectedPo, setSelectedPo] = useState<PurchaseOrder | null>(null);

  // Filters
  const [globalSearch, setGlobalSearch] = useState('');
  const [filterProject, setFilterProject] = useState('');

  // Form States
  const [prForm, setPrForm] = useState({ projectId: '', requiredDate: new Date().toISOString().split('T')[0], priority: 'Medium' as const, items: [] as any[], attachmentUrl: '' });
  const [prItemInput, setPrItemInput] = useState({ itemId: '', quantity: 1, remarks: '' });
  const [poForm, setPoForm] = useState({ prId: '', vendorId: '', creditPeriod: 30, expectedDeliveryDate: '', deliveryLocation: '', termsConditions: '', remarks: '', items: [] as any[] });
  const [grnForm, setGrnForm] = useState({ poId: '', vehicleNumber: '', challanNumber: '', vendorInvoiceNumber: '', remarks: '', items: [] as any[] });
  const [outwardForm, setOutwardForm] = useState({ projectId: '', issuedTo: '', department: '', purpose: '', remarks: '', items: [] as any[] });
  const [outwardItemInput, setOutwardItemInput] = useState({ itemId: '', quantity: 1 });
  const [billForm, setBillForm] = useState({ poId: '', vendorInvoiceNumber: '', billDate: new Date().toISOString().split('T')[0], billAmount: 0, creditPeriod: 30, dueDate: '' });
  const [paymentReqForm, setPaymentReqForm] = useState({ billId: '', requestedAmount: 0, remarks: '' });
  const [paymentEntryForm, setPaymentEntryForm] = useState({ billId: '', paymentAmount: 0, paymentMode: 'Bank Transfer/NEFT/RTGS' as const, transactionNumber: '', remarks: '' });

  // Update DB helper — updates React state
  const updateDB = useCallback((newDb: DatabaseState) => {
    if (!newDb) return;
    setDb({ ...newDb });
  }, []);

  // Function to refresh specific tab data from backend REST API
  const fetchTabData = useCallback(async (tab: SidebarTab) => {
    try {
      if (tab === 'dashboard') {
        const rolesRes = await rolePermissionsApi.getAll().catch(() => null);
        let fetchedRoles = db.rolePermissions;
        if (rolesRes?.status === 200 || rolesRes?.status === 'success') {
          fetchedRoles = deduplicateById(rolesRes.data as any);
          if (typeof window !== 'undefined') {
            localStorage.setItem('cached_roles', JSON.stringify(fetchedRoles));
          }
          setDb(prev => ({ ...prev, rolePermissions: fetchedRoles }));
        }

        const userStr = typeof window !== 'undefined' ? localStorage.getItem('active_user') : null;
        let currentRole = 'Admin';
        if (userStr) {
          try { const u = JSON.parse(userStr); currentRole = u.role || 'Admin'; } catch(e){}
        }

        let canViewPR = false, canViewPO = false, canViewGRN = false, canViewStock = false, canViewBills = false, canViewPayReq = false;

        if (currentRole === 'Admin') {
          canViewPR = canViewPO = canViewGRN = canViewStock = canViewBills = canViewPayReq = true;
        } else {
          const rolePerm = fetchedRoles.find(rp => rp.role.toLowerCase() === currentRole.toLowerCase());
          if (rolePerm && rolePerm.permissions) {
             canViewPR = !!(rolePerm.permissions['Purchase Requests']?.viewGlobal || rolePerm.permissions['Purchase Requests']?.viewOwn);
             canViewPO = !!(rolePerm.permissions['Purchase Orders']?.viewGlobal || rolePerm.permissions['Purchase Orders']?.viewOwn);
             canViewGRN = !!(rolePerm.permissions['Goods Receipt (GRN)']?.viewGlobal || rolePerm.permissions['Goods Receipt (GRN)']?.viewOwn);
             canViewStock = !!(rolePerm.permissions['Stock']?.viewGlobal || rolePerm.permissions['Stock']?.viewOwn);
             canViewBills = !!(rolePerm.permissions['Vendor Invoices']?.viewGlobal || rolePerm.permissions['Vendor Invoices']?.viewOwn);
             canViewPayReq = !!(rolePerm.permissions['Payment Requests']?.viewGlobal || rolePerm.permissions['Payment Requests']?.viewOwn);
          }
        }

        const promises = [
          canViewPR ? purchaseRequestsApi.getAll().catch(() => null) : Promise.resolve(null),
          canViewPO ? purchaseOrdersApi.getAll().catch(() => null) : Promise.resolve(null),
          canViewGRN ? grnsApi.getAll().catch(() => null) : Promise.resolve(null),
          canViewStock ? stockApi.getAll().catch(() => null) : Promise.resolve(null),
          canViewBills ? vendorBillsApi.getAll().catch(() => null) : Promise.resolve(null),
          canViewPayReq ? paymentRequestsApi.getAll().catch(() => null) : Promise.resolve(null),
          projectsApi.getAll().catch(() => null),
          itemsApi.getAll().catch(() => null),
          vendorsApi.getAll().catch(() => null)
        ];

        const [prRes, poRes, grnRes, stockRes, billRes, payRes, projRes, itemRes, vendRes] = await Promise.all(promises);

        setDb(prev => ({
          ...prev,
          purchaseRequests: prRes && Array.isArray(prRes.data) ? deduplicateById(prRes.data) : prev.purchaseRequests,
          purchaseOrders: poRes && Array.isArray(poRes.data) ? deduplicateById(poRes.data) : prev.purchaseOrders,
          grns: grnRes && Array.isArray(grnRes.data) ? deduplicateById(grnRes.data) : prev.grns,
          stock: stockRes && Array.isArray(stockRes.data) ? deduplicateById(stockRes.data) : prev.stock,
          vendorBills: billRes && Array.isArray(billRes.data) ? deduplicateById(billRes.data) : prev.vendorBills,
          paymentRequests: payRes && Array.isArray(payRes.data) ? deduplicateById(payRes.data) : prev.paymentRequests,
          projects: projRes && Array.isArray(projRes.data) ? deduplicateById(projRes.data) : prev.projects,
          items: itemRes && Array.isArray(itemRes.data) ? deduplicateById(itemRes.data) : prev.items,
          vendors: vendRes && Array.isArray(vendRes.data) ? deduplicateById(vendRes.data) : prev.vendors,
        }));
      } else if (tab === 'pr') {
        const [prRes, projRes, itemsRes] = await Promise.all([
          purchaseRequestsApi.getAll(),
          projectsApi.getAll().catch(() => null),
          itemsApi.getAll().catch(() => null)
        ]);
        setDb(prev => ({ 
          ...prev, 
          purchaseRequests: (prRes?.status === 200 || prRes?.status === 'success') && Array.isArray(prRes.data) ? deduplicateById(prRes.data) : prev.purchaseRequests,
          projects: (projRes?.status === 200 || projRes?.status === 'success') && Array.isArray(projRes.data) ? deduplicateById(projRes.data) : prev.projects,
          items: (itemsRes?.status === 200 || itemsRes?.status === 'success') && Array.isArray(itemsRes.data) ? deduplicateById(itemsRes.data) : prev.items
        }));
      } else if (tab === 'po') {
        const res = await purchaseOrdersApi.getAll();
        if ((res?.status === 200 || res?.status === 'success') && Array.isArray(res.data)) {
          setDb(prev => ({ ...prev, purchaseOrders: deduplicateById(res.data) }));
        }
      } else if (tab === 'grn') {
        const res = await grnsApi.getAll();
        if ((res?.status === 200 || res?.status === 'success') && Array.isArray(res.data)) {
          setDb(prev => ({ ...prev, grns: deduplicateById(res.data) }));
        }
      } else if (tab === 'stock') {
        const res = await stockApi.getAll();
        if ((res?.status === 200 || res?.status === 'success') && Array.isArray(res.data)) {
          setDb(prev => ({ ...prev, stock: deduplicateById(res.data) }));
        }
      } else if (tab === 'outward') {
        const res = await outwardsApi.getAll();
        if ((res?.status === 200 || res?.status === 'success') && Array.isArray(res.data)) {
          setDb(prev => ({ ...prev, storeOutwards: deduplicateById(res.data) }));
        }
      } else if (tab === 'bills') {
        const res = await vendorBillsApi.getAll();
        if ((res?.status === 200 || res?.status === 'success') && Array.isArray(res.data)) {
          setDb(prev => ({ ...prev, vendorBills: deduplicateById(res.data) }));
        }
      } else if (tab === 'payment-req') {
        const res = await paymentRequestsApi.getAll();
        if ((res?.status === 200 || res?.status === 'success') && Array.isArray(res.data)) {
          setDb(prev => ({ ...prev, paymentRequests: deduplicateById(res.data) }));
        }
      } else if (tab === 'payments') {
        const res = await paymentEntriesApi.getAll();
        if ((res?.status === 200 || res?.status === 'success') && Array.isArray(res.data)) {
          setDb(prev => ({ ...prev, paymentEntries: deduplicateById(res.data) }));
        }
      } else if (tab === 'masters') {
        const [u, p, v, c, un, it, r] = await Promise.allSettled([
          usersApi.getAll(),
          projectsApi.getAll(),
          vendorsApi.getAll(),
          categoriesApi.getAll(),
          unitsApi.getAll(),
          itemsApi.getAll(),
          rolesApi.getAll()
        ]);
        setDb(prev => ({
          ...prev,
          users: u.status === 'fulfilled' && u.value?.data ? deduplicateById(u.value.data) : prev.users,
          projects: p.status === 'fulfilled' && p.value?.data ? deduplicateById(p.value.data) : prev.projects,
          vendors: v.status === 'fulfilled' && v.value?.data ? deduplicateById(v.value.data) : prev.vendors,
          categories: c.status === 'fulfilled' && c.value?.data ? deduplicateById(c.value.data) : prev.categories,
          units: un.status === 'fulfilled' && un.value?.data ? deduplicateById(un.value.data) : prev.units,
          items: it.status === 'fulfilled' && it.value?.data ? deduplicateById(it.value.data) : prev.items,
          rolePermissions: r.status === 'fulfilled' && r.value?.data ? deduplicateById(r.value.data) : prev.rolePermissions,
        }));
      } else if (tab === 'permissions') {
        const res = await rolePermissionsApi.getAll();
        if ((res?.status === 200 || res?.status === 'success') && Array.isArray(res.data)) {
          setDb(prev => ({ ...prev, rolePermissions: deduplicateById(res.data) }));
        }
      } else if (tab === 'audit') {
        const res = await auditLogsApi.getAll();
        if ((res?.status === 200 || res?.status === 'success') && Array.isArray(res.data)) {
          setDb(prev => ({ ...prev, auditLogs: deduplicateById(res.data) }));
        }
      } else if (tab === 'notifications') {
        const res = await notificationsApi.getAll();
        if ((res?.status === 200 || res?.status === 'success') && Array.isArray(res.data)) {
          setDb(prev => ({ ...prev, notifications: deduplicateById(res.data) }));
        }
      }
    } catch (err: any) {
      console.warn(`[Live Fetch ${tab}]`, err?.message || err);
    }
  }, []);

  // Fetch tab-specific data on tab change
  useEffect(() => {
    fetchTabData(activeTab);
  }, [activeTab, fetchTabData]);

  // Load initial complete state from backend on mount
  useEffect(() => {
    const active = localStorage.getItem('active_user');
    const token = localStorage.getItem('auth_token');

    if (active) {
      try {
        const parsed = JSON.parse(active);
        setCurrentUser(parsed);

        // If auth token is missing or old local mock, obtain valid JWT from backend
        if (!token || token.startsWith('local_')) {
          authApi.login(parsed.email || 'admin@gmail.com', '123456')
            .then((res) => {
              const d = (res.data || res) as any;
              if (d?.token) {
                localStorage.setItem('auth_token', d.token);
                fetchTabData(activeTab);
              }
            })
            .catch(() => {});
        }
      } catch (e) {
        console.error(e);
      }
    } else {
      router.push('/login');
      return;
    }

    // Initial data fetch via active tab REST API
    fetchTabData('dashboard');
    setBackendOnline(true);
  }, [fetchTabData, router]); // Removed activeTab dependency

  const simulateRole = (role: string) => {
    if (!db) return;
    let match = db.users.find(u => u.role === role);
    if (!match) {
      match = {
        id: `usr-mock-${Date.now()}`,
        name: `${role} User`,
        email: `${role.toLowerCase().replace(/\s+/g, '')}@gmail.com`,
        role,
        department: 'Operations',
        active: true
      };
      db.users.push(match);
    }
    localStorage.setItem('active_user', JSON.stringify(match));
    setCurrentUser(match);
    toast.success(`Active role switched to ${role}`);
  };

  const handleLogout = () => {
    localStorage.removeItem('active_user');
    localStorage.removeItem('auth_token');
    router.push('/login');
  };

  // ─── PURCHASE REQUEST HANDLERS ─────────────────────────────────────────────
  const handleCreatePR = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!db || !currentUser) return;
    if (prForm.items.length === 0) { toast.error('Please add at least one line item'); return; }

    const prNum = `PR-${new Date().getFullYear()}-${String(db.purchaseRequests.length + 101).padStart(5, '0')}`;
    const targetProject = db.projects.find(p => p.id === prForm.projectId);
    const itemsWithNames = prForm.items.map((it: any) => {
      const dbIt = db.items.find(i => i.id === it.itemId);
      return { itemId: it.itemId, itemName: dbIt?.name || 'Item', quantity: it.quantity, unit: dbIt?.unit || 'Pcs', remarks: it.remarks || '' };
    });

    const newPrPayload: Omit<PurchaseRequest, 'id'> = {
      prNumber: prNum,
      requestDate: new Date().toISOString().split('T')[0],
      projectId: prForm.projectId,
      projectName: targetProject?.name || 'General Project',
      requestedBy: currentUser.id,
      requesterName: currentUser.name,
      requiredDate: prForm.requiredDate,
      priority: prForm.priority as any,
      items: itemsWithNames,
      status: 'Submitted',
      history: [{ status: 'Submitted', user: currentUser.name, timestamp: new Date().toISOString(), remarks: 'PR Created' }]
    };

    try {
      const res = await purchaseRequestsApi.create(newPrPayload as any);
      const createdItem = (res?.data || res) as any;
      const finalPr: PurchaseRequest = {
        ...newPrPayload,
        id: createdItem?.id || createdItem?._id || `pr-${Date.now()}`
      };

      setDb(prev => ({ ...prev, purchaseRequests: [finalPr, ...prev.purchaseRequests] }));
      await fetchTabData('pr');

      addAuditLog(currentUser.id, 'Create PR', '', `Created PR ${prNum}`, 'PR', finalPr.id);
      sendNotification('Approver', 'New PR Submitted', `PR ${prNum} submitted by ${currentUser.name}`);
      notificationsApi.create({ recipientRole: 'Approver', title: 'New PR Submitted', message: `PR ${prNum} submitted by ${currentUser.name}`, readBy: [], read: false, timestamp: new Date().toISOString(), id: '' } as any).catch(() => {});

      setPrForm({ projectId: '', requiredDate: new Date().toISOString().split('T')[0], priority: 'Medium', items: [], attachmentUrl: '' });
      setOpenModal(null);
      toast.success(`Purchase Request ${prNum} created successfully!`);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to create Purchase Request via API. Data not saved.');
    }
  };

  const handleUpdatePRStatus = async (prId: string, status: PurchaseRequest['status'], reason?: string) => {
    if (!db || !currentUser) return;
    const pr = db.purchaseRequests.find(p => p.id === prId);
    if (!pr) return;

    const newHistory = [...(pr.history || []), { status, user: currentUser.name, timestamp: new Date().toISOString(), remarks: reason || `Status set to ${status}` }];

    try {
      await purchaseRequestsApi.update(prId, { status, rejectionReason: reason, history: newHistory });
      setDb(prev => ({
        ...prev,
        purchaseRequests: prev.purchaseRequests.map(p => p.id === prId ? { ...p, status, rejectionReason: reason, history: newHistory } : p)
      }));
      await fetchTabData('pr');
      addAuditLog(currentUser.id, 'PR Status Update', '', `Updated PR ${pr.prNumber} to ${status}`, 'PR', pr.id);
      toast.success(`PR ${pr.prNumber} updated to ${status}`);
    } catch (err: any) {
      toast.error(err?.message || `Failed to update PR status to ${status} via API.`);
    }
  };

  // ─── PURCHASE ORDER HANDLERS ───────────────────────────────────────────────
  const handleCreatePO = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!db || !currentUser) return;
    const selectedPr = db.purchaseRequests.find(p => p.id === poForm.prId);
    const selectedVendor = db.vendors.find(v => v.id === poForm.vendorId);
    if (!selectedPr || !selectedVendor) { toast.error('Select valid PR & Vendor'); return; }

    const poNum = `PO-${new Date().getFullYear()}-${String(db.purchaseOrders.length + 101).padStart(5, '0')}`;
    let total = 0;
    const poItems = poForm.items.map((it: any) => {
      const itemObj = db.items.find(i => i.id === it.itemId);
      const lineTotal = (it.quantity * it.rate) * (1 + (it.tax / 100));
      total += lineTotal;
      return { itemId: it.itemId, itemName: itemObj?.name || 'Item', quantity: it.quantity, unit: itemObj?.unit || 'Pcs', rate: it.rate, tax: it.tax, discount: 0, amount: lineTotal, totalAmount: lineTotal };
    });

    const newPoPayload = {
      poNumber: poNum,
      poDate: new Date().toISOString().split('T')[0],
      prId: selectedPr.id,
      prNumber: selectedPr.prNumber,
      projectId: selectedPr.projectId,
      projectName: selectedPr.projectName,
      vendorId: selectedVendor.id,
      vendorName: selectedVendor.name,
      creditPeriod: poForm.creditPeriod,
      expectedDeliveryDate: poForm.expectedDeliveryDate,
      deliveryLocation: poForm.deliveryLocation,
      termsConditions: poForm.termsConditions || 'Standard Payment Terms Apply',
      remarks: poForm.remarks || '',
      items: poItems,
      totalPOAmount: total,
      totalAmount: total,
      status: 'Approved' as const,
    };

    try {
      const res = await purchaseOrdersApi.create(newPoPayload as any);
      const createdItem = (res?.data || res) as any;
      const finalPo: PurchaseOrder = {
        ...newPoPayload,
        id: createdItem?.id || createdItem?._id || `po-${Date.now()}`
      };

      await purchaseRequestsApi.update(selectedPr.id, { status: 'PO Created' }).catch(() => {});
      setDb(prev => ({
        ...prev,
        purchaseOrders: [finalPo, ...prev.purchaseOrders],
        purchaseRequests: prev.purchaseRequests.map(p => p.id === selectedPr.id ? { ...p, status: 'PO Created' } : p)
      }));
      await fetchTabData('po');

      addAuditLog(currentUser.id, 'Create PO', '', `Generated PO ${poNum}`, 'PO', finalPo.id);
      sendNotification('Store', 'New Purchase Order', `PO ${poNum} issued for ${selectedVendor.name}`);

      setPoForm({ prId: '', vendorId: '', creditPeriod: 30, expectedDeliveryDate: '', deliveryLocation: '', termsConditions: '', remarks: '', items: [] });
      setOpenModal(null);
      toast.success(`Purchase Order ${poNum} issued successfully!`);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to create Purchase Order via API. Data not saved.');
    }
  };

  const handleUpdatePOStatus = async (poId: string, status: PurchaseOrder['status']) => {
    if (!db || !currentUser) return;
    const po = db.purchaseOrders.find(p => p.id === poId);
    if (!po) return;

    try {
      await purchaseOrdersApi.update(poId, { status });
      setDb(prev => ({
        ...prev,
        purchaseOrders: prev.purchaseOrders.map(p => p.id === poId ? { ...p, status } : p)
      }));
      await fetchTabData('po');
      toast.success(`PO ${po.poNumber} updated to ${status}`);
    } catch (err: any) {
      toast.error(err?.message || `Failed to update PO status to ${status} via API.`);
    }
  };

  // ─── GRN HANDLERS ─────────────────────────────────────────────────────────
  const handleCreateGRN = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!db || !currentUser) return;
    const selectedPo = db.purchaseOrders.find(p => p.id === grnForm.poId);
    if (!selectedPo) { toast.error('Please select a valid Purchase Order'); return; }

    const grnNum = `GRN-${new Date().getFullYear()}-${String(db.grns.length + 101).padStart(5, '0')}`;
    const grnItems = selectedPo.items.map(it => ({
      itemId: it.itemId, itemName: it.itemName, orderedQty: it.quantity, receivedQty: it.quantity,
      shortQty: 0, excessQty: 0, damagedQty: 0, unit: it.unit || 'Pcs', batchNumber: `BATCH-${Date.now().toString().slice(-4)}`
    }));

    const newGrnPayload = {
      grnNumber: grnNum,
      grnDate: new Date().toISOString().split('T')[0],
      receivedDate: new Date().toISOString().split('T')[0],
      poId: selectedPo.id, poNumber: selectedPo.poNumber,
      vendorId: selectedPo.vendorId, vendorName: selectedPo.vendorName || 'Vendor',
      projectId: selectedPo.projectId, projectName: selectedPo.projectName,
      items: grnItems, vehicleNumber: grnForm.vehicleNumber,
      challanNumber: grnForm.challanNumber, vendorInvoiceNumber: grnForm.vendorInvoiceNumber || '',
      remarks: grnForm.remarks || 'Material verified at store',
      receivedBy: currentUser.id, receiverName: currentUser.name
    };

    try {
      const res = await grnsApi.create(newGrnPayload as any);
      const createdItem = (res?.data || res) as any;
      const finalGrn: GRN = {
        ...newGrnPayload,
        id: createdItem?.id || createdItem?._id || `grn-${Date.now()}`
      };

      await fetchTabData('grn');
      await fetchTabData('stock');

      addAuditLog(currentUser.id, 'Create GRN', '', `Received GRN ${grnNum} for PO ${selectedPo.poNumber}`, 'GRN', finalGrn.id);
      sendNotification('Accounts', 'GRN Inward Verified', `GRN ${grnNum} received for ${selectedPo.vendorName}`);

      setGrnForm({ poId: '', vehicleNumber: '', challanNumber: '', vendorInvoiceNumber: '', remarks: '', items: [] });
      setOpenModal(null);
      toast.success(`GRN ${grnNum} registered and stock updated via API!`);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to register GRN via API. Data not saved.');
    }
  };

  // ─── STORE OUTWARD HANDLERS ────────────────────────────────────────────────
  const handleCreateOutward = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!db || !currentUser) return;
    if (!outwardItemInput.itemId) { toast.error('Please select an item to issue'); return; }

    const itemObj = db.items.find(i => i.id === outwardItemInput.itemId);
    const targetProject = db.projects.find(p => p.id === outwardForm.projectId);
    const stockItem = db.stock.find(s => s.projectId === outwardForm.projectId && s.itemId === outwardItemInput.itemId);

    if (!stockItem || stockItem.quantity < outwardItemInput.quantity) {
      toast.error(`Insufficient stock! Current: ${stockItem?.quantity || 0} ${itemObj?.unit || 'Pcs'}`);
      return;
    }

    const outNum = `OUT-${new Date().getFullYear()}-${String(db.storeOutwards.length + 101).padStart(5, '0')}`;
    const issuedItem = { itemId: outwardItemInput.itemId, itemName: itemObj?.name || 'Item', quantity: outwardItemInput.quantity, unit: itemObj?.unit || 'Pcs' };

    const newOutwardPayload = {
      outwardNumber: outNum, issueNumber: outNum,
      issueDate: new Date().toISOString().split('T')[0], date: new Date().toISOString().split('T')[0],
      projectId: outwardForm.projectId, projectName: targetProject?.name || 'Site Project',
      issuedTo: outwardForm.issuedTo, department: outwardForm.department, purpose: outwardForm.purpose,
      items: [issuedItem], remarks: outwardForm.remarks || '', issuedBy: currentUser.id, issuedByName: currentUser.name, status: 'Issued'
    };

    try {
      const res = await outwardsApi.create(newOutwardPayload as any);
      const createdItem = (res?.data || res) as any;
      const finalOut: StoreOutward = {
        ...newOutwardPayload,
        id: createdItem?.id || createdItem?._id || `out-${Date.now()}`
      };

      await fetchTabData('outward');
      await fetchTabData('stock');

      addAuditLog(currentUser.id, 'Store Outward', '', `Issued ${outwardItemInput.quantity} ${itemObj?.unit} via ${outNum}`, 'Outward', finalOut.id);

      setOutwardForm({ projectId: '', issuedTo: '', department: '', purpose: '', remarks: '', items: [] });
      setOutwardItemInput({ itemId: '', quantity: 1 });
      setOpenModal(null);
      toast.success(`Store Outward Voucher ${outNum} generated via API!`);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to issue Store Outward via API. Data not saved.');
    }
  };

  // ─── VENDOR BILL HANDLERS ─────────────────────────────────────────────────
  const handleCreateBill = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!db || !currentUser) return;
    const selectedPo = db.purchaseOrders.find(p => p.id === billForm.poId);
    if (!selectedPo) { toast.error('Select a valid Purchase Order'); return; }

    const billNum = `BILL-${new Date().getFullYear()}-${String(db.vendorBills.length + 101).padStart(5, '0')}`;
    const billDateObj = new Date(billForm.billDate || Date.now());
    const dueDateObj = new Date(billDateObj.getTime() + (billForm.creditPeriod || 30) * 86400000);

    const newBillPayload = {
      vendorId: selectedPo.vendorId, vendorName: selectedPo.vendorName || 'Vendor',
      poId: selectedPo.id, poNumber: selectedPo.poNumber, billNumber: billNum,
      vendorInvoiceNumber: billForm.vendorInvoiceNumber || billNum,
      billDate: billForm.billDate || new Date().toISOString().split('T')[0],
      billAmount: billForm.billAmount, totalAmount: billForm.billAmount,
      creditPeriod: billForm.creditPeriod || 30,
      dueDate: dueDateObj.toISOString().split('T')[0],
      paidAmount: 0, outstandingAmount: billForm.billAmount,
      paymentStatus: 'Upcoming', status: 'Submitted'
    };

    try {
      const res = await vendorBillsApi.create(newBillPayload as any);
      const createdItem = (res?.data || res) as any;
      const finalBill: VendorBill = {
        ...newBillPayload,
        id: createdItem?.id || createdItem?._id || `bill-${Date.now()}`
      };

      await fetchTabData('bills');

      addAuditLog(currentUser.id, 'Create Bill', '', `Registered Bill ${billNum}`, 'Bill', finalBill.id);
      sendNotification('Accounts', 'New Vendor Invoice', `Invoice ${finalBill.vendorInvoiceNumber} registered for ${finalBill.vendorName}`);

      setBillForm({ poId: '', vendorInvoiceNumber: '', billDate: new Date().toISOString().split('T')[0], billAmount: 0, creditPeriod: 30, dueDate: '' });
      setOpenModal(null);
      toast.success(`Vendor Bill ${billNum} registered via API!`);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to register Vendor Bill via API. Data not saved.');
    }
  };

  // ─── PAYMENT REQUEST HANDLERS ─────────────────────────────────────────────
  const handleCreatePaymentReq = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!db || !currentUser) return;
    const selectedBill = db.vendorBills.find(b => b.id === paymentReqForm.billId);
    if (!selectedBill) { toast.error('Please select a valid Bill'); return; }

    const reqNum = `REQ-${new Date().getFullYear()}-${String(db.paymentRequests.length + 101).padStart(5, '0')}`;
    const newReqPayload = {
      vendorId: selectedBill.vendorId, vendorName: selectedBill.vendorName,
      billId: selectedBill.id, billNumber: selectedBill.billNumber, requestNumber: reqNum, requestId: reqNum,
      poNumber: selectedBill.poNumber, billAmount: selectedBill.billAmount,
      dueDate: selectedBill.dueDate, outstandingAmount: selectedBill.outstandingAmount,
      requestedAmount: paymentReqForm.requestedAmount,
      requestDate: new Date().toISOString().split('T')[0],
      requestedBy: currentUser.id, requesterName: currentUser.name,
      remarks: paymentReqForm.remarks || 'Payment request initiated', status: 'Submitted'
    };

    try {
      const res = await paymentRequestsApi.create(newReqPayload as any);
      const createdItem = (res?.data || res) as any;
      const finalReq: PaymentRequest = {
        ...newReqPayload,
        id: createdItem?.id || createdItem?._id || `payreq-${Date.now()}`
      };

      await fetchTabData('payment-req');
      await fetchTabData('bills');

      addAuditLog(currentUser.id, 'Payment Request', '', `Raised ${reqNum} for ₹${paymentReqForm.requestedAmount}`, 'PaymentRequest', finalReq.id);
      sendNotification('Admin', 'Payment Request Submitted', `${reqNum} created for ${selectedBill.vendorName}`);

      setPaymentReqForm({ billId: '', requestedAmount: 0, remarks: '' });
      setOpenModal(null);
      toast.success(`Payment Request ${reqNum} submitted via API!`);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to submit Payment Request via API. Data not saved.');
    }
  };

  // ─── PAYMENT ENTRY HANDLERS ───────────────────────────────────────────────
  const handleCreatePaymentEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!db || !currentUser) return;
    const selectedBill = db.vendorBills.find(b => b.id === paymentEntryForm.billId);
    if (!selectedBill) { toast.error('Select a valid Bill'); return; }

    const payNum = `PAY-${new Date().getFullYear()}-${String(db.paymentEntries.length + 101).padStart(5, '0')}`;
    const newEntryPayload = {
      paymentId: payNum, paymentNumber: payNum,
      paymentDate: new Date().toISOString().split('T')[0],
      vendorId: selectedBill.vendorId, vendorName: selectedBill.vendorName,
      billId: selectedBill.id, billNumber: selectedBill.billNumber,
      poNumber: selectedBill.poNumber,
      paymentAmount: paymentEntryForm.paymentAmount, paymentMode: paymentEntryForm.paymentMode,
      transactionNumber: paymentEntryForm.transactionNumber, remarks: paymentEntryForm.remarks || '',
      enteredBy: currentUser.id, enteredByName: currentUser.name
    };

    try {
      const res = await paymentEntriesApi.create(newEntryPayload as any);
      const createdItem = (res?.data || res) as any;
      const finalEntry: PaymentEntry = {
        ...newEntryPayload,
        id: createdItem?.id || createdItem?._id || `pay-${Date.now()}`
      };

      await fetchTabData('payments');
      await fetchTabData('bills');

      addAuditLog(currentUser.id, 'Payment Entry', '', `Disbursed ₹${paymentEntryForm.paymentAmount} via ${paymentEntryForm.paymentMode} (${payNum})`, 'PaymentEntry', finalEntry.id);
      sendNotification('Accounts', 'Payment Disbursed', `${payNum} recorded for ${selectedBill.vendorName}`);

      setPaymentEntryForm({ billId: '', paymentAmount: 0, paymentMode: 'Bank Transfer/NEFT/RTGS', transactionNumber: '', remarks: '' });
      setOpenModal(null);
      toast.success(`Payment Voucher ${payNum} saved via API!`);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to record Payment Entry via API. Data not saved.');
    }
  };

  const handleToggleModule = async (role: string, module: string) => {
    if (!db) return;
    const rp = db.rolePermissions.find(r => r.role === role);
    if (rp) {
      const nextModules = rp.modules.includes(module)
        ? rp.modules.filter(m => m !== module)
        : [...rp.modules, module];
      try {
        await rolePermissionsApi.update(role, { modules: nextModules, permissions: rp.permissions });
        setDb(prev => ({
          ...prev,
          rolePermissions: prev.rolePermissions.map(r => r.role === role ? { ...r, modules: nextModules } : r)
        }));
        await fetchTabData('permissions');
        toast.success(`Permission updated for ${role}`);
      } catch (err: any) {
        toast.error(err?.message || `Failed to update permissions for ${role} via API`);
      }
    }
  };

  if (!currentUser) return null;

  // Filtered datasets by Project, Search, and View Scope (Global vs Own)
  const prScope = getViewScope(db.rolePermissions, currentUser, 'Purchase Requests');
  const poScope = getViewScope(db.rolePermissions, currentUser, 'Purchase Orders');
  const grnScope = getViewScope(db.rolePermissions, currentUser, 'Goods Receipt (GRN)');
  const outwardScope = getViewScope(db.rolePermissions, currentUser, 'Store Outward');
  const billScope = getViewScope(db.rolePermissions, currentUser, 'Vendor Invoices');
  const payReqScope = getViewScope(db.rolePermissions, currentUser, 'Payment Requests');
  const payEntryScope = getViewScope(db.rolePermissions, currentUser, 'Payment Entries');

  const filteredPrs = db.purchaseRequests.filter(pr => {
    if (prScope === 'own') {
      const isOwn = pr.requestedBy === currentUser.id || (pr as any).createdBy === currentUser.id || pr.requesterName === currentUser.name;
      if (!isOwn) return false;
    }
    return (!filterProject || pr.projectId === filterProject) &&
      (!globalSearch || pr.prNumber.toLowerCase().includes(globalSearch.toLowerCase()) || (pr.projectName || '').toLowerCase().includes(globalSearch.toLowerCase()));
  });

  const filteredPos = db.purchaseOrders.filter(po => {
    if (poScope === 'own') {
      const isOwn = (po as any).createdBy === currentUser.id || (po as any).buyerId === currentUser.id;
      if (!isOwn && currentUser.role !== 'Admin') return false;
    }
    return (!filterProject || po.projectId === filterProject) &&
      (!globalSearch || po.poNumber.toLowerCase().includes(globalSearch.toLowerCase()) || (po.vendorName || '').toLowerCase().includes(globalSearch.toLowerCase()));
  });

  const filteredGrns = db.grns.filter(grn => {
    if (grnScope === 'own') {
      const isOwn = grn.receivedBy === currentUser.id || (grn as any).createdBy === currentUser.id;
      if (!isOwn && currentUser.role !== 'Admin') return false;
    }
    return (!filterProject || grn.projectId === filterProject) &&
      (!globalSearch || grn.grnNumber.toLowerCase().includes(globalSearch.toLowerCase()) || (grn.vendorName || '').toLowerCase().includes(globalSearch.toLowerCase()));
  });

  const filteredOutwards = db.storeOutwards.filter(out => {
    if (outwardScope === 'own') {
      const isOwn = out.issuedBy === currentUser.id || (out as any).createdBy === currentUser.id;
      if (!isOwn && currentUser.role !== 'Admin') return false;
    }
    return (!filterProject || out.projectId === filterProject) &&
      (!globalSearch || (out.outwardNumber || out.issueNumber || '').toLowerCase().includes(globalSearch.toLowerCase()) || (out.issuedTo || '').toLowerCase().includes(globalSearch.toLowerCase()));
  });

  const filteredBills = db.vendorBills.filter(bill => {
    if (billScope === 'own') {
      const isOwn = (bill as any).createdBy === currentUser.id;
      if (!isOwn && currentUser.role !== 'Admin') return false;
    }
    return (!globalSearch || bill.billNumber.toLowerCase().includes(globalSearch.toLowerCase()) || (bill.vendorName || '').toLowerCase().includes(globalSearch.toLowerCase()));
  });

  const filteredPayReqs = db.paymentRequests.filter(req => {
    if (payReqScope === 'own') {
      const isOwn = req.requestedBy === currentUser.id || req.createdBy === currentUser.id || req.requesterName === currentUser.name;
      if (!isOwn && currentUser.role !== 'Admin') return false;
    }
    return (!globalSearch || (req.requestNumber || req.requestId || '').toLowerCase().includes(globalSearch.toLowerCase()) || (req.vendorName || '').toLowerCase().includes(globalSearch.toLowerCase()));
  });

  const filteredPayEntries = db.paymentEntries.filter(entry => {
    if (payEntryScope === 'own') {
      const isOwn = entry.enteredBy === currentUser.id || (entry as any).createdBy === currentUser.id;
      if (!isOwn && currentUser.role !== 'Admin') return false;
    }
    return (!globalSearch || (entry.paymentNumber || entry.paymentId || '').toLowerCase().includes(globalSearch.toLowerCase()) || (entry.vendorName || '').toLowerCase().includes(globalSearch.toLowerCase()));
  });

  const filteredStocks = db.stock.filter(s =>
    (!filterProject || s.projectId === filterProject) &&
    (!globalSearch || (s.itemName || '').toLowerCase().includes(globalSearch.toLowerCase()))
  );
  const unreadNotificationsCount = db.notifications.filter(n => !n.read).length;

  return (
    <div className="min-h-screen flex bg-slate-100/70 text-slate-900">
      {/* Sidebar Navigation */}
      {navLayout === 'sidebar' && (
        <SidebarNav
          activeTab={activeTab}
          setActiveTab={handleTabChange}
          currentUser={currentUser}
          rolePermissions={db.rolePermissions}
          onLogout={handleLogout}
          unreadNotificationsCount={unreadNotificationsCount}
        />
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <HeaderNav
          currentUser={currentUser}
          projects={db.projects}
          globalSearch={globalSearch}
          setGlobalSearch={setGlobalSearch}
          filterProject={filterProject}
          setFilterProject={setFilterProject}
          activeTab={activeTab}
          setActiveTab={handleTabChange}
          unreadNotificationsCount={unreadNotificationsCount}
          navLayout={navLayout}
          setNavLayout={setNavLayout}
          rolePermissions={db.rolePermissions}
          simulateRole={simulateRole}
          onOpenCreatePRModal={() => setOpenModal('create-pr')}
        />

        <main className="flex-1 p-6 overflow-y-auto space-y-6">
          {activeTab === 'dashboard' && (
            <DashboardOverview
              purchaseRequests={db.purchaseRequests}
              purchaseOrders={db.purchaseOrders}
              stocks={db.stock}
              vendorBills={db.vendorBills}
              currentUser={currentUser}
              rolePermissions={db.rolePermissions}
              setActiveTab={handleTabChange}
              onOpenCreatePRModal={() => setOpenModal('create-pr')}
              onOpenCreatePOModal={() => setOpenModal('create-po')}
              onOpenCreateGRNModal={() => setOpenModal('create-grn')}
              onOpenCreateBillModal={() => setOpenModal('create-bill')}
            />
          )}

          {activeTab === 'masters' && (
            <MastersTab
              users={db.users}
              projects={db.projects}
              vendors={db.vendors}
              categories={db.categories}
              units={db.units || []}
              items={db.items}
              currentUser={currentUser}
              rolePermissions={db.rolePermissions}
              onAddUser={async (u: any) => {
                const newUser = { id: `usr-${Date.now()}`, ...u, password: u.password || '123456', email: u.email.toLowerCase().trim() };
                try {
                  await usersApi.create(newUser);
                  await fetchTabData('masters');
                  addAuditLog(currentUser.id, 'Create User', '', `Created user ${u.name}`, 'User', newUser.id);
                  toast.success(`User ${u.name} saved via API!`);
                } catch (err: any) {
                  toast.error(err?.message || 'Failed to save user via API. Data not saved.');
                }
              }}
              onEditUser={async (id, updated) => {
                const cleanedUpdates = { ...updated };
                if (!cleanedUpdates.password) delete cleanedUpdates.password;
                if (cleanedUpdates.email) cleanedUpdates.email = cleanedUpdates.email.toLowerCase().trim();
                try {
                  await usersApi.update(id, cleanedUpdates);
                  await fetchTabData('masters');
                  addAuditLog(currentUser.id, 'Update User', '', `Updated user ${updated.name || id}`, 'User', id);
                  toast.success('User updated successfully via API!');
                } catch (err: any) {
                  toast.error(err?.message || 'Failed to update user via API.');
                }
              }}
              onDeleteUser={async (id) => {
                const targetUser = db.users.find(item => item.id === id);
                try {
                  await usersApi.delete(targetUser?.id || (targetUser as any)?._id || targetUser?.email || id);
                  await fetchTabData('masters');
                  addAuditLog(currentUser.id, 'Delete User', '', `Deleted user ${targetUser?.name || id}`, 'User', id);
                  toast.success('User deleted successfully via API');
                } catch (err: any) {
                  toast.error(err?.message || 'Failed to delete user via API.');
                }
              }}
              onAddProject={async (p) => {
                try {
                  const res = await projectsApi.create(p);
                  await fetchTabData('masters');
                  addAuditLog(currentUser.id, 'Create Project', '', `Added project ${p.name}`, 'Project', (res?.data as any)?.id || (res?.data as any)?._id || '');
                  toast.success(`Project ${p.name} created via API!`);
                } catch (err: any) {
                  toast.error(err?.message || 'Failed to create project via API. Data not saved.');
                }
              }}
              onEditProject={async (id, updated) => {
                try {
                  await projectsApi.update(id, updated);
                  await fetchTabData('masters');
                  toast.success('Project updated via API!');
                } catch (err: any) {
                  toast.error(err?.message || 'Failed to update project via API.');
                }
              }}
              onDeleteProject={async (id) => {
                const p = db.projects.find(item => item.id === id);
                try {
                  await projectsApi.delete(id);
                  await fetchTabData('masters');
                  addAuditLog(currentUser.id, 'Delete Project', '', `Deleted project ${p?.name || id}`, 'Project', id);
                  toast.success('Project deleted via API!');
                } catch (err: any) {
                  toast.error(err?.message || 'Failed to delete project via API.');
                }
              }}
              onAddVendor={async (v) => {
                try {
                  const res = await vendorsApi.create(v);
                  await fetchTabData('masters');
                  addAuditLog(currentUser.id, 'Create Vendor', '', `Added vendor ${v.name}`, 'Vendor', (res?.data as any)?.id || (res?.data as any)?._id || '');
                  toast.success(`Vendor ${v.name} saved via API!`);
                } catch (err: any) {
                  toast.error(err?.message || 'Failed to save vendor via API. Data not saved.');
                }
              }}
              onEditVendor={async (id, updated) => {
                try {
                  await vendorsApi.update(id, updated);
                  await fetchTabData('masters');
                  toast.success('Vendor updated via API!');
                } catch (err: any) {
                  toast.error(err?.message || 'Failed to update vendor via API.');
                }
              }}
              onDeleteVendor={async (id) => {
                const v = db.vendors.find(item => item.id === id);
                try {
                  await vendorsApi.delete(id);
                  await fetchTabData('masters');
                  addAuditLog(currentUser.id, 'Delete Vendor', '', `Deleted vendor ${v?.name || id}`, 'Vendor', id);
                  toast.success('Vendor deleted via API!');
                } catch (err: any) {
                  toast.error(err?.message || 'Failed to delete vendor via API.');
                }
              }}
              onAddCategory={async (c) => {
                try {
                  const res = await categoriesApi.create(c);
                  await fetchTabData('masters');
                  addAuditLog(currentUser.id, 'Create Category', '', `Added category ${c.name}`, 'Category', (res?.data as any)?.id || (res?.data as any)?._id || '');
                  toast.success(`Category ${c.name} added via API!`);
                } catch (err: any) {
                  toast.error(err?.message || 'Failed to add category via API. Data not saved.');
                }
              }}
              onEditCategory={async (id, updated) => {
                try {
                  await categoriesApi.update(id, updated);
                  await fetchTabData('masters');
                  toast.success('Category updated via API!');
                } catch (err: any) {
                  toast.error(err?.message || 'Failed to update category via API.');
                }
              }}
              onDeleteCategory={async (id) => {
                const c = db.categories.find(item => item.id === id);
                try {
                  await categoriesApi.delete(id);
                  await fetchTabData('masters');
                  addAuditLog(currentUser.id, 'Delete Category', '', `Deleted category ${c?.name || id}`, 'Category', id);
                  toast.success('Category deleted via API!');
                } catch (err: any) {
                  toast.error(err?.message || 'Failed to delete category via API.');
                }
              }}
              onAddUnit={async (u) => {
                try {
                  const res = await unitsApi.create(u);
                  await fetchTabData('masters');
                  addAuditLog(currentUser.id, 'Create Unit', '', `Added unit ${u.code} (${u.name})`, 'Unit', (res?.data as any)?.id || (res?.data as any)?._id || '');
                  toast.success(`Unit '${u.code}' saved successfully via API!`);
                } catch (err: any) {
                  toast.error(err?.message || 'Failed to create unit via API. Data not saved.');
                }
              }}
              onEditUnit={async (id, updated) => {
                try {
                  await unitsApi.update(id, updated);
                  await fetchTabData('masters');
                  toast.success('Unit updated via API!');
                } catch (err: any) {
                  toast.error(err?.message || 'Failed to update unit via API.');
                }
              }}
              onDeleteUnit={async (id) => {
                const u = (db.units || []).find(item => item.id === id);
                try {
                  await unitsApi.delete(id);
                  await fetchTabData('masters');
                  addAuditLog(currentUser.id, 'Delete Unit', '', `Deleted unit ${u?.code || id}`, 'Unit', id);
                  toast.success('Unit deleted via API!');
                } catch (err: any) {
                  toast.error(err?.message || 'Failed to delete unit via API.');
                }
              }}
              onAddItem={async (i) => {
                try {
                  const res = await itemsApi.create(i);
                  await fetchTabData('masters');
                  addAuditLog(currentUser.id, 'Create Item', '', `Added item ${i.name}`, 'Item', (res?.data as any)?.id || (res?.data as any)?._id || '');
                  toast.success(`Item ${i.name} registered via API!`);
                } catch (err: any) {
                  toast.error(err?.message || 'Failed to register item via API. Data not saved.');
                }
              }}
              onEditItem={async (id, updated) => {
                try {
                  await itemsApi.update(id, updated);
                  await fetchTabData('masters');
                  toast.success('Item updated via API!');
                } catch (err: any) {
                  toast.error(err?.message || 'Failed to update item via API.');
                }
              }}
              onDeleteItem={async (id) => {
                const i = db.items.find(item => item.id === id);
                try {
                  await itemsApi.delete(id);
                  await fetchTabData('masters');
                  addAuditLog(currentUser.id, 'Delete Item', '', `Deleted item ${i?.name || id}`, 'Item', id);
                  toast.success('Item deleted via API!');
                } catch (err: any) {
                  toast.error(err?.message || 'Failed to delete item via API.');
                }
              }}
              roles={db.rolePermissions}
              onAddRole={async (r) => {
                try {
                  await rolesApi.create(r);
                  await fetchTabData('masters');
                  addAuditLog(currentUser.id, 'Create Role', '', `Added custom role ${r.name || r.role}`, 'RolePermissions', r.role || '');
                  toast.success(`Role '${r.name || r.role}' created successfully via API!`);
                } catch (err: any) {
                  toast.error(err?.message || 'Failed to create role via API. Data not saved.');
                }
              }}
              onEditRole={async (id, updated) => {
                const target = db.rolePermissions.find(r => r.id === id || r._id === id || r.role === id);
                try {
                  await rolesApi.update(target?.id || target?._id || target?.role || id, updated);
                  await fetchTabData('masters');
                  addAuditLog(currentUser.id, 'Update Role', '', `Updated role ${updated.name || updated.role || id}`, 'RolePermissions', id);
                  toast.success(`Role '${updated.name || updated.role || id}' updated successfully via API!`);
                } catch (err: any) {
                  toast.error(err?.message || 'Failed to update role via API.');
                }
              }}
              onDeleteRole={async (id) => {
                const target = db.rolePermissions.find(r => r.id === id || r._id === id || r.role === id);
                if (target?.role === 'Admin') {
                  toast.error('System Admin role cannot be deleted');
                  return;
                }
                try {
                  await rolesApi.delete(target?.id || target?._id || target?.role || id);
                  await fetchTabData('masters');
                  addAuditLog(currentUser.id, 'Delete Role', '', `Deleted role ${target?.name || target?.role || id}`, 'RolePermissions', id);
                  toast.success('Role deleted successfully via API!');
                } catch (err: any) {
                  toast.error(err?.message || 'Failed to delete role via API.');
                }
              }}
            />
          )}

          {activeTab === 'pr' && (
            <PurchaseRequestsTab
              purchaseRequests={filteredPrs}
              projects={db.projects}
              items={db.items}
              currentUser={currentUser}
              rolePermissions={db.rolePermissions}
              onOpenCreatePRModal={() => setOpenModal('create-pr')}
              onUpdatePRStatus={handleUpdatePRStatus}
              onSelectPRDetail={setSelectedPrDetail}
            />
          )}

          {activeTab === 'po' && (
            <PurchaseOrdersTab
              purchaseOrders={filteredPos}
              vendors={db.vendors}
              projects={db.projects}
              currentUser={currentUser}
              rolePermissions={db.rolePermissions}
              onOpenCreatePOModal={() => setOpenModal('create-po')}
              onSelectPoDetail={setSelectedPo}
              onUpdatePOStatus={handleUpdatePOStatus}
            />
          )}

          {activeTab === 'grn' && (
            <GrnTab
              grns={filteredGrns}
              currentUser={currentUser}
              rolePermissions={db.rolePermissions}
              onOpenCreateGRNModal={() => setOpenModal('create-grn')}
            />
          )}

          {activeTab === 'stock' && (
            <StockManagementTab
              stocks={filteredStocks}
              items={db.items}
              categories={db.categories}
            />
          )}

          {activeTab === 'outward' && (
            <StoreOutwardTab
              outwards={filteredOutwards}
              currentUser={currentUser}
              rolePermissions={db.rolePermissions}
              onOpenCreateOutwardModal={() => setOpenModal('create-outward')}
            />
          )}

          {activeTab === 'bills' && (
            <VendorBillsTab
              bills={filteredBills}
              currentUser={currentUser}
              rolePermissions={db.rolePermissions}
              onOpenCreateBillModal={() => setOpenModal('create-bill')}
              onUpdateBillStatus={async (id, status) => {
                const bill = db.vendorBills.find(b => b.id === id);
                try {
                  await vendorBillsApi.update(id, { status });
                  await fetchTabData('bills');
                  toast.success(`Bill ${bill?.billNumber || id} updated to ${status} via API`);
                } catch (err: any) {
                  toast.error(err?.message || `Failed to update bill status to ${status} via API`);
                }
              }}
            />
          )}

          {activeTab === 'payment-req' && (
            <PaymentRequestsTab
              paymentRequests={filteredPayReqs}
              currentUser={currentUser}
              rolePermissions={db.rolePermissions}
              onOpenCreatePaymentReqModal={() => setOpenModal('create-pay-req')}
              onUpdatePaymentReqStatus={async (id, status) => {
                try {
                  await paymentRequestsApi.update(id, { status });
                  await fetchTabData('payment-req');
                  toast.success(`Payment request set to ${status} via API`);
                } catch (err: any) {
                  toast.error(err?.message || `Failed to update payment request status via API`);
                }
              }}
            />
          )}

          {activeTab === 'payments' && (
            <PaymentEntriesTab
              payments={filteredPayEntries}
              currentUser={currentUser}
              rolePermissions={db.rolePermissions}
              onOpenCreatePaymentModal={() => setOpenModal('create-payment')}
            />
          )}

          {activeTab === 'reports' && (
            <ReportsTab
              purchaseRequests={db.purchaseRequests}
              purchaseOrders={db.purchaseOrders}
              grns={db.grns}
              stocks={db.stock}
              outwards={db.storeOutwards}
              bills={db.vendorBills}
              payments={db.paymentEntries}
            />
          )}

          {activeTab === 'audit' && <AuditLogsTab auditLogs={db.auditLogs} />}

          {activeTab === 'notifications' && (
            <NotificationsTab
              notifications={db.notifications}
              onMarkRead={async (id) => {
                try {
                  await notificationsApi.markRead(id);
                  await fetchTabData('notifications');
                } catch (err: any) {
                  console.warn('[Mark notification read failed]', err);
                }
              }}
            />
          )}

          {activeTab === 'permissions' && (
            <RolePermissionsTab
              rolePermissions={db.rolePermissions}
              onSaveRolePermission={async (role, payload) => {
                const finalRole = payload.newRoleName || role;
                try {
                  await rolePermissionsApi.update(role, payload);
                  await fetchTabData('permissions');
                  addAuditLog(currentUser.id, 'Update Role Permissions', '', `Updated permissions for ${finalRole}`, 'RolePermissions', finalRole);
                  toast.success(`Role & capabilities saved for ${finalRole} via API!`);
                } catch (err: any) {
                  toast.error(err?.message || `Failed to save role permissions for ${finalRole} via API`);
                }
              }}
              onDeleteRolePermission={async (role) => {
                try {
                  await rolePermissionsApi.delete(role);
                  await fetchTabData('permissions');
                  addAuditLog(currentUser.id, 'Delete Role', '', `Deleted role ${role}`, 'RolePermissions', role);
                  toast.success(`Role ${role} deleted successfully via API`);
                } catch (err: any) {
                  toast.error(err?.message || `Failed to delete role ${role} via API`);
                }
              }}
            />
          )}
        </main>
      </div>

      {/* Global Modals Container */}
      <Modals
        openModal={openModal}
        setOpenModal={setOpenModal}
        projects={db.projects}
        vendors={db.vendors}
        items={db.items}
        purchaseRequests={db.purchaseRequests}
        purchaseOrders={db.purchaseOrders}
        vendorBills={db.vendorBills}
        paymentRequests={db.paymentRequests}
        stocks={db.stock}
        prForm={prForm}
        setPrForm={setPrForm}
        prItemInput={prItemInput}
        setPrItemInput={setPrItemInput}
        handleCreatePR={handleCreatePR}
        poForm={poForm}
        setPoForm={setPoForm}
        handleCreatePO={handleCreatePO}
        grnForm={grnForm}
        setGrnForm={setGrnForm}
        handleCreateGRN={handleCreateGRN}
        outwardForm={outwardForm}
        setOutwardForm={setOutwardForm}
        outwardItemInput={outwardItemInput}
        setOutwardItemInput={setOutwardItemInput}
        handleCreateOutward={handleCreateOutward}
        billForm={billForm}
        setBillForm={setBillForm}
        handleCreateBill={handleCreateBill}
        paymentReqForm={paymentReqForm}
        setPaymentReqForm={setPaymentReqForm}
        handleCreatePaymentReq={handleCreatePaymentReq}
        paymentEntryForm={paymentEntryForm}
        setPaymentEntryForm={setPaymentEntryForm}
        handleCreatePaymentEntry={handleCreatePaymentEntry}
        selectedPrDetail={selectedPrDetail}
        setSelectedPrDetail={setSelectedPrDetail}
        selectedPo={selectedPo}
        setSelectedPo={setSelectedPo}
      />
    </div>
  );
}
