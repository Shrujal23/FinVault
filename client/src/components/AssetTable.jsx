import { useMemo, useState, useEffect } from "react";
import { apiRequest } from "../api/client.js";
import AssetForm from "./AssetForm.jsx";
import { ArrowUp, ArrowDown, Search, Trash2, AlertTriangle, Loader2 } from "lucide-react";

export default function AssetTable({ rows = [], onChange, token, hoveredSymbol, externalFilter = '', selectedSymbol = null }) {
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null); // { id, symbol, loading, error }
  const [sort, setSort] = useState({ key: "symbol", dir: "asc" });
  const [filter, setFilter] = useState("");

  const hasPriceData = rows.length > 0;

  // Sync external filter (like clicking a pie slice) into the table filter
  useEffect(() => {
    setFilter((prev) => {
      // if externalFilter is empty, keep existing custom filter
      if (!externalFilter) return prev;
      return externalFilter;
    });
  }, [externalFilter]);

  const view = useMemo(() => {
    let result = rows.filter((a) => matchFilter(a, filter));
    result.sort((a, b) => compare(a, b, sort.key, sort.dir));
    return result;
  }, [rows, filter, sort]);

  // When a symbol is selected externally, scroll it into view for the user
  useEffect(() => {
    if (!selectedSymbol) return;
    // allow DOM updates to happen first
    const id = setTimeout(() => {
      const el = document.querySelector(`tr[data-symbol="${selectedSymbol}"]`);
      if (el && typeof el.scrollIntoView === 'function') {
        el.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });
      }
    }, 80);
    return () => clearTimeout(id);
  }, [selectedSymbol]);

  const totalMarketValue = view.reduce((sum, a) => sum + (a.marketValue || 0), 0);

  async function onDelete(id) {
    setDeleting(d => ({ ...d, loading: true, error: '' }));
    try {
      await apiRequest(`/api/assets/${id}`, { method: "DELETE", token });
      setDeleting(null); // Close modal on success
      onChange?.();
    } catch (e) {
      setDeleting(d => ({ ...d, loading: false, error: e.message || 'Failed to delete asset.' }));
    }
  }
  function startDelete(asset) {
    setDeleting({ id: asset.id, symbol: asset.symbol, loading: false, error: '' });
  }

  function onSort(key) {
    setSort((prev) =>
      prev.key === key
        ? { key, dir: prev.dir === "asc" ? "desc" : "asc" }
        : { key, dir: "asc" }
    );
  }

  return (
    <div className="w-full">
      {/* Search */}
      <div className="mb-5 relative w-full max-w-md">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder="Search symbol or name..."
          className="w-full pl-11 pr-4 py-2.5 rounded-lg border dark:border-gray-600 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Mobile Card View */}
      <div className="space-y-3 mb-6 md:hidden">
        {view.length === 0 ? (
          <div className="rounded-lg border border-dashed border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 text-center text-sm text-slate-600 dark:text-slate-400">
            No assets yet. Add your first holding with the &quot;Add New Asset&quot; form below.
          </div>
        ) : (
          view.map((a) => {
            const isSelected = hoveredSymbol === a.symbol || selectedSymbol === a.symbol;
            return (
              <div
                key={a.id}
                className={`rounded-lg border bg-white dark:bg-slate-900 p-4 flex flex-col gap-2 ${
                  isSelected ? 'border-slate-400 dark:border-slate-500' : 'border-slate-200 dark:border-slate-800'
                }`}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-semibold text-slate-900 dark:text-white">{a.symbol}</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-[180px]">
                      {a.name}
                    </div>
                  </div>
                  <div className="text-right text-xs text-slate-500 dark:text-slate-400">
                    Qty&nbsp;
                    <span className="font-mono text-slate-800 dark:text-slate-100">
                      {formatNum(a.quantity)}
                    </span>
                  </div>
                </div>
                {hasPriceData && (
                  <div className="flex justify-between items-center text-xs mt-1">
                    <div className="text-slate-500 dark:text-slate-400">
                      Mkt Value:&nbsp;
                      <span className="font-mono text-slate-900 dark:text-slate-100">
                        ₹{formatNum(a.marketValue)}
                      </span>
                    </div>
                    <div
                      className={`font-mono ${
                        a.pnl >= 0 ? 'text-emerald-700 dark:text-emerald-500' : 'text-red-700 dark:text-red-500'
                      }`}
                    >
                      ₹{formatNum(a.pnl)} ({a.returnPct >= 0 ? '+' : ''}
                      {formatNum(a.returnPct)}%)
                    </div>
                  </div>
                )}
                <div className="flex justify-end gap-3 mt-2">
                  <button
                    type="button"
                    onClick={() => setEditing(a)}
                    className="text-xs px-3 py-1 rounded-md border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200"
                    aria-label={`Edit ${a.symbol}`}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => startDelete(a)}
                    className="text-xs px-3 py-1 rounded-md bg-red-600 text-white"
                    aria-label={`Delete ${a.symbol}`}
                  >
                    Delete
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Responsive Table Container (desktop / tablet) */}
      <div className="overflow-x-auto rounded-xl border dark:border-gray-700 shadow-lg hidden md:block">
        <table aria-label="Assets table" className="w-full min-w-[850px] text-sm bg-white dark:bg-slate-900">
          <thead className="bg-gray-50 dark:bg-slate-800 text-xs font-medium uppercase text-gray-700 dark:text-gray-300 border-b dark:border-gray-700 ">
            <tr>
              <Th label="Symbol" sortKey="symbol" sort={sort} onSort={onSort} />
              <Th label="Name" sortKey="name" sort={sort} onSort={onSort} />
              <Th label="Qty" sortKey="quantity" sort={sort} onSort={onSort} align="right" />
              <Th label="Avg Buy" sortKey="avg_buy_price" sort={sort} onSort={onSort} align="right" />

              {hasPriceData && (
                <>
                  <Th label="Last" sortKey="lastPriceINR" sort={sort} onSort={onSort} align="right" />
                  <Th label="Mkt Value" sortKey="marketValue" sort={sort} onSort={onSort} align="right" />
                  <Th label="P&L" sortKey="pnl" sort={sort} onSort={onSort} align="right" />
                  <Th label="%" sortKey="returnPct" sort={sort} onSort={onSort} align="right" />
                </>
              )}

              {/* Sticky Actions Column – ALWAYS VISIBLE */}
              <th className="sticky right-0 bg-gray-50 dark:bg-slate-800 px-6 py-3 text-center font-medium">
                Actions
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {view.length === 0 ? (
              <tr className="bg-white dark:bg-slate-900">
                <td colSpan={hasPriceData ? 9 : 5} className="py-12 px-6 text-center text-gray-500 dark:text-gray-400">
                  <div className="space-y-2">
                    <p className="font-semibold">No assets yet</p>
                    <p className="text-sm">Add your first holding with the "Add New Asset" form below.</p>
                    <div className="mt-3">
                      <button type="button" onClick={() => window.location.hash = '#add-asset'} className="px-4 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 dark:bg-slate-600 dark:hover:bg-slate-500 text-white transition-colors">Add an asset</button>
                    </div>
                  </div>
                </td>
              </tr>
            ) : (
              view.map((a) => (
                <tr
                  key={a.id}
                  data-symbol={a.symbol}
                  className={`transition-all duration-200 ${
                    (hoveredSymbol === a.symbol || selectedSymbol === a.symbol) ? 'bg-slate-100 dark:bg-slate-800/50 ring-1 ring-slate-300 dark:ring-slate-700' : ''
                  } hover:bg-gray-50 dark:hover:bg-slate-800`}
                >
                  <td
                    role="button"
                    tabIndex={0}
                    onClick={() => setEditing(a)}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setEditing(a); }}
                    aria-label={`Edit ${a.symbol}`}
                    className="py-4 px-4 font-semibold cursor-pointer hover:underline"
                  >
                    {a.symbol}
                  </td>
                  <td className="py-4 px-4 text-gray-600 dark:text-gray-300 max-w-xs truncate">{a.name}</td>
                  <td className="py-4 px-4 text-right font-mono">{formatNum(a.quantity)}</td>
                  <td className="py-4 px-4 text-right font-mono">₹{formatNum(a.avg_buy_price ?? a.avgBuyPrice)}</td>

                  {hasPriceData && (
                    <>
                      <td className="py-4 px-4 text-right text-gray-600 font-mono">₹{formatNum(a.lastPriceINR)}</td>
                      <td className="py-4 px-4 text-right font-semibold font-mono">₹{formatNum(a.marketValue)}</td>
                      <td className={`py-4 px-4 text-right font-semibold font-mono ${a.pnl >= 0 ? "text-emerald-700 dark:text-emerald-500" : "text-red-700 dark:text-red-500"}`}>
                        ₹{formatNum(a.pnl)}
                      </td>
                      <td className={`py-4 px-4 text-right font-semibold font-mono ${a.returnPct >= 0 ? "text-emerald-700 dark:text-emerald-500" : "text-red-700 dark:text-red-500"}`}>
                        {a.returnPct >= 0 ? "+" : ""}{formatNum(a.returnPct)}%
                      </td>
                    </>
                  )}

                  {/* Sticky Actions – Never Hidden */}
                  <td className="sticky right-0 bg-white dark:bg-slate-900 py-4 px-6 text-center border-l dark:border-gray-700">
                    <button type="button" onClick={() => setEditing(a)} aria-label={`Edit ${a.symbol}`} className="text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white font-medium mr-4 transition-colors">Edit</button>
                    <button type="button" onClick={() => startDelete(a)} aria-label={`Delete ${a.symbol}`} className="text-red-700 dark:text-red-500 hover:text-red-900 dark:hover:text-red-400 font-medium transition-colors">Delete</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>

          {/* Total Row – Always Visible */}
          <tfoot>
            <tr className="bg-slate-100 dark:bg-slate-800/50 font-semibold text-lg">
              <td colSpan={hasPriceData ? 5 : 3} className="py-4 px-6 text-left text-slate-800 dark:text-slate-200">
                Total Portfolio Value
              </td>
              <td colSpan={hasPriceData ? 3 : 1} className="py-4 px-6 text-right text-slate-900 dark:text-white font-mono">
                ₹{formatNum(totalMarketValue)}
              </td>
              {/* Sticky empty cell to match Actions column */}
              <td className="sticky right-0 bg-slate-100 dark:bg-slate-800/50 border-l dark:border-gray-700"></td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Edit Modal */}
      {editing && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl max-w-2xl w-full">
            <div className="flex justify-between items-center mb-4 p-6 pb-0">
              <h3 className="text-xl font-bold">Edit {editing.symbol}</h3>
              <button type="button" onClick={() => setEditing(null)} aria-label="Close edit dialog" className="text-2xl text-gray-500">×</button>
            </div>
            <div className="p-6 pt-2 overflow-x-auto">
              <AssetForm
                token={token}
                editing={{
                  id: editing.id, 
                  type: editing.type,
                  symbol: editing.symbol,
                  name: editing.name,
                  quantity: editing.quantity,
                  avgBuyPrice: editing.avg_buy_price ?? editing.avgBuyPrice ?? 0,
                }}
                onSaved={() => {
                  setEditing(null);
                  onChange?.();
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleting && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl max-w-md w-full p-6 text-center">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 dark:bg-red-900/30 mb-4">
              <AlertTriangle className="h-8 w-8 text-red-600 dark:text-red-400" />
            </div>
            <h3 className="text-xl font-bold mb-2">Delete Asset</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Are you sure you want to delete <strong>{deleting.symbol}</strong>? This action cannot be undone.
            </p>

            {deleting.error && (
              <div className="text-red-500 bg-red-100 dark:bg-red-900/50 p-3 rounded-lg mb-4 text-sm">
                {deleting.error}
              </div>
            )}

            <div className="flex justify-center gap-4">
              <button
                type="button"
                onClick={() => setDeleting(null)}
                disabled={deleting.loading}
                className="px-6 py-2.5 rounded-lg border dark:border-slate-600 text-gray-700 dark:text-gray-200 font-medium hover:bg-gray-100 dark:hover:bg-slate-700 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => onDelete(deleting.id)}
                disabled={deleting.loading}
                className="px-6 py-2.5 rounded-lg bg-red-600 text-white font-semibold hover:bg-red-700 disabled:bg-red-400 flex items-center gap-2"
              >
                {deleting.loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" /> Deleting...
                  </>
                ) : (
                  'Delete'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* Safe Sort Header */
function Th({ label, sortKey, sort, onSort, align = "left" }) {
  const isSorted = sort?.key === sortKey;

  return (
    <th
      onClick={() => onSort(sortKey)}
      className={`px-6 py-3 text-${align} font-medium cursor-pointer select-none hover:bg-gray-100 dark:hover:bg-slate-700 whitespace-nowrap`}
    >
      <div className={`flex items-center gap-2 ${align === 'right' ? 'justify-end' : 'justify-start'}`}>
        {label}
        {isSorted && (
          sort.dir === "asc" 
            ? <ArrowUp className="w-3 h-3" /> 
            : <ArrowDown className="w-3 h-3" />
        )}
      </div>
    </th>
  );
}

/*utils*/
function matchFilter(a, f) {
  const q = (f || "").trim().toUpperCase();
  if (!q) return true;
  return (
    (a.symbol || "").toUpperCase().includes(q) ||
    (a.name || "").toUpperCase().includes(q)
  );
}

function compare(a, b, key, dir) {
  const va = normalize(a, key);
  const vb = normalize(b, key);
  if (va < vb) return dir === "asc" ? -1 : 1;
  if (va > vb) return dir === "asc" ? 1 : -1;
  return 0;
}

function normalize(obj, key) {
  if (key === "avg_buy_price") {
    return Number(obj.avg_buy_price ?? obj.avgBuyPrice ?? 0);
  }
  const val = obj[key];
  return typeof val === "string" ? val.toUpperCase() : Number(val ?? 0);
}

function formatNum(n) {
  if (n == null) return "0.00";
  return Number(n).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}