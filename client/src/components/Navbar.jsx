import { useState, useEffect, useRef, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Menu,
  X,
  Settings,
  LogOut,
  Home,
  Info,
  Mail,
  CreditCard,
  Moon,
  Sun,
} from "lucide-react";
import { useTheme } from "../pages/ThemeContext";
import DarkModeToggle from "./DarkModeToggle.jsx";
import { useAuth } from "../hooks/useAuth";
import useAppNavigate from "../hooks/useAppNavigate";
import { SmoothDropdownPanel } from "@/components/ui/SmoothSelect.jsx";
import ConfirmDialog from "@/components/ui/ConfirmDialog.jsx";
import { getUserInitials } from "@/lib/userInitials.js";

export default function Navbar() {
  const { token, user, logout } = useAuth();
  const navigate = useNavigate();
  const goTo = useAppNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false);
  const dropdownRef = useRef();
  const { theme } = useTheme();

  const userName = user?.name || user?.email?.split("@")[0] || "User";
  const userInitials = getUserInitials(user?.name || user?.email || userName);

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
    { path: "/", label: "Dashboard", icon: Home },
    { path: "/dividends", label: "Dividends", icon: CreditCard },
    { path: "/about", label: "About", icon: Info },
    { path: "/contact", label: "Contact Us", icon: Mail },
  ];

  const goSettings = useCallback(() => {
    goTo("settings");
    setShowUserDropdown(false);
    setMobileMenuOpen(false);
  }, [goTo]);

  const requestLogout = useCallback(() => {
    setLogoutConfirmOpen(true);
    setShowUserDropdown(false);
  }, []);

  const confirmLogout = useCallback(() => {
    setLogoutConfirmOpen(false);
    logout();
    setMobileMenuOpen(false);
    navigate("/auth");
  }, [logout, navigate]);

  const isActive = (path) => location.pathname === path;

  return (
    <>
      <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl sticky top-0 z-40 border-b border-gray-200/70 dark:border-slate-800/70">
        <div className="max-w-7xl mx-auto px-3 sm:px-5 py-3 sm:py-4">
          <div className="flex items-center justify-between gap-2">
            <div
              role="button"
              tabIndex={0}
              onClick={() => navigate("/")}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  navigate("/");
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
                  const active = isActive(item.path);
                  return (
                    <button
                      type="button"
                      key={item.path}
                      onClick={() => navigate(item.path)}
                      className={`flex items-center gap-2 xl:gap-2.5 px-3 xl:px-5 py-2 xl:py-2.5 rounded-full text-sm xl:text-base font-medium transition-all duration-200 ${
                        active
                          ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm"
                          : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-gray-200/60 dark:hover:bg-slate-700/60"
                      }`}
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                      <span className="text-sm font-medium truncate max-w-[120px] xl:max-w-none">{item.label}</span>
                    </button>
                  );
                })}
              </div>

              {!token && <DarkModeToggle />}

              {token && (
                <div className="flex items-center gap-2">
                  <DarkModeToggle />
                  <div ref={dropdownRef} className="relative">
                    <button
                      type="button"
                      aria-label={`Account menu for ${userName}`}
                      aria-expanded={showUserDropdown}
                      aria-haspopup="menu"
                      onClick={() => setShowUserDropdown(!showUserDropdown)}
                      className={`flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 text-sm font-semibold text-white shadow-md ring-2 ring-transparent transition hover:brightness-110 focus:outline-none focus:ring-cyan-500/40 ${showUserDropdown ? 'ring-cyan-500/50' : ''}`}
                    >
                      {userInitials}
                    </button>

                    <SmoothDropdownPanel open={showUserDropdown} className="w-56">
                      <div className="border-b border-slate-200/80 px-4 py-3 dark:border-slate-700/80">
                        <p className="truncate text-sm font-medium text-slate-900 dark:text-white">{userName}</p>
                        <p className="truncate text-xs text-slate-500 dark:text-slate-400">{user?.email}</p>
                      </div>
                      <div className="p-1">
                        <button
                          type="button"
                          onClick={goSettings}
                          className="flex w-full items-center gap-2.5 rounded-md px-3 py-2.5 text-left text-sm text-slate-700 transition-colors hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800/80"
                        >
                          <Settings className="h-4 w-4 shrink-0 text-slate-500 dark:text-slate-400" />
                          Settings
                        </button>
                        <button
                          type="button"
                          onClick={requestLogout}
                          className="flex w-full items-center gap-2.5 rounded-md px-3 py-2.5 text-left text-sm text-red-600 transition-colors hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/40"
                        >
                          <LogOut className="h-4 w-4 shrink-0" />
                          Log out
                        </button>
                      </div>
                    </SmoothDropdownPanel>
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
                const active = isActive(item.path);
                return (
                  <button
                    type="button"
                    key={item.path}
                    onClick={() => {
                      navigate(item.path);
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center gap-4 px-5 py-3.5 rounded-2xl font-medium transition-all ${
                      active
                        ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg"
                        : "bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-slate-700"
                    }`}
                  >
                    <Icon className="w-6 h-6 shrink-0" />
                    {item.label}
                  </button>
                );
              })}

              {!token && (
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

              {token && (
                <>
                  <button
                    type="button"
                    onClick={goSettings}
                    className={`w-full flex items-center gap-4 px-5 py-3.5 rounded-2xl font-medium transition-colors ${
                      isActive("/settings")
                        ? "bg-cyan-500/15 text-cyan-800 dark:text-cyan-300 border border-cyan-500/30"
                        : "bg-gray-100 dark:bg-slate-800 text-gray-800 dark:text-gray-100 hover:bg-gray-200 dark:hover:bg-slate-700"
                    }`}
                  >
                    <Settings className="w-6 h-6 shrink-0" />
                    Account settings
                  </button>
                  <button
                    type="button"
                    onClick={requestLogout}
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

      <ConfirmDialog
        open={logoutConfirmOpen}
        title="Log out?"
        description="You'll need to sign in again to view your portfolio. Any unsaved work in open forms may be lost."
        confirmLabel="Log out"
        cancelLabel="Stay signed in"
        danger
        onConfirm={confirmLogout}
        onCancel={() => setLogoutConfirmOpen(false)}
      />
    </>
  );
}
