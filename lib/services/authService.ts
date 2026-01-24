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
import {
  AuthResponse,
  EmailStatus,
  EmailStatusResponse,
  LoginCredentials,
  RefreshTokenResponse,
  RegisterCredentials,
  User,
} from '../types/authTypes';

// Use the extended config type for skipAuth
type ApiConfig = { skipAuth?: boolean };

/**
 * Register new user with email and password
 */
export async function register(
  credentials: RegisterCredentials
): Promise<AuthResponse> {
  try {
    const response = await apiClient.post<AuthResponse>(
      ENDPOINTS.AUTH.REGISTER,
      credentials,
      { skipAuth: true } as ApiConfig
    );

    console.log('Register response:', JSON.stringify(response.data, null, 2));

    const { user, accessToken, refreshToken, expiresIn } = response.data;

    // Validate tokens before storing
    if (!accessToken || !refreshToken) {
      console.error('Invalid response: missing tokens', { accessToken: !!accessToken, refreshToken: !!refreshToken });
      throw new Error('Invalid response: access token or refresh token is missing');
    }

    // Ensure tokens are strings
    const accessTokenString = String(accessToken);
    const refreshTokenString = String(refreshToken);

    // Store tokens securely after registration
    await setAccessToken(accessTokenString);
    await setRefreshToken(refreshTokenString);
    await setTokenExpiry(expiresIn || 0);

    // Update query client cache with user data
    queryClient.setQueryData<User>(['auth', 'user'], user);

    // Invalidate token validation query to ensure auth guard detects authentication immediately
    queryClient.invalidateQueries({ queryKey: ['auth', 'token-valid'] });

    return response.data;
  } catch (error: any) {
    console.error('Register error:', error);
    throw error;
  }
}

/**
 * Login with email and password
 */
export async function login(
  credentials: LoginCredentials
): Promise<AuthResponse> {
  try {
    const response = await apiClient.post<AuthResponse>(
      ENDPOINTS.AUTH.LOGIN,
      credentials,
      { skipAuth: true } as ApiConfig
    );

    // Handle response structure: API may return { success: true, data: {...} } or direct data
    const responseData = (response.data as any).data || response.data;
    const { user, accessToken, refreshToken, expiresIn } = responseData;

    // Validate tokens before storing
    if (!accessToken || !refreshToken) {
      console.error('Invalid response: missing tokens', { accessToken: !!accessToken, refreshToken: !!refreshToken });
      throw new Error('Invalid response: access token or refresh token is missing');
    }

    // Ensure tokens are strings
    const accessTokenString = String(accessToken);
    const refreshTokenString = String(refreshToken);

    // Store tokens securely
    await setAccessToken(accessTokenString);
    await setRefreshToken(refreshTokenString);
    await setTokenExpiry(expiresIn);

    // Update query client cache with user data
    queryClient.setQueryData<User>(['auth', 'user'], user);

    // Invalidate token validation query to ensure auth guard detects authentication immediately
    queryClient.invalidateQueries({ queryKey: ['auth', 'token-valid'] });

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
      await apiClient.post(ENDPOINTS.AUTH.LOGOUT, {});
    } catch (error) {
      // Continue even if logout endpoint fails (e.g., offline)
      console.warn(
        'Logout endpoint failed, continuing with local cleanup:',
        error
      );
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
 * Send verification code (email or phone)
 * POST /api/auth/verify/send
 * Body: { type: "email" | "phone", contact: "user@example.com" }
 */
export async function sendVerificationCode(
  contact: string,
  type: 'email' | 'phone'
): Promise<boolean> {
  try {
    const response = await apiClient.post(
      ENDPOINTS.AUTH.VERIFY_SEND,
      { type, contact },
    );

    return response.status === 200;
  } catch (error: any) {
    console.error('Send verification code error:', error);
    throw error;
  }
}

/**
 * Verify code (email or phone)
 * POST /api/auth/verify
 * Body: { type: "email" | "phone", code: "123456" }
 * Note: Requires authentication token
 */
export async function verifyCode(
  type: 'email' | 'phone',
  code: string
): Promise<boolean> {
  try {
    const response = await apiClient.post(
      ENDPOINTS.AUTH.VERIFY,
      { type, code },
    );

    return response.status === 200;
  } catch (error: any) {
    console.error('Verify code error:', error);
    throw error;
  }
}

/**
 * Verify email with code (wrapper for backward compatibility)
 */
export async function verifyEmail(
  code: string
): Promise<boolean> {
  // Note: The API uses unified verify endpoint with type field
  // This function is kept for backward compatibility
  return verifyCode('email', code);
}

/**
 * Verify phone with code (wrapper for backward compatibility)
 */
export async function verifyPhone(
  phone: string,
  code: string
): Promise<boolean> {
  // Note: The API uses unified verify endpoint with type field
  // This function is kept for backward compatibility
  return verifyCode('phone', code);
}

/**
 * Resend verification code
 * POST /api/auth/verify/resend
 * Body: { type: "email" | "phone" }
 * Note: Requires authentication token
 */
export async function resendVerificationCode(
  type: 'email' | 'phone'
): Promise<boolean> {
  try {
    const response = await apiClient.post(
      ENDPOINTS.AUTH.VERIFY_RESEND,
      { type }
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
 * GET /auth/check-email?email=user@example.com (public route)
 */
export async function checkEmailStatus(email: string): Promise<EmailStatus> {
  try {
    const response = await apiClient.get<EmailStatusResponse>(
      `${ENDPOINTS.AUTH.CHECK_EMAIL}?email=${encodeURIComponent(email)}`,
      { skipAuth: true } as ApiConfig
    );

    // Axios returns data in response.data
    const data = response.data;
    console.log('Check email status response:', JSON.stringify(data, null, 2));

    // Transform API response to simplified format, preserving original fields
    return {
      ...data,
      // Explicitly derive helper flags from API fields
      // Treat any value different from 'none'/null as existing
      exists: !!data.existsAs && data.existsAs !== 'none',
      isRegistered: data.registered,
    };
  } catch (error: any) {
    console.error('Check email status error:', error);
    throw error;
  }
}

/**
 * Request password reset - sends verification code to email
 * POST /auth/forgot-password
 * Body: { email: "user@example.com" }
 */
export async function requestPasswordReset(email: string): Promise<boolean> {
  try {
    const response = await apiClient.post(
      ENDPOINTS.AUTH.FORGOT_PASSWORD,
      { email },
      { skipAuth: true } as ApiConfig
    );

    return response.status === 200;
  } catch (error: any) {
    console.error('Request password reset error:', error);
    throw error;
  }
}

/**
 * Reset password with token
 * POST /auth/reset-password
 * Body: { token: "reset-token-from-email-link", password: "newPassword123" }
 */
export async function resetPassword(
  token: string,
  password: string
): Promise<boolean> {
  try {
    const response = await apiClient.post(
      ENDPOINTS.AUTH.RESET_PASSWORD,
      { token, password },
      { skipAuth: true } as ApiConfig
    );

    return response.status === 200;
  } catch (error: any) {
    console.error('Reset password error:', error);
    throw error;
  }
}
