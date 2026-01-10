/**
 * API endpoints constants and configuration
 */

// Base URL from environment or default
export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'https://api.ativiza.com';

// API endpoints
export const ENDPOINTS = {
  // Auth endpoints
  AUTH: {
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    REFRESH_TOKEN: '/auth/refresh',
    VERIFY_EMAIL: '/auth/verify-email',
    VERIFY_PHONE: '/auth/verify-phone',
    RESEND_CODE: '/auth/resend-code',
  },
  
  // Onboarding endpoints
  ONBOARDING: {
    SAVE: '/onboarding/save',
    SUBMIT: '/onboarding/submit',
  },
  
  // User endpoints
  USER: {
    PROFILE: '/user/profile',
    UPDATE_PROFILE: '/user/profile',
  },
} as const;

// Request timeout (ms)
export const REQUEST_TIMEOUT = 30000;

// Retry configuration
export const RETRY_CONFIG = {
  maxRetries: 3,
  retryDelay: 1000, // ms
  retryableStatusCodes: [408, 429, 500, 502, 503, 504],
};
