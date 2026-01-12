/**
 * API endpoints constants and configuration
 */

// Base URL from environment or default
// Expo SDK 50+ automatically loads EXPO_PUBLIC_* variables from .env file
// Note: You may need to restart the Expo server after changing .env
// Variables are injected at build time by Metro bundler
export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL || 'https://api.ativiza.com';

const PREFIX = '/api';
// API endpoints
export const ENDPOINTS = {
  // Auth endpoints (public routes)
  AUTH: {
    REGISTER: `/auth/register`,
    LOGIN: `/auth/login`,
    LOGOUT: `/auth/logout`,
    REFRESH_TOKEN: `/auth/refresh`,
    VERIFY_SEND: `/auth/verify/send`,      // Send verification code
    VERIFY: `/auth/verify`,                // Verify code
    VERIFY_RESEND: `/auth/verify/resend`,  // Resend verification code
    CHECK_EMAIL: `/auth/check-email`,
  },

  // Onboarding endpoints (protected routes - require authentication)
  ONBOARDING: {
    GET: `${PREFIX}/onboarding`,
    SAVE: `${PREFIX}/onboarding/save`,
    SUBMIT: `${PREFIX}/onboarding/submit`,
  },

  // User endpoints
  USER: {
    PROFILE: `${PREFIX}/user/profile`,
    UPDATE_PROFILE: `${PREFIX}/user/profile`,
  },

  // Modules endpoints
  MODULES: {
    GET: `${PREFIX}/modules`,
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
