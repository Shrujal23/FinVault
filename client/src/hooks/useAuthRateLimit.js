import { useCallback, useEffect, useState } from 'react';

const MAX_ATTEMPTS = 5;
const WINDOW_MS = 60_000;

function getRecentAttempts(key) {
    try {
        const saved = JSON.parse(localStorage.getItem(key) || '[]');
        const now = Date.now();
        return Array.isArray(saved) ? saved.filter((time) => now - time < WINDOW_MS) : [];
    } catch {
        return [];
    }
}

export default function useAuthRateLimit(scope) {
    const storageKey = `finvault:${scope}:attempts`;
    const [lockedUntil, setLockedUntil] = useState(() => {
        const attempts = getRecentAttempts(storageKey);
        return attempts.length >= MAX_ATTEMPTS ? attempts[0] + WINDOW_MS : 0;
    });
    const [now, setNow] = useState(Date.now());

    useEffect(() => {
        if (lockedUntil <= Date.now()) return undefined;
        const timer = window.setInterval(() => setNow(Date.now()), 1_000);
        return () => window.clearInterval(timer);
    }, [lockedUntil]);

    const remainingSeconds = Math.max(0, Math.ceil((lockedUntil - now) / 1_000));

    const recordFailedAttempt = useCallback(() => {
        const attempts = [...getRecentAttempts(storageKey), Date.now()];
        localStorage.setItem(storageKey, JSON.stringify(attempts));
        if (attempts.length >= MAX_ATTEMPTS) {
            setLockedUntil(attempts[0] + WINDOW_MS);
        }
    }, [storageKey]);

    const lockFor = useCallback((seconds = 60) => {
        setLockedUntil(Date.now() + seconds * 1_000);
    }, []);

    const resetAttempts = useCallback(() => {
        localStorage.removeItem(storageKey);
        setLockedUntil(0);
    }, [storageKey]);

    return { isLocked: remainingSeconds > 0, remainingSeconds, recordFailedAttempt, lockFor, resetAttempts };
}
