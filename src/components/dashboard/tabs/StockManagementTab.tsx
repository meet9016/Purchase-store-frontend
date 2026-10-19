"use client";

import React, { useState, useMemo } from 'react';
import { Stock, Item, Category } from '@/lib/storeData';
import { Table } from '@/components/ui/Table';
import { Package, AlertTriangle, CheckCircle2, TrendingDown, Layers } from 'lucide-react';
import { Select } from '@/components/ui/Select';

interface StockManagementTabProps {
  stocks: Stock[];
  items: Item[];
  categories: Category[];
}

export function StockManagementTab({ stocks, items = [], categories = [] }: StockManagementTabProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [onlyLowStock, setOnlyLowStock] = useState<boolean>(false);

  // Helper map for fast Item Master lookup
  const itemsMap = useMemo(() => {
    const map = new Map<string, Item>();
    (items || []).forEach(i => {
      if (i.id) map.set(i.id, i);
      if ((i as any)._id) map.set(String((i as any)._id), i);
      if (i.name) map.set(i.name.trim().toLowerCase(), i);
    });
    return map;
  }, [items]);

  // Enrich stock rows with Item Master data (itemCode, reorderLevel, minStock, unit)
  const enrichedStocks = useMemo(() => {
    return (stocks || []).map(s => {
      const matched =
        itemsMap.get(s.itemId) ||
        (s.itemName ? itemsMap.get(s.itemName.trim().toLowerCase()) : undefined);

      const itemCode = s.itemCode || matched?.itemCode || '-';
      const reorderLevel = s.reorderLevel !== undefined && s.reorderLevel > 0
        ? s.reorderLevel
        : (matched?.reorderLevel || 10);
      const minStock = s.minStock !== undefined && s.minStock > 0
        ? s.minStock
        : (matched?.minStock || 0);
      const unit = s.unit && s.unit !== 'Pcs' ? s.unit : (matched?.unit || s.unit || 'Pcs');
      const categoryId = (s as any).categoryId || matched?.categoryId || '';

      return {
        ...s,
        itemCode,
        reorderLevel,
        minStock,
        unit,
        categoryId,
      };
    });
  }, [stocks, itemsMap]);

  // Filtering
  const filteredStocks = useMemo(() => {
    return enrichedStocks.filter(s => {
      if (onlyLowStock && s.quantity > s.reorderLevel) return false;
      if (selectedCategory && s.categoryId !== selectedCategory) return false;
      return true;
    });
  }, [enrichedStocks, onlyLowStock, selectedCategory]);

  // Summary KPI Stats
  const totalStockItems = enrichedStocks.length;
  const totalUnits = enrichedStocks.reduce((sum, s) => sum + (Number(s.quantity) || 0), 0);
  const lowStockCount = enrichedStocks.filter(s => s.quantity <= s.reorderLevel).length;
  const optimalCount = totalStockItems - lowStockCount;

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200 rounded-xl p-3.5 sm:px-4 sm:py-3 shadow-xs">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600 shrink-0">
            <Package className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-[#0F172C]">Inventory Stock Balances</h3>
            <p className="text-xs text-slate-500 font-medium">Real-time stock balance, item codes &amp; min-stock alerts</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center gap-3 w-full sm:w-auto">
          <label className="flex items-center space-x-2 text-xs font-semibold text-[#0F172C] cursor-pointer shrink-0">
            <input
              type="checkbox"
              checked={onlyLowStock}
              onChange={e => setOnlyLowStock(e.target.checked)}
              className="h-4 w-4 rounded accent-rose-600 cursor-pointer"
            />
            <span>Low Stock Alerts Only ({lowStockCount})</span>
          </label>

          <div className="w-full sm:w-auto sm:min-w-[170px]">
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

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white border border-slate-200/90 rounded-xl p-3.5 sm:p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold">Total Items Tracked</span>
            <Layers className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-xl sm:text-2xl font-black text-slate-900">{totalStockItems}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Across all project stores</p>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-xl p-3.5 sm:p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold">Total Stock Qty</span>
            <Package className="w-4 h-4 text-indigo-600" />
          </div>
          <p className="text-xl sm:text-2xl font-black text-slate-900">{totalUnits.toLocaleString('en-IN')}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Cumulative units in store</p>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-xl p-3.5 sm:p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold">Low Stock Alerts</span>
            <TrendingDown className="w-4 h-4 text-rose-600" />
          </div>
          <p className={`text-xl sm:text-2xl font-black ${lowStockCount > 0 ? 'text-rose-600' : 'text-slate-900'}`}>
            {lowStockCount}
          </p>
          <p className="text-[11px] text-rose-500 font-medium mt-0.5">Below reorder threshold</p>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-xl p-3.5 sm:p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold">Optimal Stock</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-xl sm:text-2xl font-black text-emerald-600">{optimalCount}</p>
          <p className="text-[11px] text-emerald-600 font-medium mt-0.5">Healthy store balance</p>
        </div>
      </div>

      {/* Main Stock Table */}
      <Table
        headers={['Item Name', 'Item Code', 'Project', 'Available Stock', 'Unit', 'Min Stock', 'Reorder Level', 'Stock Health']}
        data={filteredStocks}
        itemsPerPage={10}
        renderRow={(s, idx) => {
          const isLow = s.quantity <= s.reorderLevel;
          return (
            <tr key={s.id || `${s.projectId}-${s.itemId}-${idx}`} className="hover:bg-slate-50 transition-colors">
              <td className="px-4 py-3 font-semibold text-slate-900 text-xs">
                {s.itemName}
              </td>
              <td className="px-4 py-3 text-xs font-bold text-blue-600">
                {s.itemCode && s.itemCode !== '-' ? (
                  <span className="px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-200/70 rounded-md font-mono text-[11px]">
                    {s.itemCode}
                  </span>
                ) : (
                  <span className="text-slate-400 font-normal">-</span>
                )}
              </td>
              <td className="px-4 py-3 text-slate-900 font-medium text-xs">{s.projectName}</td>
              <td className="px-4 py-3 font-black text-slate-900 text-xs">
                <span className={s.quantity <= 0 ? 'text-rose-600' : 'text-slate-900'}>
                  {s.quantity}
                </span>
              </td>
              <td className="px-4 py-3 text-slate-700 font-medium text-xs">{s.unit}</td>
              <td className="px-4 py-3 text-slate-600 font-medium text-xs">{s.minStock || 0}</td>
              <td className="px-4 py-3 text-slate-600 font-medium text-xs">{s.reorderLevel}</td>
              <td className="px-4 py-3">
                {isLow ? (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200/70">
                    <AlertTriangle className="w-3 h-3 mr-1 shrink-0" /> Low Stock
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/70">
                    <CheckCircle2 className="w-3 h-3 mr-1 shrink-0" /> Optimal
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
