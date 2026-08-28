'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

export interface SelectOption {
  value: string;
  label: string;
  icon?: React.ReactNode;
}

interface CustomSelectProps {
  options: (SelectOption | string)[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export default function CustomSelect({
  options,
  value,
  onChange,
  placeholder = 'Select option',
  className = '',
  disabled = false
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Normalize options to SelectOption objects
  const normalizedOptions: SelectOption[] = options.map((opt) => {
    if (typeof opt === 'string') {
      return { value: opt, label: opt };
    }
    return opt;
  });

  const selectedOption = normalizedOptions.find((opt) => opt.value === value);

  // Click outside listener
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className="relative inline-block w-full text-xs">
      {/* Trigger Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between px-4 py-2.5 bg-white border-2 border-solid rounded-xl font-semibold transition-all duration-200 shadow-2xs ${
          disabled
            ? 'opacity-60 cursor-not-allowed bg-gray-100 border-gray-200'
            : isOpen
            ? 'border-[#12372A] ring-2 ring-[#12372A]/15 text-gray-900'
            : 'border-gray-300 text-gray-800 hover:border-gray-400'
        } ${className}`}
      >
        <div className="flex items-center gap-2 truncate">
          {selectedOption?.icon && <span className="shrink-0">{selectedOption.icon}</span>}
          <span className={`truncate ${!selectedOption ? 'text-gray-400 font-normal' : 'font-semibold text-gray-900'}`}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
        </div>
        <ChevronDown className={`w-4 h-4 text-gray-400 shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180 text-[#12372A]' : ''}`} />
      </button>

      {/* Options Dropdown Popover */}
      {isOpen && (
        <div className="absolute left-0 right-0 mt-1.5 z-50 max-h-60 overflow-y-auto bg-white rounded-2xl border border-gray-200/90 shadow-2xl p-1.5 animate-in zoom-in-95 duration-150 ring-1 ring-black/5">
          {normalizedOptions.length === 0 ? (
            <div className="px-3 py-2 text-center text-gray-400 text-xs font-medium">No options available</div>
          ) : (
            normalizedOptions.map((opt) => {
              const isSelected = opt.value === value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => handleSelect(opt.value)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left font-semibold transition-all duration-150 ${
                    isSelected
                      ? 'bg-[#f0f7f2] text-[#12372A] font-extrabold'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    {opt.icon && <span className="shrink-0">{opt.icon}</span>}
                    <span className="truncate">{opt.label}</span>
                  </div>
                  {isSelected && <Check className="w-4 h-4 text-[#12372A] shrink-0" />}
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
