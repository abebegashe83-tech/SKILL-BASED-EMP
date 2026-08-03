'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getNotifications } from '@/lib/api';
import ThemeToggle from '@/components/ThemeToggle';

// Professional SVG Icons
const IconDashboard = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>;
const IconUsers = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/></svg>;
const IconBriefcase = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>;
const IconBell = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/></svg>;
const IconProfile = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>;
const IconPlus = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"/></svg>;
const IconLogout = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>;
const IconSearch = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>;

const navItems = [
  { id: 'dashboard', label: 'Overview', icon: <IconDashboard /> },
  { id: 'candidates', label: 'Candidates', icon: <IconUsers /> },
  { id: 'jobs', label: 'Job Postings', icon: <IconBriefcase /> },
  { id: 'notifications', label: 'Inbox', icon: <IconBell /> },
  { id: 'profile', label: 'Company Profile', icon: <IconProfile /> },
];

const logoutUser = () => {
  localStorage.removeItem('authToken');
  localStorage.removeItem('user');
};

const getSession = () => {
  if (typeof window === 'undefined') return null;
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};

export default function EmployerLayout({ children }) {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [currentHash, setCurrentHash] = useState('');

  useEffect(() => {
    const session = getSession();
    if (session) {
      if (session.role?.toLowerCase() !== 'employer') {
        router.push(session.role?.toLowerCase() === 'jobseeker' ? '/jobseeker/dashboard' : '/login');
      } else {
        setUser(session);
      }
    } else {
      router.push('/login');
    }
  }, [router]);

  useEffect(() => {
    const handleHash = () => setCurrentHash(window.location.hash.slice(1) || 'dashboard');
    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  useEffect(() => {
    if (user) {
      getNotifications().then(res => setNotifications(res.data)).catch(err => console.error(err));
    }
  }, [user]);

  const handleLogout = () => { logoutUser(); router.push('/'); };

  const navigateToTab = (id) => {
    if (id === 'profile' || id === 'post-job') {
      router.push(`/employer/${id}`);
      return;
    }
    // If not on dashboard, go there
    if (!window.location.pathname.includes('/employer/dashboard')) {
      router.push(`/employer/dashboard#${id}`);
    } else {
      window.location.hash = id;
    }
    setSidebarOpen(false);
  };

  if (!user) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  const initials = (user.companyName || user.name || 'C').slice(0, 2).toUpperCase();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex transition-colors duration-300 font-sans selection:bg-blue-100 selection:text-blue-700">
      {/* Sidebar - Desktop */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 transform lg:translate-x-0 transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="h-full flex flex-col p-4">
          <div className="flex items-center gap-3 px-3 py-6" onClick={() => router.push('/')} style={{cursor:'pointer'}}>
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-black text-2xl shadow-lg shadow-blue-500/20 transition-transform hover:scale-105">S</div>
            <span className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">SkillMatch</span>
          </div>

          <div className="mb-8 px-3">
             <div className="flex items-center gap-3 p-4 rounded-2xl bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
                <div className="w-11 h-11 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm border-2 border-white dark:border-gray-700 shadow-sm transition-transform hover:-rotate-3">
                  {initials}
                </div>
                <div className="flex-1 overflow-hidden">
                  <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{user.companyName || user.name}</p>
                  <p className="text-[10px] uppercase tracking-wider font-semibold text-gray-400 truncate">RECRUITER</p>
                </div>
             </div>
          </div>

          <nav className="flex-1 space-y-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => navigateToTab(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  currentHash === item.id 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20 translate-x-1' 
                  : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-blue-600'
                }`}
              >
                <span className={currentHash === item.id ? 'text-white' : 'text-gray-400 group-hover:text-blue-600'}>{item.icon}</span>
                <span>{item.label}</span>
                {item.id === 'notifications' && notifications.some(n => !n.is_read) && (
                  <span className={`ml-auto w-2 h-2 rounded-full ${currentHash === item.id ? 'bg-white' : 'bg-red-500'}`}></span>
                )}
              </button>
            ))}
          </nav>

          <div className="px-3 pt-6 pb-4 border-t border-gray-100 dark:border-gray-800 space-y-3">
            <ThemeToggle />
            <button
              onClick={() => router.push('/employer/post-job')}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-black uppercase tracking-widest py-3.5 rounded-2xl transition-all shadow-xl shadow-blue-500/20 active:scale-95"
            >
              <IconPlus /> New Posting
            </button>
            <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-gray-500 dark:text-gray-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 transition-all">
              <IconLogout />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen">
        {/* Header */}
        <header className="sticky top-0 z-40 bg-white/80 dark:bg-gray-950/80 backdrop-blur-md border-b border-gray-100 dark:border-gray-800 h-16 flex items-center px-8 justify-between transition-colors">
          <div className="flex items-center gap-4 flex-1">
            <button className="lg:hidden p-2 -ml-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 rounded-lg" onClick={() => setSidebarOpen(true)}>
               <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"/></svg>
            </button>
            <div className="hidden md:flex items-center gap-3 bg-gray-100 dark:bg-gray-800 rounded-2xl px-5 py-2.5 w-full max-w-md focus-within:shadow-lg transition-all">
               <span className="text-gray-400"><IconSearch /></span>
               <input type="text" placeholder="Search applications, vacancies..." className="bg-transparent border-none focus:ring-0 text-sm w-full text-gray-900 dark:text-white" />
            </div>
          </div>

          <div className="flex items-center gap-6">
            <button className="relative p-2 text-gray-400 hover:text-blue-600 transition-colors">
              <IconBell />
              {notifications.some(n => !n.is_read) && <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white dark:ring-gray-950"></span>}
            </button>
            
            <div className="flex items-center gap-3 pl-6 border-l border-gray-100 dark:border-gray-800">
                <div className="hidden sm:block text-right">
                    <p className="text-xs font-black text-gray-900 dark:text-white leading-none mb-1 uppercase tracking-tight">{user.companyName || user.name}</p>
                    <p className="text-[10px] font-bold text-gray-400 tracking-wider">PREMIUM EMPLOYER</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-blue-600 border-2 border-white dark:border-gray-800 shadow-md flex items-center justify-center text-white font-bold text-xs overflow-hidden transition-transform hover:scale-105 active:scale-95">
                   {initials}
                </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-6 sm:p-8 max-w-7xl mx-auto w-full animate-in fade-in slide-in-from-bottom-2 duration-500">
           {children}
        </main>
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && <div className="fixed inset-0 z-[60] bg-gray-900/40 lg:hidden backdrop-blur-sm transition-opacity duration-300" onClick={() => setSidebarOpen(false)} />}
    </div>
  );
}
