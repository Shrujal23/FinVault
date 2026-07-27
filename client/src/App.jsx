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

  const [user, setUserState] = useState(() => {
    const saved = localStorage.getItem('user') || sessionStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });

  const [currentPage, setCurrentPage] = useState(() => {
    const path = window.location.pathname || '';
    if (path === '/' || path === '') return 'home';
    // map known paths to pages
    const p = path.replace(/^\//, '');
    // treat '/login' and '/register' as settings/auth entry
    if (p === 'login' || p === 'register' || p === 'auth') return 'settings';
    return p;
  });
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

  const setUser = (value, remember = false) => {
    setUserState(value || null);

    if (value) {
      const serialized = JSON.stringify(value);
      if (remember) {
        localStorage.setItem('user', serialized);
        sessionStorage.removeItem('user');
      } else {
        sessionStorage.setItem('user', serialized);
        localStorage.removeItem('user');
      }
    } else {
      localStorage.removeItem('user');
      sessionStorage.removeItem('user');
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
            setUser(null, false);
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
    setUser(null, false);
    setCurrentPage('home');
  };

  const auth = {
    token,
    user,
    setToken,
    setUser,
    logout,
  };

  // Navigation helper: updates state and browser URL
  const navigate = (page) => {
    setCurrentPage(page);
    try {
      const url = page === 'home' ? '/' : `/${page}`;
      window.history.pushState({}, '', url);
    } catch (e) {
      // ignore (e.g., during SSR or unusual env)
    }
  };

  // Handle browser back/forward
  useEffect(() => {
    const onPop = () => {
      const path = window.location.pathname || '';
      const p = path === '/' ? 'home' : path.replace(/^\//, '');
      if (p === 'login' || p === 'register' || p === 'auth') setCurrentPage('settings');
      else setCurrentPage(p || 'home');
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

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
        return <Dashboard auth={auth} setCurrentPage={navigate} />;

      case 'about':
        return <AboutUs setCurrentPage={navigate} />;

      case 'dividends':
        return <DividendMonitor auth={auth} />;

      case 'billing':
        return <Billing auth={auth} setCurrentPage={navigate} />;

      case 'contact':
        return <ContactPage setCurrentPage={navigate} />;

      case 'settings':
        return token ? (
          <SettingsPage auth={auth} setCurrentPage={navigate} />
        ) : (
          <AuthPage auth={auth} />
        );

      default:
        return <Dashboard auth={auth} setCurrentPage={navigate} />;
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 text-gray-900 dark:bg-gray-950 dark:text-gray-100">
      <Navbar 
        auth={auth} 
        setCurrentPage={navigate} 
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