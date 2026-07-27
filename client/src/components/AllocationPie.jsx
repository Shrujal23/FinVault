import React, { useState, useMemo, useCallback } from 'react';
import { PieChart, Pie, Sector, Cell, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts';
import EmptyState from './EmptyState.jsx';

// Local shadcn-style chart primitives (self-contained so file is standalone)
function ChartContainer({ children, className, styleVars = {} }) {
  const style = {
    '--chart-accent': styleVars.accent || '#06b6d4',
    '--chart-muted': styleVars.muted || '#64748b',
  };
  return (
    <div className={className} style={style}>
      {children}
    </div>
  );
}

function ChartTooltip({ children }) {
  return <div className="rounded-md shadow-md bg-white/95 dark:bg-slate-900/85">{children}</div>;
}

function ChartTooltipContent({ name, value }) {
  return (
    <div className="p-3 text-sm">
      <div className="font-semibold text-slate-900 dark:text-white">{name}</div>
      <div className="text-xs text-slate-500 dark:text-slate-400">{value}</div>
    </div>
  );
}

function ChartLegend({ items, onItemClick, activeName, className }) {
  return (
    <div className={className || 'flex flex-wrap gap-3 justify-center'}>
      {items.map((it) => (
        <button
          key={it.name}
          onClick={() => onItemClick?.(it.name)}
          className={`flex items-center gap-2 text-xs rounded-md px-2 py-1 transition-opacity focus:outline-none ${
            activeName === it.name ? 'opacity-100' : 'opacity-80'
          }`}
          aria-pressed={activeName === it.name}
        >
          <span className="w-2 h-2 rounded-full" style={{ background: it.fill }} />
          <span className="text-slate-700 dark:text-slate-200">{it.name}</span>
        </button>
      ))}
    </div>
  );
}

const DEFAULT_COLORS = ['#06b6d4', '#7c3aed', '#ef4444', '#f59e0b', '#10b981', '#3b82f6'];

const renderActiveSector = ({ cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent }) => (
  <g>
    <Sector
      cx={cx}
      cy={cy}
      innerRadius={innerRadius}
      outerRadius={outerRadius + 12}
      startAngle={startAngle}
      endAngle={endAngle}
      fill={fill}
      cornerRadius={8}
      stroke="rgba(15,23,42,0.06)"
      strokeWidth={2}
    />
  </g>
);

function AllocationPie({ data = [], onHover, onClick, hoveredSymbol: hoveredProp, selectedSymbol: selectedProp, className }) {
  // Single source of truth where possible
  const [internalHovered, setInternalHovered] = useState(null);
  const [internalSelected, setInternalSelected] = useState(null);

  // Derived/controlled values
  const hovered = hoveredProp !== undefined ? hoveredProp : internalHovered;
  const selected = selectedProp !== undefined ? selectedProp : internalSelected;

  // memoized chartData
  const chartData = useMemo(() => {
    return (data || [])
      .map((d, i) => ({
        name: d.symbol || `Slice ${i + 1}`,
        value: d.weight !== undefined ? Math.max(0, Number(d.weight)) : Math.max(0, Number(d.value) || 0),
        raw: d,
        fill: DEFAULT_COLORS[i % DEFAULT_COLORS.length],
      }))
      .filter((d) => Number(d.value) > 0);
  }, [data]);

  const total = useMemo(() => chartData.reduce((s, c) => s + Number(c.value || 0), 0), [chartData]);

  // map name->index
  const nameIndex = useMemo(() => {
    const m = new Map();
    chartData.forEach((c, i) => m.set(c.name, i));
    return m;
  }, [chartData]);

  // active index derived from hovered first, then selected
  const activeIndex = useMemo(() => {
    if (hovered && nameIndex.has(hovered)) return nameIndex.get(hovered);
    if (selected && nameIndex.has(selected)) return nameIndex.get(selected);
    return null;
  }, [hovered, selected, nameIndex]);

  // callbacks (stable)
  const handleMouseEnter = useCallback(
    (_entry, index) => {
      const name = chartData[index]?.name ?? null;
      if (hoveredProp === undefined) setInternalHovered(name);
      onHover?.(name);
    },
    [chartData, onHover, hoveredProp]
  );

  const handleMouseLeave = useCallback(() => {
    if (hoveredProp === undefined) setInternalHovered(null);
    onHover?.(null);
  }, [onHover, hoveredProp]);

  const handleClick = useCallback(
    (_entry, index) => {
      const name = chartData[index]?.name ?? null;
      // toggle semantics preserved: parent is expected to toggle selection when receiving same name
      if (selectedProp === undefined) {
        setInternalSelected((cur) => (cur === name ? null : name));
      }
      onClick?.(name);
    },
    [chartData, onClick, selectedProp]
  );

  if (!chartData.length) {
    return <EmptyState preset="noAllocation" size="sm" />;
  }

  // center label content: show hovered asset percent or total
  const centerLabel = useMemo(() => {
    if (hovered && nameIndex.has(hovered)) {
      const idx = nameIndex.get(hovered);
      const v = chartData[idx].value;
      return { title: chartData[idx].name, sub: `${((v / total) * 100).toFixed(1)}%` };
    }
    return { title: 'Total', sub: `${total.toFixed(1)}%` };
  }, [hovered, nameIndex, chartData, total]);

  const wrapperClass = `${className ?? ''} h-80 w-full`;

  return (
    <div className={wrapperClass} onMouseLeave={handleMouseLeave}>
      <div className="h-[320px] w-full p-0">
        <ChartContainer className="h-full w-full flex flex-col" styleVars={{ accent: DEFAULT_COLORS[0], muted: '#64748b' }}>
          <div className="flex-1 relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <RechartsTooltip
                  wrapperStyle={{ outline: 'none' }}
                  content={({ active, payload }) => {
                    if (!active || !payload || !payload.length) return null;
                    const p = payload[0];
                    return (
                      <ChartTooltip>
                        <ChartTooltipContent name={p.name} value={`${Number(p.value).toFixed(1)}%`} />
                      </ChartTooltip>
                    );
                  }}
                />

                <Pie
                  data={chartData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={76}
                  outerRadius={110}
                  paddingAngle={3}
                  cornerRadius={8}
                  isAnimationActive={true}
                  animationDuration={400}
                  activeIndex={activeIndex}
                  activeShape={renderActiveSector}
                  onMouseEnter={handleMouseEnter}
                  onMouseLeave={handleMouseLeave}
                  onClick={handleClick}
                >
                  {chartData.map((entry, i) => {
                    const isSelected = selected === entry.name;
                    return (
                      <Cell
                        key={`cell-${i}`}
                        fill={entry.fill}
                        cursor="pointer"
                        stroke={isSelected ? 'var(--chart-accent)' : 'transparent'}
                        strokeWidth={isSelected ? 4 : 1}
                      />
                    );
                  })}
                </Pie>
              </PieChart>
            </ResponsiveContainer>

            {/* Center overlay */}
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <div className="flex flex-col items-center text-center">
                <div className="text-sm font-medium text-slate-800 dark:text-white">{centerLabel.title}</div>
                <div className="text-xs text-slate-500 dark:text-slate-400">{centerLabel.sub}</div>
              </div>
            </div>
          </div>

          <div className="mt-2">
            <ChartLegend
              items={chartData.map((c) => ({ name: c.name, fill: c.fill }))}
              onItemClick={(name) => onClick?.(name)}
              activeName={hovered || selected}
            />
          </div>
        </ChartContainer>
      </div>
    </div>
  );
}

export default React.memo(AllocationPie);
