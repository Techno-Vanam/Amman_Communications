'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, X } from 'lucide-react';

interface CustomDatePickerProps {
  value: string; // Expected format YYYY-MM-DD or string
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  required?: boolean;
  minDate?: string;
  maxDate?: string;
  disableFuture?: boolean;
  disablePast?: boolean;
  label?: string;
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const MONTH_SHORT = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function CustomDatePicker({
  value,
  onChange,
  placeholder = 'Select date',
  className = '',
  required = false,
  minDate,
  maxDate,
  disableFuture = false,
  disablePast = false
}: CustomDatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'days' | 'months' | 'years'>('days');
  const containerRef = useRef<HTMLDivElement>(null);

  // Format date to YYYY-MM-DD
  const formatYYYYMMDD = (year: number, month: number, day: number): string => {
    const mm = String(month + 1).padStart(2, '0');
    const dd = String(day).padStart(2, '0');
    return `${year}-${mm}-${dd}`;
  };

  const now = new Date();
  const todayYear = now.getFullYear();
  const todayMonth = now.getMonth();
  const todayDate = now.getDate();
  const todayStr = formatYYYYMMDD(todayYear, todayMonth, todayDate);

  // Effective maxDate & minDate
  const effectiveMaxDate = disableFuture
    ? (maxDate ? (maxDate < todayStr ? maxDate : todayStr) : todayStr)
    : maxDate;
  const effectiveMinDate = disablePast
    ? (minDate ? (minDate > todayStr ? minDate : todayStr) : todayStr)
    : minDate;

  // Parse initial selected date or fallback to today
  const parseDate = (str: string): Date => {
    if (!str) return new Date();
    const parsed = new Date(str);
    return isNaN(parsed.getTime()) ? new Date() : parsed;
  };

  const selectedDate = value ? parseDate(value) : null;

  // Current view month & year state
  const [viewYear, setViewYear] = useState<number>(
    selectedDate ? selectedDate.getFullYear() : todayYear
  );
  const [viewMonth, setViewMonth] = useState<number>(
    selectedDate ? selectedDate.getMonth() : todayMonth
  );

  // Decade start year for Year Grid View (12 years per page block)
  const [decadeStart, setDecadeStart] = useState<number>(
    Math.floor((selectedDate ? selectedDate.getFullYear() : todayYear) / 12) * 12
  );

  // Sync view when value changes externally
  useEffect(() => {
    if (value) {
      const d = parseDate(value);
      setViewYear(d.getFullYear());
      setViewMonth(d.getMonth());
      setDecadeStart(Math.floor(d.getFullYear() / 12) * 12);
    }
  }, [value]);

  // Sync decadeStart when viewYear changes
  useEffect(() => {
    setDecadeStart(Math.floor(viewYear / 12) * 12);
  }, [viewYear]);

  // Click outside listener
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setViewMode('days');
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Display text formatted nicely e.g. "27 Aug 2026"
  const getDisplayText = (): string => {
    if (!value || !selectedDate) return placeholder;
    const day = selectedDate.getDate();
    const month = MONTH_SHORT[selectedDate.getMonth()];
    const year = selectedDate.getFullYear();
    return `${day} ${month} ${year}`;
  };

  // Validation checkers
  const isDayDisabled = (dateStr: string): boolean => {
    if (effectiveMaxDate && dateStr > effectiveMaxDate) return true;
    if (effectiveMinDate && dateStr < effectiveMinDate) return true;
    return false;
  };

  const isMonthDisabled = (year: number, monthIdx: number): boolean => {
    if (effectiveMaxDate) {
      const maxYear = parseInt(effectiveMaxDate.split('-')[0], 10);
      const maxMonth = parseInt(effectiveMaxDate.split('-')[1], 10) - 1;
      if (year > maxYear) return true;
      if (year === maxYear && monthIdx > maxMonth) return true;
    }
    if (effectiveMinDate) {
      const minYear = parseInt(effectiveMinDate.split('-')[0], 10);
      const minMonth = parseInt(effectiveMinDate.split('-')[1], 10) - 1;
      if (year < minYear) return true;
      if (year === minYear && monthIdx < minMonth) return true;
    }
    return false;
  };

  const isYearDisabled = (year: number): boolean => {
    if (effectiveMaxDate) {
      const maxYear = parseInt(effectiveMaxDate.split('-')[0], 10);
      if (year > maxYear) return true;
    }
    if (effectiveMinDate) {
      const minYear = parseInt(effectiveMinDate.split('-')[0], 10);
      if (year < minYear) return true;
    }
    return false;
  };

  const isPrevDisabled = (): boolean => {
    if (viewMode === 'days') {
      const prevY = viewMonth === 0 ? viewYear - 1 : viewYear;
      const prevM = viewMonth === 0 ? 11 : viewMonth - 1;
      return isMonthDisabled(prevY, prevM);
    }
    if (viewMode === 'months') {
      return isYearDisabled(viewYear - 1);
    }
    if (viewMode === 'years') {
      return isYearDisabled(decadeStart - 1);
    }
    return false;
  };

  const isNextDisabled = (): boolean => {
    if (viewMode === 'days') {
      const nextY = viewMonth === 11 ? viewYear + 1 : viewYear;
      const nextM = viewMonth === 11 ? 0 : viewMonth + 1;
      return isMonthDisabled(nextY, nextM);
    }
    if (viewMode === 'months') {
      return isYearDisabled(viewYear + 1);
    }
    if (viewMode === 'years') {
      return isYearDisabled(decadeStart + 12);
    }
    return false;
  };

  // Calendar calculations for Days Grid
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(viewYear, viewMonth, 1).getDay();

  // Header Nav Actions
  const handlePrevHeader = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (viewMode === 'days') {
      if (viewMonth === 0) {
        setViewMonth(11);
        setViewYear(viewYear - 1);
      } else {
        setViewMonth(viewMonth - 1);
      }
    } else if (viewMode === 'months') {
      setViewYear(viewYear - 1);
    } else if (viewMode === 'years') {
      setDecadeStart(decadeStart - 12);
    }
  };

