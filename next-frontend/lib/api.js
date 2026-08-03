import axios from 'axios';

// Helper to set cookie
const setCookie = (name, value, days = 7) => {
  if (typeof document === 'undefined') return;
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${value}; expires=${expires}; path=/; SameSite=Lax`;
};

// Helper to get cookie
const getCookie = (name) => {
  if (typeof document === 'undefined') return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
  return null;
};

// Helper to erase cookie
const eraseCookie = (name) => {
  if (typeof document === 'undefined') return;
  document.cookie = `${name}=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;`;
};

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api/',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to include the JWT token in headers
api.interceptors.request.use(
  (config) => {
    const authRoutes = ['auth/login/', 'auth/register/'];
    const isAuthRoute = authRoutes.some(route => config.url.includes(route));

    if (typeof window !== 'undefined' && !isAuthRoute) {
      const token = localStorage.getItem('authToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }

    console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`, config.data || '');
    return config;
  },
  (error) => {
    console.error('[API Request Error]', error);
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle token expiration/invalidity
api.interceptors.response.use(
  (response) => {
    console.log(`[API Response] ${response.config.method?.toUpperCase()} ${response.config.url}`, response.status, response.data);
    return response;
  },
  (error) => {
    const responseData = error.response?.data;
    const errorMessage = responseData?.detail || 
                        responseData?.message || 
                        error.message || 
                        'An error occurred';
    
    console.error(`[API Error] ${error.config?.method?.toUpperCase()} ${error.config?.url}`, {
      status: error.response?.status,
      data: responseData,
      message: errorMessage
    });

    if (typeof window !== 'undefined') {
      if (error.response?.status === 401) {
        // Unauthorized - Token likely expired
        const isAuthRoute = ['auth/login/', 'auth/register/'].some(route => 
          error.config.url.includes(route)
        );
        
        if (!isAuthRoute) {
          console.warn('[API] 401 detected, clearing auth data');
          tokenManager.clearAuth();
        }
      } else if (error.response?.status === 403) {
        // Forbidden - Role mismatch or restricted access
        console.warn('[API] 403 detected:', errorMessage);
        
        // If 403 happens on a dashboard related route, it often means the token
        // belongs to a user with a different role. Force clear to allow fresh login.
        if (error.config.url.includes('employer/') || error.config.url.includes('jobseeker/')) {
          console.error('[API] 403 on Dashboard route. Force clearing session.');
          tokenManager.clearAuth();
          if (typeof window !== 'undefined') window.location.href = '/login';
        }
      }
    }

    return Promise.reject(error);
  }
);

// Token Manager for handling JWT tokens and user data
export const tokenManager = {
  setToken: (token) => {
    if (typeof window !== 'undefined' && token) {
      if (typeof token === 'string' && token.length > 0) {
        localStorage.setItem('authToken', token);
        setCookie('authToken', token, 7);
        console.log('[TokenManager] Token stored successfully');
      } else {
        console.error('[TokenManager] Invalid token provided:', typeof token);
      }
    }
  },
  getToken: () => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('authToken') || getCookie('authToken');
      if (token && token.length > 0) {
        return token;
      }
      console.warn('[TokenManager] No valid token found');
      return null;
    }
    return null;
  },
  setUser: (user) => {
    if (typeof window !== 'undefined' && user) {
      localStorage.setItem('user', JSON.stringify(user));
      console.log('[TokenManager] User stored:', user.email);
    }
  },
  getUser: () => {
    if (typeof window !== 'undefined') {
      const user = localStorage.getItem('user');
      return user ? JSON.parse(user) : null;
    }
    return null;
  },
  clearAuth: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      eraseCookie('authToken');
      console.log('[TokenManager] Auth cleared');
    }
  },
  isAuthenticated: () => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('authToken') || getCookie('authToken');
      return !!(token && token.length > 0);
    }
    return false;
  }
};

// Auth APIs
export const authAPI = {
  register: (data) => api.post('auth/register/', data),
  login: (data) => api.post('auth/login/', data),
  logout: () => api.post('auth/logout/'),
  getCurrentUser: () => api.get('auth/user/'),
};

// User Profile APIs (Export as both profileAPI and usersAPI for compatibility)
export const profileAPI = {
  getProfile: () => api.get('profile/'),
  updateProfile: (data) => api.put('profile/', data),
};

export const usersAPI = profileAPI;

// Jobs APIs
export const jobsAPI = {
  getJobs: () => api.get('jobs/'),
  getJob: (id) => api.get(`jobs/${id}/`),
  createJob: (data) => api.post('jobs/', data),
  updateJob: (id, data) => api.put(`jobs/${id}/`, data),
  deleteJob: (id) => api.delete(`jobs/${id}/`),
};

// Applications APIs
export const applicationsAPI = {
  apply: (jobId) => api.post(`applications/apply/${jobId}/`),
  getMyApplications: () => api.get('applications/my-applications/'),
  getApplicants: (jobId) => api.get(`applications/job/${jobId}/applicants/`),
};

// Notifications APIs
export const getNotifications = () => api.get('notifications/');
export const markAsRead = (id) => api.post(`notifications/${id}/read/`);

export default api;

