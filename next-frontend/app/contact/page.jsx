'use client';

import React, { useState } from 'react';
import Header from '../../components/Header';

const normalizeApiUrl = (baseUrl) => {
  let base = baseUrl || 'http://localhost:8000';
  base = base.replace(/\/$/, '');
  if (base.endsWith('/api')) {
    base = base.slice(0, -4);
  }
  if (base.endsWith('/api/contact')) {
    base = base.slice(0, -13);
  }
  const endpoint = `${base}/api/contact/`;
  console.log('Final endpoint:', endpoint);
  return endpoint;
};

const API_URL = normalizeApiUrl(process.env.NEXT_PUBLIC_API_URL);

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const validate = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.message.trim()) {
      newErrors.message = 'Message is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (validate()) {
      setIsLoading(true);
      setSubmitError('');

      try {
        const response = await fetch(API_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        });

        const data = await response.json();

        if (response.ok) {
          setSuccess(true);
          setFormData({ name: '', email: '', message: '' });
          setErrors({});
          setTimeout(() => setSuccess(false), 5000);
        } else {
          setSubmitError(data.detail || 'Failed to send message. Please try again.');
        }
      } catch (error) {
        setSubmitError('Network error. Please try again.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 font-sans transition-colors duration-300">
      <Header />

      <main className="max-w-2xl mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-6">Contact Us</h1>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            Have questions? We'd love to hear from you.
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-gray-100 dark:border-slate-800 p-8 transition-colors">
          {success && (
            <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
              <p className="text-green-800 dark:text-green-300 font-medium">Message sent successfully! We'll get back to you soon.</p>
            </div>
          )}

          {submitError && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-red-800 dark:text-red-300 font-medium">{submitError}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                disabled={isLoading}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-colors bg-white dark:bg-slate-800 text-gray-900 dark:text-white ${errors.name ? 'border-red-500' : 'border-gray-300 dark:border-slate-700'} ${isLoading ? 'bg-gray-100 dark:bg-slate-950' : ''}`}
                placeholder="Your name"
              />
              {errors.name && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.name}</p>}
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email *
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                disabled={isLoading}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-colors bg-white dark:bg-slate-800 text-gray-900 dark:text-white ${errors.email ? 'border-red-500' : 'border-gray-300 dark:border-slate-700'} ${isLoading ? 'bg-gray-100 dark:bg-slate-950' : ''}`}
                placeholder="your@email.com"
              />
              {errors.email && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.email}</p>}
            </div>

            <div>
              <label htmlFor="message" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Message *
              </label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                disabled={isLoading}
                rows={5}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-colors resize-none bg-white dark:bg-slate-800 text-gray-900 dark:text-white ${errors.message ? 'border-red-500' : 'border-gray-300 dark:border-slate-700'} ${isLoading ? 'bg-gray-100 dark:bg-slate-950' : ''}`}
                placeholder="Your message..."
              />
              {errors.message && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.message}</p>}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors shadow-sm"
            >
              {isLoading ? 'Sending...' : 'Send Message'}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
