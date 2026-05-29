import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
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
  Camera,
  Trash,
  Check,
  X,
  Mail,
  Lock,
  LayoutDashboard,
} from 'lucide-react';
import { useTheme } from '../../pages/ThemeContext.jsx';
import { apiRequest } from '../../api/client.js';

const settingsNav = [
  { id: 'main', icon: Settings, label: 'Overview' },
  { id: 'profile', icon: User, label: 'Profile' },
  { id: 'brokers', icon: Link, label: 'Brokers' },
  { id: 'notifications', icon: Bell, label: 'Alerts' },
  { id: 'security', icon: Shield, label: 'Security' },
];

const indiaBrokers = [
  { name: 'Zerodha', description: "India's #1 Broker", logo: 'https://zerodha.com/static/images/logo.svg', logoBg: 'bg-white', connected: true },
  { name: 'Upstox', description: 'Fast & Reliable', logo: 'https://upstox.com/assets/img/upstox-logo.svg', logoBg: 'bg-white', connected: false },
  { name: 'Angel One', description: 'Smart Investing', logo: 'https://static.angelone.in/images/angel-one-logo.svg', logoBg: 'bg-white', connected: false },
];

const usBrokers = [
  { name: 'Interactive Brokers', description: 'Global Access', logo: 'https://download.logo.wine/logo/Interactive_Brokers/Interactive_Brokers-Logo.wine.png', logoBg: 'bg-white', connected: false },
  { name: 'Alpaca', description: 'US Markets & Crypto', logo: 'https://thewealthmosaic.s3.amazonaws.com/media/Logo_Alpaca.png', connected: false },
  { name: 'Tradier', description: 'US Stocks & Options', logo: 'https://images.squarespace-cdn.com/content/v1/5f5d9506e0415a490b9b21af/1607533064474-RWXPWUA2S5KHIJVF0COJ/tradier-brokerage-vectorwithborders1500.jpg', connected: false },
];

const settingsItems = [
  { id: 'profile', icon: User, title: 'Profile', description: 'Photo, display name, and account email', action: 'profile', group: 'Account' },
  { id: 'link_broker', icon: Link, title: 'Link broker', description: 'Sync holdings from supported brokers', action: 'brokers', chevron: true, group: 'Connections' },
  { id: 'notifications', icon: Bell, title: 'Notifications', description: 'Price moves, dividends, and digests', action: 'notifications', group: 'Preferences' },
  { id: 'security', icon: Shield, title: 'Security', description: 'Password and sign-in options', action: 'security', group: 'Preferences' },
  { id: 'billing', icon: CreditCard, title: 'Billing & plan', description: 'Subscription and invoices', action: 'billing', chevron: true, group: 'Plan' },
];

function BrokerItem({ name, description, logo, logoBg = '', connected }) {
  return (
    <div className={`flex flex-col sm:flex-row sm:items-center justify-between p-5 rounded-2xl border-2 transition-all duration-200 ${
      connected 
        ? 'border-emerald-500/30 bg-emerald-50/30 dark:bg-emerald-900/10' 
        : 'border-dashed border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 hover:border-cyan-500/50'
    }`}>
      <div className="flex items-center gap-5 flex-1 min-w-0 mb-4 sm:mb-0">
        <div className={`w-14 h-14 rounded-xl flex items-center justify-center shrink-0 shadow-sm overflow-hidden ${logoBg || 'bg-slate-100 dark:bg-slate-800'}`}>
          <img
            src={logo}
            alt={`${name} logo`}
            className="w-10 h-10 object-contain"
            onError={(e) => { e.target.src = '/placeholder-broker.png'; }} // fallback
          />
        </div>
        <div className="min-w-0">
          <p className="font-semibold text-slate-900 dark:text-white text-lg">{name}</p>
          <p className="text-sm text-slate-500 dark:text-slate-400">{description}</p>
        </div>
      </div>
      {connected ? (
        <span className="flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-2.5 rounded-xl text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-100/50 dark:bg-emerald-900/20">
          <Check className="w-5 h-5" /> Connected
        </span>
      ) : (
        <button
          type="button"
          className="w-full sm:w-auto px-8 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-semibold hover:from-cyan-500 hover:to-blue-500 transition shadow-sm"
        >
          Connect
        </button>
      )}
    </div>
  );
}

