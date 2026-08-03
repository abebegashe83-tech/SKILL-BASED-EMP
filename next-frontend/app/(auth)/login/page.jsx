'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { loginUser } from '@/lib/auth';


function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const hasRedirected = useRef(false);

  const redirectTo = searchParams.get('redirect') || '/dashboard';

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (isLoading || hasRedirected.current) {
      return;
    }
    
    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }
    
    setError('');
    setIsLoading(true);

    try {
      const result = await loginUser(email, password);

      if (result.success) {
        hasRedirected.current = true;
        await new Promise(resolve => setTimeout(resolve, 300));
        
        const userRole = result.user?.role;
        const roleDashboard = userRole ? `/${userRole}/dashboard` : '/dashboard';
        const finalRedirect = searchParams.get('redirect') || roleDashboard;
        
        router.push(finalRedirect);
      } else {
        setError(result.error || 'Login failed. Please check your credentials.');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(err.response?.data?.detail || err.message || 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900 px-4 transition-colors duration-300">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-blue-600 font-extrabold text-2xl hover:text-blue-700">
            💼 SkillMatch
          </Link>
          <h2 className="mt-4 text-2xl font-bold text-gray-900 dark:text-gray-100">Welcome back</h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Sign in to your account</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-7">
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-100 text-red-700 border border-red-200 text-sm flex items-center gap-2">
              <span>⚠️</span> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Email address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 dark:disabled:bg-gray-700 disabled:cursor-not-allowed text-gray-900 dark:text-gray-100"
                placeholder="you@example.com"
                autoComplete="email"
                required
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Password</label>
                <Link href="/forgot-password" disabled={isLoading} className={`text-xs text-blue-600 hover:text-blue-700 hover:underline ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                  Forgot password?
                </Link>
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 dark:disabled:bg-gray-700 disabled:cursor-not-allowed text-gray-900 dark:text-gray-100"
                placeholder="••••••••"
                autoComplete="current-password"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-lg bg-blue-600 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:bg-blue-400 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        </div>

        <p className="mt-5 text-center text-sm text-gray-500 dark:text-gray-400">
          Don't have an account?{' '}
          <Link href="/signup" className="text-blue-600 hover:text-blue-700 font-medium hover:underline">
            Sign up free
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function Login() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center">Loading...</div>}>
      <LoginContent />
    </Suspense>
  );
}
