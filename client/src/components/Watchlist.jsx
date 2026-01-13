import { useEffect, useState } from 'react';
import { apiRequest } from '../api/client.js';
import StockSearch from './StockSearch.jsx';

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
		<div className="bg-white dark:bg-slate-900 p-4 rounded shadow border border-gray-100 dark:border-slate-800">
			<div className="flex items-center justify-between mb-3">
				<h2 className="font-semibold">Watchlist</h2>
				<button 
					className="text-sm px-2 py-1 rounded bg-gray-100 dark:bg-slate-800"				type="button" aria-label="Refresh watchlist"					onClick={load}>
					Refresh
				</button>
			</div>

			<form onSubmit={addItem} className="grid grid-cols-1 md:grid-cols-6 gap-3 mb-4">
				<div>
					<label className="block text-sm mb-1">Type</label>
					<select value={type} onChange={e => setType(e.target.value)}
						className="w-full border rounded px-3 py-2 dark:bg-gray-800 dark:border-gray-700">
						<option value="stock">Stock</option>
						<option value="mutual">Mutual Fund</option>
						<option value="crypto">Crypto</option>
					</select>
				</div>

				<div className="md:col-span-2">
					<label className="block text-sm mb-1">Symbol</label>
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
					<label className="block text-sm mb-1">Name</label>
					<input 
						value={name}
						onChange={e => setName(e.target.value)}
						className="w-full border rounded px-3 py-2 dark:bg-gray-800 dark:border-gray-700"
					/>
				</div>

				<div className="md:col-span-1 flex items-end">
					<button type="submit" aria-label="Add to watchlist" className="px-3 py-2 rounded bg-green-600 text-white w-full">
						Add
					</button>
				</div>
			</form>

			{error && <div className="text-red-600 text-sm mb-2">{error}</div>}

			<div className="overflow-auto">
				<table className="w-full text-sm">
					<thead>
						<tr className="text-left border-b border-gray-100 dark:border-slate-800">
							<th className="py-2">Type</th>
							<th>Symbol</th>
							<th>Name</th>
							<th className="text-right">Last Price</th>
							<th className="text-right">Actions</th>
						</tr>
					</thead>

					<tbody>
						{items.map(i => (
							<tr 
								key={i.id} 
								className="border-b border-gray-100 dark:border-slate-800 hover:bg-gray-50 dark:hover:bg-slate-800"
							>
								<td className="py-2">{i.type}</td>
								<td>{i.symbol}</td>
								<td>{i.name}</td>
								<td className="text-right">{formatNum(i.lastPriceINR ?? i.lastPrice)}</td>

								<td className="text-right">
									<button 
										className="text-red-600"
										type="button" aria-label={`Remove ${i.symbol}`} onClick={() => removeItem(i.id)}>
										Remove
									</button>
								</td>
							</tr>
						))}
					</tbody>

				</table>
			</div>
		</div>
	);
}

function formatNum(n) {
	const value = Number(n || 0);
	return value.toLocaleString('en-IN', { maximumFractionDigits: 2 });
}
