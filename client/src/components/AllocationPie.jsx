import { Pie, PieChart, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

// Muted professional color palette for charts
const COLORS = [
  '#475569', // slate-600
  '#64748b', // slate-500
  '#334155', // slate-700
  '#1e293b', // slate-800
  '#0f172a', // slate-900
  '#475569', // slate-600 (repeat for more items)
  '#64748b', // slate-500
  '#334155'  // slate-700
];
const RADIAN = Math.PI / 180;

// Custom label renderer: only show labels for slices > 5%
const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, name }) => {
  // Don't render labels for very small slices to avoid clutter
  if (percent < 0.05) {
    return null;
  }

  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" className="text-xs font-bold drop-shadow-sm">
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

export default function AllocationPie({ data, onHover, onClick }) {
  const chartData = (data || [])
    .map((d, i) => ({
      name: d.symbol,
      value: d.weight !== undefined ? Math.max(0, Number(d.weight)) : Math.max(0, Number(d.value) || 0)
    }))
    .filter(d => d.value > 0);

  if (!chartData.length) {
    return <div className="text-sm text-gray-500 dark:text-gray-400">No Data Available!!!</div>;
  }

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius="85%"
            label={renderCustomizedLabel}
            labelLine={false}
            onMouseEnter={(d) => onHover?.(d.name)}
            onMouseLeave={() => onHover?.(null)}
            onClick={(entry) => onClick?.(entry?.name)}
          >
            {chartData.map((_, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} cursor="pointer" />
            ))}
          </Pie>
          <Tooltip
            formatter={(value, name) => [`${Number(value).toFixed(2)}%`, name]}
            contentStyle={{ 
              background: 'rgba(255, 255, 255, 0.95)', 
              backdropFilter: 'blur(4px)', 
              border: '1px solid #e2e8f0', 
              borderRadius: '0.5rem',
              padding: '0.5rem'
            }}
            labelStyle={{ color: '#334155', fontWeight: '600' }}
          />
          <Legend
            layout="horizontal"
            verticalAlign="bottom"
            align="center"
            iconType="circle"
            wrapperStyle={{ fontSize: '0.75rem', paddingTop: '10px', color: '#64748b' }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
