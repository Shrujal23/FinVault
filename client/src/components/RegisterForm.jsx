import { useState, useCallback } from 'react';
import { Mail, Lock, Eye, EyeOff, Check, X, AlertCircle, Shield, Loader2 } from 'lucide-react';
import { apiRequest } from '../api/client.js';
import StatusMessage from './StatusMessage.jsx';

const PasswordField = ({
    label,
    value,
    onChange,
    showPassword,
    toggleShow,
    isConfirm = false,
    matchStatus = null,
    focused,
    onFocus,
    onBlur,
    placeholder
}) => (
    <div className="space-y-2">
        <label className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
            <Lock className="w-4 h-4" />
            {label}
        </label>
        <div className={`relative transition-all duration-200 ${focused ? 'ring-2 ring-emerald-500 ring-offset-2' : ''} rounded-xl`}>
            <input
                type={showPassword ? 'text' : 'password'}
                value={value}
                onChange={onChange}
                onFocus={onFocus}
                onBlur={onBlur}
                required
                autoComplete={isConfirm ? "new-password" : "current-password"}
                placeholder={placeholder}
                className={`w-full px-4 py-3 pl-12 pr-12 rounded-xl border bg-slate-50 dark:bg-slate-800/50 
                    focus:outline-none focus:border-emerald-500 focus:bg-white dark:focus:bg-slate-800 transition-all duration-200
                    ${matchStatus === 'mismatch' ? 'border-red-400 focus:border-red-500' : 'border-slate-300 dark:border-slate-700'}`}
            />
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />

            {/* Match Indicator */}
            {isConfirm && value && (
                <div className="absolute right-12 top-1/2 -translate-y-1/2 pointer-events-none">
                    {matchStatus === 'match' && <Check className="w-5 h-5 text-emerald-500" />}
                    {matchStatus === 'mismatch' && <X className="w-5 h-5 text-red-500" />}
                </div>
            )}

            {/* Toggle Button */}
            <button
                type="button"
                onClick={toggleShow}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 z-10 transition-colors"
                aria-label={showPassword ? "Hide password" : "Show password"}
            >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
        </div>
    </div>
);

