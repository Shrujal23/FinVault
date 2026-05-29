import React from 'react';
import { Twitter, Github, Linkedin, ShieldAlert } from 'lucide-react';

export default function Footer({ setCurrentPage }) {
    const currentYear = new Date().getFullYear();

    const handleNav = (e, page) => {
        e.preventDefault();
        if (setCurrentPage) {
            setCurrentPage(page);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    return (
        <footer className="bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 pt-16 pb-8 mt-auto">
            <div className="max-w-7xl mx-auto px-6 lg:px-8">
                {/* Top Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 lg:gap-8 mb-16">
                    {/* Brand Column */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="flex items-center gap-2">
                            <span className="text-2xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">FinVault</span>
                        </div>
                        <p className="text-slate-500 dark:text-slate-400 max-w-sm leading-relaxed">
                            A straightforward portfolio tracker. Built by developers for people who just want to see their numbers without the noise.
                        </p>
                        <div className="flex items-center gap-4">
                            <a href="#" className="p-2 text-slate-500 hover:text-cyan-600 dark:text-slate-400 dark:hover:text-cyan-400 transition-all hover:scale-110 active:scale-95">
                                <Twitter className="w-5 h-5" />
                            </a>
                            <a href="#" className="p-2 text-slate-500 hover:text-cyan-600 dark:text-slate-400 dark:hover:text-cyan-400 transition-all hover:scale-110 active:scale-95">
                                <Github className="w-5 h-5" />
                            </a>
                            <a href="#" className="p-2 text-slate-500 hover:text-cyan-600 dark:text-slate-400 dark:hover:text-cyan-400 transition-all hover:scale-110 active:scale-95">
                                <Linkedin className="w-5 h-5" />
                            </a>
                        </div>
                    </div>

                    {/* Links Columns */}
                    <div>
                        <h3 className="font-semibold text-slate-900 dark:text-white mb-4">Product</h3>
                        <ul className="space-y-3 text-sm">
                            <li><a href="#" onClick={(e) => handleNav(e, 'home')} className="text-slate-500 dark:text-slate-400 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors">Dashboard</a></li>
                            <li><a href="#" onClick={(e) => handleNav(e, 'dividends')} className="text-slate-500 dark:text-slate-400 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors">Dividend Monitor</a></li>
                            <li><a href="#" onClick={(e) => handleNav(e, 'billing')} className="text-slate-500 dark:text-slate-400 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors">Pricing</a></li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="font-semibold text-slate-900 dark:text-white mb-4">Company</h3>
                        <ul className="space-y-3 text-sm">
                            <li><a href="#" onClick={(e) => handleNav(e, 'about')} className="text-slate-500 dark:text-slate-400 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors">About</a></li>
                            <li><a href="#" onClick={(e) => handleNav(e, 'contact')} className="text-slate-500 dark:text-slate-400 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors">Contact</a></li>
                            <li><a href="#" className="text-slate-500 dark:text-slate-400 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors">Blog</a></li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="font-semibold text-slate-900 dark:text-white mb-4">Legal</h3>
                        <ul className="space-y-3 text-sm">
                            <li><a href="#" className="text-slate-500 dark:text-slate-400 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors">Privacy</a></li>
                            <li><a href="#" className="text-slate-500 dark:text-slate-400 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors">Terms</a></li>
                            <li><a href="#" className="text-slate-500 dark:text-slate-400 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors">Security</a></li>
                        </ul>
                    </div>
                </div>

                {/* Disclaimer Section */}
                <div className="py-8 border-t border-slate-200 dark:border-slate-800">
                    <div className="flex items-start gap-3 text-slate-400 dark:text-slate-500 text-xs leading-relaxed">
                        <ShieldAlert className="w-5 h-5 shrink-0 mt-0.5" />
                        <p>
                            <strong>Important:</strong> FinVault is a tool to track your portfolio, not a registered financial advisor. We don't give financial or trading advice. Markets are volatile, so always do your own research or talk to a professional before making investment decisions.
                        </p>
                    </div>
                </div>

                {/* Copyright Section */}
                <div className="pt-8 border-t border-slate-200 dark:border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                        &copy; {currentYear} FinVault. All rights reserved.
                    </p>
                    <div className="flex items-center gap-6 text-sm text-slate-500 dark:text-slate-400">
                        <span>System status: <span className="text-emerald-500 font-medium">Operational</span></span>
                    </div>
                </div>
            </div>
        </footer>
    );
}