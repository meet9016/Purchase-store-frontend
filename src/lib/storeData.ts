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
  role: string;
  modules: string[];
  permissions?: Record<string, ActionCapability>;
}

// Environment API Base Configuration
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5005/api';

// ==========================================
// RICH REALISTIC SEED DATA FOR STANDALONE DEMO
// ==========================================

const INITIAL_USERS: User[] = [
  { id: 'usr-1', name: 'Alok Sharma', email: 'admin@gmail.com', role: 'Admin', department: 'Executive Management', active: true },
  { id: 'usr-2', name: 'Vikram Singh', email: 'vikram.site@gmail.com', role: 'Requester', department: 'Civil Engineering', active: true },
  { id: 'usr-3', name: 'Pooja Patel', email: 'pooja.purchase@gmail.com', role: 'Purchase', department: 'Procurement & Supply Chain', active: true },
  { id: 'usr-4', name: 'Ramesh Rao', email: 'ramesh.store@gmail.com', role: 'Store', department: 'Central Warehouse & Store', active: true },
  { id: 'usr-5', name: 'Sneha Verma', email: 'sneha.accounts@gmail.com', role: 'Accounts', department: 'Finance & Billing', active: true },
];

const INITIAL_PROJECTS: Project[] = [
  { id: 'prj-1', name: 'Skyview Heights Tower', location: 'Andheri East, Mumbai', status: 'Active' },
  { id: 'prj-2', name: 'Metro Rail Phase 4', location: 'Bandra Kurla Complex, Mumbai', status: 'Active' },
  { id: 'prj-3', name: 'Greenfield Logistic Park', location: 'Panvel, Navi Mumbai', status: 'Active' },
  { id: 'prj-4', name: 'Highway Flyover Junction', location: 'Ghodbunder Road, Thane', status: 'Active' }
];

const INITIAL_CATEGORIES: Category[] = [
  { id: 'cat-1', name: 'Civil & Structural Materials', description: 'Cement, Aggregates, Sand and Bricks' },
  { id: 'cat-2', name: 'Steel & Rebars', description: 'TMT Steel rebars, Structural Sections & Binding wire' },
  { id: 'cat-3', name: 'Electrical & Fixtures', description: 'Cables, Conduits, Switches & Distribution Panels' },
  { id: 'cat-4', name: 'Plumbing & Drainage', description: 'CPVC, UPVC pipes, valves and sanitary fittings' },
  { id: 'cat-5', name: 'Safety Equipment & PPE', description: 'Helmets, safety boots, vests & harnesses' }
];

const INITIAL_ITEMS: Item[] = [
  { id: 'itm-1', itemCode: 'CIV-CEM-01', name: 'Cement OPC 53 Grade', categoryId: 'cat-1', categoryName: 'Civil & Structural Materials', subCategory: 'Cement', unit: 'Bags', description: 'Grade 53 Portland Cement 50kg Bags', minStock: 200, reorderLevel: 500 },
  { id: 'itm-2', itemCode: 'STL-TMT-16', name: 'TMT Steel Rebars Fe550D 16mm', categoryId: 'cat-2', categoryName: 'Steel & Rebars', subCategory: 'TMT', unit: 'MT', description: 'High ductility thermo-mechanically treated rebars', minStock: 20, reorderLevel: 50 },
  { id: 'itm-3', itemCode: 'CIV-SND-01', name: 'River M-Sand (Manufactured)', categoryId: 'cat-1', categoryName: 'Civil & Structural Materials', subCategory: 'Sand', unit: 'Brass', description: 'Washed concrete grade manufactured sand', minStock: 10, reorderLevel: 25 },
  { id: 'itm-4', itemCode: 'CIV-RMC-25', name: 'Ready Mix Concrete M25', categoryId: 'cat-1', categoryName: 'Civil & Structural Materials', subCategory: 'Concrete', unit: 'Cu.M', description: 'Standard structural grade ready mix concrete', minStock: 50, reorderLevel: 100 },
  { id: 'itm-5', itemCode: 'ELE-CND-25', name: 'PVC Conduit Pipe 25mm Heavy', categoryId: 'cat-3', categoryName: 'Electrical & Fixtures', subCategory: 'Conduits', unit: 'Mtrs', description: 'Heavy duty fire retardant PVC conduit pipes', minStock: 300, reorderLevel: 800 },
  { id: 'itm-6', itemCode: 'SAF-HLM-01', name: 'Industrial Safety Helmets (ISI)', categoryId: 'cat-5', categoryName: 'Safety Equipment & PPE', subCategory: 'Head Protection', unit: 'Pcs', description: 'ISI marked HDPE safety helmets with chin strap', minStock: 50, reorderLevel: 100 }
];

