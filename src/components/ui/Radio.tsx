import React from 'react';

interface RadioOption {
  value: string;
  label: string;
}

interface RadioProps {
  label: string;
  name: string;
  options: RadioOption[];
  selectedValue: string;
  onChange: (value: string) => void;
  className?: string;
}

export function Radio({ label, name, options, selectedValue, onChange, className = '' }: RadioProps) {
  return (
    <div className={`w-full ${className}`}>
      <label className="block text-xs font-bold text-slate-800 mb-2">
        {label}
      </label>
      <div className="flex flex-wrap gap-4">
        {options.map((opt) => {
          const radioId = `${name}-${opt.value}`;
          const isChecked = selectedValue === opt.value;
          return (
            <div key={opt.value} className="flex items-center">
              <input
                type="radio"
                id={radioId}
                name={name}
                value={opt.value}
                checked={isChecked}
                onChange={() => onChange(opt.value)}
                className="h-4 w-4 border-slate-300 text-[#045598] focus:ring-2 focus:ring-[#045598]/20 transition-all cursor-pointer accent-[#045598]"
              />
              <label htmlFor={radioId} className="ml-2 block text-xs font-bold text-slate-800 cursor-pointer select-none">
                {opt.label}
              </label>
            </div>
          );
        })}
      </div>
    </div>
  );
}