function ToggleRow({ label, description, enabled, onChange }) {
  return (
    <div className="flex items-center justify-between py-5 border-b border-slate-200 dark:border-slate-700 last:border-none">
      <div>
        <p className="font-medium text-slate-900 dark:text-white">{label}</p>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{description}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={enabled}
        onClick={() => onChange(!enabled)}
        className={`relative w-12 h-7 rounded-full transition-all ${enabled ? 'bg-cyan-600' : 'bg-slate-300 dark:bg-slate-600'}`}
      >
        <span className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full shadow transition-all ${enabled ? 'translate-x-5' : ''}`} />
      </button>
    </div>
  );
}

export default function SettingsExperience({ variant = 'modal', auth, setCurrentPage, onClose }) {
  const [activeSection, setActiveSection] = useState('main');
  const { theme, toggleTheme } = useTheme();
  
  const [preview, setPreview] = useState(auth?.user?.avatarUrl || '');
  const [displayName, setDisplayName] = useState(auth?.user?.name || '');
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef(null);

  // Notification preferences
  const [notifPrice, setNotifPrice] = useState(() => localStorage.getItem('settings.notif.price') !== '0');
  const [notifDividend, setNotifDividend] = useState(() => localStorage.getItem('settings.notif.dividend') === '1');
  const [notifWeekly, setNotifWeekly] = useState(() => localStorage.getItem('settings.notif.weekly') !== '0');

  // Sync user data when auth changes
  useEffect(() => {
    if (auth?.user) {
      setPreview(auth.user.avatarUrl || '');
      setDisplayName(auth.user.name || '');
    }
  }, [auth?.user]);

  // Persist notification prefs
  useEffect(() => {
    localStorage.setItem('settings.notif.price', notifPrice ? '1' : '0');
  }, [notifPrice]);

  useEffect(() => {
    localStorage.setItem('settings.notif.dividend', notifDividend ? '1' : '0');
  }, [notifDividend]);

  useEffect(() => {
    localStorage.setItem('settings.notif.weekly', notifWeekly ? '1' : '0');
  }, [notifWeekly]);

  const openFilePicker = () => fileRef.current?.click();

  const onFileChange = useCallback((e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => setPreview(ev.target.result);
    reader.readAsDataURL(file);
  }, []);

  const saveProfile = useCallback(async () => {
    setUploading(true);
    try {
      const updatedUser = {
        ...auth.user,
        name: displayName.trim() || auth.user?.name,
        avatarUrl: preview || auth.user?.avatarUrl
      };
      
      auth.setUser(updatedUser);

      if (auth?.token) {
        await apiRequest('/api/user/profile', {
          method: 'PUT',
          body: { 
            name: displayName.trim(),
            avatarBase64: preview 
          },
          token: auth.token
        });
      }

      if (variant === 'modal') setActiveSection('main');
    } catch (err) {
      console.error('Failed to save profile', err);
      // You could add a toast here
    } finally {
      setUploading(false);
    }
  }, [displayName, preview, auth, variant]);

  const removePhoto = useCallback(() => {
    setPreview('');
    auth.setUser({ ...auth.user, avatarUrl: '' });
    
    if (auth?.token) {
      apiRequest('/api/user/profile', { 
        method: 'PUT', 
        body: { avatarBase64: '' }, 
        token: auth.token 
      }).catch(() => {});
    }
  }, [auth]);

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

  const groupedSettings = useMemo(() => {
    const grouped = settingsItems.reduce((acc, item) => {
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

  const inner = (
    <div className={`flex min-h-0 flex-1 flex-col ${variant === 'page' ? 'lg:flex-row' : ''}`}>
      {/* Sidebar (full page only, desktop) */}
      {variant === 'page' && (
        <aside className="hidden lg:flex w-56 shrink-0 flex-col border-r border-slate-200/80 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/50 p-4 gap-1">
          <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-500">Menu</p>
          {settingsNav.map(({ id, icon: Icon, label }) => (
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
        <div className="flex lg:hidden gap-2 overflow-x-auto pb-3 -mx-1 px-1 scrollbar-thin">
          {settingsNav.map(({ id, label }) => (
            <button
              key={id}
              type="button"
              onClick={() => setActiveSection(id)}
              className={`shrink-0 rounded-full px-4 py-2 text-xs font-semibold transition ${
                activeSection === id
                  ? 'bg-cyan-600 text-white'
                  : 'bg-slate-200/80 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      )}

      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
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
                      <p className="truncate text-lg font-bold text-slate-900 dark:text-white">
                        {auth.user?.name || auth.user?.email?.split('@')[0] || 'Investor'}
                      </p>
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
          <div className="p-4 sm:p-6 space-y-6 max-w-lg mx-auto">
            <div className="flex flex-col items-center gap-4">
              <div className="relative">
                <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full ring-4 ring-cyan-500/20 bg-slate-100 dark:bg-slate-800 flex items-center justify-center overflow-hidden">
                  {preview ? (
                    <img src={preview} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-3xl font-bold text-slate-600 dark:text-slate-300">
                      {(auth.user?.name || auth.user?.email || 'U')[0].toUpperCase()}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex flex-wrap justify-center gap-2">
                <input ref={fileRef} onChange={onFileChange} type="file" accept="image/*" className="hidden" />
                <button type="button" onClick={openFilePicker} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-medium">
                  <Camera className="w-4 h-4" />
                  Upload
                </button>
                <button type="button" onClick={removePhoto} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400 text-sm font-medium">
                  <Trash className="w-4 h-4" />
                  Remove
                </button>
              </div>
              <p className="text-xs text-slate-500 text-center">JPG or PNG recommended · large photos may be slow to sync</p>
            </div>

            <div className="space-y-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white/90 dark:bg-slate-900/60 p-4 sm:p-5">
              <label className="block">
                <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Display name</span>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-4 py-3 text-slate-900 dark:text-white focus:ring-2 focus:ring-cyan-500/40 focus:border-cyan-500 outline-none transition"
                  placeholder="How we greet you on the dashboard"
                />
              </label>
              <div>
                <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Email</span>
                <div className="mt-1.5 flex items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 px-4 py-3 text-sm text-slate-600 dark:text-slate-400">
                  <Mail className="w-4 h-4 shrink-0" />
                  <span className="truncate">{auth.user?.email || '—'}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <button type="button" onClick={saveProfile} disabled={uploading} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-medium disabled:opacity-60">
                <Check className="w-4 h-4" />
                {uploading ? 'Saving…' : 'Save changes'}
              </button>
              {variant === 'modal' && (
                <button type="button" onClick={() => setActiveSection('main')} className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 font-medium">
                  Cancel
                </button>
              )}
            </div>
          </div>
        )}

        {activeSection === 'brokers' && (
          <div className="p-4 sm:p-6 space-y-6">
            <div className="max-w-3xl space-y-8">
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
                  Automatically sync your holdings and transactions from supported brokers. FinVault connects securely via API and never stores your login credentials.
                </p>
                <div className="space-y-4">
                  <h4 className="text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Indian Markets</h4>
                  <div className="grid gap-4">
                    {indiaBrokers.map((b) => (
                      <BrokerItem key={b.name} {...b} />
                    ))}
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-4">Global Markets & Crypto</h4>
                <div className="grid gap-4">
                  {usBrokers.map((b) => (
                    <BrokerItem key={b.name} {...b} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeSection === 'notifications' && (
          <div className="p-4 sm:p-6 max-w-xl">
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
              Preferences are saved in your browser for now. Connect email delivery in a future update.
            </p>
            <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white/90 dark:bg-slate-900/70 px-4 sm:px-5">
              <ToggleRow label="Price movement alerts" description="Notify when watchlist symbols move sharply" enabled={notifPrice} onChange={setNotifPrice} />
              <ToggleRow label="Dividend calendar" description="Reminders around ex-dates you track" enabled={notifDividend} onChange={setNotifDividend} />
              <ToggleRow label="Weekly portfolio digest" description="Summary of P&amp;L and allocation" enabled={notifWeekly} onChange={setNotifWeekly} />
            </div>
          </div>
        )}

        {activeSection === 'security' && (
          <div className="p-4 sm:p-6 space-y-6 max-w-xl">
            <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white/90 dark:bg-slate-900/70 p-4 sm:p-5 space-y-4">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800">
                  <Lock className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-900 dark:text-white">Password</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Use the forgot-password flow on the sign-in screen to reset your password securely.</p>
                  <button
                    type="button"
                    onClick={() => {
                      onClose?.();
                      auth?.logout?.();
                      setCurrentPage?.('home');
                    }}
                    className="mt-3 text-sm font-semibold text-cyan-600 dark:text-cyan-400 hover:underline"
                  >
                    Sign out and open login
                  </button>
                </div>
              </div>
            </div>
            <div className="rounded-2xl border border-dashed border-slate-300 dark:border-slate-600 bg-slate-50/50 dark:bg-slate-800/30 p-4 sm:p-5 flex items-center justify-between gap-4">
              <div>
                <p className="font-semibold text-slate-900 dark:text-white">Two-factor authentication</p>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Extra protection for your account</p>
              </div>
              <span className="shrink-0 text-xs font-bold uppercase tracking-wide px-2.5 py-1 rounded-full bg-amber-500/15 text-amber-800 dark:text-amber-300">Soon</span>
            </div>
          </div>
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