const INITIAL_VENDORS: Vendor[] = [
  {
    id: 'ven-1',
    name: 'UltraTech Cement Ltd',
    contactPerson: 'Rajesh Gupta',
    email: 'sales.mumbai@ultratechcement.com',
    phone: '+91 98201 12345',
    gstNo: '27AAACU1234F1Z5',
    panNo: 'AAACU1234F',
    bankDetails: { bankName: 'HDFC Bank Ltd', accountNo: '50200012345678', ifscCode: 'HDFC0000060' },
    creditPeriod: 30,
    address: 'B-Wing, Ahura Centre, Mahakali Caves Road, Andheri East, Mumbai'
  },
  {
    id: 'ven-2',
    name: 'Tata Steel Procurement Division',
    contactPerson: 'Ankit Mehta',
    email: 'procure@tatasteel.com',
    phone: '+91 98199 87654',
    gstNo: '27AAACT5678K1Z2',
    panNo: 'AAACT5678K',
    bankDetails: { bankName: 'State Bank of India', accountNo: '30456789012', ifscCode: 'SBIN0000300' },
    creditPeriod: 45,
    address: 'Bombay House, 24 Homi Mody Street, Fort, Mumbai'
  },
  {
    id: 'ven-3',
    name: 'ACC Concrete Solutions',
    contactPerson: 'Sunil Verma',
    email: 'orders.rmc@acclimited.com',
    phone: '+91 98330 45678',
    gstNo: '27AAACA9012M1Z8',
    panNo: 'AAACA9012M',
    bankDetails: { bankName: 'ICICI Bank Ltd', accountNo: '000405001122', ifscCode: 'ICIC0000004' },
    creditPeriod: 30,
    address: 'Cement House, 121 Maharshi Karve Road, Mumbai'
  },
  {
    id: 'ven-4',
    name: 'Havells Distribution Network',
    contactPerson: 'Deepak Joshi',
    email: 'sales.west@havells.com',
    phone: '+91 98920 65432',
    gstNo: '27AAACH3456P1Z3',
    panNo: 'AAACH3456P',
    bankDetails: { bankName: 'Axis Bank Ltd', accountNo: '912010023456789', ifscCode: 'UTIB0000123' },
    creditPeriod: 21,
    address: 'Unit 401, Quantum Towers, Malad West, Mumbai'
  }
];

