import React, { Suspense, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useParams } from 'react-router-dom';
import { LogIn, ShieldCheck } from 'lucide-react';
import { useAuth } from './hooks/useAuth';

// Layout & Fallback
import Navbar from './components/Navbar.jsx';
import Footer from './components/Footer.jsx';
import SuspenseFallback from './components/SuspenseFallback.jsx';

// Page Components
import AuthPage from './pages/Auth.jsx';
import ResetPasswordForm from './components/ResetPasswordForm.jsx';

// Lazy-load pages that require authentication or are not on the main landing path
const Dashboard = React.lazy(() => import('./pages/Dashboard.jsx'));
const AboutUs = React.lazy(() => import('./components/AboutUs.jsx'));
const DividendMonitor = React.lazy(() => import('./pages/DividendMonitor.jsx'));
const Billing = React.lazy(() => import('./pages/Billing.jsx'));
const ContactPage = React.lazy(() => import('./pages/ContactPage.jsx'));
const SettingsPage = React.lazy(() => import('./pages/SettingsPage.jsx'));

function AuthRequiredNotice() {
  const navigate = useNavigate();

  useEffect(() => {
    const redirectTimer = window.setTimeout(() => navigate('/auth', { replace: true }), 1600);
    return () => window.clearTimeout(redirectTimer);
  }, [navigate]);

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <div role="status" className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-7 text-center shadow-lg dark:border-slate-800 dark:bg-slate-900">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-100 text-cyan-700 dark:bg-cyan-950/60 dark:text-cyan-300">
          <ShieldCheck className="h-6 w-6" />
        </div>
        <h1 className="mt-4 text-xl font-semibold text-slate-900 dark:text-white">Sign in to continue</h1>
        <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
          Your portfolio dashboard is private. We’ll take you to the login page now.
        </p>
        <button
          type="button"
          onClick={() => navigate('/auth', { replace: true })}
          className="mt-5 inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 px-4 py-2.5 text-sm font-medium text-white transition hover:from-cyan-500 hover:to-blue-500"
        >
          <LogIn className="h-4 w-4" />
          Go to login
        </button>
      </div>
    </div>
  );
}

// A wrapper for authenticated routes to keep them secure
function PrivateRoute({ children }) {
  const { token } = useAuth();
  return token ? children : <AuthRequiredNotice />;
}

// A small wrapper to adapt the ResetPasswordForm component to the router
function ResetPasswordRoute() {
  const { token } = useParams();
  // In a router-based app, we can just navigate on success.
  // For now, we'll provide a no-op to satisfy the component's prop requirement.
  return <ResetPasswordForm token={token} onDone={() => {}} />;
}

export default function App() {
  const { token } = useAuth();

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 text-gray-900 dark:bg-gray-950 dark:text-gray-100">
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Navbar />
        <main className="flex-grow w-full">
          <div className="max-w-7xl mx-auto w-full px-3 sm:px-4 md:px-6 lg:px-8 py-6">
            <Suspense fallback={<SuspenseFallback />}>
              <Routes>
                <Route path="/auth" element={token ? <Navigate to="/" replace /> : <AuthPage />} />
                <Route path="/about" element={<AboutUs />} />
                <Route path="/contact" element={<ContactPage />} />
                <Route path="/reset-password/:token" element={<ResetPasswordRoute />} />

                <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
                <Route path="/dividends" element={<PrivateRoute><DividendMonitor /></PrivateRoute>} />
                <Route path="/billing" element={<PrivateRoute><Billing /></PrivateRoute>} />
                <Route path="/settings" element={<PrivateRoute><SettingsPage /></PrivateRoute>} />

                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Suspense>
          </div>
        </main>
        <Footer />
      </BrowserRouter>
    </div>
  );
}
