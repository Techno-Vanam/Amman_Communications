'use client';

import { useEffect, useRef, useState } from 'react';
import { Check, ChevronDown, Search } from 'lucide-react';

export interface SelectOption {
  value: string;
  label: string;
  sublabel?: string;
  badge?: string;
}

interface CustomSelectProps {
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  searchable?: boolean;
  disabled?: boolean;
  className?: string;
  required?: boolean;
}

export default function CustomSelect({
  options,
  value,
  onChange,
  placeholder = 'Select an option...',
  searchable = false,
  disabled = false,
  className = '',
  required = false,
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      if (searchable) {
        setTimeout(() => searchInputRef.current?.focus(), 50);
      }
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, searchable]);

  const filteredOptions = searchable && searchQuery.trim()
    ? options.filter((opt) =>
        opt.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (opt.sublabel && opt.sublabel.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : options;

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      {/* Hidden input for HTML form requirement validation if needed */}
      {required && (
        <input
          type="text"
          value={value}
          onChange={() => {}}
          required
          className="sr-only"
          tabIndex={-1}
          aria-hidden="true"
        />
      )}

      {/* Trigger Button (looks exactly like standard input box) */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => {
          if (!disabled) {
            setIsOpen(!isOpen);
            setSearchQuery('');
          }
        }}
        className={`w-full flex items-center justify-between gap-2 px-3.5 py-2.5 text-sm rounded-xl border transition text-left bg-white ${
          isOpen
            ? 'border-emerald-800 ring-1 ring-emerald-800'
            : 'border-gray-200 hover:border-gray-300'
        } ${disabled ? 'bg-gray-100 opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
      >
        <span className="min-w-0 flex-1 truncate">
          {selectedOption ? (
            <span className="flex items-center gap-1.5 truncate">
              <span className="font-medium text-gray-900 truncate">{selectedOption.label}</span>
              {selectedOption.sublabel && (
                <span className="text-xs text-gray-400 truncate">({selectedOption.sublabel})</span>
              )}
            </span>
          ) : (
            <span className="text-gray-400">{placeholder}</span>
          )}
        </span>
        <ChevronDown
          className={`h-4 w-4 text-gray-400 flex-shrink-0 transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-emerald-800' : ''
          }`}
        />
      </button>

      {/* Dropdown Popup: Stays EXACTLY within box width (left-0 right-0 w-full) */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 w-full mt-1.5 z-50 bg-white border border-gray-200 rounded-xl shadow-xl max-h-64 overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-100">
          {/* Optional Search Bar inside dropdown */}
          {searchable && (
            <div className="p-2 border-b border-gray-100 bg-gray-50/70">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search options..."
                  className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-gray-200 bg-white focus:outline-none focus:border-emerald-800"
                />
              </div>
            </div>
          )}

          {/* Options List */}
          <div className="overflow-y-auto divide-y divide-gray-50 py-1 max-h-56">
            {filteredOptions.length === 0 ? (
              <div className="px-3.5 py-4 text-center text-xs text-gray-400 italic">
                No matching options found
              </div>
            ) : (
              filteredOptions.map((opt) => {
                const isSelected = opt.value === value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => {
                      onChange(opt.value);
                      setIsOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 text-left text-xs transition min-w-0 ${
                      isSelected
                        ? 'bg-emerald-50 text-emerald-950 font-semibold'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <div className="min-w-0 flex-1 pr-2 truncate">
                      <div className="truncate font-medium text-gray-900">{opt.label}</div>
                      {opt.sublabel && (
                        <div className="truncate text-[11px] text-gray-400 mt-0.5">{opt.sublabel}</div>
                      )}
                    </div>
                    {isSelected && (
                      <Check className="h-4 w-4 text-emerald-700 flex-shrink-0" />
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
