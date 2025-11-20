import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Home, FileText, Settings, User } from 'lucide-react-native';
import HomeScreen from '../screens/HomeScreen';

const Tab = createBottomTabNavigator();

const PlaceholderScreen = ({ name }: { name: string }) => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F6F8FF' }}>
    <Text style={{ color: '#64748B', fontSize: 20, fontWeight: '700' }}>{name}</Text>
  </View>
);

// <CHANGE> Improved AnimatedTabIcon to hide pill and label when unfocused with smooth animations
const AnimatedTabIcon = ({ focused, icon: Icon, label }: { focused: boolean; icon: any; label: string }) => {
  const scale = useRef(new Animated.Value(1)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const bgOpacity = useRef(new Animated.Value(0)).current;
  const pillWidth = useRef(new Animated.Value(48)).current;

  useEffect(() => {
    if (focused) {
      // Activate - Show full pill with label
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
          toValue: 110,
          duration: 320,
          useNativeDriver: false,
        }),
      ]).start();
    } else {
      // Deactivate - Hide pill and label, show only icon
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
          toValue: 48,
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
          <Icon size={24} color={focused ? '#FFFFFF' : '#94A3B8'} strokeWidth={2.4} />
        </Animated.View>

        {/* <CHANGE> Only render label when focused to remove unnecessary content */}
        {focused && (
          <Animated.Text style={[styles.label, { opacity }]}>
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
        tabBarStyle: styles.tabBar,
        tabBarItemStyle: { marginTop: 8 },
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
        component={() => <PlaceholderScreen name="History" />}
        options={{
          tabBarIcon: ({ focused }) => <AnimatedTabIcon focused={focused} icon={FileText} label="History" />,
        }}
      />
      <Tab.Screen
        name="Settings"
        component={() => <PlaceholderScreen name="Settings" />}
        options={{
          tabBarIcon: ({ focused }) => <AnimatedTabIcon focused={focused} icon={Settings} label="Settings" />,
        }}
      />
      <Tab.Screen
        name="Profile"
        component={() => <PlaceholderScreen name="Profile" />}
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
    bottom: 28,
    left: 20,
    right: 20,
    height: 74,
    borderRadius: 37,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 0,
    elevation: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 15 },
    shadowOpacity: 0.15,
    shadowRadius: 25,
    paddingHorizontal: 12,
    paddingTop: 10,
  },
  iconWrapper: {
    width: 110,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pill: {
    height: 48,
    borderRadius: 30,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 14,
    shadowColor: '#5B4BFF',
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 16,
    elevation: 15,
  },
  label: {
    color: '#FFFFFF',
    fontSize: 13.5,
    fontWeight: '700',
    marginLeft: 8,
    letterSpacing: 0.3,
  },
});