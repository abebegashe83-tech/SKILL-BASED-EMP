'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

// ── Mock Data ────────────────────────────────────────────────
const mockUsers = [
  { id: 1, name: 'Alex Johnson', email: 'alex@example.com', role: 'jobseeker', status: 'Active', joined: '2026-03-01', skills: 'React, Node.js' },
  { id: 2, name: 'Priya Sharma', email: 'priya@example.com', role: 'jobseeker', status: 'Active', joined: '2026-03-05', skills: 'Vue.js, Python' },
  { id: 3, name: 'TechCorp Ltd', email: 'hr@techcorp.com', role: 'employer', status: 'Active', joined: '2026-03-08', skills: '—' },
  { id: 4, name: 'James Mwangi', email: 'james@example.com', role: 'jobseeker', status: 'Suspended', joined: '2026-03-10', skills: 'Django, Python' },
  { id: 5, name: 'GlobalTech', email: 'jobs@globaltech.com', role: 'employer', status: 'Active', joined: '2026-03-12', skills: '—' },
  { id: 6, name: 'Sofia Chen', email: 'sofia@example.com', role: 'jobseeker', status: 'Active', joined: '2026-03-15', skills: 'Figma, React' },
  { id: 7, name: 'StartupXYZ', email: 'hire@startupxyz.com', role: 'employer', status: 'Pending', joined: '2026-03-18', skills: '—' },
];

const mockJobs = [
  { id: 1, title: 'Senior React Developer', company: 'TechCorp Ltd', location: 'Remote', status: 'Active', applicants: 24, posted: '2026-03-20' },
  { id: 2, title: 'Backend Python Engineer', company: 'TechCorp Ltd', location: 'Nairobi', status: 'Active', applicants: 18, posted: '2026-03-18' },
  { id: 3, title: 'JavaScript Engineer', company: 'GlobalTech', location: 'Remote', status: 'Active', applicants: 31, posted: '2026-03-15' },
  { id: 4, title: 'DevOps Engineer', company: 'TechCorp Ltd', location: 'Hybrid', status: 'Closed', applicants: 9, posted: '2026-03-10' },
  { id: 5, title: 'UI/UX Developer', company: 'StartupXYZ', location: 'Remote', status: 'Pending Review', applicants: 0, posted: '2026-03-22' },
  { id: 6, title: 'Data Scientist', company: 'GlobalTech', location: 'Nairobi', status: 'Active', applicants: 14, posted: '2026-03-21' },
];

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: '🏠' },
  { id: 'users', label: 'Users', icon: '👥' },
  { id: 'jobs', label: 'Job Listings', icon: '💼' },
  { id: 'analytics', label: 'Analytics', icon: '📊' },
];

const statusBadge = {
  Active: 'bg-green-100 text-green-700',
  Suspended: 'bg-red-100 text-red-700',
  Pending: 'bg-yellow-100 text-yellow-700',
  'Pending Review': 'bg-yellow-100 text-yellow-700',
  Closed: 'bg-gray-100 text-gray-600',
};

const roleBadge = {
  jobseeker: 'bg-blue-100 text-blue-700',
  employer: 'bg-purple-100 text-purple-700',
  admin: 'bg-orange-100 text-orange-700',
};

// ── Mini Bar Chart ───────────────────────────────────────────
function BarChart({ data, color }) {
  const max = Math.max(...data.map((d) => d.value));
  return (
    <div className="flex items-end gap-2 h-24 mt-3">
      {data.map((d) => (
        <div key={d.label} className="flex flex-col items-center flex-1 gap-1">
          <div
            className={`w-full rounded-t-sm ${color}`}
            style={{ height: `${(d.value / max) * 80}px` }}
          />
          <span className="text-xs text-gray-400">{d.label}</span>
        </div>
      ))}
    </div>
  );
}

