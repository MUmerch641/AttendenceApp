// src/components/NetworkProvider.tsx
import React, { useState, useEffect, ReactNode } from 'react';
import { View } from 'react-native';
import { useNetwork } from '../hooks/useNetwork';
import NoInternetModal from './NoInternetModal';
import { networkService } from '../services/NetworkService';

interface NetworkProviderProps {
  children: ReactNode;
}

export default function NetworkProvider({ children }: NetworkProviderProps) {
  const { isOnline } = useNetwork();
  const [showNoInternetModal, setShowNoInternetModal] = useState(false);

  useEffect(() => {
    // Show modal when offline, hide when online
    if (isOnline === false) {
      setShowNoInternetModal(true);
    } else if (isOnline === true) {
      setShowNoInternetModal(false);
    }
  }, [isOnline]);

  const handleRetry = async () => {
    // Check connectivity again
    const online = await networkService.isOnline();
    if (online) {
      setShowNoInternetModal(false);
    }
    // If still offline, modal stays visible
  };

  return (
    <View style={{ flex: 1 }}>
      {children}
      <NoInternetModal
        visible={showNoInternetModal}
        onRetry={handleRetry}
      />
    </View>
  );
}