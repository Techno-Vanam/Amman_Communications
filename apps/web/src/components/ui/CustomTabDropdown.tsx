'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, Filter } from 'lucide-react';

interface CustomTabDropdownProps<T extends string> {
  value: T;
  options: readonly T[] | T[];
  onChange: (val: T) => void;
  className?: string;
}

export default function CustomTabDropdown<T extends string>({
  value,
  options,
  onChange,
  className = ''
}: CustomTabDropdownProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={dropdownRef} className={`relative inline-block ${className}`}>
      {/* Sleek Custom Trigger Pill */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center justify-between gap-2 px-4 py-2 bg-white hover:bg-[#f0f7f2] border border-gray-300 hover:border-[#12372A] text-gray-900 rounded-full text-xs font-bold transition-all shadow-xs shrink-0"
      >
        <Filter className="w-3.5 h-3.5 text-[#12372A]" />
        <span>{value}</span>
        <ChevronDown className={`w-3.5 h-3.5 text-gray-500 transition-transform duration-200 ${isOpen ? 'rotate-180 text-[#12372A]' : ''}`} />
      </button>

      {/* Custom Animated Floating Menu */}
      {isOpen && (
        <div className="absolute left-0 mt-1.5 w-48 bg-white border border-gray-200/90 rounded-2xl shadow-xl z-50 py-1.5 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
          {options.map((option) => {
            const isSelected = option === value;
            return (
              <button
                key={option}
                type="button"
                onClick={() => {
                  onChange(option);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-4 py-2 text-xs font-semibold flex items-center justify-between transition-colors ${
                  isSelected
                    ? 'bg-[#f0f7f2] text-[#12372A] font-extrabold'
                    : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <span>{option}</span>
                {isSelected && <Check className="w-3.5 h-3.5 text-[#12372A] stroke-[3]" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
