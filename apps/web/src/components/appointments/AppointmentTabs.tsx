import React from 'react';

export type TabKey = 'ALL' | 'UPCOMING' | 'RESCHEDULED' | 'COMPLETED' | 'CANCELLED';

interface AppointmentTabsProps {
  activeTab: TabKey;
  onTabChange: (tab: TabKey) => void;
  counts?: Partial<Record<TabKey, number>>;
}

const TABS: { key: TabKey; label: string }[] = [
  { key: 'ALL', label: 'All' },
  { key: 'UPCOMING', label: 'Upcoming' },
  { key: 'RESCHEDULED', label: 'Rescheduled' },
  { key: 'COMPLETED', label: 'Completed' },
  { key: 'CANCELLED', label: 'Cancelled' },
];

export const AppointmentTabs: React.FC<AppointmentTabsProps> = ({
  activeTab,
  onTabChange,
  counts,
}) => {
  return (
    <div className="border-b border-slate-200 overflow-x-auto no-scrollbar">
      <nav className="flex space-x-6 min-w-max px-1" aria-label="Appointment tabs">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.key;
          const count = counts?.[tab.key];

          return (
            <button
              key={tab.key}
              onClick={() => onTabChange(tab.key)}
              className={`py-3 px-1 border-b-2 font-medium text-sm transition-all flex items-center gap-2 whitespace-nowrap ${
                isActive
                  ? 'border-blue-600 text-blue-600 font-semibold'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
              }`}
            >
              <span>{tab.label}</span>
              {count !== undefined && (
                <span
                  className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                    isActive
                      ? 'bg-blue-50 text-blue-700'
                      : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
};
