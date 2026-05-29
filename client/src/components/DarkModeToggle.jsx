import React from "react";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "../pages/ThemeContext";

export default function DarkModeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      onClick={toggleTheme}
      className="p-2 text-slate-500 hover:text-cyan-600 dark:text-slate-400 dark:hover:text-cyan-400 transition-all hover:scale-110 active:scale-95 flex items-center justify-center focus:outline-none"
      aria-label={isDark ? "Activate light mode" : "Activate dark mode"}
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      {isDark 
        ? <Sun className="w-5 h-5 transition-transform duration-300 hover:rotate-90" /> 
        : <Moon className="w-5 h-5 transition-transform duration-300 hover:-rotate-12" />
      }
    </button>
  );
}