const INITIAL_PRS: PurchaseRequest[] = [
  {
    id: 'pr-1',
    prNumber: 'PR-2026-001',
    requestDate: '2026-09-01',
    projectId: 'prj-1',
    projectName: 'Skyview Heights Tower',
    requestedBy: 'usr-2',
    requesterName: 'Vikram Singh',
    requiredDate: '2026-09-10',
    priority: 'High',
    items: [
      { itemId: 'itm-1', itemName: 'Cement OPC 53 Grade', quantity: 400, unit: 'Bags', remarks: 'For 5th floor slab casting' },
      { itemId: 'itm-2', itemName: 'TMT Steel Rebars Fe550D 16mm', quantity: 25, unit: 'MT', remarks: 'Column reinforcement works' }
    ],
    status: 'Approved',
    history: [
      { status: 'Submitted', user: 'Vikram Singh', timestamp: '2026-09-01 10:30 AM', remarks: 'Requisition submitted for Slab works' },
      { status: 'Approved', user: 'Alok Sharma', timestamp: '2026-09-01 02:15 PM', remarks: 'Approved as per site requirement' }
    ]
  },
  {
    id: 'pr-2',
    prNumber: 'PR-2026-002',
    requestDate: '2026-09-02',
    projectId: 'prj-2',
    projectName: 'Metro Rail Phase 4',
    requestedBy: 'usr-2',
    requesterName: 'Vikram Singh',
    requiredDate: '2026-09-12',
    priority: 'Urgent',
    items: [
      { itemId: 'itm-4', itemName: 'Ready Mix Concrete M25', quantity: 120, unit: 'Cu.M', remarks: 'Pier foundation concrete' }
    ],
    status: 'Submitted',
    history: [
      { status: 'Submitted', user: 'Vikram Singh', timestamp: '2026-09-02 09:45 AM', remarks: 'Urgent foundation pour' }
    ]
  },
  {
    id: 'pr-3',
    prNumber: 'PR-2026-003',
    requestDate: '2026-09-02',
    projectId: 'prj-3',
    projectName: 'Greenfield Logistic Park',
    requestedBy: 'usr-2',
    requesterName: 'Vikram Singh',
    requiredDate: '2026-09-15',
    priority: 'Medium',
    items: [
      { itemId: 'itm-5', itemName: 'PVC Conduit Pipe 25mm Heavy', quantity: 600, unit: 'Mtrs', remarks: 'Warehouse internal electrical works' },
      { itemId: 'itm-6', itemName: 'Industrial Safety Helmets (ISI)', quantity: 40, unit: 'Pcs', remarks: 'New batch of site workers' }
    ],
    status: 'PO Created',
    history: [
      { status: 'Submitted', user: 'Vikram Singh', timestamp: '2026-09-02 11:20 AM' },
      { status: 'Approved', user: 'Alok Sharma', timestamp: '2026-09-02 03:00 PM' },
      { status: 'PO Created', user: 'Pooja Patel', timestamp: '2026-09-03 10:10 AM' }
    ]
  }
];

const INITIAL_POS: PurchaseOrder[] = [
  {
    id: 'po-1',
    poNumber: 'PO-2026-001',
    poDate: '2026-09-01',
    prId: 'pr-1',
    prNumber: 'PR-2026-001',
    projectId: 'prj-1',
    projectName: 'Skyview Heights Tower',
    vendorId: 'ven-1',
    vendorName: 'UltraTech Cement Ltd',
    creditPeriod: 30,
    expectedDeliveryDate: '2026-09-05',
    deliveryLocation: 'Skyview Site, Andheri East, Mumbai',
    termsConditions: 'Standard 30 days credit post physical site inspection',
    remarks: 'Deliver in 2 batches of 200 bags each',
    status: 'Fully Supplied',
    totalPOAmount: 184000,
    totalAmount: 184000,
    items: [
      { itemId: 'itm-1', itemName: 'Cement OPC 53 Grade', quantity: 400, unit: 'Bags', rate: 400, tax: 15, discount: 0, totalAmount: 184000 }
    ]
  },
  {
    id: 'po-2',
    poNumber: 'PO-2026-002',
    poDate: '2026-09-02',
    prId: 'pr-1',
    prNumber: 'PR-2026-001',
    projectId: 'prj-1',
    projectName: 'Skyview Heights Tower',
    vendorId: 'ven-2',
    vendorName: 'Tata Steel Procurement Division',
    creditPeriod: 45,
    expectedDeliveryDate: '2026-09-08',
    deliveryLocation: 'Skyview Site Yard, Andheri East, Mumbai',
    termsConditions: 'Mill test certificates mandatory with challan',
    remarks: 'Direct trailer delivery',
    status: 'Order Placed',
    totalPOAmount: 1622500,
    totalAmount: 1622500,
    items: [
      { itemId: 'itm-2', itemName: 'TMT Steel Rebars Fe550D 16mm', quantity: 25, unit: 'MT', rate: 55000, tax: 18, discount: 0, totalAmount: 1622500 }
    ]
  }
];

const INITIAL_GRNS: GRN[] = [
  {
    id: 'grn-1',
    grnNumber: 'GRN-2026-001',
    grnDate: '2026-09-02',
    receivedDate: '2026-09-02',
    poId: 'po-1',
    poNumber: 'PO-2026-001',
    vendorId: 'ven-1',
    vendorName: 'UltraTech Cement Ltd',
    projectId: 'prj-1',
    projectName: 'Skyview Heights Tower',
    vehicleNumber: 'MH-04-AB-4455',
    challanNumber: 'CH-UT-9082',
    vendorInvoiceNumber: 'INV-UT-2026-88',
    remarks: '400 bags received in dry condition, quality verified',
    receivedBy: 'usr-4',
    receiverName: 'Ramesh Rao',
    items: [
      { itemId: 'itm-1', itemName: 'Cement OPC 53 Grade', orderedQty: 400, receivedQty: 400, shortQty: 0, excessQty: 0, damagedQty: 0, unit: 'Bags', batchNumber: 'BAT-2026-09A' }
    ]
  }
];

