'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Header from '../components/Header';
import api from '@/lib/api';

const IconCheck = () => <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>;

const IconBrain = () => <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>;

const IconBriefcase = () => <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>;

const IconUsers = () => <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>;

const IconChart = () => <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>;

const IconFacebook = () => <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>;

const IconTwitter = () => <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>;

const IconLinkedIn = () => <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg>;

const IconGitHub = () => <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" /></svg>;

const IconMail = () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>;

const IconPhone = () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>;

const defaultStats = [
  { label: 'Active Jobs', value: '1000+' },
  { label: 'Employers', value: '500+' },
  { label: 'Job Seekers', value: '2000+' },
];

const defaultFeatures = [
  {
    icon: <IconBrain />,
    title: 'AI Job Matching',
    description: 'Our intelligent algorithm matches your skills with the perfect job opportunities.'
  },
  {
    icon: <IconChart />,
    title: 'Smart Recommendations',
    description: 'Get personalized job recommendations based on your profile and preferences.'
  },
  {
    icon: <IconBriefcase />,
    title: 'Easy Applications',
    description: 'Apply to multiple jobs with a single click using your verified profile.'
  },
  {
    icon: <IconUsers />,
    title: 'Employer Dashboard',
    description: 'Manage job postings, track applications, and find the best candidates.'
  }
];

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
  return endpoint;
};

const API_URL = normalizeApiUrl(process.env.NEXT_PUBLIC_API_URL);

