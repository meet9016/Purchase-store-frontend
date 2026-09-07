"use client";

import React, { useState } from 'react';
import { Stock, Item, Category } from '@/lib/storeData';
import { Table } from '@/components/ui/Table';
import { Package, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Select } from '@/components/ui/Select';

interface StockManagementTabProps {
  stocks: Stock[];
  items: Item[];
  categories: Category[];
}

export function StockManagementTab({ stocks, items, categories }: StockManagementTabProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [onlyLowStock, setOnlyLowStock] = useState<boolean>(false);

  const filteredStocks = stocks.filter(s => {
    if (onlyLowStock && s.quantity > (s.reorderLevel || 10)) return false;
    if (selectedCategory) {
      const item = items.find(i => i.id === s.itemId);
      if (item?.categoryId !== selectedCategory) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200/90 shadow-xs">
        <div className="flex items-center space-x-3">
          <Package className="h-6 w-6 text-[#0F172C]" />
          <div>
            <h3 className="text-lg font-black text-[#0F172C]">Inventory Stock Balances</h3>
            <p className="text-xs text-slate-500 font-bold">Real-time stock balance & min-stock alerts</p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <label className="flex items-center space-x-2 text-sm font-extrabold text-[#0F172C] cursor-pointer">
            <input
              type="checkbox"
              checked={onlyLowStock}
              onChange={e => setOnlyLowStock(e.target.checked)}
              className="h-4.5 w-4.5 rounded accent-rose-600 cursor-pointer"
            />
            <span>Low Stock Alerts Only</span>
          </label>

          <div className="min-w-[170px]">
            <Select
              options={[
                { value: '', label: 'All Categories' },
                ...categories.map(c => ({ value: c.id, label: c.name }))
              ]}
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
            />
          </div>
        </div>
      </div>

      <Table
        headers={['Item Name', 'Item Code', 'Project', 'Available Stock', 'Unit', 'Reorder Level', 'Stock Health']}
        data={filteredStocks}
        itemsPerPage={10}
        renderRow={(s, idx) => {
          const isLow = s.quantity <= (s.reorderLevel || 10);
          return (
            <tr key={s.id || `${s.projectId}-${s.itemId}-${idx}`} className="hover:bg-slate-50/80 transition-colors">
              <td className="px-4 py-2.5 font-medium text-slate-900 text-xs">{s.itemName}</td>
              <td className="px-4 py-2.5 font-mono text-slate-600 font-normal text-xs">{s.itemCode || '-'}</td>
              <td className="px-4 py-2.5 font-normal text-slate-700 text-xs">{s.projectName}</td>
              <td className="px-4 py-2.5 font-medium text-slate-900 text-xs">{s.quantity}</td>
              <td className="px-4 py-2.5 font-normal text-slate-600 text-xs">{s.unit}</td>
              <td className="px-4 py-2.5 font-normal text-slate-500 text-xs">{s.reorderLevel || 10}</td>
              <td className="px-4 py-2.5">
                {isLow ? (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-rose-50 text-rose-700 border border-rose-200/70">
                    <AlertTriangle className="w-3 h-3 mr-1" /> Low Stock
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200/70">
                    <CheckCircle2 className="w-3 h-3 mr-1" /> Optimal
                  </span>
                )}
              </td>
            </tr>
          );
        }}
      />
    </div>
  );
}
