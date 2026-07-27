import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import {
  Settings,
  User,
  Link,
  Bell,
  Shield,
  CreditCard,
  Moon,
  Sun,
  ArrowLeft,
  ChevronRight,
  X,
  Mail,
  LayoutDashboard,
} from "lucide-react";
import { useTheme } from "../../pages/ThemeContext.jsx";
import useProfile from "./hooks/useProfile.js";
import useNotification from "./hooks/useNotification.js";
import ProfileSettings from "./profile/ProfileSettings.jsx";
import BrokerConnection from "./brokers/BrokerConnection.jsx";
import NotificationSettings from "./notifications/NotificationSettings.jsx";
import SecuritySettings from "./security/securitysettings.jsx";
import { SETTINGS_NAV, SETTINGS_ITEMS } from "../../constants.js";

export default function SettingsExperience({ variant = 'modal', auth, setCurrentPage, onClose }) {
  const [activeSection, setActiveSection] = useState('main');
  const { theme, toggleTheme } = useTheme();
  
  const scrollRef = useRef(null);
  const isPointerOver = useRef(false);

  // Centralize state management via custom hooks
  const {
    preview,
    setPreview,
    displayName,
    setDisplayName,
    uploading,
    saveProfile,
    removePhoto,
  } = useProfile(auth);

  const {
    price,
    setPrice,
    dividend,
    setDividend,
    weekly,
    setWeekly,
  } = useNotification();

  const handleItemClick = useCallback((item) => {
    if (item.action === 'brokers') {
      setActiveSection('brokers');
    } else if (item.action === 'billing') {
      onClose?.();
      setCurrentPage?.('billing');
    } else if (item.action) {
      setActiveSection(item.action);
    }
  }, [onClose, setCurrentPage]);

  // ensure wheel/touchpad scrolling works reliably inside this container
  const handleWheel = useCallback((e) => {
    const el = e.currentTarget;
    if (!el) return;
    if (el.scrollHeight > el.clientHeight) {
      el.scrollTop += e.deltaY;
      e.stopPropagation();
    }
  }, []);

  // fallback: global wheel handler when pointer is over the settings area
  useEffect(() => {
    const onWindowWheel = (e) => {
      try {
        if (!isPointerOver.current) return;
        const el = scrollRef.current;
        if (!el) return;
        if (el.scrollHeight > el.clientHeight) {
          el.scrollTop += e.deltaY;
          e.preventDefault();
        }
      } catch (err) {
        // ignore
      }
    };

    window.addEventListener('wheel', onWindowWheel, { passive: false });
    return () => window.removeEventListener('wheel', onWindowWheel);
  }, []);

  const groupedSettings = useMemo(() => {
    const grouped = SETTINGS_ITEMS.reduce((acc, item) => {
    const g = item.group || 'Other';
    if (!acc[g]) acc[g] = [];
    acc[g].push(item);
    return acc;
    }, {});
    return grouped;
  }, []);

  const sectionTitle = useMemo(() => {
    const titles = {
      main: 'Settings',
      profile: 'Profile',
      brokers: 'Broker connections',
      notifications: 'Alerts & notifications',
      security: 'Security'
    };
    return titles[activeSection] || 'Settings';
  }, [activeSection]);

  const resolvedDisplayName = useMemo(() => {
    const raw = auth?.user?.name || auth?.user?.email || '';
    if (!raw) return 'Investor';
    return raw.includes('@') ? raw.split('@')[0] : raw;
  }, [auth?.user?.name, auth?.user?.email]);

  const inner = (
    <div className={`flex min-h-0 flex-1 flex-col ${variant === 'page' ? 'lg:flex-row' : ''}`}>
      {/* Sidebar (full page only, desktop) */}
      {variant === 'page' && (
        <aside className="hidden lg:flex w-56 shrink-0 flex-col border-r border-slate-200/80 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/50 p-4 gap-1">
          <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-500">Menu</p>
          {SETTINGS_NAV.map(({ id, icon: Icon, label }) => (
            <button
              key={id}
              type="button"
              onClick={() => setActiveSection(id)}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition ${
                activeSection === id
                  ? 'bg-white dark:bg-slate-800 text-cyan-700 dark:text-cyan-400 shadow-sm border border-slate-200/80 dark:border-slate-700'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-white/80 dark:hover:bg-slate-800/60'
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {label}
            </button>
          ))}
          <div className="mt-auto pt-4 border-t border-slate-200/80 dark:border-slate-800 space-y-1">
            <button
              type="button"
              onClick={() => handleItemClick({ action: 'billing' })}
              className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-slate-600 dark:text-slate-400 hover:bg-white/80 dark:hover:bg-slate-800/60"
            >
              <CreditCard className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
              Billing & plan
            </button>
            <button
              type="button"
              onClick={() => setCurrentPage?.('contact')}
              className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-slate-600 dark:text-slate-400 hover:bg-white/80 dark:hover:bg-slate-800/60"
            >
              <Mail className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
              Contact us
            </button>
            <button
              type="button"
              onClick={() => setCurrentPage?.('home')}
              className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-slate-600 dark:text-slate-400 hover:bg-white/80 dark:hover:bg-slate-800/60"
            >
              <LayoutDashboard className="w-4 h-4" />
              Dashboard
            </button>
          </div>
        </aside>
      )}

      {/* Mobile section tabs (page only) */}
      {variant === 'page' && (
        <div className="mb-3 flex flex-wrap items-center gap-2 rounded-2xl border border-slate-200/80 bg-white/80 p-2 shadow-sm dark:border-slate-800 dark:bg-slate-900/70 lg:hidden">
          {SETTINGS_NAV.map(({ id, label }) => (
            <button
              key={id}
              type="button"
              onClick={() => setActiveSection(id)}
              className={`flex items-center justify-center rounded-full px-3.5 py-2 text-xs font-semibold transition ${
                activeSection === id
                  ? 'bg-cyan-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      )}

      <div
        ref={scrollRef}
        className="min-h-0 flex-1 overflow-y-auto overscroll-contain"
        style={{ touchAction: 'pan-y', WebkitOverflowScrolling: 'touch' }}
        onWheel={handleWheel}
        onMouseEnter={() => { isPointerOver.current = true; }}
        onMouseLeave={() => { isPointerOver.current = false; }}
      >
        {activeSection === 'main' && (
          <div className="p-4 sm:p-6 space-y-6">
            {variant === 'page' && (
              <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-gradient-to-br from-white to-slate-50/80 dark:from-slate-900/90 dark:to-slate-950/80 p-4 sm:p-5 shadow-sm">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500 to-indigo-600 text-lg font-bold text-white shadow-lg">
                      {(auth.user?.name || auth.user?.email || '?')[0].toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Signed in</p>
                      <p className="truncate text-lg font-bold text-slate-900 dark:text-white">{resolvedDisplayName}</p>
                      <p className="truncate text-sm text-slate-500 dark:text-slate-400">{auth.user?.email || '—'}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => handleItemClick({ action: 'billing' })}
                      className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:from-cyan-500 hover:to-blue-500"
                    >
                      <CreditCard className="w-4 h-4" />
                      Billing
                    </button>
                    <button
                      type="button"
                      onClick={() => setCurrentPage?.('contact')}
                      className="inline-flex items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2.5 text-sm font-semibold text-slate-700 dark:text-slate-200"
                    >
                      <Mail className="w-4 h-4" />
                      Support
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className="rounded-2xl border border-cyan-500/20 bg-gradient-to-br from-cyan-500/10 via-transparent to-indigo-500/10 p-4 sm:p-5">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/20 text-cyan-700 dark:text-cyan-400">
                  
                </div>
                <div>
                  <p className="font-semibold text-slate-900 dark:text-white">FinVault preferences</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                    Manage your account, connections, and how we notify you. Changes apply on this device immediately.
                  </p>
                </div>
              </div>
            </div>

            {Object.entries(groupedSettings).map(([group, items]) => (
              <div key={group}>
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 px-1 mb-2">{group}</p>
                <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden bg-white/90 dark:bg-slate-900/80 divide-y divide-slate-200/80 dark:divide-slate-800">
                  {items.map((item) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => handleItemClick(item)}
                        className="w-full flex items-center gap-4 p-4 text-left hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition group"
                      >
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 group-hover:bg-cyan-500/10 group-hover:text-cyan-700 dark:group-hover:text-cyan-400 transition-colors">
                          <Icon className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-slate-900 dark:text-white">{item.title}</p>
                          <p className="text-sm text-slate-500 dark:text-slate-400">{item.description}</p>
                        </div>
                        {item.chevron && <ChevronRight className="w-5 h-5 text-slate-400 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}

            <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/40 p-4 sm:p-5">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="text-slate-600 dark:text-slate-400">
                    {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-white">Appearance</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Light or dark interface</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={toggleTheme}
                  aria-label="Toggle theme"
                  className="p-2 text-slate-500 hover:text-cyan-600 dark:text-slate-400 dark:hover:text-cyan-400 transition-all hover:scale-110 active:scale-95 focus:outline-none flex items-center justify-center"
                >
                  {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                </button>
              </div>
            </div>
          </div>
        )}

        {activeSection === 'profile' && (
          <ProfileSettings
            auth={auth}
            preview={preview}
            setPreview={setPreview}
            displayName={displayName}
            setDisplayName={setDisplayName}
            uploading={uploading}
            saveProfile={saveProfile}
            removePhoto={removePhoto}
            variant={variant}
          />
        )}

        {activeSection === 'brokers' && <BrokerConnection />}

        {activeSection === 'notifications' && (
          <NotificationSettings
            price={price}
            setPrice={setPrice}
            dividend={dividend}
            setDividend={setDividend}
            weekly={weekly}
            setWeekly={setWeekly}
          />
        )}

        {activeSection === 'security' && (
          <SecuritySettings
            auth={auth}
            onClose={onClose}
            setCurrentPage={setCurrentPage}
          />
        )}
      </div>
    </div>
  );

  if (variant === 'page') {
    const firstName = auth.user?.name?.split(/\s+/)[0] || auth.user?.email?.split('@')[0] || 'there';
    return (
      <div className="min-h-[70vh] rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white/95 dark:bg-slate-900/90 shadow-xl shadow-slate-200/30 dark:shadow-black/20 overflow-hidden flex flex-col">
        <div className="shrink-0 border-b border-slate-200/80 dark:border-slate-800 bg-gradient-to-r from-slate-50 via-cyan-50/30 to-indigo-50/40 dark:from-slate-900 dark:via-slate-900 dark:to-slate-900 px-4 sm:px-6 py-4 sm:py-5">
          <div className="flex items-start gap-3 sm:items-center">
            <button
              type="button"
              onClick={() => setCurrentPage?.('home')}
              className="p-2 rounded-xl hover:bg-white/80 dark:hover:bg-slate-800 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition lg:hidden shrink-0"
              aria-label="Back to dashboard"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold uppercase tracking-wider text-cyan-700 dark:text-cyan-400">Account center</p>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">{sectionTitle}</h1>
              {activeSection === 'main' && (
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                  Hi {firstName} — manage profile, connections, and alerts in one place.
                </p>
              )}
            </div>
          </div>
        </div>
        {inner}
      </div>
    );
  }

  /* modal */
  return (
    <div className="relative flex max-h-[min(85vh,760px)] w-full flex-col overflow-hidden rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl">
      <div className="shrink-0 flex items-center justify-between gap-3 border-b border-slate-200/80 dark:border-slate-800 bg-gradient-to-r from-slate-50 to-cyan-50/30 dark:from-slate-900 dark:to-slate-900 px-4 sm:px-6 py-4">
        <div className="flex items-center gap-2 min-w-0">
          {activeSection !== 'main' && (
            <button type="button" onClick={() => setActiveSection('main')} aria-label="Back" className="p-2 rounded-xl hover:bg-white/90 dark:hover:bg-slate-800">
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white truncate flex items-center gap-2">
            <Settings className="w-5 h-5 sm:w-6 sm:h-6 text-cyan-600 dark:text-cyan-400 shrink-0" />
            {sectionTitle}
          </h3>
        </div>
        <button type="button" onClick={onClose} aria-label="Close" className="p-2 rounded-full hover:bg-slate-200/80 dark:hover:bg-slate-800 shrink-0">
          <X className="w-5 h-5" />
        </button>
      </div>
      {inner}
      <div className="shrink-0 border-t border-slate-200/80 dark:border-slate-800 bg-slate-50/90 dark:bg-slate-800/40 px-4 py-3 text-center">
        <p className="text-xs text-slate-500 dark:text-slate-400">FinVault · Settings sync where your account supports it</p>
      </div>
    </div>
  );
}
