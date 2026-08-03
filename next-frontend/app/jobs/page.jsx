'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { getSession, isLoggedIn } from '@/lib/auth';
import api from '@/lib/api';

// Professional SVG Icons
const IconSearch = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>;
const IconMapPin = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>;
const IconDollar = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>;
const IconFilter = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"/></svg>;
const IconChevronLeft = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"/></svg>;
const IconChevronRight = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/></svg>;

function JobsPageContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
    const [filters, setFilters] = useState({ location: '', skills: '', salary: '', experience: '' });
    const [selectedExperience, setSelectedExperience] = useState([]);
    const [jobs, setJobs] = useState([]);
    const [filteredJobs, setFilteredJobs] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const jobsPerPage = 8;

    useEffect(() => {
        const session = getSession();
        if (session) setUser(session);
    }, []);

    useEffect(() => {
        const fetchJobs = async () => {
            try {
                setLoading(true);
                const response = await api.get('jobs/');
                setJobs(response.data);
                setFilteredJobs(response.data);
            } catch (err) { console.error(err); } finally { setLoading(false); }
        };
        fetchJobs();
    }, []);

    useEffect(() => {
        const filtered = jobs.filter(job => {
            const search = searchTerm.toLowerCase();
            const matchesSearch = job.title.toLowerCase().includes(search) ||
                                (job.company?.toLowerCase().includes(search)) ||
                                (job.required_skills?.some(s => s.toLowerCase().includes(search)));
            const matchesLocation = !filters.location || job.location?.toLowerCase().includes(filters.location.toLowerCase());
            const matchesExperience = selectedExperience.length === 0 || selectedExperience.some(level => {
                const jobLevel = (job.experience_level || '').toLowerCase();
                const filterLevel = level.toLowerCase();
                return jobLevel.includes(filterLevel.split(' ')[0]) || filterLevel.includes(jobLevel.split(' ')[0]);
            });
            return matchesSearch && matchesLocation && matchesExperience;
        });
        setFilteredJobs(filtered);
        setCurrentPage(1);
    }, [searchTerm, filters, selectedExperience, jobs]);

    const indexOfLastJob = currentPage * jobsPerPage;
    const indexOfFirstJob = indexOfLastJob - jobsPerPage;
    const currentJobs = filteredJobs.slice(indexOfFirstJob, indexOfLastJob);
    const totalPages = Math.ceil(filteredJobs.length / jobsPerPage);

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-all font-sans selection:bg-blue-100">
            {/* Nav Header */}
            <header className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50 transition-colors">
                <div className="max-w-7xl mx-auto px-6 h-16 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-black">S</div>
                        <span className="font-black text-gray-900 dark:text-gray-100 uppercase tracking-tight">SkillMatch</span>
                    </div>
                    {user ? (
                        <Link href="/dashboard" className="text-xs font-black text-blue-600 hover:text-blue-700 tracking-widest uppercase">Dashboard</Link>
                    ) : (
                        <Link href="/login" className="text-xs font-black bg-gray-900 dark:bg-gray-700 text-white dark:text-gray-200 px-6 py-2 rounded-xl tracking-widest uppercase">Sign In</Link>
                    )}
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-6 py-12 space-y-12">
                {/* Search Bar Section */}
                <section className="text-center space-y-8 animate-in fade-in duration-700">
                    <h1 className="text-5xl font-black text-gray-900 dark:text-gray-100 tracking-tighter uppercase max-w-2xl mx-auto leading-none">Find your next defining opportunity.</h1>
                    <div className="max-w-3xl mx-auto bg-white dark:bg-gray-800 p-2 rounded-[2rem] shadow-2xl shadow-blue-500/5 border border-gray-200 dark:border-gray-700 flex flex-col md:flex-row gap-2 transition-all focus-within:shadow-blue-500/10">
                        <div className="flex-1 flex items-center px-6 gap-3">
                            <span className="text-gray-500"><IconSearch /></span>
                            <input 
                                type="text" 
                                placeholder="Search by title, company, or tech stack..." 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full bg-transparent border-none focus:ring-0 text-sm font-bold text-gray-900 dark:text-gray-100 placeholder:text-gray-500"
                            />
                        </div>
                        <div className="w-px bg-gray-200 dark:bg-gray-700 hidden md:block my-3"></div>
                        <div className="flex-1 flex items-center px-6 gap-3">
                            <span className="text-gray-500"><IconMapPin /></span>
                            <input 
                                type="text" 
                                placeholder="Anywhere" 
                                value={filters.location}
                                onChange={(e) => setFilters({...filters, location: e.target.value})}
                                className="w-full bg-transparent border-none focus:ring-0 text-sm font-bold text-gray-900 dark:text-gray-100 placeholder:text-gray-500"
                            />
                        </div>
                        <button className="bg-blue-600 hover:bg-blue-700 text-white px-10 py-4 rounded-[1.5rem] font-black uppercase tracking-widest transition-all shadow-xl shadow-blue-500/20 active:scale-95">Discover</button>
                    </div>
                </section>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
                    {/* Filters Sidebar */}
                    <aside className="lg:col-span-1 space-y-8 hidden lg:block animate-in slide-in-from-left-4 duration-700">
                        <section className="bg-white dark:bg-gray-800 p-8 rounded-[2.5rem] border border-gray-200 dark:border-gray-700 shadow-sm space-y-8">
                            <div className="flex items-center gap-2 mb-2">
                                <IconFilter />
                                <h2 className="text-xs font-black text-gray-900 dark:text-gray-100 uppercase tracking-widest">Filter results</h2>
                            </div>
                            
                            <div className="space-y-4">
                                <p className="text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest">Experience</p>
                                {['Entry Level', 'Mid-Level', 'Senior', 'Lead'].map(level => (
                                    <label key={level} className="flex items-center gap-3 cursor-pointer group">
                                        <input 
                                            type="checkbox" 
                                            className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500"
                                            checked={selectedExperience.includes(level)}
                                            onChange={(e) => {
                                                if (e.target.checked) {
                                                    setSelectedExperience([...selectedExperience, level]);
                                                } else {
                                                    setSelectedExperience(selectedExperience.filter(l => l !== level));
                                                }
                                            }}
                                        />
                                        <span className="text-xs font-bold text-gray-600 dark:text-gray-400 group-hover:text-blue-600 transition-colors uppercase">{level}</span>
                                    </label>
                                ))}
                            </div>
                        </section>
                    </aside>

                    {/* Jobs Grid */}
                    <div className="lg:col-span-3 space-y-8">
                        <div className="flex justify-between items-center text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest px-2">
                            <span>Showing {filteredJobs.length} listings</span>
                            <div className="flex items-center gap-4">
                                <span>Sorted by Relevance</span>
                            </div>
                        </div>

                        {loading ? (
                           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                             {[...Array(4)].map((_, i) => <div key={i} className="h-64 bg-white dark:bg-gray-800 rounded-[2.5rem] animate-pulse"></div>)}
                           </div>
                        ) : (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in duration-1000">
                            {currentJobs.map(job => (
                                <Link key={job.id} href={`/jobs/${job.id}`} className="bg-white dark:bg-gray-800 p-8 rounded-[2.5rem] border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 group flex flex-col justify-between">
                                    <div>
                                        <div className="flex justify-between items-start mb-6">
                                            <div className="w-12 h-12 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center font-black text-gray-400 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-inner uppercase">
                                                {(job.company || job.created_by || 'C').slice(0,1)}
                                            </div>
                                            <span className="text-[9px] font-black px-2 py-1 bg-green-100 text-green-600 rounded-lg border border-green-200 uppercase tracking-widest italic animate-pulse">NEW</span>
                                        </div>
                                        <h3 className="text-lg font-black text-gray-900 dark:text-gray-100 uppercase tracking-tight mb-1 group-hover:text-blue-600 transition-colors line-clamp-1">{job.title}</h3>
                                        <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-6">{job.company || job.created_by}</p>
                                        
                                        <div className="flex flex-wrap gap-2 mb-8">
                                            {(job.required_skills || []).slice(0, 3).map(s => (
                                              <span key={s} className="text-[8px] font-black px-3 py-1 rounded-full bg-blue-100 text-blue-600 border border-blue-200 uppercase tracking-widest">{s}</span>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="flex justify-between items-center pt-6 border-t border-gray-200 dark:border-gray-700">
                                        <div className="flex items-center gap-3 text-gray-500 dark:text-gray-400 font-bold text-[10px] uppercase">
                                            <span className="flex items-center gap-1"><IconMapPin /> {job.location || 'Remote'}</span>
                                            <span className="flex items-center gap-1"><IconDollar /> {job.salary || 'Comp'}</span>
                                        </div>
                                        <span className="text-blue-600 hover:text-blue-700 font-black text-[10px] uppercase tracking-widest group-hover:translate-x-2 transition-transform">Details →</span>
                                    </div>
                                </Link>
                            ))}
                            {filteredJobs.length === 0 && <div className="col-span-full py-40 text-center text-gray-500 dark:text-gray-400 font-black uppercase tracking-widest italic opacity-50">No opportunities match your search.</div>}
                          </div>
                        )}

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex justify-center gap-3 mt-12">
                                <button onClick={() => setCurrentPage(c => Math.max(1, c-1))} className="p-4 rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm text-gray-500 dark:text-gray-400 hover:text-blue-600 transition-all"><IconChevronLeft /></button>
                                {[...Array(totalPages)].map((_, i) => (
                                    <button key={i} onClick={() => setCurrentPage(i+1)} className={`w-12 h-12 rounded-2xl font-black text-xs transition-all ${currentPage === i+1 ? 'bg-blue-600 text-white shadow-xl shadow-blue-500/30' : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:text-blue-600 shadow-sm'}`}>{i+1}</button>
                                ))}
                                <button onClick={() => setCurrentPage(c => Math.min(totalPages, c+1))} className="p-4 rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm text-gray-500 dark:text-gray-400 hover:text-blue-600 transition-all"><IconChevronRight /></button>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}

export default function JobsPage() {
    return (
        <Suspense fallback={<div className="flex min-h-screen items-center justify-center font-black uppercase tracking-widest text-gray-500 dark:text-gray-400 animate-pulse">Initializing Marketplace...</div>}>
            <JobsPageContent />
        </Suspense>
    );
}
