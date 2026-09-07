"use client";

import React, { useState } from 'react';
import { PurchaseRequest, Project, Item, User } from '@/lib/storeData';
import { Table } from '@/components/ui/Table';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { Plus, Eye, CheckCircle2, XCircle, FileSpreadsheet } from 'lucide-react';

interface PurchaseRequestsTabProps {
  purchaseRequests: PurchaseRequest[];
  projects: Project[];
  items: Item[];
  currentUser: User | null;
  rolePermissions?: any[];
  onOpenCreatePRModal: () => void;
  onUpdatePRStatus: (prId: string, status: PurchaseRequest['status'], reason?: string) => void;
  onSelectPRDetail: (pr: PurchaseRequest) => void;
}

export function PurchaseRequestsTab({
  purchaseRequests,
  currentUser,
  rolePermissions = [],
  onOpenCreatePRModal,
  onUpdatePRStatus,
  onSelectPRDetail
}: PurchaseRequestsTabProps) {
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [rejectionModalPr, setRejectionModalPr] = useState<PurchaseRequest | null>(null);
  const [rejectionReason, setRejectionReason] = useState<string>('');

  const filteredPrs = purchaseRequests.filter(pr => !filterStatus || pr.status === filterStatus);
  const isApproverOrAdmin = currentUser?.role === 'Approver' || currentUser?.role === 'Admin' || currentUser?.role === 'Purchase Manager';

  // Check create permission
  const canCreatePR = currentUser?.role === 'Admin' || (() => {
    const rp = rolePermissions.find(r => r.role?.toLowerCase() === currentUser?.role?.toLowerCase());
    if (!rp || !rp.permissions || !rp.permissions['Purchase Requests']) return true;
    return !!rp.permissions['Purchase Requests'].create;
  })();

  return (
    <div className="space-y-6">
      {/* Action Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white border border-slate-200 rounded-xl px-4 py-3 shadow-xs">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600">
            <FileSpreadsheet className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-[#0F172C]">Purchase Requests (PR)</h3>
            <p className="text-xs text-slate-500 font-medium">Requisitions created across site projects</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <div className="min-w-[160px]">
            <Select
              options={[
                { value: '', label: 'All Statuses' },
                { value: 'Submitted', label: 'Submitted' },
                { value: 'Approved', label: 'Approved' },
                { value: 'Rejected', label: 'Rejected' },
                { value: 'PO Created', label: 'PO Created' }
              ]}
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
            />
          </div>

          {canCreatePR && (
            <Button
              variant="primary"
              icon={<Plus className="h-4 w-4" />}
              onClick={onOpenCreatePRModal}
            >
              Create New PR
            </Button>
          )}
        </div>
      </div>

      {/* PR Table */}
      <Table
        headers={['PR Number', 'Project', 'Requester', 'Required Date', 'Items', 'Priority', 'Status', 'Actions']}
        data={filteredPrs}
        itemsPerPage={10}
        renderRow={(pr) => (
          <tr key={pr.id} className="hover:bg-slate-50/80 transition-colors">
            <td className="px-4 py-2.5 font-medium text-slate-900 text-xs">{pr.prNumber}</td>
            <td className="px-4 py-2.5 font-normal text-slate-700 text-xs">{pr.projectName}</td>
            <td className="px-4 py-2.5 font-normal text-slate-700 text-xs">{pr.requesterName}</td>
            <td className="px-4 py-2.5 font-normal text-slate-600 text-xs">{pr.requiredDate}</td>
            <td className="px-4 py-2.5">
              <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-700 text-[11px] font-normal">
                {pr.items?.length || 0} Line Items
              </span>
            </td>
            <td className="px-4 py-2.5">
              <span className={`px-2 py-0.5 rounded text-[10px] font-medium uppercase ${
                pr.priority === 'High' || pr.priority === 'Urgent' ? 'bg-rose-50 text-rose-700 border border-rose-200/70' : 'bg-slate-100 text-slate-600'
              }`}>
                {pr.priority}
              </span>
            </td>
            <td className="px-4 py-2.5">
              <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium ${
                pr.status === 'Approved' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/70' :
                pr.status === 'Rejected' ? 'bg-rose-50 text-rose-700 border border-rose-200/70' :
                'bg-amber-50 text-amber-700 border border-amber-200/70'
              }`}>
                {pr.status}
              </span>
            </td>
            <td className="px-5 py-3.5">
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  title="View Details"
                  onClick={() => onSelectPRDetail(pr)}
                  className="p-2 rounded-lg"
                >
                  <Eye className="h-4 w-4 text-slate-600" />
                </Button>

                {isApproverOrAdmin && (pr.status === 'Submitted' || pr.status === 'Under Review') && (
                  <>
                    <Button
                      variant="success"
                      size="sm"
                      icon={<CheckCircle2 className="h-3.5 w-3.5" />}
                      onClick={() => onUpdatePRStatus(pr.id, 'Approved')}
                    >
                      Approve
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      icon={<XCircle className="h-3.5 w-3.5" />}
                      onClick={() => setRejectionModalPr(pr)}
                    >
                      Reject
                    </Button>
                  </>
                )}
              </div>
            </td>
          </tr>
        )}
      />

      {/* Rejection Modal */}
      {rejectionModalPr && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0F172C]/70 backdrop-blur-xs animate-backdrop-fade">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full p-6 animate-modal-zoom space-y-4">
            <h3 className="text-lg font-bold text-[#0F172C]">Reject Purchase Request {rejectionModalPr.prNumber}</h3>
            <p className="text-xs text-slate-500 font-medium">Please specify reason for rejection:</p>
            <textarea
              rows={3}
              value={rejectionReason}
              onChange={e => setRejectionReason(e.target.value)}
              placeholder="Enter rejection rationale..."
              className="w-full p-3 rounded-xl bg-slate-50 border border-slate-300 text-sm font-medium text-slate-900 focus:outline-none focus:border-rose-500"
            />
            <div className="flex justify-end space-x-2 pt-2">
              <Button
                variant="secondary"
                onClick={() => { setRejectionModalPr(null); setRejectionReason(''); }}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={() => {
                  onUpdatePRStatus(rejectionModalPr.id, 'Rejected', rejectionReason);
                  setRejectionModalPr(null);
                  setRejectionReason('');
                }}
              >
                Confirm Rejection
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
