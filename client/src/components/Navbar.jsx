import { useState, useEffect, useRef, useCallback } from "react";
import {
  Menu,
  X,
  Settings,
  LogOut,
  ChevronDown,
  Home,
  Info,
  Mail,
  CreditCard,
  Moon,
  Sun,
} from "lucide-react";
import { useTheme } from "../pages/ThemeContext";
import DarkModeToggle from "./DarkModeToggle.jsx";

export default function Navbar({ auth, setCurrentPage, currentPage = "home" }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const dropdownRef = useRef();
  const { theme } = useTheme();

  const userName = auth.user?.name || auth.user?.email?.split("@")[0] || "User";
  const userInitials = userName[0]?.toUpperCase();

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

  const goSettings = useCallback(() => {
    setCurrentPage("settings");
    setShowUserDropdown(false);
    setMobileMenuOpen(false);
  }, [setCurrentPage]);

  const handleLogout = useCallback(() => {
    auth.setToken("");
    auth.setUser(null);
    setShowUserDropdown(false);
    setMobileMenuOpen(false);
  }, [auth]);

  return (
    <>
      <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl sticky top-0 z-40 border-b border-gray-200/70 dark:border-slate-800/70">
        <div className="max-w-7xl mx-auto px-3 sm:px-5 py-3 sm:py-4">
          <div className="flex items-center justify-between gap-2">
            <div
              role="button"
              tabIndex={0}
              onClick={() => setCurrentPage("home")}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setCurrentPage("home");
                }
              }}
              className="text-2xl sm:text-3xl font-black bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 bg-clip-text text-transparent cursor-pointer hover:from-cyan-400 hover:via-blue-500 hover:to-indigo-500 transition-all duration-300 select-none shrink-0"
            >
              FinVault
            </div>

            <nav className="hidden lg:flex items-center gap-4 xl:gap-8">
              <div className="flex items-center gap-0.5 sm:gap-1 bg-gray-100 dark:bg-slate-800 rounded-full p-1 shadow-inner">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentPage === item.id;
                  return (
                    <button
                      type="button"
                      key={item.id}
                      onClick={() => setCurrentPage(item.id)}
                      className={`flex items-center gap-2 xl:gap-2.5 px-3 xl:px-5 py-2 xl:py-2.5 rounded-full text-sm xl:text-base font-medium transition-all duration-200 ${
                        isActive
                          ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm"
                          : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                      }`}
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                      <span className="text-sm font-medium truncate max-w-[120px] xl:max-w-none">{item.label}</span>
                    </button>
                  );
                })}
              </div>

              {!auth.token && <DarkModeToggle />}

              {auth.token && (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={goSettings}
                    aria-label="Account settings"
                    aria-current={currentPage === "settings" ? "page" : undefined}
                    className={`p-2.5 rounded-xl border transition-all ${
                      currentPage === "settings"
                        ? "border-cyan-500/50 bg-cyan-500/10 text-cyan-700 dark:text-cyan-400"
                        : "border-cyan-200/50 dark:border-cyan-800/50 bg-gradient-to-r from-cyan-500/10 to-blue-600/10 hover:from-cyan-500/20 hover:to-blue-600/20 text-slate-700 dark:text-slate-200"
                    }`}
                  >
                    <Settings className="w-5 h-5" />
                  </button>

                  <div ref={dropdownRef} className="relative">
                    <button
                      type="button"
                      onClick={() => setShowUserDropdown(!showUserDropdown)}
                      className="flex items-center gap-2 sm:gap-3 pl-2 pr-3 py-2 sm:py-2.5 rounded-xl bg-gradient-to-r from-cyan-500/10 to-blue-600/10 hover:from-cyan-500/20 hover:to-blue-600/20 border border-cyan-200/50 dark:border-cyan-800/50 transition-all duration-300 max-w-[200px]"
                    >
                      <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold text-xs sm:text-sm shadow-lg shrink-0">
                        {userInitials}
                      </div>
                      <span className="font-medium text-gray-800 dark:text-gray-200 truncate hidden sm:block">{userName}</span>
                      <ChevronDown className={`w-4 h-4 text-gray-600 dark:text-gray-400 transition-transform duration-200 shrink-0 ${showUserDropdown ? "rotate-180" : ""}`} />
                    </button>

                    {showUserDropdown && (
                      <div className="absolute right-0 mt-3 w-64 sm:w-72 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-slate-800 overflow-hidden animate-in slide-in-from-top-2 duration-200 z-50">
                        <div className="p-4 sm:p-5 border-b border-gray-200 dark:border-slate-800">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold text-lg shadow-xl shrink-0">
                              {userInitials}
                            </div>
                            <div className="min-w-0">
                              <p className="font-semibold text-gray-900 dark:text-white truncate">{userName}</p>
                              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 truncate">{auth.user?.email}</p>
                            </div>
                          </div>
                        </div>
                        <div className="py-2">
                          <button
                            type="button"
                            onClick={goSettings}
                            className="w-full flex items-center gap-3 px-4 sm:px-5 py-3 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors text-left"
                          >
                            <Settings className="w-5 h-5 text-cyan-600 dark:text-cyan-400 shrink-0" />
                            <div className="min-w-0">
                              <span className="font-medium text-gray-900 dark:text-white block">Account settings</span>
                              <span className="text-xs text-gray-500 dark:text-gray-400">Profile, brokers, alerts, security</span>
                            </div>
                          </button>
                          <button
                            type="button"
                            onClick={handleLogout}
                            className="w-full flex items-center gap-3 px-4 sm:px-5 py-3 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors text-left text-red-600 dark:text-red-400"
                          >
                            <LogOut className="w-5 h-5 shrink-0" />
                            <span className="font-medium">Log out</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </nav>

            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2.5 sm:p-3 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors shrink-0"
              aria-expanded={mobileMenuOpen}
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="lg:hidden fixed inset-x-0 top-[52px] sm:top-16 max-h-[calc(100dvh-3.5rem)] overflow-y-auto bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl border-t border-gray-200 dark:border-slate-800 z-50 shadow-xl">
            <div className="px-4 py-6 space-y-3">
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
                    className={`w-full flex items-center gap-4 px-5 py-3.5 rounded-2xl font-medium transition-all ${
                      currentPage === item.id
                        ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg"
                        : "bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-slate-700"
                    }`}
                  >
                    <Icon className="w-6 h-6 shrink-0" />
                    {item.label}
                  </button>
                );
              })}

              {!auth.token && (
                <div className="flex items-center justify-between px-5 py-3.5 rounded-2xl bg-gray-100 dark:bg-slate-800">
                  <div className="flex items-center gap-3">
                    {theme === "dark" ? (
                      <Moon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    ) : (
                      <Sun className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    )}
                    <span className="font-medium text-gray-700 dark:text-gray-200">Dark mode</span>
                  </div>
                  <DarkModeToggle />
                </div>
              )}

              {auth.token && (
                <>
                  <button
                    type="button"
                    onClick={goSettings}
                    className={`w-full flex items-center gap-4 px-5 py-3.5 rounded-2xl font-medium transition-colors ${
                      currentPage === "settings"
                        ? "bg-cyan-500/15 text-cyan-800 dark:text-cyan-300 border border-cyan-500/30"
                        : "bg-gray-100 dark:bg-slate-800 text-gray-800 dark:text-gray-100 hover:bg-gray-200 dark:hover:bg-slate-700"
                    }`}
                  >
                    <Settings className="w-6 h-6 shrink-0" />
                    Account settings
                  </button>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center gap-3 py-3.5 rounded-2xl bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors font-medium"
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

      {mobileMenuOpen && (
        <div className="fixed inset-0 z-30 bg-black/30 lg:hidden" aria-hidden="true" onClick={() => setMobileMenuOpen(false)} />
      )}
    </>
  );
}