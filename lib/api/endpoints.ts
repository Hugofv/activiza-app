/**
 * API endpoints constants and configuration
 */

// Base URL from environment or default
// Expo SDK 50+ automatically loads EXPO_PUBLIC_* variables from .env file
// Note: You may need to restart the Expo server after changing .env
// Variables are injected at build time by Metro bundler
export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'https://api.ativiza.com';


const PREFIX = '/api/';
// API endpoints
export const ENDPOINTS = {
  // Auth endpoints
  AUTH: {
    LOGIN: `${PREFIX}/auth/login`,
    LOGOUT: `${PREFIX}/auth/logout`,
    REFRESH_TOKEN: `${PREFIX}/auth/refresh`,
    VERIFY_EMAIL: `${PREFIX}/auth/verify-email`,
    VERIFY_PHONE: `${PREFIX}/auth/verify-phone`,
    RESEND_CODE: `${PREFIX}/auth/resend-code`,
  },
  
  // Onboarding endpoints
  ONBOARDING: {
    SAVE: `${PREFIX}/onboarding/save`,
    SUBMIT: `${PREFIX}/onboarding/submit`,
    CHECK_EMAIL: `${PREFIX}/onboarding/check-email`,
  },
  
  // User endpoints
  USER: {
    PROFILE: `${PREFIX}/user/profile`,
    UPDATE_PROFILE: `${PREFIX}/user/profile`,
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
