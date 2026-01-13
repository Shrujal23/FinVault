import { useState } from 'react';
import LoginForm from '../components/LoginForm.jsx';
import RegisterForm from '../components/RegisterForm.jsx';
import ForgotPasswordForm from '../components/ForgotPasswordForm.jsx';
import { BarChart3, LogIn, UserPlus, TrendingUp, Briefcase, PieChart } from 'lucide-react';

export default function AuthPage({ auth }) {
    const [mode, setMode] = useState('login');

    return (
        <div className="
            min-h-screen 
            bg-gradient-to-br from-gray-50 to-gray-100 
            dark:from-black dark:to-slate-950
            flex items-center justify-center 
            p-4 px-6 
        ">
            <div className="w-full max-w-md">

                {/* Branding */}
                <div className="text-center mb-8">
                    <div className="flex items-center justify-center gap-3 mb-2">
                        <BarChart3 className="w-8 h-8 text-slate-700 dark:text-slate-300" />
                        <h1 className="
                            text-4xl font-bold 
                            text-slate-900 dark:text-white
                        ">
                            FinVault
                        </h1>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400">
                        {mode === 'login' && 'Welcome back! Sign in to continue.'}
                        {mode === 'register' && 'Create an account to start managing your portfolio.'}
                        {mode === 'forgot' && 'Reset your account password.'}
                    </p>
                </div>

                {/* Card */}
                <div className="
                    bg-white dark:bg-slate-900
                    rounded-2xl shadow-xl 
                    p-8 
                    border border-gray-200 dark:border-slate-800
                ">

                    {/* Switch Tabs */}
                    <div className="
                        flex gap-3 mb-8
                        bg-gray-100 dark:bg-slate-800 
                        rounded-lg p-1
                    ">
                        <button
                            onClick={() => setMode('login')}
                            className={`
                                flex-1 py-2.5 px-4 rounded-md font-semibold transition flex items-center justify-center gap-2
                                ${mode === 'login'
                                    ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-md'
                                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                                }
                            `}
                        >
                            <LogIn className="w-4 h-4" />
                            Login
                        </button>

                        <button
                            onClick={() => setMode('register')}
                            className={`
                                flex-1 py-2.5 px-4 rounded-md font-semibold transition flex items-center justify-center gap-2
                                ${mode === 'register'
                                    ? 'bg-white dark:bg-slate-700 text-green-600 dark:text-green-400 shadow-md'
                                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                                }
                            `}
                        >
                            <UserPlus className="w-4 h-4" />
                            Register
                        </button>
                    </div>

                    {/* Form Rendering based on mode */}
                    {mode === 'login' && <LoginForm auth={auth} onSwitchToForgot={() => setMode('forgot')} />}
                    {mode === 'register' && <RegisterForm auth={auth} />}
                    {mode === 'forgot' && <ForgotPasswordForm onSwitchToLogin={() => setMode('login')} />}

                    {/* Login/Register Link */}
                    <div className="mt-6 pt-6 border-t border-gray-200 dark:border-slate-800">
                        {mode === 'login' ? (
                            <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
                                Don't have an account?{" "}
                                <button
                                    onClick={() => setMode('register')}
                                    className="text-blue-600 dark:text-blue-400 font-semibold hover:underline"
                                >
                                    Register here
                                </button>
                            </p>
                        ) : (
                            <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
                                Already have an account?{" "}
                                <button
                                    onClick={() => setMode('login')}
                                    className="text-green-600 dark:text-green-400 font-semibold hover:underline"
                                >
                                    Login here
                                </button>
                            </p>
                        )}
                    </div>
                </div>

                {/* Feature Icons */}
                <div className="mt-8 grid grid-cols-3 gap-4">
                    <div className="text-center">
                        <div className="flex justify-center mb-2">
                            <TrendingUp className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                        </div>
                        <p className="text-xs text-gray-600 dark:text-gray-400">Track Stocks</p>
                    </div>

                    <div className="text-center">
                        <div className="flex justify-center mb-2">
                            <Briefcase className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                        </div>
                        <p className="text-xs text-gray-600 dark:text-gray-400">Manage Portfolio</p>
                    </div>

                    <div className="text-center">
                        <div className="flex justify-center mb-2">
                            <PieChart className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                        </div>
                        <p className="text-xs text-gray-600 dark:text-gray-400">Analyze Returns</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
