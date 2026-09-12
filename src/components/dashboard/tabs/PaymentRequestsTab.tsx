"use client";

import React from 'react';
import { PaymentRequest, User } from '@/lib/storeData';
import { Table } from '@/components/ui/Table';
import { Button } from '@/components/ui/Button';
import { Plus, CreditCard, CheckCircle2, XCircle } from 'lucide-react';

interface PaymentRequestsTabProps {
  paymentRequests: PaymentRequest[];
  currentUser: User | null;
  rolePermissions?: any[];
  onOpenCreatePaymentReqModal: () => void;
  onUpdatePaymentReqStatus: (id: string, status: string) => void;
}

const statusBadge = (status: string) => {
  const map: Record<string, string> = {
    'Approved': 'bg-emerald-50 text-emerald-700 border-emerald-200',
    'Approved by Management': 'bg-emerald-50 text-emerald-700 border-emerald-200',
    'Rejected': 'bg-rose-50 text-rose-700 border-rose-200',
    'Paid': 'bg-teal-50 text-teal-700 border-teal-200',
    'Submitted': 'bg-amber-50 text-amber-700 border-amber-200',
    'Pending Verification': 'bg-orange-50 text-orange-700 border-orange-200',
    'Accounts Verified': 'bg-blue-50 text-blue-700 border-blue-200',
    'Pending': 'bg-slate-100 text-slate-600 border-slate-200',
  };
  return map[status] || 'bg-slate-100 text-slate-600 border-slate-200';
};

export function PaymentRequestsTab({
  paymentRequests,
  currentUser,
  rolePermissions = [],
  onOpenCreatePaymentReqModal,
  onUpdatePaymentReqStatus
}: PaymentRequestsTabProps) {
  const formatCurrency = (n: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n || 0);
  const isManagerOrAdmin = currentUser?.role === 'Admin' || currentUser?.role === 'Management' || currentUser?.role === 'Accounts';

  const canCreatePayReq = currentUser?.role === 'Admin' || (() => {
    const rp = rolePermissions.find(r => r.role?.toLowerCase() === currentUser?.role?.toLowerCase());
    if (!rp || !rp.permissions || !rp.permissions['Payment Requests']) return true;
    return !!rp.permissions['Payment Requests'].create;
  })();

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
            <CreditCard className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-[#0F172C]">Payment Requests</h3>
            <p className="text-xs text-slate-500 font-medium">Vendor payment approval workflow</p>
          </div>
        </div>
        {canCreatePayReq && (
          <Button variant="primary" icon={<Plus className="h-4 w-4" />} onClick={onOpenCreatePaymentReqModal}>
            Raise Payment Request
          </Button>
        )}
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Requests', value: paymentRequests.length },
          { label: 'Pending', value: paymentRequests.filter(r => ['Submitted', 'Pending Verification', 'Pending'].includes(r.status)).length },
          { label: 'Approved', value: paymentRequests.filter(r => r.status.includes('Approved')).length },
          { label: 'Total Amount', value: formatCurrency(paymentRequests.reduce((s, r) => s + (r.requestedAmount || 0), 0)) },
        ].map((stat, i) => (
          <div key={i} className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
            <p className="text-xs text-slate-500 font-semibold">{stat.label}</p>
            <p className="text-xl font-black text-[#0F172C] mt-1">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <Table
        headers={['Request No.', 'Date', 'Vendor', 'Bill No.', 'Requested Amt', 'Requested By', 'Remarks', 'Status', 'Actions']}
        data={paymentRequests}
        itemsPerPage={10}
        emptyMessage="No payment requests yet. Click 'Raise Payment Request' to create one."
        renderRow={(req) => (
          <tr key={req.id} className="hover:bg-slate-50 transition-colors">
            <td className="px-4 py-3 font-semibold text-slate-900 text-xs">{req.requestNumber || req.requestId}</td>
            <td className="px-4 py-3 text-slate-800 text-xs font-medium whitespace-nowrap">{formatDate(req.requestDate)}</td>
            <td className="px-4 py-3 text-slate-900 text-xs font-semibold">{req.vendorName}</td>
            <td className="px-4 py-3 text-slate-800 text-xs font-medium">{req.billNumber}</td>
            <td className="px-4 py-3 font-semibold text-slate-900 text-xs">{formatCurrency(req.requestedAmount)}</td>
            <td className="px-4 py-3 text-slate-800 text-xs font-medium">{req.requesterName || req.createdByName || '-'}</td>
            <td className="px-4 py-3 text-slate-700 text-xs font-normal max-w-[120px] truncate" title={req.remarks}>{req.remarks || '-'}</td>
            <td className="px-4 py-3">
              <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold border ${statusBadge(req.status)}`}>
                {req.status}
              </span>
            </td>
            <td className="px-4 py-3.5">
              {isManagerOrAdmin && (req.status === 'Submitted' || req.status === 'Pending Verification' || req.status === 'Pending') && (
                <div className="flex items-center space-x-1.5">
                  <button
                    type="button"
                    onClick={() => onUpdatePaymentReqStatus(req.id, 'Approved by Management')}
                    className="p-2 rounded-xl bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white border border-emerald-200/80 transition-all cursor-pointer shadow-2xs"
                    title="Approve"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onUpdatePaymentReqStatus(req.id, 'Rejected')}
                    className="p-2 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white border border-rose-200/80 transition-all cursor-pointer shadow-2xs"
                    title="Reject"
                  >
                    <XCircle className="h-4 w-4" />
                  </button>
                </div>
              )}
              {req.status === 'Submitted' && currentUser?.role === 'Accounts' && (
                <button
                  type="button"
                  onClick={() => onUpdatePaymentReqStatus(req.id, 'Accounts Verified')}
                  className="p-2 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white border border-blue-200/80 transition-all cursor-pointer shadow-2xs text-xs font-semibold px-3"
                  title="Verify"
                >
                  Verify
                </button>
              )}
            </td>
          </tr>
        )}
      />
    </div>
  );
}
