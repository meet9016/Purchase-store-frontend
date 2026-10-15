"use client";

import React from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';
import { Button } from './Button';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  itemName?: string;
  description?: string;
}

export function DeleteConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title = "Confirm Deletion",
  itemName,
  description
}: DeleteConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0F172C]/70 backdrop-blur-xs animate-backdrop-fade">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full p-4 sm:p-6 animate-modal-zoom space-y-4 max-h-[90vh] overflow-y-auto">
        {/* Header with Danger Icon */}
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-11 h-11 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-100 flex-shrink-0 shadow-xs">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#0F172C]">{title}</h3>
              <p className="text-xs text-slate-500 font-medium mt-0.5">Please confirm your action</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 cursor-pointer p-1"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Message Content */}
        <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 text-xs text-slate-600 leading-relaxed">
          {description ? (
            <p>{description}</p>
          ) : (
            <p>
              Are you sure you want to delete <strong className="text-[#0F172C] font-bold">{itemName || 'this record'}</strong>? This action will remove it permanently and cannot be undone.
            </p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-2 pt-2 border-t border-slate-100">
          <Button variant="secondary" onClick={onClose} className="w-full sm:w-auto justify-center">
            Cancel
          </Button>
          <Button
            variant="danger"
            icon={<Trash2 className="h-4 w-4" />}
            className="w-full sm:w-auto justify-center"
            onClick={() => {
              onConfirm();
              onClose();
            }}
          >
            Yes, Delete
          </Button>
        </div>
      </div>
    </div>
  );
}
