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

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await apiRequest('/api/auth/login', {
                method: 'POST',
                body: {
                    email: email.trim(),
                    password: password,
                },
            });

            auth.setToken(response.token, remember);
            auth.setUser(response.user);
        } catch (err) {
            setError(err.message || 'Invalid email or password. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <div className="space-y-1.5">
                <label htmlFor="email" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Email Address
                </label>
                <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                        <Mail className="w-5 h-5" />
                    </div>
                    <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        autoComplete="email"
                        placeholder="you@example.com"
                        className="w-full pl-11 pr-4 py-3 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-2xl focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
                    />
                </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                    <label htmlFor="password" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        Password
                    </label>
                    <button
                        type="button"
                        onClick={onSwitchToForgot}
                        className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 font-medium"
                    >
                        Forgot password?
                    </button>
                </div>

                <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                        <Lock className="w-5 h-5" />
                    </div>
                    <input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        autoComplete="current-password"
                        placeholder="Enter your password"
                        className="w-full pl-11 pr-12 py-3 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-2xl focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                    >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center">
                <label className="flex items-center gap-2 cursor-pointer">
                    <input
                        type="checkbox"
                        checked={remember}
                        onChange={(e) => setRemember(e.target.checked)}
                        className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-slate-600 dark:text-slate-400">Remember me</span>
                </label>
            </div>

            {/* Error Message */}
            {error && (
                <div className="flex gap-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-4 text-sm text-red-700 dark:text-red-400">
                    <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    <span>{error}</span>
                </div>
            )}

            {/* Submit Button */}
            <button
                type="submit"
                disabled={loading || !email.trim() || !password}
                className="w-full py-3.5 rounded-2xl bg-slate-900 hover:bg-black dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 text-white font-semibold transition disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
                {loading ? (
                    <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Signing in...
                    </>
                ) : (
                    'Sign In'
                )}
            </button>
        </form>
    );
}