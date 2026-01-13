import { useEffect, useState, useRef } from 'react';
import Navbar from './components/Navbar.jsx';
import AuthPage from './pages/Auth.jsx';
import Dashboard from './pages/Dashboard.jsx';
import AboutUs from './components/AboutUs.jsx';
import ContactPage from './pages/ContactPage.jsx';
import Footer from './components/Footer.jsx';
import ResetPasswordForm from './components/ResetPasswordForm.jsx';

export default function App() {
  // Token initialization: prefer a remembered token (localStorage), otherwise sessionStorage
  const [token, setTokenState] = useState(() => {
    return localStorage.getItem('token') || sessionStorage.getItem('token') || '';
  });
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user') || sessionStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });
  const [currentPage, setCurrentPage] = useState('home');

  // Timer ref for auto-logout
  const logoutTimer = useRef(null);

  // Safe JWT parser (reads payload and returns JSON or null)
  const parseJwt = (tkn) => {
    try {
      const base64Url = tkn.split('.')[1];
      if (!base64Url) return null;
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (e) {
      return null;
    }
  };

  // Helper to set token and persist it based on "remember" flag and schedule auto-logout
  const setToken = (value, remember = false) => {
    setTokenState(value || '');

    // Clear any existing timer
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

      // Schedule auto-logout at token expiry, if exp present
      const payload = parseJwt(value);
      if (payload && payload.exp) {
        const expMs = payload.exp * 1000;
        const delay = expMs - Date.now();
        if (delay <= 0) {
          // Token already expired — clear immediately
          setToken('', false);
          setUser(null);
          setCurrentPage('home');
        } else {
          logoutTimer.current = setTimeout(() => {
            setToken('', false);
            setUser(null);
            setCurrentPage('home');
            // Optionally: notify user of expiration (toast/alert)
          }, delay);
        }
      }
    } else {
      // Clearing token
      localStorage.removeItem('token');
      sessionStorage.removeItem('token');
    }
  };

  // On startup, if there's a token, ensure it's valid and schedule expiry
  useEffect(() => {
    if (token) {
      const payload = parseJwt(token);
      if (payload && payload.exp) {
        const expMs = payload.exp * 1000;
        const delay = expMs - Date.now();
        if (delay <= 0) {
          // expired
          setToken('', false);
          setUser(null);
        } else {
          // schedule a timer
          logoutTimer.current = setTimeout(() => {
            setToken('', false);
            setUser(null);
            setCurrentPage('home');
          }, delay);
        }
      } else {
        // If token can't be parsed, clear it for safety
        if (token) {
          setToken('', false);
          setUser(null);
        }
      }
    }

    // Cleanup on unmount
    return () => {
      if (logoutTimer.current) {
        clearTimeout(logoutTimer.current);
        logoutTimer.current = null;
      }
    };
  }, []);

  // Persist user in the same storage as the token
  useEffect(() => {
    if (user) {
      if (localStorage.getItem('token')) {
        localStorage.setItem('user', JSON.stringify(user));
        sessionStorage.removeItem('user');
      } else {
        sessionStorage.setItem('user', JSON.stringify(user));
        localStorage.removeItem('user');
      }
    } else {
      localStorage.removeItem('user');
      sessionStorage.removeItem('user');
    }
  }, [user]);

  // Logout helper (optional, for convenience)
  const logout = () => {
    setToken('');
    setUser(null);
    setCurrentPage('home'); // redirect to login
  };

  const auth = {
    token,
    user,
    setToken,
    setUser,
    logout, // nice to have
  };

  const renderPage = () => {
    // If URL indicates a reset token, show reset password form immediately
    const path = window.location.pathname || '';
    if (path.startsWith('/reset-password/')) {
      const token = path.replace('/reset-password/', '');
      return <ResetPasswordForm token={token} onDone={() => setCurrentPage('home')} />;
    }

    // Protected route logic: only show Dashboard if logged in
    if (currentPage === 'home') {
      return token ? <Dashboard auth={auth} /> : <AuthPage auth={auth} />;
    }

    if (currentPage === 'about') {
      return <AboutUs setCurrentPage={setCurrentPage} />;
    }

    if (currentPage === 'contact') {
      return <ContactPage setCurrentPage={setCurrentPage} />; // optional: pass setCurrentPage if needed
    }

    // Fallback
    return token ? <Dashboard auth={auth} /> : <AuthPage auth={auth} />;
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 text-gray-900 dark:bg-gray-950 dark:text-gray-100">
      <Navbar 
        auth={auth} 
        setCurrentPage={setCurrentPage} 
        currentPage={currentPage} 
      />
      <main className="flex-grow">
        <div className="max-w-7xl mx-auto w-full px-4 py-8">
          {renderPage()}
        </div>
      </main>
      <Footer />
    </div>
  );
}