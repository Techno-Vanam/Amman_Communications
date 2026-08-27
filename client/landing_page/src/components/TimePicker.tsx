import React, { useState, useRef, useEffect } from 'react';
import { Clock } from 'lucide-react';

interface TimePickerProps {
  selectedTime: string; // e.g. "10:30 AM" or "02:00 PM"
  onSelectTime: (timeStr: string) => void;
  error?: string;
}

export const TimePicker: React.FC<TimePickerProps> = ({
  selectedTime,
  onSelectTime,
  error,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  // Parse existing time string e.g. "10:30 AM"
  const parseTimeStr = (str: string) => {
    let hour = '10';
    let minute = '30';
    let period = 'AM';

    if (str) {
      const match = str.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
      if (match) {
        hour = match[1].padStart(2, '0');
        minute = match[2];
        period = match[3].toUpperCase();
      }
    }

    return { hour, minute, period };
  };

  const initialParsed = parseTimeStr(selectedTime);
  const [selectedHour, setSelectedHour] = useState(initialParsed.hour);
  const [selectedMinute, setSelectedMinute] = useState(initialParsed.minute);
  const [selectedPeriod, setSelectedPeriod] = useState<'AM' | 'PM'>(initialParsed.period as 'AM' | 'PM');

  useEffect(() => {
    if (selectedTime) {
      const parsed = parseTimeStr(selectedTime);
      setSelectedHour(parsed.hour);
      setSelectedMinute(parsed.minute);
      setSelectedPeriod(parsed.period as 'AM' | 'PM');
    }
  }, [selectedTime]);

  const hoursList = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'];
  const minutesList = ['00', '05', '10', '15', '20', '25', '30', '35', '40', '45', '50', '55'];

  const handleConfirmTime = (h: string, m: string, p: 'AM' | 'PM') => {
    const formatted = `${h}:${m} ${p}`;
    onSelectTime(formatted);
  };

  const handleHourSelect = (h: string) => {
    setSelectedHour(h);
    handleConfirmTime(h, selectedMinute, selectedPeriod);
  };

  const handleMinuteSelect = (m: string) => {
    setSelectedMinute(m);
    handleConfirmTime(selectedHour, m, selectedPeriod);
  };

  const handlePeriodSelect = (p: 'AM' | 'PM') => {
    setSelectedPeriod(p);
    handleConfirmTime(selectedHour, selectedMinute, p);
  };

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onSelectTime(e.target.value);
  };

  return (
    <div className="space-y-1.5 relative" ref={popoverRef}>
      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
        Preferred Time <span className="text-red-500">*</span>
      </label>

      {/* Input Field (Editable for manual typing + clock icon for time picker popover) */}
      <div className="relative flex items-center">
        <input
          type="text"
          value={selectedTime ? selectedTime : ''}
          onChange={handleInputChange}
          placeholder="HH:MM AM/PM"
          className={`w-full px-4 py-3 bg-slate-50 border ${
            error ? 'border-red-500 focus:ring-red-500' : 'border-slate-200 focus:ring-brand-500'
          } rounded-xl text-sm text-slate-800 focus:ring-2 focus:bg-white focus:outline-none transition-all font-medium pr-10`}
        />
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="absolute right-3 text-brand-600 hover:text-brand-700 p-1 cursor-pointer transition-colors"
          aria-label="Toggle time picker"
        >
          <Clock className="w-4 h-4" />
        </button>
      </div>

      {error && (
        <p className="text-xs text-red-500 font-medium mt-1">{error}</p>
      )}

      {/* Scrollable Time Picker Popover */}
      {isOpen && (
        <div className="absolute right-0 sm:left-0 top-full mt-2 z-50 w-64 bg-white rounded-2xl border border-slate-200 shadow-xl p-4 animate-fade-in space-y-3">
          {/* AM / PM Toggle Row */}
          <div className="flex items-center justify-center p-1 bg-slate-100 rounded-xl">
            <button
              type="button"
              onClick={() => handlePeriodSelect('AM')}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                selectedPeriod === 'AM'
                  ? 'bg-brand-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              AM
            </button>
            <button
              type="button"
              onClick={() => handlePeriodSelect('PM')}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                selectedPeriod === 'PM'
                  ? 'bg-brand-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              PM
            </button>
          </div>

          {/* Scrollable Columns for Hours and Minutes */}
          <div className="grid grid-cols-2 gap-2 text-center pt-1">
            {/* Hours Column */}
            <div>
              <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                HOURS
              </span>
              <div className="h-40 overflow-y-auto space-y-1 pr-1 border-r border-slate-100 scrollbar-thin">
                {hoursList.map((h) => {
                  const isSel = selectedHour === h;
                  return (
                    <button
                      key={h}
                      type="button"
                      onClick={() => handleHourSelect(h)}
                      className={`w-full py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        isSel
                          ? 'bg-brand-50 text-brand-700 border border-brand-200'
                          : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {h}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Minutes Column */}
            <div>
              <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                MINUTES
              </span>
              <div className="h-40 overflow-y-auto space-y-1 pl-1 scrollbar-thin">
                {minutesList.map((m) => {
                  const isSel = selectedMinute === m;
                  return (
                    <button
                      key={m}
                      type="button"
                      onClick={() => handleMinuteSelect(m)}
                      className={`w-full py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        isSel
                          ? 'bg-brand-50 text-brand-700 border border-brand-200'
                          : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {m}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Done Button */}
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="w-full py-2 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            Apply Time
          </button>
        </div>
      )}
    </div>
  );
};
