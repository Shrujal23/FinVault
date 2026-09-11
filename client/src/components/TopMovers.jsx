import React from 'react';

export default function TopMovers() {
  const movers = [
    { symbol: 'RELIANCE', note: 'Strong volume' },
    { symbol: 'TCS', note: 'Earnings beat' },
    { symbol: 'HDFCBANK', note: 'Buyback announced' },
  ];

  return (
    <div className="bg-white/95 dark:bg-slate-900/95 rounded-xl shadow-sm border border-slate-200/80 dark:border-slate-800 p-4">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center text-indigo-600">M</div>
        <h3 className="text-lg font-semibold text-slate-800 dark:text-white">Top Movers</h3>
      </div>
      <ul className="text-sm text-slate-700 dark:text-slate-300 space-y-2">
        {movers.map((m) => (
          <li key={m.symbol} className="flex items-center justify-between">
            <span className="font-medium">{m.symbol}</span>
            <span className="text-xs text-slate-500">{m.note}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
