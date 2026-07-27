/*
 Reusable EmptyState component.
*/

import React from 'react';
import {
  Wallet,
  Newspaper,
  LineChart,
  PieChart,
  Star,
  Coins,
  Search,
  PackageOpen,
} from 'lucide-react';

function FloatingDotsDecoration({ className = '' }) {
  return (
    <div className={`absolute inset-0 pointer-events-none overflow-hidden ${className}`} aria-hidden="true">
      {/* Soft gradient blurs */}
      <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-cyan-400/10 dark:bg-cyan-500/8 blur-2xl" />
      <div className="absolute -bottom-6 -left-6 w-28 h-28 rounded-full bg-blue-400/10 dark:bg-indigo-500/8 blur-2xl" />
      {/* Small floating dots */}
      <div className="absolute top-6 right-10 w-2 h-2 rounded-full bg-cyan-400/30 dark:bg-cyan-400/20 animate-pulse" />
      <div className="absolute bottom-8 left-12 w-1.5 h-1.5 rounded-full bg-blue-400/25 dark:bg-blue-400/15 animate-pulse" style={{ animationDelay: '1s' }} />
      <div className="absolute top-1/2 right-1/4 w-1 h-1 rounded-full bg-indigo-400/20 animate-pulse" style={{ animationDelay: '0.5s' }} />
    </div>
  );
}

const PRESETS = {
  noAssets: {
    icon: Wallet,
    title: 'No assets in your portfolio',
    description: 'Add your first holding to see real-time valuations, P&L tracking, and allocation insights.',
  },
  noNews: {
    icon: Newspaper,
    title: 'No headlines right now',
    description: 'Market news will appear here once we receive fresh data from our providers.',
  },
  noPerformance: {
    icon: LineChart,
    title: 'No performance data yet',
    description: 'Once we have at least two snapshots of your portfolio, a trend chart will appear here.',
  },
  noAllocation: {
    icon: PieChart,
    title: 'No allocation data',
    description: 'Add some holdings and we\'ll automatically calculate your asset distribution.',
  },
  noWatchlist: {
    icon: Star,
    title: 'Your watchlist is empty',
    description: 'Start tracking assets you\'re interested in. Search for a stock or crypto above and add it.',
  },
  noDividends: {
    icon: Coins,
    title: 'No dividends recorded',
    description: 'Add your first dividend entry to start tracking ex-dates and estimated payouts.',
  },
  noSearchResults: {
    icon: Search,
    title: 'No results found',
    description: 'Try a different search term or broaden your query.',
  },
  generic: {
    icon: PackageOpen,
    title: 'Nothing to show',
    description: 'There\'s no data available here yet.',
  },
};


export default function EmptyState({
  preset,
  icon,
  title,
  description,
  actionLabel,
  onAction,
  secondaryLabel,
  onSecondary,
  size = 'md',
  className = '',
}) {
  // Merge preset with explicit props
  const p = PRESETS[preset] || {};
  const resolvedTitle = title || p.title || 'Nothing to show';
  const resolvedDesc = description || p.description;
  const IconComponent = icon || p.icon || PackageOpen;
  const isJsx = React.isValidElement(IconComponent);

  // Size map
  const sizeMap = {
    sm: { wrapper: 'py-8 px-4', icon: 'w-10 h-10', ring: 'w-16 h-16', title: 'text-base', desc: 'text-sm', gap: 'gap-3' },
    md: { wrapper: 'py-12 px-6', icon: 'w-12 h-12', ring: 'w-20 h-20', title: 'text-lg', desc: 'text-sm', gap: 'gap-4' },
    lg: { wrapper: 'py-16 px-8', icon: 'w-14 h-14', ring: 'w-24 h-24', title: 'text-xl', desc: 'text-base', gap: 'gap-5' },
  };
  const s = sizeMap[size] || sizeMap.md;

  return (
    <div
      className={`
        relative overflow-hidden rounded-2xl
        border border-dashed border-slate-200/80 dark:border-slate-700/60
        bg-gradient-to-br from-white via-slate-50/50 to-cyan-50/30
        dark:from-slate-900/80 dark:via-slate-900/60 dark:to-slate-800/40
        ${s.wrapper}
        flex flex-col items-center justify-center text-center
        ${className}
      `}
    >
      <FloatingDotsDecoration />

      <div className="relative flex flex-col items-center" style={{ gap: s.gap === 'gap-3' ? '0.75rem' : s.gap === 'gap-4' ? '1rem' : '1.25rem' }}>
        {/* Icon ring */}
        <div
          className={`
            ${s.ring} rounded-2xl
            bg-gradient-to-br from-cyan-100/80 via-blue-50/60 to-indigo-100/50
            dark:from-cyan-900/30 dark:via-blue-900/20 dark:to-indigo-900/20
            border border-cyan-200/50 dark:border-cyan-800/30
            flex items-center justify-center
            shadow-sm
          `}
        >
          {isJsx ? (
            IconComponent
          ) : (
            <IconComponent
              className={`${s.icon} text-cyan-600/70 dark:text-cyan-400/60`}
              strokeWidth={1.5}
            />
          )}
        </div>

        {/* Title */}
        <h3
          className={`
            ${s.title} font-semibold
            text-slate-800 dark:text-slate-100
            max-w-sm
          `}
        >
          {resolvedTitle}
        </h3>

        {/* Description */}
        {resolvedDesc && (
          <p
            className={`
              ${s.desc} leading-relaxed
              text-slate-500 dark:text-slate-400
              max-w-md
            `}
          >
            {resolvedDesc}
          </p>
        )}

        {/* Actions */}
        {(actionLabel || secondaryLabel) && (
          <div className="flex flex-wrap items-center justify-center gap-3 mt-2">
            {actionLabel && (
              <button
                type="button"
                onClick={onAction}
                className="
                  inline-flex items-center gap-2
                  px-5 py-2.5 rounded-xl
                  bg-gradient-to-r from-cyan-600 to-blue-600
                  hover:from-cyan-500 hover:to-blue-500
                  text-white text-sm font-semibold
                  shadow-sm shadow-cyan-600/20
                  transition-all duration-200
                  active:scale-[0.98]
                "
              >
                {actionLabel}
              </button>
            )}
            {secondaryLabel && (
              <button
                type="button"
                onClick={onSecondary}
                className="
                  inline-flex items-center gap-2
                  px-5 py-2.5 rounded-xl
                  border border-slate-200 dark:border-slate-700
                  bg-white/80 dark:bg-slate-800/80
                  text-slate-700 dark:text-slate-200
                  text-sm font-medium
                  hover:bg-slate-50 dark:hover:bg-slate-700
                  transition-all duration-200
                "
              >
                {secondaryLabel}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