const INITIAL_STOCKS: Stock[] = [
  { id: 'stk-1', projectId: 'prj-1', projectName: 'Skyview Heights Tower', itemId: 'itm-1', itemName: 'Cement OPC 53 Grade', itemCode: 'CIV-CEM-01', unit: 'Bags', quantity: 320, minStock: 200, reorderLevel: 500 },
  { id: 'stk-2', projectId: 'prj-1', projectName: 'Skyview Heights Tower', itemId: 'itm-2', itemName: 'TMT Steel Rebars Fe550D 16mm', itemCode: 'STL-TMT-16', unit: 'MT', quantity: 38, minStock: 20, reorderLevel: 50 },
  { id: 'stk-3', projectId: 'prj-2', projectName: 'Metro Rail Phase 4', itemId: 'itm-4', itemName: 'Ready Mix Concrete M25', itemCode: 'CIV-RMC-25', unit: 'Cu.M', quantity: 85, minStock: 50, reorderLevel: 100 },
  { id: 'stk-4', projectId: 'prj-3', projectName: 'Greenfield Logistic Park', itemId: 'itm-5', itemName: 'PVC Conduit Pipe 25mm Heavy', itemCode: 'ELE-CND-25', unit: 'Mtrs', quantity: 450, minStock: 300, reorderLevel: 800 },
  { id: 'stk-5', projectId: 'prj-1', projectName: 'Skyview Heights Tower', itemId: 'itm-6', itemName: 'Industrial Safety Helmets (ISI)', itemCode: 'SAF-HLM-01', unit: 'Pcs', quantity: 65, minStock: 50, reorderLevel: 100 }
];

const INITIAL_OUTWARDS: StoreOutward[] = [
  {
    id: 'out-1',
    outwardNumber: 'OUT-2026-001',
    date: '2026-09-02',
    projectId: 'prj-1',
    projectName: 'Skyview Heights Tower',
    issuedTo: 'Manoj Contractor (Civil)',
    department: 'Civil Structure',
    purpose: 'Columns Pouring Wing B',
    issuedBy: 'usr-4',
    issuerName: 'Ramesh Rao',
    status: 'Issued',
    items: [
      { itemId: 'itm-1', itemName: 'Cement OPC 53 Grade', quantity: 80, unit: 'Bags' }
    ]
  }
];

const INITIAL_BILLS: VendorBill[] = [
  {
    id: 'bill-1',
    billNumber: 'BILL-2026-001',
    billDate: '2026-09-02',
    vendorId: 'ven-1',
    vendorName: 'UltraTech Cement Ltd',
    poId: 'po-1',
    poNumber: 'PO-2026-001',
    grnId: 'grn-1',
    grnNumber: 'GRN-2026-001',
    vendorInvoiceNumber: 'INV-UT-2026-88',
    billAmount: 184000,
    totalAmount: 184000,
    paidAmount: 84000,
    outstandingAmount: 100000,
    dueDate: '2026-10-02',
    creditPeriod: 30,
    status: 'Partially Paid'
  }
];

const INITIAL_PAYMENT_REQUESTS: PaymentRequest[] = [
  {
    id: 'prq-1',
    requestId: 'PAYREQ-2026-001',
    requestNumber: 'PAYREQ-2026-001',
    requestDate: '2026-09-02',
    vendorId: 'ven-1',
    vendorName: 'UltraTech Cement Ltd',
    billId: 'bill-1',
    billNumber: 'BILL-2026-001',
    poNumber: 'PO-2026-001',
    requestedAmount: 100000,
    status: 'Pending Verification',
    remarks: 'Balance 30-day payment clearance as per agreed terms',
    createdBy: 'usr-3',
    createdByName: 'Pooja Patel'
  }
];

