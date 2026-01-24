/**
 * Hook for authentication operations
 */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ensureValidToken, getCurrentUser, login, logout } from '../services/authService';
import { LoginCredentials, User } from '../types/authTypes';

/**
 * Hook for authentication
 */
export function useAuth() {
  const queryClient = useQueryClient();

  // Get current user from cache
  const { data: user } = useQuery<User | null>({
    queryKey: ['auth', 'user'],
    queryFn: async () => {
      const tokenValid = await ensureValidToken();
      if (!tokenValid) {
        return null;
      }
      return getCurrentUser() || null;
    },
    staleTime: Infinity, // User data doesn't go stale
    gcTime: 1000 * 60 * 60 * 24, // 24 hours
  });

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: (credentials: LoginCredentials) => login(credentials),
    onSuccess: (data) => {
      queryClient.setQueryData<User>(['auth', 'user'], data.user);
    },
    onError: (error) => {
      console.error('Login error:', error);
    },
  });

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: logout,
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: ['auth'] });
      queryClient.clear();
    },
    onError: (error) => {
      console.error('Logout error:', error);
      // Still clear local state even if logout endpoint fails
      queryClient.removeQueries({ queryKey: ['auth'] });
      queryClient.clear();
    },
  });

  return {
    user: user || null,
    isAuthenticated: !!user,
    login: loginMutation.mutate,
    logout: logoutMutation.mutate,
    logoutAsync: logoutMutation.mutateAsync,
    isLoading: loginMutation.isPending,
    isLoggingOut: logoutMutation.isPending,
    loginError: loginMutation.error,
  };
}
