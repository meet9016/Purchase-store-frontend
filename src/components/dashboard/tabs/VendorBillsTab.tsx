"use client";

import React, { useState } from 'react';
import { VendorBill, User } from '@/lib/storeData';
import { Table } from '@/components/ui/Table';
import { Button } from '@/components/ui/Button';
import { Plus, Layers, CheckCircle2, X, Eye } from 'lucide-react';

interface VendorBillsTabProps {
  bills: VendorBill[];
  currentUser: User | null;
  rolePermissions?: any[];
  onOpenCreateBillModal: () => void;
  onUpdateBillStatus: (id: string, status: string) => void;
}

const statusBadge = (status: string) => {
  const map: Record<string, string> = {
    'Paid': 'bg-emerald-50 text-emerald-700 border-emerald-200',
    'Partially Paid': 'bg-blue-50 text-blue-700 border-blue-200',
    'Submitted': 'bg-amber-50 text-amber-700 border-amber-200',
    'Verified': 'bg-teal-50 text-teal-700 border-teal-200',
    'Approved for Payment': 'bg-indigo-50 text-indigo-700 border-indigo-200',
    'Disputed': 'bg-rose-50 text-rose-700 border-rose-200',
    'Pending Verification': 'bg-orange-50 text-orange-700 border-orange-200',
  };
  return map[status] || 'bg-slate-100 text-slate-600 border-slate-200';
};

