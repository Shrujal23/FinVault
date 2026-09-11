import { useMemo, useState } from 'react';
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ArrowUp, ArrowDown, Search } from 'lucide-react';

// Helper to format numbers as Indian Rupees
const formatCurrency = (value) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value || 0);
};

// Helper to format percentages
const formatPercent = (value) => {
  return `${(value || 0).toFixed(2)}%`;
};

export default function AssetTable({ assets = [] }) {
  const [query, setQuery] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'marketValue', direction: 'desc' });

  const filteredAssets = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    const baseAssets = normalized
      ? assets.filter((asset) => {
          const symbol = String(asset.symbol || '').toLowerCase();
          const name = String(asset.name || '').toLowerCase();
          return symbol.includes(normalized) || name.includes(normalized);
        })
      : assets;

    return [...baseAssets].sort((a, b) => {
      const direction = sortConfig.direction === 'asc' ? 1 : -1;

      switch (sortConfig.key) {
        case 'symbol':
          return direction * String(a.symbol || '').localeCompare(String(b.symbol || ''));
        case 'quantity':
          return direction * (Number(a.quantity || 0) - Number(b.quantity || 0));
        case 'avgBuyPrice':
          return direction * (Number(a.avgBuyPrice || 0) - Number(b.avgBuyPrice || 0));
        case 'lastPriceINR':
          return direction * (Number(a.lastPriceINR || 0) - Number(b.lastPriceINR || 0));
        case 'marketValue':
          return direction * (Number(a.marketValue || 0) - Number(b.marketValue || 0));
        case 'pnl':
          return direction * (Number(a.pnl || 0) - Number(b.pnl || 0));
        case 'returnPct':
          return direction * (Number(a.returnPct || 0) - Number(b.returnPct || 0));
        case 'name':
        default:
          return direction * String(a.name || '').localeCompare(String(b.name || ''));
      }
    });
  }, [assets, query, sortConfig]);

  const totals = useMemo(() => {
    const totalQuantity = filteredAssets.reduce((sum, asset) => sum + Number(asset.quantity || 0), 0);
    const totalCost = filteredAssets.reduce((sum, asset) => sum + Number(asset.avgBuyPrice || 0) * Number(asset.quantity || 0), 0);
    const totalMarketValue = filteredAssets.reduce((sum, asset) => sum + Number(asset.marketValue || 0), 0);
    const totalPnl = filteredAssets.reduce((sum, asset) => sum + Number(asset.pnl || 0), 0);
    const totalReturnPct = totalCost > 0 ? (totalPnl / totalCost) * 100 : 0;

    return {
      totalQuantity,
      avgBuyPrice: totalQuantity > 0 ? totalCost / totalQuantity : 0,
      totalMarketValue,
      totalPnl,
      totalReturnPct,
    };
  }, [filteredAssets]);

  const handleSort = (key) => {
    setSortConfig((current) => {
      if (current.key === key) {
        return {
          key,
          direction: current.direction === 'asc' ? 'desc' : 'asc',
        };
      }

      return { key, direction: 'asc' };
    });
  };

  const renderSortIcon = (key) => {
    if (sortConfig.key !== key) {
      return <span className="ml-1 text-slate-400">↕</span>;
    }

    return sortConfig.direction === 'asc'
      ? <ArrowUp className="ml-1 h-3.5 w-3.5" />
      : <ArrowDown className="ml-1 h-3.5 w-3.5" />;
  };

  if (!assets || assets.length === 0) {
    return (
      <div className="text-center py-12 text-slate-500 dark:text-slate-400 border-2 border-dashed rounded-xl">
        <p className="font-medium">No assets to display.</p>
        <p className="text-sm">Add your first asset to get started.</p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-3">
      <div className="rounded-2xl border border-slate-200/80 bg-white/90 px-3 py-2.5 shadow-[0_8px_24px_rgba(15,23,42,0.04)] backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/90">
        <div className="flex items-center gap-2 text-sm">
          <Search className="h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Filter by ticker or name"
            className="w-full border-0 bg-transparent outline-none text-slate-700 placeholder:text-slate-400 dark:text-slate-200"
          />
        </div>
      </div>

      <div className="w-full overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_10px_35px_rgba(15,23,42,0.06)] dark:border-slate-800 dark:bg-slate-950/40">
        <Table className="min-w-[980px]">
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-[250px] px-5 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                <button type="button" onClick={() => handleSort('name')} className="flex items-center gap-1 font-semibold text-slate-700 transition-colors hover:text-slate-900 dark:text-slate-200 dark:hover:text-white">
                  Asset {renderSortIcon('name')}
                </button>
              </TableHead>
              <TableHead className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                <button type="button" onClick={() => handleSort('quantity')} className="ml-auto flex items-center justify-end gap-1 font-semibold text-slate-700 transition-colors hover:text-slate-900 dark:text-slate-200 dark:hover:text-white">
                  Quantity {renderSortIcon('quantity')}
                </button>
              </TableHead>
              <TableHead className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                <button type="button" onClick={() => handleSort('avgBuyPrice')} className="ml-auto flex items-center justify-end gap-1 font-semibold text-slate-700 transition-colors hover:text-slate-900 dark:text-slate-200 dark:hover:text-white">
                  Avg. Buy Price {renderSortIcon('avgBuyPrice')}
                </button>
              </TableHead>
              <TableHead className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                <button type="button" onClick={() => handleSort('lastPriceINR')} className="ml-auto flex items-center justify-end gap-1 font-semibold text-slate-700 transition-colors hover:text-slate-900 dark:text-slate-200 dark:hover:text-white">
                  Last Price {renderSortIcon('lastPriceINR')}
                </button>
              </TableHead>
              <TableHead className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                <button type="button" onClick={() => handleSort('marketValue')} className="ml-auto flex items-center justify-end gap-1 font-semibold text-slate-700 transition-colors hover:text-slate-900 dark:text-slate-200 dark:hover:text-white">
                  Market Value {renderSortIcon('marketValue')}
                </button>
              </TableHead>
              <TableHead className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                <button type="button" onClick={() => handleSort('pnl')} className="ml-auto flex items-center justify-end gap-1 font-semibold text-slate-700 transition-colors hover:text-slate-900 dark:text-slate-200 dark:hover:text-white">
                  Total P&L {renderSortIcon('pnl')}
                </button>
              </TableHead>
              <TableHead className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                <button type="button" onClick={() => handleSort('returnPct')} className="ml-auto flex items-center justify-end gap-1 font-semibold text-slate-700 transition-colors hover:text-slate-900 dark:text-slate-200 dark:hover:text-white">
                  Total Return {renderSortIcon('returnPct')}
                </button>
              </TableHead>
              <TableHead className="w-[130px] px-5 py-3 text-right text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAssets.map((asset, index) => (
              <TableRow key={asset.id} className={`transition-colors hover:bg-slate-50/80 dark:hover:bg-slate-900/70 ${index % 2 === 1 ? 'bg-slate-50/40 dark:bg-slate-900/20' : 'bg-white dark:bg-transparent'}`}>
                <TableCell className="px-5 py-3">
                  <div className="font-medium text-slate-800 dark:text-slate-100">{asset.name}</div>
                  <div className="mt-1 flex items-center gap-2">
                    <span className="text-sm text-slate-500 dark:text-slate-400">{asset.symbol}</span>
                    <Badge variant="outline" className="rounded-full border-slate-200 text-xs capitalize text-slate-600 dark:border-slate-700 dark:text-slate-300">{asset.type.replace('_', ' ')}</Badge>
                  </div>
                </TableCell>
                <TableCell className="px-5 py-3 text-right font-mono text-slate-700 dark:text-slate-200">{asset.quantity}</TableCell>
                <TableCell className="px-5 py-3 text-right font-mono text-slate-700 dark:text-slate-200">{formatCurrency(asset.avgBuyPrice)}</TableCell>
                <TableCell className="px-5 py-3 text-right font-mono text-slate-700 dark:text-slate-200">{formatCurrency(asset.lastPriceINR)}</TableCell>
                <TableCell className="px-5 py-3 text-right font-semibold font-mono text-slate-800 dark:text-slate-100">{formatCurrency(asset.marketValue)}</TableCell>
                <TableCell className={`px-5 py-3 text-right font-semibold font-mono ${asset.pnl >= 0 ? 'text-green-600 dark:text-green-500' : 'text-red-600 dark:text-red-500'}`}>
                  {formatCurrency(asset.pnl)}
                </TableCell>
                <TableCell className={`px-5 py-3 text-right font-semibold font-mono ${asset.returnPct >= 0 ? 'text-green-600 dark:text-green-500' : 'text-red-600 dark:text-red-500'}`}>
                  <div className="flex items-center justify-end gap-1">{asset.returnPct >= 0 ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}{formatPercent(asset.returnPct)}</div>
                </TableCell>
                <TableCell className="px-5 py-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button type="button" className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 shadow-sm transition-all hover:-translate-y-0.5 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800">
                      Edit
                    </button>
                    <button type="button" className="rounded-lg border border-red-200 bg-red-50 px-2.5 py-1.5 text-xs font-semibold text-red-600 shadow-sm transition-all hover:-translate-y-0.5 hover:bg-red-100 dark:border-red-800 dark:bg-red-950/30 dark:text-red-400 dark:hover:bg-red-950/50">
                      Delete
                    </button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            <TableRow className="sticky bottom-0 z-20 border-t border-slate-300 bg-slate-900 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.15)] hover:bg-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:hover:bg-slate-800">
              <TableCell className="px-5 py-3 font-semibold">Total</TableCell>
              <TableCell className="px-5 py-3 text-right font-mono font-semibold">{totals.totalQuantity}</TableCell>
              <TableCell className="px-5 py-3 text-right font-mono font-semibold">{formatCurrency(totals.avgBuyPrice)}</TableCell>
              <TableCell className="px-5 py-3 text-right font-mono font-semibold">—</TableCell>
              <TableCell className="px-5 py-3 text-right font-mono font-semibold">{formatCurrency(totals.totalMarketValue)}</TableCell>
              <TableCell className={`px-5 py-3 text-right font-mono font-semibold ${totals.totalPnl >= 0 ? 'text-emerald-300' : 'text-rose-300'}`}>
                {formatCurrency(totals.totalPnl)}
              </TableCell>
              <TableCell className={`px-5 py-3 text-right font-mono font-semibold ${totals.totalReturnPct >= 0 ? 'text-emerald-300' : 'text-rose-300'}`}>
                {formatPercent(totals.totalReturnPct)}
              </TableCell>
              <TableCell className="px-5 py-3" />
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </div>
  );
}