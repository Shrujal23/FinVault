import { useEffect, useState, useRef } from 'react';
import Navbar from './components/Navbar.jsx';
import AuthPage from './pages/Auth.jsx';
import Dashboard from './pages/Dashboard.jsx';
import AboutUs from './components/AboutUs.jsx';
import DividendMonitor from './pages/DividendMonitor.jsx';
import Billing from './pages/Billing.jsx';
import ContactPage from './pages/ContactPage.jsx';
import SettingsPage from './pages/SettingsPage.jsx';
import Footer from './components/Footer.jsx';
import ResetPasswordForm from './components/ResetPasswordForm.jsx';

export default function App() {
  const [token, setTokenState] = useState(() => {
    return localStorage.getItem('token') || sessionStorage.getItem('token') || '';
  });

  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user') || sessionStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });

  const [currentPage, setCurrentPage] = useState('home');
  const logoutTimer = useRef(null);

  const parseJwt = (tkn) => {
    try {
      const base64Url = tkn.split('.')[1];
      if (!base64Url) return null;
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join('')
      );
      return JSON.parse(jsonPayload);
    } catch (e) {
      return null;
    }
  };

  const setToken = (value, remember = false) => {
    setTokenState(value || '');

    if (logoutTimer.current) {
      clearTimeout(logoutTimer.current);
      logoutTimer.current = null;
    }

    if (value) {
      if (remember) {
        localStorage.setItem('token', value);
        sessionStorage.removeItem('token');
      } else {
        sessionStorage.setItem('token', value);
        localStorage.removeItem('token');
      }

      const payload = parseJwt(value);
      if (payload?.exp) {
        const delay = (payload.exp * 1000) - Date.now();
        if (delay > 0) {
          logoutTimer.current = setTimeout(() => {
            setToken('', false);
            setUser(null);
            setCurrentPage('home');
          }, delay);
        }
      }
    } else {
      localStorage.removeItem('token');
      sessionStorage.removeItem('token');
      localStorage.removeItem('user');
      sessionStorage.removeItem('user');
    }
  };

  const logout = () => {
    setToken('', false);
    setUser(null);
    setCurrentPage('home');
  };

  const auth = {
    token,
    user,
    setToken,
    setUser,
    logout,
  };

  // Main Page Renderer
  const renderPage = () => {
    const path = window.location.pathname || '';

    // Reset Password Route
    if (path.startsWith('/reset-password/')) {
      const resetToken = path.replace('/reset-password/', '');
      return <ResetPasswordForm token={resetToken} onDone={() => setCurrentPage('home')} />;
    }

    switch (currentPage) {
      case 'home':
      case 'dashboard':
        return <Dashboard auth={auth} setCurrentPage={setCurrentPage} />;

      case 'about':
        return <AboutUs setCurrentPage={setCurrentPage} />;

      case 'dividends':
        return <DividendMonitor auth={auth} />;

      case 'billing':
        return <Billing auth={auth} setCurrentPage={setCurrentPage} />;

      case 'contact':
        return <ContactPage setCurrentPage={setCurrentPage} />;

      case 'settings':
        return token ? (
          <SettingsPage auth={auth} setCurrentPage={setCurrentPage} />
        ) : (
          <AuthPage auth={auth} />
        );

      default:
        return <Dashboard auth={auth} setCurrentPage={setCurrentPage} />;
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 text-gray-900 dark:bg-gray-950 dark:text-gray-100">
      <Navbar 
        auth={auth} 
        setCurrentPage={setCurrentPage} 
        currentPage={currentPage} 
      />
      <main className="flex-grow w-full">
        <div className="max-w-7xl mx-auto w-full px-3 sm:px-4 md:px-6 lg:px-8 py-6">
          {renderPage()}
        </div>
      </main>
      <Footer setCurrentPage={setCurrentPage} />
    </div>
  );
}