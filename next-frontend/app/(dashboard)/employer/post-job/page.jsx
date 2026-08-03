'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { getSession } from '@/lib/auth';

import api from '@/lib/api';

export default function EmployerPostJobPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    company: '',
    location: '',
    type: 'Full-time',
    salaryMin: '',
    salaryMax: '',
    experience: 'ENTRY',
    positions: '1',
    skills: '',
    description: '',
    deadline: '',
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    const userSession = getSession();
    if (userSession) {
      setSession(userSession);
      setFormData((prev) => ({ ...prev, company: userSession.name || 'Your Company' }));
    } else {
      router.push('/login');
    }
  }, [router]);

  useEffect(() => {
    const jobId = searchParams.get('id');
    if (jobId) {
      setIsEditing(true);
      fetchJob(jobId);
    }
  }, [searchParams]);

  const fetchJob = async (jobId) => {
    try {
      const res = await api.get(`jobs/${jobId}/`);
      const job = res.data;
      setFormData({
        title: job.title || '',
        company: job.company || session?.name || 'Your Company',
        location: job.location || '',
        type: 'Full-time',
        salaryMin: job.salary ? job.salary.split('-')[0].replace(/[^0-9]/g, '') : '',
        salaryMax: job.salary ? job.salary.split('-')[1]?.replace(/[^0-9]/g, '') : '',
        experience: job.experience_level || 'ENTRY',
        positions: job.positions?.toString() || '1',
        skills: (job.required_skills || []).join(', '),
        description: job.description || '',
        deadline: '',
      });
    } catch (err) {
      console.error('Error fetching job:', err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = 'Job title is required';
    if (!formData.company.trim()) newErrors.company = 'Company name is required';
    if (!formData.location.trim()) newErrors.location = 'Location is required';
    if (!formData.description.trim()) newErrors.description = 'Job description is required';
    if (!formData.skills.trim()) newErrors.skills = 'Skills are required';
    if (formData.salaryMin && formData.salaryMax && parseInt(formData.salaryMin) > parseInt(formData.salaryMax)) {
      newErrors.salaryMax = 'Maximum salary must be greater than minimum salary';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    
    try {
      const jobId = searchParams.get('id');
      const jobPayload = {
        title: formData.title,
        description: formData.description,
        location: formData.location,
        experience_level: formData.experience,
        positions: parseInt(formData.positions) || 1,
        salary: formData.salaryMax && formData.salaryMin 
          ? `$${formData.salaryMin} - $${formData.salaryMax}` 
          : formData.salaryMax ? `$${formData.salaryMax}` : formData.salaryMin ? `$${formData.salaryMin}` : '',
        required_skills: formData.skills.split(',').map(s => s.trim()).filter(s => s.length > 0)
      };

      if (isEditing && jobId) {
        await api.put(`jobs/${jobId}/`, jobPayload);
      } else {
        await api.post('jobs/', jobPayload);
      }
      
      setSuccess(true);
      // Reset form
      setFormData({
        title: '',
        company: session?.name || 'Your Company',
        location: '',
        type: 'Full-time',
        salaryMin: '',
        salaryMax: '',
        experience: 'ENTRY',
        positions: '1',
        skills: '',
        description: '',
        deadline: '',
      });
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving job:', error);
      const errorMsg = error.response?.data?.detail 
        || (error.response?.data && Object.values(error.response.data)[0])
        || `Failed to ${isEditing ? 'update' : 'create'} job posting. Please try again.`;
      setErrors({ ...errors, general: errorMsg });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 transition-colors duration-300">
      {/* Header */}
      <header className="bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/employer/dashboard" className="text-purple-700 dark:text-purple-400 font-extrabold text-xl">💼 SkillMatch</Link>
            <div className="flex items-center gap-4">
              <Link href="/employer/dashboard" className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">← Back to Dashboard</Link>
              <button onClick={handleLogout} className="text-sm text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors">Logout</button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white dark:bg-slate-900 rounded-lg shadow-sm border border-gray-200 dark:border-slate-800 p-8 transition-colors">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{isEditing ? 'Edit Job Posting' : 'Post a New Job'}</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-8">{isEditing ? 'Update your job posting details' : 'Create a job posting to attract qualified candidates'}</p>

          {errors.general && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-sm text-red-600 dark:text-red-400">{errors.general}</p>
            </div>
          )}

          {success ? (
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6 text-center transition-colors">
              <div className="text-green-600 dark:text-green-400 text-5xl mb-4">✓</div>
              <h2 className="text-xl font-semibold text-green-800 dark:text-green-300 mb-2">{isEditing ? 'Job Updated Successfully!' : 'Job Posted Successfully!'}</h2>
              <p className="text-green-600 dark:text-green-400 mb-6">{isEditing ? 'Your job posting has been updated.' : 'Your job has been posted and is now visible to candidates.'}</p>
              <div className="flex gap-4 justify-center">
                <Link href="/employer/dashboard" className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors">
                  View Dashboard
                </Link>
                <button
                  onClick={() => {
                    setSuccess(false);
                    setIsEditing(false);
                  }}
                  className="bg-gray-200 dark:bg-slate-800 text-gray-800 dark:text-gray-200 px-6 py-2 rounded-lg hover:bg-gray-300 dark:hover:bg-slate-700 transition-colors"
                >
                  {isEditing ? 'Edit Another Job' : 'Post Another Job'}
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Job Title *</label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white dark:bg-slate-800 text-gray-900 dark:text-white transition-colors ${
                      errors.title ? 'border-red-500' : 'border-gray-300 dark:border-slate-700'
                    }`}
                    placeholder="e.g., Senior React Developer"
                  />
                  {errors.title && <p className="text-red-500 dark:text-red-400 text-sm mt-1">{errors.title}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Company Name *</label>
                  <input
                    type="text"
                    name="company"
                    value={formData.company}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white dark:bg-slate-800 text-gray-900 dark:text-white transition-colors ${
                      errors.company ? 'border-red-500' : 'border-gray-300 dark:border-slate-700'
                    }`}
                  />
                  {errors.company && <p className="text-red-500 dark:text-red-400 text-sm mt-1">{errors.company}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Location *</label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white dark:bg-slate-800 text-gray-900 dark:text-white transition-colors ${
                      errors.location ? 'border-red-500' : 'border-gray-300 dark:border-slate-700'
                    }`}
                    placeholder="e.g., Nairobi, Kenya or Remote"
                  />
                  {errors.location && <p className="text-red-500 dark:text-red-400 text-sm mt-1">{errors.location}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Job Type</label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 dark:text-white transition-colors"
                  >
                    <option value="Full-time">Full-time</option>
                    <option value="Part-time">Part-time</option>
                    <option value="Contract">Contract</option>
                    <option value="Internship">Internship</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Minimum Salary</label>
                  <input
                    type="number"
                    name="salaryMin"
                    value={formData.salaryMin}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 dark:text-white transition-colors"
                    placeholder="e.g., 50000"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Maximum Salary</label>
                  <input
                    type="number"
                    name="salaryMax"
                    value={formData.salaryMax}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white dark:bg-slate-800 text-gray-900 dark:text-white transition-colors ${
                      errors.salaryMax ? 'border-red-500' : 'border-gray-300 dark:border-slate-700'
                    }`}
                    placeholder="e.g., 80000"
                  />
                  {errors.salaryMax && <p className="text-red-500 dark:text-red-400 text-sm mt-1">{errors.salaryMax}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Experience Level</label>
                  <select
                    name="experience"
                    value={formData.experience}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 dark:text-white transition-colors"
                  >
                    <option value="ENTRY">Entry Level</option>
                    <option value="MID">Mid-Level</option>
                    <option value="SENIOR">Senior</option>
                    <option value="EXECUTIVE">Lead/Executive</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Number of Positions</label>
                  <input
                    type="number"
                    name="positions"
                    value={formData.positions}
                    onChange={handleChange}
                    min="1"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 dark:text-white transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Application Deadline</label>
                  <input
                    type="date"
                    name="deadline"
                    value={formData.deadline}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 dark:text-white transition-colors"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Required Skills *</label>
                <input
                  type="text"
                  name="skills"
                  value={formData.skills}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white dark:bg-slate-800 text-gray-900 dark:text-white transition-colors ${
                    errors.skills ? 'border-red-500' : 'border-gray-300 dark:border-slate-700'
                  }`}
                  placeholder="e.g., React, Node.js, TypeScript (comma-separated)"
                />
                {errors.skills && <p className="text-red-500 dark:text-red-400 text-sm mt-1">{errors.skills}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Job Description *</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={6}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white dark:bg-slate-800 text-gray-900 dark:text-white transition-colors ${
                    errors.description ? 'border-red-500' : 'border-gray-300 dark:border-slate-700'
                  }`}
                  placeholder="Provide a detailed description of the role, responsibilities, and requirements..."
                />
                {errors.description && <p className="text-red-500 dark:text-red-400 text-sm mt-1">{errors.description}</p>}
              </div>
              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-purple-600 text-white px-8 py-3 rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? (isEditing ? 'Updating...' : 'Posting...') : (isEditing ? 'Update Job' : 'Post Job')}
                </button>
                <Link
                  href="/employer/dashboard"
                  className="bg-gray-200 dark:bg-slate-800 text-gray-800 dark:text-gray-200 px-8 py-3 rounded-lg hover:bg-gray-300 dark:hover:bg-slate-700 text-center transition-colors"
                >
                  Cancel
                </Link>
              </div>
            </form>
          )}
        </div>
      </main>
    </div>
  );
}
