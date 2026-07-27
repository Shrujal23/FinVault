import { useEffect, useState, memo } from 'react';
import { apiRequest } from '../api/client.js';
import { LineChart as LineChartIcon } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import EmptyState from './EmptyState.jsx';
import StatusMessage from './StatusMessage.jsx';

function PerformanceChart({ token }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return; // skips API if token missing
    }

    const controller = new AbortController();
    const signal = controller.signal;

    async function fetchData() {
      try {
        setLoading(true);
        const res = await apiRequest('/api/snapshots', { token, signal });
        const formatted = (res.snapshots || []).map(s => ({
          date: s.as_of_date,
          value: Number(s.total_value_inr),
        }));
        setData(formatted);
        setError('');
      } catch (e) {
        if (e.name === 'AbortError') return;
        setError(e.message || 'Failed to load performance data');
      } finally {
        setLoading(false);
      }
    }

    fetchData();

    return () => controller.abort();
  }, [token]);

  if (!token) return null; // <-- nothing until token ready
  if (loading) return (
    <div className="bg-white dark:bg-slate-900 p-4 rounded-lg shadow-sm border border-slate-200 dark:border-slate-800">
      <h2 className="font-semibold mb-4 text-slate-800 dark:text-white">Portfolio Performance</h2>
      <div className="flex items-center justify-center py-16">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center animate-pulse">
            <LineChartIcon className="w-5 h-5 text-slate-400" />
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 animate-pulse">Loading performance data...</p>
        </div>
      </div>
    </div>
  );
  if (error) return (
    <div className="bg-white dark:bg-slate-900 p-4 rounded-lg shadow-sm border border-slate-200 dark:border-slate-800">
      <h2 className="font-semibold mb-4 text-slate-800 dark:text-white">Portfolio Performance</h2>
      <StatusMessage
        variant="error"
        title="Chart unavailable"
        message={error}
        retryLabel="Retry"
        onRetry={() => { setError(''); setLoading(true); }}
      />
    </div>
  );
  if (!data.length) return (
    <div className="bg-white dark:bg-slate-900 p-4 rounded-lg shadow-sm border border-slate-200 dark:border-slate-800">
      <h2 className="font-semibold mb-4 text-slate-800 dark:text-white">Portfolio Performance</h2>
      <EmptyState
        preset="noPerformance"
        size="sm"
      />
    </div>
  );

  return (
    <div className="bg-white dark:bg-slate-900 p-4 rounded-lg shadow-sm border border-slate-200 dark:border-slate-800">
      <h2 className="font-semibold mb-4 text-slate-800 dark:text-white">Portfolio Performance</h2>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" strokeOpacity={0.5} />
          <XAxis 
            dataKey="date" 
            stroke="#64748b"
            style={{ fontSize: '0.75rem' }}
          />
          <YAxis 
            stroke="#64748b"
            style={{ fontSize: '0.75rem' }}
          />
          <Tooltip 
            formatter={(value) => [`₹${Number(value).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`, 'Value']}
            contentStyle={{ 
              background: 'rgba(255, 255, 255, 0.95)', 
              backdropFilter: 'blur(4px)', 
              border: '1px solid #e2e8f0', 
              borderRadius: '0.5rem',
              padding: '0.5rem'
            }}
            labelStyle={{ color: '#334155', fontWeight: '600' }}
          />
          <Line 
            type="monotone" 
            dataKey="value" 
            stroke="#475569" 
            strokeWidth={2}
            dot={{ fill: '#475569', r: 3 }}
            activeDot={{ r: 5, fill: '#334155' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export default memo(PerformanceChart);
