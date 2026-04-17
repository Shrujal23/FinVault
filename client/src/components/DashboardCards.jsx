export default function DashboardCards({ total, invested, pnl, returnPct, previousNetWorth, compact = false }) {
  const netWorthChange = total - (previousNetWorth || 0);

  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 ${compact ? 'gap-2' : 'gap-4'} items-stretch`}>
      {/* Total Portfolio Value */}
      <Card title="Total Portfolio Value (INR)" compact={compact}>
        <div className="text-right truncate">₹ {formatNumber(total)}</div>
      </Card>

      {/* Invested (Cost) */}
      <Card title="Invested (Cost)" compact={compact}>
        <div className="text-right truncate">₹ {formatNumber(invested)}</div>
      </Card>

      {/* Unrealized P&L */}
      <Card title="Unrealized P&L" value={pnl} compact={compact}>
        <div className="text-right truncate">₹ {formatNumber(pnl)}</div>
      </Card>

      {/* Return % */}
      <Card title="Return %" value={returnPct} compact={compact}>
        <div className="text-right truncate">{formatNumber(returnPct)}%</div>
      </Card>

      {/* Net Worth */}
      <Card title="Net Worth (All Assets)" value={netWorthChange} compact={compact}>
        <div className="flex flex-col items-end min-w-0">
          <span className={`${compact ? 'text-sm' : ''} text-right truncate w-full`}>₹ {formatNumber(total)}</span>
          {!compact && previousNetWorth !== undefined && (
            <span className={`text-xs font-mono ${netWorthChange >= 0 ? 'text-emerald-700 dark:text-emerald-500' : 'text-red-700 dark:text-red-500'} flex items-center gap-1 truncate w-full justify-end`}>
              {netWorthChange >= 0 ? '▲' : '▼'} {formatNumber(Math.abs(netWorthChange))} from previous
            </span>
          )}
        </div>
      </Card>
    </div>
  );
}

/* -------------------------- */
/* Reusable Card Component     */
/* -------------------------- */
function Card({ title, children, value, compact = false }) {
  const isPositive = value === undefined ? undefined : value >= 0;
  const arrow = value === undefined ? '' : isPositive ? '▲' : '▼';
  const toneClass =
    isPositive === undefined
      ? 'from-slate-500/10 via-blue-500/5 to-cyan-500/10'
      : isPositive
        ? 'from-emerald-500/15 via-teal-500/10 to-cyan-500/10'
        : 'from-rose-500/15 via-red-500/10 to-orange-500/10';

  return (
    <div className={`relative overflow-hidden bg-white/95 dark:bg-slate-900/95 ${compact ? 'p-3' : 'p-4'} rounded-xl shadow-sm flex flex-col justify-between h-full border border-slate-200/80 dark:border-slate-700/80 transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 min-w-0`}>
      <div className={`absolute inset-0 bg-gradient-to-br ${toneClass} pointer-events-none`} />
      <div className={`relative ${compact ? 'text-xs' : 'text-sm'} text-slate-600 dark:text-slate-300 mb-2 truncate font-medium`}>{title}</div>
      <div className={`${compact ? 'text-xl' : 'text-2xl'} font-semibold ${isPositive === undefined ? 'text-slate-900 dark:text-white' : isPositive ? 'text-emerald-700 dark:text-emerald-500' : 'text-red-700 dark:text-red-500'} min-w-0`}>
        <div className="relative flex items-center gap-1 font-mono overflow-hidden">
          {arrow && <span className={`${compact ? 'text-sm' : 'text-base'} flex-shrink-0`}>{arrow}</span>}
          <span className="truncate min-w-0">{children}</span>
        </div>
      </div>
    </div>
  );
}

/* -------------------------- */
/* Number Formatter           */
/* -------------------------- */
function formatNumber(n) {
  const value = Number(n || 0);
  return value.toLocaleString('en-IN', { maximumFractionDigits: 2 });
}
