import { Lock, Shield } from "lucide-react";

export default function SecuritySettings({
  auth,
  onClose,
  setCurrentPage,
  onRequestSignOut,
}) {
  return (
    <div className="mx-auto max-w-2xl space-y-4 px-4 py-6 sm:px-6 sm:py-8">
      {/* Password */}
      <div className="rounded-xl border border-slate-200/80 bg-white p-4 sm:p-5 dark:border-slate-800 dark:bg-slate-900/50">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800">
            <Lock className="w-5 h-5 text-slate-600 dark:text-slate-400" />
          </div>

          <div className="flex-1">
            <h3 className="font-semibold text-slate-900 dark:text-white">
              Password
            </h3>

            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Use the Forgot Password option on the login page whenever you
              want to reset your password securely.
            </p>

            <button
              type="button"
              onClick={() => onRequestSignOut?.()}
              className="mt-4 text-sm font-medium text-cyan-700 hover:underline dark:text-cyan-400"
            >
              Sign out
            </button>
          </div>
        </div>
      </div>

      {/* Two Factor Authentication */}
      <div className="flex items-center justify-between gap-4 rounded-xl border border-dashed border-slate-300 bg-slate-50/80 p-4 sm:p-5 dark:border-slate-600 dark:bg-slate-800/20">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800">
            <Shield className="w-5 h-5 text-slate-600 dark:text-slate-400" />
          </div>

          <div>
            <h3 className="font-semibold text-slate-900 dark:text-white">
              Two-factor authentication
            </h3>

            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Add an extra layer of security to your FinVault account.
            </p>
          </div>
        </div>

        <span className="shrink-0 rounded-full bg-amber-500/15 px-3 py-1 text-xs font-bold uppercase tracking-wide text-amber-800 dark:text-amber-300">
          Soon
        </span>
      </div>
    </div>
  );
}