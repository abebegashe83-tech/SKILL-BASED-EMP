'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';

export const AuthGuard = ({ children, requiredRole = null }) => {
  const router = useRouter();
  const { isAuthenticated, isLoading, user, hasRole } = useAuth();
  const hasRedirected = useRef(false);
  const userRole = user?.role;

  useEffect(() => {
    let timeoutId;

    // Only redirect if we've finished loading and confirmed user is NOT authenticated
    if (!isLoading && !isAuthenticated && !hasRedirected.current) {
      // Small delay to ensure any pending state updates are processed
      // (This helps with rapid client-side transitions after login/signup)
      timeoutId = setTimeout(() => {
        const currentPath = window.location.pathname + window.location.search;
        // Don't redirect if we're already on an auth page
        const publicPaths = ['/login', '/signup', '/'];
        if (!publicPaths.includes(window.location.pathname)) {
          hasRedirected.current = true;
          router.push(`/login?redirect=${encodeURIComponent(currentPath)}`);
        }
      }, 100);
    }

    // Check role if authenticated
    if (!isLoading && isAuthenticated && requiredRole && !hasRole(requiredRole) && !hasRedirected.current) {
        // Redirect to appropriate dashboard based on user role
        if (userRole === 'jobseeker') {
          hasRedirected.current = true;
          router.push('/jobseeker/dashboard');
        } else if (userRole === 'employer') {
          hasRedirected.current = true;
          router.push('/employer/dashboard');
        } else if (userRole === 'admin') {
          hasRedirected.current = true;
          router.push('/admin/dashboard');
        } else {
          hasRedirected.current = true;
          router.push('/dashboard');
        }
      }

      return () => {
        if (timeoutId) clearTimeout(timeoutId);
      };
  }, [isAuthenticated, isLoading, userRole, hasRole, requiredRole, router]);

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // If not authenticated, render nothing (will redirect)
  if (!isAuthenticated) {
    return null;
  }

  // If role is required and user doesn't have it, render nothing (will redirect)
  if (requiredRole && !hasRole(requiredRole)) {
    return null;
  }

  return children;
};

// Role-specific guard components
export const JobseekerGuard = ({ children }) => (
  <AuthGuard requiredRole="jobseeker">
    {children}
  </AuthGuard>
);

export const EmployerGuard = ({ children }) => (
  <AuthGuard requiredRole="employer">
    {children}
  </AuthGuard>
);

export const AdminGuard = ({ children }) => (
  <AuthGuard requiredRole="admin">
    {children}
  </AuthGuard>
);

// Higher-order component version
export const withAuthGuard = (WrappedComponent, requiredRole = null) => {
  return function AuthenticatedComponent(props) {
    return (
      <AuthGuard requiredRole={requiredRole}>
        <WrappedComponent {...props} />
      </AuthGuard>
    );
  };
};

export const withJobseekerGuard = (WrappedComponent) => withAuthGuard(WrappedComponent, 'jobseeker');
export const withEmployerGuard = (WrappedComponent) => withAuthGuard(WrappedComponent, 'employer');
export const withAdminGuard = (WrappedComponent) => withAuthGuard(WrappedComponent, 'admin');
