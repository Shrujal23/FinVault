import * as React from 'react';
import { cn } from '@/lib/utils';

function Badge({ className, variant = 'default', ...props }) {
  const baseClass = 'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors';
  const variants = {
    default: 'border-transparent bg-slate-900 text-slate-50 dark:bg-slate-100 dark:text-slate-900',
    outline: 'border-slate-200 text-slate-700 dark:border-slate-700 dark:text-slate-300',
    secondary: 'border-transparent bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
  };

  return <span className={cn(baseClass, variants[variant], className)} {...props} />;
}

export { Badge };
