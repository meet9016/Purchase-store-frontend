import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import {
  Project, Vendor, Category, Item,
  PurchaseRequest, PurchaseOrder, GRN,
  Stock, StockTransaction, StoreOutward,
  VendorBill, PaymentRequest, PaymentEntry,
  AuditLog, Notification, RolePermission, User,
  getDatabase, DatabaseState
} from '@/lib/storeData';
import { api } from '@/lib/api';

interface DataState {
  projects: Project[];
  vendors: Vendor[];
  categories: Category[];
  items: Item[];
  purchaseRequests: PurchaseRequest[];
  purchaseOrders: PurchaseOrder[];
  grns: GRN[];
  stock: Stock[];
  stockTransactions: StockTransaction[];
  storeOutwards: StoreOutward[];
  vendorBills: VendorBill[];
  paymentRequests: PaymentRequest[];
  paymentEntries: PaymentEntry[];
  auditLogs: AuditLog[];
  notifications: Notification[];
  rolePermissions: RolePermission[];
  users: User[];
  loading: boolean;
  error: string | null;
  lastSynced: string | null;
}

const seed: DatabaseState = typeof window !== 'undefined' ? getDatabase() : {
  users: [],
  projects: [],
  vendors: [],
  categories: [],
  items: [],
  purchaseRequests: [],
  purchaseOrders: [],
  grns: [],
  stock: [],
  stockTransactions: [],
  storeOutwards: [],
  vendorBills: [],
  paymentRequests: [],
  paymentEntries: [],
  auditLogs: [],
  notifications: [],
  rolePermissions: []
};

const initialState: DataState = {
  projects: seed.projects,
  vendors: seed.vendors,
  categories: seed.categories,
  items: seed.items,
  purchaseRequests: seed.purchaseRequests,
  purchaseOrders: seed.purchaseOrders,
  grns: seed.grns,
  stock: seed.stock,
  stockTransactions: seed.stockTransactions,
  storeOutwards: seed.storeOutwards,
  vendorBills: seed.vendorBills,
  paymentRequests: seed.paymentRequests,
  paymentEntries: seed.paymentEntries,
  auditLogs: seed.auditLogs,
  notifications: seed.notifications,
  rolePermissions: seed.rolePermissions,
  users: seed.users,
  loading: false,
  error: null,
  lastSynced: null,
};

// Async Thunk to fetch all data from backend
export const fetchAllData = createAsyncThunk(
  'data/fetchAllData',
  async (_, { rejectWithValue }) => {
    try {
      const [
        projectsRes, vendorsRes, categoriesRes, itemsRes,
        prsRes, posRes, grnsRes, stockRes, stockTxRes,
        outwardsRes, billsRes, payReqsRes, payEntriesRes,
        auditRes, notifRes, rolesRes, usersRes
      ] = await Promise.allSettled([
        api.projects.getAll(),
        api.vendors.getAll(),
        api.categories.getAll(),
        api.items.getAll(),
        api.purchaseRequests.getAll(),
        api.purchaseOrders.getAll(),
        api.grns.getAll(),
        api.stock.getAll(),
        api.stock.getTransactions(),
        api.outwards.getAll(),
        api.vendorBills.getAll(),
        api.paymentRequests.getAll(),
        api.paymentEntries.getAll(),
        api.auditLogs.getAll(),
        api.notifications.getAll(),
        api.rolePermissions.getAll(),
        api.users.getAll(),
      ]);

      return {
        projects: projectsRes.status === 'fulfilled' && (projectsRes.value as any)?.data?.length ? (projectsRes.value as any).data : undefined,
        vendors: vendorsRes.status === 'fulfilled' && (vendorsRes.value as any)?.data?.length ? (vendorsRes.value as any).data : undefined,
        categories: categoriesRes.status === 'fulfilled' && (categoriesRes.value as any)?.data?.length ? (categoriesRes.value as any).data : undefined,
        items: itemsRes.status === 'fulfilled' && (itemsRes.value as any)?.data?.length ? (itemsRes.value as any).data : undefined,
        purchaseRequests: prsRes.status === 'fulfilled' && (prsRes.value as any)?.data?.length ? (prsRes.value as any).data : undefined,
        purchaseOrders: posRes.status === 'fulfilled' && (posRes.value as any)?.data?.length ? (posRes.value as any).data : undefined,
        grns: grnsRes.status === 'fulfilled' && (grnsRes.value as any)?.data?.length ? (grnsRes.value as any).data : undefined,
        stock: stockRes.status === 'fulfilled' && (stockRes.value as any)?.data?.length ? (stockRes.value as any).data : undefined,
        stockTransactions: stockTxRes.status === 'fulfilled' && (stockTxRes.value as any)?.data?.length ? (stockTxRes.value as any).data : undefined,
        storeOutwards: outwardsRes.status === 'fulfilled' && (outwardsRes.value as any)?.data?.length ? (outwardsRes.value as any).data : undefined,
        vendorBills: billsRes.status === 'fulfilled' && (billsRes.value as any)?.data?.length ? (billsRes.value as any).data : undefined,
        paymentRequests: payReqsRes.status === 'fulfilled' && (payReqsRes.value as any)?.data?.length ? (payReqsRes.value as any).data : undefined,
        paymentEntries: payEntriesRes.status === 'fulfilled' && (payEntriesRes.value as any)?.data?.length ? (payEntriesRes.value as any).data : undefined,
        auditLogs: auditRes.status === 'fulfilled' && (auditRes.value as any)?.data?.length ? (auditRes.value as any).data : undefined,
        notifications: notifRes.status === 'fulfilled' && (notifRes.value as any)?.data?.length ? (notifRes.value as any).data : undefined,
        rolePermissions: rolesRes.status === 'fulfilled' && (rolesRes.value as any)?.data?.length ? (rolesRes.value as any).data : undefined,
        users: usersRes.status === 'fulfilled' && (usersRes.value as any)?.data?.length ? (usersRes.value as any).data : undefined,
      };
    } catch (err: any) {
      return rejectWithValue(err.message || 'Failed to sync backend');
    }
  }
);

