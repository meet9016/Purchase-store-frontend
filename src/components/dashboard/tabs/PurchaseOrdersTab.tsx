"use client";

import React, { useState } from 'react';
import { PurchaseOrder, Vendor, Project, User } from '@/lib/storeData';
import { Table } from '@/components/ui/Table';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { Plus, Eye, FileCheck, CheckCircle2 } from 'lucide-react';

interface PurchaseOrdersTabProps {
  purchaseOrders: PurchaseOrder[];
  vendors: Vendor[];
  projects: Project[];
  currentUser: User | null;
  rolePermissions?: any[];
  onOpenCreatePOModal: () => void;
  onSelectPoDetail: (po: PurchaseOrder) => void;
  onUpdatePOStatus: (poId: string, status: PurchaseOrder['status']) => void;
}

export function PurchaseOrdersTab({
  purchaseOrders,
  currentUser,
  rolePermissions = [],
  onOpenCreatePOModal,
  onSelectPoDetail,
  onUpdatePOStatus
}: PurchaseOrdersTabProps) {
  const [filterStatus, setFilterStatus] = useState<string>('');
  const filteredPos = purchaseOrders.filter(po => !filterStatus || po.status === filterStatus);

  const formatCurrency = (num: number) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(num);
  };

  const canCreatePO = currentUser?.role === 'Admin' || (() => {
    const rp = rolePermissions.find(r => r.role?.toLowerCase() === currentUser?.role?.toLowerCase());
    if (!rp || !rp.permissions || !rp.permissions['Purchase Orders']) return true;
    return !!rp.permissions['Purchase Orders'].create;
  })();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600">
            <FileCheck className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-[#0F172C]">Purchase Orders (PO)</h3>
            <p className="text-xs text-slate-500 font-medium">Vendor purchase orders & fulfillment tracking</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <div className="min-w-[160px]">
            <Select
              options={[
                { value: '', label: 'All Statuses' },
                { value: 'Draft', label: 'Draft' },
                { value: 'Approved', label: 'Approved' },
                { value: 'Partially Received', label: 'Partially Received' },
                { value: 'Completed', label: 'Completed' },
                { value: 'Cancelled', label: 'Cancelled' }
              ]}
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
            />
          </div>

          {canCreatePO && (
            <Button
              variant="primary"
              icon={<Plus className="h-4 w-4" />}
              onClick={onOpenCreatePOModal}
            >
              Create New PO
            </Button>
          )}
        </div>
      </div>

      {/* PO Table */}
      <Table
        headers={['PO Number', 'Vendor Name', 'Project', 'PO Date', 'Total Amount', 'Status', 'Actions']}
        data={filteredPos}
        itemsPerPage={10}
        renderRow={(po) => (
          <tr key={po.id} className="hover:bg-slate-50/80 transition-colors">
            <td className="px-4 py-2.5 font-medium text-slate-900 text-xs">{po.poNumber}</td>
            <td className="px-4 py-2.5 font-medium text-slate-800 text-xs">{po.vendorName}</td>
            <td className="px-4 py-2.5 font-normal text-slate-700 text-xs">{po.projectName}</td>
            <td className="px-4 py-2.5 font-normal text-slate-600 text-xs">{po.poDate}</td>
            <td className="px-4 py-2.5 font-medium text-slate-900 text-xs">{formatCurrency(po.totalPOAmount || po.totalAmount || 0)}</td>
            <td className="px-4 py-2.5">
              <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium ${
                po.status === 'Approved' || po.status === 'Completed' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/70' :
                po.status === 'Partially Received' ? 'bg-blue-50 text-blue-700 border border-blue-200/70' :
                'bg-amber-50 text-amber-700 border border-amber-200/70'
              }`}>
                {po.status}
              </span>
            </td>
            <td className="px-5 py-4">
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  title="View / Print PO"
                  onClick={() => onSelectPoDetail(po)}
                  className="p-2 rounded-lg"
                >
                  <Eye className="h-4 w-4 text-slate-600" />
                </Button>

                {currentUser?.role === 'Admin' && po.status === 'Draft' && (
                  <Button
                    variant="success"
                    size="sm"
                    icon={<CheckCircle2 className="h-3.5 w-3.5" />}
                    onClick={() => onUpdatePOStatus(po.id, 'Approved')}
                  >
                    Approve
                  </Button>
                )}
              </div>
            </td>
          </tr>
        )}
      />
    </div>
  );
}
