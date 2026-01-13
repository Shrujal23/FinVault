import { useState } from 'react';
import { apiRequest } from '../api/client.js';
import { Mail, Smartphone, Send, AlertCircle, CheckCircle, ArrowLeft } from 'lucide-react';

export default function ForgotPasswordForm({ onSwitchToLogin }) {
    const [method, setMethod] = useState('email'); // 'email' or 'phone'
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    async function onSubmit(e) {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);

        try {
            const body = method === 'email' 
                ? { email: email.trim() }
                : { phone: phone.trim() };

            const endpoint = method === 'email'
                ? '/api/auth/forgot-password'
                : '/api/auth/forgot-password-phone';

            const data = await apiRequest(endpoint, {
                method: 'POST',
                body,
            });

            // If server returned resetToken (dev mode), show it so developer can click through
            if (data?.resetToken) {
                setSuccess(
                    `Reset link generated — click to open or copy token: ${data.resetToken}`
                );
                // attach token to local state so we can open it quickly
                setTimeout(() => {
                    // expose globally for quick testing in dev
                    window.__last_reset_token = data.resetToken;
                }, 0);
            } else {
                setSuccess(
                    method === 'email'
                        ? (data.message || 'If an account with that email exists, a reset link has been sent.')
                        : (data.message || 'If an account with that phone number exists, a reset code has been sent.')
                );
            }
        } catch (err) {
            // Security: always show generic success to prevent enumeration
            setSuccess(
                method === 'email'
                    ? 'If an account with that email exists, a reset link has been sent.'
                    : 'If an account with that phone number exists, a reset code has been sent.'
            );
        } finally {
            setLoading(false);
        }
    }

    const isValidInput = method === 'email' ? email.includes('@') : phone.length >= 10;

    return (
        <form onSubmit={onSubmit} className="space-y-6">
            {/* Header */}
            <div className="text-center space-y-2">
                <h3 className="text-2xl font-bold text-slate-800 dark:text-white">
                    Reset Your Password
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                    Choose how you'd like to receive your password reset instructions.
                </p>
            </div>

            {/* Method Selector */}
            <div className="grid grid-cols-2 gap-4">
                <button
                    type="button"
                    onClick={() => setMethod('email')}
                    className={`p-4 rounded-xl border-2 transition-all duration-200 flex flex-col items-center gap-3 ${
                        method === 'email'
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                            : 'border-slate-300 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-600'
                    }`}
                >
                    <Mail className={`w-8 h-8 ${method === 'email' ? 'text-blue-600' : 'text-slate-500'}`} />
                    <span className="text-sm font-medium">Via Email</span>
                </button>
                <button
                    type="button"
                    onClick={() => setMethod('phone')}
                    className={`p-4 rounded-xl border-2 transition-all duration-200 flex flex-col items-center gap-3 ${
                        method === 'phone'
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                            : 'border-slate-300 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-600'
                    }`}
                >
                    <Smartphone className={`w-8 h-8 ${method === 'phone' ? 'text-blue-600' : 'text-slate-500'}`} />
                    <span className="text-sm font-medium">Via SMS</span>
                </button>
            </div>

            {/* Input Field */}
            <div className="space-y-2 group">
                <label
                    htmlFor="recovery-input"
                    className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2"
                >
                    {method === 'email' ? <Mail className="w-4 h-4" /> : <Smartphone className="w-4 h-4" />}
                    {method === 'email' ? 'Email address' : 'Phone number'}
                </label>
                <div className="relative focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2 rounded-xl transition-all duration-200">
                    <input
                        id="recovery-input"
                        type={method === 'email' ? 'email' : 'tel'}
                        value={method === 'email' ? email : phone}
                        onChange={(e) => method === 'email' ? setEmail(e.target.value) : setPhone(e.target.value)}
                        required
                        autoComplete={method === 'email' ? 'email' : 'tel'}
                        placeholder={method === 'email' ? 'you@company.com' : '+1 (555) 000-1234'}
                        className="w-full px-4 py-3 pl-11 rounded-xl border
                                   bg-slate-50 dark:bg-slate-800/50
                                   border-slate-300 dark:border-slate-700
                                   text-slate-900 dark:text-white
                                   placeholder-slate-400
                                   focus:outline-none focus:border-blue-500 focus:bg-white dark:focus:bg-slate-800
                                   transition-all duration-200"
                    />
                    {method === 'email' ? (
                        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                    ) : (
                        <Smartphone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                    )}
                </div>
            </div>

            {/* Success Message */}
            {success && (
                <div className="flex items-start gap-3 p-4 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-800 dark:text-green-400 text-sm">
                    <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    <div>
                        <p className="font-medium">Check your {method === 'email' ? 'inbox' : 'messages'}</p>
                        <p className="mt-1 break-words">{success}</p>
                        {/* If developer got a token returned, show an action */}
                        {window.__last_reset_token && (
                            <div className="mt-3 flex gap-2">
                                <button
                                    type="button"
                                    onClick={() => window.location.href = `/reset-password/${window.__last_reset_token}`}
                                    className="px-3 py-1 rounded bg-blue-600 text-white text-sm"
                                >
                                    Open reset link
                                </button>
                                <button
                                    type="button"
                                    onClick={() => navigator.clipboard && navigator.clipboard.writeText(window.__last_reset_token)}
                                    className="px-3 py-1 rounded border border-slate-300 text-sm"
                                >
                                    Copy token
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Submit Button */}
            <button
                type="submit"
                disabled={loading || !isValidInput}
                className="w-full py-3 rounded-lg text-white font-semibold
                           bg-slate-700 hover:bg-slate-600 dark:bg-slate-600 dark:hover:bg-slate-500
                           disabled:bg-slate-400 disabled:cursor-not-allowed
                           shadow-sm
                           transition-colors
                           flex items-center justify-center gap-3"
            >
                {loading ? (
                    <>
                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" opacity="0.3" />
                            <path fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                        </svg>
                        Sending...
                    </>
                ) : (
                    <>
                        <Send className="w-5 h-5" />
                        Send Reset {method === 'email' ? 'Link' : 'Code'}
                    </>
                )}
            </button>

            {/* Back to Login */}
            <div className="text-center">
                <button
                    type="button"
                    onClick={onSwitchToLogin}
                    className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 hover:underline transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Sign In
                </button>
            </div>
        </form>
    );
}