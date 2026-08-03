'use client';

import React from 'react';
import Link from 'next/link';
import ThemeToggle from './ThemeToggle';

export default function Header() {
  return (
    <header className="bg-white/80 dark:bg-gray-950/80 backdrop-blur-md border-b border-gray-100 dark:border-gray-800 sticky top-0 z-50 transition-colors shadow-sm">
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between h-20">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-black text-2xl shadow-lg shadow-blue-500/20 transition-transform hover:scale-105">S</div>
          <span className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">SkillMatch</span>
        </Link>
        <nav className="flex items-center gap-6">
          <Link
            href="/"
            className="text-sm font-medium text-gray-600 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400 transition-colors"
          >
            Home
          </Link>
          <Link
            href="/jobs"
            className="text-sm font-medium text-gray-600 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400 transition-colors"
          >
            Jobs
          </Link>
          <ThemeToggle shorthand className="hidden sm:flex" />
          <Link
            href="/login"
            className="text-sm font-medium text-gray-600 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400 transition-colors"
          >
            Login
          </Link>
          <Link
            href="/signup"
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-6 py-2.5 rounded-xl transition-all hover:scale-105 active:scale-95 shadow-lg shadow-blue-500/20"
          >
            Register
          </Link>
        </nav>
      </div>
    </header>
  );
}
