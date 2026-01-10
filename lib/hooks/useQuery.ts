/**
 * Wrapper hook for offline-safe queries
 * This is a re-export with additional offline handling capabilities
 * For most cases, use @tanstack/react-query's useQuery directly
 */
export { useQuery } from '@tanstack/react-query';

/**
 * Helper function to create query options with offline-first defaults
 */
export function createOfflineQueryOptions<TData = any>(options: {
  queryKey: readonly unknown[];
  queryFn: () => Promise<TData>;
  staleTime?: number;
  gcTime?: number;
}) {
  return {
    ...options,
    staleTime: options.staleTime ?? 1000 * 60 * 5, // 5 minutes default
    gcTime: options.gcTime ?? 1000 * 60 * 60 * 24, // 24 hours default
    refetchOnMount: false, // Don't refetch if data is fresh
    refetchOnWindowFocus: true, // Refetch when app comes to foreground
    refetchOnReconnect: true, // Refetch when connection restored
  };
}
