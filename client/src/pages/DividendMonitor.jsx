import { useState, useCallback } from 'react';
import DividendTable from '../components/DividendTable.jsx';
import DividendForm from '../components/DividendForm.jsx';
import { CalendarClock, PiggyBank } from 'lucide-react';

const DAY_OPTIONS = [
  { value: 30, label: 'Next 30 days' },
  { value: 60, label: 'Next 60 days' },
  { value: 90, label: 'Next 90 days' },
];

export default function DividendMonitor({ auth }) {
  const { token } = auth || {};
  const [refresh, setRefresh] = useState(0);
  const [days, setDays] = useState(90);

  const onSaved = useCallback(() => {
    setRefresh((r) => r + 1);
  }, []);

  const bumpRefresh = useCallback(() => {
    setRefresh((r) => r + 1);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 pb-12">
      <div className="max-w-6xl mx-auto px-5 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Hero Header */}
        <div className="relative overflow-hidden rounded-3xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-8 shadow-xl">
          <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-cyan-400/10 dark:bg-cyan-500/10 blur-3xl pointer-events-none" />
          <div className="absolute -left-20 bottom-0 h-52 w-52 rounded-full bg-indigo-400/10 dark:bg-indigo-500/10 blur-3xl pointer-events-none" />

          <div className="relative flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8">
            <div className="min-w-0">
              <div className="inline-flex items-center gap-2 text-cyan-600 dark:text-cyan-400 text-xs font-semibold tracking-widest mb-3">
                INCOME TRACKER
              </div>
              
              <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-slate-900 dark:text-white">
                Dividend Monitor
              </h1>
              
              <p className="mt-4 max-w-2xl text-slate-600 dark:text-slate-300 leading-relaxed">
                Stay ahead of ex-dates and upcoming payouts. Track dividends manually or let connected brokers feed the data automatically.
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <div className="inline-flex items-center gap-2 rounded-2xl bg-slate-100 dark:bg-slate-800 px-4 py-2 text-sm text-slate-700 dark:text-slate-300">
                  <CalendarClock className="w-4 h-4 text-cyan-600" />
                  Ex-date tracking
                </div>
                <div className="inline-flex items-center gap-2 rounded-2xl bg-slate-100 dark:bg-slate-800 px-4 py-2 text-sm text-slate-700 dark:text-slate-300">
                  <PiggyBank className="w-4 h-4 text-emerald-600" />
                  Estimated income
                </div>
              </div>
            </div>

            {/* Period Selector */}
            <div className="shrink-0">
              <label className="block text-xs font-semibold uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-2">
                Look ahead
              </label>
              <select
                value={days}
                onChange={(e) => {
                  setDays(Number(e.target.value));
                  bumpRefresh();
                }}
                className="w-full sm:w-52 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-5 py-3 text-sm font-medium focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500 outline-none transition"
              >
                {DAY_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
          {/* Dividend Table */}
          <div className="lg:col-span-8 rounded-3xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-6 shadow">
            <DividendTable 
              token={token} 
              days={days} 
              refreshKey={refresh} 
            />
          </div>

          {/* Add Dividend Sidebar */}
          <div className="lg:col-span-4">
            <div className="lg:sticky lg:top-8 rounded-3xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-6 shadow">
              <DividendForm 
                token={token} 
                onSaved={onSaved} 
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}