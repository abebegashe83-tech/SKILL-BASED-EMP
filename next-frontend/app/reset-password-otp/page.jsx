'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';

export default function OTPResetPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    // Retrieve email from localStorage
    const storedEmail = localStorage.getItem('resetEmail');
    if (storedEmail) {
      setEmail(storedEmail);
    } else {
      setError('No email found. Please request a new OTP.');
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email) {
      setError('Email is required. Please request a new OTP.');
      return;
    }

    if (!otp || otp.length !== 6) {
      setError('OTP must be 6 digits.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    setIsLoading(true);

    try {
      const response = await api.post('auth/verify-otp-reset/', {
        email: email,
        otp: otp,
        new_password: password,
      });
      console.log('OTP reset password response:', response.data);
      
      if (response.data.success) {
        setSuccess(true);
        // Clear the stored email
        localStorage.removeItem('resetEmail');
        setTimeout(() => {
          router.push('/login');
        }, 2000);
      }
    } catch (err) {
      console.error('OTP reset password error:', err);
      setError(err.response?.data?.message || err.response?.data?.detail || 'Failed to reset password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setError('');
    setIsLoading(true);

    try {
      const response = await api.post('auth/generate-otp/', { email });
      console.log('Resend OTP response:', response.data);
      
      if (response.data.success) {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      }
    } catch (err) {
      console.error('Resend OTP error:', err);
      setError(err.response?.data?.message || err.response?.data?.detail || 'Failed to resend OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    router.push('/forgot-password');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Reset Password</h1>
          <p className="text-gray-600">Enter your OTP and new password</p>
        </div>

        {success ? (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-green-800 font-medium">OTP Sent Successfully</p>
            </div>
            <p className="text-green-700 text-sm mt-2">A new OTP has been sent to your email.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
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

            <div className="mb-4">
              <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-2">
                OTP (6 digits)
              </label>
              <input
                type="text"
                id="otp"
                value={otp}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                  setOtp(value);
                }}
                placeholder="Enter 6-digit OTP"
                required
                disabled={isLoading}
                maxLength={6}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition disabled:bg-gray-100 disabled:cursor-not-allowed text-center text-xl tracking-widest"
              />
            </div>

            <div className="mb-4">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                New Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter new password"
                required
                disabled={isLoading}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
            </div>

            <div className="mb-6">
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                Confirm Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
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
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors disabled:bg-blue-400 disabled:cursor-not-allowed mb-3"
            >
              {isLoading ? 'Resetting...' : 'Reset Password'}
            </button>

            <button
              type="button"
              onClick={handleResendOTP}
              disabled={isLoading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors disabled:bg-indigo-400 disabled:cursor-not-allowed"
            >
              Resend OTP
            </button>
          </form>
        )}

        <div className="mt-6 text-center">
          <button
            onClick={handleBack}
            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            Back to Request OTP
          </button>
        </div>
      </div>
    </div>
  );
}