export const dataSlice = createSlice({
  name: 'data',
  initialState,
  reducers: {
    // Purchase Requests
    setPurchaseRequests: (state, action: PayloadAction<PurchaseRequest[]>) => {
      state.purchaseRequests = action.payload;
    },
    addPurchaseRequest: (state, action: PayloadAction<PurchaseRequest>) => {
      state.purchaseRequests.unshift(action.payload);
    },
    updatePurchaseRequest: (state, action: PayloadAction<PurchaseRequest>) => {
      const idx = state.purchaseRequests.findIndex(p => p.id === action.payload.id || (p as any)._id === (action.payload as any)._id);
      if (idx !== -1) state.purchaseRequests[idx] = action.payload;
    },
    // Purchase Orders
    setPurchaseOrders: (state, action: PayloadAction<PurchaseOrder[]>) => {
      state.purchaseOrders = action.payload;
    },
    addPurchaseOrder: (state, action: PayloadAction<PurchaseOrder>) => {
      state.purchaseOrders.unshift(action.payload);
    },
    updatePurchaseOrder: (state, action: PayloadAction<PurchaseOrder>) => {
      const idx = state.purchaseOrders.findIndex(p => p.id === action.payload.id || (p as any)._id === (action.payload as any)._id);
      if (idx !== -1) state.purchaseOrders[idx] = action.payload;
    },
    // GRN
    setGRNs: (state, action: PayloadAction<GRN[]>) => {
      state.grns = action.payload;
    },
    addGRN: (state, action: PayloadAction<GRN>) => {
      state.grns.unshift(action.payload);
    },
    // Stock
    setStock: (state, action: PayloadAction<Stock[]>) => {
      state.stock = action.payload;
    },
    updateStockItem: (state, action: PayloadAction<Stock>) => {
      const idx = state.stock.findIndex(s => s.id === action.payload.id || (s as any)._id === (action.payload as any)._id);
      if (idx !== -1) state.stock[idx] = action.payload;
    },
    // Store Outwards
    setStoreOutwards: (state, action: PayloadAction<StoreOutward[]>) => {
      state.storeOutwards = action.payload;
    },
    addStoreOutward: (state, action: PayloadAction<StoreOutward>) => {
      state.storeOutwards.unshift(action.payload);
    },
    // Vendor Bills
    setVendorBills: (state, action: PayloadAction<VendorBill[]>) => {
      state.vendorBills = action.payload;
    },
    addVendorBill: (state, action: PayloadAction<VendorBill>) => {
      state.vendorBills.unshift(action.payload);
    },
    updateVendorBill: (state, action: PayloadAction<VendorBill>) => {
      const idx = state.vendorBills.findIndex(b => b.id === action.payload.id || (b as any)._id === (action.payload as any)._id);
      if (idx !== -1) state.vendorBills[idx] = action.payload;
    },
    // Payment Requests
    setPaymentRequests: (state, action: PayloadAction<PaymentRequest[]>) => {
      state.paymentRequests = action.payload;
    },
    addPaymentRequest: (state, action: PayloadAction<PaymentRequest>) => {
      state.paymentRequests.unshift(action.payload);
    },
    updatePaymentRequest: (state, action: PayloadAction<PaymentRequest>) => {
      const idx = state.paymentRequests.findIndex(p => p.id === action.payload.id || (p as any)._id === (action.payload as any)._id);
      if (idx !== -1) state.paymentRequests[idx] = action.payload;
    },
    // Payment Entries
    setPaymentEntries: (state, action: PayloadAction<PaymentEntry[]>) => {
      state.paymentEntries = action.payload;
    },
    addPaymentEntry: (state, action: PayloadAction<PaymentEntry>) => {
      state.paymentEntries.unshift(action.payload);
    },
    // Masters
    setProjects: (state, action: PayloadAction<Project[]>) => {
      state.projects = action.payload;
    },
    setVendors: (state, action: PayloadAction<Vendor[]>) => {
      state.vendors = action.payload;
    },
    setCategories: (state, action: PayloadAction<Category[]>) => {
      state.categories = action.payload;
    },
    setItems: (state, action: PayloadAction<Item[]>) => {
      state.items = action.payload;
    },
    setUsers: (state, action: PayloadAction<User[]>) => {
      state.users = action.payload;
    },
    // System
    addAuditLog: (state, action: PayloadAction<AuditLog>) => {
      state.auditLogs.unshift(action.payload);
    },
    markNotificationRead: (state, action: PayloadAction<string>) => {
      const notif = state.notifications.find(n => n.id === action.payload || (n as any)._id === action.payload);
      if (notif) notif.read = true;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllData.fulfilled, (state, action) => {
        state.loading = false;
        state.lastSynced = new Date().toISOString();
        if (action.payload.projects) state.projects = action.payload.projects;
        if (action.payload.vendors) state.vendors = action.payload.vendors;
        if (action.payload.categories) state.categories = action.payload.categories;
        if (action.payload.items) state.items = action.payload.items;
        if (action.payload.purchaseRequests) state.purchaseRequests = action.payload.purchaseRequests;
        if (action.payload.purchaseOrders) state.purchaseOrders = action.payload.purchaseOrders;
        if (action.payload.grns) state.grns = action.payload.grns;
        if (action.payload.stock) state.stock = action.payload.stock;
        if (action.payload.stockTransactions) state.stockTransactions = action.payload.stockTransactions;
        if (action.payload.storeOutwards) state.storeOutwards = action.payload.storeOutwards;
        if (action.payload.vendorBills) state.vendorBills = action.payload.vendorBills;
        if (action.payload.paymentRequests) state.paymentRequests = action.payload.paymentRequests;
        if (action.payload.paymentEntries) state.paymentEntries = action.payload.paymentEntries;
        if (action.payload.auditLogs) state.auditLogs = action.payload.auditLogs;
        if (action.payload.notifications) state.notifications = action.payload.notifications;
        if (action.payload.rolePermissions) state.rolePermissions = action.payload.rolePermissions;
        if (action.payload.users) state.users = action.payload.users;
      })
      .addCase(fetchAllData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  setPurchaseRequests, addPurchaseRequest, updatePurchaseRequest,
  setPurchaseOrders, addPurchaseOrder, updatePurchaseOrder,
  setGRNs, addGRN,
  setStock, updateStockItem,
  setStoreOutwards, addStoreOutward,
  setVendorBills, addVendorBill, updateVendorBill,
  setPaymentRequests, addPaymentRequest, updatePaymentRequest,
  setPaymentEntries, addPaymentEntry,
  setProjects, setVendors, setCategories, setItems, setUsers,
  addAuditLog, markNotificationRead
} = dataSlice.actions;

export default dataSlice.reducer;
