// Store Data Engine & Database Schema Management (Frontend Standalone Engine)

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string;
  active: boolean;
  password?: string;
}

export interface Project {
  id: string;
  name: string;
  location: string;
  status: 'Active' | 'Completed' | 'On Hold';
}

export interface Vendor {
  id: string;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  gstNo: string;
  panNo: string;
  bankDetails: {
    bankName: string;
    accountNo: string;
    ifscCode: string;
  };
  creditPeriod: number; // in days
  address: string;
}

export interface Category {
  id: string;
  name: string;
  description: string;
}

export interface Unit {
  id: string;
  code: string;
  name: string;
  status: 'Active' | 'Inactive';
}

export interface Item {
  id: string;
  itemCode: string;
  name: string;
  categoryId: string;
  categoryName?: string;
  subCategory: string;
  unit: string;
  description: string;
  minStock: number;
  reorderLevel: number;
}

export interface PRItem {
  itemId: string;
  itemName: string;
  quantity: number;
  unit: string;
  remarks: string;
}

export interface PRTimeline {
  status: string;
  user: string;
  timestamp: string;
  remarks?: string;
}

export interface PurchaseRequest {
  id: string;
  prNumber: string;
  requestDate: string;
  projectId: string;
  projectName?: string;
  requestedBy: string;
  requesterName?: string;
  requiredDate: string;
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  items: PRItem[];
  status: 'Draft' | 'Submitted' | 'Under Review' | 'Approved' | 'Rejected' | 'PO Generated' | 'PO Created' | 'Order Placed' | 'Partially Received' | 'Fully Received' | 'Closed';
  rejectionReason?: string;
  attachmentUrl?: string;
  history: PRTimeline[];
}

export interface POItem {
  itemId: string;
  itemName: string;
  quantity: number;
  unit?: string;
  rate: number;
  tax: number; // percentage
  discount: number; // amount
  amount?: number;
  totalAmount: number;
}

export interface PurchaseOrder {
  id: string;
  poNumber: string;
  poDate: string;
  prId: string;
  prNumber: string;
  projectId: string;
  projectName?: string;
  vendorId: string;
  vendorName?: string;
  items: POItem[];
  creditPeriod: number;
  expectedDeliveryDate: string;
  deliveryLocation: string;
  termsConditions: string;
  remarks: string;
  status: 'Order Placed' | 'Partially Supplied' | 'Fully Supplied' | 'Closed' | 'Approved' | 'Draft' | 'Partially Received' | 'Completed' | 'Cancelled';
  totalPOAmount: number;
  totalAmount?: number;
}

export interface GRNItem {
  itemId: string;
  itemName: string;
  orderedQty: number;
  receivedQty: number;
  shortQty: number;
  excessQty: number;
  damagedQty: number;
  unit: string;
  batchNumber: string;
}

export interface GRN {
  id: string;
  grnNumber: string;
  grnDate: string;
  receivedDate?: string;
  poId: string;
  poNumber: string;
  vendorId: string;
  vendorName: string;
  projectId: string;
  projectName?: string;
  items: GRNItem[];
  vehicleNumber: string;
  challanNumber: string;
  vendorInvoiceNumber: string;
  remarks: string;
  receivedBy: string;
  receiverName: string;
}

export interface Stock {
  id?: string;
  projectId: string;
  projectName?: string;
  itemId: string;
  itemName?: string;
  itemCode?: string;
  unit?: string;
  quantity: number;
  minStock?: number;
  reorderLevel?: number;
  currentStock?: number;
  lastUpdated?: string;
}

export interface StockTransaction {
  id: string;
  date?: string;
  transactionDate?: string;
  projectId?: string;
  projectName?: string;
  itemId?: string;
  itemName?: string;
  type?: 'IN' | 'OUT' | 'ADJUSTMENT' | string;
  transactionType?: 'IN' | 'OUT' | 'ADJUSTMENT' | string;
  quantity: number;
  referenceType?: 'GRN' | 'OUTWARD' | 'INITIAL' | 'MANUAL' | string;
  referenceId?: string;
  referenceNumber?: string;
  remarks?: string;
  balanceAfter?: number;
  createdBy?: string;
}

export interface StoreOutwardItem {
  itemId: string;
  itemName?: string;
  quantity: number;
  unit?: string;
}

export interface StoreOutward {
  id: string;
  outwardNumber?: string;
  issueNumber?: string;
  date?: string;
  issueDate?: string;
  projectId?: string;
  projectName?: string;
  issuedTo: string;
  department: string;
  purpose: string;
  items: StoreOutwardItem[];
  issuedBy?: string;
  issuerName?: string;
  issuedByName?: string;
  status?: string;
  remarks?: string;
}

