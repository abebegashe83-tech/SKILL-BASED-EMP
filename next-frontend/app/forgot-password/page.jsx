'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      console.log('[FORGOT PASSWORD] Sending request to /auth/generate-otp/', { email });
      const response = await api.post('auth/generate-otp/', { email });
      console.log('[FORGOT PASSWORD] Response received:', response.status, response.data);
      
      if (response.data.success) {
        setSuccess(true);
        // Store email in localStorage for the next step
        localStorage.setItem('resetEmail', email);
      }
    } catch (err) {
      console.error('[FORGOT PASSWORD] Error:', err);
      console.error('[FORGOT PASSWORD] Error response:', err.response?.data);
      setError(err.response?.data?.message || err.response?.data?.detail || 'Failed to send OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleContinue = () => {
    router.push('/reset-password-otp');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Forgot Password</h1>
          <p className="text-gray-600">Enter your email to receive a password reset OTP</p>
        </div>

        {success ? (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-green-800 font-medium">OTP Sent Successfully</p>
            </div>
            <p className="text-green-700 text-sm mt-2">We've sent a 6-digit OTP to your email address. It will expire in 10 minutes.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                disabled={isLoading}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-red-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-red-800 text-sm">{error}</p>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors disabled:bg-blue-400 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Sending...' : 'Send OTP'}
            </button>
          </form>
        )}

        {success && (
          <button
            onClick={handleContinue}
            className="w-full mt-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
          >
            Continue to Reset Password
          </button>
        )}

        <div className="mt-6 text-center">
          <Link href="/login" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}
