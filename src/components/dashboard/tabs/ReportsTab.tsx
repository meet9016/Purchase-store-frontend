"use client";

import React, { useState } from 'react';
import { PurchaseRequest, PurchaseOrder, GRN, Stock, StoreOutward, VendorBill, PaymentEntry } from '@/lib/storeData';
import { Table } from '@/components/ui/Table';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { FileSpreadsheet, Download } from 'lucide-react';
import { toast } from 'sonner';

interface ReportsTabProps {
  purchaseRequests: PurchaseRequest[];
  purchaseOrders: PurchaseOrder[];
  grns: GRN[];
  stocks: Stock[];
  outwards: StoreOutward[];
  bills: VendorBill[];
  payments: PaymentEntry[];
}

export function ReportsTab({ purchaseRequests, purchaseOrders, stocks, bills, payments }: ReportsTabProps) {
  const [reportType, setReportType] = useState<string>('pr');

  const exportCSV = () => {
    toast.success(`Exporting ${reportType.toUpperCase()} Report to CSV file...`);
  };

  const formatCurrency = (num: number) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(num);
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
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white border border-slate-200 rounded-xl px-4 py-3 shadow-xs">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600">
            <FileSpreadsheet className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-[#0F172C]">Store &amp; Purchase MIS Reports</h3>
            <p className="text-xs text-slate-500 font-medium">Generate data logs, audit compliance &amp; CSV exports</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <div className="min-w-[220px]">
            <Select
              options={[
                { value: 'pr', label: 'PR Summary Report' },
                { value: 'po', label: 'PO Fulfillment Report' },
                { value: 'stock', label: 'Inventory Stock Report' },
                { value: 'bills', label: 'Vendor Bill Aging Report' },
                { value: 'payments', label: 'Disbursement Vouchers' }
              ]}
              value={reportType}
              onChange={e => setReportType(e.target.value)}
            />
          </div>

          <Button
            variant="outline"
            icon={<Download className="h-4 w-4" />}
            onClick={exportCSV}
          >
            Export CSV
          </Button>
        </div>
      </div>

      {reportType === 'pr' && (
        <Table
          headers={['PR #', 'Project', 'Requester', 'Required Date', 'Items', 'Priority', 'Status']}
          data={purchaseRequests}
          itemsPerPage={10}
          renderRow={(pr) => (
            <tr key={pr.id} className="hover:bg-slate-50 transition-colors">
              <td className="px-4 py-3 font-semibold text-slate-900 text-xs">{pr.prNumber}</td>
              <td className="px-4 py-3 font-medium text-slate-900 text-xs">{pr.projectName}</td>
              <td className="px-4 py-3 text-slate-800 font-medium text-xs">{pr.requesterName}</td>
              <td className="px-4 py-3 text-slate-800 font-medium text-xs whitespace-nowrap">{formatDate(pr.requiredDate)}</td>
              <td className="px-4 py-3 font-semibold text-slate-900 text-xs">{pr.items?.length || 0} Lines</td>
              <td className="px-4 py-3 font-semibold text-slate-800 text-xs">{pr.priority}</td>
              <td className="px-4 py-3 font-semibold text-slate-900 text-xs">{pr.status}</td>
            </tr>
          )}
        />
      )}

      {reportType === 'po' && (
        <Table
          headers={['PO #', 'Vendor', 'Project', 'PO Date', 'Total Value', 'Status']}
          data={purchaseOrders}
          itemsPerPage={10}
          renderRow={(po) => (
            <tr key={po.id} className="hover:bg-slate-50 transition-colors">
              <td className="px-4 py-3 font-semibold text-slate-900 text-xs">{po.poNumber}</td>
              <td className="px-4 py-3 font-medium text-slate-900 text-xs">{po.vendorName}</td>
              <td className="px-4 py-3 text-slate-800 font-medium text-xs">{po.projectName}</td>
              <td className="px-4 py-3 text-slate-800 font-medium text-xs whitespace-nowrap">{formatDate(po.poDate)}</td>
              <td className="px-4 py-3 font-semibold text-slate-900 text-xs">{formatCurrency(po.totalPOAmount || po.totalAmount || 0)}</td>
              <td className="px-4 py-3 font-semibold text-slate-900 text-xs">{po.status}</td>
            </tr>
          )}
        />
      )}

      {reportType === 'stock' && (
        <Table
          headers={['Item Name', 'Code', 'Project', 'Stock Qty', 'Unit', 'Reorder Threshold']}
          data={stocks}
          itemsPerPage={10}
          renderRow={(s, idx) => (
            <tr key={s.id || `${s.projectId}-${s.itemId}-${idx}`} className="hover:bg-slate-50 transition-colors">
              <td className="px-4 py-3 font-semibold text-slate-900 text-xs">{s.itemName}</td>
              <td className="px-4 py-3 font-mono text-slate-800 font-semibold text-xs">{s.itemCode || '-'}</td>
              <td className="px-4 py-3 text-slate-900 font-medium text-xs">{s.projectName}</td>
              <td className="px-4 py-3 font-bold text-slate-900 text-xs">{s.quantity}</td>
              <td className="px-4 py-3 font-medium text-slate-800 text-xs">{s.unit}</td>
              <td className="px-4 py-3 text-slate-800 font-medium text-xs">{s.reorderLevel || 10}</td>
            </tr>
          )}
        />
      )}

      {reportType === 'bills' && (
        <Table
          headers={['Bill #', 'Vendor Invoice #', 'Vendor Name', 'Bill Amount', 'Paid Amount', 'Status']}
          data={bills}
          itemsPerPage={10}
          renderRow={(b) => (
            <tr key={b.id} className="hover:bg-slate-50 transition-colors">
              <td className="px-4 py-3 font-semibold text-slate-900 text-xs">{b.billNumber}</td>
              <td className="px-4 py-3 text-slate-800 font-medium text-xs">{b.vendorInvoiceNumber || b.billNumber}</td>
              <td className="px-4 py-3 text-slate-900 font-medium text-xs">{b.vendorName}</td>
              <td className="px-4 py-3 font-semibold text-slate-900 text-xs">{formatCurrency(b.billAmount)}</td>
              <td className="px-4 py-3 font-semibold text-emerald-600 text-xs">{formatCurrency(b.paidAmount || 0)}</td>
              <td className="px-4 py-3 font-semibold text-slate-900 text-xs">{b.status || b.paymentStatus}</td>
            </tr>
          )}
        />
      )}

      {reportType === 'payments' && (
        <Table
          headers={['Voucher #', 'Bill #', 'Vendor', 'Amount Paid', 'Mode', 'Transaction / UTR #']}
          data={payments}
          itemsPerPage={10}
          renderRow={(p) => (
            <tr key={p.id} className="hover:bg-slate-50 transition-colors">
              <td className="px-4 py-3 font-semibold text-slate-900 text-xs">{p.paymentNumber || p.paymentId || p.id}</td>
              <td className="px-4 py-3 text-slate-800 font-semibold text-xs">{p.billNumber}</td>
              <td className="px-4 py-3 text-slate-900 font-medium text-xs">{p.vendorName}</td>
              <td className="px-4 py-3 font-semibold text-emerald-600 text-xs">{formatCurrency(p.paymentAmount)}</td>
              <td className="px-4 py-3 font-medium text-slate-800 text-xs">{p.paymentMode}</td>
              <td className="px-4 py-3 font-mono text-slate-900 text-xs font-semibold">{p.transactionNumber || '-'}</td>
            </tr>
          )}
        />
      )}
    </div>
  );
}
