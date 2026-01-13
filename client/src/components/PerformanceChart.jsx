import { useEffect, useState } from 'react';
import { apiRequest } from '../api/client.js';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function PerformanceChart({ token }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  console.log('[PerformanceChart] Received token prop:', token ? `${token.substring(0, 20)}...` : 'null/undefined');

  useEffect(() => {
    console.log('[PerformanceChart.useEffect] token:', token ? `${token.substring(0, 20)}...` : 'null/undefined');
    
    if (!token) {
      console.log('[PerformanceChart] Skipping API call - no token');
      setLoading(false);
      return;
    } // <-- skip API if token missing

    async function fetchData() {
      try {
        setLoading(true);
        const res = await apiRequest('/api/snapshots', { token });
        const formatted = res.snapshots.map(s => ({
          date: s.as_of_date,
          value: Number(s.total_value_inr),
        }));
        setData(formatted);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [token]);

  if (!token) return null; // <-- nothing until token ready
  if (loading) return <div className="text-center py-8">Loading performance data...</div>;
  if (error) return <div className="text-red-600 text-sm">{error}</div>;
  if (!data.length) return <div className="text-center py-8 text-gray-500">No performance data available.</div>;

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
