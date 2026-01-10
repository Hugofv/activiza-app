/**
 * Authentication types and interfaces
 */

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number; // seconds
}

export interface User {
  id: string;
  email: string;
  name: string;
  [key: string]: any;
}

export interface AuthResponse {
  user: User;
  tokens: AuthTokens;
}

export interface RefreshTokenResponse {
  accessToken: string;
  expiresIn: number;
}

export interface EmailStatusResponse {
  success: boolean;
  data: {
    email: string;
    registered: boolean;
    existsAs: 'client' | 'user' | null;
    clientStatus?: 'IN_PROGRESS' | 'COMPLETED' | 'PENDING';
    onboardingStep?: string; // e.g., 'phone_verification', 'active_customers', etc.
    message?: string;
  };
}

// Helper type for simplified access
export interface EmailStatus {
  exists: boolean;
  isRegistered: boolean;
  clientStatus?: 'IN_PROGRESS' | 'COMPLETED' | 'PENDING';
  onboardingStep?: string;
  message?: string;
}
