const API_BASE = (
    import.meta.env.VITE_API_BASE ||
    (typeof window !== 'undefined' && window.location.hostname === 'localhost' ? 'http://localhost:4000': 'http://localhost:4000')
).replace(/\/$/, '');

export function getStoredToken() {
    return localStorage.getItem('token') || sessionStorage.getItem('token') || '';
}

export function clearStoredAuth() {
    localStorage.removeItem('token');
    sessionStorage.removeItem('token');
    localStorage.removeItem('user');
    sessionStorage.removeItem('user');
}

export async function apiRequest(path, { method = 'GET', body, token: inputToken, signal } = {}) {
    const headers = { 'Content-Type': 'application/json' };

    const token = inputToken || getStoredToken();

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    let res;
    try {
        res = await fetch(`${API_BASE}${path}`, {
            method,
            headers,
            body: body ? JSON.stringify(body) : undefined,
            credentials: 'include',
            signal
        });
    } catch (e) {
        if (e?.name === 'AbortError') {
            throw e;
        }
        console.error('Network error', e);
        throw new Error('Could not reach API.');
    }

    if (!res.ok) {
        const err = await safeJson(res);
        console.error('API request failed', { path, status: res.status, body: err });

        if (res.status === 401 || res.status === 403) {
            clearStoredAuth();
            throw new Error(err?.error || 'Unauthorized: Token missing, invalid, or expired.');
        }

        if (res.status === 429) {
            const detail = err?.message || err?.error || 'Too many requests. Please wait a minute and try again.';
            const rateLimitError = new Error(detail);
            rateLimitError.status = 429;
            rateLimitError.retryAfterSeconds = Number(res.headers.get('Retry-After')) || err?.retryAfterSeconds || 60;
            throw rateLimitError;
        }

        throw new Error(err?.error || err?.message || `Request failed: ${res.status}`);
    }

    if (res.status === 204) return null;
    return await safeJson(res);
}

async function safeJson(res) {
    try { return await res.json(); } catch { return null; }
}
