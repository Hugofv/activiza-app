/**
 * Wrapper for expo-secure-store for secure token storage
 */
import * as SecureStore from 'expo-secure-store';

const TOKEN_KEYS = {
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
  TOKEN_EXPIRY: 'token_expiry',
} as const;

/**
 * Store access token securely
 */
export async function setAccessToken(
  token: string | null | undefined
): Promise<boolean> {
  try {
    // SecureStore requires string values - validate and convert if necessary
    if (!token) {
      console.error('Error storing access token: token is null or undefined');
      return false;
    }

    // Ensure token is a string
    const tokenString = typeof token === 'string' ? token : String(token);

    if (!tokenString || tokenString.trim().length === 0) {
      console.error('Error storing access token: token is empty');
      return false;
    }

    await SecureStore.setItemAsync(TOKEN_KEYS.ACCESS_TOKEN, tokenString);
    return true;
  } catch (error) {
    console.error('Error storing access token:', error);
    return false;
  }
}

/**
 * Get access token from secure storage
 */
export async function getAccessToken(): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync(TOKEN_KEYS.ACCESS_TOKEN);
  } catch (error) {
    console.error('Error getting access token:', error);
    return null;
  }
}

/**
 * Store refresh token securely
 */
export async function setRefreshToken(
  token: string | null | undefined
): Promise<boolean> {
  try {
    // SecureStore requires string values - validate and convert if necessary
    if (!token) {
      console.error('Error storing refresh token: token is null or undefined');
      return false;
    }

    // Ensure token is a string
    const tokenString = typeof token === 'string' ? token : String(token);

    if (!tokenString || tokenString.trim().length === 0) {
      console.error('Error storing refresh token: token is empty');
      return false;
    }

    await SecureStore.setItemAsync(TOKEN_KEYS.REFRESH_TOKEN, tokenString);
    return true;
  } catch (error) {
    console.error('Error storing refresh token:', error);
    return false;
  }
}

/**
 * Get refresh token from secure storage
 */
export async function getRefreshToken(): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync(TOKEN_KEYS.REFRESH_TOKEN);
  } catch (error) {
    console.error('Error getting refresh token:', error);
    return null;
  }
}

/**
 * Store token expiry timestamp
 */
export async function setTokenExpiry(expiresIn: number): Promise<boolean> {
  try {
    const expiryTime = Date.now() + expiresIn * 1000;
    await SecureStore.setItemAsync(
      TOKEN_KEYS.TOKEN_EXPIRY,
      expiryTime.toString()
    );
    return true;
  } catch (error) {
    console.error('Error storing token expiry:', error);
    return false;
  }
}

/**
 * Get token expiry timestamp
 */
export async function getTokenExpiry(): Promise<number | null> {
  try {
    const expiry = await SecureStore.getItemAsync(TOKEN_KEYS.TOKEN_EXPIRY);
    return expiry ? parseInt(expiry, 10) : null;
  } catch (error) {
    console.error('Error getting token expiry:', error);
    return null;
  }
}

/**
 * Check if token is expired or will expire soon (within 5 minutes)
 */
export async function isTokenExpired(bufferMinutes = 5): Promise<boolean> {
  try {
    const expiry = await getTokenExpiry();
    if (!expiry) return true;
    const buffer = bufferMinutes * 60 * 1000;
    return Date.now() >= expiry - buffer;
  } catch (error) {
    console.error('Error checking token expiry:', error);
    return true;
  }
}

/**
 * Clear all tokens from secure storage
 */
export async function clearTokens(): Promise<boolean> {
  try {
    await Promise.all([
      SecureStore.deleteItemAsync(TOKEN_KEYS.ACCESS_TOKEN),
      SecureStore.deleteItemAsync(TOKEN_KEYS.REFRESH_TOKEN),
      SecureStore.deleteItemAsync(TOKEN_KEYS.TOKEN_EXPIRY),
    ]);
    return true;
  } catch (error) {
    console.error('Error clearing tokens:', error);
    return false;
  }
}
