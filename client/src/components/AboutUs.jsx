import { ArrowLeft } from 'lucide-react';

export default function AboutUs({ setCurrentPage }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-black py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden">
          {/* Hero Section */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-800 dark:from-blue-700 dark:to-blue-900 px-10 py-16 text-center">
            <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4">
              About FinTech Portfolio
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 font-medium">
              Your Trusted Partner in Financial Growth
            </p>
          </div>

          {/* Content */}
          <div className="px-10 py-12 space-y-10">
            <section className="text-center max-w-3xl mx-auto">
              <p className="text-lg md:text-xl text-gray-700 dark:text-gray-300 leading-relaxed">
                Welcome to <span className="font-bold text-blue-600 dark:text-blue-400">FinTech Portfolio</span> — a modern, secure, and intuitive platform built to empower you with complete control and clarity over your investments.
              </p>
            </section>

            <div className="grid md:grid-cols-3 gap-8 my-12">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                  <svg className="w-8 h-8 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Bank-Level Security</h3>
                <p className="text-gray-600 dark:text-gray-400">Your data is protected with industry-leading encryption and security practices.</p>
              </div>

              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                  <svg className="w-8 h-8 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Real-Time Insights</h3>
                <p className="text-gray-600 dark:text-gray-400">Track performance, diversification, and growth with up-to-date data and analytics.</p>
              </div>

              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                  <svg className="w-8 h-8 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0V4a2 2 0 012-2h4a2 2 0 012 2v14m-8 0h8" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">User-First Design</h3>
                <p className="text-gray-600 dark:text-gray-400">Clean, intuitive interface that works seamlessly whether you're a beginner or expert.</p>
              </div>
            </div>

            <section className="max-w-4xl mx-auto space-y-6 text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
              <p>
                We believe that managing your wealth shouldn't be complicated. That's why FinTech Portfolio combines powerful financial tools with a simple, elegant experience — helping you stay informed, confident, and in control.
              </p>
              <p>
                Whether you're tracking stocks, crypto, mutual funds, or a diversified portfolio, our platform grows with you, offering the insights you need to make smarter decisions and reach your financial goals faster.
              </p>
              <p className="font-medium text-center text-xl text-gray-800 dark:text-gray-200 pt-6">
                Join thousands of users who trust FinTech Portfolio to manage their financial future.
              </p>
            </section>

            {/* Back Button */}
            <div className="text-center pt-8">
              <button
                onClick={() => setCurrentPage('home')}
                className="inline-flex items-center gap-3 px-8 py-4 text-lg font-semibold text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
              >
                <ArrowLeft className="w-6 h-6" />
                Back to Home
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}