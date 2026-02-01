/**
 * Sync manager for processing offline queue when connection is restored
 */
import { apiClient } from '../api/client';
import {
  QueuedRequest,
  dequeueRequest,
  getQueuedRequests,
  incrementRetryCount,
} from '../storage/queue';
import { isOnline } from './networkMonitor';

export interface SyncResult {
  success: number;
  failed: number;
  total: number;
}

/**
 * Process a single queued request
 */
async function processQueuedRequest(request: QueuedRequest): Promise<boolean> {
  try {
    // Check if we have connection
    if (!isOnline()) {
      console.log('Still offline, skipping sync');
      return false;
    }

    // Execute the request
    const response = await apiClient.request({
      method: request.method,
      url: request.url,
      data: request.data,
      headers: request.headers,
    });

    // If successful, remove from queue
    if (response.status >= 200 && response.status < 300) {
      await dequeueRequest(request.id);
      return true;
    }

    // If failed, increment retry count
    await incrementRetryCount(request.id);
    return false;
  } catch (error: any) {
    console.error(`Error processing queued request ${request.id}:`, error);

    // If it's a network error and we're still online, retry later
    if (error.isNetworkError && isOnline()) {
      await incrementRetryCount(request.id);
    } else if (!isOnline()) {
      // Still offline, don't increment retry
      return false;
    } else {
      // Other error, increment retry
      await incrementRetryCount(request.id);
    }

    return false;
  }
}

/**
 * Sync all queued requests
 */
export async function syncQueue(): Promise<SyncResult> {
  const result: SyncResult = {
    success: 0,
    failed: 0,
    total: 0,
  };

  try {
    // Check if online
    if (!isOnline()) {
      console.log('Cannot sync: device is offline');
      return result;
    }

    // Get all queued requests
    const queuedRequests = await getQueuedRequests();
    result.total = queuedRequests.length;

    if (queuedRequests.length === 0) {
      console.log('No queued requests to sync');
      return result;
    }

    console.log(`Syncing ${queuedRequests.length} queued requests...`);

    // Process requests sequentially to avoid overwhelming the server
    for (const request of queuedRequests) {
      const success = await processQueuedRequest(request);
      if (success) {
        result.success++;
      } else {
        result.failed++;
      }

      // Small delay between requests to avoid rate limiting
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    console.log(
      `Sync completed: ${result.success} succeeded, ${result.failed} failed`
    );
    return result;
  } catch (error) {
    console.error('Error syncing queue:', error);
    return result;
  }
}

/**
 * Sync queue with retry logic
 */
export async function syncQueueWithRetry(maxRetries = 3): Promise<SyncResult> {
  let attempts = 0;
  let lastResult: SyncResult = {
 success: 0,
failed: 0,
total: 0 
};

  while (attempts < maxRetries) {
    attempts++;
    lastResult = await syncQueue();

    // If all succeeded or we're offline, stop retrying
    if (lastResult.failed === 0 || !isOnline()) {
      break;
    }

    // Wait before retrying (exponential backoff)
    if (attempts < maxRetries) {
      const delay = Math.min(1000 * Math.pow(2, attempts - 1), 10000);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  return lastResult;
}