const INITIAL_PAYMENT_ENTRIES: PaymentEntry[] = [
  {
    id: 'pay-1',
    paymentId: 'PAY-2026-001',
    paymentNumber: 'PAY-2026-001',
    paymentDate: '2026-09-02',
    vendorId: 'ven-1',
    vendorName: 'UltraTech Cement Ltd',
    billId: 'bill-1',
    billNumber: 'BILL-2026-001',
    poNumber: 'PO-2026-001',
    paymentAmount: 84000,
    paymentMode: 'Bank Transfer/NEFT/RTGS',
    transactionNumber: 'UTR-HDFC-98234710',
    remarks: 'Advance release voucher',
    enteredBy: 'usr-5',
    enteredByName: 'Sneha Verma'
  }
];

const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'log-1',
    userId: 'usr-1',
    userName: 'Alok Sharma',
    action: 'System Initialized',
    module: 'System',
    newValue: 'Procurement and Store Database Online',
    referenceId: 'sys-init',
    timestamp: new Date().toISOString()
  },
  {
    id: 'log-2',
    userId: 'usr-2',
    userName: 'Vikram Singh',
    action: 'Create PR',
    module: 'Requisition',
    newValue: 'Submitted PR-2026-001 for Skyview Heights Tower',
    referenceId: 'pr-1',
    timestamp: new Date().toISOString()
  }
];

const INITIAL_NOTIFICATIONS: Notification[] = [
  {
    id: 'notif-1',
    recipientRole: 'Approver',
    title: 'New Requisition Submitted',
    message: 'PR-2026-002 (Metro Rail Phase 4) marked as Urgent by Vikram Singh requires review.',
    readBy: [],
    read: false,
    timestamp: new Date().toISOString()
  },
  {
    id: 'notif-2',
    recipientRole: 'Accounts',
    title: 'Payment Request Pending',
    message: 'Payment Request PAYREQ-2026-001 for UltraTech Cement Ltd is ready for clearance.',
    readBy: [],
    read: false,
    timestamp: new Date().toISOString()
  }
];

