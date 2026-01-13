import React from "react";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "../pages/ThemeContext";

export default function DarkModeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      onClick={toggleTheme}
      className="relative inline-flex items-center h-8 w-14 rounded-full bg-gray-200 dark:bg-slate-700 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-slate-900"
      aria-label={isDark ? "Activate light mode" : "Activate dark mode"}
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      <span
        className={`absolute left-1 transition-transform duration-300 ease-in-out
          ${isDark ? "translate-x-6" : "translate-x-0"}
        `}
      >
        <span className="flex items-center justify-center h-6 w-6 rounded-full bg-white shadow-md">
          {isDark 
            ? <Moon className="w-4 h-4 text-blue-500" /> 
            : <Sun className="w-4 h-4 text-yellow-500" />
          }
        </span>
      </span>
    </button>
  );
}
