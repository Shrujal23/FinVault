import { useEffect, useState, useMemo, useCallback } from 'react';
import { apiRequest } from '../api/client.js';
import {
  ArrowDownRight,
  Calendar,
  Coins,
  Loader2,
  RefreshCw,
  Trash2,
  TrendingUp,
  Wallet,
} from 'lucide-react';

function loadDividends() {
  try {
    const raw = localStorage.getItem('dividends') || '[]';
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function formatAmount(amount, currency) {
  const n = Number(amount) || 0;
  const c = (currency || 'USD').toUpperCase();
  if (c === 'INR') {
    return `₹${n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
  return `${n.toFixed(2)} ${c}`;
}

function parseEx(d) {
  if (!d.exDate) return null;
  const t = new Date(d.exDate).getTime();
  return Number.isNaN(t) ? null : t;
}

export default function DividendTable({ token, days: daysProp = 90, refreshKey = 0 }) {
  const [dividends, setDividends] = useState(() => loadDividends());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState(null);

  const fetchData = useCallback(async () => {
    if (!token) {
      setDividends(loadDividends());
      setError('');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const data = await apiRequest(`/api/dividends?days=${daysProp}`, { token });
      setDividends(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e.message || 'Could not load dividends');
      setDividends(loadDividends());
    } finally {
      setLoading(false);
    }
  }, [token, daysProp]);

  useEffect(() => {
    fetchData();
  }, [fetchData, refreshKey]);

  useEffect(() => {
    const onStorage = () => {
      if (!token) setDividends(loadDividends());
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [token]);

  const upcoming30 = useMemo(() => {
    const now = Date.now();
    const limit30 = now + 30 * 24 * 60 * 60 * 1000;
    return dividends.filter((d) => {
      const t = parseEx(d);
      return t != null && t >= now && t <= limit30;
    });
  }, [dividends]);

  const totalUpcoming30 = useMemo(
    () => upcoming30.reduce((s, d) => s + (Number(d.amount) || 0), 0),
    [upcoming30]
  );

  const nextEx = useMemo(() => {
    const now = Date.now();
    let best = null;
    let bestT = Infinity;
    for (const d of dividends) {
      const t = parseEx(d);
      if (t != null && t >= now && t < bestT) {
        bestT = t;
        best = d;
      }
    }
    return best;
  }, [dividends]);

  const sorted = useMemo(() => {
    return [...dividends].sort((a, b) => {
      const ta = parseEx(a) ?? 0;
      const tb = parseEx(b) ?? 0;
      return ta - tb;
    });
  }, [dividends]);

  const remove = async (id) => {
    if (id == null) return;
    setDeletingId(id);
    try {
      if (token) {
        try {
          await apiRequest(`/api/dividends/${id}`, { method: 'DELETE', token });
          setDividends((prev) => prev.filter((d) => d.id !== id));
        } catch {
          /* local id fallthrough */
          const next = dividends.filter((d) => d.id !== id);
          setDividends(next);
          localStorage.setItem('dividends', JSON.stringify(next));
        }
      } else {
        const next = dividends.filter((d) => d.id !== id);
        setDividends(next);
        localStorage.setItem('dividends', JSON.stringify(next));
      }
    } finally {
      setDeletingId(null);
    }
  };

  const handleRefresh = () => {
    fetchData();
  };

  const statCard = (Icon, label, value, hint, tone = 'neutral') => {
    const tones = {
      neutral: 'from-slate-500/10 via-transparent to-cyan-500/10',
      cyan: 'from-cyan-500/15 to-indigo-500/10',
      emerald: 'from-emerald-500/15 to-teal-500/10',
    };
    return (
      <div
        className={`relative overflow-hidden rounded-xl border border-slate-200/80 dark:border-slate-700/80 bg-white/90 dark:bg-slate-900/80 p-4 shadow-sm`}
      >
        <div className={`absolute inset-0 bg-gradient-to-br ${tones[tone]} pointer-events-none`} />
        <div className="relative flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800 text-cyan-700 dark:text-cyan-400">
            <Icon className="w-5 h-5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">{label}</p>
            <p className="mt-1 font-mono text-lg font-bold text-slate-900 dark:text-white truncate">{value}</p>
            {hint && <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{hint}</p>}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-5">
      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {statCard(
          Calendar,
          'Next ex-date',
          nextEx?.ticker && nextEx?.exDate
            ? `${nextEx.ticker} · ${new Date(nextEx.exDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}`
            : '—',
          nextEx ? 'Earliest upcoming event in your list' : 'Add dividends to see your timeline',
          'cyan'
        )}
        {statCard(
          TrendingUp,
          'Events (30 days)',
          String(upcoming30.length),
          'Scheduled ex-dates in the rolling month',
          'neutral'
        )}
        {statCard(
          Wallet,
          'Est. payouts (30d)',
          upcoming30.length ? `${totalUpcoming30.toFixed(2)} (mixed CCY)` : '0',
          'Per-share amounts summed; convert for cross-border accuracy',
          'emerald'
        )}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">Dividend calendar</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Showing up to <span className="font-medium text-slate-700 dark:text-slate-300">{daysProp} days</span> ahead
            {token ? ' from your account' : ' (browser storage)'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {loading && (
            <span className="inline-flex items-center gap-2 text-sm text-slate-500">
              <Loader2 className="w-4 h-4 animate-spin" />
              Loading
            </span>
          )}
          <button
            type="button"
            onClick={handleRefresh}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-60"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-amber-200/80 dark:border-amber-900/50 bg-amber-50/90 dark:bg-amber-950/30 px-4 py-3 text-sm text-amber-900 dark:text-amber-200">
          {error}
        </div>
      )}

      {/* Desktop table */}
      <div className="hidden md:block overflow-x-auto rounded-xl border border-slate-200/80 dark:border-slate-800">
        <table className="w-full min-w-[720px] text-sm">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              <th className="px-4 py-3">Ticker</th>
              <th className="px-4 py-3">Amount</th>
              <th className="px-4 py-3">Ex date</th>
              <th className="px-4 py-3">Pay date</th>
              <th className="px-4 py-3">Freq</th>
              <th className="px-4 py-3">Source</th>
              <th className="px-4 py-3 w-24"> </th>
            </tr>
          </thead>
          <tbody>
            {sorted.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center">
                  <div className="mx-auto max-w-sm">
                    <Coins className="mx-auto h-10 w-10 text-slate-300 dark:text-slate-600" />
                    <p className="mt-3 font-medium text-slate-900 dark:text-white">No dividends yet</p>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                      Add a manual entry on the right, or connect data when your backend syncs feed symbols.
                    </p>
                    <a
                      href="#add-dividend-panel"
                      className="mt-4 inline-flex text-sm font-semibold text-cyan-600 dark:text-cyan-400 hover:underline"
                    >
                      Jump to add form →
                    </a>
                  </div>
                </td>
              </tr>
            )}
            {sorted.map((d) => (
              <tr
                key={d.id ?? `${d.ticker}-${d.exDate || d.fetchedAt}`}
                className="border-b border-slate-100 dark:border-slate-800/80 hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
              >
                <td className="px-4 py-3 font-semibold text-slate-900 dark:text-white">{d.ticker}</td>
                <td className="px-4 py-3 font-mono text-slate-800 dark:text-slate-200">
                  {formatAmount(d.amount, d.currency)}
                </td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                  {d.exDate ? new Date(d.exDate).toLocaleDateString('en-IN') : '—'}
                </td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                  {d.payDate ? new Date(d.payDate).toLocaleDateString('en-IN') : '—'}
                </td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{d.frequency || '—'}</td>
                <td className="px-4 py-3 text-slate-500 dark:text-slate-500 text-xs">{d.source || '—'}</td>
                <td className="px-4 py-3">
                  <button
                    type="button"
                    onClick={() => remove(d.id)}
                    disabled={deletingId === d.id}
                    aria-label={`Remove ${d.ticker}`}
                    className="inline-flex items-center gap-1 rounded-lg border border-red-200 dark:border-red-900/50 bg-red-50/80 dark:bg-red-950/30 px-2.5 py-1.5 text-xs font-medium text-red-700 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-950/50 disabled:opacity-50"
                  >
                    {deletingId === d.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                    Remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden space-y-3">
        {sorted.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/30 p-8 text-center">
            <Coins className="mx-auto h-10 w-10 text-slate-300 dark:text-slate-600" />
            <p className="mt-3 font-medium text-slate-900 dark:text-white">No dividends tracked</p>
            <a href="#add-dividend-panel" className="mt-2 inline-block text-sm font-semibold text-cyan-600 dark:text-cyan-400">
              Add your first entry
            </a>
          </div>
        ) : (
          sorted.map((d) => (
            <div
              key={d.id ?? `${d.ticker}-${d.exDate || d.fetchedAt}`}
              className="rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white/90 dark:bg-slate-900/60 p-4 shadow-sm"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-lg font-bold text-slate-900 dark:text-white">{d.ticker}</p>
                  <p className="mt-1 font-mono text-cyan-700 dark:text-cyan-400">{formatAmount(d.amount, d.currency)}</p>
                </div>
                <button
                  type="button"
                  onClick={() => remove(d.id)}
                  disabled={deletingId === d.id}
                  className="shrink-0 rounded-lg p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40"
                  aria-label="Remove"
                >
                  {deletingId === d.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                </button>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-slate-600 dark:text-slate-400">
                <div>
                  <span className="block text-[10px] uppercase tracking-wide text-slate-500">Ex</span>
                  {d.exDate ? new Date(d.exDate).toLocaleDateString('en-IN') : '—'}
                </div>
                <div>
                  <span className="block text-[10px] uppercase tracking-wide text-slate-500">Pay</span>
                  {d.payDate ? new Date(d.payDate).toLocaleDateString('en-IN') : '—'}
                </div>
                <div>
                  <span className="block text-[10px] uppercase tracking-wide text-slate-500">Freq</span>
                  {d.frequency || '—'}
                </div>
                <div>
                  <span className="block text-[10px] uppercase tracking-wide text-slate-500">Source</span>
                  {d.source || '—'}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <p className="text-xs text-slate-500 dark:text-slate-500 flex items-start gap-2">
        <ArrowDownRight className="w-4 h-4 shrink-0 mt-0.5 opacity-70" />
        Amounts are typically per share unless your source states otherwise. For a full portfolio dividend estimate, multiply by your holdings on the dashboard.
      </p>
    </div>
  );
}
