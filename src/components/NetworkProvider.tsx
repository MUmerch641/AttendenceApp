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
  const [isInitialCheck, setIsInitialCheck] = useState(true);

  useEffect(() => {
    // Give initial network check time to complete (prevent flash of no internet modal)
    const timer = setTimeout(() => {
      setIsInitialCheck(false);
    }, 1000); // Wait 1 second before allowing modal to show

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Don't show modal during initial check period
    if (isInitialCheck) {
      return;
    }

    // Show modal when offline, hide when online
    if (isOnline === false) {
      setShowNoInternetModal(true);
    } else if (isOnline === true) {
      setShowNoInternetModal(false);
    }
  }, [isOnline, isInitialCheck]);

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