export default function RegisterForm({ auth }) {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        confirmPassword: '',
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [focused, setFocused] = useState({ email: false, password: false, confirm: false });
    const [acceptedTerms, setAcceptedTerms] = useState(false);
    const [modalContent, setModalContent] = useState(null); // 'terms' | 'privacy' | null

    // Password Strength
    const getPasswordStrength = useCallback((pwd) => {
        if (!pwd) return { score: 0, label: 'Enter password', color: 'bg-slate-200' };
        
        let score = 0;
        if (pwd.length >= 8) score++;
        if (pwd.length >= 12) score++;
        if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) score++;
        if (/\d/.test(pwd)) score++;
        if (/[^a-zA-Z0-9]/.test(pwd)) score++;

        const labels = ['Too short', 'Weak', 'Fair', 'Good', 'Strong', 'Excellent'];
        const colors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-emerald-500', 'bg-emerald-600'];

        return {
            score: Math.min(score, 5),
            label: labels[Math.min(score, 5)],
            color: colors[Math.min(score - 1, 4)] || 'bg-red-500'
        };
    }, []);

    const strength = getPasswordStrength(formData.password);
    const passwordChecks = [
        { id: 'length', label: 'At least 12 characters', met: formData.password.length >= 12 },
        { id: 'uppercase', label: 'One uppercase letter', met: /[A-Z]/.test(formData.password) },
        { id: 'lowercase', label: 'One lowercase letter', met: /[a-z]/.test(formData.password) },
        { id: 'number', label: 'One number', met: /\d/.test(formData.password) },
        { id: 'special', label: 'One special character', met: /[^A-Za-z0-9\s]/.test(formData.password) },
        { id: 'spaces', label: 'No spaces', met: !/\s/.test(formData.password) },
    ];
    const passwordsMatch = formData.confirmPassword && 
                          formData.password === formData.confirmPassword;
    const matchStatus = formData.confirmPassword 
        ? (passwordsMatch ? 'match' : 'mismatch') 
        : null;

    const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    const validatePasswordPolicy = (pwd) => /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9\s]).{12,}$/.test(pwd);

    const handleSubmit = useCallback(async (e) => {
        e.preventDefault();
        setError('');

        if (!validateEmail(formData.email)) {
            setError('Please enter a valid email address');
            return;
        }
        if (!validatePasswordPolicy(formData.password)) {
            setError('Password must be at least 12 characters and include uppercase, lowercase, a number, and a special character');
            return;
        }
        if (!passwordsMatch) {
            setError('Passwords do not match');
            return;
        }
        if (!acceptedTerms) {
            setError('You must accept the Terms & Conditions');
            return;
        }

        setLoading(true);
        try {
            const data = await apiRequest('/api/auth/register', {
                method: 'POST',
                body: { 
                    email: formData.email.trim().toLowerCase(), 
                    password: formData.password 
                },
            });

            auth.setToken(data.token, true);
            auth.setUser(data.user);
            
            // Optional: You could trigger a success toast here
        } catch (err) {
            setError(err.message || 'Failed to create account. This email may already be registered.');
        } finally {
            setLoading(false);
        }
    }, [formData, passwordsMatch, acceptedTerms, auth]);

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    Email Address
                </label>
                <div className={`relative transition-all duration-200 ${focused.email ? 'ring-2 ring-emerald-500 ring-offset-2' : ''} rounded-xl`}>
                    <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                        onFocus={() => setFocused(prev => ({ ...prev, email: true }))}
                        onBlur={() => setFocused(prev => ({ ...prev, email: false }))}
                        required
                        autoComplete="email"
                        placeholder="you@company.com"
                        className="w-full px-4 py-3 pl-12 rounded-xl border bg-slate-50 dark:bg-slate-800/50 border-slate-300 dark:border-slate-700 focus:outline-none focus:border-emerald-500 focus:bg-white dark:focus:bg-slate-800 transition-all"
                    />
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                </div>
            </div>

            {/* Password Field */}
            <PasswordField
                label="Create Password"
                value={formData.password}
                onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                showPassword={showPassword}
                toggleShow={() => setShowPassword(!showPassword)}
                focused={focused.password}
                onFocus={() => setFocused(prev => ({ ...prev, password: true }))}
                onBlur={() => setFocused(prev => ({ ...prev, password: false }))}
                placeholder="Create a strong password"
            />

            {/* Password Strength */}
            {formData.password && (
                <div className="space-y-3 pl-1">
                    <div className="flex gap-1.5">
                        {[1, 2, 3, 4, 5].map((i) => (
                            <div
                                key={i}
                                className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${i <= strength.score ? strength.color : 'bg-slate-200 dark:bg-slate-700'}`}
                            />
                        ))}
                    </div>
                    <p className="text-xs flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                        <Shield className="w-3.5 h-3.5" />
                        Strength: <span className="font-medium text-slate-700 dark:text-slate-300">{strength.label}</span>
                    </p>
                    <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800/40 p-3">
                        <div className="mb-2 flex items-center justify-between">
                            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Password checklist</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">{passwordChecks.filter((check) => check.met).length}/{passwordChecks.length} complete</p>
                        </div>
                        <div className="grid gap-2 sm:grid-cols-2">
                            {passwordChecks.map((check) => (
                                <div key={check.id} className={`flex items-center gap-2 text-sm ${check.met ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500 dark:text-slate-400'}`}>
                                    {check.met ? (
                                        <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                                    ) : (
                                        <span className="h-4 w-4 rounded-full border border-slate-300 dark:border-slate-600" />
                                    )}
                                    <span>{check.label}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Confirm Password */}
            <PasswordField
                label="Confirm Password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                showPassword={showConfirm}
                toggleShow={() => setShowConfirm(!showConfirm)}
                isConfirm={true}
                matchStatus={matchStatus}
                focused={focused.confirm}
                onFocus={() => setFocused(prev => ({ ...prev, confirm: true }))}
                onBlur={() => setFocused(prev => ({ ...prev, confirm: false }))}
                placeholder="Repeat your password"
            />

            {/* Terms & Conditions */}
            <div className="flex items-start gap-3 pt-2">
                <input
                    type="checkbox"
                    id="terms"
                    checked={acceptedTerms}
                    onChange={(e) => setAcceptedTerms(e.target.checked)}
                    className="mt-1 w-4 h-4 accent-emerald-600"
                />
                <div className="text-sm text-slate-600 dark:text-slate-400">
                    <label htmlFor="terms" className="cursor-pointer">I agree to the </label>
                    <button type="button" onClick={() => setModalContent('terms')} className="text-emerald-600 hover:text-emerald-700 font-medium hover:underline focus:outline-none">Terms & Conditions</button>
                    {' '}and{' '}
                    <button type="button" onClick={() => setModalContent('privacy')} className="text-emerald-600 hover:text-emerald-700 font-medium hover:underline focus:outline-none">Privacy Policy</button>
                    {' '}of FinVault
                </div>
            </div>

            {/* Error Message */}
            {error && (
                <StatusMessage
                    variant="error"
                    message={error}
                    onDismiss={() => setError('')}
                />
            )}

            {/* Submit Button */}
            <button
                type="submit"
                disabled={loading || !formData.email || !formData.password || !passwordsMatch || !acceptedTerms}
                className="w-full py-3.5 rounded-xl text-white font-semibold bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 disabled:opacity-60 disabled:cursor-not-allowed shadow-sm transition-all duration-200 flex items-center justify-center gap-3"
            >
                {loading ? (
                    <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Building your vault...
                    </>
                ) : (
                    'Create My FinVault Account'
                )}
            </button>

            {/* Simple Terms/Privacy Modal */}
            {modalContent && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm" onClick={() => setModalContent(null)}>
                    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in duration-200" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                                {modalContent === 'terms' ? 'Terms & Conditions' : 'Privacy Policy'}
                            </h3>
                            <button type="button" onClick={() => setModalContent(null)} className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed space-y-3">
                            {modalContent === 'terms' ? (
                                <>
                                    <p>By using FinVault, you agree to play nice. We built this tool to help you track your portfolio, not to give professional financial advice.</p>
                                    <p>You are solely responsible for your own investment decisions. Don't use the platform for illegal activities, don't try to hack our servers, and we'll get along great.</p>
                                    <p>We reserve the right to suspend accounts that abuse the platform. Simple as that.</p>
                                </>
                            ) : (
                                <>
                                    <p>We respect your privacy. We only ask for your email to create your account and keep your portfolio secure.</p>
                                    <p>We <strong>never</strong> sell your personal data to third parties, brokerages, or advertisers. Your portfolio data is encrypted and visible only to you.</p>
                                    <p>We use a few essential cookies just to keep you logged in and ensure the app works correctly. That's it.</p>
                                </>
                            )}
                        </div>
                        <button type="button" onClick={() => setModalContent(null)} className="mt-6 w-full py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-900 dark:text-white rounded-xl font-semibold transition-colors">
                            Got it
                        </button>
                    </div>
                </div>
            )}
        </form>
    );
}