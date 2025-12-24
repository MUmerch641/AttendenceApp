import React, { useEffect, useState, useRef } from 'react';
import { StatusBar, StyleSheet, useColorScheme, View, Text, ActivityIndicator, Platform, BackHandler } from 'react-native';
import { NavigationContainer, NavigationState } from '@react-navigation/native';
import { createStackNavigator, CardStyleInterpolators, TransitionPresets, TransitionSpecs } from '@react-navigation/stack';

// Screens
import WelcomeScreen from './src/screens/WelcomeScreen';
import LoginScreen from './src/screens/LoginScreen';
import LeaveRequestScreen from './src/screens/LeaveRequestScreen';
import LeaveStatusScreen from './src/screens/LeaveStatusScreen';
import NotificationsScreen from './src/screens/NotificationsScreen';
import PrivacyPolicyScreen from './src/screens/PrivacyPolicyScreen';
import SupportPolicyScreen from './src/screens/SupportPolicyScreen';
import TermsConditionsScreen from './src/screens/TermsConditionsScreen';

// Services
import { navigationRef, authStateRef } from './src/services/NavigationService';
import { StorageService } from './src/services/StorageService';
import { NotificationService } from './src/services/NotificationService';
import { setupAxiosInterceptors } from './src/utils/errorHandler';
import BottomTabNavigator from './src/components/BottomTabNavigator';
import NetworkProvider from './src/components/NetworkProvider';
import ErrorBoundary from './src/components/ErrorBoundary';

// Type Definitions
export type RootStackParamList = {
  Welcome: undefined;
  LoginScreen: undefined;
  Dashboard: undefined; 
  LeaveRequest: undefined;
  LeaveStatus: undefined;
  Notifications: undefined;
  PrivacyPolicy: undefined;
  SupportPolicy: undefined;
  TermsConditions: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

function App() {
  const isDarkMode = useColorScheme() === 'dark';
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [initialRoute, setInitialRoute] = useState<keyof RootStackParamList>('Welcome');

  // Define protected routes (require authentication)
  const protectedRoutes = ['Dashboard', 'LeaveRequest', 'LeaveStatus', 'Notifications'];
  
  // Define public routes (no authentication required)
  const publicRoutes = ['Welcome', 'LoginScreen', 'PrivacyPolicy', 'SupportPolicy', 'TermsConditions'];

  useEffect(() => {
    // Setup axios interceptors for global error handling
    setupAxiosInterceptors();
    
    const checkAuthentication = async () => {
      try {
        const loggedIn = await StorageService.isLoggedIn();
        const isFirstTime = await StorageService.isFirstTimeUser();
        
        setIsAuthenticated(loggedIn);
        authStateRef.current = loggedIn; // Update the shared ref
        
        // Determine initial route
        let route: keyof RootStackParamList;
        if (loggedIn) {
          route = 'Dashboard';
        } else if (isFirstTime) {
          route = 'Welcome';
        } else {
          route = 'LoginScreen';
        }
        
        setInitialRoute(route);
        
        // Initialize FCM notifications if user is authenticated
        if (loggedIn) {
          try {
            await NotificationService.initialize();
          } catch (error) {
          }
        }
      } catch (error) {
        setIsAuthenticated(false);
        authStateRef.current = false;
        setInitialRoute('Welcome');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthentication();
  }, []);

  // Navigation state change listener to enforce route protection
  const onNavigationStateChange = async (state: NavigationState | undefined) => {
    if (!state) return;

    const currentRoute = state.routes[state.index];
    const currentRouteName = currentRoute.name;
    
    // Check if user is trying to access a protected route without authentication
    if (protectedRoutes.includes(currentRouteName) && !authStateRef.current) {
  
      // Redirect to LoginScreen (not Welcome, since they're not first-time users)
      if (navigationRef.isReady()) {
        navigationRef.reset({
          index: 0,
          routes: [{ name: 'LoginScreen' }],
        });
      }
      return;
    }

    // Check if authenticated user is trying to access login/welcome screens
    if ((currentRouteName === 'LoginScreen' || currentRouteName === 'Welcome') && authStateRef.current) {
   
      // Redirect to Dashboard
      if (navigationRef.isReady()) {
        navigationRef.reset({
          index: 0,
          routes: [{ name: 'Dashboard' }],
        });
      }
      return;
    }
  };

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFFFFF' }}>
        <ActivityIndicator size="large" color="#5B4BFF" />
        <Text style={{ marginTop: 16, color: '#64748B' }}>Loading...</Text>
      </View>
    );
  }

  return (
    <ErrorBoundary>
      <NetworkProvider>
        <NavigationContainer 
          ref={navigationRef}
          onStateChange={onNavigationStateChange}
        >
          <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} backgroundColor="transparent" translucent />
          <Stack.Navigator 
            initialRouteName={initialRoute} 
            screenOptions={{ 
              headerShown: false,
              // Optimized for smooth Android back button
              cardStyleInterpolator: Platform.OS === 'android' 
                ? CardStyleInterpolators.forRevealFromBottomAndroid
                : CardStyleInterpolators.forHorizontalIOS,
              transitionSpec: {
                open: {
                  animation: 'timing',
                  config: {
                    duration: 200,
                  },
                },
                close: {
                  animation: 'timing',
                  config: {
                    duration: 150, 
                  },
                },
              },
              gestureEnabled: true,
              gestureDirection: 'horizontal',
              cardStyle: { backgroundColor: 'transparent' },
              detachPreviousScreen: false, // Keep previous screen mounted for smooth transitions
            }}
          >
            <Stack.Screen name="Welcome" component={WelcomeScreen} />
            <Stack.Screen name="LoginScreen" component={LoginScreen} />
            <Stack.Screen name="Dashboard" component={BottomTabNavigator} />
            <Stack.Screen name="LeaveRequest" component={LeaveRequestScreen} />
            <Stack.Screen name="LeaveStatus" component={LeaveStatusScreen} />
            <Stack.Screen name="Notifications" component={NotificationsScreen} />
            <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} />
            <Stack.Screen name="SupportPolicy" component={SupportPolicyScreen} />
            <Stack.Screen name="TermsConditions" component={TermsConditionsScreen} />
          </Stack.Navigator>
        </NavigationContainer>
      </NetworkProvider>
    </ErrorBoundary>
  );
}


export default App;