export default function HomePage() {
  const [email, setEmail] = React.useState('');
  const [subscribed, setSubscribed] = React.useState(false);
  const [contactForm, setContactForm] = React.useState({ name: '', email: '', message: '' });
  const [contactErrors, setContactErrors] = React.useState({});
  const [isContactLoading, setIsContactLoading] = React.useState(false);
  const [contactSuccess, setContactSuccess] = React.useState(false);
  const [contactError, setContactError] = React.useState('');
  const [landingContent, setLandingContent] = React.useState([]);
  const [loadingContent, setLoadingContent] = React.useState(false);
  const [currentIndex, setCurrentIndex] = React.useState(0);

  useEffect(() => {
    const fetchLandingContent = async () => {
      try {
        setLoadingContent(true);
        const res = await api.get('contact/landing-content/');
        setLandingContent(res.data);
      } catch (err) {
        console.error('Failed to fetch landing content:', err);
      } finally {
        setLoadingContent(false);
      }
    };
    fetchLandingContent();
  }, []);

  const heroImages = landingContent.filter(item => item.section === 'hero');

  useEffect(() => {
    if (heroImages.length === 0) return;

    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % heroImages.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [heroImages]);

  const getContentBySection = (section) => {
    return landingContent.filter(item => item.section === section);
  };

  const getStatsContent = () => {
    const statsItems = getContentBySection('stats');
    if (statsItems.length > 0) {
      return statsItems.map(item => ({
        label: item.title,
        value: item.subtitle
      }));
    }
    return defaultStats;
  };

  const getFeaturesContent = () => {
    const featuresItems = getContentBySection('features');
    if (featuresItems.length > 0) {
      return featuresItems.map((item, index) => ({
        icon: defaultFeatures[index % defaultFeatures.length].icon,
        title: item.title,
        description: item.subtitle,
        image_url: item.image_url
      }));
    }
    return defaultFeatures;
  };

  const stats = getStatsContent();
  const features = getFeaturesContent();

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail('');
    }
  };

  const validateContact = () => {
    const newErrors = {};
    if (!contactForm.name.trim()) newErrors.name = 'Name is required';
    if (!contactForm.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactForm.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    if (!contactForm.message.trim()) newErrors.message = 'Message is required';
    setContactErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    if (validateContact()) {
      setIsContactLoading(true);
      setContactError('');
      try {
        const response = await fetch(API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(contactForm),
        });
        const data = await response.json();
        if (response.ok) {
          setContactSuccess(true);
          setContactForm({ name: '', email: '', message: '' });
          setContactErrors({});
          setTimeout(() => setContactSuccess(false), 5000);
        } else {
          setContactError(data.detail || 'Failed to send message. Please try again.');
        }
      } catch (error) {
        setContactError('Network error. Please try again.');
      } finally {
        setIsContactLoading(false);
      }
    }
  };

  const handleContactChange = (e) => {
    const { name, value } = e.target;
    setContactForm(prev => ({ ...prev, [name]: value }));
    if (contactErrors[name]) {
      setContactErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 font-sans transition-colors duration-300">
      <Header />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-500/10 via-transparent to-transparent -z-10 blur-3xl"></div>

        <div className="max-w-7xl mx-auto px-6 text-center space-y-8">
          {heroImages.length > 0 && heroImages[currentIndex].image_url && (
            <>
              <div className="relative w-full max-w-5xl mx-auto h-[400px] overflow-hidden rounded-3xl shadow-2xl">
                <img
                  src={heroImages[currentIndex].image_url}
                  alt="hero"
                  className="w-full h-full object-cover transition-opacity duration-700"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-6">
                  <h1 className="text-3xl md:text-5xl font-bold text-white tracking-tight leading-tight">
                    {heroImages[currentIndex].title}
                  </h1>
                  <p className="text-lg text-white/90 mt-2 max-w-2xl mx-auto">
                    {heroImages[currentIndex].subtitle}
                  </p>
                </div>
              </div>

              <div className="flex justify-center gap-2 mt-4">
                {heroImages.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentIndex(i)}
                    className={`w-3 h-3 rounded-full transition-all ${i === currentIndex ? 'bg-blue-600 w-8' : 'bg-gray-300'
                      }`}
                  />
                ))}
              </div>
            </>
          )}

          {heroImages.length === 0 && (
            <>
              <h1 className="text-5xl md:text-7xl font-bold text-gray-900 dark:text-gray-100 tracking-tight leading-tight">
                Find Jobs Based on Your Skills
              </h1>
              <p className="max-w-2xl mx-auto text-lg md:text-xl text-gray-500 dark:text-gray-400 leading-relaxed">
                AI-powered job matching platform that connects talented individuals with their dream opportunities.
              </p>
            </>
          )}

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Link href="/signup" className="bg-blue-600 text-white hover:bg-blue-700 px-8 py-4 rounded-2xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl">
              Get Started
            </Link>
            <Link href="/jobs" className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-700 px-8 py-4 rounded-2xl font-semibold hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-200">
              Browse Jobs
            </Link>
          </div>
        </div>
      </section>

      {/* Social Proof / Stats Section */}
      <section className="py-16 bg-white dark:bg-gray-800 transition-colors">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center p-6 rounded-2xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-200">
                <p className="text-4xl font-bold text-blue-600">{stat.value}</p>
                <p className="text-gray-500 dark:text-gray-400 mt-2">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50 dark:bg-gray-900 transition-colors">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Why Choose SkillMatch?
            </h2>
            <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Our platform uses advanced AI to match you with the perfect job based on your skills and experience.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div key={index} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md p-6 text-center transition-all duration-200">
                {feature.image_url ? (
                  <div className="flex justify-center mb-4">
                    <img
                      src={feature.image_url}
                      alt={feature.title}
                      className="w-16 h-16 object-cover rounded-2xl"
                    />
                  </div>
                ) : (
                  <div className="flex justify-center mb-4">
                    {feature.icon}
                  </div>
                )}
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20 bg-white dark:bg-gray-800 transition-colors">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Get In Touch
            </h2>
            <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Have questions? We'd love to hear from you.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-4xl mx-auto">
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                  <IconMail />
                </div>
                <div>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">Email</p>
                  <p className="text-gray-900 dark:text-gray-100 font-semibold">support@skillmatch.com</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                  <IconPhone />
                </div>
                <div>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">Phone</p>
                  <p className="text-gray-900 dark:text-gray-100 font-semibold">+1 (555) 123-4567</p>
                </div>
              </div>
            </div>

            <form onSubmit={handleContactSubmit} className="space-y-4">
              {contactSuccess && (
                <div className="p-4 bg-green-100 text-green-700 border border-green-200 rounded-lg">
                  <p className="text-green-700 font-medium">Message sent successfully! We'll get back to you soon.</p>
                </div>
              )}
              {contactError && (
                <div className="p-4 bg-red-100 text-red-700 border border-red-200 rounded-lg">
                  <p className="text-red-700 font-medium">{contactError}</p>
                </div>
              )}
              <input
                type="text"
                name="name"
                placeholder="Your Name"
                value={contactForm.name}
                onChange={handleContactChange}
                disabled={isContactLoading}
                className={`w-full px-4 py-3 rounded-xl border bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${contactErrors.name ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
              />
              {contactErrors.name && <p className="text-sm text-red-600">{contactErrors.name}</p>}
              <input
                type="email"
                name="email"
                placeholder="Your Email"
                value={contactForm.email}
                onChange={handleContactChange}
                disabled={isContactLoading}
                className={`w-full px-4 py-3 rounded-xl border bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${contactErrors.email ? 'border-red-500' : 'border-gray-200 dark:border-gray-700'}`}
              />
              {contactErrors.email && <p className="text-sm text-red-600 dark:text-red-400">{contactErrors.email}</p>}
              <textarea
                name="message"
                placeholder="Your Message"
                rows={4}
                value={contactForm.message}
                onChange={handleContactChange}
                disabled={isContactLoading}
                className={`w-full px-4 py-3 rounded-xl border bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all resize-none ${contactErrors.message ? 'border-red-500' : 'border-gray-200 dark:border-gray-700'}`}
              />
              {contactErrors.message && <p className="text-sm text-red-600 dark:text-red-400">{contactErrors.message}</p>}
              <button
                type="submit"
                disabled={isContactLoading}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-200"
              >
                {isContactLoading ? 'Sending...' : 'Send Message'}
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-16 bg-blue-600 transition-colors">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
            Subscribe for Job Updates
          </h2>
          <p className="text-blue-100 mb-6 max-w-xl mx-auto">
            Get the latest job opportunities delivered to your inbox.
          </p>
          {subscribed ? (
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 max-w-md mx-auto">
              <p className="text-white font-semibold">Thank you for subscribing!</p>
            </div>
          ) : (
            <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="flex-1 px-4 py-3 rounded-xl border-0 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              />
              <button
                type="submit"
                className="bg-gray-800 hover:bg-gray-900 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200"
              >
                Subscribe
              </button>
            </form>
          )}
        </div>
      </section>
    </div>
  );
}
