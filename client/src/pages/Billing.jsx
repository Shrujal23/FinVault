
import React, { useState } from 'react';
import { Check, ShieldCheck } from 'lucide-react';

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
      desc: 'Basic tracking, 3 alerts, CSV export (limited)',
      features: ['Track assets', 'Portfolio summary', 'Limited alerts'],
      free: true,
    },
    {
      id: 'pro',
      title: 'Pro',
      priceMonthly: 9,
      priceYearly: 90,
      desc: 'Real-time prices, unlimited alerts, CSV export and priority support',
      features: ['Real-time data', 'Unlimited alerts', 'CSV export', 'Priority email support'],
      featured: true,
    },
    {
      id: 'enterprise',
      title: 'Enterprise',
      priceMonthly: 49,
      priceYearly: 490,
      desc: 'Team seats, API access, SLA and white-glove onboarding',
      features: ['Team seats', 'API access', 'SLA & onboarding'],
    },
  ];

  const formatPrice = (plan) => {
    const p = billingCycle === 'monthly' ? plan.priceMonthly : plan.priceYearly;
    if (p === 0) return 'Free';
    return `$${p}${billingCycle === 'monthly' ? '/mo' : '/yr'}`;
  };

  const openCheckout = async (planId) => {
    if (planId === 'free') return;
    setLoadingPlan(planId);

    try {
      const res = await fetch(`/api/pay/create-session?plan=${encodeURIComponent(planId)}&cycle=${billingCycle}`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (res.ok) {
        const body = await res.json();
        const url = body.url || body.checkoutUrl;
        if (url) {
          window.open(url, '_blank', 'noopener');
          setLoadingPlan(null);
          return;
        }
      }
    } catch (e) {
      // fallback
    }

    const fallback = `https://example.com/checkout?plan=${encodeURIComponent(planId)}&cycle=${billingCycle}`;
    window.open(fallback, '_blank', 'noopener');
    setLoadingPlan(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 pb-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-start justify-between gap-6 mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">Plans & Billing</h1>
            <p className="mt-2 text-slate-600 dark:text-slate-400 max-w-xl">Choose a plan that suits your needs. Upgrade anytime to unlock premium features and priority support.</p>
            <div className="mt-4 inline-flex items-center rounded-full bg-slate-100 dark:bg-slate-800 p-1">
              <button onClick={() => setBillingCycle('monthly')} className={`px-3 py-1 rounded-full font-medium ${billingCycle === 'monthly' ? 'bg-white dark:bg-slate-900 shadow-sm' : 'text-slate-600 dark:text-slate-300'}`}>Monthly</button>
              <button onClick={() => setBillingCycle('yearly')} className={`px-3 py-1 rounded-full font-medium ${billingCycle === 'yearly' ? 'bg-white dark:bg-slate-900 shadow-sm' : 'text-slate-600 dark:text-slate-300'}`}>Yearly</button>
            </div>
          </div>
          <div className="hidden md:flex flex-col items-end text-right">
            <div className="text-sm text-slate-500">Need help deciding?</div>
            <div className="mt-2 text-sm">
              <a href="mailto:sales@example.com" className="text-blue-600 dark:text-cyan-400">Contact sales</a>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map(plan => (
            <div key={plan.id} className={`relative p-6 rounded-2xl border ${plan.featured ? 'border-indigo-400 shadow-xl' : 'border-slate-200 shadow-sm'} bg-white dark:bg-slate-900` }>
              {plan.featured && (
                <div className="absolute -top-3 left-4 bg-gradient-to-r from-indigo-500 to-cyan-500 text-white px-3 py-1 rounded-full text-xs font-semibold shadow">Most popular</div>
              )}

              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white">{plan.title}</h3>
                <div className="text-sm text-slate-500">{plan.desc}</div>
              </div>

              <div className="mt-4 flex items-baseline gap-2">
                <div className="text-3xl font-bold text-slate-900 dark:text-white">{formatPrice(plan)}</div>
                <div className="text-sm text-slate-500">{billingCycle === 'monthly' ? 'billed monthly' : 'billed yearly'}</div>
              </div>

              <ul className="mt-6 space-y-3 text-sm text-slate-600 dark:text-slate-300">
                {plan.features && plan.features.map((f, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <span className="w-6 h-6 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center text-emerald-600">
                      <Check className="w-4 h-4" />
                    </span>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-6">
                {plan.free ? (
                  <button onClick={() => setCurrentPage('home')} className="w-full px-4 py-2 rounded-md bg-emerald-600 text-white font-medium">Get started</button>
                ) : (
                  <button onClick={() => openCheckout(plan.id)} disabled={loadingPlan === plan.id} className="w-full px-4 py-2 rounded-md bg-gradient-to-r from-indigo-600 to-cyan-500 text-white font-medium">{loadingPlan === plan.id ? 'Opening...' : 'Subscribe'}</button>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10 bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center gap-4 mb-4">
            <ShieldCheck className="w-6 h-6 text-slate-700 dark:text-slate-300" />
            <h4 className="text-lg font-semibold text-slate-900 dark:text-white">Billing FAQ</h4>
          </div>
          <div className="text-sm text-slate-600 dark:text-slate-400 space-y-3">
            <p><strong>How does billing work?</strong> Subscriptions are billed according to the selected cycle. You can cancel anytime from your account settings.</p>
            <p><strong>Do you offer refunds?</strong> Refunds are handled case-by-case—please contact support.</p>
            <p><strong>Is my payment information secure?</strong> We use industry-standard payment processors; sensitive card data is never stored on our servers.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
