import { useEffect, useState } from 'react';
import { apiRequest } from '../api/client';
import { Loader2, Newspaper } from 'lucide-react';

export default function MarketNews() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await apiRequest('/api/news');
        if (!mounted) return;
        if (res?.error) {
          setError(res.error + (res?.details ? ` — ${res.details}` : ''));
        } else if (res?.articles && res.articles.length > 0) {
          setArticles(res.articles);
        } else if (res?.debug && res.debug.rawLength === 0) {
          setError('News provider returned an empty response. Check server logs.');
        } else {
          setArticles([]);
        }
      } catch (e) {
        if (!mounted) return;
        setError(e.message || 'Failed to load news');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  return (
    <div className="bg-white dark:bg-slate-900 p-4 rounded-lg shadow border border-gray-100 dark:border-slate-800">
      <div className="flex items-center gap-2 mb-3">
        <Newspaper className="w-5 h-5 text-slate-500" />
        <h2 className="font-semibold text-lg">Market News</h2>
      </div>
      {loading && (
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <Loader2 className="w-4 h-4 animate-spin" /> Loading headlines...
        </div>
      )}
      {error && !loading && (
        <p className="text-sm text-red-600">{error}</p>
      )}
      {!loading && !error && articles.length === 0 && (
        <p className="text-sm text-slate-500 dark:text-slate-400">No headlines available.</p>
      )}
      <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
        {articles.map((a, idx) => (
          <a
            key={idx}
            href={a.url}
            target="_blank"
            rel="noreferrer"
            className="block group"
          >
            <div className="text-sm font-semibold text-slate-800 dark:text-slate-200 group-hover:underline">
              {a.title}
            </div>
            {a.source && (
              <div className="text-xs text-slate-500 dark:text-slate-400">{a.source}</div>
            )}
          </a>
        ))}
      </div>
    </div>
  );
}

