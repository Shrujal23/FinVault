import { useEffect, useState } from 'react';
import { apiRequest } from '../api/client.js';
import { PlusCircle, Loader2 } from 'lucide-react';

function saveToLocal(dividend) {
  try {
    const existing = localStorage.getItem('dividends') || '[]';
    const dividends = JSON.parse(existing);
    dividends.unshift({
      id: `${dividend.ticker}-${Date.now()}`,
      ...dividend,
      createdAt: new Date().toISOString()
    });
    localStorage.setItem('dividends', JSON.stringify(dividends));
  } catch (err) {
    console.error('Failed to save dividend locally:', err);
  }
}

const emptyForm = {
  ticker: '', amount: '', currency: 'INR', exDate: '', payDate: '', frequency: ''
};

function toDateInput(value) {
  return value ? String(value).slice(0, 10) : '';
}

export default function DividendForm({ token, onSaved, editingDividend, onCancelEdit }) {
  const [formData, setFormData] = useState({
    ticker: '',
    amount: '',
    currency: 'INR',
    exDate: '',
    payDate: '',
    frequency: ''
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const isEditing = Boolean(editingDividend?.id);

  useEffect(() => {
    if (!editingDividend) {
      setFormData(emptyForm);
      return;
    }
    setFormData({
      ticker: editingDividend.ticker || '',
      amount: editingDividend.amount ?? '',
      currency: editingDividend.currency || 'INR',
      exDate: toDateInput(editingDividend.exDate),
      payDate: toDateInput(editingDividend.payDate),
      frequency: editingDividend.frequency || ''
    });
    setError('');
  }, [editingDividend]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.ticker.trim()) {
      setError('Please enter a ticker symbol');
      return;
    }
    if (!formData.amount || isNaN(Number(formData.amount))) {
      setError('Please enter a valid amount');
      return;
    }

    const toIso = (d) => {
      if (!d) return null;
      // If a time component already present, assume it's ISO-like and send as-is.
      if (d.includes('T')) return d;
      // Treat plain date inputs as UTC midnight to create an ISO instant.
      return `${d}T00:00:00Z`;
    };

    const payload = {
      ticker: formData.ticker.trim().toUpperCase(),
      amount: Number(formData.amount),
      currency: formData.currency,
      exDate: toIso(formData.exDate),
      payDate: toIso(formData.payDate),
      frequency: formData.frequency || null,
    };

    setSaving(true);

    try {
      if (token) {
        await apiRequest(isEditing ? `/api/dividends/${editingDividend.id}` : '/api/dividends', {
          method: isEditing ? 'PUT' : 'POST',
          body: payload,
          token
        });
      } else {
        if (isEditing) {
          const current = JSON.parse(localStorage.getItem('dividends') || '[]');
          const updated = current.map((dividend) => (
            dividend.id === editingDividend.id ? { ...dividend, ...payload } : dividend
          ));
          localStorage.setItem('dividends', JSON.stringify(updated));
        } else {
          saveToLocal(payload);
        }
      }

      onSaved?.();
      
      // Reset form
      setFormData(emptyForm);
    } catch (err) {
      setError('Failed to save dividend. Please try again.');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field) => (e) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
  };

  return (
    <div id="add-dividend-panel" className="scroll-mt-24">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-100 dark:bg-cyan-900/50 text-cyan-600 dark:text-cyan-400">
          <PlusCircle className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white">{isEditing ? 'Edit Dividend' : 'Add Dividend'}</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">{isEditing ? 'Update this calendar entry' : 'Manual entry for tracking'}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div role="alert" className="rounded-lg bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 p-3 text-sm text-red-700 dark:text-red-300">
            {error}
          </div>
        )}

        <div>
          <label htmlFor="dividend-ticker" className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">
            Ticker symbol <span className="text-rose-600">*</span>
          </label>
          <input
            id="dividend-ticker"
            type="text"
            value={formData.ticker}
            onChange={handleChange('ticker')}
            placeholder="e.g. RELIANCE, TCS, AAPL"
            required
            autoCapitalize="characters"
            aria-invalid={Boolean(error && !formData.ticker.trim())}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-500"
          />
          <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">Use the market symbol you track in your portfolio.</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="dividend-amount" className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">
              Amount per share <span className="text-rose-600">*</span>
            </label>
            <input
              id="dividend-amount"
              type="number"
              min="0.01"
              step="0.01"
              value={formData.amount}
              onChange={handleChange('amount')}
              placeholder="0.00"
              required
              aria-invalid={Boolean(error && !formData.amount)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
          </div>

          <div>
            <label htmlFor="dividend-currency" className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">
              Currency
            </label>
            <select
              id="dividend-currency"
              value={formData.currency}
              onChange={handleChange('currency')}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            >
              <option value="INR">INR</option>
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="dividend-ex-date" className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">
              Ex-Date
            </label>
            <input
              id="dividend-ex-date"
              type="date"
              value={formData.exDate}
              onChange={handleChange('exDate')}
              required
              aria-invalid={Boolean(error && !formData.exDate)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
          </div>

          <div>
            <label htmlFor="dividend-pay-date" className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">
              Pay Date
            </label>
            <input
              id="dividend-pay-date"
              type="date"
              value={formData.payDate}
              onChange={handleChange('payDate')}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
          </div>
        </div>

        <div>
          <label htmlFor="dividend-frequency" className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">
            Frequency
          </label>
          <select
            id="dividend-frequency"
            value={formData.frequency}
            onChange={handleChange('frequency')}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-500"
          >
            <option value="">Select Frequency</option>
            <option value="Monthly">Monthly</option>
            <option value="Quarterly">Quarterly</option>
            <option value="Semi-annual">Semi-annual</option>
            <option value="Annual">Annual</option>
            <option value="Special">Special</option>
          </select>
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="flex-1 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-medium py-3.5 rounded-2xl flex items-center justify-center gap-2 transition-all disabled:opacity-70"
          >
            {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <PlusCircle className="w-5 h-5" />}
            {saving ? 'Saving...' : isEditing ? 'Save changes' : 'Add to Calendar'}
          </button>

          <button
            type="button"
            onClick={() => {
              setFormData(emptyForm);
              setError('');
              if (isEditing) onCancelEdit?.();
            }}
            className="px-6 py-3.5 border border-slate-300 dark:border-slate-700 rounded-2xl text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            {isEditing ? 'Cancel' : 'Clear'}
          </button>
        </div>
      </form>
    </div>
  );
}
