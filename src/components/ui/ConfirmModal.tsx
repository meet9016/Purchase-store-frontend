"use client";

import React from 'react';
import { CheckCircle2, AlertTriangle, HelpCircle, X } from 'lucide-react';
import { Button } from './Button';

export interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'primary' | 'success' | 'danger' | 'warning';
  icon?: React.ReactNode;
}

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = 'primary',
  icon
}: ConfirmModalProps) {
  if (!isOpen) return null;

  const iconColorMap = {
    primary: 'bg-blue-50 text-blue-600 border-blue-100',
    success: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    warning: 'bg-amber-50 text-amber-600 border-amber-100',
    danger: 'bg-rose-50 text-rose-600 border-rose-100',
  };

  const defaultIcon = {
    primary: <HelpCircle className="h-6 w-6" />,
    success: <CheckCircle2 className="h-6 w-6" />,
    warning: <AlertTriangle className="h-6 w-6" />,
    danger: <AlertTriangle className="h-6 w-6" />,
  };

  const buttonVariantMap = {
    primary: 'primary' as const,
    success: 'success' as const,
    warning: 'primary' as const,
    danger: 'danger' as const,
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0F172C]/70 backdrop-blur-xs animate-backdrop-fade">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full p-6 animate-modal-zoom space-y-4">
        {/* Header with Icon */}
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className={`w-11 h-11 rounded-2xl flex items-center justify-center border flex-shrink-0 shadow-xs ${iconColorMap[variant]}`}>
              {icon || defaultIcon[variant]}
            </div>
            <div>
              <h3 className="text-base font-bold text-[#0F172C]">{title}</h3>
              <p className="text-xs text-slate-500 font-medium mt-0.5">Please confirm your action</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 cursor-pointer p-1 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Message Content */}
        {description && (
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 text-xs text-slate-600 leading-relaxed">
            <p>{description}</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-100">
          <Button variant="secondary" onClick={onClose}>
            {cancelText}
          </Button>
          <Button
            variant={buttonVariantMap[variant]}
            onClick={() => {
              onConfirm();
              onClose();
            }}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
}
