import { Lock, Shield } from "lucide-react";

export default function SecuritySettings({
  auth,
  onClose,
  setCurrentPage,
}) {
  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-xl">
      {/* Password */}
      <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white/90 dark:bg-slate-900/70 p-4 sm:p-5 space-y-4">
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
              onClick={() => {
                onClose?.();
                auth?.logout?.();
                setCurrentPage?.("home");
              }}
              className="mt-4 text-sm font-semibold text-cyan-600 hover:underline dark:text-cyan-400"
            >
              Sign out and open login
            </button>
          </div>
        </div>
      </div>

      {/* Two Factor Authentication */}
      <div className="rounded-2xl border border-dashed border-slate-300 dark:border-slate-600 bg-slate-50/50 dark:bg-slate-800/30 p-4 sm:p-5 flex items-center justify-between gap-4">
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