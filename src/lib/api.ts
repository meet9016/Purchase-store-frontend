// Purchase Store Enterprise — Centralized Typed API Service Layer
// Built with Axios Client, Interceptors, and Standard Response Envelopes

import axiosClient from './axiosClient';
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
  RolePermission,
} from './storeData';

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface ApiResponseEnvelope<T> {
  status: number | string;
  message: string;
  data: T;
  pagination?: PaginationMeta;
}

export interface QueryParams {
  search?: string;
  page?: number;
  limit?: number;
  sort?: string;
  [key: string]: any;
}

// ─── AUTH ─────────────────────────────────────────────────────────────────────
export const authApi = {
  login: async (email: string, password: string = '123456') => {
    const res = await axiosClient.post<ApiResponseEnvelope<{ token: string; user: User }>>('/auth/login', {
      email,
      password,
    });
    return res.data;
  },
  getMe: async () => {
    const res = await axiosClient.get<ApiResponseEnvelope<User>>('/auth/me');
    return res.data;
  },
};

// ─── SYNC (BULK) ──────────────────────────────────────────────────────────────
export const syncApi = {
  fetchState: async () => {
    const res = await axiosClient.get<ApiResponseEnvelope<DatabaseState>>('/sync');
    return res.data;
  },
  saveState: async (state: DatabaseState) => {
    const res = await axiosClient.post<ApiResponseEnvelope<null>>('/sync', state);
    return res.data;
  },
};

// ─── USERS ────────────────────────────────────────────────────────────────────
export const usersApi = {
  getAll: async (params?: QueryParams) => {
    const res = await axiosClient.get<ApiResponseEnvelope<User[]>>('/users', { params });
    return res.data;
  },
  getById: async (id: string) => {
    const res = await axiosClient.get<ApiResponseEnvelope<User>>(`/users/${id}`);
    return res.data;
  },
  create: async (user: Omit<User, 'id'>) => {
    const res = await axiosClient.post<ApiResponseEnvelope<User>>('/users', user);
    return res.data;
  },
  update: async (id: string, user: Partial<User>) => {
    const res = await axiosClient.put<ApiResponseEnvelope<User>>(`/users/${id}`, user);
    return res.data;
  },
  delete: async (id: string) => {
    const res = await axiosClient.delete<ApiResponseEnvelope<null>>(`/users/${id}`);
    return res.data;
  },
};

// ─── PROJECTS ─────────────────────────────────────────────────────────────────
export const projectsApi = {
  getAll: async (params?: QueryParams) => {
    const res = await axiosClient.get<ApiResponseEnvelope<Project[]>>('/projects', { params });
    return res.data;
  },
  getById: async (id: string) => {
    const res = await axiosClient.get<ApiResponseEnvelope<Project>>(`/projects/${id}`);
    return res.data;
  },
  create: async (data: Omit<Project, 'id'>) => {
    const res = await axiosClient.post<ApiResponseEnvelope<Project>>('/projects', data);
    return res.data;
  },
  update: async (id: string, data: Partial<Project>) => {
    const res = await axiosClient.put<ApiResponseEnvelope<Project>>(`/projects/${id}`, data);
    return res.data;
  },
  delete: async (id: string) => {
    const res = await axiosClient.delete<ApiResponseEnvelope<null>>(`/projects/${id}`);
    return res.data;
  },
};

// ─── VENDORS ──────────────────────────────────────────────────────────────────
export const vendorsApi = {
  getAll: async (params?: QueryParams) => {
    const res = await axiosClient.get<ApiResponseEnvelope<Vendor[]>>('/vendors', { params });
    return res.data;
  },
  getById: async (id: string) => {
    const res = await axiosClient.get<ApiResponseEnvelope<Vendor>>(`/vendors/${id}`);
    return res.data;
  },
  create: async (data: Omit<Vendor, 'id'>) => {
    const res = await axiosClient.post<ApiResponseEnvelope<Vendor>>('/vendors', data);
    return res.data;
  },
  update: async (id: string, data: Partial<Vendor>) => {
    const res = await axiosClient.put<ApiResponseEnvelope<Vendor>>(`/vendors/${id}`, data);
    return res.data;
  },
  delete: async (id: string) => {
    const res = await axiosClient.delete<ApiResponseEnvelope<null>>(`/vendors/${id}`);
    return res.data;
  },
};

// ─── CATEGORIES ───────────────────────────────────────────────────────────────
export const categoriesApi = {
  getAll: async (params?: QueryParams) => {
    const res = await axiosClient.get<ApiResponseEnvelope<Category[]>>('/categories', { params });
    return res.data;
  },
  getById: async (id: string) => {
    const res = await axiosClient.get<ApiResponseEnvelope<Category>>(`/categories/${id}`);
    return res.data;
  },
  create: async (data: Omit<Category, 'id'>) => {
    const res = await axiosClient.post<ApiResponseEnvelope<Category>>('/categories', data);
    return res.data;
  },
  update: async (id: string, data: Partial<Category>) => {
    const res = await axiosClient.put<ApiResponseEnvelope<Category>>(`/categories/${id}`, data);
    return res.data;
  },
  delete: async (id: string) => {
    const res = await axiosClient.delete<ApiResponseEnvelope<null>>(`/categories/${id}`);
    return res.data;
  },
};

