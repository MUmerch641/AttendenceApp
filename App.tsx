/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, { useEffect, useState } from 'react';
import { StatusBar, StyleSheet, useColorScheme, View, Text, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

// Screens
import WelcomeScreen from './src/screens/WelcomeScreen';
import LoginScreen from './src/screens/LoginScreen';
import LeaveRequestScreen from './src/screens/LeaveRequestScreen';
import PrivacyPolicyScreen from './src/screens/PrivacyPolicyScreen';
import SupportPolicyScreen from './src/screens/SupportPolicyScreen';
import TermsConditionsScreen from './src/screens/TermsConditionsScreen';

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
  PrivacyPolicy: undefined;
  SupportPolicy: undefined;
  TermsConditions: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

function App() {
  const isDarkMode = useColorScheme() === 'dark';
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuthentication = async () => {
      try {
        const loggedIn = await StorageService.isLoggedIn();
        setIsAuthenticated(loggedIn);
      } catch (error) {
        console.error('Error checking authentication:', error);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthentication();
  }, []);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFFFFF' }}>
        <ActivityIndicator size="large" color="#5B4BFF" />
        <Text style={{ marginTop: 16, color: '#64748B' }}>Loading...</Text>
      </View>
    );
  }

  return (
    <NetworkProvider>
      <NavigationContainer ref={navigationRef}>
        <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} backgroundColor="transparent" translucent />
        <Stack.Navigator 
          initialRouteName={isAuthenticated ? "Dashboard" : "Welcome"} 
          screenOptions={{ headerShown: false }}
        >
          <Stack.Screen name="Welcome" component={WelcomeScreen} />
          <Stack.Screen name="LoginScreen" component={LoginScreen} />
          <Stack.Screen name="Dashboard" component={BottomTabNavigator} />
          <Stack.Screen name="LeaveRequest" component={LeaveRequestScreen} />
          <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} />
          <Stack.Screen name="SupportPolicy" component={SupportPolicyScreen} />
          <Stack.Screen name="TermsConditions" component={TermsConditionsScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </NetworkProvider>
  );
}


export default App;