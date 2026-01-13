import React from 'react';

export default function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 mt-12">
            <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
                <p className="text-center text-sm text-slate-500 dark:text-slate-400">
                    &copy; {currentYear} Final Project, Inc. All rights reserved.
                </p>
            </div>
        </footer>
    );
}