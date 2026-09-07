"use client";

import React, { useState, useEffect, useCallback } from 'react';
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
  DatabaseState
} from '@/lib/storeData';
import {
  api,
  syncApi,
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
  projectsApi,
  vendorsApi,
  categoriesApi,
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
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    if (typeof window !== 'undefined') {
      const active = localStorage.getItem('active_user');
      if (active) {
        try { return JSON.parse(active); } catch (e) { console.error(e); }
      }
    }
    return null;
  });

  const [db, setDb] = useState<DatabaseState>(() => getDatabase());
  const [activeTab, setActiveTab] = useState<SidebarTab>('dashboard');
  const [navLayout, setNavLayout] = useState<'sidebar' | 'header'>('sidebar');
  const [backendOnline, setBackendOnline] = useState(false);

  // Modal & Selected Drawer States
  const [openModal, setOpenModal] = useState<string | null>(null);
  const [selectedPrDetail, setSelectedPrDetail] = useState<PurchaseRequest | null>(null);
  const [selectedPo, setSelectedPo] = useState<PurchaseOrder | null>(null);

  // Filters
  const [globalSearch, setGlobalSearch] = useState('');
  const [filterProject, setFilterProject] = useState('');

  // Form States
  const [prForm, setPrForm] = useState({ projectId: '', requiredDate: '', priority: 'Medium' as const, items: [] as any[], attachmentUrl: '' });
  const [prItemInput, setPrItemInput] = useState({ itemId: '', quantity: 1, remarks: '' });
  const [poForm, setPoForm] = useState({ prId: '', vendorId: '', creditPeriod: 30, expectedDeliveryDate: '', deliveryLocation: '', termsConditions: '', remarks: '', items: [] as any[] });
  const [grnForm, setGrnForm] = useState({ poId: '', vehicleNumber: '', challanNumber: '', vendorInvoiceNumber: '', remarks: '', items: [] as any[] });
  const [outwardForm, setOutwardForm] = useState({ projectId: '', issuedTo: '', department: '', purpose: '', remarks: '', items: [] as any[] });
  const [outwardItemInput, setOutwardItemInput] = useState({ itemId: '', quantity: 1 });
  const [billForm, setBillForm] = useState({ poId: '', vendorInvoiceNumber: '', billDate: new Date().toISOString().split('T')[0], billAmount: 0, creditPeriod: 30, dueDate: '' });
  const [paymentReqForm, setPaymentReqForm] = useState({ billId: '', requestedAmount: 0, remarks: '' });
  const [paymentEntryForm, setPaymentEntryForm] = useState({ billId: '', paymentAmount: 0, paymentMode: 'Bank Transfer/NEFT/RTGS' as const, transactionNumber: '', remarks: '' });

  // Update DB helper — saves locally + syncs to backend
  const updateDB = useCallback((newDb: DatabaseState) => {
    if (!newDb) return;
    saveDatabase(newDb);
    setDb({ ...newDb });
  }, []);

  // Function to refresh specific tab data from backend REST API
  const fetchTabData = useCallback(async (tab: SidebarTab) => {
    try {
      if (tab === 'pr') {
        const res = await purchaseRequestsApi.getAll();
        if (res?.status === 'success' && Array.isArray(res.data)) {
          setDb(prev => {
            const next = { ...prev, purchaseRequests: res.data };
            saveDatabase(next);
            return next;
          });
        }
      } else if (tab === 'po') {
        const res = await purchaseOrdersApi.getAll();
        if (res?.status === 'success' && Array.isArray(res.data)) {
          setDb(prev => {
            const next = { ...prev, purchaseOrders: res.data };
            saveDatabase(next);
            return next;
          });
        }
      } else if (tab === 'grn') {
        const res = await grnsApi.getAll();
        if (res?.status === 'success' && Array.isArray(res.data)) {
          setDb(prev => {
            const next = { ...prev, grns: res.data };
            saveDatabase(next);
            return next;
          });
        }
      } else if (tab === 'stock') {
        const res = await stockApi.getAll();
        if (res?.status === 'success' && Array.isArray(res.data)) {
          setDb(prev => {
            const next = { ...prev, stock: res.data };
            saveDatabase(next);
            return next;
          });
        }
      } else if (tab === 'outward') {
        const res = await outwardsApi.getAll();
        if (res?.status === 'success' && Array.isArray(res.data)) {
          setDb(prev => {
            const next = { ...prev, storeOutwards: res.data };
            saveDatabase(next);
            return next;
          });
        }
      } else if (tab === 'bills') {
        const res = await vendorBillsApi.getAll();
        if (res?.status === 'success' && Array.isArray(res.data)) {
          setDb(prev => {
            const next = { ...prev, vendorBills: res.data };
            saveDatabase(next);
            return next;
          });
        }
      } else if (tab === 'payment-req') {
        const res = await paymentRequestsApi.getAll();
        if (res?.status === 'success' && Array.isArray(res.data)) {
          setDb(prev => {
            const next = { ...prev, paymentRequests: res.data };
            saveDatabase(next);
            return next;
          });
        }
      } else if (tab === 'payments') {
        const res = await paymentEntriesApi.getAll();
        if (res?.status === 'success' && Array.isArray(res.data)) {
          setDb(prev => {
            const next = { ...prev, paymentEntries: res.data };
            saveDatabase(next);
            return next;
          });
        }
      } else if (tab === 'masters') {
        const [u, p, v, c, it] = await Promise.allSettled([
          usersApi.getAll(),
          projectsApi.getAll(),
          vendorsApi.getAll(),
          categoriesApi.getAll(),
          itemsApi.getAll()
        ]);
        setDb(prev => {
          const next = {
            ...prev,
            users: u.status === 'fulfilled' && u.value?.data ? u.value.data : prev.users,
            projects: p.status === 'fulfilled' && p.value?.data ? p.value.data : prev.projects,
            vendors: v.status === 'fulfilled' && v.value?.data ? v.value.data : prev.vendors,
            categories: c.status === 'fulfilled' && c.value?.data ? c.value.data : prev.categories,
            items: it.status === 'fulfilled' && it.value?.data ? it.value.data : prev.items,
          };
          saveDatabase(next);
          return next;
        });
      } else if (tab === 'permissions') {
        const res = await rolePermissionsApi.getAll();
        if (res?.status === 'success' && Array.isArray(res.data)) {
          setDb(prev => {
            const next = { ...prev, rolePermissions: res.data };
            saveDatabase(next);
            return next;
          });
        }
      } else if (tab === 'audit') {
        const res = await auditLogsApi.getAll();
        if (res?.status === 'success' && Array.isArray(res.data)) {
          setDb(prev => {
            const next = { ...prev, auditLogs: res.data };
            saveDatabase(next);
            return next;
          });
        }
      } else if (tab === 'notifications') {
        const res = await notificationsApi.getAll();
        if (res?.status === 'success' && Array.isArray(res.data)) {
          setDb(prev => {
            const next = { ...prev, notifications: res.data };
            saveDatabase(next);
            return next;
          });
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
    if (active) {
      try { setCurrentUser(JSON.parse(active)); } catch (e) { console.error(e); }
    } else {
      window.location.href = '/login';
      return;
    }

    // Try fetching from backend, merge into local state
    syncApi.fetchState().then((result) => {
      if (result.status === 'success' && result.data) {
        setBackendOnline(true);
        const backendDb = result.data as DatabaseState;
        // Merge backend data with local seed — backend is source of truth if non-empty
        const merged: DatabaseState = {
          users: backendDb.users?.length ? backendDb.users : getDatabase().users,
          projects: backendDb.projects?.length ? backendDb.projects : getDatabase().projects,
          vendors: backendDb.vendors?.length ? backendDb.vendors : getDatabase().vendors,
          categories: backendDb.categories?.length ? backendDb.categories : getDatabase().categories,
          items: backendDb.items?.length ? backendDb.items : getDatabase().items,
          purchaseRequests: backendDb.purchaseRequests?.length ? backendDb.purchaseRequests : getDatabase().purchaseRequests,
          purchaseOrders: backendDb.purchaseOrders?.length ? backendDb.purchaseOrders : getDatabase().purchaseOrders,
          grns: backendDb.grns?.length ? backendDb.grns : getDatabase().grns,
          stock: backendDb.stock?.length ? backendDb.stock : getDatabase().stock,
          stockTransactions: backendDb.stockTransactions || getDatabase().stockTransactions,
          storeOutwards: backendDb.storeOutwards?.length ? backendDb.storeOutwards : getDatabase().storeOutwards,
          vendorBills: backendDb.vendorBills?.length ? backendDb.vendorBills : getDatabase().vendorBills,
          paymentRequests: backendDb.paymentRequests?.length ? backendDb.paymentRequests : getDatabase().paymentRequests,
          paymentEntries: backendDb.paymentEntries?.length ? backendDb.paymentEntries : getDatabase().paymentEntries,
          auditLogs: backendDb.auditLogs?.length ? backendDb.auditLogs : getDatabase().auditLogs,
          notifications: backendDb.notifications?.length ? backendDb.notifications : getDatabase().notifications,
          rolePermissions: backendDb.rolePermissions?.length ? backendDb.rolePermissions : getDatabase().rolePermissions,
        };
        saveDatabase(merged);
        setDb(merged);
        toast.success('Connected to backend database', { duration: 2000 });
      }
    }).catch(() => {
      setBackendOnline(false);
      toast('Running in offline mode (local data)', { duration: 3000 });
    });
  }, []);

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
    window.location.href = '/login';
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

    const newPr: PurchaseRequest = {
      id: `pr-${Date.now()}`,
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

    const updated = { ...db, purchaseRequests: [newPr, ...db.purchaseRequests] };
    updateDB(updated);

    // Backend call (non-blocking)
    apiCall(() => purchaseRequestsApi.create(newPr as any));
    addAuditLog(currentUser.id, 'Create PR', '', `Created PR ${prNum}`, 'PR', newPr.id);
    sendNotification('Approver', 'New PR Submitted', `PR ${prNum} submitted by ${currentUser.name}`);
    apiCall(() => notificationsApi.create({ recipientRole: 'Approver', title: 'New PR Submitted', message: `PR ${prNum} submitted by ${currentUser.name}`, readBy: [], read: false, timestamp: new Date().toISOString(), id: '' } as any));

    setPrForm({ projectId: '', requiredDate: '', priority: 'Medium', items: [], attachmentUrl: '' });
    setOpenModal(null);
    toast.success(`Purchase Request ${prNum} created!`);
  };

  const handleUpdatePRStatus = async (prId: string, status: PurchaseRequest['status'], reason?: string) => {
    if (!db || !currentUser) return;
    const pr = db.purchaseRequests.find(p => p.id === prId);
    if (!pr) return;
    pr.status = status;
    if (reason) pr.rejectionReason = reason;
    pr.history.push({ status, user: currentUser.name, timestamp: new Date().toISOString(), remarks: reason || `Status set to ${status}` });
    updateDB({ ...db });
    apiCall(() => purchaseRequestsApi.update(prId, { status, rejectionReason: reason, history: pr.history }));
    addAuditLog(currentUser.id, 'PR Status Update', '', `Updated PR ${pr.prNumber} to ${status}`, 'PR', pr.id);
    toast.success(`PR ${pr.prNumber} updated to ${status}`);
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

    const newPo: PurchaseOrder = {
      id: `po-${Date.now()}`,
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
      status: 'Approved',
    };

    selectedPr.status = 'PO Created';
    updateDB({ ...db, purchaseOrders: [newPo, ...db.purchaseOrders] });
    apiCall(() => purchaseOrdersApi.create(newPo as any));
    apiCall(() => purchaseRequestsApi.update(selectedPr.id, { status: 'PO Created' }));
    addAuditLog(currentUser.id, 'Create PO', '', `Generated PO ${poNum}`, 'PO', newPo.id);
    sendNotification('Store', 'New Purchase Order', `PO ${poNum} issued for ${selectedVendor.name}`);

    setPoForm({ prId: '', vendorId: '', creditPeriod: 30, expectedDeliveryDate: '', deliveryLocation: '', termsConditions: '', remarks: '', items: [] });
    setOpenModal(null);
    toast.success(`Purchase Order ${poNum} issued!`);
  };

  const handleUpdatePOStatus = async (poId: string, status: PurchaseOrder['status']) => {
    if (!db || !currentUser) return;
    const po = db.purchaseOrders.find(p => p.id === poId);
    if (po) {
      po.status = status;
      updateDB({ ...db });
      apiCall(() => purchaseOrdersApi.update(poId, { status }));
      toast.success(`PO ${po.poNumber} updated to ${status}`);
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

    const newGrn: GRN = {
      id: `grn-${Date.now()}`, grnNumber: grnNum,
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

    // Update stock
    const updatedStock = [...db.stock];
    const newTransactions: StockTransaction[] = [];
    for (const it of grnItems) {
      const existingStock = updatedStock.find(s => s.projectId === selectedPo.projectId && s.itemId === it.itemId);
      if (existingStock) { existingStock.quantity += it.receivedQty; }
      else {
        const itemObj = db.items.find(i => i.id === it.itemId);
        updatedStock.push({ id: `stk-${Date.now()}-${it.itemId}`, projectId: selectedPo.projectId, projectName: selectedPo.projectName, itemId: it.itemId, itemName: it.itemName, itemCode: itemObj?.itemCode || '', unit: it.unit, quantity: it.receivedQty, reorderLevel: itemObj?.reorderLevel || 10 });
      }
      newTransactions.push({ id: `txn-${Date.now()}-${it.itemId}`, projectId: selectedPo.projectId, itemId: it.itemId, transactionType: 'INWARD_GRN', quantity: it.receivedQty, referenceId: newGrn.id, referenceNumber: grnNum, transactionDate: new Date().toISOString().split('T')[0], createdBy: currentUser.id });
    }

    selectedPo.status = 'Partially Received';
    updateDB({ ...db, grns: [newGrn, ...db.grns], stock: updatedStock, stockTransactions: [...newTransactions, ...db.stockTransactions] });
    apiCall(() => grnsApi.create(newGrn as any));
    addAuditLog(currentUser.id, 'Create GRN', '', `Received GRN ${grnNum} for PO ${selectedPo.poNumber}`, 'GRN', newGrn.id);
    sendNotification('Accounts', 'GRN Inward Verified', `GRN ${grnNum} received for ${selectedPo.vendorName}`);

    setGrnForm({ poId: '', vehicleNumber: '', challanNumber: '', vendorInvoiceNumber: '', remarks: '', items: [] });
    setOpenModal(null);
    toast.success(`GRN ${grnNum} registered and stock updated!`);
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

    const newOutward: StoreOutward = {
      id: `out-${Date.now()}`, outwardNumber: outNum, issueNumber: outNum,
      issueDate: new Date().toISOString().split('T')[0], date: new Date().toISOString().split('T')[0],
      projectId: outwardForm.projectId, projectName: targetProject?.name || 'Site Project',
      issuedTo: outwardForm.issuedTo, department: outwardForm.department, purpose: outwardForm.purpose,
      items: [issuedItem], remarks: outwardForm.remarks || '', issuedBy: currentUser.id, issuedByName: currentUser.name, status: 'Issued'
    };

    stockItem.quantity -= outwardItemInput.quantity;
    const newTxn: StockTransaction = { id: `txn-${Date.now()}`, projectId: outwardForm.projectId, itemId: outwardItemInput.itemId, transactionType: 'OUTWARD_ISSUE', quantity: outwardItemInput.quantity, referenceId: newOutward.id, referenceNumber: outNum, transactionDate: new Date().toISOString().split('T')[0], createdBy: currentUser.id };

    updateDB({ ...db, storeOutwards: [newOutward, ...db.storeOutwards], stockTransactions: [newTxn, ...db.stockTransactions] });
    apiCall(() => outwardsApi.create(newOutward as any));
    addAuditLog(currentUser.id, 'Store Outward', '', `Issued ${outwardItemInput.quantity} ${itemObj?.unit} via ${outNum}`, 'Outward', newOutward.id);

    setOutwardForm({ projectId: '', issuedTo: '', department: '', purpose: '', remarks: '', items: [] });
    setOutwardItemInput({ itemId: '', quantity: 1 });
    setOpenModal(null);
    toast.success(`Store Outward Voucher ${outNum} generated!`);
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

    const newBill: VendorBill = {
      id: `bill-${Date.now()}`, vendorId: selectedPo.vendorId, vendorName: selectedPo.vendorName || 'Vendor',
      poId: selectedPo.id, poNumber: selectedPo.poNumber, billNumber: billNum,
      vendorInvoiceNumber: billForm.vendorInvoiceNumber || billNum,
      billDate: billForm.billDate || new Date().toISOString().split('T')[0],
      billAmount: billForm.billAmount, totalAmount: billForm.billAmount,
      creditPeriod: billForm.creditPeriod || 30,
      dueDate: dueDateObj.toISOString().split('T')[0],
      paidAmount: 0, outstandingAmount: billForm.billAmount,
      paymentStatus: 'Upcoming', status: 'Submitted'
    };

    updateDB({ ...db, vendorBills: [newBill, ...db.vendorBills] });
    apiCall(() => vendorBillsApi.create(newBill as any));
    addAuditLog(currentUser.id, 'Create Bill', '', `Registered Bill ${billNum}`, 'Bill', newBill.id);
    sendNotification('Accounts', 'New Vendor Invoice', `Invoice ${newBill.vendorInvoiceNumber} registered for ${newBill.vendorName}`);

    setBillForm({ poId: '', vendorInvoiceNumber: '', billDate: new Date().toISOString().split('T')[0], billAmount: 0, creditPeriod: 30, dueDate: '' });
    setOpenModal(null);
    toast.success(`Vendor Bill ${billNum} registered!`);
  };

  // ─── PAYMENT REQUEST HANDLERS ─────────────────────────────────────────────
  const handleCreatePaymentReq = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!db || !currentUser) return;
    const selectedBill = db.vendorBills.find(b => b.id === paymentReqForm.billId);
    if (!selectedBill) { toast.error('Please select a valid Bill'); return; }

    const reqNum = `REQ-${new Date().getFullYear()}-${String(db.paymentRequests.length + 101).padStart(5, '0')}`;
    const newReq: PaymentRequest = {
      id: `payreq-${Date.now()}`, vendorId: selectedBill.vendorId, vendorName: selectedBill.vendorName,
      billId: selectedBill.id, billNumber: selectedBill.billNumber, requestNumber: reqNum, requestId: reqNum,
      poNumber: selectedBill.poNumber, billAmount: selectedBill.billAmount,
      dueDate: selectedBill.dueDate, outstandingAmount: selectedBill.outstandingAmount,
      requestedAmount: paymentReqForm.requestedAmount,
      requestDate: new Date().toISOString().split('T')[0],
      requestedBy: currentUser.id, requesterName: currentUser.name,
      remarks: paymentReqForm.remarks || 'Payment request initiated', status: 'Submitted'
    };

    selectedBill.paymentStatus = 'Payment Request Pending';
    updateDB({ ...db, paymentRequests: [newReq, ...db.paymentRequests] });
    apiCall(() => paymentRequestsApi.create(newReq as any));
    addAuditLog(currentUser.id, 'Payment Request', '', `Raised ${reqNum} for ₹${paymentReqForm.requestedAmount}`, 'PaymentRequest', newReq.id);
    sendNotification('Admin', 'Payment Request Submitted', `${reqNum} created for ${selectedBill.vendorName}`);

    setPaymentReqForm({ billId: '', requestedAmount: 0, remarks: '' });
    setOpenModal(null);
    toast.success(`Payment Request ${reqNum} submitted!`);
  };

  // ─── PAYMENT ENTRY HANDLERS ───────────────────────────────────────────────
  const handleCreatePaymentEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!db || !currentUser) return;
    const selectedBill = db.vendorBills.find(b => b.id === paymentEntryForm.billId);
    if (!selectedBill) { toast.error('Select a valid Bill'); return; }

    const payNum = `PAY-${new Date().getFullYear()}-${String(db.paymentEntries.length + 101).padStart(5, '0')}`;
    const newEntry: PaymentEntry = {
      id: `pay-${Date.now()}`, paymentId: payNum, paymentNumber: payNum,
      paymentDate: new Date().toISOString().split('T')[0],
      vendorId: selectedBill.vendorId, vendorName: selectedBill.vendorName,
      billId: selectedBill.id, billNumber: selectedBill.billNumber,
      poNumber: selectedBill.poNumber,
      paymentAmount: paymentEntryForm.paymentAmount, paymentMode: paymentEntryForm.paymentMode,
      transactionNumber: paymentEntryForm.transactionNumber, remarks: paymentEntryForm.remarks || '',
      enteredBy: currentUser.id, enteredByName: currentUser.name
    };

    selectedBill.paidAmount = (selectedBill.paidAmount || 0) + paymentEntryForm.paymentAmount;
    selectedBill.outstandingAmount = Math.max(0, selectedBill.billAmount - selectedBill.paidAmount);
    selectedBill.status = selectedBill.outstandingAmount === 0 ? 'Paid' : 'Partially Paid';
    selectedBill.paymentStatus = selectedBill.status;

    updateDB({ ...db, paymentEntries: [newEntry, ...db.paymentEntries] });
    apiCall(() => paymentEntriesApi.create(newEntry as any));
    addAuditLog(currentUser.id, 'Payment Entry', '', `Disbursed ₹${paymentEntryForm.paymentAmount} via ${paymentEntryForm.paymentMode} (${payNum})`, 'PaymentEntry', newEntry.id);
    sendNotification('Accounts', 'Payment Disbursed', `${payNum} recorded for ${selectedBill.vendorName}`);

    setPaymentEntryForm({ billId: '', paymentAmount: 0, paymentMode: 'Bank Transfer/NEFT/RTGS', transactionNumber: '', remarks: '' });
    setOpenModal(null);
    toast.success(`Payment Voucher ${payNum} saved!`);
  };

  const handleToggleModule = async (role: string, module: string) => {
    if (!db) return;
    const rp = db.rolePermissions.find(r => r.role === role);
    if (rp) {
      if (rp.modules.includes(module)) { rp.modules = rp.modules.filter(m => m !== module); }
      else { rp.modules.push(module); }
      updateDB({ ...db });
      apiCall(() => rolePermissionsApi.update(role, { modules: rp.modules, permissions: rp.permissions }));
      toast.success(`Permission updated for ${role}`);
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
          setActiveTab={setActiveTab}
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
          setActiveTab={setActiveTab}
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
              setActiveTab={setActiveTab}
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
              items={db.items}
              currentUser={currentUser}
              rolePermissions={db.rolePermissions}
              onAddUser={(u: any) => {
                const newUser = { id: `usr-${Date.now()}`, ...u, password: u.password || '123456', email: u.email.toLowerCase().trim() };
                const existingIndex = db.users.findIndex(item => item.email.toLowerCase().trim() === newUser.email);
                let newUsersList;
                if (existingIndex !== -1) { db.users[existingIndex] = { ...db.users[existingIndex], ...newUser }; newUsersList = [...db.users]; }
                else { newUsersList = [newUser, ...db.users]; }
                updateDB({ ...db, users: newUsersList });
                apiCall(() => usersApi.create(newUser));
                addAuditLog(currentUser.id, 'Create User', '', `Created user ${u.name}`, 'User', newUser.id);
                toast.success(`User ${u.name} saved!`);
              }}
              onEditUser={(id, updated) => {
                const userIndex = db.users.findIndex(u => u.id === id);
                if (userIndex !== -1) {
                  const cleanedUpdates = { ...updated };
                  if (!cleanedUpdates.password) delete cleanedUpdates.password;
                  if (cleanedUpdates.email) cleanedUpdates.email = cleanedUpdates.email.toLowerCase().trim();
                  db.users[userIndex] = { ...db.users[userIndex], ...cleanedUpdates };
                  updateDB({ ...db });
                  apiCall(() => usersApi.update(id, cleanedUpdates));
                  addAuditLog(currentUser.id, 'Update User', '', `Updated user ${updated.name || id}`, 'User', id);
                  toast.success('User updated successfully!');
                }
              }}
              onDeleteUser={(id) => {
                const targetUser = db.users.find(item => item.id === id);
                updateDB({ ...db, users: db.users.filter(item => item.id !== id) });
                if (targetUser) {
                  apiCall(() => usersApi.delete(targetUser.id || (targetUser as any)._id || targetUser.email));
                  addAuditLog(currentUser.id, 'Delete User', '', `Deleted user ${targetUser.name}`, 'User', id);
                  toast.success('User deleted successfully');
                }
              }}
              onAddProject={(p) => {
                const newPrj = { id: `prj-${Date.now()}`, ...p };
                updateDB({ ...db, projects: [newPrj, ...db.projects] });
                apiCall(() => projectsApi.create(p));
                addAuditLog(currentUser.id, 'Create Project', '', `Added project ${p.name}`, 'Project', newPrj.id);
                toast.success(`Project ${p.name} created!`);
              }}
              onEditProject={(id, updated) => {
                const prjIndex = db.projects.findIndex(p => p.id === id);
                if (prjIndex !== -1) { db.projects[prjIndex] = { ...db.projects[prjIndex], ...updated }; updateDB({ ...db }); apiCall(() => projectsApi.update(id, updated)); toast.success('Project updated!'); }
              }}
              onDeleteProject={(id) => {
                const p = db.projects.find(item => item.id === id);
                updateDB({ ...db, projects: db.projects.filter(item => item.id !== id) });
                apiCall(() => projectsApi.delete(id));
                addAuditLog(currentUser.id, 'Delete Project', '', `Deleted project ${p?.name || id}`, 'Project', id);
                toast.success('Project deleted!');
              }}
              onAddVendor={(v) => {
                const newVen = { id: `ven-${Date.now()}`, ...v };
                updateDB({ ...db, vendors: [newVen, ...db.vendors] });
                apiCall(() => vendorsApi.create(v));
                addAuditLog(currentUser.id, 'Create Vendor', '', `Added vendor ${v.name}`, 'Vendor', newVen.id);
                toast.success(`Vendor ${v.name} saved!`);
              }}
              onEditVendor={(id, updated) => {
                const venIndex = db.vendors.findIndex(v => v.id === id);
                if (venIndex !== -1) { db.vendors[venIndex] = { ...db.vendors[venIndex], ...updated }; updateDB({ ...db }); apiCall(() => vendorsApi.update(id, updated)); toast.success('Vendor updated!'); }
              }}
              onDeleteVendor={(id) => {
                const v = db.vendors.find(item => item.id === id);
                updateDB({ ...db, vendors: db.vendors.filter(item => item.id !== id) });
                apiCall(() => vendorsApi.delete(id));
                addAuditLog(currentUser.id, 'Delete Vendor', '', `Deleted vendor ${v?.name || id}`, 'Vendor', id);
                toast.success('Vendor deleted!');
              }}
              onAddCategory={(c) => {
                const newCat = { id: `cat-${Date.now()}`, ...c };
                updateDB({ ...db, categories: [newCat, ...db.categories] });
                apiCall(() => categoriesApi.create(c));
                addAuditLog(currentUser.id, 'Create Category', '', `Added category ${c.name}`, 'Category', newCat.id);
                toast.success(`Category ${c.name} added!`);
              }}
              onEditCategory={(id, updated) => {
                const catIndex = db.categories.findIndex(c => c.id === id);
                if (catIndex !== -1) { db.categories[catIndex] = { ...db.categories[catIndex], ...updated }; updateDB({ ...db }); apiCall(() => categoriesApi.update(id, updated)); toast.success('Category updated!'); }
              }}
              onDeleteCategory={(id) => {
                const c = db.categories.find(item => item.id === id);
                updateDB({ ...db, categories: db.categories.filter(item => item.id !== id) });
                apiCall(() => categoriesApi.delete(id));
                addAuditLog(currentUser.id, 'Delete Category', '', `Deleted category ${c?.name || id}`, 'Category', id);
                toast.success('Category deleted!');
              }}
              onAddItem={(i) => {
                const newItm = { id: `itm-${Date.now()}`, ...i };
                updateDB({ ...db, items: [newItm, ...db.items] });
                apiCall(() => itemsApi.create(i));
                addAuditLog(currentUser.id, 'Create Item', '', `Added item ${i.name}`, 'Item', newItm.id);
                toast.success(`Item ${i.name} registered!`);
              }}
              onEditItem={(id, updated) => {
                const itmIndex = db.items.findIndex(i => i.id === id);
                if (itmIndex !== -1) { db.items[itmIndex] = { ...db.items[itmIndex], ...updated }; updateDB({ ...db }); apiCall(() => itemsApi.update(id, updated)); toast.success('Item updated!'); }
              }}
              onDeleteItem={(id) => {
                const i = db.items.find(item => item.id === id);
                updateDB({ ...db, items: db.items.filter(item => item.id !== id) });
                apiCall(() => itemsApi.delete(id));
                addAuditLog(currentUser.id, 'Delete Item', '', `Deleted item ${i?.name || id}`, 'Item', id);
                toast.success('Item deleted!');
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
              onUpdateBillStatus={(id, status) => {
                const bill = db.vendorBills.find(b => b.id === id);
                if (bill) {
                  bill.status = status;
                  updateDB({ ...db });
                  apiCall(() => vendorBillsApi.update(id, { status }));
                  toast.success(`Bill ${bill.billNumber} updated to ${status}`);
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
              onUpdatePaymentReqStatus={(id, status) => {
                const req = db.paymentRequests.find(r => r.id === id);
                if (req) {
                  req.status = status;
                  updateDB({ ...db });
                  apiCall(() => paymentRequestsApi.update(id, { status }));
                  toast.success(`Payment request set to ${status}`);
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
              onMarkRead={(id) => {
                const n = db.notifications.find(item => item.id === id);
                if (n) {
                  n.read = true;
                  updateDB({ ...db });
                  apiCall(() => notificationsApi.markRead(id));
                }
              }}
            />
          )}

          {activeTab === 'permissions' && (
            <RolePermissionsTab
              rolePermissions={db.rolePermissions}
              onSaveRolePermission={(role, payload) => {
                const existingIdx = db.rolePermissions.findIndex(r => r.role === role);
                const finalRole = payload.newRoleName || role;
                const newRolePerm = {
                  role: finalRole,
                  modules: payload.modules || ['dashboard'],
                  permissions: payload.permissions || {}
                };

                let updatedList = [...db.rolePermissions];
                if (existingIdx !== -1) {
                  updatedList[existingIdx] = newRolePerm;
                } else {
                  updatedList.push(newRolePerm);
                }

                updateDB({ ...db, rolePermissions: updatedList });
                apiCall(() => rolePermissionsApi.update(role, payload));
                addAuditLog(currentUser.id, 'Update Role Permissions', '', `Updated permissions for ${finalRole}`, 'RolePermissions', finalRole);
                toast.success(`Role & capabilities saved for ${finalRole}!`);
              }}
              onDeleteRolePermission={(role) => {
                const updatedList = db.rolePermissions.filter(r => r.role !== role);
                updateDB({ ...db, rolePermissions: updatedList });
                apiCall(() => rolePermissionsApi.delete(role));
                addAuditLog(currentUser.id, 'Delete Role', '', `Deleted role ${role}`, 'RolePermissions', role);
                toast.success(`Role ${role} deleted successfully`);
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
