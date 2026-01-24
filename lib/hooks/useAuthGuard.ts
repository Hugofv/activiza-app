/**
 * Hook to check authentication status and guard routes
 */
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import { useMemo } from 'react';
import { ensureValidToken, getCurrentUser } from '../services/authService';
import { getAccessToken } from '../storage/secureStorage';
import { User } from '../types/authTypes';

export function useAuthGuard() {
  const queryClient = useQueryClient();

  // Use React Query to observe auth state changes
  // Reacts to changes in ['auth', 'user'] query (updated by login/register)
  const { data: user, isLoading: isUserLoading } = useQuery<User | null>({
    queryKey: ['auth', 'user'],
    queryFn: async () => {
      try {
        // Check if we have a valid token
        const token = await getAccessToken();
        if (!token) {
          return null;
        }

        // Verify token is valid and not expired
        const validToken = await ensureValidToken();
        if (!validToken) {
          return null;
        }

        // Get user from cache (should be set by login/register)
        return getCurrentUser() || null;
      } catch (error) {
        console.error('Auth check error:', error);
        return null;
      }
    },
    staleTime: Infinity, // User data doesn't go stale until logout
    gcTime: 1000 * 60 * 60 * 24, // 24 hours
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  });

  // Check if we have a valid token (separate from user check)
  const { data: hasValidToken = false, isLoading: isTokenLoading } = useQuery<boolean>({
    queryKey: ['auth', 'token-valid'],
    queryFn: async () => {
      try {
        const token = await getAccessToken();
        if (!token) return false;
        const validToken = await ensureValidToken();
        return !!validToken;
      } catch {
        return false;
      }
    },
    staleTime: 0, // Always check token validity fresh
    gcTime: 0,
    refetchOnMount: true,
  });

  const isAuthenticated = useMemo(() => {
    return !!(user && hasValidToken);
  }, [user, hasValidToken]);

  const isChecking = isUserLoading || isTokenLoading;

  const redirectToLogin = (source?: string) => {
    const context = source ? `[redirectToLogin:${source}]` : '[redirectToLogin]';
    console.log(
      `${context} Redirecting to /auth/email (isAuthenticated=${isAuthenticated})`
    );
    router.replace('/auth/email');
  };

  // Function to refresh auth status (useful after login/register)
  const refreshAuth = async () => {
    // Invalidate all auth queries to force refresh
    queryClient.invalidateQueries({ queryKey: ['auth'] });
    // Refetch queries immediately
    await queryClient.refetchQueries({ queryKey: ['auth'] });
  };

  return {
    isAuthenticated,
    isChecking,
    refreshAuth,
    redirectToLogin,
  };
}
