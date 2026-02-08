/**
 * Hook for network connectivity monitoring
 */
import { useNetworkStore } from '../sync/networkMonitor';

/**
 * Hook to get current network state
 */
export function useNetwork() {
  const { isConnected, type, isInternetReachable } = useNetworkStore();

  return {
    isConnected,
    isOnline: isConnected && isInternetReachable !== false,
    isOffline: !isConnected || isInternetReachable === false,
    type,
    isInternetReachable,
  };
}
