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
    <div className="w-full max-w-6xl mx-auto">
      <div className="bg-white/90 dark:bg-slate-900/95 backdrop-blur-2xl rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 dark:from-emerald-700 dark:to-teal-700 px-8 py-6">
          <h2 className="text-3xl font-bold text-white flex items-center gap-4">
            {assetTypeIcons[type] || <PlusCircle className="w-8 h-8" />}
            {editing ? 'Edit Asset' : 'Add New Asset'}
          </h2>
          <p className="text-emerald-100 mt-2 text-lg">Enter details to track your investment</p>
        </div>

        {/* Form */}
        <div className="p-8">
          <form onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            {/* Asset Type */}
            <div className="xl:col-span-1">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2 mb-2">
                <LayoutDashboard className="w-4 h-4" />
                Asset Type
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full px-5 py-4 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 
                         focus:ring-2 focus:ring-slate-500/30 focus:border-slate-500 transition-all duration-200 font-medium"
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
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2 mb-2">
                <Hash className="w-4 h-4" />
                Symbol {(type === 'stock' || type === 'crypto' || type === 'mutual') && <span className="text-slate-600 dark:text-slate-400 text-xs font-semibold">(Live Search)</span>}
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
                  className="w-full px-5 py-4 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 
                           focus:ring-2 focus:ring-slate-500/30 focus:border-slate-500 transition-all duration-200 uppercase font-mono text-lg tracking-wider"
                  placeholder="e.g. BTC, HDFC MF"
                  required
                />
              )}
            </div>

            {/* Full Name */}
            <div className="md:col-span-2 xl:col-span-2">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2 mb-2">
                <Building2 className="w-4 h-4" />
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-5 py-4 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 
                         focus:ring-2 focus:ring-slate-500/30 focus:border-slate-500 transition-all duration-200"
                placeholder="e.g. Reliance Industries Limited, Bitcoin"
                required
              />
            </div>

            {/* Quantity */}
            <div>
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2 mb-2">
                <Hash className="w-4 h-4" />
                Quantity
              </label>
              <input
                type="text"
                value={formatNumber(quantity)}
                onChange={(e) => setQuantity(formatNumber(e.target.value))}
                className="w-full px-5 py-4 rounded-2xl border-2 border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 
                         focus:ring-4 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all font-mono"
                placeholder="1,000"
                required
              />
            </div>

            {/* Avg Buy Price */}
            <div>
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2 mb-2">
                <DollarSign className="w-4 h-4" />
                Average Buy Price
              </label>
              <div className="relative">
                <span className="absolute left-5 top-4 text-xl font-bold text-slate-600 dark:text-slate-400">₹</span>
                <input
                  type="text"
                  value={formatNumber(avgBuyPrice)}
                  onChange={(e) => setAvgBuyPrice(formatNumber(e.target.value))}
                  className="w-full pl-12 pr-5 py-4 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 
                           focus:ring-2 focus:ring-slate-500/30 focus:border-slate-500 transition-all duration-200 font-mono"
                  placeholder="2,450.75"
                  required
                />
              </div>
            </div>

            {/* Sector */}
            <div>
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2 mb-2">
                <Tag className="w-4 h-4" />
                Sector / Category
              </label>
              <input
                type="text"
                value={sector}
                onChange={(e) => setSector(e.target.value)}
                className="w-full px-5 py-4 rounded-2xl border-2 border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 
                         focus:ring-4 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all capitalize"
                placeholder="e.g. Technology, Banking"
              />
            </div>

            {/* Tags */}
            <div className="md:col-span-2 xl:col-span-1">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2 mb-2">
                <Tag className="w-4 h-4" />
                Tags (optional)
              </label>
              <input
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                className="w-full px-5 py-4 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 
                         focus:ring-2 focus:ring-slate-500/30 focus:border-slate-500 transition-all duration-200"
                placeholder="growth, dividend, long-term"
              />
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">Separate with commas</p>
            </div>

            {/* Submit & Feedback */}
            <div className="md:col-span-2 xl:col-span-4 flex flex-col sm:flex-row items-center gap-6 mt-8">
              <button
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto px-8 py-3 rounded-lg bg-slate-700 hover:bg-slate-600 dark:bg-slate-600 dark:hover:bg-slate-500 text-white font-semibold
                         shadow-sm disabled:opacity-70 disabled:cursor-not-allowed
                         flex items-center justify-center gap-3 transition-colors"
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
                <div className="flex items-center gap-3 text-emerald-600 dark:text-emerald-400 font-bold text-lg animate-in slide-in-from-bottom duration-500">
                  <CheckCircle2 className="w-7 h-7" />
                  Asset saved successfully!
                </div>
              )}
              {error && (
                <div className="flex items-center gap-3 text-red-600 dark:text-red-400 font-medium animate-in fade-in duration-300">
                  <AlertCircle className="w-6 h-6" />
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