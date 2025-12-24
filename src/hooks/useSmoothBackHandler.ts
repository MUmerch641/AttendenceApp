// src/hooks/useSmoothBackHandler.ts
import { useEffect } from 'react';
import { BackHandler, Platform } from 'react-native';
import { NavigationService } from '../services/NavigationService';

/**
 * Custom hook to handle Android back button with smooth navigation
 * Prevents the jerk/lag when pressing system back button
 */
export const useSmoothBackHandler = (onBack?: () => boolean) => {
  useEffect(() => {
    if (Platform.OS !== 'android') {
      return;
    }

    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      if (onBack) {
        return onBack();
      }

      // Default smooth back behavior
      NavigationService.goBack();
      return true; // Prevent default back behavior
    });

    return () => backHandler.remove();
  }, [onBack]);
};
