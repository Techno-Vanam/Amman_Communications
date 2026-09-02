'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Clock, ChevronDown, Check } from 'lucide-react';

interface CustomTimePickerProps {
  value: string; // Expected format: "10:30 AM" or "09:00 PM"
  onChange: (value: string) => void;
  className?: string;
  placeholder?: string;
}

const HOURS = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'];
const MINUTES = ['00', '15', '30', '45'];
const PERIODS = ['AM', 'PM'] as const;

export default function CustomTimePicker({
  value,
  onChange,
  className = '',
  placeholder = 'Select time'
}: CustomTimePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Parse time string e.g. "10:30 AM"
  const parseTime = (timeStr: string) => {
    if (!timeStr) return { hour: '10', minute: '30', period: 'AM' };
    const parts = timeStr.trim().split(' ');
    const period = parts[1]?.toUpperCase() === 'PM' ? 'PM' : 'AM';
    const timeParts = (parts[0] || '10:30').split(':');
    let hour = timeParts[0] ? timeParts[0].padStart(2, '0') : '10';
    let minute = timeParts[1] ? timeParts[1].padStart(2, '0') : '00';

    if (!HOURS.includes(hour)) hour = '10';
    if (!MINUTES.includes(minute)) {
      const numMin = parseInt(minute, 10);
      if (numMin < 8) minute = '00';
      else if (numMin < 23) minute = '15';
      else if (numMin < 38) minute = '30';
      else minute = '45';
    }

    return { hour, minute, period };
  };

  const { hour: currentHour, minute: currentMinute, period: currentPeriod } = parseTime(value);

  // Update time helper
  const updateTime = (newHour: string, newMinute: string, newPeriod: string) => {
    onChange(`${newHour}:${newMinute} ${newPeriod}`);
  };

  // Close popover on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className="relative inline-block w-full">
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between px-4 py-2.5 bg-white border-2 border-solid rounded-xl text-xs transition-all duration-200 shadow-2xs ${
          isOpen
            ? 'border-[#12372A] ring-2 ring-[#12372A]/15 text-gray-900'
            : 'border-gray-300 text-gray-800 hover:border-gray-400'
        } ${className}`}
        suppressHydrationWarning
      >
        <div className="flex items-center gap-2.5 truncate">
          <Clock className={`w-4 h-4 shrink-0 transition-colors ${isOpen || value ? 'text-[#12372A]' : 'text-gray-400'}`} />
          <span className="font-bold text-gray-900">
            {value || placeholder}
          </span>
        </div>
        <ChevronDown className={`w-4 h-4 text-gray-400 shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180 text-[#12372A]' : ''}`} />
      </button>

      {/* Time Picker Popover Card */}
      {isOpen && (
        <div className="absolute right-0 sm:left-0 mt-2 z-50 w-80 p-4 bg-white rounded-2xl border border-gray-200/90 shadow-2xl animate-in zoom-in-95 duration-150 ring-1 ring-black/5 select-none space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-gray-100">
            <span className="text-xs font-extrabold uppercase tracking-wider text-gray-700">Select Time Slot</span>
            <span className="text-xs font-mono font-bold bg-[#f0f7f2] text-[#12372A] px-2.5 py-0.5 rounded-full border border-[#a8d5b9]/60">
              {currentHour}:{currentMinute} {currentPeriod}
            </span>
          </div>

          <div className="space-y-3">
            {/* AM / PM Toggle Header */}
            <div>
              <label className="block text-[10px] font-extrabold uppercase text-gray-400 tracking-wider mb-1">
                Period
              </label>
              <div className="grid grid-cols-2 gap-1.5 p-1 bg-gray-100 rounded-xl">
                {PERIODS.map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => updateTime(currentHour, currentMinute, p)}
                    className={`py-1.5 rounded-lg text-xs font-extrabold transition-all ${
                      currentPeriod === p
                        ? 'bg-[#12372A] text-white shadow-xs'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200/60'
                    }`}
                    suppressHydrationWarning
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            {/* Hour Selection Grid */}
            <div>
              <label className="block text-[10px] font-extrabold uppercase text-gray-400 tracking-wider mb-1">
                Hour Selection
              </label>
              <div className="grid grid-cols-6 gap-1">
                {HOURS.map((h) => {
                  const isSelected = currentHour === h;
                  return (
                    <button
                      key={h}
                      type="button"
                      onClick={() => updateTime(h, currentMinute, currentPeriod)}
                      className={`h-8 rounded-lg text-xs font-bold transition-all ${
                        isSelected
                          ? 'bg-[#12372A] text-white font-extrabold shadow-xs scale-105'
                          : 'text-gray-700 bg-gray-50 hover:bg-[#f0f7f2] hover:text-[#12372A] border border-gray-200/80'
                      }`}
                      suppressHydrationWarning
                    >
                      {h}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Minute Selection Grid (00, 15, 30, 45) */}
            <div>
              <label className="block text-[10px] font-extrabold uppercase text-gray-400 tracking-wider mb-1">
                Minute Selection
              </label>
              <div className="grid grid-cols-4 gap-1.5">
                {MINUTES.map((m) => {
                  const isSelected = currentMinute === m;
                  return (
                    <button
                      key={m}
                      type="button"
                      onClick={() => updateTime(currentHour, m, currentPeriod)}
                      className={`py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 ${
                        isSelected
                          ? 'bg-[#12372A] text-white font-extrabold shadow-xs scale-105'
                          : 'text-gray-700 bg-gray-50 hover:bg-[#f0f7f2] hover:text-[#12372A] border border-gray-200/80'
                      }`}
                      suppressHydrationWarning
                    >
                      <span>:{m}</span>
                      {isSelected && <Check className="w-3 h-3 text-[#a8d5b9]" />}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Footer Close */}
          <div className="pt-2 border-t border-gray-100 flex items-center justify-end">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="px-4 py-1.5 bg-[#12372A] hover:bg-[#1a4a38] text-white font-bold text-xs rounded-xl transition-colors shadow-xs"
              suppressHydrationWarning
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
