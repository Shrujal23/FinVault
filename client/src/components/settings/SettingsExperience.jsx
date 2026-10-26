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
import SmoothSelect from "@/components/ui/SmoothSelect.jsx";
import { SETTINGS_SECTION_OPTIONS } from "@/lib/selectOptions.js";
import ConfirmDialog from "@/components/ui/ConfirmDialog.jsx";
import { getUserInitials } from "@/lib/userInitials.js";
import { cn } from "@/lib/utils";

const SECTION_COPY = {
  main: {
    title: "Overview",
    description: "Account summary and shortcuts to each area.",
  },
  profile: {
    title: "Profile",
    description: "Update how you appear in FinVault.",
  },
  brokers: {
    title: "Brokers",
    description: "Connect a broker when that integration is available.",
  },
  notifications: {
    title: "Alerts",
    description: "Choose what we notify you about (saved on this device).",
  },
  security: {
    title: "Security",
    description: "Password and sign-in options.",
  },
};

function NavButton({ active, icon: Icon, label, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm font-medium transition-colors",
        active
          ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900"
          : "text-slate-600 hover:bg-slate-200/60 dark:text-slate-400 dark:hover:bg-slate-800"
      )}
    >
      <Icon className="h-4 w-4 shrink-0 opacity-80" />
      {label}
    </button>
  );
}

