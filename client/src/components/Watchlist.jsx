import { useEffect, useState } from 'react';
import { apiRequest } from '../api/client.js';
import StockSearch from './StockSearch.jsx';
import EmptyState from './EmptyState.jsx';
import StatusMessage from './StatusMessage.jsx';
import {
	Table,
	TableHeader,
	TableRow,
	TableHead,
	TableBody,
	TableCell,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Trash2 } from 'lucide-react';

export default function Watchlist({ token }) {
	const [items, setItems] = useState([]);
	const [symbol, setSymbol] = useState('');
	const [name, setName] = useState('');
	const [type, setType] = useState('stock');
	const [editingId, setEditingId] = useState(null);
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
			if (editingId) {
				await apiRequest(`/api/watchlist/${editingId}`, {
					method: 'PUT',
					body: { type, symbol, name },
					token,
				});
			} else {
				await apiRequest('/api/watchlist', {
					method: 'POST',
					body: { type, symbol, name },
					token,
				});
			}
			setSymbol('');
			setName('');
			setType('stock');
			setEditingId(null);
			load();
		} catch (e) {
			setError(e.message);
		}
	}

	function startEdit(item) {
		setEditingId(item.id);
		setType(item.type || 'stock');
		setSymbol(item.symbol || '');
		setName(item.name || '');
	}

	async function removeItem(id) {
		try {
			await apiRequest(`/api/watchlist/${id}`, { method: 'DELETE', token });
			if (editingId === id) {
				setEditingId(null);
				setSymbol('');
				setName('');
				setType('stock');
			}
			load();
		} catch (e) {
			setError(e.message);
		}
	}

	return (
		<div className="rounded-2xl border border-slate-200/80 bg-white/90 p-6 shadow-[0_10px_35px_rgba(15,23,42,0.06)] backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/95">
			<div className="mb-6 flex items-center justify-between">
				<h2 className="text-xl font-semibold text-slate-800 dark:text-white">Watchlist</h2>
				<button 
					className="rounded-md border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800" type="button" aria-label="Refresh watchlist" onClick={load}>
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
					<button type="submit" aria-label={editingId ? 'Update watchlist item' : 'Add to watchlist'} className="px-3 py-2 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 text-white hover:from-cyan-500 hover:to-blue-500 w-full text-sm font-medium transition-all">
						{editingId ? 'Update' : 'Add'}
					</button>
				</div>
			</form>

			{error && <StatusMessage variant="error" message={error} onDismiss={() => setError('')} />}

			<div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_10px_35px_rgba(15,23,42,0.06)] dark:border-slate-800 dark:bg-slate-950/40">
				<Table className="min-w-[720px]">
					<TableHeader>
						<TableRow className="hover:bg-transparent">
							<TableHead className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Type</TableHead>
							<TableHead className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Symbol</TableHead>
							<TableHead className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Name</TableHead>
							<TableHead className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Last Price</TableHead>
							<TableHead className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Actions</TableHead>
						</TableRow>
					</TableHeader>

					<TableBody>
						{items.map((i, index) => (
							<TableRow
								key={i.id}
								className={`transition-colors hover:bg-slate-50/80 dark:hover:bg-slate-900/70 ${index % 2 === 1 ? 'bg-slate-50/40 dark:bg-slate-900/20' : 'bg-white dark:bg-transparent'}`}
							>
								<TableCell className="px-5 py-3">
									<Badge variant="outline" className="rounded-full border-slate-200 capitalize text-slate-600 dark:border-slate-700 dark:text-slate-300">
										{i.type}
									</Badge>
								</TableCell>
								<TableCell className="px-5 py-3 font-semibold text-slate-800 dark:text-slate-100">{i.symbol}</TableCell>
								<TableCell className="px-5 py-3 text-slate-600 dark:text-slate-300">
									<div className="max-w-[220px] truncate">{i.name}</div>
								</TableCell>
								<TableCell className="px-5 py-3 text-right font-mono text-slate-700 dark:text-slate-200">{formatNum(i.lastPriceINR ?? i.lastPrice)}</TableCell>

								<TableCell className="px-5 py-3 text-right">
									<div className="flex items-center justify-end gap-2">
										<button
											className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 shadow-sm transition-all hover:-translate-y-0.5 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
											type="button"
											aria-label={`Edit ${i.symbol}`}
											onClick={() => startEdit(i)}>
											Edit
										</button>
										<button
											className="rounded-lg border border-red-200 bg-red-50 px-2.5 py-1.5 text-xs font-semibold text-red-600 shadow-sm transition-all hover:-translate-y-0.5 hover:bg-red-100 dark:border-red-800 dark:bg-red-950/30 dark:text-red-400 dark:hover:bg-red-950/50"
											type="button" aria-label={`Remove ${i.symbol}`} onClick={() => removeItem(i.id)}>
											<Trash2 className="h-4 w-4" />
										</button>
									</div>
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
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
