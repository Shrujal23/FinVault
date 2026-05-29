import { useState, useCallback } from 'react';
import { apiRequest } from '../api/client.js';
import { Mail, Lock, Eye, EyeOff, AlertCircle, Loader2 } from 'lucide-react';

export default function LoginForm({ auth, onSwitchToForgot }) {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [remember, setRemember] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = useCallback(async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await apiRequest('/api/auth/login', {
                method: 'POST',
                body: {
                    email: formData.email.trim().toLowerCase(),
                    password: formData.password,
                },
            });

            auth.setToken(response.token, remember);
            auth.setUser(response.user);
        } catch (err) {
            setError(err.message || "We couldn't find a match for that email and password.");
        } finally {
            setLoading(false);
        }
    }, [formData, remember, auth]);

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    Email Address
                </label>
                <div className="relative">
                    <input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        autoComplete="email"
                        placeholder="you@example.com"
                        className="w-full pl-11 pr-4 py-3.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-2xl focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/30 transition-all"
                    />
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                        <Mail className="w-5 h-5" />
                    </div>
                </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
                <div className="flex justify-between items-center">
                    <label htmlFor="password" className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
                        <Lock className="w-4 h-4" />
                        Password
                    </label>
                    <button
                        type="button"
                        onClick={onSwitchToForgot}
                        className="text-sm text-cyan-600 hover:text-cyan-700 dark:text-cyan-400 font-medium transition"
                    >
                        Forgot password?
                    </button>
                </div>

                <div className="relative">
                    <input
                        id="password"
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        value={formData.password}
                        onChange={handleChange}
                        required
                        autoComplete="current-password"
                        placeholder="Enter your password"
                        className="w-full pl-11 pr-12 py-3.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-2xl focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/30 transition-all"
                    />
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                        <Lock className="w-5 h-5" />
                    </div>
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition"
                        aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                        type="checkbox"
                        checked={remember}
                        onChange={(e) => setRemember(e.target.checked)}
                        className="w-4 h-4 accent-cyan-600 border-slate-300 rounded focus:ring-cyan-500"
                    />
                    <span className="text-sm text-slate-600 dark:text-slate-400">Stay logged in</span>
                </label>
            </div>

            {/* Error Message */}
            {error && (
                <div className="flex items-start gap-3 p-4 rounded-2xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400">
                    <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    <span>{error}</span>
                </div>
            )}

            {/* Submit Button */}
            <button
                type="submit"
                disabled={loading || !formData.email.trim() || !formData.password}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 font-semibold text-white transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-sm"
            >
                {loading ? (
                    <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Unlocking vault...
                    </>
                ) : (
                    'Sign into FinVault'
                )}
            </button>
        </form>
    );
}