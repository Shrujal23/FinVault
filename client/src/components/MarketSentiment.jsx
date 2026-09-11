import React, { useEffect, useState } from 'react';
import { apiRequest } from '../api/client';

export default function MarketSentiment() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let aborted = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const resp = await apiRequest('/api/sentiment');
        if (aborted) return;
        setData(resp);
      } catch (e) {
        if (e?.name === 'AbortError') return;
        setError(e.message || String(e));
      } finally {
        if (!aborted) setLoading(false);
      }
    }
    load();
    return () => { aborted = true; };
  }, []);

  const renderBody = () => {
    if (loading) return <div className="text-sm text-slate-500">Loading...</div>;
    if (error) return <div className="text-sm text-rose-600">{error}</div>;
    if (!data) return <div className="text-sm text-slate-500">No data</div>;

    const score = typeof data.score === 'number' ? Math.round(data.score * 100) : 0;
    const label = score > 10 ? 'Bullish' : score < -10 ? 'Bearish' : 'Neutral';
    const isFallback = data.source === 'fallback';

    return (
      <div className="mt-3">
        <div className="flex items-baseline gap-3">
          <div className="text-2xl font-semibold text-slate-800 dark:text-white">{score}%</div>
          <div className="text-sm text-slate-500">{label}</div>
        </div>
        <div className="mt-2 text-xs text-slate-600 dark:text-slate-300">Positive: {data.positive} • Negative: {data.negative} • Neutral: {data.neutral}</div>
        <div className="mt-3">
          <details className="text-xs text-slate-500">
            <summary className="cursor-pointer">Recent headlines{isFallback ? ' (sample)' : ''}</summary>
            <ul className="mt-2 list-disc pl-5">
              {Array.isArray(data.details) && data.details.slice(0,5).map((d, i) => (
                <li key={i}><a className="text-sky-600 hover:underline" href={d.url || '#'} target="_blank" rel="noreferrer">{d.title}</a> — {Math.round((d.score||0)*100)}%</li>
              ))}
            </ul>
          </details>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white/95 dark:bg-slate-900/95 rounded-xl shadow-sm border border-slate-200/80 dark:border-slate-800 p-4">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-900 flex items-center justify-center text-amber-600">S</div>
        <h3 className="text-lg font-semibold text-slate-800 dark:text-white">Market Sentiment</h3>
      </div>
      <p className="text-sm text-slate-600 dark:text-slate-300">Overall sentiment based on recent financial-market headlines.</p>
      {renderBody()}
    </div>
  );
}
