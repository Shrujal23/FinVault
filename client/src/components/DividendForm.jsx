import { useState } from 'react';
import { apiRequest } from '../api/client.js';
import { PlusCircle, Loader2 } from 'lucide-react';

function saveLocal(div) {
  try {
    const raw = localStorage.getItem('dividends') || '[]';
    const arr = JSON.parse(raw);
    arr.unshift(div);
    localStorage.setItem('dividends', JSON.stringify(arr));
  } catch (e) {
    console.error(e);
  }
}

export default function DividendForm({ token, onSaved }) {
  const [ticker, setTicker] = useState('');
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState('INR');
  const [exDate, setExDate] = useState('');
  const [payDate, setPayDate] = useState('');
  const [frequency, setFrequency] = useState('');
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    setFormError('');
    if (!ticker?.trim()) {
      setFormError('Enter a ticker symbol.');
      return;
    }
    if (amount === '' || Number.isNaN(Number(amount))) {
      setFormError('Enter a valid amount.');
      return;
    }

    const payload = {
      ticker: ticker.trim().toUpperCase(),
      amount: Number(amount),
      currency,
      exDate: exDate || null,
      payDate: payDate || null,
      frequency: frequency || null,
    };

    if (token) {
      setSaving(true);
      try {
        try {
          await apiRequest('/api/dividends', { method: 'POST', body: payload, token });
        } catch {
          saveLocal({ id: `${payload.ticker}-${Date.now()}`, ...payload });
        }
        onSaved?.();
      } finally {
        setSaving(false);
      }
    } else {
      saveLocal({ id: `${payload.ticker}-${Date.now()}`, ...payload });
      onSaved?.();
    }

    setTicker('');
    setAmount('');
    setCurrency('INR');
    setExDate('');
    setPayDate('');
    setFrequency('');
  };

  const inputClass =
    'w-full mt-1.5 px-3 py-2.5 rounded-xl border bg-white dark:bg-slate-950 placeholder-slate-400 text-slate-900 dark:text-slate-100 border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500 outline-none transition';
  const labelClass = 'block text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400';

  return (
    <div id="add-dividend-panel" className="scroll-mt-24">
      <div className="mb-5 flex items-center gap-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-500/20 to-indigo-500/20 text-cyan-700 dark:text-cyan-400">
          <PlusCircle className="w-5 h-5" />
        </div>
        <div>
          <h2 className="font-bold text-slate-900 dark:text-white">Add dividend</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">Manual row for tracking (per-share amount)</p>
        </div>
      </div>

      <form onSubmit={submit} className="space-y-4">
        {formError && (
          <div className="rounded-lg border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/30 px-3 py-2 text-sm text-red-800 dark:text-red-300">
            {formError}
          </div>
        )}

        <div>
          <label className={labelClass}>Ticker</label>
          <input
            value={ticker}
            onChange={(e) => setTicker(e.target.value)}
            className={inputClass}
            placeholder="e.g. RELIANCE, AAPL"
            autoComplete="off"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>Amount</label>
            <input
              type="text"
              inputMode="decimal"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className={inputClass}
              placeholder="0.00"
            />
          </div>
          <div>
            <label className={labelClass}>Currency</label>
            <select value={currency} onChange={(e) => setCurrency(e.target.value)} className={inputClass}>
              <option value="INR">INR</option>
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>Ex date</label>
            <input type="date" value={exDate} onChange={(e) => setExDate(e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Pay date</label>
            <input type="date" value={payDate} onChange={(e) => setPayDate(e.target.value)} className={inputClass} />
          </div>
        </div>

        <div>
          <label className={labelClass}>Frequency</label>
          <select value={frequency} onChange={(e) => setFrequency(e.target.value)} className={inputClass}>
            <option value="">Select…</option>
            <option value="Monthly">Monthly</option>
            <option value="Quarterly">Quarterly</option>
            <option value="Semi-annual">Semi-annual</option>
            <option value="Annual">Annual</option>
            <option value="Special">Special</option>
          </select>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center pt-1">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 px-4 py-3 text-sm font-semibold text-white hover:from-cyan-500 hover:to-blue-500 disabled:opacity-60"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <PlusCircle className="w-4 h-4" />}
            {saving ? 'Saving…' : 'Add to calendar'}
          </button>
          <button
            type="button"
            onClick={() => {
              setTicker('');
              setAmount('');
              setCurrency('INR');
              setExDate('');
              setPayDate('');
              setFrequency('');
              setFormError('');
            }}
            className="rounded-xl border border-slate-200 dark:border-slate-700 px-4 py-3 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            Clear
          </button>
        </div>
      </form>
    </div>
  );
}
