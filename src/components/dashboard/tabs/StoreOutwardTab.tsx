"use client";

import React, { useState } from 'react';
import { StoreOutward } from '@/lib/storeData';
import { Table } from '@/components/ui/Table';
import { Button } from '@/components/ui/Button';
import { Plus, ArrowUpRight, Eye, X } from 'lucide-react';

interface StoreOutwardTabProps {
  outwards: StoreOutward[];
  currentUser?: any;
  rolePermissions?: any[];
  onOpenCreateOutwardModal: () => void;
}

export function StoreOutwardTab({ outwards, currentUser, rolePermissions = [], onOpenCreateOutwardModal }: StoreOutwardTabProps) {
  const [selectedOutward, setSelectedOutward] = useState<StoreOutward | null>(null);

  const canCreateOutward = currentUser?.role === 'Admin' || (() => {
    const rp = rolePermissions.find(r => r.role?.toLowerCase() === currentUser?.role?.toLowerCase());
    if (!rp || !rp.permissions || !rp.permissions['Store Outward']) return true;
    return !!rp.permissions['Store Outward'].create;
  })();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white border border-slate-200 rounded-xl px-4 py-3 shadow-xs">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600">
            <ArrowUpRight className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-[#0F172C]">Store Outward Issues</h3>
            <p className="text-xs text-slate-500 font-medium">Material issued from store to site/department</p>
          </div>
        </div>
        {canCreateOutward && (
          <Button variant="primary" icon={<Plus className="h-4 w-4" />} onClick={onOpenCreateOutwardModal}>
            Issue Material
          </Button>
        )}
      </div>

      {/* Outward Table */}
      <Table
        headers={['Issue Number', 'Issue Date', 'Project', 'Issued To', 'Department', 'Purpose', 'Items', 'Issued By', 'Status', 'Actions']}
        data={outwards}
        itemsPerPage={10}
        emptyMessage="No store outward issued yet. Click 'Issue Material' to create one."
        renderRow={(out) => (
          <tr key={out.id} className="hover:bg-slate-50/80 transition-colors">
            <td className="px-4 py-2.5 font-medium text-slate-900 text-xs">{out.outwardNumber || out.issueNumber}</td>
            <td className="px-4 py-2.5 text-slate-600 text-xs font-normal">{out.issueDate || out.date}</td>
            <td className="px-4 py-2.5 text-slate-700 text-xs font-normal">{out.projectName || '-'}</td>
            <td className="px-4 py-2.5 text-slate-800 text-xs font-medium">{out.issuedTo}</td>
            <td className="px-4 py-2.5 text-slate-600 text-xs font-normal">{out.department}</td>
            <td className="px-4 py-2.5 text-slate-500 text-xs font-normal max-w-[140px] truncate" title={out.purpose}>{out.purpose}</td>
            <td className="px-4 py-2.5">
              <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-700 text-[11px] font-normal">
                {out.items?.length || 0} Items
              </span>
            </td>
            <td className="px-4 py-2.5 text-slate-600 text-xs font-normal">{out.issuedByName || out.issuerName || '-'}</td>
            <td className="px-4 py-2.5">
              <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium ${
                out.status === 'Issued' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/70' : 'bg-slate-100 text-slate-600 border border-slate-200'
              }`}>
                {out.status || 'Issued'}
              </span>
            </td>
            <td className="px-4 py-3.5 text-right">
              <button
                type="button"
                onClick={() => setSelectedOutward(out)}
                className="p-2 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white border border-blue-200/80 transition-all cursor-pointer shadow-2xs"
                title="View Outward Detail"
              >
                <Eye className="h-4 w-4" />
              </button>
            </td>
          </tr>
        )}
      />

      {/* Detail Modal */}
      {selectedOutward && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0F172C]/70 backdrop-blur-xs animate-backdrop-fade">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-xl w-full p-6 animate-modal-zoom space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-lg font-bold text-[#0F172C]">{selectedOutward.outwardNumber || selectedOutward.issueNumber}</h3>
                <p className="text-xs text-slate-500">Store Outward Issue Voucher</p>
              </div>
              <button onClick={() => setSelectedOutward(null)} className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all cursor-pointer">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1.5">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">Issue Details</p>
                <p><span className="text-slate-500 text-xs">Date:</span> <span className="font-semibold">{selectedOutward.issueDate || selectedOutward.date}</span></p>
                <p><span className="text-slate-500 text-xs">Issued To:</span> <span className="font-bold text-slate-800">{selectedOutward.issuedTo}</span></p>
                <p><span className="text-slate-500 text-xs">Department:</span> <span className="font-semibold">{selectedOutward.department}</span></p>
                <p><span className="text-slate-500 text-xs">Purpose:</span> <span className="font-semibold">{selectedOutward.purpose}</span></p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1.5">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">Project Info</p>
                <p><span className="text-slate-500 text-xs">Project:</span> <span className="font-semibold">{selectedOutward.projectName || '-'}</span></p>
                <p><span className="text-slate-500 text-xs">Issued By:</span> <span className="font-semibold">{selectedOutward.issuedByName || selectedOutward.issuerName || '-'}</span></p>
                <p><span className="text-slate-500 text-xs">Status:</span> <span className="font-bold text-emerald-600">{selectedOutward.status || 'Issued'}</span></p>
                {selectedOutward.remarks && <p><span className="text-slate-500 text-xs">Remarks:</span> <span className="font-semibold">{selectedOutward.remarks}</span></p>}
              </div>
            </div>

            <div>
              <h4 className="text-sm font-bold text-[#0F172C] mb-2">Issued Items</h4>
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-xs">
                  <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-2 text-left">Item Name</th>
                      <th className="px-4 py-2 text-center">Quantity</th>
                      <th className="px-4 py-2 text-left">Unit</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedOutward.items?.map((it, idx) => (
                      <tr key={idx} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                        <td className="px-4 py-2.5 font-semibold text-slate-800">{it.itemName}</td>
                        <td className="px-4 py-2.5 text-center font-bold text-slate-700">{it.quantity}</td>
                        <td className="px-4 py-2.5 text-slate-500">{it.unit || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button variant="secondary" onClick={() => setSelectedOutward(null)}>Close</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
