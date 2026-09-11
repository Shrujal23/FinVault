import { useCallback, useEffect, useMemo, useState } from 'react';
import { ArrowDown, ArrowDownRight, ArrowUp, Calendar, Pencil, RefreshCw, Search, Trash2, TrendingUp, Wallet } from 'lucide-react';
import { apiRequest } from '../api/client.js';
import EmptyState from './EmptyState.jsx';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table.jsx';

function loadDividends() {
  try {
    return JSON.parse(localStorage.getItem('dividends') || '[]');
  } catch {
    return [];
  }
}

function formatAmount(amount, currency = 'INR') {
  const value = Number(amount) || 0;
  return currency === 'INR'
    ? `₹${value.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`
    : `${value.toFixed(2)} ${currency}`;
}

function formatDate(value) {
  return value ? new Date(value).toLocaleDateString('en-IN') : '—';
}

function getExDateTimestamp(dividend) {
  const timestamp = new Date(dividend.exDate).getTime();
  return Number.isNaN(timestamp) ? null : timestamp;
}

export default function DividendTable({ token, days = 90, refreshKey = 0, onEdit }) {
  const [dividends, setDividends] = useState(loadDividends);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [query, setQuery] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'exDate', direction: 'asc' });

  const fetchDividends = useCallback(async () => {
    if (!token) {
      setDividends(loadDividends());
      return;
    }

    setLoading(true);
    setMessage('');
    try {
      const data = await apiRequest(`/api/dividends?days=${days}`, { token });
      setDividends(Array.isArray(data) ? data : []);
    } catch {
      setDividends(loadDividends());
      setMessage("We couldn't refresh the calendar. Showing any saved entries instead.");
    } finally {
      setLoading(false);
    }
  }, [token, days]);

  useEffect(() => {
    fetchDividends();
  }, [fetchDividends, refreshKey]);

  useEffect(() => {
    const handleStorageChange = () => {
      if (!token) setDividends(loadDividends());
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [token]);

  const upcoming30 = useMemo(() => {
    const now = Date.now();
    const cutoff = now + 30 * 24 * 60 * 60 * 1000;
    return dividends.filter((dividend) => {
      const exDate = getExDateTimestamp(dividend);
      return exDate && exDate >= now && exDate <= cutoff;
    });
  }, [dividends]);

  const nextExDate = useMemo(() => {
    const now = Date.now();
    return dividends
      .filter((dividend) => (getExDateTimestamp(dividend) || 0) >= now)
      .sort((a, b) => getExDateTimestamp(a) - getExDateTimestamp(b))[0];
  }, [dividends]);

  const payoutSummary = useMemo(() => {
    if (!upcoming30.length) return '—';
    const currencies = [...new Set(upcoming30.map((dividend) => dividend.currency || 'INR'))];
    if (currencies.length !== 1) return `${upcoming30.length} payouts`;
    const total = upcoming30.reduce((sum, dividend) => sum + (Number(dividend.amount) || 0), 0);
    return formatAmount(total, currencies[0]);
  }, [upcoming30]);

  const filteredDividends = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    const matching = normalized
      ? dividends.filter((dividend) => String(dividend.ticker || '').toLowerCase().includes(normalized))
      : dividends;
    const direction = sortConfig.direction === 'asc' ? 1 : -1;
    return [...matching].sort((a, b) => {
      if (sortConfig.key === 'amount') return direction * ((Number(a.amount) || 0) - (Number(b.amount) || 0));
      if (sortConfig.key === 'exDate' || sortConfig.key === 'payDate') {
        return direction * ((getExDateTimestamp({ exDate: a[sortConfig.key] }) || Infinity) - (getExDateTimestamp({ exDate: b[sortConfig.key] }) || Infinity));
      }
      return direction * String(a[sortConfig.key] || '').localeCompare(String(b[sortConfig.key] || ''));
    });
  }, [dividends, query, sortConfig]);

  const handleSort = (key) => {
    setSortConfig((current) => current.key === key
      ? { key, direction: current.direction === 'asc' ? 'desc' : 'asc' }
      : { key, direction: 'asc' });
  };

  const sortIcon = (key) => {
    if (sortConfig.key !== key) return <span className="ml-1 text-slate-400">↕</span>;
    return sortConfig.direction === 'asc'
      ? <ArrowUp className="ml-1 h-3.5 w-3.5" />
      : <ArrowDown className="ml-1 h-3.5 w-3.5" />;
  };

  const removeDividend = async (id, ticker) => {
    if (!id) return;
    setMessage('');
    try {
      if (token) {
        await apiRequest(`/api/dividends/${id}`, { method: 'DELETE', token });
      } else {
        const updated = dividends.filter((dividend) => dividend.id !== id);
        localStorage.setItem('dividends', JSON.stringify(updated));
      }
      setDividends((current) => current.filter((dividend) => dividend.id !== id));
    } catch {
      setMessage(`We couldn't delete ${ticker}. Please try again.`);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 p-5 shadow-sm">
          <div className="flex items-start gap-3">
            <Calendar className="mt-0.5 h-5 w-5 text-cyan-600" />
            <div>
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Next ex-date</p>
              <p className="mt-1 text-lg font-semibold text-slate-900 dark:text-white">{nextExDate?.ticker || 'No upcoming event'}</p>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{nextExDate ? formatDate(nextExDate.exDate) : 'Add an entry to start tracking.'}</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 p-5 shadow-sm">
          <div className="flex items-start gap-3">
            <TrendingUp className="mt-0.5 h-5 w-5 text-emerald-600" />
            <div>
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Upcoming events</p>
              <p className="mt-1 text-lg font-semibold text-slate-900 dark:text-white">{upcoming30.length}</p>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">In the next 30 days</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 p-5 shadow-sm">
          <div className="flex items-start gap-3">
            <Wallet className="mt-0.5 h-5 w-5 text-amber-600" />
            <div>
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Upcoming per share</p>
              <p className="mt-1 text-lg font-semibold text-slate-900 dark:text-white">{payoutSummary}</p>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Based on recorded dividends</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-xl font-semibold text-slate-900 dark:text-white">Dividend calendar</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">Showing entries with ex-dates in the next {days} days.</p>
        </div>
        <button
          type="button"
          onClick={fetchDividends}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      <div className="rounded-xl border border-slate-200/80 bg-white/90 px-3 py-2.5 shadow-sm dark:border-slate-800 dark:bg-slate-900/90">
        <div className="flex items-center gap-2 text-sm">
          <Search className="h-4 w-4 text-slate-400" />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Filter by ticker"
            aria-label="Filter dividends by ticker"
            className="w-full border-0 bg-transparent text-slate-700 outline-none placeholder:text-slate-400 dark:text-slate-200"
          />
        </div>
      </div>

      {message && <p role="status" className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-200">{message}</p>}

      {filteredDividends.length === 0 ? (
        <EmptyState
          preset="noDividends"
          size="md"
          description="Add your first dividend entry to start tracking ex-dates and upcoming per-share payments."
        />
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700">
          <div className="overflow-x-auto">
            <Table className="min-w-[680px]">
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="px-5 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400"><button type="button" onClick={() => handleSort('ticker')} className="flex items-center font-semibold text-slate-700 hover:text-slate-900 dark:text-slate-200 dark:hover:text-white">Ticker {sortIcon('ticker')}</button></TableHead>
                  <TableHead className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400"><button type="button" onClick={() => handleSort('amount')} className="ml-auto flex items-center font-semibold text-slate-700 hover:text-slate-900 dark:text-slate-200 dark:hover:text-white">Per share {sortIcon('amount')}</button></TableHead>
                  <TableHead className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400"><button type="button" onClick={() => handleSort('exDate')} className="ml-auto flex items-center font-semibold text-slate-700 hover:text-slate-900 dark:text-slate-200 dark:hover:text-white">Ex-date {sortIcon('exDate')}</button></TableHead>
                  <TableHead className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400"><button type="button" onClick={() => handleSort('payDate')} className="ml-auto flex items-center font-semibold text-slate-700 hover:text-slate-900 dark:text-slate-200 dark:hover:text-white">Payment date {sortIcon('payDate')}</button></TableHead>
                  <TableHead className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400"><button type="button" onClick={() => handleSort('frequency')} className="ml-auto flex items-center font-semibold text-slate-700 hover:text-slate-900 dark:text-slate-200 dark:hover:text-white">Frequency {sortIcon('frequency')}</button></TableHead>
                  <TableHead className="w-[92px] px-5 py-3 text-right text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDividends.map((dividend, index) => (
                  <TableRow key={dividend.id} className={`transition-colors hover:bg-slate-50/80 dark:hover:bg-slate-900/70 ${index % 2 === 1 ? 'bg-slate-50/40 dark:bg-slate-900/20' : 'bg-white dark:bg-transparent'}`}>
                    <TableCell className="px-5 py-3 font-semibold text-slate-800 dark:text-slate-100">{dividend.ticker}</TableCell>
                    <TableCell className="px-5 py-3 text-right font-mono text-slate-700 dark:text-slate-200">{formatAmount(dividend.amount, dividend.currency)}</TableCell>
                    <TableCell className="px-5 py-3 text-right text-slate-600 dark:text-slate-400">{formatDate(dividend.exDate)}</TableCell>
                    <TableCell className="px-5 py-3 text-right text-slate-600 dark:text-slate-400">{formatDate(dividend.payDate)}</TableCell>
                    <TableCell className="px-5 py-3 text-right text-slate-500 dark:text-slate-400">{dividend.frequency || '—'}</TableCell>
                    <TableCell className="px-5 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => onEdit?.(dividend)}
                        aria-label={`Edit dividend for ${dividend.ticker}`}
                        title="Edit dividend"
                        className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-cyan-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-cyan-300"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => removeDividend(dividend.id, dividend.ticker)}
                        aria-label={`Delete dividend for ${dividend.ticker}`}
                        title="Delete dividend"
                        className="rounded-lg p-2 text-rose-600 transition hover:bg-rose-50 hover:text-rose-700 dark:text-rose-400 dark:hover:bg-rose-950/40"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      <p className="flex items-start gap-2 text-xs text-slate-500 dark:text-slate-400">
        <ArrowDownRight className="mt-0.5 h-4 w-4 shrink-0" />
        Amounts are per share. Multiply by your holdings to estimate your total payment.
      </p>
    </div>
  );
}
