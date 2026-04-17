import { ArrowLeft, Shield, Activity, Users, Sparkles, Target, Mail } from 'lucide-react';

const pillars = [
  {
    icon: Shield,
    title: 'Security first',
    body: 'JWT-based sessions, hashed passwords, and stateless APIs designed so your account stays yours.',
  },
  {
    icon: Activity,
    title: 'Live portfolio pulse',
    body: 'Holdings, allocation, movers, and market context in one command center—built for quick decisions.',
  },
  {
    icon: Users,
    title: 'Clarity for every investor',
    body: 'From first asset to a diversified book—FinVault stays readable on phone, tablet, and desktop.',
  },
];

const stats = [
  { label: 'Asset classes', value: 'Stocks · MF · Crypto' },
  { label: 'Focus', value: 'India & global data' },
  { label: 'Experience', value: 'Dark / light ready' },
];

export default function AboutUs({ setCurrentPage }) {
  return (
    <div className="min-h-screen pb-8 sm:pb-12">
      <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950 text-white shadow-2xl">
        <div className="absolute inset-0 opacity-40 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-cyan-500/30 via-transparent to-transparent pointer-events-none" />
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-slate-950/80 to-transparent pointer-events-none" />

        <div className="relative px-5 sm:px-8 md:px-12 py-10 sm:py-14 md:py-16 text-center md:text-left">
          <p className="text-xs sm:text-sm font-semibold tracking-[0.2em] text-cyan-300 uppercase mb-3">About FinVault</p>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight max-w-3xl mx-auto md:mx-0">
            The portfolio workspace for people who want <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-indigo-300">signal, not noise</span>.
          </h1>
          <p className="mt-4 text-base sm:text-lg text-slate-300 max-w-2xl mx-auto md:mx-0 leading-relaxed">
            FinVault brings together positions, performance, dividends, and market headlines so you can see your full picture—whether you check in once a day or once a quarter.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center md:justify-start">
            <button
              type="button"
              onClick={() => setCurrentPage('home')}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-white text-slate-900 px-6 py-3.5 text-sm sm:text-base font-semibold shadow-lg hover:bg-slate-100 transition"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to home
            </button>
            <button
              type="button"
              onClick={() => setCurrentPage('contact')}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/25 bg-white/5 px-6 py-3.5 text-sm sm:text-base font-semibold text-white hover:bg-white/10 transition"
            >
              <Mail className="w-5 h-5" />
              Contact us
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto mt-8 sm:mt-10 space-y-8 sm:space-y-10 px-0">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          {stats.map((s) => (
            <div
              key={s.label}
              className="rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 px-4 py-4 text-center sm:text-left shadow-sm"
            >
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">{s.label}</p>
              <p className="mt-1 text-sm sm:text-base font-semibold text-slate-900 dark:text-white">{s.value}</p>
            </div>
          ))}
        </div>

        <section className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 p-6 sm:p-8 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-start gap-4 sm:gap-6">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500/20 to-indigo-500/20 text-cyan-700 dark:text-cyan-400">
              <Target className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">Our mission</h2>
              <p className="mt-3 text-slate-600 dark:text-slate-300 leading-relaxed">
                Wealth tools should feel as serious as a banking app and as simple as a notebook. We build FinVault so you can track what you own, understand how it moves, and act when you choose—without drowning in spreadsheets or ten different broker apps.
              </p>
            </div>
          </div>
        </section>

        <section>
          <div className="flex items-center gap-2 mb-4 sm:mb-6">
            <Sparkles className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">What we care about</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
            {pillars.map(({ icon: Icon, title, body }) => (
              <div
                key={title}
                className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 text-cyan-700 dark:text-cyan-400">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{title}</h3>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </section>

        <footer className="text-center sm:text-left text-sm text-slate-500 dark:text-slate-400 pb-2">
          FinVault is a portfolio companion for learning and organization, not personalized investment advice. Always do your own research before making financial decisions.
        </footer>
      </div>
    </div>
  );
}
