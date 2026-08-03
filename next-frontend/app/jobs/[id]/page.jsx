'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';

// Professional SVG Icons
const IconLocation = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>;
const IconDollar = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>;
const IconBriefcase = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>;
const IconClock = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>;
const IconArrowLeft = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>;
const IconCheckCircle = () => <svg className="w-6 h-6 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>;

export default function JobDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const id = params.id;
    const [job, setJob] = useState(null);
    const [loading, setLoading] = useState(true);
    const [applying, setApplying] = useState(false);
    const [hasApplied, setHasApplied] = useState(false);
    const [user, setUser] = useState(null);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const stored = localStorage.getItem('user');
            if (stored) setUser(JSON.parse(stored));
        }
    }, []);

    useEffect(() => {
        if (!id) return;
        const fetchData = async () => {
            try {
                setLoading(true);
                const stored = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
                const currentUser = stored ? JSON.parse(stored) : null;

                const [jobRes, appsRes] = await Promise.all([
                    api.get(`jobs/${id}/`),
                    currentUser?.role === 'jobseeker' ? api.get('applications/my-applications/') : Promise.resolve({ data: [] })
                ]);

                setJob(jobRes.data);

                if (appsRes.data.some(app => String(app.job.id) === String(id))) {
                    setHasApplied(true);
                }

                if (currentUser?.role === 'jobseeker') {
                    const profileRes = await api.get('auth/user/');
                    if (profileRes.data?.jobseeker_profile) {
                        const cv = profileRes.data.jobseeker_profile.cv;
                        setUser(prev => prev ? { ...prev, cv } : { ...currentUser, cv });
                    }
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);

    const handleApply = async () => {
        if (!user) { router.push('/login'); return; }
        if (user.role === 'employer') { alert('Only jobseekers can apply.'); return; }
        try {
            setApplying(true);
            await api.post(`applications/apply/${id}/`);
            setHasApplied(true);
            alert('Application submitted successfully!');
        } catch (err) { alert('Failed to apply.'); } finally { setApplying(false); }
    };

    if (loading) return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );

    if (!job) return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-8 text-center">
        <h2 className="text-2xl font-black text-gray-900 uppercase">Vacancy Expired</h2>
        <p className="text-gray-500 mt-2 mb-8">This opportunity is no longer accepting submissions.</p>
        <Link href="/jobs" className="bg-blue-600 text-white px-8 py-3 rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-blue-500/20">Find other roles</Link>
      </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-all font-sans selection:bg-blue-100">
            {/* Nav Header */}
            <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-100 dark:border-gray-800 sticky top-0 z-50 transition-colors">
                <div className="max-w-7xl mx-auto px-6 h-16 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-black">S</div>
                        <span className="font-black text-gray-900 dark:text-white uppercase tracking-tight">SkillMatch</span>
                    </div>
                    <div className="flex items-center gap-8">
                        <Link href="/jobs" className="text-xs font-black text-gray-400 hover:text-blue-600 tracking-widest uppercase transition-colors">Marketplace</Link>
                        <Link href="/login" className="text-xs font-black bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-6 py-2 rounded-xl tracking-widest uppercase transition-transform hover:scale-105">Access</Link>
                    </div>
                </div>
            </header>

            <main className="max-w-5xl mx-auto px-6 py-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <Link href="/jobs" className="inline-flex items-center gap-3 text-gray-400 hover:text-blue-600 font-black text-xs uppercase tracking-widest mb-10 transition-colors group">
                    <span className="group-hover:-translate-x-1 transition-transform"><IconArrowLeft /></span>
                    Back to marketplace
                </Link>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                    {/* Primary Info */}
                    <div className="lg:col-span-2 space-y-10">
                        <section className="bg-white dark:bg-gray-900 rounded-[3rem] p-10 border border-gray-100 dark:border-gray-800 shadow-sm space-y-8">
                            <div className="flex flex-col md:flex-row gap-8 items-start">
                                <div className="w-20 h-20 rounded-3xl bg-blue-600 flex items-center justify-center text-white font-black text-3xl shadow-2xl shadow-blue-500/30 shrink-0">
                                   {(job.company || job.created_by || 'C').slice(0,1).toUpperCase()}
                                </div>
                                <div className="flex-1">
                                    <h1 className="text-4xl font-black text-gray-900 dark:text-white tracking-tight leading-none mb-3 uppercase">{job.title}</h1>
                                    <p className="text-lg font-bold text-blue-600 uppercase tracking-wide">{job.company || job.created_by}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-6 border-t border-gray-50 dark:border-gray-800 text-gray-500 font-bold">
                                <div className="space-y-2">
                                    <p className="text-[10px] uppercase tracking-widest text-gray-400">Location</p>
                                    <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 transition-colors"><IconLocation /> {job.location || 'Remote'}</div>
                                </div>
                                <div className="space-y-2">
                                    <p className="text-[10px] uppercase tracking-widest text-gray-400">Compensation</p>
                                    <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 transition-colors"><IconDollar /> {job.salary || 'Competitive'}</div>
                                </div>
                                <div className="space-y-2">
                                    <p className="text-[10px] uppercase tracking-widest text-gray-400">Seniority</p>
                                    <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 transition-colors"><IconBriefcase /> {job.experience_level || 'Mid-Level'}</div>
                                </div>
                                <div className="space-y-2">
                                    <p className="text-[10px] uppercase tracking-widest text-gray-400">Timeline</p>
                                    <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 transition-colors"><IconClock /> {new Date(job.created_at).toLocaleDateString()}</div>
                                </div>
                            </div>
                        </section>

                        <section className="bg-white dark:bg-gray-900 rounded-[3rem] p-10 border border-gray-100 dark:border-gray-800 shadow-sm space-y-6">
                            <h2 className="text-xs font-black text-gray-900 dark:text-white uppercase tracking-[0.3em]">Position description</h2>
                            <div className="prose dark:prose-invert max-w-none">
                                <p className="text-gray-600 dark:text-gray-400 font-medium leading-[2] whitespace-pre-line text-lg">
                                    {job.description || "Join our world-class engineering team to build the future of scalable applications. We value clean code, iterative development, and a growth mindset."}
                                </p>
                            </div>
                        </section>
                    </div>

                    {/* Action Column */}
                    <div className="space-y-8">
                        <section className="bg-gray-900 rounded-[3rem] p-10 text-white shadow-2xl relative overflow-hidden group border border-white/5">
                            <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-blue-500/20 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            <h3 className="text-[10px] font-black text-blue-400 uppercase tracking-[0.2em] mb-10">Application Control</h3>

                            {hasApplied ? (
                                <div className="space-y-6">
                                    <div className="flex flex-col items-center justify-center p-8 bg-white/5 rounded-3xl border border-white/10 text-center space-y-4 shadow-inner animate-in zoom-in-95 duration-500">
                                       <IconCheckCircle />
                                       <p className="text-sm font-black uppercase tracking-tight text-white">Application Recorded</p>
                                       <p className="text-xs text-gray-400 font-medium italic">Our neural matching engine is analyzing your profile.</p>
                                    </div>
                                    <button onClick={() => router.push('/jobseeker/dashboard#applied')} className="w-full py-5 rounded-2xl bg-white text-gray-900 text-xs font-black uppercase tracking-widest shadow-xl transition-all hover:scale-[1.02] active:scale-95">Track Status</button>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    <div className="space-y-1">
                                        <p className="text-3xl font-black tracking-tighter">Apply Now</p>
                                        <p className="text-gray-400 text-xs font-bold font-medium tracking-tight">Requires a technical profile evaluation.</p>
                                    </div>
                                    {!user?.cv && <div className="text-[10px] text-rose-400 font-bold tracking-widest uppercase mb-4">⚠️ No CV uploaded. Profile metadata only.</div>}
                                    {user?.cv && <div className="text-[10px] text-emerald-400 font-bold tracking-widest uppercase mb-4 flex items-center gap-1"><IconCheckCircle /> CV will be attached automatically.</div>}
                                    <button 
                                        onClick={handleApply}
                                        disabled={applying}
                                        className="w-full py-6 rounded-[1.5rem] bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold uppercase tracking-[0.2em] shadow-xl shadow-blue-600/30 transition-all hover:-translate-y-1 active:scale-95 disabled:bg-gray-700 disabled:opacity-50"
                                    >
                                        {applying ? "Evaluated..." : "INITIATE APPLICATION"}
                                    </button>
                                </div>
                            )}
                        </section>

                        {job.required_skills && job.required_skills.length > 0 && (
                            <section className="bg-white dark:bg-gray-900 rounded-[3rem] p-10 border border-gray-100 dark:border-gray-800 shadow-sm space-y-8 h-fit transition-colors">
                                <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Required DNA</h2>
                                <div className="flex flex-wrap gap-3">
                                    {job.required_skills.map((skill, index) => (
                                        <span key={index} className="px-5 py-3 bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs font-black rounded-2xl border border-gray-100 dark:border-gray-700 uppercase tracking-tighter transition-transform hover:scale-110 active:scale-90 cursor-default">
                                            {skill}
                                        </span>
                                    ))}
                                </div>
                            </section>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
