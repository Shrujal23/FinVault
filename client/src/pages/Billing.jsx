import { useState } from 'react';
import { ArrowLeft, Check, Loader2 } from 'lucide-react';
import { apiRequest } from '../api/client.js';
import { useAuth } from '../hooks/useAuth';
import useAppNavigate from '../hooks/useAppNavigate';
import { cn } from '@/lib/utils';

const PLANS = [
	{
		id: 'free',
		name: 'Free',
		priceMonthly: 0,
		priceYearly: 0,
		blurb: 'Enough for tracking your own portfolio in this project.',
		features: ['Holdings & allocation', 'Watchlist', 'Market news panel', 'Dashboard summary'],
		current: true,
	},
	{
		id: 'pro',
		name: 'Pro',
		priceMonthly: 799,
		priceYearly: 7990,
		blurb: 'Extra workflow features when payments are wired up.',
		features: ['Everything in Free', 'CSV export (planned)', 'More price alerts', 'Priority support (planned)'],
		highlight: true,
	},
	{
		id: 'enterprise',
		name: 'Team',
		priceMonthly: 3999,
		priceYearly: 39990,
		blurb: 'For groups—placeholder until a real B2B flow exists.',
		features: ['Shared workspace (idea)', 'API access (idea)', 'Onboarding call (idea)'],
	},
];

function formatInr(amount) {
	if (amount === 0) return '₹0';
	return `₹${amount.toLocaleString('en-IN')}`;
}