export const DEFAULT_ROLE_PERMISSIONS: RolePermission[] = [
  {
    role: 'Admin',
    modules: ['dashboard', 'masters', 'pr', 'po', 'grn', 'stock', 'outward', 'bills', 'payment-req', 'payments', 'reports', 'audit', 'notifications', 'permissions'],
    permissions: {
      'Leads': { viewGlobal: true, viewOwn: true, create: true, update: true, delete: true },
      'User': { viewGlobal: true, viewOwn: true, create: true, update: true, delete: true },
      'Department Management': { viewGlobal: true, viewOwn: true, create: true, update: true, delete: true },
      'Lead Statuses': { viewGlobal: true, viewOwn: true, create: true, update: true, delete: true },
      'Lead Sources': { viewGlobal: true, viewOwn: true, create: true, update: true, delete: true },
      'Category': { viewGlobal: true, viewOwn: true, create: true, update: true, delete: true },
      'Product': { viewGlobal: true, viewOwn: true, create: true, update: true, delete: true },
      'Stock': { viewGlobal: true, viewOwn: true, create: true, update: true, delete: true },
      'City Master': { viewGlobal: true, viewOwn: true, create: true, update: true, delete: true },
      'Reports': { viewGlobal: true, viewOwn: true, create: true, update: true, delete: true },
      'Purchase Requests': { viewGlobal: true, viewOwn: true, create: true, update: true, delete: true },
      'Purchase Orders': { viewGlobal: true, viewOwn: true, create: true, update: true, delete: true },
      'Goods Receipt (GRN)': { viewGlobal: true, viewOwn: true, create: true, update: true, delete: true },
      'Store Outward': { viewGlobal: true, viewOwn: true, create: true, update: true, delete: true },
      'Vendor Invoices': { viewGlobal: true, viewOwn: true, create: true, update: true, delete: true },
      'Payment Requests': { viewGlobal: true, viewOwn: true, create: true, update: true, delete: true },
      'Payment Entries': { viewGlobal: true, viewOwn: true, create: true, update: true, delete: true },
    }
  },
  {
    role: 'Requester',
    modules: ['dashboard', 'pr', 'stock', 'reports', 'notifications'],
    permissions: {
      'Purchase Requests': { viewGlobal: false, viewOwn: true, create: true, update: true, delete: false },
      'Product': { viewGlobal: true, viewOwn: false, create: false, update: false, delete: false },
      'Stock': { viewGlobal: true, viewOwn: false, create: false, update: false, delete: false },
      'Reports': { viewGlobal: false, viewOwn: true, create: false, update: false, delete: false },
    }
  },
  {
    role: 'Approver',
    modules: ['dashboard', 'pr', 'po', 'payment-req', 'reports', 'notifications'],
    permissions: {
      'Purchase Requests': { viewGlobal: true, viewOwn: true, create: false, update: true, delete: false },
      'Purchase Orders': { viewGlobal: true, viewOwn: true, create: true, update: true, delete: false },
      'Payment Requests': { viewGlobal: true, viewOwn: true, create: false, update: true, delete: false },
      'Reports': { viewGlobal: true, viewOwn: false, create: false, update: false, delete: false },
    }
  },
  {
    role: 'Purchase',
    modules: ['dashboard', 'masters', 'pr', 'po', 'grn', 'reports', 'notifications'],
    permissions: {
      'Category': { viewGlobal: true, viewOwn: false, create: true, update: true, delete: false },
      'Product': { viewGlobal: true, viewOwn: false, create: true, update: true, delete: false },
      'Purchase Requests': { viewGlobal: true, viewOwn: false, create: false, update: true, delete: false },
      'Purchase Orders': { viewGlobal: true, viewOwn: true, create: true, update: true, delete: true },
      'Goods Receipt (GRN)': { viewGlobal: true, viewOwn: true, create: true, update: true, delete: false },
      'Reports': { viewGlobal: true, viewOwn: false, create: false, update: false, delete: false },
    }
  },
  {
    role: 'Store',
    modules: ['dashboard', 'grn', 'stock', 'outward', 'reports', 'notifications'],
    permissions: {
      'Product': { viewGlobal: true, viewOwn: false, create: false, update: false, delete: false },
      'Stock': { viewGlobal: true, viewOwn: true, create: true, update: true, delete: false },
      'Goods Receipt (GRN)': { viewGlobal: true, viewOwn: true, create: true, update: true, delete: false },
      'Store Outward': { viewGlobal: true, viewOwn: true, create: true, update: true, delete: false },
      'Reports': { viewGlobal: true, viewOwn: false, create: false, update: false, delete: false },
    }
  },
  {
    role: 'Accounts',
    modules: ['dashboard', 'bills', 'payment-req', 'payments', 'reports', 'notifications'],
    permissions: {
      'Vendor Invoices': { viewGlobal: true, viewOwn: true, create: true, update: true, delete: false },
      'Payment Requests': { viewGlobal: true, viewOwn: true, create: true, update: true, delete: false },
      'Payment Entries': { viewGlobal: true, viewOwn: true, create: true, update: true, delete: false },
      'Reports': { viewGlobal: true, viewOwn: false, create: false, update: false, delete: false },
    }
  },
  {
    role: 'Management',
    modules: ['dashboard', 'reports', 'audit', 'notifications'],
    permissions: {
      'Reports': { viewGlobal: true, viewOwn: false, create: false, update: false, delete: false },
      'User': { viewGlobal: true, viewOwn: false, create: false, update: false, delete: false },
      'Purchase Orders': { viewGlobal: true, viewOwn: false, create: false, update: false, delete: false },
    }
  }
];

const DB_KEY = 'purchase_store_enterprise_db_v2';

export interface DatabaseState {
  users: User[];
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
}

