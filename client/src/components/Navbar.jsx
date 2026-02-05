import { useState, useEffect, useRef, useCallback } from "react";
import {
  Menu,
  X,
  Settings,
  LogOut,
  User,
  ChevronDown,
  Home,
  Info,
  Mail,
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
} from "lucide-react";
import { useTheme } from "../pages/ThemeContext";
import { apiRequest } from "../api/client.js";
import DarkModeToggle from "./DarkModeToggle.jsx";

const settingsItems = [
  { id: 'profile', icon: User, title: 'Profile', description: 'Edit name, photo, and personal info', action: 'profile' },
  { id: 'link_broker', icon: Link, title: 'Link Broker Account', description: 'Sync live holdings & enable automated tracking', action: 'brokers', chevron: true },
  { id: 'notifications', icon: Bell, title: 'Notifications', description: 'Manage alerts for price changes' },
  { id: 'security', icon: Shield, title: 'Security', description: 'Two-factor auth & password' },
  { id: 'billing', icon: CreditCard, title: 'Billing', description: 'Manage subscription', action: 'billing' },
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

const BrokerItem = ({ name, description, logo, logoBg = '' }) => (
  <div className="flex items-center justify-between p-5 rounded-2xl border border-gray-200 dark:border-slate-700 hover:border-blue-500 dark:hover:border-cyan-500 transition">
    <div className="flex items-center gap-5">
      <img src={logo} alt={name} className={`w-12 h-12 rounded-lg object-contain ${logoBg}`} />
      <div>
        <p className="font-semibold text-gray-900 dark:text-white">{name}</p>
        <p className="text-sm text-gray-500 dark:text-gray-400">{description}</p>
      </div>
    </div>
    <button type="button" aria-label={`Connect ${name}`} className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition">
      Connect
    </button>
  </div>
);

const BrokerGridItem = ({ name, logo }) => (
  <div className="flex flex-col items-center p-4 rounded-2xl border border-gray-200 dark:border-slate-700 hover:border-blue-500 dark:hover:border-cyan-500 transition">
    <img src={logo} alt={name} className="w-16 h-16 mb-3 object-contain" />
    <p className="font-medium text-gray-900 dark:text-white">{name}</p>
    <button type="button" aria-label={`Connect ${name}`} className="mt-3 text-sm text-blue-600 dark:text-cyan-400 hover:underline">Connect</button>
  </div>
);

const SettingsModalContent = ({ onClose, auth, setCurrentPage }) => {
  const [activeSection, setActiveSection] = useState('main');
  const { theme, toggleTheme } = useTheme();

  // Profile upload state
  const [preview, setPreview] = useState(auth?.user?.avatarUrl || '');
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef();

  const openFilePicker = () => fileRef.current?.click();

  const onFileChange = (e) => {
    const f = e.target.files && e.target.files[0];
    if (f) {
      setFile(f);
      const reader = new FileReader();
      reader.onload = (ev) => setPreview(ev.target.result);
      reader.readAsDataURL(f);
    }
  };

  const saveProfile = async () => {
    if (!preview) return;
    setUploading(true);

    try {
      // Optimistic local update
      auth.setUser({ ...auth.user, avatarUrl: preview });

      // Best-effort server update (base64 payload)
      if (auth?.token) {
        try {
          await apiRequest('/api/user/profile', { method: 'PUT', body: { avatarBase64: preview }, token: auth.token });
        } catch (e) {
          console.warn('Profile photo upload failed (server may not support /api/user/profile)', e.message);
        }
      }

      setFile(null);
      setUploading(false);
      setActiveSection('main');
    } catch (e) {
      setUploading(false);
      console.error(e);
    }
  };

  const removePhoto = () => {
    setPreview('');
    setFile(null);
    auth.setUser({ ...auth.user, avatarUrl: '' });
    if (auth?.token) {
      apiRequest('/api/user/profile', { method: 'PUT', body: { avatarBase64: '' }, token: auth.token }).catch(() => {});
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-md" onClick={onClose} />
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-gray-200 dark:border-slate-800 overflow-hidden animate-in fade-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-slate-800">
          <div className="flex items-center gap-3">
            {activeSection !== 'main' && (
              <button
                type="button"
                onClick={() => setActiveSection('main')}
                aria-label="Back"
                className="p-1 rounded hover:bg-gray-100 dark:hover:bg-slate-800"
              >
                <ArrowLeft className="w-6 h-6" />
              </button>
            )}
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
              {activeSection === 'main' && <Settings className="w-7 h-7 text-slate-600 dark:text-slate-400" />}
              {activeSection === 'profile' && <User className="w-7 h-7 text-slate-600 dark:text-slate-400" />}
              {activeSection === 'brokers' && <Link className="w-7 h-7 text-slate-600 dark:text-slate-400" />}
              {activeSection === 'main' ? 'Settings' : activeSection === 'profile' ? 'Profile' : 'Link Broker Account'}
            </h3>
          </div>
          <button type="button" onClick={onClose} aria-label="Close settings" className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors duration-200">
            <X className="w-6 h-6 text-slate-600 dark:text-slate-400" />
          </button>
        </div>

        {/* Main Settings */}
        {activeSection === 'main' && (
          <div className="p-6 space-y-2 max-h-96 overflow-y-auto">
            {settingsItems.map(item => {
              const Icon = item.icon;
              const handleClick = () => {
                // Brokers opens internal section
                if (item.action === 'brokers') {
                  setActiveSection('brokers');
                  return;
                }
                // Billing should navigate to a full page and close modal
                if (item.action === 'billing') {
                  onClose();
                  setCurrentPage('billing');
                  return;
                }

                if (item.action) setActiveSection(item.action);
              };

              return (
                <button
                  type="button"
                  key={item.id}
                  onClick={handleClick}
                  aria-label={`Open ${item.title}`}
                  className="w-full flex items-center gap-4 p-4 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors duration-200 group"
                >
                  <Icon className="w-6 h-6 text-slate-600 dark:text-slate-400" />
                  <div className="flex-1 text-left">
                    <p className="font-medium text-gray-900 dark:text-white">{item.title}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{item.description}</p>
                  </div>
                  {item.chevron && <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition" />}
                </button>
              );
            })}

            {/* Dark Mode Toggle */}
            <div className="w-full flex items-center justify-between p-4 rounded-2xl bg-gray-50 dark:bg-slate-800/50">
              <div className="flex items-center gap-4">
                <div className="w-6 h-6 text-gray-600 dark:text-gray-400">
                  <Sun className="w-6 h-6 hidden dark:block" />
                  <Moon className="w-6 h-6 block dark:hidden" />
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Appearance</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Dark / Light mode</p>
                </div>
              </div>
              <button
                type="button"
                onClick={toggleTheme}
                aria-label="Toggle theme"
                className="w-12 h-6 bg-gray-300 dark:bg-slate-700 rounded-full relative cursor-pointer transition-colors"
              >
                <div className={`absolute w-5 h-5 bg-white rounded-full top-0.5 transition-all duration-300 ${theme === 'light' ? 'left-0.5' : 'left-7'}`} />
              </button>
            </div>
          </div>
        )}

        {/* Profile Section */}
        {activeSection === 'profile' && (
          <div className="p-6 space-y-6 max-h-96 overflow-y-auto">
            <div className="flex flex-col items-center gap-4">
              <div className="w-28 h-28 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center overflow-hidden">
                {preview ? (
                  <img src={preview} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <div className="text-2xl font-bold text-slate-700 dark:text-slate-200">{(auth.user?.name || auth.user?.email || 'U')[0].toUpperCase()}</div>
                )}
              </div>

              <div className="flex gap-3">
                <input ref={fileRef} onChange={onFileChange} type="file" accept="image/*" className="hidden" />
                <button type="button" onClick={openFilePicker} className="px-4 py-2 rounded-xl border bg-white dark:bg-slate-800"> <Camera className="w-4 h-4 inline-block mr-2" /> Upload Photo</button>
                <button type="button" onClick={removePhoto} className="px-4 py-2 rounded-xl border bg-red-50 text-red-600 hover:bg-red-100"> <Trash className="w-4 h-4 inline-block mr-2" /> Remove</button>
              </div>

              <div className="text-sm text-slate-600 dark:text-slate-400 text-center">Change your profile photo — formats: JPG, PNG. Max 2MB recommended.</div>

              <div className="flex gap-3">
                <button type="button" onClick={saveProfile} disabled={uploading} className="px-4 py-2 rounded-xl bg-emerald-600 text-white">{uploading ? 'Saving...' : (<><Check className="w-4 h-4 inline-block mr-2"/> Save</>)}</button>
                <button type="button" onClick={() => setActiveSection('main')} className="px-4 py-2 rounded-xl border bg-white dark:bg-slate-800">Cancel</button>
              </div>
            </div>
          </div>
        )}

        {/* Broker Section */}
        {activeSection === 'brokers' && (
          <div className="p-6 space-y-6 max-h-96 overflow-y-auto">
            <p className="text-center text-gray-600 dark:text-gray-400">
              Connect your brokerage account via secure API to import positions automatically
            </p>
            <div className="grid gap-4">
              {usBrokers.map(broker => <BrokerItem key={broker.name} {...broker} />)}
              <p className="text-center text-sm font-medium text-gray-600 dark:text-gray-400 pt-4">Popular in India</p>
              <div className="grid grid-cols-3 gap-4">
                {indiaBrokers.map(broker => <BrokerGridItem key={broker.name} {...broker} />)}
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 dark:border-slate-800 bg-gray-50 dark:bg-slate-800/50">
          <p className="text-center text-sm text-gray-500 dark:text-gray-400">
            FinVault • All your money in one place
          </p>
        </div>
      </div>
    </div>
  );
};

export default function Navbar({ auth, setCurrentPage, currentPage = "home" }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const dropdownRef = useRef();
  const { theme, toggleTheme } = useTheme();

  const userName = auth.user?.name || auth.user?.email?.split("@")[0] || "User";
  const userInitials = userName[0]?.toUpperCase();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowUserDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const navItems = [
    { id: "home", label: "Dashboard", icon: Home },
    { id: "dividends", label: "Dividends", icon: CreditCard },
    { id: "about", label: "About", icon: Info },
    { id: "contact", label: "Contact Us", icon: Mail },
  ];

  const handleLogout = useCallback(() => {
    auth.setToken("");
    auth.setUser(null);
    setShowUserDropdown(false);
    setMobileMenuOpen(false);
  }, [auth]);

  return (
    <>
      {/* Header */}
      <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl sticky top-0 z-40 border-b border-gray-200/70 dark:border-slate-800/70">
        <div className="max-w-7xl mx-auto px-5 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div
              onClick={() => setCurrentPage("home")}
              className="text-3xl font-black bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 bg-clip-text text-transparent cursor-pointer hover:from-cyan-400 hover:via-blue-500 hover:to-indigo-500 transition-all duration-300 select-none"
            >
              FinVault
            </div>

            {/* Desktop Nav */}
            <nav className="hidden lg:flex items-center gap-8">
              <div className="flex items-center gap-1 bg-gray-100 dark:bg-slate-800 rounded-full p-1 shadow-inner">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentPage === item.id;
                  return (
                    <button type="button"
                      key={item.id}
                      onClick={() => setCurrentPage(item.id)}
                      className={`flex items-center gap-2.5 px-5 py-2.5 rounded-full font-medium transition-all duration-200 ${
                        isActive
                          ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm"
                          : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      {item.label}
                    </button>
                  );
                })}
              </div>

              {/* Dark Mode Toggle - Only show when user is NOT logged in */}
              {!auth.token && <DarkModeToggle />}

              {/* User Dropdown */}
              {auth.token && (
                <div ref={dropdownRef} className="relative">
                  <button type="button"
                    onClick={() => setShowUserDropdown(!showUserDropdown)}
                    className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500/10 to-blue-600/10 hover:from-cyan-500/20 hover:to-blue-600/20 border border-cyan-200/50 dark:border-cyan-800/50 transition-all duration-300 group"
                  >
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-lg">
                      {userInitials}
                    </div>
                    <span className="font-medium text-gray-800 dark:text-gray-200 hidden xl:block">{userName}</span>
                    <ChevronDown className={`w-4 h-4 text-gray-600 dark:text-gray-400 transition-transform duration-200 ${showUserDropdown ? "rotate-180" : ""}`} />
                  </button>

                  {/* Dropdown Menu */}
                  {showUserDropdown && (
                    <div className="absolute right-0 mt-3 w-64 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-slate-800 overflow-hidden animate-in slide-in-from-top-2 duration-200">
                      <div className="p-5 border-b border-gray-200 dark:border-slate-800">
                        <div className="flex items-center gap-4">
                          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold text-xl shadow-xl">
                            {userInitials}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900 dark:text-white">{userName}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{auth.user?.email}</p>
                          </div>
                        </div>
                      </div>
                      <div className="py-3">
                        <button type="button"
                          onClick={() => {
                            setShowSettings(true);
                            setShowUserDropdown(false);
                          }}
                          className="w-full flex items-center gap-3 px-5 py-3 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors text-left"
                        >
                          <Settings className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                          <span className="font-medium text-gray-700 dark:text-gray-200">Settings</span>
                        </button>
                        <button type="button"
                          onClick={handleLogout}
                          className="w-full flex items-center gap-3 px-5 py-3 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors text-left text-red-600 dark:text-red-400"
                        >
                          <LogOut className="w-5 h-5" />
                          <span className="font-medium">Log out</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </nav>

            {/* Mobile Menu Toggle */}
            <button type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-3 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden fixed inset-x-0 top-16 bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl border-t border-gray-200 dark:border-slate-800 transition-all duration-500 ease-out">
            <div className="px-6 py-8 space-y-6">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    type="button"
                    key={item.id}
                    onClick={() => {
                      setCurrentPage(item.id);
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-medium transition-all ${
                      currentPage === item.id
                        ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg"
                        : "bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-slate-700"
                    }`}
                  >
                    <Icon className="w-6 h-6" />
                    {item.label}
                  </button>
                );
              })}

              {/* Dark Mode Toggle for Mobile - Only show when user is NOT logged in */}
              {!auth.token && (
                <div className="w-full flex items-center justify-between px-6 py-4 rounded-2xl bg-gray-100 dark:bg-slate-800">
                  <div className="flex items-center gap-3">
                    {theme === 'dark' ? (
                      <Moon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    ) : (
                      <Sun className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    )}
                    <span className="font-medium text-gray-700 dark:text-gray-200">Dark Mode</span>
                  </div>
                  <DarkModeToggle />
                </div>
              )}

              {auth.token && (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      setShowSettings(true);
                      setMobileMenuOpen(false);
                    }}
                    aria-label="Open Settings"
                    className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors font-medium"
                  >
                    <Settings className="w-5 h-5" />
                    Settings
                  </button>
                  <button
                    type="button"
                    onClick={handleLogout}
                    aria-label="Log out"
                    className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors font-medium"
                  >
                    <LogOut className="w-5 h-5" />
                    Log out
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Mobile Backdrop */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 bg-black/30 z-30 lg:hidden" onClick={() => setMobileMenuOpen(false)} />
      )}

      {/* Settings Modal */}
      {showSettings && <SettingsModalContent onClose={() => setShowSettings(false)} auth={auth} setCurrentPage={setCurrentPage} />}
    </>
  );
}