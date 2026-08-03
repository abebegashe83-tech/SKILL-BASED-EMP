'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

// Mock data for nav items (will be replaced later)
const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: '🏠' },
  { id: 'users', label: 'Users', icon: '👥' },
  { id: 'jobs', label: 'Job Listings', icon: '💼' },
  { id: 'analytics', label: 'Analytics', icon: '📊' },
];

// Placeholder auth utilities (will be replaced later)
const logoutUser = () => {
  localStorage.removeItem('authToken');
  localStorage.removeItem('user');
};

const getSession = () => {
  if (typeof window === 'undefined') return null;
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};

export default function AdminDashboardLayout({ children }) {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const session = getSession();
    if (session) {
      setUser(session);
    }
  }, []);

  const handleLogout = () => {
    logoutUser();
    router.push('/');
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Topbar */}
      <header className="bg-white border-b border-gray-200 h-14 flex items-center px-4 justify-between sticky top-0 z-40 shadow-sm">
        <div className="flex items-center gap-3">
          <button className="lg:hidden text-gray-500 text-xl" onClick={() => setSidebarOpen(!sidebarOpen)}>☰</button>
          <span className="font-extrabold text-orange-600 text-lg">⚙️ SkillMatch Admin</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs bg-orange-100 text-orange-700 font-semibold px-2 py-1 rounded-full">Admin</span>
          <button onClick={handleLogout} className="text-sm text-gray-500 hover:text-red-500 transition-colors">Logout</button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className={`fixed lg:static inset-y-0 left-0 z-30 w-56 bg-white border-r border-gray-200 flex flex-col pt-4 transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
          <nav className="flex-1 px-3 py-2 space-y-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  // This will be handled by the page component using URL hash
                  const currentUrl = new URL(window.location.href);
                  currentUrl.hash = item.id;
                  window.history.pushState({}, '', currentUrl);
                  // Trigger a hash change event for the page component to handle
                  window.dispatchEvent(new HashChangeEvent('hashchange'));
                  setSidebarOpen(false);
                }}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all text-gray-600 hover:bg-gray-50"
              >
                <span>{item.icon}</span>{item.label}
              </button>
            ))}
          </nav>
          <div className="px-4 pb-4 border-t border-gray-100 pt-3">
            <Link href="/" className="text-xs text-gray-400 hover:text-gray-600">← Back to Site</Link>
          </div>
        </aside>
        {sidebarOpen && <div className="fixed inset-0 z-20 bg-black/30 lg:hidden" onClick={() => setSidebarOpen(false)} />}

        {/* Main */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {children}
        </main>
      </div>
    </div>
  );
}
