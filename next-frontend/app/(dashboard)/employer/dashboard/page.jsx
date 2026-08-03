'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';

// Professional SVG Icons
const IconBriefcase = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>;
const IconUsers = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/></svg>;
const IconCheck = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/></svg>;
const IconX = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>;
const IconRefresh = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>;
const IconBell = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/></svg>;

const STATUS_COLORS = {
  pending:     'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  applied:     'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  shortlisted: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  interview:   'bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  accepted:    'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  rejected:    'bg-rose-50 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400',
  Active:      'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  Closed:      'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400',
};

export default function EmployerDashboard() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [candidates, setCandidates] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [user, setUser] = useState(null);
  const [loadingJobs, setLoadingJobs] = useState(false);
  const [loadingCandidates, setLoadingCandidates] = useState(false);
  const [updatingCandidate, setUpdatingCandidate] = useState(null);
  const [showInterviewModal, setShowInterviewModal] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [interviewDate, setInterviewDate] = useState('');
  const [interviewTime, setInterviewTime] = useState('');
  const [interviewLink, setInterviewLink] = useState('');
  const [interviewNotes, setInterviewNotes] = useState('');
  const [profilePicture, setProfilePicture] = useState(null);
  const [uploadingPicture, setUploadingPicture] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('user');
      if (stored) {
        const userData = JSON.parse(stored);
        setUser(userData);
        if (userData.employer_profile?.profile_picture_url) {
          setProfilePicture(userData.employer_profile.profile_picture_url);
        }
      }
    }
  }, []);

  const fetchJobs = useCallback(async () => {
    try { 
      setLoadingJobs(true); 
      const res = await api.get('jobs/employer/jobs/'); 
      console.log('[DEBUG] Jobs response:', res.data);
      setJobs(res.data); 
    } catch (err) { 
      console.error('[ERROR] Failed to fetch jobs:', err);
    } finally { 
      setLoadingJobs(false); 
    }
  }, []);

  const fetchCandidates = useCallback(async () => {
    try { 
      setLoadingCandidates(true); 
      const res = await api.get('applications/employer/candidates/'); 
      console.log('[DEBUG] Candidates response:', res.data);
      setCandidates(res.data); 
    } catch (err) { 
      console.error('[ERROR] Failed to fetch candidates:', err);
      alert('Failed to load candidates. Please check if you have posted any jobs.');
    } finally { 
      setLoadingCandidates(false); 
    }
  }, []);

  const fetchNotifications = useCallback(async () => {
    try { const res = await api.get('notifications/'); setNotifications(res.data); } catch (err) {}
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
      setProfilePicture(res.data.profile?.profile_picture_url || res.data.employer_profile?.profile_picture_url);
      alert('Profile picture updated successfully');
    } catch (err) {
      console.error('Profile picture upload error:', err);
      alert('Failed to upload profile picture');
    } finally {
      setUploadingPicture(false);
    }
  };

  useEffect(() => {
    if (user) { fetchJobs(); fetchCandidates(); fetchNotifications(); }
  }, [user, fetchJobs, fetchCandidates, fetchNotifications]);

  useEffect(() => {
    const handleHash = () => setActiveTab(window.location.hash.slice(1) || 'dashboard');
    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  const handleStatusUpdate = async (appId, newStatus, interviewDetails = {}) => {
    try {
      setUpdatingCandidate(appId);
      console.log(`Updating application ${appId} to ${newStatus}`, interviewDetails);
      await api.patch(`applications/${appId}/status/`, { 
        status: newStatus,
        ...interviewDetails
      });
      fetchCandidates();
    } catch (err) {
      console.error('Status update error:', err);
      alert('Update failed.'); 
    } finally { setUpdatingCandidate(null); }
  };

  const handleAcceptApplication = async (appId) => {
    try {
      setUpdatingCandidate(appId);
      console.log(`Accepting application ${appId}`);
      await api.post(`applications/${appId}/accept/`);
      fetchCandidates();
      fetchJobs();
    } catch (err) {
      console.error('Accept application error:', err);
      alert('Failed to accept application.'); 
    } finally { setUpdatingCandidate(null); }
  };

  const handleShortlist = async (appId) => {
    try {
      setUpdatingCandidate(appId);
      console.log(`Shortlisting application ${appId}`);
      await handleStatusUpdate(appId, 'shortlisted');
      fetchCandidates();
    } catch (err) {
      console.error('Shortlist error:', err);
      alert('Failed to shortlist candidate.'); 
    } finally { setUpdatingCandidate(null); }
  };

  const handleSaveInterview = async () => {
    if (!selectedCandidate) return;
    try {
      setUpdatingCandidate(selectedCandidate.id);
      await handleStatusUpdate(selectedCandidate.id, 'interview', {
        interview_date: interviewDate,
        interview_time: interviewTime,
        interview_link: interviewLink,
        interview_notes: interviewNotes,
      });
      setShowInterviewModal(false);
      setSelectedCandidate(null);
      setInterviewDate('');
      setInterviewTime('');
      setInterviewLink('');
      setInterviewNotes('');
    } catch (err) {
      console.error('Interview scheduling error:', err);
      alert('Failed to schedule interview.');
    } finally {
      setUpdatingCandidate(null);
    }
  };

  const initials = (name) => (name || 'C').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  if (!user) return null;

  return (
    <div className="space-y-8 pb-12 animate-in fade-in duration-500">
      
      {/* ──────────────── DASHBOARD TAB ──────────────── */}
      {activeTab === 'dashboard' && (
        <div className="space-y-8">
           <header className="flex items-center gap-6">
            <div className="relative group">
              <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center text-2xl font-black text-white shadow-lg overflow-hidden">
                {profilePicture || user?.profileImage ? (
                  <img src={profilePicture || user.profileImage} className="w-full h-full object-cover" alt="Profile" />
                ) : (
                  initials(user?.company_name || user?.email || 'C')
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
                <span className="text-white text-[10px] font-black">{uploadingPicture ? 'UPLOADING...' : 'CHANGE'}</span>
              </label>
            </div>
            <div>
              <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight uppercase">Talent Overview</h1>
              <p className="text-gray-500 font-medium tracking-tight">Managing your vacancies and top applicants.</p>
            </div>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { label: 'Live Vacancies', value: jobs.filter(j => j.is_active !== false).length, color: 'blue', icon: <IconBriefcase /> },
              { label: 'Total Pool', value: candidates.length, color: 'indigo', icon: <IconUsers /> },
              { label: 'Shortlisted', value: candidates.filter(c => c.status === 'shortlisted').length, color: 'emerald', icon: <IconCheck /> },
              { label: 'Closed Roles', value: jobs.filter(j => j.is_active === false).length, color: 'gray', icon: <IconX /> },
            ].map((s) => (
              <div key={s.label} className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-xl transition-all duration-300 group">
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 rounded-2xl bg-${s.color}-500/10 flex items-center justify-center text-${s.color}-600 group-hover:scale-110 transition-transform`}>{s.icon}</div>
                  <span className="text-2xl font-black text-gray-900 dark:text-white">{s.value}</span>
                </div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{s.label}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
               <section className="bg-white dark:bg-gray-900 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 p-8 shadow-sm">
                  <div className="flex items-center justify-between mb-8">
                     <h2 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-wider">Top Talent Radar</h2>
                     <button onClick={() => window.location.hash = 'candidates'} className="text-xs font-black text-blue-600 hover:underline">VIEW ALL</button>
                  </div>
                  <div className="space-y-4">
                    {candidates.sort((a,b) => (b.match_score||0)-(a.match_score||0)).slice(0, 4).map(c => (
                      <div key={c.id} className="group flex items-center justify-between p-5 rounded-2xl border border-gray-50 dark:border-gray-800 hover:border-blue-500/20 hover:bg-blue-50/20 dark:hover:bg-blue-900/10 transition-all cursor-pointer">
                         <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold shadow-lg shadow-blue-500/20 group-hover:scale-110 transition-transform">{initials(c.name)}</div>
                            <div>
                               <p className="font-black text-gray-900 dark:text-white text-sm uppercase tracking-tight mb-0.5">{c.name}</p>
                               <p className="text-[10px] text-gray-400 font-bold tracking-wider">{c.job_title} · {c.email}</p>
                            </div>
                         </div>
                         <div className="flex items-center gap-6">
                            <span className="text-[10px] font-black text-blue-600 dark:text-blue-400 p-2 rounded-xl bg-blue-50 dark:bg-blue-900/40 border border-blue-100/50 uppercase tracking-tighter">{Math.round(c.match_score || 0)}% SCORE</span>
                            <span className={`text-[9px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest ${STATUS_COLORS[c.status]}`}>{c.status}</span>
                         </div>
                      </div>
                    ))}
                    {candidates.length === 0 && <p className="text-center py-20 text-gray-400 font-black tracking-widest opacity-30">NO APPLICANTS YET</p>}
                  </div>
               </section>
            </div>

            <div className="space-y-8">
               <section className="bg-gray-900 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-40 h-40 bg-blue-500/20 rounded-full blur-3xl -mr-10 -mt-10"></div>
                  <h2 className="text-sm font-black text-blue-400 uppercase tracking-widest mb-8">Active Postings</h2>
                  <div className="space-y-5">
                    {jobs.filter(j => j.is_active !== false).slice(0, 3).map(job => (
                       <div key={job.id} className="p-5 rounded-3xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all cursor-pointer" onClick={() => window.location.hash = 'jobs'}>
                          <p className="text-xs font-black uppercase tracking-tight mb-2 truncate">{job.title}</p>
                          <div className="flex justify-between items-center text-[10px] font-bold text-gray-400 italic">
                             <span>Posted {new Date(job.created_at).toLocaleDateString()}</span>
                             <span className="text-emerald-400 uppercase tracking-widest">ACTIVE</span>
                          </div>
                       </div>
                    ))}
                    {jobs.length === 0 && <p className="text-xs text-gray-500 font-medium">No live postings.</p>}
                  </div>
               </section>
            </div>
          </div>
        </div>
      )}

      {/* ──────────────── CANDIDATES TAB ──────────────── */}
      {activeTab === 'candidates' && (
        <div className="space-y-8 animate-in fade-in duration-500">
           <header className="flex justify-between items-end">
              <div>
                <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight uppercase">Decision Center</h1>
                <p className="text-gray-500 font-medium">Evaluate and manage your applicant pool effectively.</p>
              </div>
              <button onClick={fetchCandidates} className="p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl text-gray-500 hover:text-blue-600 shadow-sm transition-all"><IconRefresh /></button>
          </header>

          <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden transition-colors">
            {loadingCandidates ? (
              <div className="px-8 py-20 text-center text-gray-400 font-bold uppercase tracking-widest">Loading candidates...</div>
            ) : (
              <div className="overflow-x-auto">
               <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
                      <th className="px-8 py-5">Applicant</th>
                      <th className="px-8 py-5 hidden md:table-cell">Applying For</th>
                      <th className="px-8 py-5">Match Score</th>
                      <th className="px-8 py-5">Current Status</th>
                      <th className="px-8 py-5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                    {candidates.map(c => (
                      <tr key={c.id} className="hover:bg-blue-50/20 dark:hover:bg-blue-900/10 transition-colors group">
                         <td className="px-8 py-6">
                            <div className="flex items-center gap-4">
                               <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-xs font-black text-gray-400 group-hover:bg-blue-600 group-hover:text-white transition-all capitalize">{initials(c.name)}</div>
                               <div>
                                  <p className="text-sm font-black text-gray-900 dark:text-white tracking-tight leading-none mb-1">{c.name}</p>
                                  <p className="text-[11px] font-bold text-gray-400 leading-none">{c.email}</p>
                                  {c.cv_url && (
                                    <a href={c.cv_url} target="_blank" rel="noopener noreferrer" className="text-[10px] font-black text-blue-600 hover:text-blue-700 uppercase tracking-widest mt-2 hover:underline">
                                      View CV
                                    </a>
                                  )}
                               </div>
                            </div>
                         </td>
                         <td className="px-8 py-6 hidden md:table-cell">
                            <p className="text-xs font-black uppercase tracking-tight text-gray-500">{c.job_title}</p>
                         </td>
                         <td className="px-8 py-6">
                            <div className="flex flex-col gap-1.5 w-32">
                               <div className="flex justify-between text-[10px] font-black text-blue-600 tracking-tight"><span>AI Match</span><span>{Math.round(c.match_score || 0)}%</span></div>
                               <div className="h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden shadow-inner border border-gray-100 dark:border-gray-800">
                                  <div className="h-full bg-blue-600 rounded-full" style={{width: `${c.match_score || 0}%`}}></div>
                               </div>
                            </div>
                         </td>
                         <td className="px-8 py-6">
                            <span className={`text-[9px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest ${STATUS_COLORS[c.status]}`}>{c.status}</span>
                         </td>
                         <td className="px-8 py-6 text-right">
                            <div className="flex items-center justify-end gap-2">
                               {c.status === 'pending' || c.status === 'applied' ? (
                                 <>
                                   <button onClick={() => handleShortlist(c.id)} disabled={updatingCandidate === c.id} className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white transition-all shadow-sm disabled:opacity-50" title="Shortlist">
                                     <IconCheck />
                                   </button>
                                   <button onClick={() => handleAcceptApplication(c.id)} disabled={updatingCandidate === c.id} className="p-2.5 rounded-xl bg-green-50 text-green-600 hover:bg-green-600 hover:text-white transition-all shadow-sm disabled:opacity-50" title="Accept">
                                     <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/></svg>
                                   </button>
                                   <button onClick={() => handleScheduleInterview(c)} disabled={updatingCandidate === c.id} className="p-2.5 rounded-xl bg-purple-50 text-purple-600 hover:bg-purple-600 hover:text-white transition-all shadow-sm disabled:opacity-50" title="Schedule Interview">
                                     <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                                   </button>
                                   <button onClick={() => handleStatusUpdate(c.id, 'rejected')} disabled={updatingCandidate === c.id} className="p-2.5 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white transition-all shadow-sm disabled:opacity-50"><IconX /></button>
                                 </>
                               ) : c.status === 'shortlisted' ? (
                                 <>
                                   <button onClick={() => handleScheduleInterview(c)} disabled={updatingCandidate === c.id} className="p-2.5 rounded-xl bg-purple-50 text-purple-600 hover:bg-purple-600 hover:text-white transition-all shadow-sm disabled:opacity-50" title="Schedule Interview">
                                     <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                                   </button>
                                   <button onClick={() => handleAcceptApplication(c.id)} disabled={updatingCandidate === c.id} className="p-2.5 rounded-xl bg-green-50 text-green-600 hover:bg-green-600 hover:text-white transition-all shadow-sm disabled:opacity-50"><IconCheck /></button>
                                   <button onClick={() => handleStatusUpdate(c.id, 'rejected')} disabled={updatingCandidate === c.id} className="p-2.5 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white transition-all shadow-sm disabled:opacity-50"><IconX /></button>
                                 </>
                               ) : c.status === 'interview' ? (
                                 <>
                                   <button onClick={() => handleScheduleInterview(c)} disabled={updatingCandidate === c.id} className="p-2.5 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-all shadow-sm disabled:opacity-50" title="Edit Interview">
                                     <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                                   </button>
                                   <button onClick={() => handleAcceptApplication(c.id)} disabled={updatingCandidate === c.id} className="p-2.5 rounded-xl bg-green-50 text-green-600 hover:bg-green-600 hover:text-white transition-all shadow-sm disabled:opacity-50"><IconCheck /></button>
                                   <button onClick={() => handleStatusUpdate(c.id, 'rejected')} disabled={updatingCandidate === c.id} className="p-2.5 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white transition-all shadow-sm disabled:opacity-50"><IconX /></button>
                                 </>
                               ) : (
                                 <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest py-2 px-4 italic">{c.status}</span>
                               )}
                            </div>
                         </td>
                      </tr>
                    ))}
                    {candidates.length === 0 && (
                      <tr><td colSpan="5" className="px-8 py-20 text-center text-gray-400 font-bold uppercase tracking-widest italic">Zero talent in pool.</td></tr>
                    )}
                  </tbody>
               </table>
            </div>
            )}
          </div>
        </div>
      )}

      {/* ──────────────── JOB POSTINGS TAB ──────────────── */}
      {activeTab === 'jobs' && (
        <div className="space-y-8 animate-in fade-in duration-500">
           <header className="flex justify-between items-end">
              <div>
                <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight uppercase">Job Management</h1>
                <p className="text-gray-500 font-medium">Control your active market listings and visibility.</p>
              </div>
              <button onClick={() => router.push('/employer/post-job')} className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-black uppercase tracking-widest px-8 py-4 rounded-2xl shadow-xl shadow-blue-500/20 active:scale-95">NEW POSITION</button>
          </header>

          <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden transition-colors">
             <table className="w-full text-left">
                <thead>
                   <tr className="bg-gray-50 dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
                      <th className="px-8 py-5">Position</th>
                      <th className="px-8 py-5 hidden sm:table-cell">Region</th>
                      <th className="px-8 py-5 hidden md:table-cell">Launched</th>
                      <th className="px-8 py-5">Status</th>
                      <th className="px-8 py-5 text-right w-20"></th>
                   </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                   {jobs.map(job => (
                      <tr key={job.id} className="hover:bg-blue-50/20 transition-colors group">
                         <td className="px-8 py-6 font-black text-sm text-gray-900 dark:text-white uppercase tracking-tight leading-none group-hover:text-blue-600 transition-colors">{job.title}</td>
                         <td className="px-8 py-6 text-xs text-gray-400 font-bold hidden sm:table-cell">{job.location || 'Remote'}</td>
                         <td className="px-8 py-6 text-xs text-gray-400 font-bold hidden md:table-cell">{new Date(job.created_at).toLocaleDateString()}</td>
                         <td className="px-8 py-6">
                            <div className="flex flex-col gap-1">
                              <span className={`text-[9px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest ${
                                job.status === 'open' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                                job.status === 'filled' ? 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                                'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'
                              }`}>
                                {job.status}
                              </span>
                              <span className="text-[8px] font-black text-gray-400 uppercase tracking-wider">{job.filled_positions || 0} / {job.positions || 1}</span>
                            </div>
                         </td>
                         <td className="px-8 py-6 text-right opacity-0 group-hover:opacity-100 transition-opacity">
                            <div className="flex items-center justify-end gap-2">
                              <button onClick={() => router.push(`/employer/post-job?id=${job.id}`)} className="text-gray-400 hover:text-blue-600 font-black text-xs uppercase tracking-widest">EDIT</button>
                              {job.status === 'open' && (
                                <button onClick={() => handleCloseJob(job.id)} className="text-gray-400 hover:text-red-600 font-black text-xs uppercase tracking-widest">CLOSE</button>
                              )}
                            </div>
                         </td>
                      </tr>
                   ))}
                </tbody>
             </table>
          </div>
        </div>
      )}

      {/* ──────────────── NOTIFICATIONS TAB ──────────────── */}
      {activeTab === 'notifications' && (
        <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
           <header>
              <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight uppercase">Employer Inbox</h1>
              <p className="text-gray-500 font-medium">Notifications about new applicants and system updates.</p>
           </header>

           <div className="space-y-4">
              {notifications.map((n) => (
                <div key={n.id} className={`p-7 rounded-[2rem] border transition-all hover:scale-[1.01] flex gap-6 group cursor-pointer ${n.is_read ? 'bg-white dark:bg-gray-950 border-gray-100 dark:border-gray-800 opacity-60' : 'bg-white dark:bg-gray-900 shadow-xl shadow-blue-500/5 border-blue-500/30 ring-1 ring-blue-50 dark:ring-blue-900/20'}`}>
                   <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-lg border transition-transform group-hover:rotate-12 ${n.is_read ? 'bg-gray-100 border-gray-100 text-gray-400' : 'bg-blue-600 border-blue-600 text-white shadow-blue-500/40'}`}>
                      {n.type === 'application' ? <IconUsers /> : <IconBell />}
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

      {/* Interview Modal */}
      {showInterviewModal && selectedCandidate && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-4">
            <h2 className="text-xl font-black text-gray-900 dark:text-gray-100 uppercase tracking-wider">Schedule Interview</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">Candidate: {selectedCandidate.name}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Position: {selectedCandidate.job_title}</p>
            
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Interview Date</label>
                <input
                  type="date"
                  value={interviewDate}
                  onChange={(e) => setInterviewDate(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Interview Time</label>
                <input
                  type="time"
                  value={interviewTime}
                  onChange={(e) => setInterviewTime(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Interview Link (optional)</label>
                <input
                  type="url"
                  placeholder="https://zoom.us/..."
                  value={interviewLink}
                  onChange={(e) => setInterviewLink(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Notes (optional)</label>
                <textarea
                  rows={3}
                  placeholder="Additional details..."
                  value={interviewNotes}
                  onChange={(e) => setInterviewNotes(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
              </div>
            </div>
            
            <div className="flex gap-3 pt-4">
              <button
                onClick={() => setShowInterviewModal(false)}
                className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveInterview}
                disabled={updatingCandidate === selectedCandidate.id || !interviewDate}
                className="flex-1 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {updatingCandidate === selectedCandidate.id ? 'Saving...' : 'Schedule Interview'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
