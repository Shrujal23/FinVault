import { ArrowLeft } from 'lucide-react';
import useAppNavigate from '../hooks/useAppNavigate';

export default function AboutUs() {
  const go = useAppNavigate();

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:py-10">
      <button
        type="button"
        onClick={() => go('home')}
        className="mb-8 inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden />
        Back to dashboard
      </button>

      <header className="border-b border-slate-200 pb-8 dark:border-slate-800">
        <p className="text-sm text-slate-500 dark:text-slate-400">About FinVault</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
          One place to see what you own.
        </h1>
      </header>

      <article className="mt-8 space-y-5 text-[17px] leading-relaxed text-slate-600 dark:text-slate-300">
        <p>
          FinVault started as a side project: a few of us kept our holdings in different broker apps and a messy
          spreadsheet. Every Monday someone would ask &ldquo;what&apos;s my net worth?&rdquo; and we&apos;d spend twenty
          minutes copying numbers around. We wanted a single screen that just answered that question.
        </p>
        <p>
          So we built this—a portfolio tracker where you enter what you hold, see totals and allocation, and optionally
          pull in market prices when the data providers cooperate. No trading, no tips, no social feed. It&apos;s
          record-keeping with a decent UI.
        </p>

        <h2 className="pt-4 text-lg font-semibold text-slate-900 dark:text-white">What you can expect</h2>
        <ul className="mt-2 space-y-2 list-none pl-0">
          <li className="flex gap-3">
            <span className="text-slate-400 dark:text-slate-500" aria-hidden>—</span>
            <span>Holdings across stocks, funds, crypto, and a few other types in one list.</span>
          </li>
          <li className="flex gap-3">
            <span className="text-slate-400 dark:text-slate-500" aria-hidden>—</span>
            <span>Sign-in with email; your data is tied to your account, not shared with advertisers.</span>
          </li>
          <li className="flex gap-3">
            <span className="text-slate-400 dark:text-slate-500" aria-hidden>—</span>
            <span>Honest limits: some charts and integrations are demos or samples—we say so in the app.</span>
          </li>
        </ul>

        <h2 className="pt-4 text-lg font-semibold text-slate-900 dark:text-white">What we&apos;re not</h2>
        <p>
          FinVault is not a broker, not a tax advisor, and not investment advice. Prices can be delayed or missing.
          If you make financial decisions, double-check with your broker or a professional you trust.
        </p>

        <h2 className="pt-4 text-lg font-semibold text-slate-900 dark:text-white">Built in the open</h2>
        <p>
          The stack is React on the front, Spring Boot and MySQL on the back, with JWT auth and Docker for local runs.
          We care about security basics (hashed passwords, rate limits) but we&apos;re still learning—if you spot a bug,
          we&apos;d rather hear about it than pretend everything is perfect.
        </p>
      </article>

      <div className="mt-10 flex flex-wrap items-center gap-4 border-t border-slate-200 pt-8 dark:border-slate-800">
        <button
          type="button"
          onClick={() => go('contact')}
          className="rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white"
        >
          Say hello
        </button>
        <button
          type="button"
          onClick={() => go('home')}
          className="text-sm font-medium text-cyan-700 hover:underline dark:text-cyan-400"
        >
          Open the dashboard
        </button>
      </div>
    </div>
  );
}
