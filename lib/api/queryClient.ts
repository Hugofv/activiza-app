/**
 * React Query Client configuration with persistence
 */
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';
import { DefaultOptions, QueryClient } from '@tanstack/react-query';

import AsyncStorage from '@react-native-async-storage/async-storage';

// Query client options
const queryClientOptions: DefaultOptions = {
  queries: {
    // Stale time: data is considered fresh for 5 minutes
    staleTime: 1000 * 60 * 5,
    // Cache time: data stays in cache for 24 hours
    gcTime: 1000 * 60 * 60 * 24,
    // Retry failed requests
    retry: (failureCount, error: any) => {
      // Don't retry on 4xx errors (client errors)
      if (error?.statusCode >= 400 && error?.statusCode < 500) {
        return false;
      }
      // Retry up to 3 times for other errors
      return failureCount < 3;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    // Refetch on window focus (when app comes to foreground)
    refetchOnWindowFocus: true,
    // Refetch on reconnect
    refetchOnReconnect: true,
    // Don't refetch on mount if data is fresh
    refetchOnMount: false,
  },
  mutations: {
    // Retry failed mutations once
    retry: 1,
    retryDelay: 1000,
  },
};

// Create query client
export const queryClient = new QueryClient({
  defaultOptions: queryClientOptions,
});

// Create persister for AsyncStorage
export const asyncStoragePersister = createAsyncStoragePersister({
  storage: AsyncStorage,
  key: '@ativiza:query-cache',
  serialize: JSON.stringify,
  deserialize: JSON.parse,
});

/**
 * Persist query client options for PersistQueryClientProvider
 */
export const persistOptions = {
  persister: asyncStoragePersister,
  maxAge: 1000 * 60 * 60 * 24, // 24 hours
};

/**
 * Clear persisted query cache
 */
export async function clearQueryCache() {
  try {
    await queryClient.clear();
    await AsyncStorage.removeItem('@ativiza:query-cache');
  } catch (error) {
    console.error('Error clearing query cache:', error);
  }
}

/**
 * Get persisted query cache size (for debugging)
 */
export async function getQueryCacheSize(): Promise<number> {
  try {
    const cache = await AsyncStorage.getItem('@ativiza:query-cache');
    return cache ? JSON.stringify(cache).length : 0;
  } catch (error) {
    console.error('Error getting query cache size:', error);
    return 0;
  }
}
