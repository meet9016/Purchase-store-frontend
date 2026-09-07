"use client";

import React from 'react';
import { PaymentEntry } from '@/lib/storeData';
import { Table } from '@/components/ui/Table';
import { Button } from '@/components/ui/Button';
import { Plus, CreditCard, Banknote } from 'lucide-react';

interface PaymentEntriesTabProps {
  payments: PaymentEntry[];
  currentUser?: any;
  rolePermissions?: any[];
  onOpenCreatePaymentModal: () => void;
}

const modeIcon = (mode: string) => {
  if (mode?.includes('NEFT') || mode?.includes('Transfer') || mode?.includes('RTGS')) return '🏦';
  if (mode?.includes('Cheque')) return '📋';
  if (mode?.includes('UPI')) return '📱';
  if (mode?.includes('Cash')) return '💵';
  return '💳';
};

const modeBadge = (mode: string) => {
  if (mode?.includes('NEFT') || mode?.includes('Transfer') || mode?.includes('RTGS'))
    return 'bg-blue-50 text-blue-700 border-blue-200';
  if (mode?.includes('Cheque')) return 'bg-purple-50 text-purple-700 border-purple-200';
  if (mode?.includes('UPI')) return 'bg-indigo-50 text-indigo-700 border-indigo-200';
  if (mode?.includes('Cash')) return 'bg-emerald-50 text-emerald-700 border-emerald-200';
  return 'bg-slate-100 text-slate-600 border-slate-200';
};

export function PaymentEntriesTab({
  payments,
  currentUser,
  rolePermissions = [],
  onOpenCreatePaymentModal
}: PaymentEntriesTabProps) {
  const formatCurrency = (n: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n || 0);

  const totalPaid = payments.reduce((s, p) => s + (p.paymentAmount || 0), 0);

  const canCreatePayment = currentUser?.role === 'Admin' || (() => {
    const rp = rolePermissions.find(r => r.role?.toLowerCase() === currentUser?.role?.toLowerCase());
    if (!rp || !rp.permissions || !rp.permissions['Payment Entries']) return true;
    return !!rp.permissions['Payment Entries'].create;
  })();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white border border-slate-200 rounded-xl px-4 py-3 shadow-xs">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-teal-50 text-teal-600">
            <Banknote className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-[#0F172C]">Payment Entries</h3>
            <p className="text-xs text-slate-500 font-medium">Disbursement vouchers and payment receipts</p>
          </div>
        </div>
        {canCreatePayment && (
          <Button variant="primary" icon={<Plus className="h-4 w-4" />} onClick={onOpenCreatePaymentModal}>
            Add Payment Entry
          </Button>
        )}
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Payments', value: payments.length },
          { label: 'Total Disbursed', value: formatCurrency(totalPaid), highlight: true },
          { label: 'Bank Transfer / NEFT', value: payments.filter(p => p.paymentMode?.includes('NEFT') || p.paymentMode?.includes('Transfer')).length },
          { label: 'UPI / Cheque / Cash', value: payments.filter(p => !p.paymentMode?.includes('NEFT') && !p.paymentMode?.includes('Transfer')).length },
        ].map((stat, i) => (
          <div key={i} className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
            <p className="text-xs text-slate-500 font-semibold">{stat.label}</p>
            <p className={`text-xl font-black mt-1 ${stat.highlight ? 'text-teal-600' : 'text-[#0F172C]'}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <Table
        headers={['Payment No.', 'Date', 'Vendor', 'Bill No.', 'PO No.', 'Amount', 'Mode', 'UTR / Ref No.', 'Entered By', 'Remarks']}
        data={payments}
        itemsPerPage={10}
        emptyMessage="No payment entries recorded yet. Click 'Add Payment Entry' to log a disbursement."
        renderRow={(pay) => (
          <tr key={pay.id} className="hover:bg-slate-50/80 transition-colors">
            <td className="px-4 py-2.5 font-medium text-slate-900 text-xs">{pay.paymentId || pay.paymentNumber}</td>
            <td className="px-4 py-2.5 text-slate-600 text-xs font-normal">{pay.paymentDate}</td>
            <td className="px-4 py-2.5 text-slate-800 text-xs font-medium">{pay.vendorName}</td>
            <td className="px-4 py-2.5 text-slate-600 text-xs font-mono font-normal">{pay.billNumber}</td>
            <td className="px-4 py-2.5 text-slate-600 text-xs font-mono font-normal">{pay.poNumber}</td>
            <td className="px-4 py-2.5 font-medium text-teal-700 text-xs">{formatCurrency(pay.paymentAmount)}</td>
            <td className="px-4 py-2.5">
              <span className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded-md text-[11px] font-medium border ${modeBadge(pay.paymentMode)}`}>
                <span>{modeIcon(pay.paymentMode)}</span>
                <span>{pay.paymentMode?.split('/')[0] || pay.paymentMode}</span>
              </span>
            </td>
            <td className="px-4 py-2.5 text-slate-500 text-xs font-mono font-normal">{pay.transactionNumber || '-'}</td>
            <td className="px-4 py-2.5 text-slate-600 text-xs font-normal">{pay.enteredByName}</td>
            <td className="px-4 py-2.5 text-slate-500 text-xs font-normal max-w-[120px] truncate" title={pay.remarks}>{pay.remarks || '-'}</td>
          </tr>
        )}
      />
    </div>
  );
}
