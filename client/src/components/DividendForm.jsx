import { useState } from 'react';

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
  const [currency, setCurrency] = useState('USD');
  const [exDate, setExDate] = useState('');
  const [payDate, setPayDate] = useState('');
  const [frequency, setFrequency] = useState('');
  const [saving, setSaving] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (!ticker || !amount) return;
    const payload = { ticker: ticker.toUpperCase(), amount: Number(amount), currency, exDate: exDate || null, payDate: payDate || null, frequency };

    if (token) {
      setSaving(true);
      try {
        const res = await fetch('/api/dividends', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify(payload),
        });
        if (res.ok) {
          onSaved?.();
        } else {
          // fallback to local
          saveLocal({ id: `${payload.ticker}-${Date.now()}`, ...payload });
          onSaved?.();
        }
      } catch (e) {
        saveLocal({ id: `${payload.ticker}-${Date.now()}`, ...payload });
        onSaved?.();
      } finally {
        setSaving(false);
      }
    } else {
      saveLocal({ id: `${payload.ticker}-${Date.now()}`, ...payload });
      onSaved?.();
    }

    setTicker(''); setAmount(''); setCurrency('USD'); setExDate(''); setPayDate(''); setFrequency('');
  };

  const inputClass = "w-full mt-1 px-3 py-2 rounded-md border bg-gray-50 dark:bg-slate-800 placeholder-slate-400 text-slate-900 dark:text-slate-100 border-slate-200 dark:border-slate-700";

  return (
    <form onSubmit={submit} className="space-y-3">
      <div>
        <label className="block text-sm text-slate-600">Ticker</label>
        <input value={ticker} onChange={e => setTicker(e.target.value)} className={inputClass} placeholder="AAPL" />
      </div>

      <div>
        <label className="block text-sm text-slate-600">Amount</label>
        <input value={amount} onChange={e => setAmount(e.target.value)} className={inputClass} placeholder="0.22" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm text-slate-600">Ex Date</label>
          <input type="date" value={exDate} onChange={e => setExDate(e.target.value)} className={inputClass} />
        </div>
        <div>
          <label className="block text-sm text-slate-600">Pay Date</label>
          <input type="date" value={payDate} onChange={e => setPayDate(e.target.value)} className={inputClass} />
        </div>
      </div>

      <div>
        <label className="block text-sm text-slate-600">Frequency</label>
        <input value={frequency} onChange={e => setFrequency(e.target.value)} className={inputClass} placeholder="Quarterly" />
      </div>

      <div className="flex items-center gap-3">
        <button type="submit" disabled={saving} className="px-4 py-2 bg-blue-600 text-white rounded-md">{saving ? 'Saving...' : 'Add'}</button>
        <button type="button" onClick={() => { setTicker(''); setAmount(''); setExDate(''); setPayDate(''); setFrequency(''); }} className="px-4 py-2 rounded-md border">Clear</button>
      </div>
    </form>
  );
}
