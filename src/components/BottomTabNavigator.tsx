"use client"

import { useEffect, useRef } from "react"
import { View, StyleSheet, Animated, Platform } from "react-native"
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { Home, FileText, Settings, User } from "lucide-react-native"
import HomeScreen from "../screens/HomeScreen"
import ProfileScreen from "../screens/ProfileScreen"
import HistoryScreen from "../screens/HistoryScreen"
import SettingsScreen from "../screens/SettingsScreen"

const Tab = createBottomTabNavigator()

const AnimatedTabIcon = ({ focused, icon: Icon, label }: { focused: boolean; icon: any; label: string }) => {
  const iconTranslateY = useRef(new Animated.Value(0)).current
  const labelOpacity = useRef(new Animated.Value(0)).current
  const scale = useRef(new Animated.Value(1)).current

  useEffect(() => {
    if (focused) {
      // When focused: icon moves up, label fades in, icon scales up
      Animated.parallel([
        Animated.spring(iconTranslateY, {
          toValue: -8,
          friction: 6,
          tension: 40,
          useNativeDriver: true,
        }),
        Animated.timing(labelOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(scale, {
          toValue: 1.15,
          friction: 6,
          tension: 40,
          useNativeDriver: true,
        }),
      ]).start()
    } else {
      // When unfocused: icon returns to center, label fades out, icon scales down
      Animated.parallel([
        Animated.spring(iconTranslateY, {
          toValue: 0,
          friction: 6,
          tension: 40,
          useNativeDriver: true,
        }),
        Animated.timing(labelOpacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.spring(scale, {
          toValue: 1,
          friction: 6,
          tension: 40,
          useNativeDriver: true,
        }),
      ]).start()
    }
  }, [focused, iconTranslateY, labelOpacity, scale])

  return (
    <View style={styles.tabItemContainer}>
      <View style={styles.contentWrapper}>
        <Animated.View 
          style={[
            styles.iconWrapper, 
            { 
              transform: [{ translateY: iconTranslateY }, { scale }] 
            }
          ]}
        >
          <View style={[styles.iconContainer, focused && styles.iconContainerActive]}>
            <Icon size={22} color={focused ? "#FFFFFF" : "#64748B"} strokeWidth={2.2} />
          </View>
        </Animated.View>
        {focused && (
          <Animated.Text
            style={[
              styles.tabLabel,
              {
                opacity: labelOpacity,
              },
            ]}
            numberOfLines={1}
            ellipsizeMode="clip"
          >
            {label}
          </Animated.Text>
        )}
      </View>
    </View>
  )
}

export default function BottomTabNavigator() {
  const insets = useSafeAreaInsets()
  
  // Calculate bottom spacing: use inset if available, otherwise use default spacing
  const bottomSpacing = Platform.select({
    ios: Math.max(insets.bottom, 20),
    android: Math.max(insets.bottom + 10, 20),
  })

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: [
          styles.tabBar,
          {
            bottom: bottomSpacing,
          },
        ],
        tabBarBackground: () => (
          <View style={styles.tabBarBackground}>
            <View style={styles.tabBarOverlay} />
          </View>
        ),
        tabBarItemStyle: styles.tabBarItem,
        tabBarActiveTintColor: "#5B4BFF",
        tabBarInactiveTintColor: "#64748B",
        tabBarHideOnKeyboard: true,
        lazy: false,
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
  )
}

const styles = StyleSheet.create({
  tabBar: {
    position: "absolute",
    left: 20,
    right: 20,
    bottom: 20,
    height: 65,
    borderRadius: 20,
    borderTopWidth: 0,
    elevation: 0,
    shadowOpacity: 0,
    backgroundColor: "transparent",
    paddingBottom: 0,
  },
  tabBarBackground: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  tabBarOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(255, 255, 255, 0.98)",
    borderRadius: 20,
  },
  tabBarItem: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 0,
    marginVertical: 0,
    height: 65,
  },
  tabItemContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    height: "100%",
    position: "relative",
  },
  contentWrapper: {
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    height: "100%",
    minWidth: 80,
  },
  iconWrapper: {
    alignItems: "center",
    justifyContent: "center",
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
  },
  iconContainerActive: {
    backgroundColor: "#5B4BFF",
    shadowColor: "#5B4BFF",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: "600",
    color: "#5B4BFF",
    textAlign: "center",
    letterSpacing: 0.2,
    marginTop: 4,
  },
})