export function VendorBillsTab({ bills, currentUser, rolePermissions = [], onOpenCreateBillModal, onUpdateBillStatus }: VendorBillsTabProps) {
  const [selectedBill, setSelectedBill] = useState<VendorBill | null>(null);
  const formatCurrency = (n: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n || 0);

  const isAccountsOrAdmin = currentUser?.role === 'Accounts' || currentUser?.role === 'Admin';

  const canCreateBill = currentUser?.role === 'Admin' || (() => {
    const rp = rolePermissions.find(r => r.role?.toLowerCase() === currentUser?.role?.toLowerCase());
    if (!rp || !rp.permissions || !rp.permissions['Vendor Invoices']) return true;
    return !!rp.permissions['Vendor Invoices'].create;
  })();

  const canRegisterBill = canCreateBill;
  const onOpenRegisterBillModal = onOpenCreateBillModal;

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
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white border border-slate-200 rounded-xl px-4 py-3 shadow-xs">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600">
            <Layers className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-[#0F172C]">Vendor Bills &amp; Invoices</h3>
            <p className="text-xs text-slate-500 font-medium">Inward invoices, 3-way matching &amp; payment schedules</p>
          </div>
        </div>
        {canRegisterBill && (
          <Button variant="primary" icon={<Plus className="h-4 w-4" />} onClick={onOpenRegisterBillModal}>
            Register Bill
          </Button>
        )}
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Bills', value: bills.length, color: 'blue' },
          { label: 'Total Billed', value: formatCurrency(bills.reduce((s, b) => s + (b.billAmount || 0), 0)), color: 'slate' },
          { label: 'Total Paid', value: formatCurrency(bills.reduce((s, b) => s + (b.paidAmount || 0), 0)), color: 'emerald' },
          { label: 'Outstanding', value: formatCurrency(bills.reduce((s, b) => s + (b.outstandingAmount || 0), 0)), color: 'rose' },
        ].map((stat, i) => (
          <div key={i} className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
            <p className="text-xs text-slate-500 font-semibold">{stat.label}</p>
            <p className={`text-lg font-black mt-1 ${stat.color === 'emerald' ? 'text-emerald-600' : stat.color === 'rose' ? 'text-rose-600' : 'text-[#0F172C]'}`}>
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      {/* Bills Table */}
      <Table
        headers={['Bill Number', 'Bill Date', 'Vendor', 'PO Number', 'Bill Amount', 'Paid', 'Outstanding', 'Due Date', 'Status', 'Actions']}
        data={bills}
        itemsPerPage={10}
        emptyMessage="No vendor bills registered yet. Click 'Register Bill' to add one."
        renderRow={(bill) => (
          <tr key={bill.id} className="hover:bg-slate-50 transition-colors">
            <td className="px-4 py-3 font-semibold text-slate-900 text-xs">{bill.billNumber}</td>
            <td className="px-4 py-3 text-slate-800 text-xs font-medium whitespace-nowrap">{formatDate(bill.billDate)}</td>
            <td className="px-4 py-3 text-slate-900 font-medium text-xs">{bill.vendorName}</td>
            <td className="px-4 py-3 text-slate-800 text-xs font-semibold">{bill.poNumber}</td>
            <td className="px-4 py-3 font-semibold text-slate-900 text-xs">{formatCurrency(bill.billAmount)}</td>
            <td className="px-4 py-3 font-semibold text-emerald-600 text-xs">{formatCurrency(bill.paidAmount || 0)}</td>
            <td className="px-4 py-3 font-semibold text-rose-600 text-xs">{formatCurrency(bill.outstandingAmount || 0)}</td>
            <td className="px-4 py-3 text-slate-800 text-xs font-medium whitespace-nowrap">{formatDate(bill.dueDate)}</td>
            <td className="px-4 py-3">
              <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold border ${statusBadge(bill.status)}`}>
                {bill.status}
              </span>
            </td>
            <td className="px-4 py-3">
              <div className="flex items-center space-x-1.5">
                <button
                  type="button"
                  onClick={() => setSelectedBill(bill)}
                  className="p-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white border border-blue-200/80 transition-all cursor-pointer shadow-2xs"
                  title="View Bill"
                >
                  <Eye className="h-4 w-4" />
                </button>
                {isAccountsOrAdmin && bill.status === 'Submitted' && (
                  <button
                    type="button"
                    onClick={() => onUpdateBillStatus(bill.id, 'Verified')}
                    className="p-2 rounded-xl bg-teal-50 text-teal-600 hover:bg-teal-600 hover:text-white border border-teal-200/80 transition-all cursor-pointer shadow-2xs"
                    title="Verify Bill"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                  </button>
                )}
                {isAccountsOrAdmin && bill.status === 'Verified' && (
                  <button
                    type="button"
                    onClick={() => onUpdateBillStatus(bill.id, 'Approved for Payment')}
                    className="p-2 rounded-xl bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white border border-indigo-200/80 transition-all cursor-pointer shadow-2xs"
                    title="Approve for Payment"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            </td>
          </tr>
        )}
      />

      {/* Bill Detail Modal */}
      {selectedBill && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0F172C]/70 backdrop-blur-xs animate-backdrop-fade">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 animate-modal-zoom space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-lg font-bold text-[#0F172C]">{selectedBill.billNumber}</h3>
                <p className="text-xs text-slate-500">Vendor Invoice Detail</p>
              </div>
              <button onClick={() => setSelectedBill(null)} className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all cursor-pointer">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1.5 text-sm">
                <p className="text-xs font-bold text-slate-700">Bill Info</p>
                <p><span className="text-slate-500 text-xs">Vendor:</span> <span className="font-bold">{selectedBill.vendorName}</span></p>
                <p><span className="text-slate-500 text-xs">Invoice No:</span> <span className="font-semibold">{selectedBill.vendorInvoiceNumber || '-'}</span></p>
                <p><span className="text-slate-500 text-xs">PO Ref:</span> <span className="font-semibold">{selectedBill.poNumber}</span></p>
                <p><span className="text-slate-500 text-xs">GRN Ref:</span> <span className="font-semibold">{selectedBill.grnNumber || '-'}</span></p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1.5 text-sm">
                <p className="text-xs font-bold text-slate-700">Payment Info</p>
                <p><span className="text-slate-500 text-xs">Bill Amount:</span> <span className="font-black text-slate-800">{formatCurrency(selectedBill.billAmount)}</span></p>
                <p><span className="text-slate-500 text-xs">Paid:</span> <span className="font-bold text-emerald-600">{formatCurrency(selectedBill.paidAmount || 0)}</span></p>
                <p><span className="text-slate-500 text-xs">Outstanding:</span> <span className="font-bold text-rose-600">{formatCurrency(selectedBill.outstandingAmount || 0)}</span></p>
                <p><span className="text-slate-500 text-xs">Due Date:</span> <span className="font-semibold">{selectedBill.dueDate || '-'}</span></p>
              </div>
            </div>

            <div className="flex justify-between items-center pt-2">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${statusBadge(selectedBill.status)}`}>
                {selectedBill.status}
              </span>
              <div className="flex space-x-2">
                {isAccountsOrAdmin && selectedBill.status === 'Submitted' && (
                  <Button variant="success" size="sm" onClick={() => { onUpdateBillStatus(selectedBill.id, 'Verified'); setSelectedBill(null); }}>
                    Verify Bill
                  </Button>
                )}
                <Button variant="secondary" onClick={() => setSelectedBill(null)}>Close</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
