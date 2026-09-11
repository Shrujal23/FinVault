import { useState, useCallback, useRef } from 'react';
import DividendTable from '../components/DividendTable.jsx';
import DividendForm from '../components/DividendForm.jsx';
import { CalendarClock, PiggyBank, PlusCircle } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

const DAY_OPTIONS = [
  { value: 30, label: 'Next 30 days' },
  { value: 60, label: 'Next 60 days' },
  { value: 90, label: 'Next 90 days' },
];

export default function DividendMonitor() {
  const auth = useAuth();
  const { token } = auth;
  const [refresh, setRefresh] = useState(0);
  const [days, setDays] = useState(90);
  const [editingDividend, setEditingDividend] = useState(null);
  const addDividendRef = useRef(null);

  const onSaved = useCallback(() => {
    setRefresh((r) => r + 1);
  }, []);

  const bumpRefresh = useCallback(() => {
    setRefresh((r) => r + 1);
  }, []);

  const scrollToAddDividend = useCallback(() => {
    addDividendRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  const editDividend = useCallback((dividend) => {
    setEditingDividend(dividend);
    addDividendRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  const handleSaved = useCallback(() => {
    setEditingDividend(null);
    onSaved();
  }, [onSaved]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-100 via-slate-50 to-blue-50 dark:from-slate-950 dark:via-slate-950 dark:to-slate-900 pb-12">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8">
        {/* Hero Header */}
        <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-slate-900/70 backdrop-blur-xl p-6 sm:p-8 shadow-lg shadow-slate-200/40 dark:shadow-black/20">
          <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-cyan-400/10 dark:bg-cyan-500/10 blur-3xl pointer-events-none" />
          <div className="absolute -left-16 -bottom-20 h-56 w-56 rounded-full bg-indigo-400/10 dark:bg-indigo-500/10 blur-3xl pointer-events-none" />

          <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="min-w-0">
              <p className="text-xs uppercase tracking-[0.18em] text-cyan-700 dark:text-cyan-400 font-semibold">Income tracker</p>
              <h1 className="mt-1 text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
                Dividend Monitor
              </h1>
              <p className="mt-2 max-w-2xl text-slate-600 dark:text-slate-300 leading-relaxed">
                Keep upcoming ex-dates, payment dates, and per-share amounts in one clear view.
              </p>

              <div className="mt-5 flex flex-wrap gap-2">
                <div className="inline-flex items-center gap-2 rounded-lg bg-slate-100 dark:bg-slate-800 px-3 py-2 text-sm text-slate-700 dark:text-slate-300">
                  <CalendarClock className="w-4 h-4 text-cyan-600" />
                  Ex-date tracking
                </div>
                <div className="inline-flex items-center gap-2 rounded-lg bg-slate-100 dark:bg-slate-800 px-3 py-2 text-sm text-slate-700 dark:text-slate-300">
                  <PiggyBank className="w-4 h-4 text-emerald-600" />
                  Per-share income
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-3 shrink-0">
              <div>
                <label htmlFor="dividend-lookahead" className="block text-xs font-semibold uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-2">
                  Look ahead
                </label>
                <select
                  id="dividend-lookahead"
                  value={days}
                  onChange={(e) => {
                    setDays(Number(e.target.value));
                    bumpRefresh();
                  }}
                  className="w-full sm:w-48 rounded-lg border border-slate-200 dark:border-slate-700 bg-white/90 dark:bg-slate-800/90 px-4 py-2.5 text-sm font-medium focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500 outline-none transition"
                >
                  {DAY_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <button
                type="button"
                onClick={scrollToAddDividend}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:from-cyan-500 hover:to-blue-500"
              >
                <PlusCircle className="w-4 h-4" />
                Add dividend
              </button>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
          {/* Dividend Table */}
          <div className="lg:col-span-8 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 p-5 sm:p-6 shadow-sm">
            <DividendTable 
              token={token} 
              days={days} 
              refreshKey={refresh} 
              onEdit={editDividend}
            />
          </div>

          {/* Add Dividend Sidebar */}
          <div ref={addDividendRef} className="lg:col-span-4 scroll-mt-6">
            <div className="lg:sticky lg:top-8 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 p-5 sm:p-6 shadow-sm">
              <DividendForm 
                token={token} 
                onSaved={handleSaved}
                editingDividend={editingDividend}
                onCancelEdit={() => setEditingDividend(null)}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
