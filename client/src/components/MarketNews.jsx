import { useEffect, useState } from 'react';
import { apiRequest } from '../api/client';
import { Loader2, Newspaper } from 'lucide-react';
import EmptyState from './EmptyState.jsx';
import StatusMessage from './StatusMessage.jsx';

export default function MarketNews() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [source, setSource] = useState('');

  useEffect(() => {
    let mounted = true;
    const fetchWithFallback = async () => {
      try {
        const res = await apiRequest('/api/news');
        if (!mounted) return;
        setSource(res?.source || '');
        if (res?.error) {
          setError(res.error + (res?.details ? ` — ${res.details}` : ''));
          setArticles(res.articles || []);
        } else if (res?.articles && res.articles.length > 0) {
          setArticles(res.articles);
        } else if (res?.debug && res.debug.rawLength === 0) {
          setError('News provider returned an empty response. Check server logs.');
        } else {
          setArticles([]);
        }
      } catch (e) {
        // Attempt a direct fetch to read server response body for more details
        try {
          const raw = await fetch('/api/news');
          const body = await raw.json().catch(() => null);
          if (!mounted) return;
          if (raw.ok) {
            setArticles(body?.articles || []);
            setSource(body?.source || '');
            if (body?.error) setError(body.error + (body?.details ? ` — ${body.details}` : ''));
          } else {
            const msg = body?.error || body?.message || `Server returned ${raw.status}`;
            setError(msg + (body?.details ? ` — ${body.details}` : ''));
            setArticles(body?.articles || []);
          }
        } catch (fetchErr) {
          if (!mounted) return;
          setError(e.message || fetchErr.message || 'Failed to load news');
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchWithFallback();
    return () => { mounted = false; };
  }, []);

  return (
    <div className="bg-white/95 dark:bg-slate-900/95 rounded-xl shadow-sm border border-slate-200/80 dark:border-slate-800 p-6">
      <div className="flex items-center gap-3 mb-6">
        <Newspaper className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
        <h2 className="text-xl font-semibold text-slate-800 dark:text-white">Market News</h2>
      </div>
      {loading && (
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <Loader2 className="w-4 h-4 animate-spin" /> Loading headlines...
        </div>
      )}
      {error && !loading && (
        <StatusMessage
          variant="error"
          message={error}
          retryLabel="Retry"
          onRetry={() => { setError(''); setLoading(true); /* re-run fetch without reload */
            (async () => {
              try {
                const res = await apiRequest('/api/news');
                setError('');
                setArticles(res?.articles || []);
                setSource(res?.source || '');
              } catch (e) {
                // leave error text; the useEffect fallback will also re-run when loading toggles
                setError(e.message || 'Failed to load news');
              } finally {
                setLoading(false);
              }
            })();
          }}
          onDismiss={() => setError('')}
        />
      )}
      {!loading && !error && source === 'fallback' && (
        <p className="mb-4 text-sm text-amber-700 dark:text-amber-300">
          Live headlines are temporarily unavailable. Showing sample headlines.
        </p>
      )}
      {!loading && !error && articles.length === 0 && (
        <EmptyState
          preset="noNews"
          size="sm"
        />
      )}
      <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
        {articles.map((a, idx) => (
          <a
            key={idx}
            href={a.url}
            target="_blank"
            rel="noreferrer"
            className="block group p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
          >
            <div className="text-sm font-semibold text-slate-800 dark:text-slate-200 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors line-clamp-2 mb-1">
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
