/**
 * Network monitoring and connection state management
 */
import NetInfo, { NetInfoState, NetInfoStateType } from '@react-native-community/netinfo';
import { create } from 'zustand';

export interface NetworkState {
  isConnected: boolean;
  type: NetInfoStateType | null;
  isInternetReachable: boolean | null;
}

interface NetworkStore extends NetworkState {
  setNetworkState: (state: NetworkState) => void;
}

/**
 * Zustand store for network state
 */
export const useNetworkStore = create<NetworkStore>((set) => ({
  isConnected: false,
  type: null,
  isInternetReachable: null,
  setNetworkState: (state) => set(state),
}));

/**
 * Get current network state
 */
export async function getNetworkState(): Promise<NetworkState> {
  try {
    const state = await NetInfo.fetch();
    return {
      isConnected: state.isConnected ?? false,
      type: state.type,
      isInternetReachable: state.isInternetReachable ?? null,
    };
  } catch (error) {
    console.error('Error getting network state:', error);
    return {
      isConnected: false,
      type: null,
      isInternetReachable: null,
    };
  }
}

/**
 * Initialize network monitoring
 */
export function initializeNetworkMonitor() {
  // Get initial state
  getNetworkState().then((state) => {
    useNetworkStore.getState().setNetworkState(state);
  });

  // Subscribe to network state changes
  const unsubscribe = NetInfo.addEventListener((state: NetInfoState) => {
    const networkState: NetworkState = {
      isConnected: state.isConnected ?? false,
      type: state.type,
      isInternetReachable: state.isInternetReachable ?? null,
    };
    
    useNetworkStore.getState().setNetworkState(networkState);
    
    // Log connection changes
    if (networkState.isConnected) {
      console.log('Network connected:', networkState.type);
    } else {
      console.log('Network disconnected');
    }
  });

  return unsubscribe;
}

/**
 * Check if device is currently online
 */
export function isOnline(): boolean {
  return useNetworkStore.getState().isConnected && 
         (useNetworkStore.getState().isInternetReachable !== false);
}

/**
 * Check if device is currently offline
 */
export function isOffline(): boolean {
  return !isOnline();
}
