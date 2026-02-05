import { useEffect, useState, useMemo } from 'react';

function loadDividends() {
  try {
    const raw = localStorage.getItem('dividends') || '[]';
    return JSON.parse(raw);
  } catch (e) {
    return [];
  }
}

export default function DividendTable({ token }) {
  const [dividends, setDividends] = useState(() => loadDividends());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const onStorage = () => setDividends(loadDividends());
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      if (!token) {
        setDividends(loadDividends());
        return;
      }

      setLoading(true);
      try {
        const res = await fetch(`/api/dividends?days=90`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setDividends(data || []);
        } else {
          setDividends(loadDividends());
        }
      } catch (e) {
        setDividends(loadDividends());
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [token]);

  const remove = async (id) => {
    if (token) {
      try {
        const res = await fetch(`/api/dividends/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
        if (res.ok || res.status === 204) {
          setDividends(dividends.filter(d => d.id !== id));
        }
      } catch (e) {
        console.warn(e);
      }
    } else {
      const next = dividends.filter(d => d.id !== id);
      setDividends(next);
      localStorage.setItem('dividends', JSON.stringify(next));
    }
  };

  const upcoming30 = useMemo(() => {
    const now = Date.now();
    const limit = now + 30 * 24 * 60 * 60 * 1000;
    return dividends.filter(d => d.exDate && new Date(d.exDate).getTime() >= now && new Date(d.exDate).getTime() <= limit);
  }, [dividends]);

  const totalUpcoming = useMemo(() => upcoming30.reduce((s, d) => s + (Number(d.amount) || 0), 0), [upcoming30]);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold">Upcoming dividends (30 days)</h3>
          <p className="text-sm text-slate-500">Total estimated payout: <span className="font-medium">{totalUpcoming.toFixed(2)}</span></p>
        </div>
        {loading && <div className="text-sm text-slate-500">Fetching...</div>}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm table-auto">
          <thead>
            <tr className="text-left text-slate-600 dark:text-slate-300">
              <th className="px-3 py-2">Ticker</th>
              <th className="px-3 py-2">Amount</th>
              <th className="px-3 py-2">Ex Date</th>
              <th className="px-3 py-2">Pay Date</th>
              <th className="px-3 py-2">Freq</th>
              <th className="px-3 py-2">Source</th>
              <th className="px-3 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {dividends.length === 0 && (
              <tr><td colSpan={7} className="p-4 text-center text-slate-500">No dividends tracked yet.</td></tr>
            )}
            {dividends.map(d => (
              <tr key={d.id || `${d.ticker}-${d.exDate || d.fetchedAt}`} className="border-t border-slate-100 dark:border-slate-800">
                <td className="px-3 py-2 font-medium">{d.ticker}</td>
                <td className="px-3 py-2">{(Number(d.amount) || 0).toFixed(2)} {d.currency || ''}</td>
                <td className="px-3 py-2">{d.exDate ? new Date(d.exDate).toLocaleDateString() : '-'}</td>
                <td className="px-3 py-2">{d.payDate ? new Date(d.payDate).toLocaleDateString() : '-'}</td>
                <td className="px-3 py-2">{d.frequency || '-'}</td>
                <td className="px-3 py-2">{d.source || '-'}</td>
                <td className="px-3 py-2">
                  <button onClick={() => remove(d.id)} className="px-3 py-1 rounded-md bg-red-50 text-red-600 text-sm">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
