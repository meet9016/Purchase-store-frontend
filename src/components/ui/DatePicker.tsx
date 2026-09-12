"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, X } from 'lucide-react';

interface DatePickerProps {
  label?: string;
  value: string; // YYYY-MM-DD format
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  className?: string;
  helperText?: string;
}

export function DatePicker({
  label,
  value,
  onChange,
  placeholder = 'Select date...',
  required = false,
  className = '',
  helperText
}: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Parse initial date or default to current date
  const parsedDate = value ? new Date(value) : new Date();
  const [currentMonth, setCurrentMonth] = useState<number>(isNaN(parsedDate.getTime()) ? new Date().getMonth() : parsedDate.getMonth());
  const [currentYear, setCurrentYear] = useState<number>(isNaN(parsedDate.getTime()) ? new Date().getFullYear() : parsedDate.getFullYear());

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const daysOfWeek = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

  const getDaysInMonth = (month: number, year: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (month: number, year: number) => {
    const day = new Date(year, month, 1).getDay();
    return day === 0 ? 6 : day - 1; // Adjust for Monday start
  };

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const handleSelectDay = (day: number) => {
    const formattedMonth = String(currentMonth + 1).padStart(2, '0');
    const formattedDay = String(day).padStart(2, '0');
    const selectedDateStr = `${currentYear}-${formattedMonth}-${formattedDay}`;
    onChange(selectedDateStr);
    setIsOpen(false);
  };

  const handleSelectToday = () => {
    const today = new Date();
    const formattedMonth = String(today.getMonth() + 1).padStart(2, '0');
    const formattedDay = String(today.getDate()).padStart(2, '0');
    const todayStr = `${today.getFullYear()}-${formattedMonth}-${formattedDay}`;
    setCurrentMonth(today.getMonth());
    setCurrentYear(today.getFullYear());
    onChange(todayStr);
    setIsOpen(false);
  };

  const handleClear = () => {
    onChange('');
    setIsOpen(false);
  };

  const daysInMonth = getDaysInMonth(currentMonth, currentYear);
  const firstDay = getFirstDayOfMonth(currentMonth, currentYear);

  // Format value for display
  const formatDateDisplay = (dateStr: string) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const day = String(d.getDate()).padStart(2, '0');
    const monthStr = monthNames[d.getMonth()].substring(0, 3);
    return `${day} ${monthStr} ${d.getFullYear()}`;
  };

  return (
    <div className="w-full relative flex flex-col" ref={containerRef}>
      {label && (
        <label className="block text-xs font-semibold text-slate-700 mb-1 select-none">
          {label}
        </label>
      )}

      {/* Input Trigger Box */}
      <div className="relative flex items-center">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`w-full flex items-center justify-between px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm font-semibold hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600/10 focus:border-blue-600 focus:bg-white transition-all text-left cursor-pointer shadow-xs ${className}`}
        >
          <span className={value ? 'text-slate-900 font-semibold' : 'text-slate-400 font-normal'}>
            {value ? formatDateDisplay(value) : placeholder}
          </span>
          <div className="flex items-center space-x-1 text-slate-500">
            {value && (
              <span
                onClick={(e) => { e.stopPropagation(); handleClear(); }}
                className="p-1 hover:text-slate-800 cursor-pointer"
                title="Clear date"
              >
                <X className="h-3.5 w-3.5" />
              </span>
            )}
            <CalendarIcon className="h-4 w-4 text-[#0F172C]" />
          </div>
        </button>
      </div>

      {/* Fallback Native Input for Form Validation */}
      <input
        type="hidden"
        value={value}
        required={required}
      />

      {/* Custom Theme Calendar Popover */}
      {isOpen && (
        <div className="absolute left-0 top-full mt-2 bg-white border border-slate-200 rounded-2xl shadow-2xl z-55 w-72 p-4 animate-modal-zoom">
          
          {/* Header Month/Year Selector */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-[#0F172C] cursor-pointer transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            <div className="text-sm font-extrabold text-[#0F172C]">
              {monthNames[currentMonth]} {currentYear}
            </div>

            <button
              type="button"
              onClick={handleNextMonth}
              className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-[#0F172C] cursor-pointer transition-colors"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          {/* Days of Week Header */}
          <div className="grid grid-cols-7 gap-1 text-center py-2 text-[11px] font-semibold text-slate-500">
            {daysOfWeek.map((day) => (
              <div key={day} className="py-1">{day}</div>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1 text-center text-xs">
            {/* Empty slots before start day */}
            {Array.from({ length: firstDay }).map((_, i) => (
              <div key={`empty-${i}`} className="p-2" />
            ))}

            {/* Days of current month */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const formattedMonth = String(currentMonth + 1).padStart(2, '0');
              const formattedDay = String(day).padStart(2, '0');
              const dateStr = `${currentYear}-${formattedMonth}-${formattedDay}`;

              const isSelected = value === dateStr;
              const isToday = new Date().toISOString().split('T')[0] === dateStr;

              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => handleSelectDay(day)}
                  className={`h-8 w-8 mx-auto rounded-lg flex items-center justify-center font-bold transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-blue-600 text-white shadow-sm'
                      : isToday
                      ? 'border-2 border-blue-600 text-blue-600 font-bold'
                      : 'text-slate-800 hover:bg-slate-100 font-semibold'
                  }`}
                >
                  {day}
                </button>
              );
            })}
          </div>

          {/* Footer Quick Actions */}
          <div className="flex items-center justify-between pt-3 mt-2 border-t border-slate-100 text-xs font-bold">
            <button
              type="button"
              onClick={handleClear}
              className="text-slate-500 hover:text-rose-600 cursor-pointer transition-colors"
            >
              Clear
            </button>
            <button
              type="button"
              onClick={handleSelectToday}
              className="text-blue-600 hover:text-blue-700 hover:underline cursor-pointer font-bold"
            >
              Today
            </button>
          </div>
        </div>
      )}

      {helperText && (
        <p className="mt-1 text-xs text-slate-500 font-medium">{helperText}</p>
      )}
    </div>
  );
}
