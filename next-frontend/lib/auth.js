// Authentication utilities that work with the API layer
// This file provides backward compatibility with existing auth usage

import { authAPI, tokenManager, profileAPI } from './api.js';

// Authentication functions
export const loginUser = async (email, password) => {
  try {
    if (!email || !password) {
      return { success: false, error: 'Email and password are required.' };
    }

    console.log('[Login] Attempting login for:', email);
    const response = await authAPI.login({ email, password });
    const { access, user } = response.data;
    
    if (!access || typeof access !== 'string' || access.length === 0) {
      console.error('[Login] Invalid token received from server');
      return { success: false, error: 'Invalid token received from server.' };
    }
    
    tokenManager.setToken(access);
    tokenManager.setUser(user);
    
    console.log('[Login] Success for:', email, 'Role:', user?.role);
    return { success: true, user };
  } catch (error) {
    console.error('[Login] Error:', error);
    const message = error.response?.data?.detail || 
                    error.response?.data?.non_field_errors?.[0] || 
                    error.response?.data?.message ||
                    error.message || 
                    'Login failed. Please check your credentials.';
    return { success: false, error: message };
  }
};

export const registerUser = async (userData) => {
  try {
    const { email, password, role, ...profileData } = userData;
    
    if (!email || !password || !role) {
      return { success: false, error: 'Email, password, and role are required.' };
    }

    const registerData = { email, password, role };
    console.log('[Register] Sending registration data:', registerData);
    
    const response = await authAPI.register(registerData);
    
    const loginResult = await loginUser(email, password);
    
    if (!loginResult.success) {
      return loginResult;
    }

    const { user } = loginResult;
    
    if (profileData && Object.keys(profileData).length > 0) {
      try {
        const backendProfileData = {
          full_name: profileData.fullName,
          company_name: profileData.companyName,
          industry: profileData.industry,
          company_size: profileData.companySize,
          bio: profileData.bio,
          location: profileData.location,
          title: profileData.title,
          website: profileData.website
        };
        
        await profileAPI.updateProfile(backendProfileData);
      } catch (profileError) {
        console.warn('[Register] Profile update failed:', profileError);
      }
    }
    
    return { success: true, user };
  } catch (error) {
    console.error('[Register] Error:', error);
    const message = error.response?.data?.email?.[0] || 
                    error.response?.data?.detail || 
                    error.response?.data?.message ||
                    error.message || 
                    'Registration failed. Please try again.';
    return { success: false, error: message };
  }
};

export const logoutUser = async () => {
  try {
    await authAPI.logout();
  } catch (error) {
    // Continue with local logout even if API call fails
    console.warn('Logout API call failed:', error);
  }
};

export const getSession = () => {
  return tokenManager.getUser();
};

export const isLoggedIn = () => {
  return tokenManager.isAuthenticated();
};

export const updateUser = async (userId, userData) => {
  try {
    const response = await usersAPI.updateProfile(userId, userData);
    return { success: true, user: response };
  } catch (error) {
    return { 
      success: false, 
      error: error.message || 'Profile update failed.' 
    };
  }
};

// Re-export token manager for direct access
export { tokenManager };

// Helper function to get current user ID from session
export const getCurrentUserId = () => {
  const user = getSession();
  return user?.id;
};

// Helper function to check user role
export const getUserRole = () => {
  const user = getSession();
  return user?.role;
};

// Helper function to check if current user is jobseeker
export const isJobseeker = () => {
  return getUserRole() === 'jobseeker';
};

// Helper function to check if current user is employer
export const isEmployer = () => {
  return getUserRole() === 'employer';
};

// Helper function to check if current user is admin
export const isAdmin = () => {
  return getUserRole() === 'admin';
};
