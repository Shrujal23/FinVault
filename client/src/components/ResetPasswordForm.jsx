import { useEffect, useState } from 'react';
import { apiRequest } from '../api/client.js';
import { Lock, CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react';

export default function ResetPasswordForm({ token: propToken, onDone }) {
    const [token, setToken] = useState(propToken || '');
    const [valid, setValid] = useState(null); // null -> checking, true/false
    const [password, setPassword] = useState('');
    const [confirm, setConfirm] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        if (!token) {
            // attempt to read from URL
            const path = window.location.pathname || '';
            if (path.startsWith('/reset-password/')) {
                setToken(path.replace('/reset-password/', '').trim());
            }
        }
    }, []);

    useEffect(() => {
        async function validate() {
            if (!token) return setValid(false);
            setValid(null);
            try {
                const res = await apiRequest(`/api/auth/reset-password/validate?token=${encodeURIComponent(token)}`);
                setValid(Boolean(res?.valid));
            } catch (e) {
                setValid(false);
            }
        }
        validate();
    }, [token]);

    async function onSubmit(e) {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!password || password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }
        if (password !== confirm) {
            setError('Passwords do not match');
            return;
        }

        setLoading(true);
        try {
            const res = await apiRequest('/api/auth/reset-password', {
                method: 'POST',
                body: {
                    token,
                    password
                }
            });
            setSuccess(res.message || 'Password has been reset successfully');
            // Optionally redirect to login
            setTimeout(() => {
                if (onDone) onDone();
                window.location.href = '/';
            }, 1200);
        } catch (err) {
            setError(err.message || 'Failed to reset password');
        } finally {
            setLoading(false);
        }
    }

    if (valid === null) {
        return (
            <div className="max-w-md mx-auto p-6 bg-white dark:bg-slate-800 rounded-xl shadow">
                <p className="text-sm text-slate-600 dark:text-slate-300">Validating reset link...</p>
            </div>
        );
    }

    if (!valid) {
        return (
            <div className="max-w-md mx-auto p-6 bg-white dark:bg-slate-800 rounded-xl shadow">
                <div className="flex items-start gap-3 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-400 text-sm">
                    <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    <div>
                        <p className="font-medium">Invalid or expired link</p>
                        <p className="mt-1">This password reset link is invalid or has expired. Please request a new reset link.</p>
                    </div>
                </div>
                <div className="mt-4 text-center">
                    <button onClick={() => window.location.href = '/'} className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700">Back to Sign In</button>
                </div>
            </div>
        );
    }

    return (
        <form onSubmit={onSubmit} className="max-w-md mx-auto p-6 bg-white dark:bg-slate-800 rounded-xl shadow space-y-4">
            <div className="text-center space-y-2">
                <Lock className="w-8 h-8 mx-auto text-blue-600" />
                <h3 className="text-2xl font-bold">Choose a new password</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">Enter a strong password and confirm to finish resetting your account password.</p>
            </div>

            {error && (
                <div className="p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-400 text-sm">{error}</div>
            )}

            {success && (
                <div className="p-3 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-800 dark:text-green-400 text-sm">{success}</div>
            )}

            <div className="space-y-2">
                <label className="text-sm font-medium">New password</label>
                <input type="password" value={password} onChange={(e)=>setPassword(e.target.value)} className="w-full px-4 py-3 rounded-xl border bg-slate-50 dark:bg-slate-800/50" />
            </div>

            <div className="space-y-2">
                <label className="text-sm font-medium">Confirm password</label>
                <input type="password" value={confirm} onChange={(e)=>setConfirm(e.target.value)} className="w-full px-4 py-3 rounded-xl border bg-slate-50 dark:bg-slate-800/50" />
            </div>

            <button type="submit" disabled={loading} className="w-full py-3.5 rounded-xl text-white font-semibold bg-blue-600 hover:bg-blue-700">
                {loading ? 'Resetting...' : 'Reset Password'}
            </button>

            <div className="text-center">
                <button type="button" onClick={() => window.location.href = '/'} className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700">Back to Sign In</button>
            </div>
        </form>
    );
}
