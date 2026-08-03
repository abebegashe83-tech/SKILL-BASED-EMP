'use client';

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { registerUser, loginUser, tokenManager } from '@/lib/auth';

export default function Signup() {
    const [step, setStep] = useState(1);
    const [role, setRole] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const router = useRouter();
    const hasRedirected = useRef(false);

    // Form data state
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        confirmPassword: '',
        fullName: '',
        title: '',
        location: '',
        bio: '',
        companyName: '',
        industry: '',
        companySize: '',
        website: ''
    });

    const [formErrors, setFormErrors] = useState({});

    const getStrengthScore = (pass) => {
        let score = 0;
        if (!pass) return 0;
        if (pass.length > 8) score++;
        if (/[A-Z]/.test(pass)) score++;
        if (/[0-9]/.test(pass)) score++;
        if (/[^A-Za-z0-9]/.test(pass)) score++;
        return score;
    };

    const strengthScore = getStrengthScore(formData.password);
    const strengthLabels = ['', 'Weak', 'Fair', 'Good', 'Strong'];
    const strengthColors = ['', 'bg-red-500', 'bg-yellow-500', 'bg-blue-500', 'bg-green-500'];

    const handleNext = () => {
        if (step === 1 && !role) return;
        setStep((s) => s + 1);
    };

    const onSubmit = async (e) => {
        e.preventDefault();
        
        if (isSubmitting || hasRedirected.current) {
            return;
        }
        
        setIsSubmitting(true);
        setError('');
        setFormErrors({});

        const errors = {};
        if (!formData.email) errors.email = 'Email is required';
        if (!formData.password) errors.password = 'Password is required';
        if (formData.password !== formData.confirmPassword) errors.confirmPassword = 'Passwords do not match';
        if (!formData.fullName) errors.fullName = 'Full name is required';
        
        if (role === 'jobseeker' && !formData.title) errors.title = 'Title is required';
        if (role === 'employer' && !formData.companyName) errors.companyName = 'Company name is required';
        if (role === 'employer' && !formData.industry) errors.industry = 'Industry is required';
        if (role === 'employer' && !formData.companySize) errors.companySize = 'Company size is required';
        
        if (Object.keys(errors).length > 0) {
            setFormErrors(errors);
            setIsSubmitting(false);
            return;
        }

        try {
            const regResult = await registerUser({ ...formData, role });
            
            if (!regResult.success) {
                setError(regResult.error || 'Registration failed. Please try again.');
                setIsSubmitting(false);
                return;
            }

            hasRedirected.current = true;
            await new Promise(resolve => setTimeout(resolve, 300));
            
            const redirectPath = role === 'jobseeker' ? '/jobseeker/dashboard' : 
                               role === 'employer' ? '/employer/dashboard' : 
                               role === 'admin' ? '/admin/dashboard' : 
                               '/dashboard';
            
            router.push(redirectPath);
            
        } catch (error) {
            console.error('Signup error:', error);
            setError(error.response?.data?.detail || error.message || 'An unexpected error occurred. Please try again.');
            setIsSubmitting(false);
        }
    };

    const handleChange = (e) => {
        if (isSubmitting) return;
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (formErrors[name]) {
            setFormErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }
    };

    const inputCls = (err) =>
        `mt-1 block w-full rounded-md border p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 ${err ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
        } disabled:bg-gray-100 dark:disabled:bg-gray-700 disabled:cursor-not-allowed`;

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 transition-colors duration-300">
            <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-8 space-y-6 transition-colors">
                {/* Header */}
                <div className="text-center">
                    <Link href="/" className="text-blue-600 font-extrabold text-xl hover:text-blue-700">💼 SkillMatch</Link>
                    <h2 className="mt-3 text-2xl font-bold text-gray-900 dark:text-gray-100">Create your account</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Step {step} of 3</p>
                </div>

                {/* Step Progress Bar */}
                <div className="flex gap-2">
                    {[1, 2, 3].map((s) => (
                        <div
                            key={s}
                            className={`h-1.5 flex-1 rounded-full transition-all ${s <= step ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
                                }`}
                        />
                    ))}
                </div>

                {/* Error Banner */}
                {error && (
                    <div className="p-3 rounded-lg bg-red-100 text-red-700 border border-red-200 text-sm">
                        ⚠️ {error}
                    </div>
                )}

                <form onSubmit={onSubmit} className="space-y-4">
                    {/* ── STEP 1: Role Selection ── */}
                    {step === 1 && (
                        <div className="space-y-4">
                            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 text-center">I am signing up as a:</p>
                            <div className="grid grid-cols-2 gap-4">
                                {[
                                    { value: 'jobseeker', label: 'Jobseeker', sub: 'Looking for work' },
                                    { value: 'employer', label: 'Employer', sub: 'Hiring talent' },
                                ].map((r) => (
                                    <button
                                        key={r.value}
                                        type="button"
                                        onClick={() => setRole(r.value)}
                                        disabled={isSubmitting}
                                        className={`p-4 border-2 rounded-xl text-center transition-all ${role === r.value
                                            ? 'border-blue-600 bg-blue-100 text-blue-700'
                                            : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-800 text-gray-700 dark:text-gray-300'
                                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                                    >
                                        <span className="block font-bold">{r.label}</span>
                                        <span className="text-xs opacity-70 mt-1 block">{r.sub}</span>
                                    </button>
                                ))}
                            </div>
                            {!role && <p className="text-center text-xs text-gray-500 dark:text-gray-400">Please select a role to continue</p>}
                            
                            {/* Continue Button for Step 1 */}
                            <div className="flex justify-center pt-4">
                                <button
                                    type="button"
                                    onClick={handleNext}
                                    disabled={!role || isSubmitting}
                                    className={`px-8 py-3 rounded-lg text-sm font-semibold text-white transition-colors ${
                                        !role || isSubmitting
                                            ? 'bg-gray-300 dark:bg-gray-700 dark:text-gray-500 cursor-not-allowed'
                                            : 'bg-blue-600 hover:bg-blue-700'
                                    }`}
                                >
                                    Continue
                                </button>
                            </div>
                        </div>
                    )}

                    {/* ── STEP 2: Basic Info ── */}
                    {step === 2 && (
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Full Name</label>
                                <input
                                    type="text"
                                    name="fullName"
                                    value={formData.fullName}
                                    onChange={handleChange}
                                    disabled={isSubmitting}
                                    className={inputCls(formErrors.fullName)}
                                    placeholder="John Doe"
                                />
                                {formErrors.fullName && <p className="text-red-600 text-xs mt-1">{formErrors.fullName}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    disabled={isSubmitting}
                                    className={inputCls(formErrors.email)}
                                    placeholder="john@example.com"
                                />
                                {formErrors.email && <p className="text-red-500 text-xs mt-1">{formErrors.email}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Password</label>
                                <input
                                    type="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    disabled={isSubmitting}
                                    className={inputCls(formErrors.password)}
                                    placeholder="••••••••"
                                />
                                {formErrors.password && <p className="text-red-500 text-xs mt-1">{formErrors.password}</p>}
                                {formData.password && (
                                    <div className="mt-2">
                                        <div className="flex gap-1 mb-1">
                                            {[1, 2, 3, 4].map((i) => (
                                                <div
                                                    key={i}
                                                    className={`h-1 flex-1 rounded ${i <= strengthScore ? strengthColors[i] : 'bg-gray-200 dark:bg-gray-700'}`}
                                                />
                                            ))}
                                        </div>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                            Password strength: {strengthLabels[strengthScore]}
                                        </p>
                                    </div>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Confirm Password</label>
                                <input
                                    type="password"
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    disabled={isSubmitting}
                                    className={inputCls(formErrors.confirmPassword)}
                                    placeholder="••••••••"
                                />
                                {formErrors.confirmPassword && <p className="text-red-500 text-xs mt-1">{formErrors.confirmPassword}</p>}
                            </div>

                            <div className="flex justify-between">
                                <button
                                    type="button"
                                    onClick={() => setStep(1)}
                                    disabled={isSubmitting}
                                    className="text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 font-medium disabled:text-gray-400 disabled:cursor-not-allowed"
                                >
                                    ← Back
                                </button>
                                <button
                                    type="button"
                                    onClick={handleNext}
                                    disabled={!formData.fullName || !formData.email || !formData.password || isSubmitting}
                                    className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white font-medium px-6 py-2 rounded-lg transition-colors"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    )}

                    {/* ── STEP 3: Role-Specific Fields ── */}
                    {step === 3 && role === 'jobseeker' && (
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Professional Title</label>
                                <input
                                    type="text"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleChange}
                                    disabled={isSubmitting}
                                    className={inputCls()}
                                    placeholder="e.g., Software Engineer"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Location</label>
                                <input
                                    type="text"
                                    name="location"
                                    value={formData.location}
                                    onChange={handleChange}
                                    disabled={isSubmitting}
                                    className={inputCls()}
                                    placeholder="e.g., Nairobi, Kenya"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Bio</label>
                                <textarea
                                    name="bio"
                                    value={formData.bio}
                                    onChange={handleChange}
                                    disabled={isSubmitting}
                                    rows={3}
                                    className={inputCls()}
                                    placeholder="Tell us about yourself..."
                                />
                            </div>

                            <div className="flex justify-between">
                                <button
                                    type="button"
                                    onClick={() => setStep(2)}
                                    disabled={isSubmitting}
                                    className="text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 font-medium disabled:text-gray-400 disabled:cursor-not-allowed"
                                >
                                    ← Back
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white font-medium px-6 py-2 rounded-lg transition-colors"
                                >
                                    {isSubmitting ? 'Creating Account...' : 'Create Account'}
                                </button>
                            </div>
                        </div>
                    )}

                    {step === 3 && role === 'employer' && (
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Company Name</label>
                                <input
                                    type="text"
                                    name="companyName"
                                    value={formData.companyName}
                                    onChange={handleChange}
                                    disabled={isSubmitting}
                                    className={inputCls()}
                                    placeholder="e.g., TechCorp Ltd"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Industry</label>
                                <input
                                    type="text"
                                    name="industry"
                                    value={formData.industry}
                                    onChange={handleChange}
                                    disabled={isSubmitting}
                                    className={inputCls()}
                                    placeholder="e.g., Technology"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Company Size</label>
                                <select
                                    name="companySize"
                                    value={formData.companySize}
                                    onChange={handleChange}
                                    disabled={isSubmitting}
                                    className={inputCls()}
                                >
                                    <option value="">Select size</option>
                                    <option value="1-10">1-10</option>
                                    <option value="11-50">11-50</option>
                                    <option value="51-200">51-200</option>
                                    <option value="201-500">201-500</option>
                                    <option value="500+">500+</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Website</label>
                                <input
                                    type="url"
                                    name="website"
                                    value={formData.website}
                                    onChange={handleChange}
                                    disabled={isSubmitting}
                                    className={inputCls()}
                                    placeholder="https://example.com"
                                />
                            </div>

                            <div className="flex justify-between">
                                <button
                                    type="button"
                                    onClick={() => setStep(2)}
                                    disabled={isSubmitting}
                                    className="text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 font-medium disabled:text-gray-400 disabled:cursor-not-allowed"
                                >
                                    ← Back
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white font-medium px-6 py-2 rounded-lg transition-colors"
                                >
                                    {isSubmitting ? 'Creating Account...' : 'Create Account'}
                                </button>
                            </div>
                        </div>
                    )}
                </form>

                <p className="text-center text-sm text-gray-500 dark:text-gray-400">
                    Already have an account?{' '}
                    <Link href="/login" className="text-blue-600 hover:text-blue-700 font-medium hover:underline">
                        Sign in
                    </Link>
                </p>
            </div>
        </div>
    );
}
