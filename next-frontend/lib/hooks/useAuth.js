// Custom hook for authentication state management
// Provides reactive authentication state and utilities

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { tokenManager, authAPI } from '../api.js';

export const useAuth = () => {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check authentication status on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        if (tokenManager.isAuthenticated()) {
          // Try to get current user from API
          const currentUser = await authAPI.getCurrentUser();
          setUser(currentUser);
          setIsAuthenticated(true);
        } else {
          setUser(null);
          setIsAuthenticated(false);
        }
      } catch (error) {
        // If token is invalid, clear auth data
        console.warn('Auth check failed:', error);
        tokenManager.clearAuth();
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Login function
  const login = useCallback(async (credentials) => {
    setIsLoading(true);
    try {
      const response = await authAPI.login(credentials);
      setUser(response.user);
      setIsAuthenticated(true);
      return { success: true, user: response.user };
    } catch (error) {
      return { 
        success: false, 
        error: error.message || 'Login failed. Please check your credentials.' 
      };
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Register function
  const register = useCallback(async (userData) => {
    setIsLoading(true);
    try {
      const response = await authAPI.register(userData);
      setUser(response.user);
      setIsAuthenticated(true);
      return { success: true, user: response.user };
    } catch (error) {
      return { 
        success: false, 
        error: error.message || 'Registration failed. Please try again.' 
      };
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Logout function
  const logout = useCallback(async () => {
    setIsLoading(true);
    try {
      await authAPI.logout();
    } catch (error) {
      console.warn('Logout API call failed:', error);
    } finally {
      setUser(null);
      setIsAuthenticated(false);
      setIsLoading(false);
      // Redirect to home page after logout
      router.push('/');
    }
  }, [router]);

  // Refresh user data
  const refreshUser = useCallback(async () => {
    if (!isAuthenticated) return;
    
    try {
      const currentUser = await authAPI.getCurrentUser();
      setUser(currentUser);
      return currentUser;
    } catch (error) {
      console.warn('Failed to refresh user data:', error);
      // If refresh fails, user might need to login again
      await logout();
    }
  }, [isAuthenticated, logout]);

  // Check user role
  const isJobseeker = user?.role === 'jobseeker';
  const isEmployer = user?.role === 'employer';
  const isAdmin = user?.role === 'admin';

  return {
    // State
    user,
    isLoading,
    isAuthenticated,
    
    // Role checks
    isJobseeker,
    isEmployer,
    isAdmin,
    
    // Actions
    login,
    register,
    logout,
    refreshUser,
    
    // Utilities
    hasRole: (role) => user?.role === role,
    canAccess: (requiredRole) => {
      if (!requiredRole) return true;
      return user?.role === requiredRole;
    }
  };
};

// Higher-order component for protecting routes
export const withAuth = (WrappedComponent, requiredRole = null) => {
  return function AuthenticatedComponent(props) {
    const { isAuthenticated, isLoading, user, hasRole } = useAuth();
    const router = useRouter();

    useEffect(() => {
      if (!isLoading) {
        if (!isAuthenticated) {
          router.push('/login');
          return;
        }
        
        if (requiredRole && !hasRole(requiredRole)) {
          // Redirect to appropriate dashboard based on role
          const userRole = user?.role;
          if (userRole === 'jobseeker') {
            router.push('/jobseeker/dashboard');
          } else if (userRole === 'employer') {
            router.push('/employer/dashboard');
          } else if (userRole === 'admin') {
            router.push('/admin/dashboard');
          } else {
            router.push('/dashboard');
          }
          return;
        }
      }
    }, [isAuthenticated, isLoading, user, hasRole, requiredRole, router]);

    if (isLoading) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      );
    }

    if (!isAuthenticated) {
      return null; // Will redirect
    }

    if (requiredRole && !hasRole(requiredRole)) {
      return null; // Will redirect
    }

    return <WrappedComponent {...props} />;
  };
};
