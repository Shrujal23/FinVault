import { useState } from 'react';
import { Check, ShieldCheck, ArrowLeft, Settings, Sparkles, Receipt, Loader2 } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:4000';

export default function Billing({ auth, setCurrentPage }) {
  const { token } = auth || {};
  const [loadingPlan, setLoadingPlan] = useState(null);
  const [billingCycle, setBillingCycle] = useState('monthly');

  const plans = [
    {
      id: 'free',
      title: 'Free',
      priceMonthly: 0,
      priceYearly: 0,
      desc: 'Core portfolio tracking and a focused dashboard.',
      features: ['Holdings & allocation', 'Portfolio summary', 'Market news & watchlist', 'Limited alerts'],
      free: true,
    },
    {
      id: 'pro',
      title: 'Pro',
      priceMonthly: 9,
      priceYearly: 90,
      desc: 'Live data, exports, and faster support when markets move.',
      features: ['Real-time quotes where available', 'Unlimited alerts', 'CSV export', 'Priority email support'],
      featured: true,
    },
    {
      id: 'enterprise',
      title: 'Enterprise',
      priceMonthly: 49,
      priceYearly: 490,
      desc: 'Teams, APIs, and onboarding for serious operations.',
      features: ['Team seats', 'API access', 'SLA & white-glove onboarding'],
    },
  ];

  const yearlySavingsPct = () => {
    const pro = plans.find((p) => p.id === 'pro');
    if (!pro) return 0;
    const monthly = pro.priceMonthly * 12;
    const yearly = pro.priceYearly;
    if (monthly <= 0) return 0;
    return Math.round((1 - yearly / monthly) * 100);
  };

  const formatPrice = (plan) => {
    const p = billingCycle === 'monthly' ? plan.priceMonthly : plan.priceYearly;
    if (p === 0) return 'Free';
    return `$${p}${billingCycle === 'monthly' ? '/mo' : '/yr'}`;
  };

  const openCheckout = async (planId) => {
    if (planId === 'free') return;
    setLoadingPlan(planId);

    try {
      const res = await fetch(
        `${API_BASE}/api/pay/create-session?plan=${encodeURIComponent(planId)}&cycle=${encodeURIComponent(billingCycle)}`,
        {
          method: 'POST',
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        }
      );
      if (res.ok) {
        const body = await res.json();
        const url = body.url || body.checkoutUrl;
        if (url) {
          window.open(url, '_blank', 'noopener');
          setLoadingPlan(null);
          return;
        }
      }
    } catch {
      /* fallback below */
    }

    const fallback = `https://example.com/checkout?plan=${encodeURIComponent(planId)}&cycle=${billingCycle}`;
    window.open(fallback, '_blank', 'noopener');
    setLoadingPlan(null);
  };

  const savePct = yearlySavingsPct();

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-100 via-slate-50 to-indigo-50/40 dark:from-slate-950 dark:via-slate-950 dark:to-slate-900 pb-12">
      <div className="max-w-6xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-10">
        <div className="mb-6 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setCurrentPage?.('settings')}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/90 dark:bg-slate-900/90 px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            <Settings className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
            Account settings
          </button>
          <button
            type="button"
            onClick={() => setCurrentPage?.('home')}
            className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          >
            <ArrowLeft className="w-4 h-4" />
            Dashboard
          </button>
        </div>

        <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white/85 dark:bg-slate-900/75 p-6 sm:p-8 mb-8 shadow-lg">
          <div className="absolute -right-20 -top-20 h-48 w-48 rounded-full bg-indigo-400/15 dark:bg-indigo-500/10 blur-3xl pointer-events-none" />
          <div className="absolute -left-10 bottom-0 h-32 w-32 rounded-full bg-cyan-400/15 blur-2xl pointer-events-none" />
          <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-700 dark:text-cyan-400">Billing</p>
              <h1 className="mt-2 text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white">
                Plans that <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 to-indigo-600">scale with you</span>
              </h1>
              <p className="mt-2 max-w-2xl text-slate-600 dark:text-slate-300">
                Upgrade for deeper market data and workflow features. Downgrade or cancel whenever your needs change.
              </p>
              <div className="mt-4 inline-flex items-center rounded-full border border-slate-200/80 dark:border-slate-700 bg-slate-100/80 dark:bg-slate-800/80 p-1">
                <button
                  type="button"
                  onClick={() => setBillingCycle('monthly')}
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                    billingCycle === 'monthly'
                      ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  Monthly
                </button>
                <button
                  type="button"
                  onClick={() => setBillingCycle('yearly')}
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                    billingCycle === 'yearly'
                      ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  Yearly
                  {savePct > 0 && (
                    <span className="ml-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">· Save ~{savePct}%</span>
                  )}
                </button>
              </div>
            </div>
            <div className="flex flex-col gap-2 rounded-xl border border-slate-200/80 dark:border-slate-700 bg-slate-50/90 dark:bg-slate-800/50 px-4 py-3 sm:text-right shrink-0">
              <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 sm:justify-end">
                <Receipt className="w-4 h-4 text-cyan-600" />
                Invoices & receipts
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-500">Available from your payment provider after checkout.</p>
              <a href="mailto:sales@example.com" className="text-sm font-semibold text-cyan-600 dark:text-cyan-400 hover:underline">
                Contact sales
              </a>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`relative flex flex-col rounded-2xl border p-6 sm:p-7 transition-shadow ${
                plan.featured
                  ? 'border-cyan-500/50 bg-white dark:bg-slate-900 shadow-xl shadow-cyan-500/10 ring-1 ring-cyan-500/20'
                  : 'border-slate-200/80 dark:border-slate-800 bg-white/95 dark:bg-slate-900/90 shadow-sm'
              }`}
            >
              {plan.featured && (
                <div className="absolute -top-3 left-4 flex items-center gap-1 rounded-full bg-gradient-to-r from-cyan-600 to-indigo-600 px-3 py-1 text-xs font-bold text-white shadow">
                  <Sparkles className="w-3.5 h-3.5" />
                  Most popular
                </div>
              )}

              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">{plan.title}</h3>
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 leading-snug">{plan.desc}</p>
              </div>

              <div className="mt-6">
                <div className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">{formatPrice(plan)}</div>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-500">
                  {plan.free ? 'No card required' : billingCycle === 'monthly' ? 'Billed monthly' : 'Billed annually'}
                </p>
              </div>

              <ul className="mt-6 flex-1 space-y-3 text-sm text-slate-600 dark:text-slate-300">
                {plan.features?.map((f, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-400">
                      <Check className="w-3.5 h-3.5" />
                    </span>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-8">
                {plan.free ? (
                  <button
                    type="button"
                    onClick={() => setCurrentPage?.('home')}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 py-3 text-sm font-semibold text-slate-800 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700"
                  >
                    Continue with Free
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => openCheckout(plan.id)}
                    disabled={loadingPlan === plan.id}
                    className="w-full rounded-xl bg-gradient-to-r from-cyan-600 to-indigo-600 py-3 text-sm font-semibold text-white shadow-lg hover:from-cyan-500 hover:to-indigo-500 disabled:opacity-60 inline-flex items-center justify-center gap-2"
                  >
                    {loadingPlan === plan.id ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                    {loadingPlan === plan.id ? 'Opening checkout…' : 'Subscribe'}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white/80 dark:bg-slate-900/60 px-4 py-4 text-center sm:text-left">
            <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Security</p>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">PCI-minded flows; card data stays with the processor.</p>
          </div>
          <div className="rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white/80 dark:bg-slate-900/60 px-4 py-4 text-center sm:text-left">
            <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Flexibility</p>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">Switch billing cycle or plan when your usage changes.</p>
          </div>
          <div className="rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white/80 dark:bg-slate-900/60 px-4 py-4 text-center sm:text-left">
            <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Support</p>
            <button type="button" onClick={() => setCurrentPage?.('contact')} className="mt-1 text-sm font-semibold text-cyan-600 dark:text-cyan-400 hover:underline">
              Open contact form →
            </button>
          </div>
        </div>

        <div className="mt-10 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white/95 dark:bg-slate-900/90 p-6 sm:p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800">
              <ShieldCheck className="w-6 h-6 text-cyan-700 dark:text-cyan-400" />
            </div>
            <div>
              <h4 className="text-lg font-bold text-slate-900 dark:text-white">Billing FAQ</h4>
              <p className="text-sm text-slate-500 dark:text-slate-400">Straight answers before you pay.</p>
            </div>
          </div>
          <dl className="space-y-5 text-sm text-slate-600 dark:text-slate-300">
            <div>
              <dt className="font-semibold text-slate-900 dark:text-white">How does billing work?</dt>
              <dd className="mt-1.5">Subscriptions follow the cycle you pick. You can cancel from account settings depending on your provider.</dd>
            </div>
            <div>
              <dt className="font-semibold text-slate-900 dark:text-white">Refunds?</dt>
              <dd className="mt-1.5">We handle refunds case by case—reach out via the contact form with your account email.</dd>
            </div>
            <div>
              <dt className="font-semibold text-slate-900 dark:text-white">Is payment data stored on FinVault?</dt>
              <dd className="mt-1.5">No. Checkout runs through a payment partner; we don’t hold full card numbers on our servers.</dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
}
