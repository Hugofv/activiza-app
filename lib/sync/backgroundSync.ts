/**
 * Background synchronization utilities
 */
import { AppState, AppStateStatus } from 'react-native';
import { initializeNetworkMonitor, isOnline, useNetworkStore } from './networkMonitor';
import { syncQueueWithRetry } from './syncManager';

let networkUnsubscribe: (() => void) | null = null;
let appStateSubscription: any = null;

/**
 * Initialize background sync with automatic triggers
 */
export function initializeBackgroundSync() {
  // Initialize network monitoring
  networkUnsubscribe = initializeNetworkMonitor();

  // Subscribe to network state changes to sync when connection is restored
  useNetworkStore.subscribe((state) => {
    if (state.isConnected && state.isInternetReachable) {
      console.log('Connection restored, syncing queue...');
      syncQueueWithRetry().catch((error) => {
        console.error('Error syncing on connection restore:', error);
      });
    }
  });

  // Subscribe to app state changes to sync when app comes to foreground
  appStateSubscription = AppState.addEventListener('change', handleAppStateChange);

  // Initial sync if online
  if (isOnline()) {
    syncQueueWithRetry().catch((error) => {
      console.error('Error in initial sync:', error);
    });
  }
}

/**
 * Handle app state changes
 */
async function handleAppStateChange(nextAppState: AppStateStatus) {
  if (nextAppState === 'active' && isOnline()) {
    console.log('App came to foreground, syncing queue...');
    try {
      await syncQueueWithRetry();
    } catch (error) {
      console.error('Error syncing on app foreground:', error);
    }
  }
}

/**
 * Cleanup background sync listeners
 */
export function cleanupBackgroundSync() {
  if (networkUnsubscribe) {
    networkUnsubscribe();
    networkUnsubscribe = null;
  }

  if (appStateSubscription) {
    appStateSubscription.remove();
    appStateSubscription = null;
  }
}

/**
 * Manual sync trigger (can be called from UI)
 */
export async function triggerManualSync(): Promise<boolean> {
  if (!isOnline()) {
    console.log('Cannot sync: device is offline');
    return false;
  }

  try {
    const result = await syncQueueWithRetry();
    return result.failed === 0;
  } catch (error) {
    console.error('Error in manual sync:', error);
    return false;
  }
}
