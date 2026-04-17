import { useState, useEffect, useRef } from 'react';
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
  Sparkles,
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

const usBrokers = [
  { name: 'Alpaca', description: 'US stocks & crypto', logo: 'https://thewealthmosaic.s3.amazonaws.com/media/Logo_Alpaca.png' },
  { name: 'Interactive Brokers', description: 'Global markets', logo: 'https://download.logo.wine/logo/Interactive_Brokers/Interactive_Brokers-Logo.wine.png', logoBg: 'bg-white' },
  { name: 'Tradier', description: 'US stocks & options', logo: 'https://images.squarespace-cdn.com/content/v1/5f5d9506e0415a490b9b21af/1607533064474-RWXPWUA2S5KHIJVF0COJ/tradier-brokerage-vectorwithborders1500.jpg' },
];

const indiaBrokers = [
  { name: 'Zerodha', logo: 'https://lookaside.instagram.com/seo/google_widget/crawler/?media_id=3364650981555585409' },
  { name: 'Upstox', logo: 'https://mma.prnewswire.com/media/1474809/Upstox_Logo.jpg' },
  { name: 'Angel One', logo: 'https://www.exchange4media.com/news-photo/115218-angel.jpg' },
];

const settingsItems = [
  { id: 'profile', icon: User, title: 'Profile', description: 'Photo, display name, and account email', action: 'profile', group: 'Account' },
  { id: 'link_broker', icon: Link, title: 'Link broker', description: 'Sync holdings from supported brokers', action: 'brokers', chevron: true, group: 'Connections' },
  { id: 'notifications', icon: Bell, title: 'Notifications', description: 'Price moves, dividends, and digests', action: 'notifications', group: 'Preferences' },
  { id: 'security', icon: Shield, title: 'Security', description: 'Password and sign-in options', action: 'security', group: 'Preferences' },
  { id: 'billing', icon: CreditCard, title: 'Billing & plan', description: 'Subscription and invoices', action: 'billing', chevron: true, group: 'Plan' },
];

function BrokerItem({ name, description, logo, logoBg = '' }) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between p-4 sm:p-5 rounded-2xl border border-slate-200/80 dark:border-slate-700 bg-white/60 dark:bg-slate-800/40 hover:border-cyan-500/50 dark:hover:border-cyan-500/40 transition">
      <div className="flex items-center gap-4 min-w-0">
        <img src={logo} alt="" className={`w-11 h-11 sm:w-12 sm:h-12 rounded-xl object-contain shrink-0 ${logoBg}`} />
        <div className="min-w-0">
          <p className="font-semibold text-slate-900 dark:text-white truncate">{name}</p>
          <p className="text-sm text-slate-500 dark:text-slate-400">{description}</p>
        </div>
      </div>
      <button type="button" aria-label={`Connect ${name}`} className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 text-white text-sm font-medium hover:from-cyan-500 hover:to-blue-500 transition shrink-0">
        Connect
      </button>
    </div>
  );
}

function BrokerGridItem({ name, logo }) {
  return (
    <div className="flex flex-col items-center p-3 sm:p-4 rounded-2xl border border-slate-200/80 dark:border-slate-700 bg-white/60 dark:bg-slate-800/40 hover:border-cyan-500/50 transition">
      <img src={logo} alt="" className="w-14 h-14 mb-2 object-contain" />
      <p className="font-medium text-slate-900 dark:text-white text-sm text-center">{name}</p>
      <button type="button" aria-label={`Connect ${name}`} className="mt-2 text-xs font-medium text-cyan-600 dark:text-cyan-400 hover:underline">
        Connect
      </button>
    </div>
  );
}

