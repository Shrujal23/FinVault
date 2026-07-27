import { useEffect, useState } from 'react';
import { apiRequest } from '../api/client.js';
import StockSearch from './StockSearch.jsx';
import EmptyState from './EmptyState.jsx';
import StatusMessage from './StatusMessage.jsx';

export default function Watchlist({ token }) {
	const [items, setItems] = useState([]);
	const [symbol, setSymbol] = useState('');
	const [name, setName] = useState('');
	const [type, setType] = useState('stock');
	const [error, setError] = useState('');
	const [loading, setLoading] = useState(true);

	async function load() {
		try {
			setLoading(true);
			const r = await apiRequest('/api/watchlist', { token });

			// ✅ FIXED: backend returns array, not { items: [...] }
			setItems(Array.isArray(r) ? r : (r.items || []));
		} catch (e) {
			setError(e.message);
		} finally {
			setLoading(false);
		}
	}

	useEffect(() => { load(); }, []);

	async function addItem(e) {
		e.preventDefault();
		setError('');
		try {
			await apiRequest('/api/watchlist', { 
				method: 'POST',
				body: { type, symbol, name },
				token 
			});
			setSymbol('');
			setName('');
			load();
		} catch (e) { 
			setError(e.message); 
		}
	}

	async function removeItem(id) {
		try {
			await apiRequest(`/api/watchlist/${id}`, { method: 'DELETE', token });
			load();
		} catch (e) {
			setError(e.message);
		}
	}

	return (
		<div className="bg-white/95 dark:bg-slate-900/95 rounded-xl shadow-sm border border-slate-200/80 dark:border-slate-800 p-6">
			<div className="flex items-center justify-between mb-6">
				<h2 className="text-xl font-semibold text-slate-800 dark:text-white">Watchlist</h2>
				<button 
					className="text-xs font-medium px-3 py-1.5 rounded-md border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors" type="button" aria-label="Refresh watchlist" onClick={load}>
					Refresh
				</button>
			</div>

			<form onSubmit={addItem} className="grid grid-cols-1 md:grid-cols-6 gap-3 mb-4">
				<div>
					<label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Type</label>
					<select value={type} onChange={e => setType(e.target.value)}
						className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm focus:ring-2 focus:ring-cyan-500/30">
						<option value="stock">Stock</option>
						<option value="mutual">Mutual Fund</option>
						<option value="crypto">Crypto</option>
					</select>
				</div>

				<div className="md:col-span-2">
					<label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Symbol</label>
					<StockSearch 
						token={token}
						type={type}
						value={symbol}
						onInputChange={setSymbol}
						onSelect={(it) => { 
							setSymbol(it.symbol); 
							setName(it.name || it.symbol); 
						}}
						placeholder={type === 'crypto' ? 'Search crypto...' : 'Search stocks...'}
					/>
				</div>

				<div className="md:col-span-2">
					<label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Name</label>
					<input 
						value={name}
						onChange={e => setName(e.target.value)}
						className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm focus:ring-2 focus:ring-cyan-500/30"
					/>
				</div>

				<div className="md:col-span-1 flex items-end">
					<button type="submit" aria-label="Add to watchlist" className="px-3 py-2 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 text-white hover:from-cyan-500 hover:to-blue-500 w-full text-sm font-medium transition-all">
						Add
					</button>
				</div>
			</form>

			{error && <StatusMessage variant="error" message={error} onDismiss={() => setError('')} />}

			<div className="overflow-auto">
				<table className="w-full text-sm text-slate-700 dark:text-slate-300">
					<thead>
						<tr className="text-left border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider">
							<th className="pb-2 font-medium">Type</th>
							<th className="pb-2 font-medium">Symbol</th>
							<th className="pb-2 font-medium">Name</th>
							<th className="pb-2 font-medium text-right">Last Price</th>
							<th className="pb-2 font-medium text-right">Actions</th>
						</tr>
					</thead>

					<tbody>
						{items.map(i => (
							<tr 
								key={i.id} 
								className="border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
							>
								<td className="py-2">{i.type}</td>
								<td className="font-semibold">{i.symbol}</td>
								<td className="truncate max-w-[100px]">{i.name}</td>
								<td className="text-right">{formatNum(i.lastPriceINR ?? i.lastPrice)}</td>

								<td className="text-right">
									<button 
										className="text-red-500 hover:text-red-600 dark:hover:text-red-400 font-medium transition-colors"
										type="button" aria-label={`Remove ${i.symbol}`} onClick={() => removeItem(i.id)}>
										Remove
									</button>
								</td>
							</tr>
						))}
					</tbody>

				</table>
			</div>

			{!loading && items.length === 0 && (
				<EmptyState
					preset="noWatchlist"
					size="sm"
				/>
			)}
		</div>
	);
}

function formatNum(n) {
	const value = Number(n || 0);
	return value.toLocaleString('en-IN', { maximumFractionDigits: 2 });
}
