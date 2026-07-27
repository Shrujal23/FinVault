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
            bg-gradient-to-br from-slate-50 to-slate-100 
            dark:from-slate-950 dark:to-black
            flex items-center justify-center 
            p-4 sm:p-6 
        ">
            <div className="w-full max-w-md">

                {/* Branding */}
                <div className="text-center mb-8">
                    <div className="flex items-center justify-center gap-3 mb-2">
                        <BarChart3 className="w-9 h-9 text-slate-700 dark:text-slate-300" />
                        <h1 className="
                            text-4xl sm:text-5xl font-bold 
                            bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent
                        ">
                            FinVault
                        </h1>
                    </div>
                    <p className="text-slate-600 dark:text-slate-400 mt-2">
                        {mode === 'login' && 'Welcome back. Enter your details below.'}
                        {mode === 'register' && 'Create an account and take control of your wealth.'}
                        {mode === 'forgot' && 'Happens to the best of us. Let’s get you back in.'}
                    </p>
                </div>

                {/* Card */}
                <div className="
                    bg-white dark:bg-slate-900/90
                    rounded-2xl shadow-xl 
                    p-6 sm:p-8 
                    border border-slate-200 dark:border-slate-800
                ">

                    {/* Switch Tabs */}
                    <div className="
                        flex gap-3 mb-8
                        bg-slate-100 dark:bg-slate-800 
                        rounded-xl p-1
                    ">
                        <button
                            onClick={() => setMode('login')}
                            className={`
                                flex-1 py-2.5 px-4 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center gap-2
                                ${mode === 'login'
                                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md'
                                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-slate-700/50'
                                }
                            `}
                        >
                            <LogIn className="w-4 h-4" />
                            Login
                        </button>

                        <button
                            onClick={() => setMode('register')}
                            className={`
                                flex-1 py-2.5 px-4 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center gap-2
                                ${mode === 'register'
                                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md'
                                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-slate-700/50'
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
                    <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-800">
                        {mode === 'login' ? (
                            <p className="text-sm text-slate-600 dark:text-slate-400 text-center">
                                Don't have an account?{" "}
                                <button
                                    onClick={() => setMode('register')}
                                    className="text-cyan-600 dark:text-cyan-400 font-semibold hover:underline transition-colors"
                                >
                                    Register here
                                </button>
                            </p>
                        ) : (
                            <p className="text-sm text-slate-600 dark:text-slate-400 text-center">
                                Already have an account?{" "}
                                <button
                                    onClick={() => setMode('login')}
                                    className="text-cyan-600 dark:text-cyan-400 font-semibold hover:underline transition-colors"
                                >
                                    Login here
                                </button>
                            </p>
                        )}
                    </div>
                </div>
                {/* Feature Icons */}
                <div className="mt-10 grid grid-cols-3 gap-4">
                    <div className="text-center space-y-2">
                        <div className="flex justify-center">
                            <TrendingUp className="w-6 h-6 text-slate-500 dark:text-slate-400" />
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">Track Stocks</p>
                    </div>

                    <div className="text-center space-y-2">
                        <div className="flex justify-center">
                            <Briefcase className="w-6 h-6 text-slate-500 dark:text-slate-400" />
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">Manage Portfolio</p>
                    </div>

                    <div className="text-center space-y-2">
                        <div className="flex justify-center">
                            <PieChart className="w-6 h-6 text-slate-500 dark:text-slate-400" />
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">Analyze Returns</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
