"use client";

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, Search, X } from 'lucide-react';

export interface SelectOption {
  value: string;
  label: string;
  icon?: React.ReactNode;
}

export interface SelectProps {
  label?: string;
  options: SelectOption[];
  value: string;
  onChange: (e: { target: { value: string } }) => void;
  placeholder?: string;
  className?: string;
  helperText?: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  size?: 'sm' | 'md';
}

export function Select({
  label,
  options,
  value,
  onChange,
  placeholder = 'Select option...',
  className = '',
  helperText,
  error,
  required = false,
  disabled = false,
  icon,
  size = 'md'
}: SelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);
  const displayLabel = selectedOption ? selectedOption.label : placeholder;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (val: string) => {
    onChange({ target: { value: val } });
    setIsOpen(false);
    setSearchTerm('');
  };

  // Deduplicate options by value
  const uniqueOptions = options.filter(
    (opt, index, self) => index === self.findIndex((o) => o.value === opt.value)
  );

  // Filter options by search term if active
  const filteredOptions = uniqueOptions.filter((opt) =>
    opt.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const paddingY = size === 'sm' ? 'py-1.5 px-2.5 text-xs' : 'py-2 px-3 text-sm';

  return (
    <div className="w-full relative flex flex-col" ref={containerRef}>
      {label && (
        <label className="block text-xs font-semibold text-slate-700 mb-1 select-none">
          {label}
          {required && <span className="text-red-500 font-bold ml-1">*</span>}
        </label>
      )}
      
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between rounded-xl bg-slate-50 border ${
          error
            ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 bg-red-50/20'
            : 'border-slate-200 hover:border-slate-300 focus:ring-2 focus:ring-blue-600/10 focus:border-blue-600 focus:bg-white'
        } text-slate-900 font-semibold focus:outline-none transition-all text-left cursor-pointer shadow-xs disabled:opacity-60 disabled:cursor-not-allowed ${paddingY} ${className}`}
      >
        <div className="flex items-center space-x-2 truncate min-w-0 flex-1">
          {icon && <span className="text-blue-600 flex-shrink-0">{icon}</span>}
          {selectedOption?.icon && <span className="flex-shrink-0">{selectedOption.icon}</span>}
          <span className={`truncate ${!selectedOption ? 'text-slate-400 font-normal' : 'text-[#0F172C] font-semibold'}`}>
            {displayLabel}
          </span>
        </div>
        <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform duration-200 flex-shrink-0 ml-1.5 ${isOpen ? 'rotate-180 text-blue-600' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-200/90 rounded-2xl shadow-xl z-55 max-h-64 overflow-hidden flex flex-col py-1 animate-modal-zoom">
          {/* Optional inline search for long lists */}
          {uniqueOptions.length > 5 && (
            <div className="p-2 border-b border-slate-100 flex items-center space-x-2">
              <Search className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search options..."
                className="w-full text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none font-medium bg-transparent"
                autoFocus
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className="text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          )}

          <div className="overflow-y-auto max-h-52 p-1 space-y-0.5">
            {filteredOptions.length === 0 ? (
              <div className="px-4 py-3 text-xs text-slate-400 font-medium italic text-center">
                No matching options found
              </div>
            ) : (
              filteredOptions.map((opt, idx) => {
                const isSelected = opt.value === value;
                return (
                  <button
                    key={`${opt.value}-${idx}`}
                    type="button"
                    onClick={() => handleSelect(opt.value)}
                    className={`w-full flex items-center justify-between px-3 py-1.5 rounded-xl text-xs text-left cursor-pointer transition-colors ${
                      isSelected 
                        ? 'text-blue-700 bg-blue-50/80 font-bold' 
                        : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900 font-medium'
                    }`}
                  >
                    <div className="flex items-center space-x-2 truncate min-w-0">
                      {opt.icon && <span className="flex-shrink-0">{opt.icon}</span>}
                      <span className="truncate">{opt.label}</span>
                    </div>
                    {isSelected && <Check className="h-3.5 w-3.5 text-blue-600 flex-shrink-0 ml-2" />}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}

      {error ? (
        <p className="mt-1 text-xs text-red-500 font-medium flex items-center gap-1">
          <span>{error}</span>
        </p>
      ) : helperText ? (
        <p className="mt-1 text-xs text-slate-500 font-medium">{helperText}</p>
      ) : null}
    </div>
  );
}
