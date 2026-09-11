import React, { useState, useEffect, useRef, createContext, useContext, useCallback } from 'react';

const AuthContext = createContext(null);

const parseJwt = (token) => {
  try {
    const base64Url = token.split('.')[1];
    if (!base64Url) return null;
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join('')
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
};

export function AuthProvider({ children }) {
  const [token, setTokenState] = useState(
    () => localStorage.getItem('token') || sessionStorage.getItem('token') || ''
  );
  const [user, setUserState] = useState(() => {
    const saved = localStorage.getItem('user') || sessionStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });
  const logoutTimer = useRef(null);

  const setUser = useCallback((value, remember = false) => {
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
  }, []);

  const setToken = useCallback((value, remember = false) => {
    setTokenState(value || '');
    if (value) {
      if (remember) {
        localStorage.setItem('token', value);
        sessionStorage.removeItem('token');
      } else {
        sessionStorage.setItem('token', value);
        localStorage.removeItem('token');
      }
    } else {
      localStorage.removeItem('token');
      sessionStorage.removeItem('token');
    }
  }, []);

  const logout = useCallback(() => {
    setToken('', false);
    setUser(null, false);
  }, [setToken, setUser]);

  useEffect(() => {
    if (logoutTimer.current) clearTimeout(logoutTimer.current);
    if (token) {
      const payload = parseJwt(token);
      if (payload?.exp) {
        const delay = (payload.exp * 1000) - Date.now() - 5000;
        if (delay > 0) {
          logoutTimer.current = setTimeout(logout, delay);
        } else {
          logout();
        }
      }
    }
    return () => clearTimeout(logoutTimer.current);
  }, [token, logout]);

  const value = { token, user, setToken, setUser, logout };

  return React.createElement(AuthContext.Provider, { value }, children);
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === null) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
