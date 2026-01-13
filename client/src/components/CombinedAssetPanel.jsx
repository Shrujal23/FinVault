import { useState } from 'react';
import AllocationPie from './AllocationPie.jsx';
import AssetTable from './AssetTable.jsx';
import { PieChart, Columns, List } from 'lucide-react';

export default function CombinedAssetPanel({ rows = [], allocation = [], token, onChange, compact = false, selectedSymbol: selectedProp, onSelectSymbol, hoveredSymbol: hoveredProp, onHover }) {
  const [view, setView] = useState('split'); // 'split' | 'chart' | 'table'
  const [internalHovered, setInternalHovered] = useState(null);
  const [internalSelected, setInternalSelected] = useState(null);

  const selectedSymbol = selectedProp !== undefined ? selectedProp : internalSelected;
  const setSelectedSymbol = onSelectSymbol ?? setInternalSelected;

  const hoveredSymbol = hoveredProp !== undefined ? hoveredProp : internalHovered;
  const setHoveredSymbol = onHover ?? setInternalHovered;

  return (
    <div className="w-full">
      {/* Controls */}
      <div className="flex items-center justify-between mb-6">
        <div className="transition-opacity duration-200">
          <h3 className="text-lg font-semibold text-slate-800 dark:text-white">Holdings & Allocation</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">View your portfolio distribution and holdings together for quick insights.</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            aria-pressed={view === 'split'}
            onClick={() => setView('split')}
            aria-label="Split view: chart and table"
            className={`p-2 rounded-lg transition-colors ${view === 'split' ? 'bg-slate-700 dark:bg-slate-600 text-white' : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'}`}>
            <Columns className="w-4 h-4" />
          </button>

          <button
            type="button"
            aria-pressed={view === 'chart'}
            onClick={() => setView('chart')}
            aria-label="Chart only view"
            className={`p-2 rounded-lg transition-colors ${view === 'chart' ? 'bg-slate-700 dark:bg-slate-600 text-white' : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'}`}>
            <PieChart className="w-4 h-4" />
          </button>

          <button
            type="button"
            aria-pressed={view === 'table'}
            onClick={() => setView('table')}
            aria-label="Table only view"
            className={`p-2 rounded-lg transition-colors ${view === 'table' ? 'bg-slate-700 dark:bg-slate-600 text-white' : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'}`}>
            <List className="w-4 h-4" />
          </button>

          {selectedSymbol && (
            <button
              type="button"
              onClick={() => { setSelectedSymbol(null); }}
              aria-label="Clear selection"
              className="ml-2 text-sm px-3 py-1 rounded-md border dark:border-slate-700 text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800"
            >
              Clear: {selectedSymbol}
            </button>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className={`w-full ${view === 'split' ? 'flex flex-col lg:flex-row gap-4' : ''}`}>
        {(view === 'split' || view === 'table') && (
          <div className={`${view === 'split' ? 'lg:w-2/3' : 'w-full'}`}>
            <AssetTable
              rows={rows}
              onChange={onChange}
              token={token}
              hoveredSymbol={hoveredSymbol}
              selectedSymbol={selectedSymbol}
              externalFilter={selectedSymbol || ''}
            />
          </div>
        )}

        {(view === 'split' || view === 'chart') && (
          <div className={`${view === 'split' ? 'lg:w-1/3' : 'w-full'}`}>
            <div className="bg-white/0 dark:bg-transparent rounded-md p-2">
              <AllocationPie data={allocation} onHover={setHoveredSymbol} onClick={(sym) => {
                // toggle selection: clicking same symbol clears selection
                const newSel = (selectedSymbol === sym) ? null : sym;
                setSelectedSymbol(newSel);
                // when selecting, show split or table for focus
                if (newSel) setView('split');
              }} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
