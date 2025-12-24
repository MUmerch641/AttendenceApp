import { createNavigationContainerRef } from '@react-navigation/native';
import { RootStackParamList } from '../../App';

export const navigationRef = createNavigationContainerRef<RootStackParamList>();

// Create a ref to store authentication state that can be accessed outside React components
export const authStateRef = { current: false };

export const NavigationService = {
  navigate: (name: keyof RootStackParamList, params?: any) => {
    if (navigationRef.isReady()) {
      navigationRef.navigate(name as any, params);
    }
  },
  goBack: () => {
    if (navigationRef.isReady()) {
      navigationRef.goBack();
    }
  },
  reset: (routes: any[]) => {
    if (navigationRef.isReady()) {
      navigationRef.reset({
        index: routes.length - 1,
        routes,
      });
    }
  },
  getCurrentRoute: () => {
    if (navigationRef.isReady()) {
      return navigationRef.getCurrentRoute();
    }
    return null;
  },
  
  // Update authentication state
  setAuthenticated: (isAuthenticated: boolean) => {
    authStateRef.current = isAuthenticated;
  },
  
  // Get authentication state
  isAuthenticated: () => {
    return authStateRef.current;
  },
};