"use client";

import React from 'react';
import { Card } from '@/components/ui/Card';
import { Table } from '@/components/ui/Table';
import { Button } from '@/components/ui/Button';
import { PurchaseRequest, PurchaseOrder, Stock, VendorBill } from '@/lib/storeData';
import {
  FileSpreadsheet,
  FileCheck,
  Package,
  Layers,
  ArrowRight,
  Clock,
  CheckCircle2,
  XCircle,
  Plus,
  AlertCircle
} from 'lucide-react';
import { SidebarTab } from '../SidebarNav';

interface DashboardOverviewProps {
  purchaseRequests: PurchaseRequest[];
  purchaseOrders: PurchaseOrder[];
  stocks: Stock[];
  vendorBills: VendorBill[];
  currentUser?: any;
  rolePermissions?: any[];
  setActiveTab: (tab: SidebarTab) => void;
  onOpenCreatePRModal: () => void;
  onOpenCreatePOModal: () => void;
  onOpenCreateGRNModal?: () => void;
  onOpenCreateBillModal?: () => void;
}

export function DashboardOverview({
  purchaseRequests,
  purchaseOrders,
  stocks,
  vendorBills,
  currentUser,
  rolePermissions = [],
  setActiveTab,
  onOpenCreatePRModal,
  onOpenCreatePOModal
}: DashboardOverviewProps) {
  const pendingPrs = purchaseRequests.filter(pr => pr.status === 'Submitted' || pr.status === 'Under Review');
  const activePos = purchaseOrders.filter(po => po.status === 'Approved' || po.status === 'Partially Received' || po.status === 'Order Placed');
  const lowStockCount = stocks.filter(s => s.quantity <= (s.reorderLevel || 10)).length;
  const pendingBills = vendorBills.filter(b => b.status === 'Submitted' || b.status === 'Verified' || b.status === 'Pending Verification');

  const canCreatePR = currentUser?.role === 'Admin' || (() => {
    const rp = rolePermissions.find(r => r.role?.toLowerCase() === currentUser?.role?.toLowerCase());
    if (!rp || !rp.permissions || !rp.permissions['Purchase Requests']) return true;
    return !!rp.permissions['Purchase Requests'].create;
  })();

  const canCreatePO = currentUser?.role === 'Admin' || (() => {
    const rp = rolePermissions.find(r => r.role?.toLowerCase() === currentUser?.role?.toLowerCase());
    if (!rp || !rp.permissions || !rp.permissions['Purchase Orders']) return true;
    return !!rp.permissions['Purchase Orders'].create;
  })();

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Approved':
      case 'Verified':
      case 'Paid':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
            {status}
          </span>
        );
      case 'Submitted':
      case 'Under Review':
      case 'Pending':
      case 'Pending Verification':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-3.5 h-3.5 mr-1" />
            {status}
          </span>
        );
      case 'Rejected':
      case 'Disputed':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <XCircle className="w-3.5 h-3.5 mr-1" />
            {status}
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
            {status}
          </span>
        );
    }
  };

  const formatDate = (val?: string) => {
    if (!val) return '-';
    try {
      const d = new Date(val);
      if (isNaN(d.getTime())) return String(val);
      return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    } catch {
      return String(val);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Header Card with subtle modern gradient */}
      <div className="bg-gradient-to-r from-blue-50/60 via-white to-indigo-50/50 p-6 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2.5 mb-1">
            <h1 className="text-xl font-black text-[#0F172C] tracking-tight">
              Operational Workspace Overview
            </h1>
            <span className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Live Engine</span>
            </span>
          </div>
          <p className="text-sm text-slate-500 font-medium leading-relaxed">
            Consolidated pipeline tracking for requisitions, vendor orders, inventory registers &amp; accounts settlement.
          </p>
        </div>

        <div className="flex items-center space-x-3 flex-shrink-0">
          {canCreatePO && (
            <Button
              variant="outline"
              icon={<Plus className="w-4 h-4" />}
              onClick={onOpenCreatePOModal}
            >
              Create PO
            </Button>
          )}
          {canCreatePR && (
            <Button
              variant="primary"
              icon={<Plus className="w-4 h-4" />}
              onClick={onOpenCreatePRModal}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-md shadow-blue-600/20"
            >
              Create PR
            </Button>
          )}
        </div>
      </div>

      {/* Modern KPI Cards Grid with subtle gradient accents */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* KPI 1: Pending PRs */}
        <Card className="p-5 bg-white hover:bg-gradient-to-br hover:from-white hover:to-blue-50/30 border border-slate-200/90 rounded-2xl shadow-xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500">Pending PRs</p>
              <h3 className="text-2xl font-black text-[#0F172C] mt-1">{pendingPrs.length}</h3>
              <p className="text-xs font-semibold text-slate-500 mt-1">Total PRs: {purchaseRequests.length}</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-500/15 to-blue-600/10 text-blue-600 border border-blue-200/60 flex items-center justify-center shadow-2xs">
              <FileSpreadsheet className="h-6 w-6" />
            </div>
          </div>
          <button
            type="button"
            onClick={() => setActiveTab('pr')}
            className="mt-4 w-full flex items-center justify-between text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline pt-3 border-t border-slate-100 cursor-pointer"
          >
            <span>Manage Purchase Requests</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </Card>

        {/* KPI 2: Active POs */}
        <Card className="p-5 bg-white hover:bg-gradient-to-br hover:from-white hover:to-indigo-50/30 border border-slate-200/90 rounded-2xl shadow-xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500">Active POs</p>
              <h3 className="text-2xl font-black text-[#0F172C] mt-1">{activePos.length}</h3>
              <p className="text-xs font-semibold text-slate-500 mt-1">Total POs: {purchaseOrders.length}</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-500/15 to-indigo-600/10 text-indigo-600 border border-indigo-200/60 flex items-center justify-center shadow-2xs">
              <FileCheck className="h-6 w-6" />
            </div>
          </div>
          <button
            type="button"
            onClick={() => setActiveTab('po')}
            className="mt-4 w-full flex items-center justify-between text-xs font-bold text-indigo-600 hover:text-indigo-700 hover:underline pt-3 border-t border-slate-100 cursor-pointer"
          >
            <span>Track Purchase Orders</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </Card>

        {/* KPI 3: Low Stock Alerts */}
        <Card className="p-5 bg-white hover:bg-gradient-to-br hover:from-white hover:to-rose-50/30 border border-slate-200/90 rounded-2xl shadow-xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500">Low Stock Items</p>
              <h3 className="text-2xl font-black text-rose-600 mt-1">{lowStockCount}</h3>
              <p className="text-xs font-semibold text-slate-500 mt-1">Catalog items: {stocks.length}</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-rose-500/15 to-rose-600/10 text-rose-600 border border-rose-200/60 flex items-center justify-center shadow-2xs">
              <Package className="h-6 w-6" />
            </div>
          </div>
          <button
            type="button"
            onClick={() => setActiveTab('stock')}
            className="mt-4 w-full flex items-center justify-between text-xs font-bold text-rose-600 hover:text-rose-700 hover:underline pt-3 border-t border-slate-100 cursor-pointer"
          >
            <span>Inspect Inventory Stock</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </Card>

        {/* KPI 4: Pending Bills */}
        <Card className="p-5 bg-white hover:bg-gradient-to-br hover:from-white hover:to-amber-50/30 border border-slate-200/90 rounded-2xl shadow-xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500">Bills to Verify</p>
              <h3 className="text-2xl font-black text-amber-600 mt-1">{pendingBills.length}</h3>
              <p className="text-xs font-semibold text-slate-500 mt-1">Total Bills: {vendorBills.length}</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500/15 to-amber-600/10 text-amber-600 border border-amber-200/60 flex items-center justify-center shadow-2xs">
              <Layers className="h-6 w-6" />
            </div>
          </div>
          <button
            type="button"
            onClick={() => setActiveTab('bills')}
            className="mt-4 w-full flex items-center justify-between text-xs font-bold text-amber-600 hover:text-amber-700 hover:underline pt-3 border-t border-slate-100 cursor-pointer"
          >
            <span>Process Vendor Invoices</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </Card>
      </div>

      {/* Recent Requisitions Table */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-[#0F172C]">Recent Purchase Requests</h2>
            <p className="text-xs text-slate-500 font-medium">Latest material requisitions from active project sites</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setActiveTab('pr')}
            icon={<ArrowRight className="w-3.5 h-3.5" />}
            iconPosition="right"
          >
            View All PRs
          </Button>
        </div>

        <Table
          headers={['PR Number', 'Project Site', 'Requested By', 'Required Date', 'Priority', 'Status']}
          data={purchaseRequests.slice(0, 5)}
          emptyMessage="No purchase requests created yet."
          renderRow={(pr) => (
            <tr key={pr.id} className="hover:bg-slate-50 transition-colors">
              <td className="px-4 py-3 font-semibold text-slate-900 text-xs">{pr.prNumber}</td>
              <td className="px-4 py-3 font-medium text-slate-900 text-xs">{pr.projectName}</td>
              <td className="px-4 py-3 text-slate-800 font-medium text-xs">{pr.requesterName}</td>
              <td className="px-4 py-3 text-slate-800 font-medium text-xs whitespace-nowrap">{formatDate(pr.requiredDate)}</td>
              <td className="px-4 py-3">
                <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold ${
                  pr.priority === 'Urgent'
                    ? 'bg-rose-50 text-rose-700 border border-rose-200'
                    : pr.priority === 'High'
                    ? 'bg-amber-50 text-amber-700 border border-amber-200'
                    : 'bg-slate-100 text-slate-700 border border-slate-200'
                }`}>
                  {pr.priority}
                </span>
              </td>
              <td className="px-4 py-3">
                {getStatusBadge(pr.status)}
              </td>
            </tr>
          )}
        />
      </div>
    </div>
  );
}
