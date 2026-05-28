import { useState, useEffect, useMemo, useCallback } from 'react';
import { apiRequest } from '../api/client.js';
import { 
  ArrowDownRight, 
  Calendar, 
  Coins, 
  Loader2, 
  RefreshCw, 
  Trash2, 
  TrendingUp, 
  Wallet 
} from 'lucide-react';

function loadDividends() {
  try {
    const raw = localStorage.getItem('dividends') || '[]';
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function formatAmount(amount, currency = 'INR') {
  const num = Number(amount) || 0;
  if (currency === 'INR') {
    return `₹${num.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
  }
  return `${num.toFixed(2)} ${currency}`;
}

function getExDateTimestamp(dividend) {
  if (!dividend.exDate) return null;
  const timestamp = new Date(dividend.exDate).getTime();
  return isNaN(timestamp) ? null : timestamp;
}

export default function DividendTable({ token, days = 90, refreshKey = 0 }) {
  const [dividends, setDividends] = useState(loadDividends);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchDividends = useCallback(async () => {
    if (!token) {
      setDividends(loadDividends());
      return;
    }

    setLoading(true);
    setError('');

    try {
      const data = await apiRequest(`/api/dividends?days=${days}`, { token });
      setDividends(Array.isArray(data) ? data : []);
    } catch (err) {
      console.warn('Failed to fetch dividends from server, using local data');
      setDividends(loadDividends());
    } finally {
      setLoading(false);
    }
  }, [token, days]);

  // Refresh when token, days, or refreshKey changes
  useEffect(() => {
    fetchDividends();
  }, [fetchDividends, refreshKey]);

  // Listen for localStorage changes (when adding manually as guest)
  useEffect(() => {
    const handleStorageChange = () => {
      if (!token) setDividends(loadDividends());
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [token]);

  // Upcoming dividends in next 30 days
  const upcoming30 = useMemo(() => {
    const now = Date.now();
    const thirtyDaysLater = now + 30 * 24 * 60 * 60 * 1000;

    return dividends.filter(d => {
      const exTime = getExDateTimestamp(d);
      return exTime && exTime >= now && exTime <= thirtyDaysLater;
    });
  }, [dividends]);

  // Next upcoming ex-date
  const nextExDate = useMemo(() => {
    return dividends
      .filter(d => getExDateTimestamp(d))
      .sort((a, b) => getExDateTimestamp(a) - getExDateTimestamp(b))[0];
  }, [dividends]);

  // Sorted list for display
  const sortedDividends = useMemo(() => {
    return [...dividends].sort((a, b) => {
      const timeA = getExDateTimestamp(a) || 0;
      const timeB = getExDateTimestamp(b) || 0;
      return timeA - timeB;
    });
  }, [dividends]);

  const removeDividend = async (id) => {
    if (!id) return;

    try {
      if (token) {
        try {
          await apiRequest(`/api/dividends/${id}`, { method: 'DELETE', token });
        } catch (err) {
          console.warn('API delete failed, removing locally');
        }
      }

      const updated = dividends.filter(d => d.id !== id);
      setDividends(updated);
      
      if (!token) {
        localStorage.setItem('dividends', JSON.stringify(updated));
      }
    } catch (err) {
      console.error('Failed to remove dividend:', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-5">
          <div className="flex items-center gap-3">
            <Calendar className="w-8 h-8 text-cyan-600" />
            <div>
              <p className="text-xs uppercase tracking-widest text-slate-500">Next Ex-Date</p>
              <p className="text-lg font-semibold text-slate-900 dark:text-white mt-1">
                {nextExDate ? nextExDate.ticker : '—'}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-5">
          <div className="flex items-center gap-3">
            <TrendingUp className="w-8 h-8 text-emerald-600" />
            <div>
              <p className="text-xs uppercase tracking-widest text-slate-500">Events (30 days)</p>
              <p className="text-lg font-semibold text-slate-900 dark:text-white mt-1">
                {upcoming30.length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-5">
          <div className="flex items-center gap-3">
            <Wallet className="w-8 h-8 text-amber-600" />
            <div>
              <p className="text-xs uppercase tracking-widest text-slate-500">Est. Payouts (30d)</p>
              <p className="text-lg font-semibold text-slate-900 dark:text-white mt-1">
                {upcoming30.length > 0 ? 'Calculated' : '0'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-xl font-semibold text-slate-900 dark:text-white">Dividend Calendar</h3>
          <p className="text-sm text-slate-500">Showing next {days} days</p>
        </div>

        <button
          onClick={() => fetchDividends()}
          disabled={loading}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Table / Cards */}
      {sortedDividends.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-slate-300 dark:border-slate-700 rounded-2xl">
          <Coins className="mx-auto w-12 h-12 text-slate-300 dark:text-slate-600" />
          <p className="mt-4 font-medium text-slate-900 dark:text-white">No dividends recorded yet</p>
          <p className="text-sm text-slate-500 mt-1">Add your first dividend using the form on the left</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-700">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                <th className="text-left py-4 px-6 font-medium text-slate-600 dark:text-slate-400">Ticker</th>
                <th className="text-left py-4 px-6 font-medium text-slate-600 dark:text-slate-400">Amount</th>
                <th className="text-left py-4 px-6 font-medium text-slate-600 dark:text-slate-400">Ex-Date</th>
                <th className="text-left py-4 px-6 font-medium text-slate-600 dark:text-slate-400">Pay-Date</th>
                <th className="text-left py-4 px-6 font-medium text-slate-600 dark:text-slate-400">Frequency</th>
                <th className="w-20"></th>
              </tr>
            </thead>
            <tbody>
              {sortedDividends.map((div) => (
                <tr key={div.id} className="border-b border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <td className="px-6 py-4 font-medium">{div.ticker}</td>
                  <td className="px-6 py-4 font-mono">{formatAmount(div.amount, div.currency)}</td>
                  <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
                    {div.exDate ? new Date(div.exDate).toLocaleDateString('en-IN') : '—'}
                  </td>
                  <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
                    {div.payDate ? new Date(div.payDate).toLocaleDateString('en-IN') : '—'}
                  </td>
                  <td className="px-6 py-4 text-slate-500">{div.frequency || '—'}</td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => removeDividend(div.id)}
                      className="text-red-500 hover:text-red-600 p-2 hover:bg-red-50 rounded-lg transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <p className="text-xs text-slate-500 flex items-start gap-2">
        <ArrowDownRight className="w-4 h-4 mt-0.5" />
        Amounts shown are per share. Multiply by your holdings to estimate total payout.
      </p>
    </div>
  );
}