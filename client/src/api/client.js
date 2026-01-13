const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:4000';

export async function apiRequest(path, { method = 'GET', body, token: inputToken } = {}) {
    const headers = { 'Content-Type': 'application/json' };

    const token = inputToken || localStorage.getItem('token');

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    let res;
    try {
        res = await fetch(`${API_BASE}${path}`, {
            method,
            headers,
            body: body ? JSON.stringify(body) : undefined,
            credentials: 'include'
        });
    } catch (e) {
        console.error('Network error', e);
        throw new Error('Could not reach API.');
    }

    if (!res.ok) {
        const err = await safeJson(res);
        console.error('API request failed', { path, status: res.status, body: err });

        if (res.status === 401 || res.status === 403) {
            localStorage.removeItem('token');
            throw new Error('Unauthorized/Forbidden: Token missing, invalid, or expired.');
        }

        throw new Error(err?.error || `Request failed: ${res.status}`);
    }

    return await safeJson(res);
}

async function safeJson(res) {
    try { return await res.json(); } catch { return null; }
}
