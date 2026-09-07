// Purchase Store Enterprise — Complete API Service Layer
// All backend REST API endpoints mapped to typed TypeScript functions

import {
  DatabaseState,
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
  AuditLog,
  Notification,
  RolePermission
} from './storeData';

export const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5005/api';

// Helper for HTTP requests
async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
  const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token && !token.startsWith('local_') ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  const response = await fetch(url, {
    ...options,
    headers,
  });

  const json = await response.json();
  if (!response.ok) {
    throw new Error(json.message || json.error || `HTTP ${response.status} request failed`);
  }
  return json;
}

// ─── AUTH ─────────────────────────────────────────────────────────────────────
export const authApi = {
  login: async (email: string, password: string = '123456') => {
    return request<{ status: string; token: string; user: User; message?: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },
  getMe: async () => {
    return request<{ status: string; user: User }>('/auth/me', { method: 'GET' });
  },
};

// ─── SYNC (BULK) ──────────────────────────────────────────────────────────────
export const syncApi = {
  fetchState: async () => {
    return request<{ status: string; data?: DatabaseState; message?: string }>('/sync', { method: 'GET' });
  },
  saveState: async (state: DatabaseState) => {
    return request<{ status: string; message: string }>('/sync', {
      method: 'POST',
      body: JSON.stringify(state),
    });
  },
};

// ─── USERS ────────────────────────────────────────────────────────────────────
export const usersApi = {
  getAll: async () => request<{ status: string; count: number; data: User[] }>('/users', { method: 'GET' }),
  create: async (user: Omit<User, 'id'>) => request<{ status: string; user: User }>('/users', { method: 'POST', body: JSON.stringify(user) }),
  update: async (id: string, user: Partial<User>) => request<{ status: string; user: User }>(`/users/${id}`, { method: 'PUT', body: JSON.stringify(user) }),
  delete: async (id: string) => request<{ status: string; message: string }>(`/users/${id}`, { method: 'DELETE' }),
};

// ─── PROJECTS ─────────────────────────────────────────────────────────────────
export const projectsApi = {
  getAll: async () => request<{ status: string; data: Project[] }>('/projects', { method: 'GET' }),
  getById: async (id: string) => request<{ status: string; data: Project }>(`/projects/${id}`, { method: 'GET' }),
  create: async (data: Omit<Project, 'id'>) => request<{ status: string; data: Project }>('/projects', { method: 'POST', body: JSON.stringify(data) }),
  update: async (id: string, data: Partial<Project>) => request<{ status: string; data: Project }>(`/projects/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: async (id: string) => request<{ status: string; message: string }>(`/projects/${id}`, { method: 'DELETE' }),
};

// ─── VENDORS ──────────────────────────────────────────────────────────────────
export const vendorsApi = {
  getAll: async () => request<{ status: string; data: Vendor[] }>('/vendors', { method: 'GET' }),
  getById: async (id: string) => request<{ status: string; data: Vendor }>(`/vendors/${id}`, { method: 'GET' }),
  create: async (data: Omit<Vendor, 'id'>) => request<{ status: string; data: Vendor }>('/vendors', { method: 'POST', body: JSON.stringify(data) }),
  update: async (id: string, data: Partial<Vendor>) => request<{ status: string; data: Vendor }>(`/vendors/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: async (id: string) => request<{ status: string; message: string }>(`/vendors/${id}`, { method: 'DELETE' }),
};

// ─── CATEGORIES ───────────────────────────────────────────────────────────────
export const categoriesApi = {
  getAll: async () => request<{ status: string; data: Category[] }>('/categories', { method: 'GET' }),
  create: async (data: Omit<Category, 'id'>) => request<{ status: string; data: Category }>('/categories', { method: 'POST', body: JSON.stringify(data) }),
  update: async (id: string, data: Partial<Category>) => request<{ status: string; data: Category }>(`/categories/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: async (id: string) => request<{ status: string; message: string }>(`/categories/${id}`, { method: 'DELETE' }),
};

// ─── ITEMS ────────────────────────────────────────────────────────────────────
export const itemsApi = {
  getAll: async () => request<{ status: string; data: Item[] }>('/items', { method: 'GET' }),
  create: async (data: Omit<Item, 'id'>) => request<{ status: string; data: Item }>('/items', { method: 'POST', body: JSON.stringify(data) }),
  update: async (id: string, data: Partial<Item>) => request<{ status: string; data: Item }>(`/items/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: async (id: string) => request<{ status: string; message: string }>(`/items/${id}`, { method: 'DELETE' }),
};

// ─── PURCHASE REQUESTS ────────────────────────────────────────────────────────
export const purchaseRequestsApi = {
  getAll: async () => request<{ status: string; data: PurchaseRequest[] }>('/purchase-requests', { method: 'GET' }),
  create: async (data: Omit<PurchaseRequest, 'id'>) => request<{ status: string; data: PurchaseRequest }>('/purchase-requests', { method: 'POST', body: JSON.stringify(data) }),
  update: async (id: string, data: Partial<PurchaseRequest>) => request<{ status: string; data: PurchaseRequest }>(`/purchase-requests/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: async (id: string) => request<{ status: string; message: string }>(`/purchase-requests/${id}`, { method: 'DELETE' }),
};

// ─── PURCHASE ORDERS ─────────────────────────────────────────────────────────
export const purchaseOrdersApi = {
  getAll: async () => request<{ status: string; data: PurchaseOrder[] }>('/purchase-orders', { method: 'GET' }),
  create: async (data: Omit<PurchaseOrder, 'id'>) => request<{ status: string; data: PurchaseOrder }>('/purchase-orders', { method: 'POST', body: JSON.stringify(data) }),
  update: async (id: string, data: Partial<PurchaseOrder>) => request<{ status: string; data: PurchaseOrder }>(`/purchase-orders/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: async (id: string) => request<{ status: string; message: string }>(`/purchase-orders/${id}`, { method: 'DELETE' }),
};

// ─── GRNS ─────────────────────────────────────────────────────────────────────
export const grnsApi = {
  getAll: async () => request<{ status: string; data: GRN[] }>('/grns', { method: 'GET' }),
  create: async (data: Omit<GRN, 'id'>) => request<{ status: string; data: GRN }>('/grns', { method: 'POST', body: JSON.stringify(data) }),
  update: async (id: string, data: Partial<GRN>) => request<{ status: string; data: GRN }>(`/grns/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: async (id: string) => request<{ status: string; message: string }>(`/grns/${id}`, { method: 'DELETE' }),
};

// ─── STOCK ────────────────────────────────────────────────────────────────────
export const stockApi = {
  getAll: async (projectId?: string) => {
    const qs = projectId ? `?projectId=${projectId}` : '';
    return request<{ status: string; data: Stock[] }>(`/stock${qs}`, { method: 'GET' });
  },
  update: async (id: string, data: Partial<Stock>) => request<{ status: string; data: Stock }>(`/stock/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  getTransactions: async (projectId?: string, itemId?: string) => {
    const params = new URLSearchParams();
    if (projectId) params.append('projectId', projectId);
    if (itemId) params.append('itemId', itemId);
    return request<{ status: string; data: any[] }>(`/stock-transactions?${params}`, { method: 'GET' });
  },
};

// ─── STORE OUTWARDS ───────────────────────────────────────────────────────────
export const outwardsApi = {
  getAll: async () => request<{ status: string; data: StoreOutward[] }>('/store-outwards', { method: 'GET' }),
  create: async (data: Omit<StoreOutward, 'id'>) => request<{ status: string; data: StoreOutward }>('/store-outwards', { method: 'POST', body: JSON.stringify(data) }),
  update: async (id: string, data: Partial<StoreOutward>) => request<{ status: string; data: StoreOutward }>(`/store-outwards/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: async (id: string) => request<{ status: string; message: string }>(`/store-outwards/${id}`, { method: 'DELETE' }),
};

// ─── VENDOR BILLS ─────────────────────────────────────────────────────────────
export const vendorBillsApi = {
  getAll: async () => request<{ status: string; data: VendorBill[] }>('/vendor-bills', { method: 'GET' }),
  create: async (data: Omit<VendorBill, 'id'>) => request<{ status: string; data: VendorBill }>('/vendor-bills', { method: 'POST', body: JSON.stringify(data) }),
  update: async (id: string, data: Partial<VendorBill>) => request<{ status: string; data: VendorBill }>(`/vendor-bills/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: async (id: string) => request<{ status: string; message: string }>(`/vendor-bills/${id}`, { method: 'DELETE' }),
};

// ─── PAYMENT REQUESTS ─────────────────────────────────────────────────────────
export const paymentRequestsApi = {
  getAll: async () => request<{ status: string; data: PaymentRequest[] }>('/payment-requests', { method: 'GET' }),
  create: async (data: Omit<PaymentRequest, 'id'>) => request<{ status: string; data: PaymentRequest }>('/payment-requests', { method: 'POST', body: JSON.stringify(data) }),
  update: async (id: string, data: Partial<PaymentRequest>) => request<{ status: string; data: PaymentRequest }>(`/payment-requests/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: async (id: string) => request<{ status: string; message: string }>(`/payment-requests/${id}`, { method: 'DELETE' }),
};

// ─── PAYMENT ENTRIES ─────────────────────────────────────────────────────────
export const paymentEntriesApi = {
  getAll: async () => request<{ status: string; data: PaymentEntry[] }>('/payment-entries', { method: 'GET' }),
  create: async (data: Omit<PaymentEntry, 'id'>) => request<{ status: string; data: PaymentEntry }>('/payment-entries', { method: 'POST', body: JSON.stringify(data) }),
  update: async (id: string, data: Partial<PaymentEntry>) => request<{ status: string; data: PaymentEntry }>(`/payment-entries/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: async (id: string) => request<{ status: string; message: string }>(`/payment-entries/${id}`, { method: 'DELETE' }),
};

// ─── AUDIT LOGS ───────────────────────────────────────────────────────────────
export const auditLogsApi = {
  getAll: async () => request<{ status: string; data: AuditLog[] }>('/audit-logs', { method: 'GET' }),
  create: async (data: Omit<AuditLog, 'id'>) => request<{ status: string; data: AuditLog }>('/audit-logs', { method: 'POST', body: JSON.stringify(data) }),
};

// ─── NOTIFICATIONS ────────────────────────────────────────────────────────────
export const notificationsApi = {
  getAll: async (role?: string) => {
    const qs = role ? `?role=${role}` : '';
    return request<{ status: string; data: Notification[] }>(`/notifications${qs}`, { method: 'GET' });
  },
  create: async (data: Omit<Notification, 'id'>) => request<{ status: string; data: Notification }>('/notifications', { method: 'POST', body: JSON.stringify(data) }),
  markRead: async (id: string) => request<{ status: string; message: string }>(`/notifications/${id}/read`, { method: 'PUT' }),
  delete: async (id: string) => request<{ status: string; message: string }>(`/notifications/${id}`, { method: 'DELETE' }),
};

// ─── ROLE PERMISSIONS ─────────────────────────────────────────────────────────
export const rolePermissionsApi = {
  getAll: async () => request<{ status: string; data: RolePermission[] }>('/role-permissions', { method: 'GET' }),
  update: async (role: string, payload: { modules?: string[]; permissions?: Record<string, any>; newRoleName?: string }) =>
    request<{ status: string; data: RolePermission }>(`/role-permissions/${role}`, { method: 'PUT', body: JSON.stringify(payload) }),
  delete: async (role: string) => request<{ status: string; message: string }>(`/role-permissions/${role}`, { method: 'DELETE' }),
};

// ─── CONSOLIDATED API CLIENT ──────────────────────────────────────────────────
export const api = {
  auth: authApi,
  sync: syncApi,
  users: usersApi,
  projects: projectsApi,
  vendors: vendorsApi,
  categories: categoriesApi,
  items: itemsApi,
  purchaseRequests: purchaseRequestsApi,
  purchaseOrders: purchaseOrdersApi,
  grns: grnsApi,
  stock: stockApi,
  outwards: outwardsApi,
  vendorBills: vendorBillsApi,
  paymentRequests: paymentRequestsApi,
  paymentEntries: paymentEntriesApi,
  auditLogs: auditLogsApi,
  notifications: notificationsApi,
  rolePermissions: rolePermissionsApi,
};

export default api;
