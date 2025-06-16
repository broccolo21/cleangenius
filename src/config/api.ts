// API Configuration
const isDevelopment = import.meta.env.DEV;
const isProduction = import.meta.env.PROD;

// Base API URL configuration
export const API_BASE_URL = isDevelopment 
  ? 'http://localhost:3001/api'  // Development: separate backend server
  : '/api';                      // Production: same origin (served by Express)

// API endpoints
export const API_ENDPOINTS = {
  // Authentication
  AUTH: {
    LOGIN: `${API_BASE_URL}/auth/login`,
    REGISTER: `${API_BASE_URL}/auth/register`,
    ME: `${API_BASE_URL}/auth/me`,
    CHANGE_PASSWORD: `${API_BASE_URL}/auth/change-password`,
  },
  
  // Users
  USERS: {
    LIST: `${API_BASE_URL}/users`,
    BY_ID: (id: string) => `${API_BASE_URL}/users/${id}`,
    EMPLOYEES_LOCATIONS: `${API_BASE_URL}/users/employees/locations`,
  },
  
  // Schedule
  SCHEDULE: {
    LIST: `${API_BASE_URL}/schedule`,
    BY_ID: (id: string) => `${API_BASE_URL}/schedule/${id}`,
    STATS: `${API_BASE_URL}/schedule/stats/overview`,
  },
  
  // Media
  MEDIA: {
    LIST: `${API_BASE_URL}/media`,
    UPLOAD: `${API_BASE_URL}/media/upload`,
    BY_ID: (id: string) => `${API_BASE_URL}/media/${id}`,
    ANALYZE: (id: string) => `${API_BASE_URL}/media/${id}/analyze`,
    STATS: `${API_BASE_URL}/media/stats/overview`,
  },
  
  // Chat
  CHAT: {
    MESSAGES: `${API_BASE_URL}/chat`,
    CONVERSATIONS: `${API_BASE_URL}/chat/conversations`,
    MARK_READ: `${API_BASE_URL}/chat/mark-read`,
    UNREAD_COUNT: `${API_BASE_URL}/chat/unread-count`,
  },
  
  // Reports
  REPORTS: {
    LIST: `${API_BASE_URL}/reports`,
    BY_ID: (id: string) => `${API_BASE_URL}/reports/${id}`,
    GENERATE: `${API_BASE_URL}/reports/generate`,
  },
  
  // Tracking
  TRACKING: {
    LOCATION: `${API_BASE_URL}/tracking/location`,
    LOCATIONS: `${API_BASE_URL}/tracking/locations`,
    HISTORY: (userId: string) => `${API_BASE_URL}/tracking/history/${userId}`,
    GESTURE: `${API_BASE_URL}/tracking/gesture`,
    GESTURE_STATS: `${API_BASE_URL}/tracking/gestures/stats`,
    CLEANUP: `${API_BASE_URL}/tracking/cleanup`,
  },
  
  // Health check
  HEALTH: `${API_BASE_URL}/health`,
};

// HTTP client configuration
export const HTTP_CONFIG = {
  timeout: 30000, // 30 seconds
  headers: {
    'Content-Type': 'application/json',
  },
};

// Helper function to get auth headers
export const getAuthHeaders = () => {
  const token = localStorage.getItem('authToken');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// API client helper
export const apiClient = {
  get: async (url: string, options: RequestInit = {}) => {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        ...HTTP_CONFIG.headers,
        ...getAuthHeaders(),
        ...options.headers,
      },
      ...options,
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return response.json();
  },
  
  post: async (url: string, data?: any, options: RequestInit = {}) => {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        ...HTTP_CONFIG.headers,
        ...getAuthHeaders(),
        ...options.headers,
      },
      body: data ? JSON.stringify(data) : undefined,
      ...options,
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return response.json();
  },
  
  put: async (url: string, data?: any, options: RequestInit = {}) => {
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        ...HTTP_CONFIG.headers,
        ...getAuthHeaders(),
        ...options.headers,
      },
      body: data ? JSON.stringify(data) : undefined,
      ...options,
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return response.json();
  },
  
  delete: async (url: string, options: RequestInit = {}) => {
    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        ...HTTP_CONFIG.headers,
        ...getAuthHeaders(),
        ...options.headers,
      },
      ...options,
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return response.json();
  },
};

// Environment info
export const ENV_INFO = {
  isDevelopment,
  isProduction,
  apiBaseUrl: API_BASE_URL,
  version: import.meta.env.VITE_APP_VERSION || '1.0.0',
};