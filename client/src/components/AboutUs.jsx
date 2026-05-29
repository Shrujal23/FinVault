import { ArrowLeft, Shield, Activity, Users, Sparkles, Target, Mail } from 'lucide-react';

const pillars = [
  {
    icon: Shield,
    title: 'No creepy tracking',
    body: "We don't sell your data. Authentication uses secure tokens. Passwords are encrypted. Your portfolio stays private.",
  },
  {
    icon: Activity,
    title: 'Live market data',
    body: 'We pull live prices from reliable APIs. You always know exactly where your net worth stands today without hitting refresh a hundred times.',
  },
  {
    icon: Users,
    title: 'Zero bloatware',
    body: 'We kept the interface intentionally minimal. No ads. No social feeds. Just your assets. Works great on both mobile and desktop.',
  },
];

const stats = [
  { label: 'Supported Assets', value: 'Stocks, MFs, Crypto & more' },
  { label: 'Built For', value: 'Indian & Global Markets' },
  { label: 'Core Focus', value: 'Privacy, Speed & Clean UI' },
];

export default function AboutUs({ setCurrentPage }) {
  return (
    <div className="min-h-screen pb-12">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-3xl border border-slate-200 dark:border-slate-700 bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950 text-white shadow-2xl">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,#22d3ee_10%,transparent_60%)] opacity-30 pointer-events-none" />
        <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-slate-950 to-transparent" />

        <div className="relative px-6 md:px-12 py-16 md:py-20 text-center md:text-left max-w-5xl mx-auto">
          <div className="inline-flex items-center gap-2 text-cyan-300 text-xs font-semibold tracking-widest mb-4">
            THE STORY BEHIND FINVAULT
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold tracking-tighter leading-tight max-w-3xl mx-auto md:mx-0">
            A portfolio tracker that makes sense.
          </h1>
          
          <p className="mt-6 text-lg text-slate-300 max-w-2xl mx-auto md:mx-0">
            We built FinVault because we were tired of checking three different broker apps or updating a broken spreadsheet just to see our net worth. Simple, fast, distraction-free.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
            <button
              onClick={() => setCurrentPage('home')}
              className="inline-flex items-center justify-center gap-3 rounded-2xl bg-white text-slate-900 px-8 py-4 font-semibold hover:bg-slate-100 active:scale-[0.985] transition-all shadow-lg"
            >
              <ArrowLeft className="w-5 h-5" />
              Return to Dashboard
            </button>
            
            <button
              onClick={() => setCurrentPage('contact')}
              className="inline-flex items-center justify-center gap-3 rounded-2xl border border-white/30 bg-white/10 px-8 py-4 font-semibold text-white hover:bg-white/15 transition-all"
            >
              <Mail className="w-5 h-5" />
              Get in touch
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 mt-12 space-y-12">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-6 text-center sm:text-left hover:border-cyan-200 dark:hover:border-cyan-800 transition-colors"
            >
              <p className="text-xs uppercase font-medium tracking-widest text-slate-500 dark:text-slate-400">
                {stat.label}
              </p>
              <p className="mt-2 text-xl font-semibold text-slate-900 dark:text-white">
                {stat.value}
              </p>
            </div>
          ))}
        </div>

        {/* Mission */}
        <div className="rounded-3xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-8 md:p-10">
          <div className="flex flex-col md:flex-row gap-8 md:items-start">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-cyan-100 dark:bg-cyan-950 text-cyan-600 dark:text-cyan-400">
              <Target className="w-7 h-7" />
            </div>
            
            <div className="flex-1">
              <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Why we built this</h2>
              <p className="mt-5 text-slate-600 dark:text-slate-300 leading-relaxed text-[17px]">
                Most finance apps are bloated with trading tips, notifications, or cluttered interfaces. 
                We just wanted a clean dashboard to track our investments in one place without distractions. 
              </p>
              <p className="mt-4 text-slate-600 dark:text-slate-300 leading-relaxed text-[17px]">
                So we built FinVault. A secure tool designed by developers who invest. Built for people who just want to know where their money is.
              </p>
            </div>
          </div>
        </div>

        {/* What we stand for */}
        <div>
          <div className="flex items-center gap-3 mb-8">            
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Our core principles</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {pillars.map(({ icon: Icon, title, body }) => (
              <div
                key={title}
                className="group rounded-3xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-8 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
              >
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-800 text-cyan-600 dark:text-cyan-400 mb-6 group-hover:scale-110 transition-transform">
                  <Icon className="w-6 h-6" />
                </div>
                
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white">{title}</h3>
                <p className="mt-3 text-slate-600 dark:text-slate-400 leading-relaxed">
                  {body}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Closing note */}
        <div className="text-center text-sm text-slate-500 dark:text-slate-400 pt-6 border-t border-slate-200 dark:border-slate-700">
          FinVault is a portfolio tracking tool built for personal use and shared with the community. It is not a registered financial advisor. Always do your own research.
        </div>
      </div>
    </div>
  );
}