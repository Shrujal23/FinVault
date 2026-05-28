import React from 'react';

export default function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700 mt-16">
            <div className="max-w-7xl mx-auto px-6 py-8">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="flex items-center gap-2">
                        <span className="text-xl font-semibold text-slate-900 dark:text-white">FinVault</span>
                        <span className="text-xs text-slate-400">Portfolio Tracker</span>
                    </div>

                    <p className="text-sm text-slate-500 dark:text-slate-400 text-center md:text-right">
                        &copy; {currentYear} FinVault. All rights reserved.
                    </p>

                    <div className="flex gap-6 text-sm">
                        <a href="/about" className="hover:text-slate-900 dark:hover:text-white transition-colors">
                            About
                        </a>
                        <a href="/contact" className="hover:text-slate-900 dark:hover:text-white transition-colors">
                            Contact
                        </a>
                        <a href="/privacy" className="hover:text-slate-900 dark:hover:text-white transition-colors">
                            Privacy
                        </a>
                        <a href="/terms" className="hover:text-slate-900 dark:hover:text-white transition-colors">
                            Terms
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
}