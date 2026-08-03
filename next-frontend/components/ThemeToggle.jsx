"use client";

import { useTheme } from "@/app/providers/theme-provider";

export default function ThemeToggle({ className = "", shorthand = false }) {
  const { theme, toggleTheme } = useTheme();

  if (shorthand) {
    return (
      <button
        onClick={toggleTheme}
        aria-label="Toggle theme"
        className={`p-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 hover:scale-105 active:scale-95 transition-all flex items-center justify-center text-lg shadow-sm ${className}`}
      >
        {theme === "light" ? "🌙" : "☀️"}
      </button>
    );
  }

  return (
    <button
      onClick={toggleTheme}
      aria-label="Toggle theme"
      className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-blue-600 ${className}`}
    >
      <span className="text-lg">{theme === "light" ? "🌙" : "☀️"}</span>
      <span>{theme === "light" ? "Dark Appearance" : "Light Appearance"}</span>
    </button>
  );
}
