import { Loader2 } from 'lucide-react';

export default function SuspenseFallback() {
  return (
    <div className="w-full h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-400">
      <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
      <p className="mt-4 text-lg font-medium">Loading FinVault...</p>
      <p className="text-sm">Please wait a moment.</p>
    </div>
  );
}