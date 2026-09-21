"use client";

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
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
  placement?: 'auto' | 'bottom' | 'top';
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
  size = 'md',
  placement = 'auto'
}: SelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [mounted, setMounted] = useState(false);
  const [coords, setCoords] = useState<{
    top: number;
    left: number;
    width: number;
    openUpward: boolean;
  } | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const selectedOption = options.find((opt) => opt.value === value);
  const displayLabel = selectedOption ? selectedOption.label : placeholder;

  // Calculate coordinates and flip direction relative to viewport
  const updatePosition = useCallback(() => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const dropdownEstimatedHeight = 250;
    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;

    let shouldOpenUpward = false;
    if (placement === 'top') {
      shouldOpenUpward = true;
    } else if (placement === 'bottom') {
      shouldOpenUpward = false;
    } else {
      shouldOpenUpward = spaceBelow < dropdownEstimatedHeight && spaceAbove > spaceBelow;
    }

    setCoords({
      left: rect.left,
      width: rect.width,
      top: shouldOpenUpward ? rect.top - 6 : rect.bottom + 6,
      openUpward: shouldOpenUpward
    });
  }, [placement]);

  const handleToggle = () => {
    if (disabled) return;
    if (!isOpen) {
      updatePosition();
      setIsOpen(true);
    } else {
      setIsOpen(false);
      setSearchTerm('');
    }
  };

  // Close when clicking outside both the trigger button and the portal dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      if (
        containerRef.current &&
        !containerRef.current.contains(target) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(target)
      ) {
        setIsOpen(false);
        setSearchTerm('');
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape' && isOpen) {
        setIsOpen(false);
        setSearchTerm('');
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  // Recalculate position on scroll or resize
  useEffect(() => {
    if (!isOpen) return;

    updatePosition();

    const handleScrollOrResize = () => {
      updatePosition();
    };

    window.addEventListener('resize', handleScrollOrResize);
    window.addEventListener('scroll', handleScrollOrResize, true);

    return () => {
      window.removeEventListener('resize', handleScrollOrResize);
      window.removeEventListener('scroll', handleScrollOrResize, true);
    };
  }, [isOpen, updatePosition]);

  // Auto focus search input
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      const timer = setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

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
        onClick={handleToggle}
        className={`w-full flex items-center justify-between rounded-xl bg-slate-50 border ${
          error
            ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 bg-red-50/20'
            : isOpen
              ? 'border-blue-600 ring-2 ring-blue-600/10 bg-white'
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

      {/* Render outside of dialog into document.body with React Portal */}
      {isOpen && mounted && coords && typeof document !== 'undefined' && createPortal(
        <div
          ref={dropdownRef}
          style={{
            position: 'fixed',
            left: `${coords.left}px`,
            width: `${coords.width}px`,
            top: coords.openUpward ? 'auto' : `${coords.top}px`,
            bottom: coords.openUpward ? `${Math.max(10, window.innerHeight - coords.top)}px` : 'auto',
            zIndex: 999999
          }}
          className="bg-white border border-slate-200 rounded-2xl shadow-2xl max-h-60 overflow-hidden flex flex-col py-1 animate-modal-zoom ring-1 ring-black/10 backdrop-blur-md"
        >
          {/* Inline search for long lists */}
          {uniqueOptions.length > 5 && (
            <div className="p-2 border-b border-slate-100 flex items-center space-x-2 bg-slate-50/80 sticky top-0 z-10">
              <Search className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search options..."
                className="w-full text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none font-medium bg-transparent"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className="text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          )}

          <div className="overflow-y-auto max-h-48 p-1.5 space-y-0.5">
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
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs text-left cursor-pointer transition-colors ${
                      isSelected 
                        ? 'text-blue-700 bg-blue-50 font-bold border border-blue-200/60' 
                        : 'text-slate-700 hover:bg-slate-100/80 hover:text-slate-900 font-medium'
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
        </div>,
        document.body
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