// ─── ITEMS ────────────────────────────────────────────────────────────────────
export const itemsApi = {
  getAll: async (params?: QueryParams) => {
    const res = await axiosClient.get<ApiResponseEnvelope<Item[]>>('/items', { params });
    return res.data;
  },
  getById: async (id: string) => {
    const res = await axiosClient.get<ApiResponseEnvelope<Item>>(`/items/${id}`);
    return res.data;
  },
  create: async (data: Omit<Item, 'id'>) => {
    const res = await axiosClient.post<ApiResponseEnvelope<Item>>('/items', data);
    return res.data;
  },
  update: async (id: string, data: Partial<Item>) => {
    const res = await axiosClient.put<ApiResponseEnvelope<Item>>(`/items/${id}`, data);
    return res.data;
  },
  delete: async (id: string) => {
    const res = await axiosClient.delete<ApiResponseEnvelope<null>>(`/items/${id}`);
    return res.data;
  },
};

// ─── PURCHASE REQUESTS ────────────────────────────────────────────────────────
export const purchaseRequestsApi = {
  getAll: async (params?: QueryParams) => {
    const res = await axiosClient.get<ApiResponseEnvelope<PurchaseRequest[]>>('/purchase-requests', { params });
    return res.data;
  },
  create: async (data: Omit<PurchaseRequest, 'id'>) => {
    const res = await axiosClient.post<ApiResponseEnvelope<PurchaseRequest>>('/purchase-requests', data);
    return res.data;
  },
  update: async (id: string, data: Partial<PurchaseRequest>) => {
    const res = await axiosClient.put<ApiResponseEnvelope<PurchaseRequest>>(`/purchase-requests/${id}`, data);
    return res.data;
  },
  delete: async (id: string) => {
    const res = await axiosClient.delete<ApiResponseEnvelope<null>>(`/purchase-requests/${id}`);
    return res.data;
  },
};

// ─── PURCHASE ORDERS ─────────────────────────────────────────────────────────
export const purchaseOrdersApi = {
  getAll: async (params?: QueryParams) => {
    const res = await axiosClient.get<ApiResponseEnvelope<PurchaseOrder[]>>('/purchase-orders', { params });
    return res.data;
  },
  create: async (data: Omit<PurchaseOrder, 'id'>) => {
    const res = await axiosClient.post<ApiResponseEnvelope<PurchaseOrder>>('/purchase-orders', data);
    return res.data;
  },
  update: async (id: string, data: Partial<PurchaseOrder>) => {
    const res = await axiosClient.put<ApiResponseEnvelope<PurchaseOrder>>(`/purchase-orders/${id}`, data);
    return res.data;
  },
  delete: async (id: string) => {
    const res = await axiosClient.delete<ApiResponseEnvelope<null>>(`/purchase-orders/${id}`);
    return res.data;
  },
};

// ─── GRNS ─────────────────────────────────────────────────────────────────────
export const grnsApi = {
  getAll: async (params?: QueryParams) => {
    const res = await axiosClient.get<ApiResponseEnvelope<GRN[]>>('/grns', { params });
    return res.data;
  },
  create: async (data: Omit<GRN, 'id'>) => {
    const res = await axiosClient.post<ApiResponseEnvelope<GRN>>('/grns', data);
    return res.data;
  },
  update: async (id: string, data: Partial<GRN>) => {
    const res = await axiosClient.put<ApiResponseEnvelope<GRN>>(`/grns/${id}`, data);
    return res.data;
  },
  delete: async (id: string) => {
    const res = await axiosClient.delete<ApiResponseEnvelope<null>>(`/grns/${id}`);
    return res.data;
  },
};

// ─── STOCK ────────────────────────────────────────────────────────────────────
export const stockApi = {
  getAll: async (params?: QueryParams) => {
    const res = await axiosClient.get<ApiResponseEnvelope<Stock[]>>('/stock', { params });
    return res.data;
  },
  update: async (id: string, data: Partial<Stock>) => {
    const res = await axiosClient.put<ApiResponseEnvelope<Stock>>(`/stock/${id}`, data);
    return res.data;
  },
  getTransactions: async (params?: QueryParams) => {
    const res = await axiosClient.get<ApiResponseEnvelope<any[]>>('/stock-transactions', { params });
    return res.data;
  },
};

// ─── STORE OUTWARDS ───────────────────────────────────────────────────────────
export const outwardsApi = {
  getAll: async (params?: QueryParams) => {
    const res = await axiosClient.get<ApiResponseEnvelope<StoreOutward[]>>('/store-outwards', { params });
    return res.data;
  },
  create: async (data: Omit<StoreOutward, 'id'>) => {
    const res = await axiosClient.post<ApiResponseEnvelope<StoreOutward>>('/store-outwards', data);
    return res.data;
  },
  update: async (id: string, data: Partial<StoreOutward>) => {
    const res = await axiosClient.put<ApiResponseEnvelope<StoreOutward>>(`/store-outwards/${id}`, data);
    return res.data;
  },
  delete: async (id: string) => {
    const res = await axiosClient.delete<ApiResponseEnvelope<null>>(`/store-outwards/${id}`);
    return res.data;
  },
};