function ToggleRow({ label, description, enabled, onChange }) {
  return (
    <div className="flex items-center justify-between gap-4 py-4 border-b border-slate-200/80 dark:border-slate-700 last:border-0">
      <div className="min-w-0">
        <p className="font-medium text-slate-900 dark:text-white text-sm sm:text-base">{label}</p>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">{description}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={enabled}
        onClick={() => onChange(!enabled)}
        className={`relative w-12 h-7 rounded-full transition-colors shrink-0 ${enabled ? 'bg-cyan-600' : 'bg-slate-300 dark:bg-slate-600'}`}
      >
        <span className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow transition-transform ${enabled ? 'left-6' : 'left-1'}`} />
      </button>
    </div>
  );
}

export default function SettingsExperience({ variant = 'modal', auth, setCurrentPage, onClose }) {
  const [activeSection, setActiveSection] = useState('main');
  const { theme, toggleTheme } = useTheme();
  const [preview, setPreview] = useState(auth?.user?.avatarUrl || '');
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef();
  const [displayName, setDisplayName] = useState(auth?.user?.name || '');

  const [notifPrice, setNotifPrice] = useState(() => localStorage.getItem('settings.notif.price') === '1');
  const [notifDividend, setNotifDividend] = useState(() => localStorage.getItem('settings.notif.dividend') === '1');
  const [notifWeekly, setNotifWeekly] = useState(() => localStorage.getItem('settings.notif.weekly') !== '0');

  useEffect(() => {
    setPreview(auth?.user?.avatarUrl || '');
    setDisplayName(auth?.user?.name || '');
  }, [auth?.user?.avatarUrl, auth?.user?.name]);

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

  const onFileChange = (e) => {
    const f = e.target.files?.[0];
    if (f) {
      const reader = new FileReader();
      reader.onload = (ev) => setPreview(ev.target.result);
      reader.readAsDataURL(f);
    }
  };

  const saveProfile = async () => {
    setUploading(true);
    try {
      const nextName = displayName.trim();
      auth.setUser({ ...auth.user, name: nextName || auth.user?.name, avatarUrl: preview || auth.user?.avatarUrl });
      if (auth?.token) {
        try {
          const body = { name: nextName };
          if (preview) body.avatarBase64 = preview;
          await apiRequest('/api/user/profile', { method: 'PUT', body, token: auth.token });
        } catch {
          /* optional API */
        }
      }
      if (variant === 'modal') setActiveSection('main');
    } finally {
      setUploading(false);
    }
  };

  const removePhoto = () => {
    setPreview('');
    auth.setUser({ ...auth.user, avatarUrl: '' });
    if (auth?.token) {
      apiRequest('/api/user/profile', { method: 'PUT', body: { avatarBase64: '' }, token: auth.token }).catch(() => {});
    }
  };

  const goBilling = () => {
    onClose?.();
    setCurrentPage?.('billing');
  };

  const handleItemClick = (item) => {
    if (item.action === 'brokers') {
      setActiveSection('brokers');
      return;
    }
    if (item.action === 'billing') {
      goBilling();
      return;
    }
    if (item.action) setActiveSection(item.action);
  };

  const grouped = settingsItems.reduce((acc, item) => {
    const g = item.group || 'Other';
    if (!acc[g]) acc[g] = [];
    acc[g].push(item);
    return acc;
  }, {});

  const sectionTitle =
    activeSection === 'main'
      ? 'Settings'
      : activeSection === 'profile'
        ? 'Profile'
        : activeSection === 'brokers'
          ? 'Broker connections'
          : activeSection === 'notifications'
            ? 'Alerts & notifications'
            : activeSection === 'security'
              ? 'Security'
              : 'Settings';

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
              onClick={goBilling}
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
                      onClick={goBilling}
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
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-semibold text-slate-900 dark:text-white">FinVault preferences</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                    Manage your account, connections, and how we notify you. Changes apply on this device immediately.
                  </p>
                </div>
              </div>
            </div>

            {Object.entries(grouped).map(([group, items]) => (
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
                    <Sun className="w-5 h-5 hidden dark:block" />
                    <Moon className="w-5 h-5 block dark:hidden" />
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
                  className="relative h-8 w-14 shrink-0 rounded-full bg-slate-300 dark:bg-slate-600 transition-colors"
                >
                  <span className={`absolute top-1 h-6 w-6 rounded-full bg-white shadow transition-all ${theme === 'light' ? 'left-1' : 'left-7'}`} />
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
            <p className="text-sm text-slate-600 dark:text-slate-400 text-center sm:text-left max-w-2xl">
              Connect read-only where available. FinVault never stores your broker login password—only secure tokens you approve.
            </p>
            <div className="grid gap-4">
              {usBrokers.map((b) => (
                <BrokerItem key={b.name} {...b} />
              ))}
              <p className="text-center text-xs font-semibold uppercase tracking-wider text-slate-500 pt-2">Popular in India</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
                {indiaBrokers.map((b) => (
                  <BrokerGridItem key={b.name} {...b} />
                ))}
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
