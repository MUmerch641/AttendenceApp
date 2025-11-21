/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, { useEffect } from 'react';
import { StatusBar, StyleSheet, useColorScheme, View, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

// Screens
import WelcomeScreen from './src/screens/WelcomeScreen';
import LoginScreen from './src/screens/LoginScreen';
import LeaveRequestScreen from './src/screens/LeaveRequestScreen';

// Services
import { navigationRef } from './src/services/NavigationService';
import { StorageService } from './src/services/StorageService';
import BottomTabNavigator from './src/components/BottomTabNavigator';
import NetworkProvider from './src/components/NetworkProvider';

// Type Definitions
export type RootStackParamList = {
  Welcome: undefined;
  LoginScreen: undefined;
  Dashboard: undefined; // This will hold the Bottom Tabs
  LeaveRequest: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

function App() {
  const isDarkMode = useColorScheme() === 'dark';

  useEffect(() => {
    const checkTokenAndNavigate = async () => {
      try {
        const isLoggedIn = await StorageService.isLoggedIn();
        if (isLoggedIn) {
          // User is logged in, navigate to Dashboard
          setTimeout(() => {
            navigationRef.current?.navigate('Dashboard');
          }, 100); // Small delay to ensure navigation is ready
        }
        // If not logged in, stay on Welcome screen (default)
      } catch (error) {
        console.error('Error checking login status:', error);
      }
    };

    checkTokenAndNavigate();
  }, []);

  return (
    <NetworkProvider>
      <NavigationContainer ref={navigationRef}>
        <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} backgroundColor="transparent" translucent />
        <Stack.Navigator initialRouteName="Welcome" screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Welcome" component={WelcomeScreen} />
          <Stack.Screen name="LoginScreen" component={LoginScreen} />
          <Stack.Screen name="Dashboard" component={BottomTabNavigator} />
          <Stack.Screen name="LeaveRequest" component={LeaveRequestScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </NetworkProvider>
  );
}


export default App;