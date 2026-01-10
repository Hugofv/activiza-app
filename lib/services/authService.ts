/**
 * Authentication service
 */
import { apiClient } from '../api/client';
import { ENDPOINTS } from '../api/endpoints';
import { queryClient } from '../api/queryClient';
import {
  clearTokens,
  getRefreshToken,
  isTokenExpired,
  setAccessToken,
  setRefreshToken,
  setTokenExpiry,
} from '../storage/secureStorage';
import { AuthResponse, EmailStatus, EmailStatusResponse, LoginCredentials, RefreshTokenResponse, User } from '../types/authTypes';

// Use the extended config type for skipAuth
type ApiConfig = { skipAuth?: boolean };

/**
 * Login with email and password
 */
export async function login(credentials: LoginCredentials): Promise<AuthResponse> {
  try {
    const response = await apiClient.post<AuthResponse>(
      ENDPOINTS.AUTH.LOGIN,
      credentials,
      { skipAuth: true } as ApiConfig
    );

    const { user, tokens } = response.data;

    // Store tokens securely
    await setAccessToken(tokens.accessToken);
    await setRefreshToken(tokens.refreshToken);
    await setTokenExpiry(tokens.expiresIn);

    // Update query client cache with user data
    queryClient.setQueryData<User>(['auth', 'user'], user);

    return response.data;
  } catch (error: any) {
    console.error('Login error:', error);
    throw error;
  }
}

/**
 * Logout - clear tokens and cache
 */
export async function logout(): Promise<void> {
  try {
    // Call logout endpoint (optional, may fail if offline)
    try {
      await apiClient.post(ENDPOINTS.AUTH.LOGOUT, {}, { skipAuth: false });
    } catch (error) {
      // Continue even if logout endpoint fails (e.g., offline)
      console.warn('Logout endpoint failed, continuing with local cleanup:', error);
    }

    // Clear tokens
    await clearTokens();

    // Clear query cache
    queryClient.removeQueries({ queryKey: ['auth'] });
    queryClient.clear();
  } catch (error) {
    console.error('Logout error:', error);
    throw error;
  }
}

/**
 * Refresh access token using refresh token
 */
export async function refreshAccessToken(): Promise<string> {
  try {
    const refreshToken = await getRefreshToken();
    
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await apiClient.post<RefreshTokenResponse>(
      ENDPOINTS.AUTH.REFRESH_TOKEN,
      { refreshToken },
      { skipAuth: true } as ApiConfig
    );

    const { accessToken, expiresIn } = response.data;

    // Store new tokens
    await setAccessToken(accessToken);
    await setTokenExpiry(expiresIn);

    return accessToken;
  } catch (error: any) {
    console.error('Refresh token error:', error);
    
    // If refresh fails, clear tokens and force re-login
    await clearTokens();
    queryClient.removeQueries({ queryKey: ['auth'] });
    
    throw error;
  }
}

/**
 * Verify if token needs refresh and refresh if necessary
 */
export async function ensureValidToken(): Promise<string | null> {
  try {
    const tokenExpired = await isTokenExpired();
    
    if (tokenExpired) {
      console.log('Token expired or expiring soon, refreshing...');
      return await refreshAccessToken();
    }

    // Token is still valid
    const { getAccessToken } = await import('../storage/secureStorage');
    return await getAccessToken();
  } catch (error) {
    console.error('Error ensuring valid token:', error);
    return null;
  }
}

/**
 * Verify email with code
 */
export async function verifyEmail(email: string, code: string): Promise<boolean> {
  try {
    const response = await apiClient.post(
      ENDPOINTS.AUTH.VERIFY_EMAIL,
      { email, code },
      { skipAuth: true } as ApiConfig
    );

    return response.status === 200;
  } catch (error: any) {
    console.error('Verify email error:', error);
    throw error;
  }
}

/**
 * Verify phone with code
 */
export async function verifyPhone(phone: string, code: string): Promise<boolean> {
  try {
    const response = await apiClient.post(
      ENDPOINTS.AUTH.VERIFY_PHONE,
      { phone, code },
      { skipAuth: true } as ApiConfig
    );

    return response.status === 200;
  } catch (error: any) {
    console.error('Verify phone error:', error);
    throw error;
  }
}

/**
 * Resend verification code
 */
export async function resendVerificationCode(emailOrPhone: string, type: 'email' | 'phone'): Promise<boolean> {
  try {
    const endpoint = type === 'email' 
      ? ENDPOINTS.AUTH.RESEND_CODE 
      : ENDPOINTS.AUTH.RESEND_CODE;

    const response = await apiClient.post(
      endpoint,
      { [type]: emailOrPhone },
      { skipAuth: true } as ApiConfig
    );

    return response.status === 200;
  } catch (error: any) {
    console.error('Resend code error:', error);
    throw error;
  }
}

/**
 * Get current user from cache
 */
export function getCurrentUser(): User | undefined {
  return queryClient.getQueryData<User>(['auth', 'user']);
}

/**
 * Check if email exists and registration status
 * GET /onboarding/check-email?email=user@example.com
 */
export async function checkEmailStatus(email: string): Promise<EmailStatus> {
  try {
    const response = await apiClient.get<EmailStatusResponse>(
      `${ENDPOINTS.ONBOARDING.CHECK_EMAIL}?email=${encodeURIComponent(email)}`,
      { skipAuth: true } as ApiConfig
    );

    const { data } = response.data;

    // Transform API response to simplified format
    return {
      exists: data.existsAs !== null,
      isRegistered: data.registered,
      clientStatus: data.clientStatus,
      onboardingStep: data.onboardingStep,
      message: data.message,
    };
  } catch (error: any) {
    console.error('Check email status error:', error);
    throw error;
  }
}
