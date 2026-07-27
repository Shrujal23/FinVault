import { useEffect, useState, useMemo, useRef } from 'react';
import { apiRequest } from '../api/client.js';
import AssetForm from '../components/AssetForm.jsx';
import CombinedAssetPanel from '../components/CombinedAssetPanel.jsx';
import DashboardCards from '../components/DashboardCards.jsx';
import PerformanceChart from '../components/PerformanceChart.jsx';
import { CardsSkeleton, TableSkeleton } from '../components/Skeleton.jsx';
import MarketNews from '../components/MarketNews.jsx';
import Watchlist from '../components/Watchlist.jsx';
import EmptyState from '../components/EmptyState.jsx';
import StatusMessage from '../components/StatusMessage.jsx';
import {
  Wallet,
  PieChart,
  PlusCircle,
  Newspaper,
  Target,
  History,
  RefreshCw,
  AlertCircle,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

export default function Dashboard({ auth, setCurrentPage }) {
  const { token, user } = auth;
  const [assets, setAssets] = useState([]);
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isAddAssetOpen, setIsAddAssetOpen] = useState(false);
  const addAssetRef = useRef(null);

  // Compact mode for denser dashboard layout (persisted)
  const [compactMode, setCompactMode] = useState(() => localStorage.getItem('dashboard.compact') === 'true');
  useEffect(() => { localStorage.setItem('dashboard.compact', compactMode ? 'true' : 'false'); }, [compactMode]);

  const refreshData = async () => {
    if (!token) {
      setLoading(false);
      setIsRefreshing(false);
      return;
    }
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

  const userName = user?.name || user?.email?.split('@')[0] || 'Investor';
  const portfolioHealth = !metrics
    ? 'Sync your portfolio to see insights'
    : metrics.returnPct >= 8
      ? 'Strong growth trend'
      : metrics.returnPct >= 0
        ? 'Stable positive trend'
        : 'Recovery mode - review allocations';
  const reviewDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });

  // Selection state used to link holdings table
  const [selectedSymbol, setSelectedSymbol] = useState(null);
  const [hoveredSymbol, setHoveredSymbol] = useState(null);

  const handleAddAssetClick = () => {
    setIsAddAssetOpen(true);
    setTimeout(() => {
      addAssetRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 50);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-100 via-slate-50 to-blue-50 dark:from-slate-950 dark:via-slate-950 dark:to-slate-900 pb-12">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8">
        {/* Header */}
        <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-slate-900/70 backdrop-blur-xl p-6 sm:p-8 shadow-lg shadow-slate-200/40 dark:shadow-black/20">
          <div className="absolute -top-16 -right-16 w-56 h-56 rounded-full bg-cyan-400/10 dark:bg-cyan-500/10 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-20 -left-12 w-56 h-56 rounded-full bg-indigo-400/10 dark:bg-indigo-500/10 blur-3xl pointer-events-none" />
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0">
            <p className="text-xs uppercase tracking-[0.18em] text-cyan-700 dark:text-cyan-400 font-semibold">Portfolio Command Center</p>
            <h1 className="text-4xl font-bold text-slate-900 dark:text-white mt-1">
              Welcome back, <span className="bg-gradient-to-r from-cyan-500 to-indigo-600 bg-clip-text text-transparent">{userName}</span>
            </h1>
            <p className="mt-2 text-lg text-slate-600 dark:text-slate-300">
              Here's your portfolio overview • {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3 sm:gap-4 shrink-0">
            {token && (
              <button
                type="button"
                onClick={handleAddAssetClick}
                className="flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-lg shadow-sm font-medium transition-all"
              >
                <PlusCircle className="w-5 h-5" />
                <span>Add Asset</span>
              </button>
            )}
            <button
              type="button"
              aria-pressed={compactMode}
              onClick={() => setCompactMode(prev => { const v = !prev; localStorage.setItem('dashboard.compact', v ? 'true' : 'false'); return v; })}
              aria-label={compactMode ? "Compact view: on" : "Compact view: off"}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition ${compactMode ? 'bg-slate-700 dark:bg-slate-600 text-white border-slate-700 dark:border-slate-600' : 'bg-white/80 dark:bg-slate-800/80 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'}`}
            >
              <Target className="w-4 h-4" />
              <span className="font-medium">{compactMode ? 'Compact' : 'Expanded'}</span>
            </button>

            <button
              type="button"
              aria-label="Refresh dashboard"
              onClick={refreshData}
              disabled={isRefreshing}
              className="flex items-center gap-3 px-6 py-2.5 bg-white/90 dark:bg-slate-800/90 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
            >
              <RefreshCw className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span className="font-medium">Refresh</span>
            </button>
          </div>
        </div>
        </div>

        {error && (
          <StatusMessage
            variant="error"
            title="We couldn't load your portfolio"
            message={error}
            retryLabel="Retry"
            onRetry={refreshData}
            onDismiss={() => setError('')}
          />
        )}

        {/* Guest Banner */}
        {!token && (
          <div className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border border-blue-200 dark:border-blue-800/50 rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-800/50 rounded-lg text-blue-600 dark:text-blue-400 shrink-0">
                <Wallet className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-800 dark:text-slate-200">You're in guest mode</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">Log in or register to save your portfolio data securely and access it across all your devices.</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setCurrentPage?.('settings')}
              className="shrink-0 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition shadow-sm"
            >
              Login / Register
            </button>
          </div>
        )}

        {!loading && !error && (!metrics || !metrics.items?.length) && (
          <EmptyState
            preset="noAssets"
            size="lg"
            title="Welcome to FinVault"
            description="Get started by adding your first asset. We'll calculate your portfolio value, P&L, and allocation automatically."
            actionLabel="Add your first asset"
            onAction={handleAddAssetClick}
          />
        )}

        {/* 1. Primary Metrics: Summary Cards */}
        {loading ? <CardsSkeleton /> : metrics && (
          <DashboardCards
            compact={compactMode}
            total={metrics.market}
            invested={metrics.invested}
            pnl={metrics.pnl}
            returnPct={metrics.returnPct}
          />
        )}

        {/* 2. Secondary Insights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white/90 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
            <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
              <PieChart className="w-4 h-4" />
              <p className="text-sm font-medium">Portfolio Health</p>
            </div>
            <p className="mt-2 text-lg font-semibold text-slate-900 dark:text-white">{portfolioHealth}</p>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Based on total return and current holdings mix.
            </p>
          </div>

          <div className="bg-white/90 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
            <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
              <History className="w-4 h-4" />
              <p className="text-sm font-medium">Next Review</p>
            </div>
            <p className="mt-2 text-lg font-semibold text-slate-900 dark:text-white">{reviewDate}</p>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Weekly check-in helps keep your strategy on track.
            </p>
          </div>

          <div className="bg-white/90 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
            <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
              <Target className="w-4 h-4" />
              <p className="text-sm font-medium">Quick Actions</p>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={handleAddAssetClick}
                className="px-3 py-1.5 rounded-md text-xs font-medium bg-gradient-to-r from-cyan-600 to-blue-600 text-white hover:from-cyan-500 hover:to-blue-500"
              >
                Add Asset
              </button>
              <button
                type="button"
                onClick={refreshData}
                className="px-3 py-1.5 rounded-md text-xs font-medium border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Refresh Data
              </button>
              {!token && (
                <button
                  type="button"
                  onClick={() => setCurrentPage?.('settings')}
                  className="px-3 py-1.5 rounded-md text-xs font-medium bg-gradient-to-r from-cyan-600 to-blue-600 text-white hover:from-cyan-500 hover:to-blue-500 shadow-sm"
                >
                  Login / Register
                </button>
              )}
            </div>
          </div>
        </div>

        {/* 3. Visuals & Discovery: Performance (2/3) + Watchlist & News (1/3) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white/95 dark:bg-slate-900/95 rounded-xl shadow-sm border border-slate-200/80 dark:border-slate-800 p-6">
              <h2 className="text-xl font-semibold text-slate-800 dark:text-white mb-6">Portfolio Performance</h2>
              {token ? (
                <PerformanceChart token={token} />
              ) : (
                <div className="flex flex-col items-center justify-center py-10 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                  <p className="text-sm text-slate-500 dark:text-slate-400">Sign in to unlock historical performance tracking.</p>
                </div>
              )}
            </div>

            {/* Watchlist */}
            {token ? (
              <Watchlist token={token} />
            ) : (
              <div className="bg-white/95 dark:bg-slate-900/95 rounded-xl shadow-sm border border-slate-200/80 dark:border-slate-800 p-6">
                <h2 className="text-xl font-semibold text-slate-800 dark:text-white mb-6">Watchlist</h2>
                <div className="flex flex-col items-center justify-center py-6 text-center">
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Log in to track your favorite assets.</p>
                  <button
                    type="button"
                    onClick={() => setCurrentPage?.('settings')}
                    className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-sm font-medium transition"
                  >
                    Login / Register
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-6">
            {/* Market News */}
            <MarketNews />
          </div>
        </div>

        {/* 4. Detailed Positions: Holdings & Add Asset */}
        <div className="space-y-6">
            <div className="bg-white/95 dark:bg-slate-900/95 rounded-xl shadow-sm border border-slate-200/80 dark:border-slate-800 overflow-hidden min-w-0">
              <div className="p-4 sm:p-6 border-b border-slate-200 dark:border-slate-800 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <Wallet className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                  <h2 className="text-xl font-semibold text-slate-800 dark:text-white">My Holdings</h2>
                </div>
                <span className="text-sm text-slate-500 dark:text-slate-400">
                  {metrics?.items?.length || 0} assets
                </span>
              </div>
              <div className="p-4 sm:p-6 min-w-0 overflow-x-auto">
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

            <div id="add-asset-section" ref={addAssetRef} className="bg-white/95 dark:bg-slate-900/95 rounded-xl shadow-sm border border-slate-200/80 dark:border-slate-800 p-4 sm:p-6 min-w-0">
              <button 
                type="button" 
                onClick={() => setIsAddAssetOpen(!isAddAssetOpen)}
                className="w-full flex items-center justify-between focus:outline-none group"
              >
                <div className="flex items-center gap-3">
                  <PlusCircle className={`w-5 h-5 transition-colors ${isAddAssetOpen ? 'text-cyan-600 dark:text-cyan-400' : 'text-slate-600 dark:text-slate-400 group-hover:text-cyan-600 dark:group-hover:text-cyan-400'}`} />
                  <h2 className="text-xl font-semibold text-slate-800 dark:text-white">Add New Asset</h2>
                </div>
                {isAddAssetOpen ? <ChevronUp className="w-5 h-5 text-slate-500" /> : <ChevronDown className="w-5 h-5 text-slate-500" />}
              </button>
              {isAddAssetOpen && (
                <div className="mt-6 animate-in slide-in-from-top-2 fade-in duration-300">
                  <AssetForm token={token} onSaved={() => setRefreshTrigger(t => t + 1)} />
                </div>
              )}
            </div>
        </div>
      </div>
    </div>
  );
}