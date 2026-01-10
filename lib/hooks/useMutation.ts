/**
 * Wrapper hook for offline-safe mutations
 * This is a re-export with additional offline handling capabilities
 * For most cases, use @tanstack/react-query's useMutation directly
 */
export { useMutation } from '@tanstack/react-query';

/**
 * Helper to check if an error is a network/offline error
 */
export function isOfflineError(error: any): boolean {
  return error?.isNetworkError === true || error?.code === 'NETWORK_ERROR' || error?.code === 'OFFLINE_QUEUED';
}

/**
 * Helper to check if an error indicates the request was queued
 */
export function isQueuedError(error: any): boolean {
  return error?.isQueued === true || error?.code === 'OFFLINE_QUEUED';
}
