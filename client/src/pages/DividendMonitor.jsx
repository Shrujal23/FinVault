import { useEffect, useState, useMemo } from 'react';
import DividendTable from '../components/DividendTable.jsx';
import DividendForm from '../components/DividendForm.jsx';

export default function DividendMonitor({ auth }) {
  const { token } = auth || {};
  const [refresh, setRefresh] = useState(0);

  const onSaved = () => setRefresh(r => r + 1);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 pb-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Dividend Monitor</h1>
            <p className="text-sm text-slate-600 dark:text-slate-400">Track upcoming ex-dates, estimated payouts, and portfolio dividend income.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-lg p-6 border border-slate-200 dark:border-slate-800">
            <DividendTable key={refresh} token={token} />
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-lg p-6 border border-slate-200 dark:border-slate-800">
            <h2 className="font-semibold mb-3">Add Dividend</h2>
            <DividendForm token={token} onSaved={onSaved} />
          </div>
        </div>
      </div>
    </div>
  );
}
