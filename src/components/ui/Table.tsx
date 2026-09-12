"use client";

import React, { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, ChevronDown, Check } from 'lucide-react';

interface TableProps<T> {
  headers: string[];
  data: T[];
  renderRow: (item: T, index: number) => React.ReactNode;
  itemsPerPage?: number;
  emptyMessage?: string;
  maxVisibleRows?: number;
}

const PAGE_SIZE_OPTIONS = [5, 10, 15, 25, 50];

export function Table<T>({
  headers,
  data,
  renderRow,
  itemsPerPage = 10,
  emptyMessage,
  maxVisibleRows = 10
}: TableProps<T>) {
  const [pageSize, setPageSize] = useState(itemsPerPage);
  const [currentPage, setCurrentPage] = useState(1);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const totalPages = Math.ceil(data.length / pageSize) || 1;
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (safeCurrentPage - 1) * pageSize;
  const paginatedData = data.slice(startIndex, startIndex + pageSize);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handlePrev = () => {
    if (safeCurrentPage > 1) setCurrentPage(safeCurrentPage - 1);
  };

  const handleNext = () => {
    if (safeCurrentPage < totalPages) setCurrentPage(safeCurrentPage + 1);
  };

  const getPageNumbers = () => {
    const pages: number[] = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, safeCurrentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  };

  return (
    <div className="rounded-2xl border border-slate-200/90 bg-white shadow-xs overflow-hidden flex flex-col">
      {/* Scrollable table body wrapper with max height for 10 rows */}
      <div className="overflow-x-auto w-full max-h-[560px] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-transparent">
        <table className="w-full text-left text-[13px] border-collapse">
          <thead className="sticky top-0 z-10 bg-slate-100/95 backdrop-blur-xs shadow-xs border-b border-slate-200">
            <tr className="text-slate-900 font-bold text-xs tracking-normal">
              {headers.map((h, i) => {
                const isAction = h.toLowerCase().includes('action');
                return (
                  <th
                    key={i}
                    className={`px-4 py-3 whitespace-nowrap text-slate-900 font-bold text-xs capitalize ${
                      isAction ? 'text-right pr-5' : 'text-left'
                    }`}
                  >
                    {h}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200/90 text-slate-800 text-[13px] font-medium">
            {paginatedData.length === 0 ? (
              <tr>
                <td colSpan={headers.length} className="px-6 py-12 text-center bg-white">
                  <div className="flex flex-col items-center justify-center space-y-1.5">
                    <span className="text-sm font-semibold text-slate-700">
                      {emptyMessage || 'No records found'}
                    </span>
                    <span className="text-xs text-slate-500">Try adjusting your search or filters</span>
                  </div>
                </td>
              </tr>
            ) : (
              paginatedData.map((item, idx) => renderRow(item, startIndex + idx))
            )}
          </tbody>
        </table>
      </div>

      {/* Modern Compact Pagination Footer */}
      <div className="flex flex-col sm:flex-row items-center justify-between px-4 py-2.5 border-t border-slate-100 bg-slate-50/60 gap-3">
        <div className="flex items-center space-x-3 text-xs">
          {/* Custom Styled Rows Dropdown */}
          <div className="flex items-center space-x-2">
            <span className="text-slate-500 font-semibold text-xs">Rows</span>
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center space-x-1.5 bg-white border border-slate-200 hover:border-slate-300 rounded-lg px-2.5 py-1 text-xs font-medium text-slate-700 shadow-2xs hover:bg-slate-50 transition-all cursor-pointer focus:outline-none focus:ring-1 focus:ring-blue-500/30"
              >
                <span>{pageSize}</span>
                <ChevronDown className={`h-3.5 w-3.5 text-slate-400 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180 text-blue-600' : ''}`} />
              </button>

              {isDropdownOpen && (
                <div className="absolute left-0 bottom-full mb-1 w-20 bg-white rounded-xl shadow-lg border border-slate-100 py-1 z-50 animate-in fade-in zoom-in-95 duration-150">
                  {PAGE_SIZE_OPTIONS.map((opt) => {
                    const isSelected = opt === pageSize;
                    return (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => {
                          setPageSize(opt);
                          setCurrentPage(1);
                          setIsDropdownOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-3 py-1.5 text-xs font-normal transition-colors cursor-pointer ${
                          isSelected
                            ? 'bg-blue-50 text-blue-600 font-semibold'
                            : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                        }`}
                      >
                        <span>{opt}</span>
                        {isSelected && <Check className="h-3 w-3 text-blue-600" />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          <span className="text-slate-500 text-xs font-normal">
            Showing <span className="font-semibold text-slate-700">{data.length > 0 ? startIndex + 1 : 0}</span> to <span className="font-semibold text-slate-700">{Math.min(startIndex + pageSize, data.length)}</span> of <span className="font-semibold text-slate-700">{data.length}</span> entries
          </span>
        </div>

        {/* Pagination Controls */}
        <div className="flex items-center space-x-1">
          <button
            type="button"
            onClick={() => setCurrentPage(1)}
            disabled={safeCurrentPage === 1}
            className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer shadow-2xs"
            title="First page"
          >
            <ChevronsLeft className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={handlePrev}
            disabled={safeCurrentPage === 1}
            className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer shadow-2xs"
            title="Previous page"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
          </button>

          <div className="flex items-center space-x-1 px-1">
            {getPageNumbers().map((p) => {
              const isActive = p === safeCurrentPage;
              return (
                <button
                  key={p}
                  type="button"
                  onClick={() => setCurrentPage(p)}
                  className={`w-6 h-6 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {p}
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={handleNext}
            disabled={safeCurrentPage === totalPages}
            className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer shadow-2xs"
            title="Next page"
          >
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setCurrentPage(totalPages)}
            disabled={safeCurrentPage === totalPages}
            className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer shadow-2xs"
            title="Last page"
          >
            <ChevronsRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