// ── Main Component ───────────────────────────────────────────
export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [users, setUsers] = useState(mockUsers);
  const [jobs, setJobs] = useState(mockJobs);
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('all');
  const [userStatusFilter, setUserStatusFilter] = useState('all');
  const [jobSearch, setJobSearch] = useState('');
  const [jobStatusFilter, setJobStatusFilter] = useState('all');
  const router = useRouter();

  useEffect(() => {
    // Handle hash-based navigation for tabs
    const handleHashChange = () => {
      const hash = window.location.hash.slice(1);
      if (hash && navItems.some(item => item.id === hash)) {
        setActiveTab(hash);
      }
    };

    // Initial hash check
    handleHashChange();

    // Listen for hash changes
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Placeholder auth utilities (will be replaced later)
  const getSession = () => {
    if (typeof window === 'undefined') return null;
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  };

  // ── User Actions ──
  const deleteUser = (id) => setUsers((prev) => prev.filter((u) => u.id !== id));
  const toggleUserStatus = (id) =>
    setUsers((prev) =>
      prev.map((u) =>
        u.id === id ? { ...u, status: u.status === 'Active' ? 'Suspended' : 'Active' } : u
      )
    );

  // ── Job Actions ──
  const deleteJob = (id) => setJobs((prev) => prev.filter((j) => j.id !== id));
  const approveJob = (id) =>
    setJobs((prev) => prev.map((j) => (j.id === id ? { ...j, status: 'Active' } : j)));

  // ── Filtered Data ──
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchSearch =
        u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
        u.email.toLowerCase().includes(userSearch.toLowerCase());
      const matchRole = userRoleFilter === 'all' || u.role === userRoleFilter;
      const matchStatus = userStatusFilter === 'all' || u.status === userStatusFilter;
      return matchSearch && matchRole && matchStatus;
    });
  }, [users, userSearch, userRoleFilter, userStatusFilter]);

  const filteredJobs = useMemo(() => {
    return jobs.filter((j) => {
      const matchSearch =
        j.title.toLowerCase().includes(jobSearch.toLowerCase()) ||
        j.company.toLowerCase().includes(jobSearch.toLowerCase());
      const matchStatus = jobStatusFilter === 'all' || j.status === jobStatusFilter;
      return matchSearch && matchStatus;
    });
  }, [jobs, jobSearch, jobStatusFilter]);

  const analyticsSignups = [
    { label: 'Mon', value: 12 }, { label: 'Tue', value: 19 }, { label: 'Wed', value: 8 },
    { label: 'Thu', value: 25 }, { label: 'Fri', value: 31 }, { label: 'Sat', value: 14 }, { label: 'Sun', value: 7 },
  ];
  const analyticsJobs = [
    { label: 'Mon', value: 5 }, { label: 'Tue', value: 9 }, { label: 'Wed', value: 3 },
    { label: 'Thu', value: 12 }, { label: 'Fri', value: 8 }, { label: 'Sat', value: 2 }, { label: 'Sun', value: 1 },
  ];

  return (
    <div className="space-y-6">
      {/* ── DASHBOARD ── */}
      {activeTab === 'dashboard' && (
        <>
          <h1 className="text-2xl font-bold text-gray-800">Admin Overview</h1>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Total Users', value: users.length, icon: '👥', color: 'bg-blue-50 text-blue-700' },
              { label: 'Jobseekers', value: users.filter(u => u.role === 'jobseeker').length, icon: '🧑‍💼', color: 'bg-indigo-50 text-indigo-700' },
              { label: 'Employers', value: users.filter(u => u.role === 'employer').length, icon: '🏢', color: 'bg-purple-50 text-purple-700' },
              { label: 'Active Jobs', value: jobs.filter(j => j.status === 'Active').length, icon: '💼', color: 'bg-green-50 text-green-700' },
              { label: 'Suspended', value: users.filter(u => u.status === 'Suspended').length, icon: '🚫', color: 'bg-red-50 text-red-700' },
              { label: 'Pending Jobs', value: jobs.filter(j => j.status === 'Pending Review').length, icon: '⏳', color: 'bg-yellow-50 text-yellow-700' },
              { label: 'Total Applicants', value: jobs.reduce((a, j) => a + j.applicants, 0), icon: '📋', color: 'bg-teal-50 text-teal-700' },
              { label: 'Closed Jobs', value: jobs.filter(j => j.status === 'Closed').length, icon: '🔒', color: 'bg-gray-50 text-gray-600' },
            ].map((s) => (
              <div key={s.label} className={`rounded-xl p-4 ${s.color} shadow-sm`}>
                <div className="text-2xl mb-1">{s.icon}</div>
                <div className="text-2xl font-bold">{s.value}</div>
                <div className="text-xs font-medium opacity-70">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Quick Recent Tables */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <div className="flex justify-between items-center mb-3">
                <h2 className="font-bold text-gray-800">Recent Users</h2>
                <button onClick={() => setActiveTab('users')} className="text-xs text-orange-600 hover:underline">View all</button>
              </div>
              <div className="space-y-2">
                {users.slice(0, 4).map((u) => (
                  <div key={u.id} className="flex items-center justify-between py-1">
                    <div>
                      <p className="text-sm font-medium text-gray-800">{u.name}</p>
                      <p className="text-xs text-gray-400">{u.email}</p>
                    </div>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${roleBadge[u.role]}`}>{u.role}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <div className="flex justify-between items-center mb-3">
                <h2 className="font-bold text-gray-800">Pending Job Reviews</h2>
                <button onClick={() => setActiveTab('jobs')} className="text-xs text-orange-600 hover:underline">View all</button>
              </div>
              {jobs.filter(j => j.status === 'Pending Review').length === 0 ? (
                <p className="text-sm text-gray-400">No pending jobs 🎉</p>
              ) : (
                jobs.filter(j => j.status === 'Pending Review').map((j) => (
                  <div key={j.id} className="flex items-center justify-between py-1">
                    <div>
                      <p className="text-sm font-medium text-gray-800">{j.title}</p>
                      <p className="text-xs text-gray-400">{j.company}</p>
                    </div>
                    <button onClick={() => approveJob(j.id)} className="text-xs bg-green-600 text-white px-2 py-0.5 rounded-full hover:bg-green-700">Approve</button>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}

      {/* ── USERS ── */}
      {activeTab === 'users' && (
        <>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h1 className="text-2xl font-bold text-gray-800">User Management</h1>
            <span className="text-sm text-gray-500">{filteredUsers.length} of {users.length} users</span>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-3">
            <input
              type="text"
              placeholder="Search by name or email..."
              value={userSearch}
              onChange={(e) => setUserSearch(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 w-full sm:w-64"
            />
            <select value={userRoleFilter} onChange={(e) => setUserRoleFilter(e.target.value)} className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400">
              <option value="all">All Roles</option>
              <option value="jobseeker">Jobseeker</option>
              <option value="employer">Employer</option>
            </select>
            <select value={userStatusFilter} onChange={(e) => setUserStatusFilter(e.target.value)} className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400">
              <option value="all">All Status</option>
              <option value="Active">Active</option>
              <option value="Suspended">Suspended</option>
              <option value="Pending">Pending</option>
            </select>
          </div>

          {/* Table */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-x-auto">
            <table className="w-full min-w-[600px]">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-xs uppercase text-gray-500 font-semibold">
                  <th className="text-left px-4 py-3">User</th>
                  <th className="text-left px-4 py-3">Role</th>
                  <th className="text-left px-4 py-3 hidden md:table-cell">Joined</th>
                  <th className="text-left px-4 py-3">Status</th>
                  <th className="text-right px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredUsers.length === 0 ? (
                  <tr><td colSpan={5} className="text-center py-8 text-gray-400 text-sm">No users found.</td></tr>
                ) : filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-800 text-sm">{u.name}</p>
                      <p className="text-xs text-gray-400">{u.email}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${roleBadge[u.role]}`}>{u.role}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-sm hidden md:table-cell">{u.joined}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${statusBadge[u.status] || 'bg-gray-100 text-gray-600'}`}>{u.status}</span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => toggleUserStatus(u.id)}
                          className={`text-xs px-2 py-1 rounded-md font-medium transition-colors ${u.status === 'Active'
                            ? 'bg-red-50 text-red-600 hover:bg-red-100'
                            : 'bg-green-50 text-green-600 hover:bg-green-100'
                            }`}
                        >
                          {u.status === 'Active' ? 'Suspend' : 'Activate'}
                        </button>
                        <button
                          onClick={() => deleteUser(u.id)}
                          className="text-xs px-2 py-1 rounded-md bg-gray-50 text-gray-500 hover:bg-red-50 hover:text-red-600 transition-colors font-medium"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* ── JOBS ── */}
      {activeTab === 'jobs' && (
        <>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h1 className="text-2xl font-bold text-gray-800">Job Listings</h1>
            <span className="text-sm text-gray-500">{filteredJobs.length} of {jobs.length} listings</span>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-3">
            <input
              type="text"
              placeholder="Search by title or company..."
              value={jobSearch}
              onChange={(e) => setJobSearch(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 w-full sm:w-64"
            />
            <select value={jobStatusFilter} onChange={(e) => setJobStatusFilter(e.target.value)} className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400">
              <option value="all">All Status</option>
              <option value="Active">Active</option>
              <option value="Pending Review">Pending Review</option>
              <option value="Closed">Closed</option>
            </select>
          </div>

          {/* Table */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-x-auto">
            <table className="w-full min-w-[600px]">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-xs uppercase text-gray-500 font-semibold">
                  <th className="text-left px-4 py-3">Job Title</th>
                  <th className="text-left px-4 py-3 hidden sm:table-cell">Company</th>
                  <th className="text-left px-4 py-3 hidden md:table-cell">Applicants</th>
                  <th className="text-left px-4 py-3">Status</th>
                  <th className="text-right px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredJobs.length === 0 ? (
                  <tr><td colSpan={5} className="text-center py-8 text-gray-400 text-sm">No jobs found.</td></tr>
                ) : filteredJobs.map((j) => (
                  <tr key={j.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-800 text-sm">{j.title}</p>
                      <p className="text-xs text-gray-400">{j.location}</p>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500 hidden sm:table-cell">{j.company}</td>
                    <td className="px-4 py-3 text-sm text-gray-500 hidden md:table-cell">{j.applicants}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${statusBadge[j.status] || 'bg-gray-100 text-gray-600'}`}>{j.status}</span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {j.status === 'Pending Review' && (
                          <button onClick={() => approveJob(j.id)} className="text-xs px-2 py-1 rounded-md bg-green-50 text-green-600 hover:bg-green-100 font-medium transition-colors">
                            Approve
                          </button>
                        )}
                        <button onClick={() => deleteJob(j.id)} className="text-xs px-2 py-1 rounded-md bg-gray-50 text-gray-500 hover:bg-red-50 hover:text-red-600 font-medium transition-colors">
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* ── ANALYTICS ── */}
      {activeTab === 'analytics' && (
        <>
          <h1 className="text-2xl font-bold text-gray-800">System Analytics</h1>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { label: 'Total Signups', value: users.length, sub: 'All time', color: 'text-blue-600' },
              { label: 'Active Job Listings', value: jobs.filter(j => j.status === 'Active').length, sub: 'Currently live', color: 'text-green-600' },
              { label: 'Total Applications', value: jobs.reduce((a, j) => a + j.applicants, 0), sub: 'Across all jobs', color: 'text-purple-600' },
            ].map((s) => (
              <div key={s.label} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                <p className="text-sm text-gray-500">{s.label}</p>
                <p className={`text-3xl font-extrabold mt-1 ${s.color}`}>{s.value}</p>
                <p className="text-xs text-gray-400 mt-1">{s.sub}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <h2 className="font-bold text-gray-800 mb-1">New Signups (This Week)</h2>
              <p className="text-xs text-gray-400">Daily registrations</p>
              <BarChart data={analyticsSignups} color="bg-blue-500" />
            </div>
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <h2 className="font-bold text-gray-800 mb-1">New Job Posts (This Week)</h2>
              <p className="text-xs text-gray-400">Daily new listings</p>
              <BarChart data={analyticsJobs} color="bg-green-500" />
            </div>
          </div>

          {/* Role breakdown */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <h2 className="font-bold text-gray-800 mb-4">User Breakdown</h2>
            <div className="space-y-3">
              {[
                { label: 'Jobseekers', count: users.filter(u => u.role === 'jobseeker').length, color: 'bg-blue-500' },
                { label: 'Employers', count: users.filter(u => u.role === 'employer').length, color: 'bg-purple-500' },
                { label: 'Active Users', count: users.filter(u => u.status === 'Active').length, color: 'bg-green-500' },
                { label: 'Suspended Users', count: users.filter(u => u.status === 'Suspended').length, color: 'bg-red-500' },
              ].map((item) => (
                <div key={item.label}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600 font-medium">{item.label}</span>
                    <span className="font-bold text-gray-800">{item.count}</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div
                      className={`${item.color} h-2 rounded-full transition-all`}
                      style={{ width: `${(item.count / users.length) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