// ─── VENDOR BILLS ─────────────────────────────────────────────────────────────
export const vendorBillsApi = {
  getAll: async (params?: QueryParams) => {
    const res = await axiosClient.get<ApiResponseEnvelope<VendorBill[]>>('/vendor-bills', { params });
    return res.data;
  },
  create: async (data: Omit<VendorBill, 'id'>) => {
    const res = await axiosClient.post<ApiResponseEnvelope<VendorBill>>('/vendor-bills', data);
    return res.data;
  },
  update: async (id: string, data: Partial<VendorBill>) => {
    const res = await axiosClient.put<ApiResponseEnvelope<VendorBill>>(`/vendor-bills/${id}`, data);
    return res.data;
  },
  delete: async (id: string) => {
    const res = await axiosClient.delete<ApiResponseEnvelope<null>>(`/vendor-bills/${id}`);
    return res.data;
  },
};

// ─── PAYMENT REQUESTS ─────────────────────────────────────────────────────────
export const paymentRequestsApi = {
  getAll: async (params?: QueryParams) => {
    const res = await axiosClient.get<ApiResponseEnvelope<PaymentRequest[]>>('/payment-requests', { params });
    return res.data;
  },
  create: async (data: Omit<PaymentRequest, 'id'>) => {
    const res = await axiosClient.post<ApiResponseEnvelope<PaymentRequest>>('/payment-requests', data);
    return res.data;
  },
  update: async (id: string, data: Partial<PaymentRequest>) => {
    const res = await axiosClient.put<ApiResponseEnvelope<PaymentRequest>>(`/payment-requests/${id}`, data);
    return res.data;
  },
  delete: async (id: string) => {
    const res = await axiosClient.delete<ApiResponseEnvelope<null>>(`/payment-requests/${id}`);
    return res.data;
  },
};

// ─── PAYMENT ENTRIES ──────────────────────────────────────────────────────────
export const paymentEntriesApi = {
  getAll: async (params?: QueryParams) => {
    const res = await axiosClient.get<ApiResponseEnvelope<PaymentEntry[]>>('/payment-entries', { params });
    return res.data;
  },
  create: async (data: Omit<PaymentEntry, 'id'>) => {
    const res = await axiosClient.post<ApiResponseEnvelope<PaymentEntry>>('/payment-entries', data);
    return res.data;
  },
  update: async (id: string, data: Partial<PaymentEntry>) => {
    const res = await axiosClient.put<ApiResponseEnvelope<PaymentEntry>>(`/payment-entries/${id}`, data);
    return res.data;
  },
  delete: async (id: string) => {
    const res = await axiosClient.delete<ApiResponseEnvelope<null>>(`/payment-entries/${id}`);
    return res.data;
  },
};

// ─── AUDIT LOGS ───────────────────────────────────────────────────────────────
export const auditLogsApi = {
  getAll: async (params?: QueryParams) => {
    const res = await axiosClient.get<ApiResponseEnvelope<AuditLog[]>>('/audit-logs', { params });
    return res.data;
  },
  create: async (data: Omit<AuditLog, 'id'>) => {
    const res = await axiosClient.post<ApiResponseEnvelope<AuditLog>>('/audit-logs', data);
    return res.data;
  },
};

// ─── NOTIFICATIONS ────────────────────────────────────────────────────────────
export const notificationsApi = {
  getAll: async (params?: QueryParams) => {
    const res = await axiosClient.get<ApiResponseEnvelope<Notification[]>>('/notifications', { params });
    return res.data;
  },
  create: async (data: Omit<Notification, 'id'>) => {
    const res = await axiosClient.post<ApiResponseEnvelope<Notification>>('/notifications', data);
    return res.data;
  },
  markRead: async (id: string) => {
    const res = await axiosClient.put<ApiResponseEnvelope<Notification>>(`/notifications/${id}/read`);
    return res.data;
  },
  delete: async (id: string) => {
    const res = await axiosClient.delete<ApiResponseEnvelope<null>>(`/notifications/${id}`);
    return res.data;
  },
};

// ─── ROLE PERMISSIONS ─────────────────────────────────────────────────────────
export const rolePermissionsApi = {
  getAll: async () => {
    const res = await axiosClient.get<ApiResponseEnvelope<RolePermission[]>>('/role-permissions');
    return res.data;
  },
  update: async (role: string, payload: { modules?: string[]; permissions?: Record<string, any>; newRoleName?: string }) => {
    const res = await axiosClient.put<ApiResponseEnvelope<RolePermission>>(`/role-permissions/${role}`, payload);
    return res.data;
  },
  delete: async (role: string) => {
    const res = await axiosClient.delete<ApiResponseEnvelope<null>>(`/role-permissions/${role}`);
    return res.data;
  },
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
