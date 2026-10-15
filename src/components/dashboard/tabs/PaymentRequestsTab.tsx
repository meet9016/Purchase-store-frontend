"use client";

import React from 'react';
import { PaymentRequest, User } from '@/lib/storeData';
import { Table } from '@/components/ui/Table';
import { Button } from '@/components/ui/Button';
import {
  Plus, CreditCard, CheckCircle2, XCircle,
  Clock, TrendingUp, BadgeIndianRupee, ListChecks
} from 'lucide-react';

interface PaymentRequestsTabProps {
  paymentRequests: PaymentRequest[];
  currentUser: User | null;
  rolePermissions?: any[];
  onOpenCreatePaymentReqModal: () => void;
  onUpdatePaymentReqStatus: (id: string, status: string) => void;
}

const statusConfig: Record<string, { bg: string; text: string; border: string; dot: string }> = {
  'Approved':                { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', dot: 'bg-emerald-500' },
  'Approved by Management':  { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', dot: 'bg-emerald-500' },
  'Rejected':                { bg: 'bg-rose-50',    text: 'text-rose-700',    border: 'border-rose-200',    dot: 'bg-rose-500'    },
  'Paid':                    { bg: 'bg-teal-50',    text: 'text-teal-700',    border: 'border-teal-200',    dot: 'bg-teal-500'    },
  'Submitted':               { bg: 'bg-amber-50',   text: 'text-amber-700',   border: 'border-amber-200',   dot: 'bg-amber-500'   },
  'Pending Verification':    { bg: 'bg-orange-50',  text: 'text-orange-700',  border: 'border-orange-200',  dot: 'bg-orange-500'  },
  'Accounts Verified':       { bg: 'bg-blue-50',    text: 'text-blue-700',    border: 'border-blue-200',    dot: 'bg-blue-500'    },
  'Pending':                 { bg: 'bg-slate-100',  text: 'text-slate-600',   border: 'border-slate-200',   dot: 'bg-slate-400'   },
};

const StatusBadge = ({ status }: { status: string }) => {
  const cfg = statusConfig[status] || statusConfig['Pending'];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${cfg.bg} ${cfg.text} ${cfg.border}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {status}
    </span>
  );
};

export function PaymentRequestsTab({
  paymentRequests,
  currentUser,
  rolePermissions = [],
  onOpenCreatePaymentReqModal,
  onUpdatePaymentReqStatus
}: PaymentRequestsTabProps) {
  const formatCurrency = (n: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n || 0);

  const isManagerOrAdmin =
    currentUser?.role === 'Admin' ||
    currentUser?.role === 'Management' ||
    currentUser?.role === 'Accounts';

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

  const totalAmount = paymentRequests.reduce((s, r) => s + (r.requestedAmount || 0), 0);
  const pendingCount = paymentRequests.filter(r =>
    ['Submitted', 'Pending Verification', 'Pending'].includes(r.status)
  ).length;
  const approvedCount = paymentRequests.filter(r => r.status.includes('Approved')).length;

  const stats = [
    {
      label: 'Total Requests',
      value: paymentRequests.length,
      icon: <ListChecks className="h-5 w-5" />,
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
      valueColor: 'text-[#0F172C]',
    },
    {
      label: 'Pending',
      value: pendingCount,
      icon: <Clock className="h-5 w-5" />,
      iconBg: 'bg-amber-100',
      iconColor: 'text-amber-600',
      valueColor: 'text-amber-600',
    },
    {
      label: 'Approved',
      value: approvedCount,
      icon: <TrendingUp className="h-5 w-5" />,
      iconBg: 'bg-emerald-100',
      iconColor: 'text-emerald-600',
      valueColor: 'text-emerald-600',
    },
    {
      label: 'Total Amount',
      value: formatCurrency(totalAmount),
      icon: <BadgeIndianRupee className="h-5 w-5" />,
      iconBg: 'bg-violet-100',
      iconColor: 'text-violet-600',
      valueColor: 'text-[#0F172C]',
    },
  ];

  return (
    <div className="space-y-5">

      {/* ── Page Header ── */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white border border-slate-200 rounded-2xl px-5 py-3.5 shadow-xs">
        <div className="flex items-center space-x-3.5">
          <div className="p-2.5 rounded-xl bg-blue-600 text-white shadow-md shadow-blue-600/25">
            <CreditCard className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-[#0F172C] leading-tight">Payment Requests</h3>
            <p className="text-xs text-slate-500 font-medium mt-0.5">Vendor payment approval workflow</p>
          </div>
        </div>
        {canCreatePayReq && (
          <Button variant="primary" icon={<Plus className="h-4 w-4" />} onClick={onOpenCreatePaymentReqModal}>
            Raise Payment Request
          </Button>
        )}
      </div>

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <div
            key={i}
            className="bg-white border border-slate-200 rounded-2xl px-4 py-4 shadow-xs flex items-center gap-3.5 hover:shadow-sm transition-shadow"
          >
            <div className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center ${stat.iconBg} ${stat.iconColor}`}>
              {stat.icon}
            </div>
            <div className="min-w-0">
              <p className="text-[11px] text-slate-500 font-semibold truncate">{stat.label}</p>
              <p className={`text-xl font-black mt-0.5 ${stat.valueColor}`}>{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Table ── */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
        <Table
          headers={['Request No.', 'Date', 'Vendor', 'Bill No.', 'Requested Amt', 'Requested By', 'Remarks', 'Status', 'Actions']}
          data={paymentRequests}
          itemsPerPage={10}
          emptyMessage="No payment requests yet. Click 'Raise Payment Request' to create one."
          renderRow={(req, idx) => (
            <tr key={`${req.id || req.requestNumber}-${idx}`} className="hover:bg-slate-50/70 transition-colors border-t border-slate-100 first:border-t-0">
              <td className="px-4 py-3">
                <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2 py-1 rounded-md border border-blue-100">
                  {req.requestNumber || req.requestId}
                </span>
              </td>
              <td className="px-4 py-3 text-slate-600 text-xs font-medium whitespace-nowrap">{formatDate(req.requestDate)}</td>
              <td className="px-4 py-3 text-slate-800 text-xs font-semibold">{req.vendorName}</td>
              <td className="px-4 py-3 text-slate-600 text-xs font-medium">{req.billNumber || '-'}</td>
              <td className="px-4 py-3">
                <span className="text-xs font-bold text-[#0F172C]">{formatCurrency(req.requestedAmount)}</span>
              </td>
              <td className="px-4 py-3 text-slate-600 text-xs font-medium">{req.requesterName || req.createdByName || '-'}</td>
              <td className="px-4 py-3 text-slate-500 text-xs font-normal max-w-[120px] truncate" title={req.remarks}>
                {req.remarks || '-'}
              </td>
              <td className="px-4 py-3">
                <StatusBadge status={req.status} />
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-1.5">
                  {isManagerOrAdmin &&
                    (req.status === 'Submitted' ||
                     req.status === 'Pending Verification' ||
                     req.status === 'Pending') && (
                    <>
                      <button
                        type="button"
                        onClick={() => onUpdatePaymentReqStatus(req.id, 'Approved by Management')}
                        className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white border border-emerald-200/80 transition-all cursor-pointer"
                        title="Approve"
                      >
                        <CheckCircle2 className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onUpdatePaymentReqStatus(req.id, 'Rejected')}
                        className="p-1.5 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white border border-rose-200/80 transition-all cursor-pointer"
                        title="Reject"
                      >
                        <XCircle className="h-4 w-4" />
                      </button>
                    </>
                  )}
                  {req.status === 'Submitted' && currentUser?.role === 'Accounts' && (
                    <button
                      type="button"
                      onClick={() => onUpdatePaymentReqStatus(req.id, 'Accounts Verified')}
                      className="px-2.5 py-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white border border-blue-200/80 transition-all cursor-pointer text-[11px] font-bold"
                      title="Verify"
                    >
                      Verify
                    </button>
                  )}
                </div>
              </td>
            </tr>
          )}
        />
      </div>
    </div>
  );
}