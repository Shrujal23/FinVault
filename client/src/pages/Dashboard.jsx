import { useEffect, useState, useMemo } from 'react';
import { apiRequest } from '../api/client.js';
import AssetForm from '../components/AssetForm.jsx';
import CombinedAssetPanel from '../components/CombinedAssetPanel.jsx';
import DashboardCards from '../components/DashboardCards.jsx';
import PerformanceChart from '../components/PerformanceChart.jsx';
import { CardsSkeleton, TableSkeleton } from '../components/Skeleton.jsx';
import MarketNews from '../components/MarketNews.jsx';
import Watchlist from '../components/Watchlist.jsx';
import {
  ArrowUpRight,
  ArrowDownRight,
  Wallet,
  PieChart,
  PlusCircle,
  Newspaper,
  Target,
  TrendingUp,
  History,
  RefreshCw,
  Link,
  CheckCircle,
  AlertCircle,
  XCircle,
  Play,
  Pause,
} from 'lucide-react';

export default function Dashboard({ auth }) {
  const { token, user } = auth;
  const [assets, setAssets] = useState([]);
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showBrokerModal, setShowBrokerModal] = useState(false);
  const [activeBrokerSection, setActiveBrokerSection] = useState('main');

  // Compact mode for denser dashboard layout (persisted)
  const [compactMode, setCompactMode] = useState(() => localStorage.getItem('dashboard.compact') === 'true');
  useEffect(() => { localStorage.setItem('dashboard.compact', compactMode ? 'true' : 'false'); }, [compactMode]);

  const refreshData = async () => {
    if (!token) return;
    try {
      setIsRefreshing(true);
      setLoading(true);
      const [a, s] = await Promise.all([
        apiRequest('/api/assets', { token }),
        apiRequest('/api/portfolio/summary', { token }),
      ]);
      setAssets(a.assets || []);
      setSummary(s);
      setError('');
    } catch (e) {
      setError(e.message || 'Failed to load portfolio data');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    refreshData();
  }, [token, refreshTrigger]);

  const allocation = summary?.allocation || [];

  const metrics = useMemo(() => {
    if (!summary?.items || !assets.length) return null;

    const assetMap = new Map(assets.map(a => [a.symbol, a]));
    const itemsWithId = summary.items.map(item => ({
      ...item,
      id: assetMap.get(item.symbol)?.id,
    }));

    const totals = itemsWithId.reduce((acc, i) => {
      const cost = Number(i.quantity) * Number(i.avgBuyPrice);
      acc.invested += cost;
      acc.market += Number(i.marketValue);
      return acc;
    }, { invested: 0, market: 0 });

    const pnl = totals.market - totals.invested;
    const returnPct = totals.invested > 0 ? (pnl / totals.invested) * 100 : 0;

    return { ...totals, pnl, returnPct, items: itemsWithId };
  }, [summary, assets]);

  const topMovers = useMemo(() => {
    if (!metrics?.items) return { gainers: [], losers: [] };
    const sorted = [...metrics.items]
      .filter(i => i.change_pct_1d != null)
      .sort((a, b) => b.change_pct_1d - a.change_pct_1d);
    return {
      gainers: sorted.slice(0, 4),
      losers: sorted.slice(-4).reverse(),
    };
  }, [metrics]);

  const userName = user?.name || user?.email?.split('@')[0] || 'Investor';

  // Selection state used to link movers <-> holdings table
  const [selectedSymbol, setSelectedSymbol] = useState(null);
  const [hoveredSymbol, setHoveredSymbol] = useState(null);
  const [moversAutoplay, setMoversAutoplay] = useState(false);

  // Autoplay: cycle selection across top movers when enabled
  useEffect(() => {
    if (!moversAutoplay) return;
    const flat = [...topMovers.gainers, ...topMovers.losers].filter(Boolean);
    if (!flat.length) return;
    let idx = 0;
    const tick = () => {
      setSelectedSymbol(flat[idx % flat.length].symbol);
      idx += 1;
    };
    // start immediately
    tick();
    const id = setInterval(tick, 3000);
    return () => clearInterval(id);
  }, [moversAutoplay, topMovers]);

  // Mock connected brokers - replace with real API later
  const connectedBrokers = {
    zerodha: true,
    upstox: false,
    alpaca: false,
    interactive: true,
  };

  const BrokerModal = () => (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-md" onClick={() => setShowBrokerModal(false)} />
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-gray-200 dark:border-slate-800 overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-slate-800">
          <div className="flex items-center gap-3">
            {activeBrokerSection === 'brokers' && (
              <button type="button" onClick={() => setActiveBrokerSection('main')} aria-label="Back" className="p-1 rounded hover:bg-gray-100 dark:hover:bg-slate-800">
                <ArrowLeft className="w-6 h-6" />
              </button>
            )}
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
              <Link className="w-7 h-7 text-blue-600 dark:text-cyan-400" />
              {activeBrokerSection === 'main' ? 'Link Broker Account' : 'Available Brokers'}
            </h3>
          </div>
          <button type="button" onClick={() => setShowBrokerModal(false)} aria-label="Close" className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800">
            <XCircle className="w-6 h-6" />
          </button>
        </div>

        {activeBrokerSection === 'main' && (
          <div className="p-8 text-center space-y-6">
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Automatically sync your holdings and transactions from supported brokers.
            </p>
            <button
              type="button"
              aria-label="View supported brokers"
              onClick={() => setActiveBrokerSection('brokers')}
              className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition"
            >
              View Supported Brokers
            </button>
          </div>
        )}

        {activeBrokerSection === 'brokers' && (
          <div className="p-6 space-y-6 max-h-96 overflow-y-auto">
            <p className="text-center text-gray-600 dark:text-gray-400">
              Connect securely via API — we never store your login credentials.
            </p>
            <div className="grid gap-4">
              {/* Zerodha */}
              <div className="flex items-center justify-between p-5 rounded-2xl border-2 border-dashed hover:border-blue-500 transition">
                <div className="flex items-center gap-5">
                  <div className="w-12 h-12 bg-black rounded-lg flex items-center justify-center text-white font-bold">Z</div>
                  <div>
                    <p className="font-semibold">Zerodha</p>
                    <p className="text-sm text-gray-500">India's #1 Broker</p>
                  </div>
                </div>
                {connectedBrokers.zerodha ? (
                  <span className="flex items-center gap-2 text-green-600 font-medium">
                    <CheckCircle className="w-5 h-5" /> Connected
                  </span>
                ) : (
                  <button type="button" aria-label="Connect Zerodha" className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl">Connect</button>
                )}
              </div>

              {/* Upstox */}
              <div className="flex items-center justify-between p-5 rounded-2xl border-2 border-dashed hover:border-blue-500 transition">
                <div className="flex items-center gap-5">
                  <div className="w-12 h-12 bg-orange-600 rounded-lg flex items-center justify-center text-white font-bold">U</div>
                  <div>
                    <p className="font-semibold">Upstox</p>
                    <p className="text-sm text-gray-500">Fast & Reliable</p>
                  </div>
                </div>
                <button type="button" aria-label="Connect Upstox" className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl">Connect</button>
              </div>

              {/* Alpaca */}
              <div className="flex items-center justify-between p-5 rounded-2xl border-2 border-dashed hover:border-blue-500 transition">
                <div className="flex items-center gap-5">
                  <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center text-white font-bold">A</div>
                  <div>
                    <p className="font-semibold">Alpaca</p>
                    <p className="text-sm text-gray-500">US Markets & Crypto</p>
                  </div>
                </div>
                <button type="button" aria-label="Connect Alpaca" className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl">Connect</button>
              </div>

              {/* Interactive Brokers */}
              <div className="flex items-center justify-between p-5 rounded-2xl border-2 border-dashed hover:border-blue-500 transition">
                <div className="flex items-center gap-5">
                  <div className="w-12 h-12 bg-blue-800 rounded-lg flex items-center justify-center text-white font-bold">IB</div>
                  <div>
                    <p className="font-semibold">Interactive Brokers</p>
                    <p className="text-sm text-gray-500">Global Access</p>
                  </div>
                </div>
                {connectedBrokers.interactive ? (
                  <span className="flex items-center gap-2 text-green-600 font-medium">
                    <CheckCircle className="w-5 h-5" /> Connected
                  </span>
                ) : (
                  <button type="button" aria-label="Connect Interactive Brokers" className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl">Connect</button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          <div>
            <h1 className="text-4xl font-bold text-slate-900 dark:text-white">
              Welcome back, <span className="text-slate-700 dark:text-slate-300">{userName}</span>!
            </h1>
            <p className="mt-2 text-lg text-slate-600 dark:text-slate-400">
              Here's your portfolio overview • {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>

          <div className="flex items-center gap-4">
            <button
              type="button"
              aria-pressed={compactMode}
              onClick={() => setCompactMode(prev => { const v = !prev; localStorage.setItem('dashboard.compact', v ? 'true' : 'false'); return v; })}
              aria-label={compactMode ? "Compact view: on" : "Compact view: off"}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition ${compactMode ? 'bg-slate-700 dark:bg-slate-600 text-white border-slate-700 dark:border-slate-600' : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'}`}
            >
              <Target className="w-4 h-4" />
              <span className="font-medium">{compactMode ? 'Compact' : 'Expanded'}</span>
            </button>

            <button
              type="button"
              aria-label="Refresh dashboard"
              onClick={refreshData}
              disabled={isRefreshing}
              className="flex items-center gap-3 px-6 py-2.5 bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
            >
              <RefreshCw className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span className="font-medium">Refresh</span>
            </button>
          </div>
        </div> 

        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-700 dark:text-red-400 flex items-center gap-3">
            <AlertCircle className="w-5 h-5" />
            {error}
          </div>
        )}

        {/* Summary Cards */}
        {loading ? <CardsSkeleton /> : metrics && (
          <DashboardCards
            compact={compactMode}
            total={metrics.market}
            invested={metrics.invested}
            pnl={metrics.pnl}
            returnPct={metrics.returnPct}
          />
        )}

        {/* Main Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
          {/* Left Column */}
          <div className="xl:col-span-2 space-y-6">
            <div className="bg-white dark:bg-slate-900 rounded-lg shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
              <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Wallet className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                  <h2 className="text-xl font-semibold text-slate-800 dark:text-white">My Holdings</h2>
                </div>
                <span className="text-sm text-slate-500 dark:text-slate-400">
                  {metrics?.items?.length || 0} assets
                </span>
              </div>
              <div className="p-6">
                {loading ? <TableSkeleton /> : (
                  <CombinedAssetPanel
                    rows={metrics?.items || []}
                    allocation={allocation}
                    token={token}
                    onChange={() => setRefreshTrigger(t => t + 1)}
                    compact={compactMode}
                    selectedSymbol={selectedSymbol}
                    onSelectSymbol={(s) => setSelectedSymbol(s)}
                    hoveredSymbol={hoveredSymbol}
                    onHover={(h) => setHoveredSymbol(h)}
                  />
                )}
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-lg shadow-sm border border-slate-200 dark:border-slate-800 p-6">
              <div className="flex items-center gap-3 mb-6">
                <PlusCircle className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                <h2 className="text-xl font-semibold text-slate-800 dark:text-white">Add New Asset</h2>
              </div>
              <AssetForm token={token} onSaved={() => setRefreshTrigger(t => t + 1)} />
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* Linked Accounts */}
            <div className="bg-slate-700 dark:bg-slate-800 rounded-lg shadow-sm border border-slate-600 dark:border-slate-700 p-6 text-white flex flex-col justify-between h-full">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <Link className="w-6 h-6" />
                  <h3 className="text-xl font-bold">Linked Accounts</h3>
                </div>
                <span className="text-sm opacity-90">
                  {Object.values(connectedBrokers).filter(v => v).length} connected
                </span>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>Zerodha</span>
                  <CheckCircle className="w-5 h-5 text-green-300" />
                </div>
                <div className="flex items-center justify-between opacity-70">
                  <span>Upstox</span>
                  <XCircle className="w-5 h-5" />
                </div>
                <div className="flex items-center justify-between opacity-70">
                  <span>Alpaca</span>
                  <XCircle className="w-5 h-5" />
                </div>
                <div className="flex items-center justify-between">
                  <span>Interactive Brokers</span>
                  <CheckCircle className="w-5 h-5 text-green-300" />
                </div>
              </div>
              <button
                type="button"
                aria-label="Manage linked accounts"
                onClick={() => setShowBrokerModal(true)}
                className="w-full mt-6 py-3 bg-white/20 hover:bg-white/30 rounded-xl font-medium transition"
              >
                Manage Connections
              </button>
            </div>



            {/* Top Movers */}
            <div className="bg-white dark:bg-slate-900 rounded-lg shadow-sm border border-slate-200 dark:border-slate-800 p-6 h-full flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <TrendingUp className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                  <h2 className="text-xl font-semibold text-slate-800 dark:text-white">Top Movers</h2>
                </div>
                <div className="flex items-center justify-between mb-4">
                <div className="text-sm text-slate-500">Click a mover to focus</div>
                <div className="flex items-center gap-2">
                  <button type="button" aria-pressed={moversAutoplay} onClick={() => setMoversAutoplay(p => !p)} className="px-3 py-1 rounded-md bg-white dark:bg-slate-800 border">
                    {moversAutoplay ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div className="space-y-4 overflow-auto">
                {topMovers.gainers.map(item => (
                  <MoverItem key={item.symbol} item={item} isGain compact={compactMode} onSelect={(sym) => setSelectedSymbol(prev => prev === sym ? null : sym)} onHover={(h) => setHoveredSymbol(h)} />
                ))}
                {topMovers.losers.map(item => (
                  <MoverItem key={item.symbol} item={item} compact={compactMode} onSelect={(sym) => setSelectedSymbol(prev => prev === sym ? null : sym)} onHover={(h) => setHoveredSymbol(h)} />
                ))}
              </div>
              </div>
            </div>

            {/* Market News */}
            <div className="bg-white dark:bg-slate-900 rounded-lg shadow-sm border border-slate-200 dark:border-slate-800 p-6 h-full flex flex-col justify-between">
              <div className="flex items-center gap-3 mb-6">
                <Newspaper className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                <h2 className="text-xl font-semibold text-slate-800 dark:text-white">Market News</h2>
              </div>
              <div className="overflow-auto">
                <MarketNews />
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <div className="bg-white dark:bg-slate-900 rounded-lg shadow-sm border border-slate-200 dark:border-slate-800 p-6">
            <h2 className="text-xl font-semibold text-slate-800 dark:text-white mb-6">Performance Over Time</h2>
            {token && <PerformanceChart token={token} />}
          </div>
          <div className="bg-white dark:bg-slate-900 rounded-lg shadow-sm border border-slate-200 dark:border-slate-800 p-6">
            <h2 className="text-xl font-semibold text-slate-800 dark:text-white mb-6">Watchlist</h2>
            {token && <Watchlist token={token} />}
          </div>
        </div>
      </div>

      {showBrokerModal && <BrokerModal />}
    </div>
  );
}

function MoverItem({ item, isGain = false, compact = false, onSelect, onHover }) {
  const change = item.change_pct_1d || 0;
  const positive = isGain || change >= 0;
  const paddingClass = compact ? 'py-2 px-3' : 'py-3 px-4';
  const symbolClass = compact ? 'font-medium text-sm' : 'font-semibold';
  const iconSize = compact ? 'w-4 h-4' : 'w-5 h-5';

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onSelect?.(item.symbol)}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelect?.(item.symbol); } }}
      onMouseEnter={() => onHover?.(item.symbol)}
      onMouseLeave={() => onHover?.(null)}
      className={`${paddingClass} bg-slate-50 dark:bg-slate-800/50 rounded-lg flex items-center justify-between cursor-pointer focus:outline-none focus:ring-2 focus:ring-slate-500 transition-colors duration-200 hover:bg-slate-100 dark:hover:bg-slate-800`}
    >
      <div>
        <p className={`${symbolClass} text-slate-800 dark:text-white`}>{item.symbol}</p>
        {!compact && <p className="text-xs text-slate-500 dark:text-slate-400">{item.name || 'Asset'}</p>}
      </div>
      <div className={`flex items-center gap-2 font-semibold ${positive ? 'text-emerald-700 dark:text-emerald-500' : 'text-red-700 dark:text-red-500'}`}>
        {positive ? <ArrowUpRight className={iconSize} /> : <ArrowDownRight className={iconSize} />}
        <span>{Math.abs(change).toFixed(2)}%</span>
      </div>
    </div>
  );
}