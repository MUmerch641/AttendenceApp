import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Home, FileText, Settings, User } from 'lucide-react-native';
import HomeScreen from '../screens/HomeScreen';   
import ProfileScreen from '../screens/ProfileScreen';
import HistoryScreen from '../screens/HistoryScreen';
import SettingsScreen from '../screens/SettingsScreen';

const Tab = createBottomTabNavigator();
const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// <CHANGE> Calculate responsive values based on screen dimensions
const isSmallScreen = screenWidth < 375;
const isMediumScreen = screenWidth >= 375 && screenWidth < 414;
const isLargeScreen = screenWidth >= 414;

const getResponsiveValues = () => {
  if (isSmallScreen) {
    return {
      tabBarHeight: 64,
      iconSize: 20,
      pillWidth: 48,
      expandedPillWidth: 95,
      bottom: 16,
      horizontalPadding: 12,
      labelFontSize: 11,
    };
  } else if (isMediumScreen) {
    return {
      tabBarHeight: 70,
      iconSize: 22,
      pillWidth: 50,
      expandedPillWidth: 105,
      bottom: 20,
      horizontalPadding: 14,
      labelFontSize: 12,
    };
  } else {
    return {
      tabBarHeight: 74,
      iconSize: 24,
      pillWidth: 52,
      expandedPillWidth: 110,
      bottom: 24,
      horizontalPadding: 16,
      labelFontSize: 13.5,
    };
  }
};

const responsiveValues = getResponsiveValues();

const PlaceholderScreen = ({ name }: { name: string }) => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F6F8FF' }}>
    <Text style={{ color: '#64748B', fontSize: 20, fontWeight: '700' }}>{name}</Text>
  </View>
);

// <CHANGE> Improved AnimatedTabIcon with responsive sizing
const AnimatedTabIcon = ({ focused, icon: Icon, label }: { focused: boolean; icon: any; label: string }) => {
  const scale = useRef(new Animated.Value(1)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const bgOpacity = useRef(new Animated.Value(0)).current;
  const pillWidth = useRef(new Animated.Value(responsiveValues.pillWidth)).current;

  useEffect(() => {
    if (focused) {
      Animated.parallel([
        Animated.spring(scale, {
          toValue: 1.15,
          friction: 6,
          tension: 110,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 350,
          useNativeDriver: true,
        }),
        Animated.timing(bgOpacity, {
          toValue: 1,
          duration: 320,
          useNativeDriver: false,
        }),
        Animated.timing(pillWidth, {
          toValue: responsiveValues.expandedPillWidth,
          duration: 320,
          useNativeDriver: false,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.spring(scale, {
          toValue: 1,
          friction: 8,
          tension: 120,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(bgOpacity, {
          toValue: 0,
          duration: 280,
          useNativeDriver: false,
        }),
        Animated.timing(pillWidth, {
          toValue: responsiveValues.pillWidth,
          duration: 280,
          useNativeDriver: false,
        }),
      ]).start();
    }
  }, [focused]);

  return (
    <View style={styles.iconWrapper}>
      <Animated.View
        style={[
          styles.pill,
          {
            width: pillWidth,
            backgroundColor: bgOpacity.interpolate({
              inputRange: [0, 1],
              outputRange: ['transparent', '#5B4BFF'],
            }),
            shadowOpacity: bgOpacity.interpolate({
              inputRange: [0, 1],
              outputRange: [0, 0.35],
            }),
          },
        ]}
      >
        <Animated.View style={{ transform: [{ scale }] }}>
          <Icon size={responsiveValues.iconSize} color={focused ? '#FFFFFF' : '#94A3B8'} strokeWidth={2.4} />
        </Animated.View>

        {focused && (
          <Animated.Text style={[styles.label, { opacity, fontSize: responsiveValues.labelFontSize }]}>
            {label}
          </Animated.Text>
        )}
      </Animated.View>
    </View>
  );
};

export default function BottomTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: [styles.tabBar, { height: responsiveValues.tabBarHeight, bottom: responsiveValues.bottom }],
        tabBarItemStyle: { flex: 1, marginTop: isSmallScreen ? 4 : 8, justifyContent: 'center', alignItems: 'center' },
        tabBarActiveTintColor: '#5B4BFF',
        tabBarInactiveTintColor: '#94A3B8',
      }}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ focused }) => <AnimatedTabIcon focused={focused} icon={Home} label="Home" />,
        }}
      />
      <Tab.Screen
        name="History"
        component={HistoryScreen}
        options={{
          tabBarIcon: ({ focused }) => <AnimatedTabIcon focused={focused} icon={FileText} label="History" />,
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          tabBarIcon: ({ focused }) => <AnimatedTabIcon focused={focused} icon={Settings} label="Settings" />,
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ focused }) => <AnimatedTabIcon focused={focused} icon={User} label="Profile" />,
        }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    left: responsiveValues.horizontalPadding,
    right: responsiveValues.horizontalPadding,
    borderRadius: 37,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 0,
    elevation: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 15 },
    shadowOpacity: 0.15,
    shadowRadius: 25,
    paddingHorizontal: 6,
    paddingTop: 6,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  iconWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
  },
  pill: {
    borderRadius: 30,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
    height: isSmallScreen ? 42 : 48,
    shadowColor: '#5B4BFF',
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 16,
    elevation: 15,
  },
  label: {
    color: '#FFFFFF',
    fontWeight: '700',
    marginLeft: 6,
    letterSpacing: 0.3,
  },
});