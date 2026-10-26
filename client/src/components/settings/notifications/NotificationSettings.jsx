import React from "react";

function ToggleRow({
  label,
  description,
  enabled,
  onChange,
}) {
  return (
    <div className="flex items-center justify-between px-4 sm:px-6 py-5">

      <div className="pr-4">

        <h3 className="font-medium text-slate-900 dark:text-white">
          {label}
        </h3>

        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          {description}
        </p>

      </div>

      <button
        type="button"
        role="switch"
        aria-checked={enabled}
        onClick={() => onChange(!enabled)}
        className={`relative h-7 w-12 rounded-full transition-all duration-300 ${
          enabled
            ? "bg-cyan-600"
            : "bg-slate-300 dark:bg-slate-600"
        }`}
      >
        <span
          className={`absolute top-1 left-1 h-5 w-5 rounded-full bg-white shadow transition-transform duration-300 ${
            enabled ? "translate-x-5" : ""
          }`}
        />
      </button>

    </div>
  );
}

export default function NotificationSettings({
  price,
  setPrice,
  dividend,
  setDividend,
  weekly,
  setWeekly,
  showIntro = false,
}) {
  return (
    <div className="mx-auto max-w-2xl px-4 py-6 sm:px-6 sm:py-8">

      {showIntro && (
        <p className="mb-4 text-sm text-slate-600 dark:text-slate-400">
          Preferences are stored in your browser for this demo.
        </p>
      )}

      <div className="overflow-hidden rounded-xl border border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-900/50 divide-y divide-slate-200/80 dark:divide-slate-800">

        <ToggleRow
          label="Price Movement Alerts"
          description="Receive alerts when stocks in your watchlist move significantly."
          enabled={price}
          onChange={setPrice}
        />

        <ToggleRow
          label="Dividend Reminders"
          description="Notify me before dividend and ex-dividend dates."
          enabled={dividend}
          onChange={setDividend}
        />

        <ToggleRow
          label="Weekly Portfolio Report"
          description="Get a weekly summary of portfolio performance."
          enabled={weekly}
          onChange={setWeekly}
        />

      </div>

    </div>
  );
}