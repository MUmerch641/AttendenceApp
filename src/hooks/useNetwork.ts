// src/hooks/useNetwork.ts
import { useState, useEffect } from 'react';
import { networkService, NetworkState } from '../services/NetworkService';

export const useNetwork = () => {
  const [networkState, setNetworkState] = useState<NetworkState>({
    isConnected: null,
    type: 'unknown',
    isInternetReachable: null,
  });

  useEffect(() => {
    // Get initial state
    networkService.getCurrentState().then(setNetworkState);

    // Subscribe to changes
    const unsubscribe = networkService.subscribe(setNetworkState);

    // Cleanup
    return unsubscribe;
  }, []);

  return {
    ...networkState,
    isOnline: networkState.isConnected === true && networkState.isInternetReachable !== false,
  };
};

export default useNetwork;