export interface VendorBill {
  id: string;
  billNumber: string;
  billDate: string;
  vendorId: string;
  vendorName: string;
  poId: string;
  poNumber: string;
  grnId?: string;
  grnNumber?: string;
  vendorInvoiceNumber?: string;
  billAmount: number;
  totalAmount?: number;
  paidAmount: number;
  outstandingAmount: number;
  dueDate?: string;
  status: 'Pending Verification' | 'Verified' | 'Approved for Payment' | 'Partially Paid' | 'Fully Paid' | 'Disputed' | 'Submitted' | 'Paid' | string;
  paymentStatus?: string;
  creditPeriod?: number;
}

export interface PaymentRequest {
  id: string;
  requestId?: string;
  requestNumber?: string;
  requestDate: string;
  vendorId: string;
  vendorName: string;
  billId: string;
  billNumber: string;
  poNumber?: string;
  billAmount?: number;
  dueDate?: string;
  outstandingAmount?: number;
  requestedAmount: number;
  status: 'Pending Verification' | 'Accounts Verified' | 'Approved by Management' | 'Approved' | 'Rejected' | 'Paid' | 'Submitted' | 'Pending' | string;
  remarks: string;
  createdBy?: string;
  createdByName?: string;
  requestedBy?: string;
  requesterName?: string;
}

export interface PaymentEntry {
  id: string;
  paymentId: string;
  paymentNumber?: string;
  paymentDate: string;
  vendorId: string;
  vendorName: string;
  billId: string;
  billNumber: string;
  poNumber: string;
  paymentAmount: number;
  paymentMode: 'Bank Transfer/NEFT/RTGS' | 'Cheque' | 'UPI' | 'Cash';
  transactionNumber: string; 
  remarks: string;
  enteredBy: string;
  enteredByName: string;
}

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  oldValue?: string;
  newValue?: string;
  description?: string;
  module: string;
  entityType?: string;
  details?: string;
  referenceId: string;
  timestamp: string;
}

export interface Notification {
  id: string;
  recipientRole: string;
  title: string;
  message: string;
  readBy: string[];
  read?: boolean;
  referenceModule?: string;
  referenceId?: string;
  timestamp: string;
}

export interface ActionCapability {
  viewGlobal?: boolean;
  viewOwn?: boolean;
  create?: boolean;
  update?: boolean;
  delete?: boolean;
}

export interface RolePermission {
  id?: string;
  _id?: string;
  role: string;
  name?: string;
  description?: string;
  isSystemRole?: boolean;
  status?: 'Active' | 'Inactive';
  modules: string[];
  permissions?: Record<string, ActionCapability>;
}


// Environment API Base Configuration
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5005/api';



const DB_KEY = 'purchase_store_enterprise_db_v2';

export interface DatabaseState {
  users: User[];
  projects: Project[];
  vendors: Vendor[];
  categories: Category[];
  units: Unit[];
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
}

export function deduplicateById<T extends { id?: string }>(arr: T[]): T[] {
  if (!arr || !Array.isArray(arr)) return [];
  const seen = new Set<string>();
  const result: T[] = [];

  for (let i = 0; i < arr.length; i++) {
    const item = arr[i];
    if (!item) continue;
    const rawId = item.id || (item as any)._id || (item as any).code || (item as any).role ||
      (item as any).prNumber || (item as any).poNumber || (item as any).grnNumber ||
      (item as any).billNumber || (item as any).outwardNumber || (item as any).reqNumber;

    const stockKey = ((item as any).projectId && (item as any).itemId) ? `${(item as any).projectId}-${(item as any).itemId}` : undefined;
    const key = String(rawId || stockKey || `idx-${i}`);

    if (!seen.has(key)) {
      seen.add(key);
      result.push({
        ...item,
        id: key
      });
    }
  }
  return result;
}

export function getDatabase(): DatabaseState {
  return {
    users: [],
    projects: [],
    vendors: [],
    categories: [],
    units: [],
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
}

export async function fetchInitialData(): Promise<DatabaseState> {
  return getDatabase();
}

export function saveDatabase(data: DatabaseState) {
  // Persistence strictly managed by backend API
}

export const fetchDatabaseFromBackend = fetchInitialData;

export function addAuditLog(
  userId: string,
  action: string,
  oldValue: string,
  newValue: string,
  module: string,
  referenceId: string
) {
  // Audit log dispatched via API
}

export function sendNotification(
  recipientRole: string,
  title: string,
  message: string,
  referenceModule?: string,
  referenceId?: string
) {
  // Notification dispatched via API
}

