import { useEffect, useRef, useState } from 'react';
import { apiRequest } from '../api/client.js';

export default function StockSearch({ token, type = 'stock', value, onSelect, onInputChange, placeholder = 'Search stocks...' }) {
  const [query, setQuery] = useState(value || '');
  const [items, setItems] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [active, setActive] = useState(-1);
  const containerRef = useRef(null);

  // Sync query with parent value
  useEffect(() => { setQuery(value || ''); }, [value]);

  // Close dropdown if clicked outside
  useEffect(() => {
    function onDocClick(e) {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('click', onDocClick);
    return () => document.removeEventListener('click', onDocClick);
  }, []);

  // Search API call
  useEffect(() => {
    if (!query || query.length < 1) {
      setItems([]);
      return;
    }

    setLoading(true);
    setError('');

    const handle = setTimeout(async () => {
      try {
        let endpoint = '/api/search/stocks';
        if (type === 'crypto') {
          endpoint = '/api/search/crypto';
        } else if (type === 'mutual') {
          endpoint = '/api/search/mutual';
        }
        
        const res = await apiRequest(
          `${endpoint}?q=${encodeURIComponent(query)}`,
          { token }
        );

        setItems(res.results || []);
        setOpen(true);
        setActive(-1);
      } catch (e) {
        setError(e.message || 'Failed to fetch search results');
        setItems([]);
        setOpen(false);
      } finally {
        setLoading(false);
      }
    }, 200);

    return () => clearTimeout(handle);
  }, [query, token, type]);

  function onChange(e) {
    setQuery(e.target.value);
    onInputChange?.(e.target.value);
  }

  function choose(item) {
    setOpen(false);
    onSelect?.(item);
  }

  function onKeyDown(e) {
    if (!open) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive(a => Math.min(a + 1, items.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive(a => Math.max(a - 1, 0));
    } else if (e.key === 'Enter') {
      if (active >= 0 && items[active]) {
        e.preventDefault();
        choose(items[active]);
      }
    }
  }

  return (
    <div ref={containerRef} className="relative">
      <input
        className="w-full border rounded px-3 py-2 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
        value={query}
        onChange={onChange}
        placeholder={placeholder}
        onFocus={() => { if (items.length) setOpen(true); }}
        onKeyDown={onKeyDown}
      />
      {open && (
        <div className="absolute z-10 mt-1 w-full bg-white border rounded shadow max-h-64 overflow-auto dark:bg-slate-900 dark:border-slate-700">
          {loading && <div className="px-3 py-2 text-sm text-gray-500">Loading...</div>}
          {error && <div className="px-3 py-2 text-sm text-red-600">{error}</div>}
          {!loading && !error && items.length === 0 && (
            <div className="px-3 py-2 text-sm text-gray-500">No results</div>
          )}
          {items.map((it, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => choose(it)}
              className={`w-full text-left px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-800 ${
                idx === active ? 'bg-gray-50 dark:bg-gray-800' : ''
              }`}
            >
              <div className="font-medium">{it.symbol}</div>
              <div className="text-xs text-gray-500">{it.name} · {it.exchange}</div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
