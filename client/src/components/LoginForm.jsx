import { useState } from 'react';
import { apiRequest } from '../api/client.js';
import { Eye, EyeOff, Mail, Lock, AlertCircle } from 'lucide-react';

export default function LoginForm({ auth, onSwitchToForgot }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [remember, setRemember] = useState(false);

    async function onSubmit(e) {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const body = { email: email.trim(), password };
            const data = await apiRequest('/api/auth/login', {
                method: 'POST',
                body,
            });

            // Persist token according to "remember" choice (setToken(token, remember))
            auth.setToken(data.token, remember);
            auth.setUser(data.user);
        } catch (err) {
            setError(err.message || 'Invalid email or password. Please try again.');
        } finally {
            setLoading(false);
        }
    }

    return (
        <form onSubmit={onSubmit} className="space-y-6">
            {/* Email Field */}
            <div className="space-y-2 group">
                <label htmlFor="email" className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    Email address
                </label>
                <div className="relative focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2 rounded-xl transition-all duration-200">
                    <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        autoComplete="email"
                        placeholder="you@company.com"
                        className="w-full px-4 py-3 pl-11 rounded-xl border
                                   bg-slate-50 dark:bg-slate-800/50
                                   border-slate-300 dark:border-slate-700
                                   text-slate-900 dark:text-white
                                   placeholder-slate-400
                                   focus:outline-none focus:border-blue-500 focus:bg-white dark:focus:bg-slate-800
                                   transition-all duration-200"
                    />
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2 group">
                <div className="flex justify-between items-center">
                    <label htmlFor="password" className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
                        <Lock className="w-4 h-4" />
                        Password
                    </label>
                    <button
                        type="button"
                        onClick={onSwitchToForgot}
                        className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 font-medium"
                    >
                        Forgot password?
                    </button>
                </div>
                <div className="relative focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2 rounded-xl transition-all duration-200">
                    <input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        autoComplete="current-password"
                        placeholder="Enter your password"
                        className="w-full px-4 py-3 pl-11 pr-12 rounded-xl border 
                                   bg-slate-50 dark:bg-slate-800/50
                                   border-slate-300 dark:border-slate-700
                                   text-slate-900 dark:text-white
                                   placeholder-slate-400
                                   focus:outline-none focus:border-blue-500 focus:bg-white dark:focus:bg-slate-800
                                   transition-all duration-200"
                    />
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />

                    {/* ONLY ONE eye toggle button – always visible */}
                    <button
                        type="button"
                        onClick={() => setShowPassword(prev => !prev)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition"
                        aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                </div>

                {/* Remember me checkbox */}
                <div className="flex items-center justify-between mt-2">
                    <label className="inline-flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                        <input
                            type="checkbox"
                            checked={remember}
                            onChange={(e) => setRemember(e.target.checked)}
                            className="form-checkbox w-4 h-4 rounded text-blue-600"
                            aria-label="Remember me"
                        />
                        <span>Remember me</span>
                    </label>
                </div>
            </div>

            {/* Error Alert */}
            {error && (
                <div className="flex items-start gap-3 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-400 text-sm">
                    <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    <span>{error}</span>
                </div>
            )}

            {/* Submit Button */}
            <button
                type="submit"
                disabled={loading || !email || !password}
                className="w-full py-3 rounded-lg text-white font-semibold
                           bg-slate-700 hover:bg-slate-600 dark:bg-slate-600 dark:hover:bg-slate-500
                           disabled:bg-slate-400 disabled:cursor-not-allowed
                           shadow-sm
                           transition-colors"
            >
                {loading ? (
                    <span className="flex items-center justify-center gap-3">
                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" opacity="0.3" />
                            <path fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                        </svg>
                        Signing In...
                    </span>
                ) : (
                    'Sign In'
                )}
            </button>
        </form>
    );
}