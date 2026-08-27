import React, { useState, useRef, useEffect } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';

interface CalendarPickerProps {
  selectedDate: string; // Format: 'DD/MM/YYYY' or 'YYYY-MM-DD'
  onSelectDate: (dateStr: string) => void;
  error?: string;
}

export const CalendarPicker: React.FC<CalendarPickerProps> = ({
  selectedDate,
  onSelectDate,
  error,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  // Helper to parse 'DD/MM/YYYY' or 'YYYY-MM-DD'
  const parseDate = (val: string): Date => {
    if (!val) return new Date();
    if (val.includes('/')) {
      const parts = val.split('/');
      if (parts.length === 3) {
        return new Date(parseInt(parts[2], 10), parseInt(parts[1], 10) - 1, parseInt(parts[0], 10));
      }
    } else if (val.includes('-')) {
      const parts = val.split('-');
      if (parts.length === 3) {
        return new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
      }
    }
    return new Date();
  };

  const currentDateObj = parseDate(selectedDate);
  const [viewMonth, setViewMonth] = useState<Date>(
    new Date(currentDateObj.getFullYear(), currentDateObj.getMonth(), 1)
  );

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Years array for fast year selection (2024 to 2030)
  const yearOptions = Array.from({ length: 10 }, (_, i) => 2024 + i);

  const year = viewMonth.getFullYear();
  const month = viewMonth.getMonth();

  const handlePrevMonth = () => {
    setViewMonth(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setViewMonth(new Date(year, month + 1, 1));
  };

  const handleMonthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setViewMonth(new Date(year, parseInt(e.target.value, 10), 1));
  };

  const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setViewMonth(new Date(parseInt(e.target.value, 10), month, 1));
  };

  // Format date to DD/MM/YYYY
  const formatDisplayDate = (y: number, m: number, d: number) => {
    const dd = String(d).padStart(2, '0');
    const mm = String(m + 1).padStart(2, '0');
    return `${dd}/${mm}/${y}`;
  };

  const handleDateClick = (d: number) => {
    const formatted = formatDisplayDate(year, month, d);
    onSelectDate(formatted);
    setIsOpen(false);
  };

  // Close popover when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Display value in input
  const displayValue = selectedDate ? selectedDate : '';

  // Get days grid array
  const firstDayOfWeek = new Date(year, month, 1).getDay();
  const totalDaysInMonth = new Date(year, month + 1, 0).getDate();

  const daysArray = [];
  for (let i = 0; i < firstDayOfWeek; i++) {
    daysArray.push(null);
  }
  for (let d = 1; d <= totalDaysInMonth; d++) {
    daysArray.push(d);
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    onSelectDate(val);

    if (val.includes('/')) {
      const parts = val.split('/');
      if (parts.length === 3) {
        const d = parseInt(parts[0], 10);
        const m = parseInt(parts[1], 10) - 1;
        const y = parseInt(parts[2], 10);
        if (!isNaN(d) && !isNaN(m) && !isNaN(y) && m >= 0 && m <= 11 && y >= 2024 && y <= 2035) {
          setViewMonth(new Date(y, m, 1));
        }
      }
    }
  };

  return (
    <div className="space-y-1.5 relative" ref={popoverRef}>
      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
        Preferred Date <span className="text-red-500">*</span>
      </label>

      {/* Input Field (Editable for manual typing + icon for calendar popover) */}
      <div className="relative flex items-center">
        <input
          type="text"
          value={displayValue}
          onChange={handleInputChange}
          placeholder="DD/MM/YYYY"
          className={`w-full px-4 py-3 bg-slate-50 border ${
            error ? 'border-red-500 focus:ring-red-500' : 'border-slate-200 focus:ring-brand-500'
          } rounded-xl text-sm text-slate-800 focus:ring-2 focus:bg-white focus:outline-none transition-all font-medium pr-10`}
        />
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="absolute right-3 text-brand-600 hover:text-brand-700 p-1 cursor-pointer transition-colors"
          aria-label="Toggle calendar"
        >
          <CalendarIcon className="w-4 h-4" />
        </button>
      </div>

      {error && (
        <p className="text-xs text-red-500 font-medium mt-1">{error}</p>
      )}

      {/* Calendar Popup Popover */}
      {isOpen && (
        <div className="absolute left-0 top-full mt-2 z-50 w-72 sm:w-80 bg-white rounded-2xl border border-slate-200 shadow-xl p-4 animate-fade-in">
          {/* Header Navigation with Dropdowns */}
          <div className="flex items-center justify-between gap-1 mb-3 pb-2 border-b border-slate-100">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="p-1 rounded-lg text-slate-600 hover:bg-brand-50 hover:text-brand-700 transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-1.5">
              {/* Fast Month Dropdown */}
              <select
                value={month}
                onChange={handleMonthChange}
                className="bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-brand-500 cursor-pointer"
              >
                {monthNames.map((mName, idx) => (
                  <option key={mName} value={idx}>
                    {mName}
                  </option>
                ))}
              </select>

              {/* Fast Year Dropdown */}
              <select
                value={year}
                onChange={handleYearChange}
                className="bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-brand-500 cursor-pointer"
              >
                {yearOptions.map((yNum) => (
                  <option key={yNum} value={yNum}>
                    {yNum}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="button"
              onClick={handleNextMonth}
              className="p-1 rounded-lg text-slate-600 hover:bg-brand-50 hover:text-brand-700 transition-colors cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Weekday Row */}
          <div className="grid grid-cols-7 text-center mb-2">
            {weekDays.map((wd) => (
              <span key={wd} className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                {wd}
              </span>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1 text-center justify-items-center">
            {daysArray.map((day, idx) => {
              if (day === null) {
                return <div key={`empty-${idx}`} className="w-8 h-8" />;
              }

              const formattedStr = formatDisplayDate(year, month, day);
              const isSelected = selectedDate === formattedStr;

              const today = new Date();
              today.setHours(0, 0, 0, 0);
              const cellDate = new Date(year, month, day);
              cellDate.setHours(0, 0, 0, 0);
              const isPast = cellDate < today;

              return (
                <button
                  key={`day-${day}`}
                  type="button"
                  disabled={isPast}
                  onClick={() => !isPast && handleDateClick(day)}
                  className={`w-8 h-8 rounded-full text-xs font-semibold flex items-center justify-center transition-all ${
                    isPast
                      ? 'text-slate-300 cursor-not-allowed opacity-40'
                      : isSelected
                      ? 'bg-brand-600 text-white font-bold shadow-xs cursor-pointer'
                      : 'text-slate-700 hover:bg-brand-50 hover:text-brand-700 cursor-pointer'
                  }`}
                >
                  {day}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
