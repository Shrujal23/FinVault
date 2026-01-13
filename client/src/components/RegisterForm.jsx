import { useState } from 'react';
import { apiRequest } from '../api/client.js';
import { Mail, Lock, Eye, EyeOff, Check, X, AlertCircle } from 'lucide-react';

export default function RegisterForm({ auth }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [focused, setFocused] = useState({ email: false, password: false, confirm: false });

    const getPasswordStrength = () => {
        let strength = 0;
        if (password.length >= 8) strength += 1;
        if (password.match(/[a-z]/) && password.match(/[A-Z]/)) strength += 1;
        if (password.match(/[0-9]/)) strength += 1;
        if (password.match(/[^a-zA-Z0-9]/)) strength += 1;
        return strength;
    };

    const strength = getPasswordStrength();
    const strengthLabels = ['Too short', 'Weak', 'Fair', 'Good', 'Strong'];
    const strengthColors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-green-500'];

    async function onSubmit(e) {
        e.preventDefault();
        setError('');

        if (password.length < 8) {
            setError('Password must be at least 8 characters long');
            return;
        }
        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        setLoading(true);
        try {
            const data = await apiRequest('/api/auth/register', {
                method: 'POST',
                body: { email: email.trim(), password },
            });

            // Persist token by default after registration
            auth.setToken(data.token, true);
            auth.setUser(data.user);
        } catch (err) {
            setError(err.message || 'Failed to create account. Try another email.');
        } finally {
            setLoading(false);
        }
    }

    return (
        <form onSubmit={onSubmit} className="space-y-6">
            {/* Email */}
            <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    Email Address
                </label>
                <div className={`relative transition-all duration-200 ${focused.email ? 'ring-2 ring-emerald-500 ring-offset-2' : ''} rounded-xl`}>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        onFocus={() => setFocused({ ...focused, email: true })}
                        onBlur={() => setFocused({ ...focused, email: false })}
                        required
                        autoComplete="email"
                        placeholder="you@company.com"
                        className="w-full px-4 py-3 pl-12 rounded-xl border bg-slate-50 dark:bg-slate-800/50 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:bg-white dark:focus:bg-slate-800 transition-all duration-200"
                    />
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 transition-colors" />
                </div>
            </div>

            {/* Password + Strength */}
            <div className="space-y-3">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
                    <Lock className="w-4 h-4" />
                    Password
                </label>
                <div className={`relative transition-all duration-200 ${focused.password ? 'ring-2 ring-emerald-500 ring-offset-2' : ''} rounded-xl`}>
                    <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        onFocus={() => setFocused({ ...focused, password: true })}
                        onBlur={() => setFocused({ ...focused, password: false })}
                        required
                        autoComplete="new-password"
                        placeholder="Create a strong password"
                        className="w-full px-4 py-3 pl-12 pr-12 rounded-xl border bg-slate-50 dark:bg-slate-800/50 border-slate-300 dark:border-slate-700 focus:outline-none focus:border-emerald-500 focus:bg-white dark:focus:bg-slate-800 transition-all duration-200"
                    />
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 transition-colors" />

                    {/* Always visible eye toggle */}
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                        aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                </div>

                {password && (
                    <div className="space-y-2">
                        <div className="flex gap-2">
                            {[0, 1, 2, 3].map((i) => (
                                <div
                                    key={i}
                                    className={`h-2 flex-1 rounded-full transition-all duration-300 ${
                                        i < strength ? strengthColors[strength - 1] : 'bg-slate-200 dark:bg-slate-700'
                                    }`}
                                />
                            ))}
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-400">
                            Strength: <span className="font-semibold">{strengthLabels[strength] || strengthLabels[0]}</span>
                        </p>
                    </div>
                )}
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
                    <Lock className="w-4 h-4" />
                    Confirm Password
                </label>
                <div className={`relative transition-all duration-200 ${focused.confirm ? 'ring-2 ring-emerald-500 ring-offset-2' : ''} rounded-xl`}>
                    <input
                        type={showConfirm ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        onFocus={() => setFocused({ ...focused, confirm: true })}
                        onBlur={() => setFocused({ ...focused, confirm: false })}
                        required
                        autoComplete="new-password"
                        placeholder="Repeat your password"
                        className={`w-full px-4 py-3 pl-12 pr-12 rounded-xl border bg-slate-50 dark:bg-slate-800/50 focus:outline-none focus:border-emerald-500 focus:bg-white dark:focus:bg-slate-800 transition-all duration-200 ${
                            confirmPassword && password !== confirmPassword
                                ? 'border-red-400 focus:border-red-500'
                                : 'border-slate-300 dark:border-slate-700'
                        }`}
                    />
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 transition-colors" />

                    {/* Match indicator (Check/X) – behind the eye button */}
                    {confirmPassword && password !== confirmPassword && (
                        <X className="absolute right-12 top-1/2 -translate-y-1/2 w-5 h-5 text-red-500 pointer-events-none" />
                    )}
                    {confirmPassword && password === confirmPassword && confirmPassword.length > 0 && (
                        <Check className="absolute right-12 top-1/2 -translate-y-1/2 w-5 h-5 text-green-500 pointer-events-none" />
                    )}

                    {/* Always visible eye toggle – on top (highest z-index) */}
                    <button
                        type="button"
                        onClick={() => setShowConfirm(!showConfirm)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors z-10"
                        aria-label={showConfirm ? "Hide password" : "Show password"}
                    >
                        {showConfirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                </div>
            </div>

            {/* Divider */}
            <div className="relative flex items-center justify-center py-4">
                <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-300 dark:border-slate-700" />
                </div>
                <span className="relative bg-white dark:bg-slate-900 px-4 text-sm text-slate-500 dark:text-slate-400">
                    Or continue with
                </span>
            </div>

            {/* Social Logins (disabled for now) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button type="button" disabled className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                    <svg className="w-5 h-5" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"></path><path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"></path><path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.223,0-9.657-3.356-11.303-7.912l-6.571,4.819C9.656,39.663,16.318,44,24,44z"></path><path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571l6.19,5.238C39.901,36.626,44,30.638,44,24C44,22.659,43.862,21.35,43.611,20.083z"></path></svg>
                    Google
                </button>
                <button type="button" disabled className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-900 text-white hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                    <svg className="w-5 h-5" viewBox="0 0 16 16"><path fill="currentColor" d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0 0 16 8c0-4.42-3.58-8-8-8z"></path></svg>
                    GitHub
                </button>
            </div>

            {/* Error */}
            {error && (
                <div className="flex items-start gap-3 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-400 text-sm">
                    <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    <span>{error}</span>
                </div>
            )}

            {/* Submit */}
            <button
                type="submit"
                disabled={loading || !email || password.length < 8 || password !== confirmPassword}
                className="w-full py-3 rounded-lg text-white font-semibold bg-slate-700 hover:bg-slate-600 dark:bg-slate-600 dark:hover:bg-slate-500 disabled:bg-slate-400 disabled:cursor-not-allowed shadow-sm transition-colors"
            >
                {loading ? (
                    <span className="flex items-center justify-center gap-3">
                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" opacity="0.3" />
                            <path fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                        </svg>
                        Creating Account...
                    </span>
                ) : (
                    'Create Account'
                )}
            </button>
        </form>
    );
}