'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { tokenManager } from '@/lib/api';

export default function DashboardIndexPage() {
  const router = useRouter();
  const hasRedirected = useRef(false);

  useEffect(() => {
    if (hasRedirected.current) return;
    
    const user = tokenManager.getUser();
    if (user && user.role) {
      hasRedirected.current = true;
      router.replace(`/${user.role}/dashboard`);
    }
  }, [router]);

  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="text-2xl font-bold text-center">Redirecting...</h1>
      <p className="mt-3 text-slate-600 text-center">
        Please wait while we take you to your dashboard.
      </p>
      <div className="mt-8 grid gap-4 max-w-sm mx-auto">
        <Link 
          className="flex items-center justify-center p-4 border rounded-xl hover:bg-gray-50 transition-colors font-medium text-blue-600" 
          href="/jobseeker/dashboard"
        >
          Jobseeker Dashboard
        </Link>
        <Link 
          className="flex items-center justify-center p-4 border rounded-xl hover:bg-gray-50 transition-colors font-medium text-blue-600" 
          href="/employer/dashboard"
        >
          Employer Dashboard
        </Link>
        <Link 
          className="flex items-center justify-center p-4 border rounded-xl hover:bg-gray-50 transition-colors font-medium text-blue-600" 
          href="/admin/dashboard"
        >
          Admin Dashboard
        </Link>
      </div>
    </main>
  );
}
