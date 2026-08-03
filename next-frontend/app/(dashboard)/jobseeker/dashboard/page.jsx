'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';

// Professional SVG Icons (Inline for zero dependencies)
const IconExternalLink = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>;
const IconLocation = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;
const IconBriefcase = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>;
const IconCheck = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>;
const IconTrash = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>;
const IconJobs = () => <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>;
const IconBell = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>;

export default function JobseekerDashboard() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [jobs, setJobs] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [appliedJobs, setAppliedJobs] = useState([]);
  const [savedJobs, setSavedJobs] = useState([]);
  const [skills, setSkills] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [newSkill, setNewSkill] = useState('');
  const [user, setUser] = useState(null);
  const [loadingJobs, setLoadingJobs] = useState(false);
  const [loadingRecs, setLoadingRecs] = useState(false);
  const [loadingApplications, setLoadingApplications] = useState(false);
  const [loadingInsights, setLoadingInsights] = useState(false);
  const [skillInsight, setSkillInsight] = useState(null);
  const [jobsError, setJobsError] = useState(null);
  const [recsError, setRecsError] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [profilePicture, setProfilePicture] = useState(null);
  const [uploadingPicture, setUploadingPicture] = useState(false);
  const router = useRouter();

  // Initialize data
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('user');
      if (stored) setUser(JSON.parse(stored));

      const saved = localStorage.getItem('savedJobs');
      if (saved) setSavedJobs(JSON.parse(saved));
    }
  }, []);

  // Fetch functions (as defined previously)
  const fetchJobs = useCallback(async () => {
    try { setLoadingJobs(true); const res = await api.get('jobs/'); setJobs(res.data); }
    catch (err) { setJobsError('Failed to load jobs.'); } finally { setLoadingJobs(false); }
  }, []);

  const fetchRecommendations = useCallback(async () => {
    try {
      setLoadingRecs(true);
      const res = await api.get('ai-matching/recommendations/');
      console.log('[DEBUG] Recommendations response:', res.data);
      setRecommendations(res.data);
    }
    catch (err) {
      console.error('Recommendations fetch error:', err);
      setRecsError('Failed to load recommendations.');
    } finally {
      setLoadingRecs(false);
    }
  }, []);

  const fetchApplications = useCallback(async () => {
    try {
      setLoadingApplications(true);
      const res = await api.get('applications/my-applications/');
      const mapped = res.data.map(app => ({
        id: app.id,
        jobId: app.job.id,
        title: app.job.title,
        company: app.job.company || app.job.created_by?.email || 'Unknown',
        location: app.job.location,
        status: app.status,
        dateApplied: app.applied_at,
        interview_date: app.interview_date,
        interview_time: app.interview_time,
        interview_link: app.interview_link,
        interview_notes: app.interview_notes,
      }));
      setAppliedJobs(mapped);
    } finally { setLoadingApplications(false); }
  }, []);

  const fetchSkills = useCallback(async () => {
    try {
      const res = await api.get('auth/user/');
      setSkills(res.data.profile?.skills || []);
      if (res.data.jobseeker_profile?.profile_picture_url) {
        setProfilePicture(res.data.jobseeker_profile.profile_picture_url);
      }
    } catch (err) { }
  }, []);

  const fetchInsights = useCallback(async () => {
    try {
      setLoadingInsights(true);
      const res = await api.get('profile/skill-insights/');
      console.log('[DEBUG] Insights response:', res.data);
      setSkillInsight(res.data);
    }
    catch (err) {
      console.error('Insights fetch error:', err);
    } finally {
      setLoadingInsights(false);
    }
  }, []);

  const fetchNotifications = useCallback(async () => {
    try { const res = await api.get('notifications/'); setNotifications(res.data); } catch (err) { }
  }, []);

  const handleProfilePictureUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB');
      return;
    }

    if (!file.type.startsWith('image/')) {
      alert('Only image files are allowed');
      return;
    }

    setUploadingPicture(true);
    const formData = new FormData();
    formData.append('profile_picture', file);

    try {
      const res = await api.put('profile/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setProfilePicture(res.data.profile?.profile_picture_url || res.data.jobseeker_profile?.profile_picture_url);
      alert('Profile picture updated successfully');
    } catch (err) {
      console.error('Profile picture upload error:', err);
      alert('Failed to upload profile picture');
    } finally {
      setUploadingPicture(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchJobs();
      fetchRecommendations();
      fetchApplications();
      fetchSkills();
      fetchInsights();
      fetchNotifications();
    }
  }, [user, fetchJobs, fetchRecommendations, fetchApplications, fetchSkills, fetchInsights, fetchNotifications]);

  // Tab management via Hash
  useEffect(() => {
    const handleHash = () => setActiveTab(window.location.hash.slice(1) || 'dashboard');
    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  const addSkill = async (skillToAdd = newSkill) => {
    const trimmed = typeof skillToAdd === 'string' ? skillToAdd.trim() : '';
    if (!trimmed || skills.includes(trimmed)) return;
    try {
      const updated = [...skills, trimmed];
      await api.put('profile/', { skills: updated });
      setSkills(updated);
      setNewSkill('');
      fetchInsights();
    } catch (err) { console.error(err); }
  };

  const removeSkill = async (skillToRemove) => {
    try {
      const updated = skills.filter(s => s !== skillToRemove);
      await api.put('profile/', { skills: updated });
      setSkills(updated);
      fetchInsights();
    } catch (err) { console.error(err); }
  };

  const handleApply = async (job) => {
    if (appliedJobs.some(aj => String(aj.jobId) === String(job.id))) {
      alert("You have already applied."); return;
    }
    try {
      await api.post(`applications/apply/${job.id}/`);
      fetchApplications();
      alert(`Applied for ${job.title}!`);
    } catch (err) { alert("Failed to apply."); }
  };

  const getStatusStyle = (status) => {
    const s = status.toLowerCase();
    if (s.includes('accepted')) return 'bg-green-100 text-green-700';
    if (s.includes('rejected')) return 'bg-red-100 text-red-700';
    if (s.includes('shortlisted')) return 'bg-emerald-100 text-emerald-700';
    if (s.includes('interview')) return 'bg-purple-100 text-purple-700';
    if (s.includes('pending') || s.includes('applied')) return 'bg-blue-100 text-blue-700';
    return 'bg-yellow-100 text-yellow-700';
  };

  const initials = (name) => (name || 'U').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  if (!user) return null;

  return (
    <div className="space-y-8 pb-12">

      {/* ──────────────── DASHBOARD TAB ──────────────── */}
      {activeTab === 'dashboard' && (
        <div className="space-y-8 animate-in fade-in duration-500">
          <header>
            <h1 className="text-3xl font-black text-gray-900 dark:text-gray-100 tracking-tight leading-tight">
              Dashboard Overview
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1 font-medium">Tracking your progress and top opportunities.</p>
          </header>

          {/* Stats Bar */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { label: 'Job Matches', value: recommendations.length, color: 'blue', desc: 'Personalized for you' },
              { label: 'Applications', value: appliedJobs.length, color: 'indigo', desc: 'Active submissions' },
              { label: 'Interviews', value: appliedJobs.filter(a => a.status.toLowerCase().includes('interview')).length, color: 'purple', desc: 'Upcoming calls' },
              { label: 'Shortlisted', value: appliedJobs.filter(a => a.status.toLowerCase().includes('shortlisted')).length, color: 'emerald', desc: 'In consideration' },
            ].map((s) => (
              <div key={s.label} className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-xl transition-all duration-300 group">
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 rounded-2xl bg-${s.color}-500/10 flex items-center justify-center text-${s.color}-600`}>
                    <IconBriefcase />
                  </div>
                  <span className="text-2xl font-black text-gray-900 dark:text-gray-100 group-hover:scale-110 transition-transform">{s.value}</span>
                </div>
                <p className="text-sm font-bold text-gray-900 dark:text-gray-100 uppercase tracking-wider">{s.label}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 font-medium mt-1">{s.desc}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* AI Insights & Profile Card */}
            <div className="lg:col-span-2 space-y-8">
              <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20 group-hover:bg-white/20 transition-all"></div>
                <div className="relative z-10 flex flex-col md:flex-row gap-8 items-center">
                  <div className="relative group">
                    <div className="w-24 h-24 rounded-3xl bg-white/20 backdrop-blur-xl flex items-center justify-center text-3xl font-black border border-white/30 overflow-hidden shadow-lg">
                      {profilePicture || user?.profileImage ? (
                        <img src={profilePicture || user.profileImage} className="w-full h-full object-cover" alt="Profile" />
                      ) : (
                        initials(user?.fullName || user?.name || user?.email || 'U')
                      )}
                    </div>
                    <label className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer rounded-3xl">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleProfilePictureUpload}
                        className="hidden"
                        disabled={uploadingPicture}
                      />
                      <span className="text-white text-xs font-black">{uploadingPicture ? 'UPLOADING...' : 'CHANGE'}</span>
                    </label>
                  </div>
                  <div className="flex-1 text-center md:text-left">
                    <h2 className="text-2xl font-black mb-2 uppercase tracking-wide">Market Readiness</h2>
                    <p className="text-blue-100/90 text-sm font-medium leading-relaxed mb-6 max-w-lg">
                      {skillInsight?.top_skills?.length > 0
                        ? `Your expertise in ${skillInsight.top_skills.join(', ')} is currently in high demand with ${skillInsight.demand_count} active listings.`
                        : "Complete your skill profile to unlock deep market insights and personalized coaching tip."}
                    </p>
                    <div className="space-y-3">
                      <div className="flex justify-between text-xs font-black uppercase tracking-widest text-blue-200">
                        <span>Profile completion</span>
                        <span>87%</span>
                      </div>
                      <div className="h-2.5 bg-white/10 rounded-full overflow-hidden border border-white/5 shadow-inner">
                        <div className="h-full bg-white rounded-full w-[87%] shadow-[0_0_15px_rgba(255,255,255,0.5)] transition-all duration-[2000ms]"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Top Recommendations */}
              <section className="bg-white dark:bg-gray-800 rounded-[2.5rem] border border-gray-200 dark:border-gray-700 p-8 shadow-sm transition-colors">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-xl font-black text-gray-900 dark:text-gray-100 uppercase tracking-wider">Top Match Predictions</h2>
                  <button onClick={() => window.location.hash = 'jobs'} className="text-xs font-black text-blue-600 hover:text-blue-700 hover:underline">BROWSE ALL</button>
                </div>

                <div className="space-y-4">
                  {loadingRecs ? (
                    <div className="flex items-center justify-center py-10"><div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div></div>
                  ) : recommendations.slice(0, 3).map((rec) => {
                    const job = rec.job;
                    const score = Math.floor(rec.score || rec.final_score || rec.similarity_score || 0);
                    return (
                      <div key={job.id} onClick={() => router.push(`/jobs/${job.id}`)} className="flex items-center justify-between p-5 rounded-2xl border border-gray-200 dark:border-gray-700 hover:border-blue-500/20 dark:hover:border-blue-500/20 hover:bg-blue-50/30 dark:hover:bg-blue-900/10 transition-all group cursor-pointer">
                        <div className="flex items-center gap-4 overflow-hidden">
                          <div className="w-12 h-12 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center font-bold text-gray-400 group-hover:bg-blue-600 group-hover:text-white transition-all">
                            {initials(job.company || job.created_by)}
                          </div>
                          <div className="overflow-hidden">
                            <p className="font-black text-gray-900 dark:text-gray-100 text-sm truncate uppercase tracking-tight">{job.title}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate font-medium">{job.company || job.created_by} · {job.location}</p>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <span className="text-[10px] font-black text-green-600 p-1.5 rounded-lg bg-green-100 tracking-tighter shadow-sm border border-green-200">{score}% MATCH</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            </div>

            {/* Side Column: Notifications & Active Applied */}
            <div className="space-y-8">
              <section className="bg-white dark:bg-gray-800 rounded-[2.5rem] border border-gray-200 dark:border-gray-700 p-8 shadow-sm h-fit">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-sm font-black text-gray-900 dark:text-gray-100 uppercase tracking-widest">Recent Activity</h2>
                </div>
                <div className="space-y-5">
                  {notifications.slice(0, 4).map(n => (
                    <div key={n.id} className="flex gap-4">
                      <div className={`mt-1 w-2 h-2 rounded-full shrink-0 ${n.is_read ? 'bg-gray-300' : 'bg-blue-600 shadow-[0_0_8px_rgba(37,99,235,0.6)]'}`}></div>
                      <div className="space-y-1">
                        <p className={`text-xs leading-relaxed font-bold ${n.is_read ? 'text-gray-500 dark:text-gray-400' : 'text-gray-900 dark:text-gray-100'}`}>{n.message}</p>
                        <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 tracking-wider">JUST NOW</p>
                      </div>
                    </div>
                  ))}
                  {notifications.length === 0 && <p className="text-xs text-gray-500 dark:text-gray-400 italic text-center font-medium">Quiet for now...</p>}
                </div>
              </section>

              <section className="bg-gray-900 rounded-[2.5rem] p-8 text-white shadow-xl overflow-hidden relative">
                <div className="absolute bottom-0 right-0 p-8 opacity-20"><IconBriefcase /></div>
                <h2 className="text-sm font-black uppercase tracking-widest mb-6 text-blue-400">Application Radar</h2>
                <div className="space-y-4">
                  {appliedJobs.slice(0, 2).map(app => (
                    <div key={app.id} className="p-4 rounded-3xl bg-white/5 border border-white/5 flex flex-col gap-2 transition-transform hover:scale-105 active:scale-95 cursor-pointer" onClick={() => window.location.hash = 'applied'}>
                      <p className="text-xs font-black truncate uppercase tracking-tight">{app.title}</p>
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{app.company}</span>
                        <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-blue-600 text-white truncate max-w-[80px]">{app.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          </div>
        </div>
      )}

      {/* ──────────────── SKILLS TAB ──────────────── */}
      {activeTab === 'skills' && (
        <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <header>
            <h1 className="text-3xl font-black text-gray-900 dark:text-gray-100 tracking-tight uppercase">Skill Management</h1>
            <p className="text-gray-500 dark:text-gray-400 font-medium">Optimize your profile to catch the attention of top employers.</p>
          </header>

          <div className="bg-white dark:bg-gray-800 rounded-[3rem] border border-gray-200 dark:border-gray-700 p-10 shadow-sm space-y-12 transition-colors">
            <div className="space-y-6">
              <h2 className="text-xs font-black text-gray-400 uppercase tracking-[0.3em]">Add expertise</h2>
              <div className="flex gap-4">
                <input
                  type="text"
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addSkill()}
                  placeholder="e.g. Next.js, Cloud Architecture..."
                  className="flex-1 bg-gray-50 dark:bg-gray-800 border-2 border-gray-50 dark:border-gray-700 rounded-[1.5rem] px-8 py-5 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 transition-all text-gray-900 dark:text-white shadow-inner"
                />
                <button
                  onClick={() => addSkill()}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-12 py-5 rounded-[1.5rem] text-sm font-black uppercase tracking-widest transition-all shadow-xl shadow-blue-500/20 active:scale-95"
                >
                  ADD
                </button>
              </div>
            </div>

            <div className="space-y-6">
              <h2 className="text-xs font-black text-gray-400 uppercase tracking-[0.3em]">Your Arsenal ({skills.length})</h2>
              <div className="flex flex-wrap gap-4">
                {skills.map((skill) => (
                  <div key={skill} className="flex items-center gap-3 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-xs px-6 py-3 rounded-full border border-blue-100/50 dark:border-blue-800/50 font-black tracking-wide group shadow-sm transition-transform hover:scale-105 active:scale-95">
                    {skill}
                    <button onClick={() => removeSkill(skill)} className="text-blue-300 hover:text-red-500 group-hover:block transition-all focus:outline-none"><IconTrash /></button>
                  </div>
                ))}
                {skills.length === 0 && <p className="text-gray-400 font-bold italic">No skills listed yet...</p>}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ──────────────── JOB RECOMMENDATIONS TAB ──────────────── */}
      {activeTab === 'jobs' && (
        <div className="space-y-8 animate-in fade-in duration-500">
          <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight uppercase">Job Recommendations</h1>
              <p className="text-gray-500 font-medium">Curated opportunities matching your unique talent profile.</p>
            </div>
          </header>

          {recsError ? (
            <div className="bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 p-12 rounded-[2.5rem] text-center space-y-4">
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
              </div>
              <p className="text-red-900 dark:text-red-200 font-black uppercase tracking-tight text-lg">{recsError}</p>
              <p className="text-red-600/70 dark:text-red-400 font-medium max-w-sm mx-auto">We couldn't connect to our matching engine. Please verify your connection or try again shortly.</p>
              <button onClick={fetchRecommendations} className="mt-6 bg-red-600 text-white px-8 py-3 rounded-2xl text-xs font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all">Retry Synchronization</button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {loadingRecs ? (
                Array(3).fill(null).map((_, i) => <div key={i} className="bg-white dark:bg-gray-800 h-64 rounded-3xl animate-pulse"></div>)
              ) : recommendations.length > 0 ? (
                recommendations.map((rec, i) => {
                  const job = rec.job;
                  const score = Math.round(rec.score || rec.final_score || rec.similarity_score || 0);
                  const isApplied = appliedJobs.some(aj => String(aj.jobId) === String(job.id));
                  const companyName = job.company || job.created_by?.email || 'Premium Partner';

                  return (
                    <div key={job.id} className="bg-white dark:bg-gray-900 rounded-[2.5rem] p-7 border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 flex flex-col group h-full">
                      <div className="flex justify-between items-start mb-6">
                        <div className="w-14 h-14 rounded-2xl bg-gray-50 dark:bg-gray-900 flex items-center justify-center font-black text-lg text-gray-300 group-hover:bg-blue-600 group-hover:text-white group-hover:scale-110 transition-all shadow-inner border border-gray-100 dark:border-gray-800">
                          {companyName.slice(0, 1).toUpperCase()}
                        </div>
                        <div className="flex flex-col items-end">
                          <div className="text-[10px] font-black px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400 tracking-tighter border border-emerald-100 dark:border-emerald-800 transition-colors group-hover:bg-emerald-600 group-hover:text-white">{score}% MATCH</div>
                        </div>
                      </div>

                      <div className="flex-1 space-y-4">
                        <div>
                          <h3 className="text-base font-black text-gray-900 dark:text-white uppercase tracking-tight leading-tight mb-1 group-hover:text-blue-600 transition-colors">{job.title}</h3>
                          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{companyName}</p>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className={`text-[9px] font-black px-2 py-1 rounded-lg uppercase tracking-wider ${job.status === 'open' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400' :
                              job.status === 'filled' ? 'bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400' :
                                'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'
                            }`}>{job.status}</span>
                          <span className="text-[9px] font-black text-gray-400 uppercase tracking-wider">{job.filled_positions || 0} / {job.positions || 1} positions</span>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          {(job.required_skills || []).slice(0, 3).map(s => (
                            <span key={s} className="text-[9px] font-black px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border border-blue-100/50 dark:border-blue-800/20 uppercase tracking-wider">{s}</span>
                          ))}
                        </div>

                        <p className="text-xs text-gray-400 font-medium line-clamp-3 leading-relaxed">
                          {job.description || "Join a fast-growing team looking for exceptional talent to lead the next generation of products."}
                        </p>
                      </div>

                      <div className="mt-8 flex gap-3">
                        <Link href={`/jobs/${job.id}`} className="flex-1 flex items-center justify-center gap-2 text-xs font-black uppercase tracking-widest py-3.5 rounded-2xl border border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all active:scale-95">INFO</Link>
                        <button
                          onClick={() => handleApply(job)}
                          disabled={isApplied || job.status !== 'open'}
                          className={`flex-[2] text-xs font-black uppercase tracking-widest py-3.5 rounded-2xl shadow-xl transition-all active:scale-95 ${isApplied ? 'bg-emerald-500 text-white shadow-none cursor-default' :
                              job.status !== 'open' ? 'bg-gray-400 text-white shadow-none cursor-not-allowed' :
                                'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-500/20'
                            }`}
                        >
                          {isApplied ? 'APPLIED' : job.status !== 'open' ? 'CLOSED' : 'APPLY'}
                        </button>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="col-span-full py-20 text-center space-y-6 bg-white dark:bg-gray-900 rounded-[3rem] border border-dashed border-gray-200 dark:border-gray-800 transition-colors">
                  <div className="w-20 h-20 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto text-gray-300">
                    <IconJobs />
                  </div>
                  <div className="space-y-2">
                    <p className="text-gray-900 dark:text-white font-black uppercase tracking-widest text-lg">No Synergy Found Yet</p>
                    <p className="text-sm text-gray-500 max-w-md mx-auto px-6 font-medium leading-relaxed italic">
                      Our neural engine needs more data to find your perfect match.
                    </p>
                  </div>
                  <button onClick={() => setActiveTab('skills')} className="text-white bg-blue-600 px-10 py-4 rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl shadow-blue-500/20 hover:scale-105 active:scale-95 transition-all">Expand Skills Profile</button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ──────────────── APPLIED JOBS TAB ──────────────── */}
      {activeTab === 'applied' && (
        <div className="space-y-8 animate-in fade-in duration-500">
          <header>
            <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight uppercase">Application History</h1>
            <p className="text-gray-500 font-medium">Monitor your active submissions and feedback status.</p>
          </header>

          <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden transition-colors">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
                    <th className="px-8 py-5 whitespace-nowrap">Opportunity</th>
                    <th className="px-8 py-5 hidden md:table-cell">Location</th>
                    <th className="px-8 py-5">Status</th>
                    <th className="px-8 py-5">Date</th>
                    <th className="px-8 py-5 text-right w-20"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-gray-800 font-medium">
                  {appliedJobs.map(app => (
                    <tr key={app.id} className="hover:bg-blue-50/20 dark:hover:bg-blue-900/10 transition-colors group">
                      <td className="px-8 py-6">
                        <p className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-tight group-hover:text-blue-600 transition-colors">{app.title}</p>
                        <p className="text-xs text-gray-400 font-bold tracking-tight">{app.company}</p>
                      </td>
                      <td className="px-8 py-6 hidden md:table-cell">
                        <span className="text-xs text-gray-500">{app.location || 'Remote'}</span>
                      </td>
                      <td className="px-8 py-6">
                        <span className={`text-[9px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest ${getStatusStyle(app.status)}`}>
                          {app.status}
                        </span>
                        {app.status.toLowerCase().includes('interview') && app.interview_date && (
                          <div className="mt-2 text-[10px] text-gray-500 dark:text-gray-400">
                            <span className="font-semibold">Interview:</span> {new Date(app.interview_date).toLocaleDateString()}
                            {app.interview_time && ` at ${app.interview_time}`}
                            {app.interview_link && (
                              <a href={app.interview_link} target="_blank" rel="noopener noreferrer" className="ml-2 text-blue-600 hover:text-blue-700">Join →</a>
                            )}
                          </div>
                        )}
                      </td>
                      <td className="px-8 py-6 text-xs text-gray-400 font-bold whitespace-nowrap">
                        {new Date(app.dateApplied).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      </td>
                      <td className="px-8 py-6 text-right">
                        <button onClick={() => router.push(`/jobs/${app.jobId}`)} className="p-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-400 hover:text-blue-600 hover:bg-white dark:hover:bg-gray-900 shadow-sm transition-all opacity-0 group-hover:opacity-100"><IconExternalLink /></button>
                      </td>
                    </tr>
                  ))}
                  {appliedJobs.length === 0 && (
                    <tr>
                      <td colSpan="5" className="px-8 py-20 text-center text-gray-400 font-bold uppercase tracking-widest italic">No applications launched yet.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ──────────────── NOTIFICATIONS TAB ──────────────── */}
      {activeTab === 'notifications' && (
        <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
          <header className="flex justify-between items-end">
            <div>
              <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight uppercase">InBox</h1>
              <p className="text-gray-500 font-medium">Stay updated with system alerts and recruitment feedback.</p>
            </div>
            <button className="text-[10px] font-black text-blue-600 tracking-widest uppercase hover:underline">MARK ALL READ</button>
          </header>

          <div className="space-y-4">
            {notifications.map((n) => (
              <div key={n.id} className={`p-7 rounded-[2rem] border transition-all hover:scale-[1.01] flex gap-6 group cursor-pointer ${n.is_read ? 'bg-white dark:bg-gray-950 border-gray-100 dark:border-gray-800 opacity-60' : 'bg-white dark:bg-gray-900 border-blue-100 dark:border-blue-900/50 shadow-lg shadow-blue-500/5 ring-1 ring-blue-50 dark:ring-blue-900/20'}`}>
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border transition-transform group-hover:rotate-12 ${n.is_read ? 'bg-gray-100 border-gray-100 text-gray-400' : 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-500/30'}`}>
                  {n.type === 'application' ? <IconBriefcase /> : <IconBell />}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className={`text-base font-black uppercase tracking-tight ${n.is_read ? 'text-gray-500' : 'text-gray-900 dark:text-white'}`}>{n.title}</h3>
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{new Date(n.created_at).toLocaleDateString()}</span>
                  </div>
                  <p className={`text-sm leading-relaxed font-medium ${n.is_read ? 'text-gray-400' : 'text-gray-600 dark:text-gray-300'}`}>{n.message}</p>
                </div>
              </div>
            ))}
            {notifications.length === 0 && (
              <div className="bg-white dark:bg-gray-900 p-20 rounded-[3rem] border border-dashed border-gray-200 dark:border-gray-800 text-center">
                <p className="text-gray-400 font-black uppercase tracking-[0.2em]">Zero Notifications</p>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
