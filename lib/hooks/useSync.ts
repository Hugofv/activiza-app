/**
 * Hook for sync operations
 */
import { useMutation, useQuery } from '@tanstack/react-query';

import { getQueueSize } from '../storage/queue';
import { SyncResult, syncQueueWithRetry } from '../sync/syncManager';

/**
 * Hook to get queue size and sync status
 */
export function useSync() {
  // Get queue size
  const { data: queueSize = 0 } = useQuery({
    queryKey: ['sync', 'queueSize'],
    queryFn: getQueueSize,
    refetchInterval: 5000, // Check every 5 seconds
  });

  // Sync mutation
  const syncMutation = useMutation({
    mutationFn: syncQueueWithRetry,
    onSuccess: (result: SyncResult) => {
      console.log('Sync completed:', result);
    },
    onError: (error) => {
      console.error('Sync error:', error);
    },
  });

  return {
    queueSize,
    hasPendingItems: queueSize > 0,
    sync: syncMutation.mutate,
    isSyncing: syncMutation.isPending,
    syncError: syncMutation.error,
    lastSyncResult: syncMutation.data,
  };
}