function deduplicateById<T extends { id?: string }>(arr: T[]): T[] {
  if (!arr) return [];
  const seen = new Set<string>();
  return arr.filter((item, idx) => {
    const key = item.id || (item as any).projectId ? `${(item as any).projectId}-${(item as any).itemId}` : `idx-${idx}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function getDatabase(): DatabaseState {
  if (typeof window === 'undefined') {
    return getInitialSeed();
  }

  const stored = localStorage.getItem(DB_KEY);
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      // Validate that stored state has minimum users
      if (parsed && Array.isArray(parsed.users) && parsed.users.length > 0) {
        return {
          users: deduplicateById(parsed.users),
          projects: deduplicateById(parsed.projects || INITIAL_PROJECTS),
          vendors: deduplicateById(parsed.vendors || INITIAL_VENDORS),
          categories: deduplicateById(parsed.categories || INITIAL_CATEGORIES),
          items: deduplicateById(parsed.items || INITIAL_ITEMS),
          purchaseRequests: deduplicateById(parsed.purchaseRequests || INITIAL_PRS),
          purchaseOrders: deduplicateById(parsed.purchaseOrders || INITIAL_POS),
          grns: deduplicateById(parsed.grns || INITIAL_GRNS),
          stock: deduplicateById(parsed.stock || INITIAL_STOCKS),
          stockTransactions: deduplicateById(parsed.stockTransactions || []),
          storeOutwards: deduplicateById(parsed.storeOutwards || INITIAL_OUTWARDS),
          vendorBills: deduplicateById(parsed.vendorBills || INITIAL_BILLS),
          paymentRequests: deduplicateById(parsed.paymentRequests || INITIAL_PAYMENT_REQUESTS),
          paymentEntries: deduplicateById(parsed.paymentEntries || INITIAL_PAYMENT_ENTRIES),
          auditLogs: deduplicateById(parsed.auditLogs || INITIAL_AUDIT_LOGS),
          notifications: deduplicateById(parsed.notifications || INITIAL_NOTIFICATIONS),
          rolePermissions: parsed.rolePermissions || DEFAULT_ROLE_PERMISSIONS
        };
      }
    } catch (e) {
      console.error('Error parsing localStorage DB, re-seeding:', e);
    }
  }

  const seed = getInitialSeed();
  localStorage.setItem(DB_KEY, JSON.stringify(seed));
  return seed;
}

function getInitialSeed(): DatabaseState {
  return {
    users: [...INITIAL_USERS],
    projects: [...INITIAL_PROJECTS],
    vendors: [...INITIAL_VENDORS],
    categories: [...INITIAL_CATEGORIES],
    items: [...INITIAL_ITEMS],
    purchaseRequests: [...INITIAL_PRS],
    purchaseOrders: [...INITIAL_POS],
    grns: [...INITIAL_GRNS],
    stock: [...INITIAL_STOCKS],
    stockTransactions: [],
    storeOutwards: [...INITIAL_OUTWARDS],
    vendorBills: [...INITIAL_BILLS],
    paymentRequests: [...INITIAL_PAYMENT_REQUESTS],
    paymentEntries: [...INITIAL_PAYMENT_ENTRIES],
    auditLogs: [...INITIAL_AUDIT_LOGS],
    notifications: [...INITIAL_NOTIFICATIONS],
    rolePermissions: [...DEFAULT_ROLE_PERMISSIONS]
  };
}

export async function fetchInitialData(): Promise<DatabaseState> {
  // Always return instantaneous localStorage state for pure frontend zero-lag experience
  const localData = getDatabase();

  // Async non-blocking background sync attempt (will never freeze or block the UI)
  if (typeof window !== 'undefined') {
    setTimeout(async () => {
      try {
        fetch(`${API_BASE}/sync`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(localData)
        }).catch(() => {});
      } catch (e) {
        // Safe offline mode
      }
    }, 500);
  }

  return localData;
}

export function saveDatabase(data: DatabaseState) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(DB_KEY, JSON.stringify(data));
  }

  // Safe background sync without blocking UI
  try {
    fetch(`${API_BASE}/sync`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }).catch(() => {});
  } catch (e) {
    // Offline mode
  }
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
  const db = getDatabase();
  const newLog: AuditLog = {
    id: `log-${Date.now()}`,
    userId,
    userName: db.users.find(u => u.id === userId)?.name || 'System User',
    action,
    oldValue,
    newValue,
    module,
    referenceId,
    timestamp: new Date().toISOString()
  };
  db.auditLogs.unshift(newLog);
  saveDatabase(db);
}

export function sendNotification(
  recipientRole: string,
  title: string,
  message: string,
  referenceModule?: string,
  referenceId?: string
) {
  const db = getDatabase();
  const newNotif: Notification = {
    id: `notif-${Date.now()}`,
    recipientRole,
    title,
    message,
    readBy: [],
    read: false,
    referenceModule,
    referenceId,
    timestamp: new Date().toISOString()
  };
  db.notifications.unshift(newNotif);
  saveDatabase(db);
}

