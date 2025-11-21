// src/services/NetworkService.ts
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';

export interface NetworkState {
  isConnected: boolean | null;
  type: string;
  isInternetReachable: boolean | null;
}

class NetworkService {
  private listeners: ((state: NetworkState) => void)[] = [];

  constructor() {
    // Subscribe to network state changes
    NetInfo.addEventListener(this.handleNetworkChange.bind(this));
  }

  private handleNetworkChange(state: NetInfoState) {
    const networkState: NetworkState = {
      isConnected: state.isConnected,
      type: state.type,
      isInternetReachable: state.isInternetReachable,
    };

    // Notify all listeners
    this.listeners.forEach(listener => listener(networkState));
  }

  // Subscribe to network changes
  subscribe(callback: (state: NetworkState) => void): () => void {
    this.listeners.push(callback);

    // Return unsubscribe function
    return () => {
      const index = this.listeners.indexOf(callback);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  // Get current network state
  async getCurrentState(): Promise<NetworkState> {
    const state = await NetInfo.fetch();
    return {
      isConnected: state.isConnected,
      type: state.type,
      isInternetReachable: state.isInternetReachable,
    };
  }

  // Check if device has internet connectivity
  async isOnline(): Promise<boolean> {
    const state = await this.getCurrentState();
    return state.isConnected === true && state.isInternetReachable !== false;
  }
}

export const networkService = new NetworkService();
export default networkService;