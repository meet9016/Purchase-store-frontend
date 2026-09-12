"use client";

import React, { useState } from 'react';
import { GRN } from '@/lib/storeData';
import { Table } from '@/components/ui/Table';
import { Button } from '@/components/ui/Button';
import { Plus, ArrowDownLeft, Eye, X } from 'lucide-react';

interface GrnTabProps {
  grns: GRN[];
  currentUser?: any;
  rolePermissions?: any[];
  onOpenCreateGRNModal: () => void;
}

export function GrnTab({ grns, currentUser, rolePermissions = [], onOpenCreateGRNModal }: GrnTabProps) {
  const [selectedGrn, setSelectedGrn] = useState<GRN | null>(null);

  const canCreateGRN = currentUser?.role === 'Admin' || (() => {
    const rp = rolePermissions.find(r => r.role?.toLowerCase() === currentUser?.role?.toLowerCase());
    if (!rp || !rp.permissions || !rp.permissions['Goods Receipt (GRN)']) return true;
    return !!rp.permissions['Goods Receipt (GRN)'].create;
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
          <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600">
            <ArrowDownLeft className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-[#0F172C]">Goods Receipt Notes (GRN)</h3>
            <p className="text-xs text-slate-500 font-medium">Material inward records & stock updates</p>
          </div>
        </div>
        {canCreateGRN && (
          <Button variant="primary" icon={<Plus className="h-4 w-4" />} onClick={onOpenCreateGRNModal}>
            Create GRN
          </Button>
        )}
      </div>

      {/* GRN Table */}
      <Table
        headers={['GRN Number', 'GRN Date', 'PO Number', 'Vendor', 'Project', 'Items', 'Received By', 'Actions']}
        data={grns}
        itemsPerPage={10}
        emptyMessage="No GRNs created yet. Click 'Create GRN' to record material inward."
        renderRow={(grn) => (
          <tr key={grn.id} className="hover:bg-slate-50 transition-colors">
            <td className="px-4 py-3 font-semibold text-slate-900 text-xs">{grn.grnNumber}</td>
            <td className="px-4 py-3 text-slate-800 text-xs font-medium whitespace-nowrap">{formatDate(grn.grnDate || grn.receivedDate)}</td>
            <td className="px-4 py-3 text-slate-900 text-xs font-semibold">{grn.poNumber}</td>
            <td className="px-4 py-3 text-slate-800 text-xs font-medium">{grn.vendorName}</td>
            <td className="px-4 py-3 text-slate-800 text-xs font-medium">{grn.projectName || '-'}</td>
            <td className="px-4 py-3">
              <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200 text-slate-800 text-[11px] font-semibold">
                {grn.items?.length || 0} Items
              </span>
            </td>
            <td className="px-4 py-3 text-slate-800 text-xs font-medium">{grn.receiverName}</td>
            <td className="px-5 py-3 text-right">
              <button
                type="button"
                onClick={() => setSelectedGrn(grn)}
                className="p-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white border border-blue-200/80 transition-all cursor-pointer shadow-2xs"
                title="View GRN Detail"
              >
                <Eye className="h-4 w-4" />
              </button>
            </td>
          </tr>
        )}
      />

      {/* GRN Detail Modal */}
      {selectedGrn && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0F172C]/70 backdrop-blur-xs animate-backdrop-fade">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-2xl w-full p-6 animate-modal-zoom space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-lg font-bold text-[#0F172C]">{selectedGrn.grnNumber}</h3>
                <p className="text-xs text-slate-500">GRN Detail & Item Receipt Records</p>
              </div>
              <button onClick={() => setSelectedGrn(null)} className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all cursor-pointer">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="space-y-2 p-3 bg-slate-50 rounded-xl border border-slate-100">
                <p className="text-xs font-bold text-slate-700">Reference Info</p>
                <p><span className="text-slate-500">PO Number:</span> <span className="font-bold text-slate-800">{selectedGrn.poNumber}</span></p>
                <p><span className="text-slate-500">Vendor Invoice:</span> <span className="font-semibold text-slate-700">{selectedGrn.vendorInvoiceNumber || '-'}</span></p>
                <p><span className="text-slate-500">Challan No:</span> <span className="font-semibold text-slate-700">{selectedGrn.challanNumber || '-'}</span></p>
                <p><span className="text-slate-500">Vehicle No:</span> <span className="font-semibold text-slate-700">{selectedGrn.vehicleNumber || '-'}</span></p>
              </div>
              <div className="space-y-2 p-3 bg-slate-50 rounded-xl border border-slate-100">
                <p className="text-xs font-bold text-slate-700">Receipt Info</p>
                <p><span className="text-slate-500">Vendor:</span> <span className="font-bold text-slate-800">{selectedGrn.vendorName}</span></p>
                <p><span className="text-slate-500">Project:</span> <span className="font-semibold text-slate-700">{selectedGrn.projectName || '-'}</span></p>
                <p><span className="text-slate-500">Received By:</span> <span className="font-semibold text-slate-700">{selectedGrn.receiverName}</span></p>
                <p><span className="text-slate-500">Remarks:</span> <span className="font-semibold text-slate-700">{selectedGrn.remarks || '-'}</span></p>
              </div>
            </div>

            {/* Items Table */}
            <div>
              <h4 className="text-sm font-bold text-[#0F172C] mb-2">Received Items</h4>
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-xs">
                  <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-2 text-left">Item</th>
                      <th className="px-4 py-2 text-center">Ordered</th>
                      <th className="px-4 py-2 text-center">Received</th>
                      <th className="px-4 py-2 text-center">Short</th>
                      <th className="px-4 py-2 text-center">Damaged</th>
                      <th className="px-4 py-2 text-left">Batch</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedGrn.items?.map((it, idx) => (
                      <tr key={idx} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                        <td className="px-4 py-2.5 font-semibold text-slate-800">{it.itemName}</td>
                        <td className="px-4 py-2.5 text-center text-slate-700">{it.orderedQty} {it.unit}</td>
                        <td className="px-4 py-2.5 text-center font-bold text-emerald-700">{it.receivedQty} {it.unit}</td>
                        <td className="px-4 py-2.5 text-center text-rose-600 font-medium">{it.shortQty || 0}</td>
                        <td className="px-4 py-2.5 text-center text-amber-600 font-medium">{it.damagedQty || 0}</td>
                        <td className="px-4 py-2.5 text-slate-500 font-mono text-[10px]">{it.batchNumber || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button variant="secondary" onClick={() => setSelectedGrn(null)}>Close</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
