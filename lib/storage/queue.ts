/**
 * Offline queue management for failed/offline requests
 */
import { getStorageItem, removeStorageItem, setStorageItem } from './asyncStorage';

export interface QueuedRequest {
  id: string;
  method: 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  url: string;
  data?: any;
  headers?: Record<string, string>;
  timestamp: number;
  retryCount: number;
}

const QUEUE_STORAGE_KEY = 'offline_queue';
const MAX_RETRIES = 3;
const MAX_QUEUE_SIZE = 100;

/**
 * Add a request to the offline queue
 */
export async function enqueueRequest(request: Omit<QueuedRequest, 'id' | 'timestamp' | 'retryCount'>): Promise<string> {
  try {
    const queue = await getStorageItem<QueuedRequest[]>(QUEUE_STORAGE_KEY) || [];
    
    // Prevent queue from growing too large
    if (queue.length >= MAX_QUEUE_SIZE) {
      console.warn('Offline queue is full, removing oldest items');
      queue.splice(0, queue.length - MAX_QUEUE_SIZE + 1);
    }
    
    const queuedRequest: QueuedRequest = {
      ...request,
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      retryCount: 0,
    };
    
    queue.push(queuedRequest);
    await setStorageItem(QUEUE_STORAGE_KEY, queue);
    
    return queuedRequest.id;
  } catch (error) {
    console.error('Error enqueueing request:', error);
    throw error;
  }
}

/**
 * Get all queued requests
 */
export async function getQueuedRequests(): Promise<QueuedRequest[]> {
  try {
    return await getStorageItem<QueuedRequest[]>(QUEUE_STORAGE_KEY) || [];
  } catch (error) {
    console.error('Error getting queued requests:', error);
    return [];
  }
}

/**
 * Remove a request from the queue
 */
export async function dequeueRequest(requestId: string): Promise<boolean> {
  try {
    const queue = await getStorageItem<QueuedRequest[]>(QUEUE_STORAGE_KEY) || [];
    const filteredQueue = queue.filter((req) => req.id !== requestId);
    await setStorageItem(QUEUE_STORAGE_KEY, filteredQueue);
    return true;
  } catch (error) {
    console.error('Error dequeuing request:', error);
    return false;
  }
}

/**
 * Increment retry count for a request
 */
export async function incrementRetryCount(requestId: string): Promise<boolean> {
  try {
    const queue = await getStorageItem<QueuedRequest[]>(QUEUE_STORAGE_KEY) || [];
    const request = queue.find((req) => req.id === requestId);
    
    if (!request) {
      return false;
    }
    
    request.retryCount += 1;
    
    // Remove if max retries exceeded
    if (request.retryCount >= MAX_RETRIES) {
      const filteredQueue = queue.filter((req) => req.id !== requestId);
      await setStorageItem(QUEUE_STORAGE_KEY, filteredQueue);
      console.warn(`Request ${requestId} exceeded max retries, removing from queue`);
      return false;
    }
    
    await setStorageItem(QUEUE_STORAGE_KEY, queue);
    return true;
  } catch (error) {
    console.error('Error incrementing retry count:', error);
    return false;
  }
}

/**
 * Clear all queued requests
 */
export async function clearQueue(): Promise<boolean> {
  try {
    await removeStorageItem(QUEUE_STORAGE_KEY);
    return true;
  } catch (error) {
    console.error('Error clearing queue:', error);
    return false;
  }
}

/**
 * Get queue size
 */
export async function getQueueSize(): Promise<number> {
  try {
    const queue = await getStorageItem<QueuedRequest[]>(QUEUE_STORAGE_KEY) || [];
    return queue.length;
  } catch (error) {
    console.error('Error getting queue size:', error);
    return 0;
  }
}