export default function Billing() {
	const { token } = useAuth();
	const go = useAppNavigate();
	const [loadingPlan, setLoadingPlan] = useState(null);
	const [billingCycle, setBillingCycle] = useState('monthly');

	const openCheckout = async (planId) => {
		if (planId === 'free') {
			go('home');
			return;
		}
		setLoadingPlan(planId);
		try {
			const body = await apiRequest(
				`/api/pay/create-session?plan=${encodeURIComponent(planId)}&cycle=${encodeURIComponent(billingCycle)}`,
				{ method: 'POST', token }
			);
			const url = body?.url || body?.checkoutUrl;
			if (url) {
				window.open(url, '_blank', 'noopener');
				setLoadingPlan(null);
				return;
			}
		} catch {
			// demo fallback
		}
		window.open(
			`https://example.com/checkout?plan=${encodeURIComponent(planId)}&cycle=${billingCycle}`,
			'_blank',
			'noopener'
		);
		setLoadingPlan(null);
	};

	const yearlySave =
		PLANS[1].priceMonthly > 0
			? Math.round((1 - PLANS[1].priceYearly / (PLANS[1].priceMonthly * 12)) * 100)
			: 0;

	return (
		<div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white/95 shadow-sm dark:border-slate-800 dark:bg-slate-900/90">
			<div className="border-b border-slate-200/80 px-4 py-4 sm:px-6 dark:border-slate-800">
				<button
					type="button"
					onClick={() => go('settings')}
					className="mb-3 inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
				>
					<ArrowLeft className="h-4 w-4" aria-hidden />
					Settings
				</button>
				<h1 className="text-2xl font-semibold text-slate-900 dark:text-white sm:text-3xl">Plans & billing</h1>
				<p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600 dark:text-slate-400">
					You&apos;re on the <strong className="font-medium text-slate-800 dark:text-slate-200">Free</strong> plan today.
					Checkout below is a demo only—no real payment runs in this build.
				</p>
			</div>

			<div className="border-b border-slate-200/80 bg-slate-50/80 px-4 py-4 sm:px-6 dark:border-slate-800 dark:bg-slate-950/40">
				<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
					<p className="text-sm font-medium text-slate-700 dark:text-slate-300">Billing cycle</p>
					<div
						role="group"
						aria-label="Billing cycle"
						className="inline-flex rounded-lg border border-slate-200 bg-white p-1 dark:border-slate-700 dark:bg-slate-900"
					>
						<button
							type="button"
							onClick={() => setBillingCycle('monthly')}
							className={cn(
								'rounded-md px-4 py-2 text-sm font-medium transition-colors',
								billingCycle === 'monthly'
									? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
									: 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
							)}
						>
							Monthly
						</button>
						<button
							type="button"
							onClick={() => setBillingCycle('yearly')}
							className={cn(
								'rounded-md px-4 py-2 text-sm font-medium transition-colors',
								billingCycle === 'yearly'
									? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
									: 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
							)}
						>
							Yearly
							{yearlySave > 0 && (
								<span className="ml-1.5 text-xs font-normal text-emerald-600 dark:text-emerald-400">
									(save ~{yearlySave}%)
								</span>
							)}
						</button>
					</div>
				</div>
			</div>

			<div className="grid gap-4 p-4 sm:grid-cols-2 sm:p-6 lg:grid-cols-3">
				{PLANS.map((plan) => {
					const price = billingCycle === 'monthly' ? plan.priceMonthly : plan.priceYearly;
					const suffix = billingCycle === 'monthly' ? '/month' : '/year';

					return (
						<article
							key={plan.id}
							className={cn(
								'flex flex-col rounded-xl border p-5',
								plan.highlight
									? 'border-cyan-500/40 bg-cyan-500/5 dark:border-cyan-500/30 dark:bg-cyan-950/20'
									: 'border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900/50',
								plan.current && 'ring-1 ring-slate-300 dark:ring-slate-600'
							)}
						>
							<div className="flex items-start justify-between gap-2">
								<h2 className="text-lg font-semibold text-slate-900 dark:text-white">{plan.name}</h2>
								{plan.current && (
									<span className="shrink-0 rounded-full bg-slate-200 px-2 py-0.5 text-[11px] font-medium uppercase tracking-wide text-slate-700 dark:bg-slate-700 dark:text-slate-200">
										Current
									</span>
								)}
							</div>
							<p className="mt-2 min-h-[2.5rem] text-sm text-slate-500 dark:text-slate-400">{plan.blurb}</p>
							<p className="mt-4 text-3xl font-semibold tabular-nums tracking-tight text-slate-900 dark:text-white">
								{formatInr(price)}
								{price > 0 && (
									<span className="text-base font-normal text-slate-500 dark:text-slate-400">{suffix}</span>
								)}
							</p>
							<ul className="mt-5 flex-1 space-y-2.5 border-t border-slate-200/80 pt-4 dark:border-slate-700/80">
								{plan.features.map((feature) => (
									<li key={feature} className="flex gap-2.5 text-sm text-slate-600 dark:text-slate-300">
										<Check className="mt-0.5 h-4 w-4 shrink-0 text-cyan-600 dark:text-cyan-400" aria-hidden />
										<span>{feature}</span>
									</li>
								))}
							</ul>
							<button
								type="button"
								disabled={loadingPlan === plan.id}
								onClick={() => openCheckout(plan.id)}
								className={cn(
									'mt-6 w-full rounded-lg py-2.5 text-sm font-medium transition-colors inline-flex items-center justify-center gap-2',
									plan.current
										? 'border border-slate-200 bg-slate-50 text-slate-800 hover:bg-slate-100 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700'
										: plan.highlight
											? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white hover:from-cyan-500 hover:to-blue-500'
											: 'border border-slate-200 bg-white text-slate-800 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800'
								)}
							>
								{loadingPlan === plan.id && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
								{plan.current ? 'Back to dashboard' : 'Open demo checkout'}
							</button>
						</article>
					);
				})}
			</div>

			<div className="border-t border-slate-200/80 bg-slate-50/50 px-4 py-5 sm:px-6 dark:border-slate-800 dark:bg-slate-950/30">
				<h3 className="text-sm font-semibold text-slate-900 dark:text-white">Before you pay (in a real launch)</h3>
				<ul className="mt-2 space-y-1.5 text-sm text-slate-600 dark:text-slate-400">
					<li>· Card details would go to a payment partner, not stored in FinVault.</li>
					<li>· You could cancel or switch plans from this page once subscriptions exist.</li>
					<li>
						· Questions?{' '}
						<button
							type="button"
							onClick={() => go('contact')}
							className="font-medium text-cyan-700 hover:underline dark:text-cyan-400"
						>
							Contact us
						</button>
						.
					</li>
				</ul>
			</div>
		</div>
	);
}
