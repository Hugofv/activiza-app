/**
 * Hook to check authentication status and guard routes
 */
import { useMemo } from 'react';

import { router } from 'expo-router';

import { useQuery, useQueryClient } from '@tanstack/react-query';

import {
  createStepToRouteMap,
  getNextStep,
  getStepByApiName,
  isOnboardingCompleted,
} from '../config/onboardingSteps';
import { ensureValidToken, getCurrentUser } from '../services/authService';
import { getOnboardingData } from '../services/onboardingService';
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
  const { data: hasValidToken = false, isLoading: isTokenLoading } =
    useQuery<boolean>({
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

  const isAuthenticated = useMemo(
    () => !!(user && hasValidToken),
    [user, hasValidToken]
  );

  const isChecking = isUserLoading || isTokenLoading;

  const redirectToLogin = (source?: string) => {
    const context = source
      ? `[redirectToLogin:${source}]`
      : '[redirectToLogin]';
    console.log(
      `${context} Redirecting to /auth/email (isAuthenticated=${isAuthenticated})`
    );
    router.replace('/auth/email');
  };

  /**
   * Resolve where an authenticated user should go based on onboarding status.
   * Centralized logic used after login and on app start.
   */
  const resolvePostAuthRoute = async (): Promise<string> => {
    try {
      console.log(
        '[AuthGuard] Resolving post-auth route based on onboarding status...'
      );
      const data = await getOnboardingData();
      const { clientStatus, onboardingStep } = data ?? {};

      // Normalize status for completion helper (PENDING treated as not completed)
      const normalizedStatus =
        clientStatus === 'PENDING'
          ? undefined
          : (clientStatus as 'IN_PROGRESS' | 'COMPLETED' | undefined);

      const completed = isOnboardingCompleted(normalizedStatus);

      console.log('[AuthGuard] Onboarding status:', {
        clientStatus,
        onboardingStep,
        completed,
      });

      if (completed) {
        console.log('[AuthGuard] Onboarding completed → tabs home');
        return '/(tabs)/home';
      }

      // User must finish onboarding instead of going to home
      const stepToRouteMap = createStepToRouteMap();
      const apiStepName = onboardingStep || 'document'; // fallback to first protected step

      // If API points to a verification step (e.g. email_verification), skip to the next real step
      const stepInfo = getStepByApiName(apiStepName);
      let targetStep = apiStepName;

      if (stepInfo?.isVerificationStep) {
        const nextStep = getNextStep(stepInfo.key);
        if (nextStep) {
          targetStep = nextStep.apiStepName;
          console.log(
            `[AuthGuard] Skipping verification step ${apiStepName}, redirecting to next step: ${targetStep}`
          );
        }
      }

      const route = stepToRouteMap[targetStep] || '/onboarding/document';

      console.log(
        '[AuthGuard] Redirecting authenticated user to onboarding route:',
        {
          route,
          targetStep,
        }
      );

      return route as string;
    } catch (error) {
      console.error(
        '[AuthGuard] Error resolving post-auth route; defaulting to home tabs',
        error
      );
      return '/(tabs)/home';
    }
  };

  /**
   * Redirect an authenticated user to the correct route (home vs onboarding)
   * based on onboarding status.
   */
  const redirectAfterAuth = async () => {
    const route = await resolvePostAuthRoute();
    router.replace(route as any);
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
    resolvePostAuthRoute,
    redirectAfterAuth,
  };
}
