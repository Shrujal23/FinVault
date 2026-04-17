import { useState } from 'react';
import DividendTable from '../components/DividendTable.jsx';
import DividendForm from '../components/DividendForm.jsx';
import { CalendarClock, PiggyBank } from 'lucide-react';

const DAY_OPTIONS = [
  { value: 30, label: '30 days' },
  { value: 60, label: '60 days' },
  { value: 90, label: '90 days' },
];

export default function DividendMonitor({ auth }) {
  const { token } = auth || {};
  const [refresh, setRefresh] = useState(0);
  const [days, setDays] = useState(90);

  const onSaved = () => setRefresh((r) => r + 1);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-100 via-slate-50 to-cyan-50/40 dark:from-slate-950 dark:via-slate-950 dark:to-slate-900 pb-12">
      <div className="max-w-6xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8">
        {/* Hero */}
        <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white/85 dark:bg-slate-900/70 backdrop-blur-xl p-6 sm:p-8 shadow-lg shadow-slate-200/30 dark:shadow-black/20">
          <div className="absolute -right-20 -top-20 h-48 w-48 rounded-full bg-cyan-400/15 dark:bg-cyan-500/10 blur-3xl pointer-events-none" />
          <div className="absolute -left-16 bottom-0 h-40 w-40 rounded-full bg-indigo-400/15 dark:bg-indigo-500/10 blur-3xl pointer-events-none" />
          <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-700 dark:text-cyan-400">Income schedule</p>
              <h1 className="mt-2 text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white">
                Dividend <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 to-indigo-600">monitor</span>
              </h1>
              <p className="mt-2 max-w-2xl text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
                See upcoming ex-dates and estimated distributions. Log cash events manually or keep them in sync when your broker feed is connected.
              </p>
              <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-slate-500 dark:text-slate-400">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 dark:bg-slate-800 px-3 py-1">
                  <CalendarClock className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                  Ex-date aware list
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 dark:bg-slate-800 px-3 py-1">
                  <PiggyBank className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  Payout estimates (30d roll-up)
                </span>
              </div>
            </div>

            <div className="flex shrink-0 flex-col gap-2 sm:items-end">
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Fetch window</label>
              <select
                value={days}
                onChange={(e) => {
                  setDays(Number(e.target.value));
                  bumpRefresh();
                }}
                className="w-full sm:w-48 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-4 py-2.5 text-sm font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-cyan-500/30 outline-none"
              >
                {DAY_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-3 lg:items-start">
          <div className="lg:col-span-2 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white/95 dark:bg-slate-900/90 p-4 sm:p-6 shadow-sm min-w-0 overflow-hidden">
            <DividendTable token={token} days={days} refreshKey={refresh} />
          </div>

          <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white/95 dark:bg-slate-900/90 p-4 sm:p-6 shadow-sm lg:sticky lg:top-24 min-w-0">
            <DividendForm token={token} onSaved={onSaved} />
          </div>
        </div>
      </div>
    </div>
  );
}
