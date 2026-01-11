/**
 * Authentication types and interfaces
 */

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
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
  success?: boolean;
  user?: User;
  accessToken?: string;
  refreshToken?: string;
  expiresIn?: number;
}

export interface RefreshTokenResponse {
  accessToken: string;
  expiresIn: number;
}

export interface EmailStatusResponse {
  existsAs: 'client' | 'user' | null;
  registered: boolean;
  clientStatus?: 'IN_PROGRESS' | 'COMPLETED' | 'PENDING';
  onboardingStep?: string; // e.g., 'phone_verification', 'active_customers', etc.
  message?: string;
}

// Helper type for simplified access
export interface EmailStatus {
  exists: boolean;
  isRegistered: boolean;
  clientStatus?: 'IN_PROGRESS' | 'COMPLETED' | 'PENDING';
  onboardingStep?: string;
  message?: string;
}
