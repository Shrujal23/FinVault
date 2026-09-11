import { useEffect, useState } from 'react';
import { apiRequest } from '../api/client.js';
import StockSearch from './StockSearch.jsx';
import { 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  Tag, 
  DollarSign, 
  Hash, 
  Building2, 
  Coins,
  TrendingUp,
  Home,
  Wallet,
  LayoutDashboard,
  PlusCircle
} from 'lucide-react';
export default function AssetForm({ token, onSaved, editing }) {
  const [type, setType] = useState('stock');
  const [symbol, setSymbol] = useState('');
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [avgBuyPrice, setAvgBuyPrice] = useState('');
  const [sector, setSector] = useState('');
  const [tags, setTags] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Auto-fill when editing
  useEffect(() => {
    if (editing) {
      setType(editing.type || 'stock');
      setSymbol(editing.symbol || '');
      setName(editing.name || '');
      setQuantity(editing.quantity ? String(editing.quantity) : '');
      const buyPrice = editing.avgBuyPrice ?? editing.avg_buy_price;
      setAvgBuyPrice(buyPrice != null ? String(buyPrice) : '');
      setSector(editing.sector || '');
      setTags(editing.tags ? editing.tags.join(', ') : '');
    }
  }, [editing]);

  // Auto-clear success message
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(false), 4000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  const formatNumber = (val) => {
    if (!val) return '';
    const num = val.replace(/,/g, '');
    if (isNaN(num)) return val;
    return Number(num).toLocaleString('en-IN', { maximumFractionDigits: 6 });
  };

  const parseNumber = (val) => val.replace(/,/g, '');

  async function onSubmit(e) {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (!symbol.trim()) return setError('Symbol is required');
    if (!name.trim()) return setError('Name is required');
    if (!quantity || isNaN(parseNumber(quantity))) return setError('Valid quantity required');
    if (!avgBuyPrice || isNaN(parseNumber(avgBuyPrice))) return setError('Valid buy price required');

    setLoading(true);
    try {
      const body = {
        type,
        symbol: symbol.trim().toUpperCase(),
        name: name.trim(),
        quantity: Number(parseNumber(quantity)),
        avgBuyPrice: Number(parseNumber(avgBuyPrice)),
        sector: sector.trim() || null,
        tags: tags
          ? tags.split(',').map(t => t.trim()).filter(Boolean)
          : null
      };

      if (editing) {
        await apiRequest(`/api/assets/${editing.id}`, { method: 'PUT', body, token });
      } else {
        await apiRequest('/api/assets', { method: 'POST', body, token });
      }

      if (!editing) {
        setSymbol(''); setName(''); setQuantity(''); setAvgBuyPrice(''); setSector(''); setTags('');
        setType('stock');
      }

      setSuccess(true);
      onSaved?.();
    } catch (err) {
      setError(err.message || 'Failed to save asset. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  const isStock = type === 'stock';

  const assetTypeIcons = {
    stock: <TrendingUp className="w-5 h-5" />,
    mutual: <Building2 className="w-5 h-5" />,
    crypto: <Coins className="w-5 h-5" />,
    real_estate: <Home className="w-5 h-5" />,
    fd: <DollarSign className="w-5 h-5" />,
    cash: <Wallet className="w-5 h-5" />,
  };

  return (
    <div className="mx-auto w-full max-w-6xl">
      <div className="overflow-hidden rounded-[24px] border border-slate-200/80 bg-white/90 shadow-[0_18px_45px_rgba(15,23,42,0.08)] backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/95">
        <div className="border-b border-slate-200/70 bg-gradient-to-r from-slate-900 via-slate-800 to-cyan-700 px-8 py-6 dark:border-slate-800">
          <h2 className="flex items-center gap-3 text-2xl font-semibold text-white">
            {assetTypeIcons[type] || <PlusCircle className="h-7 w-7" />}
            {editing ? 'Edit Asset' : 'Add New Asset'}
          </h2>
          <p className="mt-2 text-sm text-cyan-100">Capture your portfolio details with a clear, structured form.</p>
        </div>

        <div className="p-8">
          <form onSubmit={onSubmit} className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
            {/* Asset Type */}
            <div className="xl:col-span-1">
              <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
                <LayoutDashboard className="h-4 w-4" />
                Asset Type
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm font-medium text-slate-700 shadow-sm transition-all focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              >
                <option value="stock">📈 Stock</option>
                <option value="mutual">🏦 Mutual Fund</option>
                <option value="crypto">₿ Cryptocurrency</option>
                <option value="real_estate">🏠 Real Estate</option>
                <option value="fd">🏧 Fixed Deposit</option>
                <option value="cash">💰 Cash / Gold</option>
              </select>
            </div>

            {/* Symbol */}
            <div className="xl:col-span-1">
              <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
                <Hash className="h-4 w-4" />
                Symbol {(type === 'stock' || type === 'crypto' || type === 'mutual') && <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">(Live Search)</span>}
              </label>
              {type === 'stock' || type === 'crypto' || type === 'mutual' ? (
                <StockSearch
                  token={token}
                  type={type}
                  value={symbol}
                  onInputChange={setSymbol}
                  onSelect={(item) => {
                    setSymbol(item.symbol);
                    setName(item.name || item.symbol);
                    setSector(item.sector || '');
                  }}
                  placeholder={
                    type === 'crypto' ? 'Type to search crypto (e.g., BTC, XRP)...' :
                    type === 'mutual' ? 'Type to search mutual funds...' :
                    'Type to search stocks...'
                  }
                />
              ) : (
                <input
                  type="text"
                  value={symbol}
                  onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm font-mono uppercase tracking-wider text-slate-700 shadow-sm transition-all focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                  placeholder="e.g. BTC, HDFC MF"
                  required
                />
              )}
            </div>

            {/* Full Name */}
            <div className="md:col-span-2 xl:col-span-2">
              <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
                <Building2 className="h-4 w-4" />
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm text-slate-700 shadow-sm transition-all focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                placeholder="e.g. Reliance Industries Limited, Bitcoin"
                required
              />
            </div>

            {/* Quantity */}
            <div>
              <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
                <Hash className="h-4 w-4" />
                Quantity
              </label>
              <input
                type="text"
                value={formatNumber(quantity)}
                onChange={(e) => setQuantity(formatNumber(e.target.value))}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm font-mono text-slate-700 shadow-sm transition-all focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                placeholder="1,000"
                required
              />
            </div>

            {/* Avg Buy Price */}
            <div>
              <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
                <DollarSign className="h-4 w-4" />
                Average Buy Price
              </label>
              <div className="relative">
                <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-lg font-semibold text-slate-500 dark:text-slate-400">₹</span>
                <input
                  type="text"
                  value={formatNumber(avgBuyPrice)}
                  onChange={(e) => setAvgBuyPrice(formatNumber(e.target.value))}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3.5 pl-10 pr-4 text-sm font-mono text-slate-700 shadow-sm transition-all focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                  placeholder="2,450.75"
                  required
                />
              </div>
            </div>

            {/* Sector */}
            <div>
              <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
                <Tag className="h-4 w-4" />
                Sector / Category
              </label>
              <input
                type="text"
                value={sector}
                onChange={(e) => setSector(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm capitalize text-slate-700 shadow-sm transition-all focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                placeholder="e.g. Technology, Banking"
              />
            </div>

            {/* Tags */}
            <div className="md:col-span-2 xl:col-span-1">
              <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
                <Tag className="h-4 w-4" />
                Tags (optional)
              </label>
              <input
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm text-slate-700 shadow-sm transition-all focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                placeholder="growth, dividend, long-term"
              />
              <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">Separate with commas</p>
            </div>

            {/* Submit & Feedback */}
            <div className="mt-6 flex flex-col items-start gap-4 md:col-span-2 xl:col-span-4 sm:flex-row sm:items-center">
              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:-translate-y-0.5 hover:from-cyan-500 hover:to-blue-500 disabled:cursor-not-allowed disabled:opacity-70 sm:w-auto"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-6 h-6 animate-spin" />
                    Saving Asset...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-6 h-6" />
                    {editing ? 'Update Asset' : 'Add to Portfolio'}
                  </>
                )}
              </button>

              {/* Messages */}
              <div className="flex-1" />
              {success && (
                <div className="flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400">
                  <CheckCircle2 className="h-5 w-5" />
                  Asset saved successfully!
                </div>
              )}
              {error && (
                <div className="flex items-center gap-2 rounded-full bg-red-50 px-4 py-2 text-sm font-medium text-red-700 dark:bg-red-950/30 dark:text-red-400">
                  <AlertCircle className="h-5 w-5" />
                  {error}
                </div>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}