export default function SettingsExperience({ variant = "modal", auth, setCurrentPage, onClose }) {
  const [activeSection, setActiveSection] = useState("main");
  const [signOutConfirmOpen, setSignOutConfirmOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

  const scrollRef = useRef(null);
  const isPointerOver = useRef(false);

  const {
    preview,
    setPreview,
    displayName,
    setDisplayName,
    uploading,
    saveProfile,
    removePhoto,
  } = useProfile(auth);

  const { price, setPrice, dividend, setDividend, weekly, setWeekly } = useNotification();

  const goBilling = useCallback(() => {
    onClose?.();
    setCurrentPage?.("billing");
  }, [onClose, setCurrentPage]);

  const handleItemClick = useCallback(
    (item) => {
      if (item.action === "brokers") setActiveSection("brokers");
      else if (item.action === "billing") goBilling();
      else if (item.action) setActiveSection(item.action);
    },
    [goBilling]
  );

  const handleWheel = useCallback((e) => {
    const el = e.currentTarget;
    if (!el) return;
    if (el.scrollHeight > el.clientHeight) {
      el.scrollTop += e.deltaY;
      e.stopPropagation();
    }
  }, []);

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
      } catch {
        // ignore
      }
    };
    window.addEventListener("wheel", onWindowWheel, { passive: false });
    return () => window.removeEventListener("wheel", onWindowWheel);
  }, []);

  const groupedSettings = useMemo(() => {
    return SETTINGS_ITEMS.reduce((acc, item) => {
      const g = item.group || "Other";
      if (!acc[g]) acc[g] = [];
      acc[g].push(item);
      return acc;
    }, {});
  }, []);

  const sectionMeta = SECTION_COPY[activeSection] || SECTION_COPY.main;

  const resolvedDisplayName = useMemo(() => {
    const raw = auth?.user?.name || auth?.user?.email || "";
    if (!raw) return "Investor";
    return raw.includes("@") ? raw.split("@")[0] : raw;
  }, [auth?.user?.name, auth?.user?.email]);

  const initials = getUserInitials(auth?.user?.name || auth?.user?.email);

  const signOut = () => {
    setSignOutConfirmOpen(false);
    onClose?.();
    auth?.logout?.();
    setCurrentPage?.("auth");
  };

  const overview = (
    <div className="mx-auto w-full max-w-2xl space-y-6 px-4 py-6 sm:px-6 sm:py-8">
      {variant === "page" && (
        <div className="flex items-center gap-4 rounded-xl border border-slate-200/80 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-950/40">
          <div
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 text-sm font-semibold text-white"
            aria-hidden
          >
            {initials}
          </div>
          <div className="min-w-0">
            <p className="truncate font-medium text-slate-900 dark:text-white">{resolvedDisplayName}</p>
            <p className="truncate text-sm text-slate-500 dark:text-slate-400">{auth.user?.email || "—"}</p>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-500">Free plan · demo project</p>
          </div>
        </div>
      )}

      {Object.entries(groupedSettings).map(([group, items]) => (
        <section key={group}>
          <h3 className="mb-2 px-1 text-xs font-medium text-slate-500 dark:text-slate-400">{group}</h3>
          <div className="overflow-hidden rounded-xl border border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-900/50 divide-y divide-slate-200/80 dark:divide-slate-800">
            {items.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleItemClick(item)}
                  className="flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                    <Icon className="h-4 w-4" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-medium text-slate-900 dark:text-white">{item.title}</span>
                    <span className="block text-xs text-slate-500 dark:text-slate-400">{item.description}</span>
                  </span>
                  {item.chevron && <ChevronRight className="h-4 w-4 shrink-0 text-slate-400" />}
                </button>
              );
            })}
          </div>
        </section>
      ))}

      <section>
        <h3 className="mb-2 px-1 text-xs font-medium text-slate-500 dark:text-slate-400">Display</h3>
        <div className="flex items-center justify-between gap-4 rounded-xl border border-slate-200/80 bg-white px-4 py-3.5 dark:border-slate-800 dark:bg-slate-900/50">
          <div className="flex items-center gap-3">
            {theme === "dark" ? (
              <Moon className="h-4 w-4 text-slate-500" />
            ) : (
              <Sun className="h-4 w-4 text-slate-500" />
            )}
            <div>
              <p className="text-sm font-medium text-slate-900 dark:text-white">Dark mode</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {theme === "dark" ? "On" : "Off"}
              </p>
            </div>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={theme === "dark"}
            onClick={toggleTheme}
            className={cn(
              "relative h-7 w-12 shrink-0 rounded-full transition-colors",
              theme === "dark" ? "bg-cyan-600" : "bg-slate-300 dark:bg-slate-600"
            )}
          >
            <span
              className={cn(
                "absolute top-1 left-1 h-5 w-5 rounded-full bg-white shadow transition-transform",
                theme === "dark" ? "translate-x-5" : ""
              )}
            />
          </button>
        </div>
      </section>
    </div>
  );

  const inner = (
    <div className={cn("flex min-h-0 flex-1 flex-col", variant === "page" && "lg:flex-row")}>
      {variant === "page" && (
        <aside className="hidden w-52 shrink-0 flex-col border-r border-slate-200/80 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-950/50 lg:flex">
          <p className="px-3 pb-3 text-sm font-semibold text-slate-900 dark:text-white">Account</p>
          <nav className="flex flex-col gap-0.5">
            {SETTINGS_NAV.map(({ id, icon, label }) => (
              <NavButton
                key={id}
                active={activeSection === id}
                icon={icon}
                label={label}
                onClick={() => setActiveSection(id)}
              />
            ))}
          </nav>
          <div className="mt-4 border-t border-slate-200/80 pt-4 dark:border-slate-800 space-y-0.5">
            <NavButton active={false} icon={CreditCard} label="Billing" onClick={goBilling} />
            <NavButton
              active={false}
              icon={Mail}
              label="Contact"
              onClick={() => setCurrentPage?.("contact")}
            />
            <NavButton
              active={false}
              icon={LayoutDashboard}
              label="Dashboard"
              onClick={() => setCurrentPage?.("home")}
            />
          </div>
        </aside>
      )}

      {(variant === "page" || variant === "modal") && (
        <div
          className={cn(
            "shrink-0 border-b border-slate-200/80 bg-slate-50/50 px-4 py-3 dark:border-slate-800 dark:bg-slate-950/40",
            variant === "page" && "lg:hidden"
          )}
        >
          <label htmlFor="settings-section" className="mb-1.5 block text-xs font-medium text-slate-500">
            Section
          </label>
          <SmoothSelect
            id="settings-section"
            value={activeSection}
            onChange={setActiveSection}
            options={SETTINGS_SECTION_OPTIONS}
            aria-label="Settings section"
          />
        </div>
      )}

      <div
        ref={scrollRef}
        className="min-h-0 flex-1 overflow-y-auto overscroll-contain"
        style={{ touchAction: "pan-y", WebkitOverflowScrolling: "touch" }}
        onWheel={handleWheel}
        onMouseEnter={() => {
          isPointerOver.current = true;
        }}
        onMouseLeave={() => {
          isPointerOver.current = false;
        }}
      >
        {variant === "page" && activeSection !== "main" && (
          <div className="hidden border-b border-slate-200/80 px-6 py-3 dark:border-slate-800 lg:block">
            <p className="text-sm text-slate-500 dark:text-slate-400">{sectionMeta.description}</p>
          </div>
        )}

        {activeSection === "main" && overview}

        {activeSection === "profile" && (
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

        {activeSection === "brokers" && (
          <div className="mx-auto max-w-2xl px-4 py-6 sm:px-6">
            <BrokerConnection />
          </div>
        )}

        {activeSection === "notifications" && (
          <NotificationSettings
            price={price}
            setPrice={setPrice}
            dividend={dividend}
            setDividend={setDividend}
            weekly={weekly}
            setWeekly={setWeekly}
            showIntro={variant === "modal"}
          />
        )}

        {activeSection === "security" && (
          <SecuritySettings
            auth={auth}
            onClose={onClose}
            setCurrentPage={setCurrentPage}
            onRequestSignOut={() => setSignOutConfirmOpen(true)}
          />
        )}
      </div>
    </div>
  );

  const confirm = (
    <ConfirmDialog
      open={signOutConfirmOpen}
      title="Log out?"
      description="You'll return to the login screen. Unsaved changes in open forms may be lost."
      confirmLabel="Log out"
      cancelLabel="Stay signed in"
      danger
      onConfirm={signOut}
      onCancel={() => setSignOutConfirmOpen(false)}
    />
  );

  if (variant === "page") {
    return (
      <div className="flex min-h-[70vh] flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white/95 dark:border-slate-800 dark:bg-slate-900/90 shadow-sm">
        <div className="shrink-0 border-b border-slate-200/80 px-4 py-4 sm:px-6 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setCurrentPage?.("home")}
              className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 lg:hidden"
              aria-label="Back to dashboard"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div className="min-w-0 flex-1">
              <h1 className="text-xl font-semibold text-slate-900 dark:text-white sm:text-2xl">
                {sectionMeta.title}
              </h1>
              <p className="mt-0.5 text-sm text-slate-600 dark:text-slate-400 lg:hidden">
                {sectionMeta.description}
              </p>
            </div>
            {activeSection !== "main" && (
              <button
                type="button"
                onClick={() => setActiveSection("main")}
                className="hidden text-sm font-medium text-cyan-700 hover:underline dark:text-cyan-400 lg:inline-flex"
              >
                Overview
              </button>
            )}
          </div>
        </div>
        {inner}
        {confirm}
      </div>
    );
  }

  return (
    <div className="relative flex max-h-[min(85vh,760px)] w-full flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-900 shadow-xl">
      <div className="flex shrink-0 items-center justify-between gap-3 border-b border-slate-200/80 px-4 py-3 dark:border-slate-800 sm:px-5">
        <div className="flex min-w-0 items-center gap-2">
          {activeSection !== "main" && (
            <button
              type="button"
              onClick={() => setActiveSection("main")}
              aria-label="Back to overview"
              className="rounded-lg p-2 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
          )}
          <h3 className="truncate text-lg font-semibold text-slate-900 dark:text-white">
            {sectionMeta.title}
          </h3>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="rounded-lg p-2 hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
      {inner}
      {confirm}
    </div>
  );
}
