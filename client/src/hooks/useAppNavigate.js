import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

const PAGE_ROUTES = {
  home: '/',
  dashboard: '/',
  dividends: '/dividends',
  about: '/about',
  contact: '/contact',
  settings: '/settings',
  billing: '/billing',
  auth: '/auth',
};

export default function useAppNavigate() {
  const navigate = useNavigate();

  return useCallback((page) => {
    const path = PAGE_ROUTES[page] || '/';
    navigate(path);
  }, [navigate]);
}