  const handleNextHeader = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (viewMode === 'days') {
      if (viewMonth === 11) {
        setViewMonth(0);
        setViewYear(viewYear + 1);
      } else {
        setViewMonth(viewMonth + 1);
      }
    } else if (viewMode === 'months') {
      setViewYear(viewYear + 1);
    } else if (viewMode === 'years') {
      setDecadeStart(decadeStart + 12);
    }
  };

  const handleSelectDay = (day: number) => {
    const formatted = formatYYYYMMDD(viewYear, viewMonth, day);
    if (isDayDisabled(formatted)) return;
    onChange(formatted);
    setIsOpen(false);
    setViewMode('days');
  };

  const handleSelectMonth = (monthIdx: number) => {
    if (isMonthDisabled(viewYear, monthIdx)) return;
    setViewMonth(monthIdx);
    setViewMode('days');
  };

  const handleSelectYear = (yearNum: number) => {
    if (isYearDisabled(yearNum)) return;
    setViewYear(yearNum);
    setViewMode('months');
  };

  const handleSelectToday = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isDayDisabled(todayStr)) return;
    setViewYear(todayYear);
    setViewMonth(todayMonth);
    setDecadeStart(Math.floor(todayYear / 12) * 12);
    onChange(todayStr);
    setIsOpen(false);
    setViewMode('days');
  };

  return (
    <div ref={containerRef} className="relative inline-block w-full">
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => {
          setIsOpen(!isOpen);
          setViewMode('days');
        }}
        className={`w-full flex items-center justify-between px-4 py-2.5 bg-white border-2 border-solid rounded-xl text-xs transition-all duration-200 shadow-2xs ${
          isOpen
            ? 'border-[#12372A] ring-2 ring-[#12372A]/15 text-gray-900'
            : 'border-gray-300 text-gray-800 hover:border-gray-400'
        } ${className}`}
      >
        <div className="flex items-center gap-2.5 truncate">
          <CalendarIcon className={`w-4 h-4 shrink-0 transition-colors ${isOpen || value ? 'text-[#12372A]' : 'text-gray-400'}`} />
          <span className={`truncate ${!value ? 'text-gray-400 font-normal' : 'font-semibold text-gray-900'}`}>
            {getDisplayText()}
          </span>
        </div>
        {value && !required ? (
          <span
            onClick={(e) => {
              e.stopPropagation();
              onChange('');
            }}
            className="p-1 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 shrink-0 transition-colors"
            title="Clear date"
          >
            <X className="w-3.5 h-3.5" />
          </span>
        ) : (
          <ChevronRight className={`w-4 h-4 text-gray-400 shrink-0 transition-transform duration-200 rotate-90 ${isOpen ? '-rotate-90 text-[#12372A]' : ''}`} />
        )}
      </button>

      {/* Calendar Popover */}
      {isOpen && (
        <div className="absolute left-0 mt-2 z-50 w-72 p-4 bg-white rounded-2xl border border-gray-200/90 shadow-2xl animate-in zoom-in-95 duration-150 ring-1 ring-black/5 select-none">
          {/* Header Controls */}
          <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-3">
            <button
              type="button"
              disabled={isPrevDisabled()}
              onClick={handlePrevHeader}
              className={`p-1.5 rounded-lg transition-colors shrink-0 ${
                isPrevDisabled()
                  ? 'text-gray-300 cursor-not-allowed'
                  : 'text-gray-600 hover:text-[#12372A] hover:bg-[#f0f7f2]'
              }`}
              title="Previous"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {/* Clickable Mode Switch Header Title */}
            <div className="flex items-center gap-1 font-bold text-xs">
              {viewMode === 'days' && (
                <>
                  <button
                    type="button"
                    onClick={() => setViewMode('months')}
                    className="px-2 py-1 rounded-lg text-[#12372A] hover:bg-[#f0f7f2] font-extrabold transition-colors"
                  >
                    {MONTH_NAMES[viewMonth]}
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode('years')}
                    className="px-2 py-1 rounded-lg text-[#12372A] hover:bg-[#f0f7f2] font-extrabold transition-colors"
                  >
                    {viewYear}
                  </button>
                </>
              )}

              {viewMode === 'months' && (
                <button
                  type="button"
                  onClick={() => setViewMode('years')}
                  className="px-2 py-1 rounded-lg text-[#12372A] hover:bg-[#f0f7f2] font-extrabold transition-colors"
                >
                  {viewYear}
                </button>
              )}

              {viewMode === 'years' && (
                <span className="px-2 py-1 text-[#12372A] font-extrabold">
                  {decadeStart} - {decadeStart + 11}
                </span>
              )}
            </div>

            <button
              type="button"
              disabled={isNextDisabled()}
              onClick={handleNextHeader}
              className={`p-1.5 rounded-lg transition-colors shrink-0 ${
                isNextDisabled()
                  ? 'text-gray-300 cursor-not-allowed'
                  : 'text-gray-600 hover:text-[#12372A] hover:bg-[#f0f7f2]'
              }`}
              title="Next"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* VIEW 1: Days View Grid */}
          {viewMode === 'days' && (
            <>
              {/* Days of Week Row */}
              <div className="grid grid-cols-7 gap-1 text-center mb-1">
                {DAYS_OF_WEEK.map((day) => (
                  <span key={day} className="text-[10px] font-extrabold text-gray-400 uppercase py-1">
                    {day}
                  </span>
                ))}
              </div>

              {/* Days Grid */}
              <div className="grid grid-cols-7 gap-1">
                {Array.from({ length: firstDayOfWeek }).map((_, index) => (
                  <div key={`empty-${index}`} className="h-8" />
                ))}

                {Array.from({ length: daysInMonth }).map((_, index) => {
                  const dayNum = index + 1;
                  const dateStr = formatYYYYMMDD(viewYear, viewMonth, dayNum);
                  const isSelected = value === dateStr;
                  const isToday = todayStr === dateStr;
                  const disabled = isDayDisabled(dateStr);

                  return (
                    <button
                      key={dayNum}
                      type="button"
                      disabled={disabled}
                      onClick={() => handleSelectDay(dayNum)}
                      className={`h-8 w-8 mx-auto flex items-center justify-center rounded-xl text-xs font-bold transition-all duration-150 ${
                        disabled
                          ? 'text-gray-300 cursor-not-allowed bg-gray-50/50'
                          : isSelected
                          ? 'bg-[#12372A] text-white shadow-xs font-extrabold scale-105'
                          : isToday
                          ? 'bg-emerald-50 text-[#12372A] border border-[#a8d5b9] font-extrabold'
                          : 'text-gray-700 hover:bg-[#f0f7f2] hover:text-[#12372A]'
                      }`}
                    >
                      {dayNum}
                    </button>
                  );
                })}
              </div>
            </>
          )}

          {/* VIEW 2: Months View Grid */}
          {viewMode === 'months' && (
            <div className="grid grid-cols-4 gap-2.5 py-2">
              {MONTH_SHORT.map((mShort, idx) => {
                const isCurrentViewMonth = viewMonth === idx;
                const disabled = isMonthDisabled(viewYear, idx);
                return (
                  <button
                    key={mShort}
                    type="button"
                    disabled={disabled}
                    onClick={() => handleSelectMonth(idx)}
                    className={`py-3 rounded-xl text-xs font-bold transition-all duration-150 ${
                      disabled
                        ? 'text-gray-300 cursor-not-allowed bg-gray-50/50'
                        : isCurrentViewMonth
                        ? 'bg-[#12372A] text-white font-extrabold shadow-sm scale-105'
                        : 'text-gray-700 hover:bg-[#f0f7f2] hover:text-[#12372A]'
                    }`}
                  >
                    {mShort}
                  </button>
                );
              })}
            </div>
          )}

          {/* VIEW 3: Years View Grid */}
          {viewMode === 'years' && (
            <div className="grid grid-cols-4 gap-2 py-2">
              {Array.from({ length: 12 }).map((_, idx) => {
                const yr = decadeStart + idx;
                const isCurrentViewYear = viewYear === yr;
                const disabled = isYearDisabled(yr);
                return (
                  <button
                    key={yr}
                    type="button"
                    disabled={disabled}
                    onClick={() => handleSelectYear(yr)}
                    className={`py-2.5 rounded-xl text-xs font-bold transition-all duration-150 ${
                      disabled
                        ? 'text-gray-300 cursor-not-allowed bg-gray-50/50'
                        : isCurrentViewYear
                        ? 'bg-[#12372A] text-white font-extrabold shadow-sm scale-105'
                        : 'text-gray-700 hover:bg-[#f0f7f2] hover:text-[#12372A]'
                    }`}
                  >
                    {yr}
                  </button>
                );
              })}
            </div>
          )}

          {/* Popover Footer */}
          <div className="pt-3 mt-3 border-t border-gray-100 flex items-center justify-between text-xs">
            <button
              type="button"
              disabled={isDayDisabled(todayStr)}
              onClick={handleSelectToday}
              className={`font-extrabold text-[11px] ${
                isDayDisabled(todayStr)
                  ? 'text-gray-300 cursor-not-allowed'
                  : 'text-[#12372A] hover:underline'
              }`}
            >
              Today
            </button>
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                setViewMode('days');
              }}
              className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-[11px] rounded-lg transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
