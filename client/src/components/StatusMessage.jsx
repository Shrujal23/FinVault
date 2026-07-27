/**
 * Reusable StatusMessage component for FinVault.
 *
 * Renders a polished inline banner for error, success, warning, or info
 * messages. Uses the existing cyan / emerald / red / amber palette and
 * matches the rounded-2xl, backdrop-blur styling of the rest of the app.
 *
 * Usage:
 *   <StatusMessage variant="error" message="Something went wrong." />
 *   <StatusMessage variant="success" message="Asset saved!" onDismiss={() => setMsg('')} />
 *   <StatusMessage variant="error" title="Connection failed" message="Could not reach the server." retryLabel="Try again" onRetry={fetchData} />
 */

import {
  AlertCircle,
  CheckCircle2,
  AlertTriangle,
  Info,
  X,
  RefreshCw,
} from 'lucide-react';

/* ------------------------------------------------------------------ */
/*  Variant config                                                     */
/* ------------------------------------------------------------------ */

const VARIANTS = {
  error: {
    icon: AlertCircle,
    containerClass:
      'bg-red-50/90 dark:bg-red-950/30 border-red-200/80 dark:border-red-800/50',
    iconClass: 'text-red-500 dark:text-red-400',
    titleClass: 'text-red-800 dark:text-red-200',
    bodyClass: 'text-red-700 dark:text-red-300',
    dismissClass: 'text-red-400 hover:text-red-600 dark:hover:text-red-300',
    retryClass:
      'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-900/60',
  },
  success: {
    icon: CheckCircle2,
    containerClass:
      'bg-emerald-50/90 dark:bg-emerald-950/30 border-emerald-200/80 dark:border-emerald-800/50',
    iconClass: 'text-emerald-500 dark:text-emerald-400',
    titleClass: 'text-emerald-800 dark:text-emerald-200',
    bodyClass: 'text-emerald-700 dark:text-emerald-300',
    dismissClass: 'text-emerald-400 hover:text-emerald-600 dark:hover:text-emerald-300',
    retryClass: '',
  },
  warning: {
    icon: AlertTriangle,
    containerClass:
      'bg-amber-50/90 dark:bg-amber-950/30 border-amber-200/80 dark:border-amber-800/50',
    iconClass: 'text-amber-500 dark:text-amber-400',
    titleClass: 'text-amber-800 dark:text-amber-200',
    bodyClass: 'text-amber-700 dark:text-amber-300',
    dismissClass: 'text-amber-400 hover:text-amber-600 dark:hover:text-amber-300',
    retryClass:
      'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 hover:bg-amber-200 dark:hover:bg-amber-900/60',
  },
  info: {
    icon: Info,
    containerClass:
      'bg-cyan-50/90 dark:bg-cyan-950/30 border-cyan-200/80 dark:border-cyan-800/50',
    iconClass: 'text-cyan-500 dark:text-cyan-400',
    titleClass: 'text-cyan-800 dark:text-cyan-200',
    bodyClass: 'text-cyan-700 dark:text-cyan-300',
    dismissClass: 'text-cyan-400 hover:text-cyan-600 dark:hover:text-cyan-300',
    retryClass:
      'bg-cyan-100 dark:bg-cyan-900/40 text-cyan-700 dark:text-cyan-300 hover:bg-cyan-200 dark:hover:bg-cyan-900/60',
  },
};

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function StatusMessage({
  /** 'error' | 'success' | 'warning' | 'info' */
  variant = 'error',
  /** Optional bold heading */
  title,
  /** Main message body (required) */
  message,
  /** Show a dismiss (×) button */
  onDismiss,
  /** Show a retry button */
  retryLabel,
  /** Retry click handler */
  onRetry,
  /** Extra classes */
  className = '',
}) {
  if (!message) return null;

  const v = VARIANTS[variant] || VARIANTS.error;
  const Icon = v.icon;

  return (
    <div
      role={variant === 'error' ? 'alert' : 'status'}
      className={`
        relative flex items-start gap-3
        rounded-2xl border p-4
        backdrop-blur-sm
        ${v.containerClass}
        ${className}
      `}
    >
      {/* Icon */}
      <Icon className={`w-5 h-5 shrink-0 mt-0.5 ${v.iconClass}`} />

      {/* Content */}
      <div className="flex-1 min-w-0">
        {title && (
          <p className={`text-sm font-semibold mb-0.5 ${v.titleClass}`}>{title}</p>
        )}
        <p className={`text-sm leading-relaxed ${v.bodyClass}`}>{message}</p>

        {/* Retry button */}
        {retryLabel && onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className={`
              inline-flex items-center gap-1.5
              mt-3 px-3 py-1.5 rounded-lg
              text-xs font-semibold
              transition-colors
              ${v.retryClass}
            `}
          >
            <RefreshCw className="w-3.5 h-3.5" />
            {retryLabel}
          </button>
        )}
      </div>

      {/* Dismiss */}
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          className={`shrink-0 p-1 rounded-lg transition-colors ${v.dismissClass}`}
          aria-label="Dismiss"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
