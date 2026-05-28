import { useState } from 'react';
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

export default function DividendForm({ token, onSaved }) {
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

    const payload = {
      ticker: formData.ticker.trim().toUpperCase(),
      amount: Number(formData.amount),
      currency: formData.currency,
      exDate: formData.exDate || null,
      payDate: formData.payDate || null,
      frequency: formData.frequency || null,
    };

    setSaving(true);

    try {
      if (token) {
        try {
          await apiRequest('/api/dividends', { 
            method: 'POST', 
            body: payload, 
            token 
          });
        } catch (apiError) {
          console.warn('API save failed, saving locally instead');
          saveToLocal(payload);
        }
      } else {
        saveToLocal(payload);
      }

      onSaved?.();
      
      // Reset form
      setFormData({
        ticker: '',
        amount: '',
        currency: 'INR',
        exDate: '',
        payDate: '',
        frequency: ''
      });
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
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Add Dividend</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">Manual entry for tracking</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="rounded-lg bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 p-3 text-sm text-red-700 dark:text-red-300">
            {error}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">
            Ticker Symbol
          </label>
          <input
            type="text"
            value={formData.ticker}
            onChange={handleChange('ticker')}
            placeholder="e.g. RELIANCE, TCS, AAPL"
            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">
              Amount (per share)
            </label>
            <input
              type="number"
              step="0.01"
              value={formData.amount}
              onChange={handleChange('amount')}
              placeholder="0.00"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">
              Currency
            </label>
            <select
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
            <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">
              Ex-Date
            </label>
            <input
              type="date"
              value={formData.exDate}
              onChange={handleChange('exDate')}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">
              Pay Date
            </label>
            <input
              type="date"
              value={formData.payDate}
              onChange={handleChange('payDate')}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">
            Frequency
          </label>
          <select
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
            {saving ? 'Saving...' : 'Add to Calendar'}
          </button>

          <button
            type="button"
            onClick={() => {
              setFormData({ ticker: '', amount: '', currency: 'INR', exDate: '', payDate: '', frequency: '' });
              setError('');
            }}
            className="px-6 py-3.5 border border-slate-300 dark:border-slate-700 rounded-2xl text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            Clear
          </button>
        </div>
      </form>
    </div>
  );
}