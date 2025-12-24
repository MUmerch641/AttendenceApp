// src/screens/HomeScreen.tsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Dimensions,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import FastImage from 'react-native-fast-image';
import {
  Bell, Clock, Coffee, LogOut, Fingerprint, Briefcase,
  CheckCircle, AlertCircle, Timer, User
} from 'lucide-react-native';

import { AttendanceService } from '../services/AttendanceService';
import { SnackbarService } from '../services/SnackbarService';
import { StorageService, UserData } from '../services/StorageService';
import { NavigationService } from '../services/NavigationService';
import { NotificationService } from '../services/NotificationService';
import { NotificationsAPI } from '../api/notifications';
import { AttendanceAPI } from '../api/attendance';
import ConfirmLogoutModal from '../components/ConfirmLogoutModal';
import ImagePreviewModal from '../components/ImagePreviewModal';
import { ProfileImageService } from '../services/ProfileImageService';
import { ErrorHandler } from '../utils/errorHandler';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const [activeTab, setActiveTab] = useState<'Check' | 'Break' | 'Leave'>('Check');
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checkInTime, setCheckInTime] = useState('--:--');
  const [workedTime, setWorkedTime] = useState('0h 0m');
  const [checkInTimestamp, setCheckInTimestamp] = useState<Date | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [biometricsAvailable, setBiometricsAvailable] = useState<boolean | null>(null);
  const [employeeStats, setEmployeeStats] = useState<{
    onTimeDays: number;
    lateDays: number;
    onLeaveDays: number;
    absentDays: number;
  } | null>(null);
  const [unreadNotificationCount, setUnreadNotificationCount] = useState(0);
  const [showImagePreview, setShowImagePreview] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // Animation values
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  // Pulsing animation for check-in button
  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.08,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    );

    const glow = Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    );

    pulse.start();
    glow.start();

    return () => {
      pulse.stop();
      glow.stop();
    };
  }, []);

  useEffect(() => {
    loadUserData();
    loadAttendanceSession();
    checkBiometricsAvailability();

    // Listen for profile image updates
    const unsubscribe = ProfileImageService.onProfileImageUpdate((newImageUrl) => {
      setUserData((prevUserData) => {
        if (prevUserData) {
          return { ...prevUserData, profilePhotoUrl: newImageUrl };
        }
        return prevUserData;
      });
    });

    // Cleanup listener on unmount
    return () => {
      unsubscribe();
    };
  }, []);

  // Load notification count when userData is available
  useEffect(() => {
    if (userData?._id) {
      loadNotificationCount();
    }
  }, [userData?._id]);

  // Refresh notification count when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      if (userData?._id) {
        loadNotificationCount();
      }
    }, [userData?._id])
  );

  // Real-time working time update with proper cleanup
  useEffect(() => {
    let intervalId: ReturnType<typeof setInterval> | null = null;

    if (isCheckedIn && checkInTimestamp) {
      // Update working time every minute
      intervalId = setInterval(() => {
        const now = new Date();
        const diffMs = now.getTime() - checkInTimestamp.getTime();
        const hours = Math.floor(diffMs / (1000 * 60 * 60));
        const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
        setWorkedTime(`${hours}h ${minutes}m`);
      }, 60000); // Update every minute
    }

    // Cleanup interval on unmount or when check-in state changes
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [isCheckedIn, checkInTimestamp]);

  const checkBiometricsAvailability = async () => {
    try {
      const { available } = await AttendanceService.checkAvailability();
      setBiometricsAvailable(available);
    } catch (error) {
      setBiometricsAvailable(false);
    }
  };

  const loadUserData = async () => {
    try {
      const data = await StorageService.getUserData();
      setUserData(data);
      if (data) await loadEmployeeStats(data._id);
    } catch (error) {
    }
  };

  const loadNotificationCount = async () => {
    try {
      const userId = userData?._id;
      if (!userId) {
        return;
      }

      const response = await NotificationsAPI.getUnreadCount(userId);
      
      if (response.isSuccess && response.data) {
        const count = response.data.count || 0;
        setUnreadNotificationCount(count);
      } else {
        setUnreadNotificationCount(0);
      }
    } catch (error) {
      setUnreadNotificationCount(0); // Reset to 0 on error
    }
  };

  const loadAttendanceSession = async () => {
    try {
      const session = await StorageService.getAttendanceSession();
      if (session) {
        setIsCheckedIn(session.isCheckedIn);
        setCheckInTime(session.checkInTime);
        setCheckInTimestamp(session.checkInTimestamp ? new Date(session.checkInTimestamp) : null);
        setWorkedTime(session.workedTime);
      }
    } catch (error) {
    }
  };

  const loadEmployeeStats = async (empDocId: string) => {
    try {
      const currentDate = new Date();
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth() + 1;
      const response = await AttendanceAPI.employeeStats({ year, month, empDocId });
      if (response.isSuccess && response.data) {
        setEmployeeStats({
          onTimeDays: response.data.onTimeDays,
          lateDays: response.data.lateDays,
          onLeaveDays: response.data.onLeaveDays,
          absentDays: response.data.absentDays,
        });
      }
    } catch (error) {
      ErrorHandler.logError(error, 'HomeScreen - loadEmployeeStats');
    }
  };



  const handleTabPress = (tab: 'Check' | 'Break' | 'Leave') => {
    if (tab === 'Leave') {
      NavigationService.navigate('LeaveRequest');
    } else {
      setActiveTab(tab);
    }
  };

  const handleAttendancePress = async () => {
    // If biometrics are available, use biometric authentication
    if (biometricsAvailable) {
      const { available } = await AttendanceService.checkAvailability();
      if (!available) {
        SnackbarService.showError('Biometrics not available on this device');
        return;
      }

      const isAuthenticated = await AttendanceService.authenticateUser();
      if (!isAuthenticated) {
        SnackbarService.showError("Biometric authentication failed");
        return;
      }
    }
    // If biometrics are not available, proceed without authentication

    setLoading(true);
    try {
      const user = await StorageService.getUserData();
      if (!user) return SnackbarService.showError('User data not found');

      const payload = {
        empId: user.employeeId,
        reason: isCheckedIn ? 'CHECK_OUT' : 'CHECK_IN'
      };

      const response = await AttendanceAPI.create(payload);
      if (response.isSuccess) {
        if (!isCheckedIn) {
          setIsCheckedIn(true);
          const now = new Date();
          setCheckInTimestamp(now);
          const formattedTime = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          setCheckInTime(formattedTime);
          setWorkedTime('0h 0m'); // Reset worked time to 0h 0m on check-in
          
          // Save to AsyncStorage
          await StorageService.saveAttendanceSession({
            isCheckedIn: true,
            checkInTime: formattedTime,
            checkInTimestamp: now.toISOString(),
            workedTime: '0h 0m'
          });
          
          SnackbarService.showSuccess(response.message || "Checked In Successfully!");
        } else {
          setIsCheckedIn(false);
          let calculatedWorkTime = '0h 0m';
          
          if (checkInTimestamp) {
            const now = new Date();
            const diffMs = now.getTime() - checkInTimestamp.getTime();
            const hours = Math.floor(diffMs / (1000 * 60 * 60));
            const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
            calculatedWorkTime = `${hours}h ${minutes}m`;
            setWorkedTime(calculatedWorkTime);
            setCheckInTimestamp(null);
          }
          
          // Save to AsyncStorage
          await StorageService.saveAttendanceSession({
            isCheckedIn: false,
            checkInTime: checkInTime,
            checkInTimestamp: null,
            workedTime: calculatedWorkTime
          });
          
          SnackbarService.showSuccess(response.message || "Checked Out Successfully!");
        }
      } else {
        const errorMsg = response.message || "Failed to mark attendance";
        ErrorHandler.showError(new Error(errorMsg));
      }
    } catch (error) {
      ErrorHandler.showError(error, "Failed to connect to server");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    setShowLogoutModal(true);
  };

  const performLogout = async () => {
    try {
      // Clear FCM token from backend and device
      await NotificationService.deleteToken();
      
      // Clear all local data
      await StorageService.clearAllData();
      await StorageService.clearAttendanceSession();
      
      // Update authentication state
      NavigationService.setAuthenticated(false);
      
      SnackbarService.showSuccess('Logged out successfully');
      NavigationService.reset([{ name: 'LoginScreen' }]);
    } catch (error) {
      SnackbarService.showError('Error during logout');
    } finally {
      setShowLogoutModal(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      <LinearGradient colors={['#E8ECFF', '#F5F7FF', '#FFFFFF']} style={StyleSheet.absoluteFill} />
      <View style={styles.blob} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        <View style={styles.header}>
          <View style={styles.userInfo}>
          
            <TouchableOpacity 
              onPress={() => userData?.profilePhotoUrl && setShowImagePreview(true)}
              activeOpacity={userData?.profilePhotoUrl ? 0.7 : 1}
            >
              {userData?.profilePhotoUrl ? (
                <FastImage
                  source={{ 
                    uri: userData.profilePhotoUrl,
                    priority: FastImage.priority.high,
                  }}
                  style={styles.avatar}
                  resizeMode={FastImage.resizeMode.cover}
                />
              ) : (
                <View style={styles.defaultAvatar}>
                  <User size={28} color="#94A3B8" strokeWidth={1.5} />
                </View>
              )}
            </TouchableOpacity>
            <View>
              <Text style={styles.dateText}>{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' })}</Text>
              <View style={styles.greetingRow}>
                <Text style={styles.greetingText}>Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 17 ? 'Afternoon' : 'Evening'}</Text>
                <Text style={{ fontSize: 18 }}>{userData?.fullName || 'User'}</Text>
              </View>
            </View>
          </View>
          <TouchableOpacity 
            style={styles.bellButton} 
            onPress={() => NavigationService.navigate('Notifications')}
          >
            <Bell size={24} color="#1E293B" />
            {unreadNotificationCount > 0 && (
              <View style={styles.notificationBadge}>
                <Text style={styles.notificationBadgeText}>
                  {unreadNotificationCount > 99 ? '99+' : unreadNotificationCount}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* TABS */}
        <View style={styles.tabContainer}>
          {['Check',  'Leave'].map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[styles.tabButton, activeTab === tab && styles.activeTabButton]}
              onPress={() => handleTabPress(tab as any)}
            >
              {tab === 'Check' && <CheckCircle size={18} color={activeTab === 'Check' ? '#FFF' : '#64748B'} style={{ marginRight: 6 }} />}
              {tab === 'Leave' && <LogOut size={18} color={activeTab === 'Leave' ? '#FFF' : '#64748B'} style={{ marginRight: 6 }} />}
              <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
                {tab === 'Break' ? 'Break Time' : tab}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* STATUS + FINGERPRINT */}
        <View style={styles.statusContainer}>
          <View style={styles.timeInfoCard}>
            <View style={styles.timeRow}>
              <View style={styles.iconBox}><Clock size={20} color="#5B4BFF" /></View>
              <View>
                <Text style={styles.timeLabel}>Check In Time</Text>
                <Text style={styles.timeValue}>{checkInTime}</Text>
              </View>
            </View>
            <View style={[styles.timeRow, { marginTop: 20 }]}>
              <View style={styles.iconBox}><Timer size={20} color="#5B4BFF" /></View>
              <View>
                <Text style={styles.timeLabel}>Working Time</Text>
                <Text style={styles.timeValue}>{workedTime}</Text>
              </View>
            </View>
          </View>

          {/* Animated Check In/Out Button without white box */}
          <View style={styles.actionContainer}>
            {biometricsAvailable === false ? (
              // Simple Check In/Out button when biometrics not available
              <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
                <TouchableOpacity
                  style={[styles.simpleButton, isCheckedIn ? styles.btnRed : styles.btnBlue]}
                  activeOpacity={0.85}
                  onPress={handleAttendancePress}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator size="small" color="#FFF" />
                  ) : (
                    <Text style={styles.simpleButtonText}>
                      {isCheckedIn ? 'Check Out' : 'Check In'}
                    </Text>
                  )}
                </TouchableOpacity>
              </Animated.View>
            ) : (
              // Fingerprint button with glow animation
              <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
                <Animated.View
                  style={[
                    styles.glowRing,
                    {
                      opacity: glowAnim,
                      backgroundColor: isCheckedIn ? '#EF444420' : '#5B4BFF20',
                    },
                  ]}
                />
                <TouchableOpacity
                  style={[styles.checkOutButton, isCheckedIn ? styles.btnRed : styles.btnBlue]}
                  activeOpacity={0.85}
                  onPress={handleAttendancePress}
                  disabled={loading}
                >
                  {loading ? <ActivityIndicator size="small" color="#FFF" /> : <Fingerprint size={40} color="#FFF" />}
                  <Text style={styles.checkOutText}>{isCheckedIn ? 'Check Out' : 'Check In'}</Text>
                </TouchableOpacity>
              </Animated.View>
            )}
          </View>
        </View>

        {/* TODAY TIME LOG GRID */}
        {/* <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Today Time Log</Text>
          <Text style={styles.sectionSubtitle}>An Overview Of Your Progress</Text>
        </View>
        <View style={styles.statsGrid}>
          {timeLogs.map((item, index) => (
            <View key={index} style={[styles.statCard, { backgroundColor: item.color }]}>
              <Text style={styles.statTime}>{item.time}</Text>
              <Text style={styles.statLabel}>{item.label}</Text>
            </View>
          ))}
        </View> */}

 {/* THIS MONTH — PIXEL-PERFECT CHART */}
<View style={styles.chartSection}>
  <View style={styles.chartHeader}>
    <View>
      <Text style={styles.chartTitle}>This Month</Text>
      <Text style={styles.chartSubtitle}>Monthly Attendance Overview</Text>
    </View>
    <Text style={styles.totalDays}>
      Total: {employeeStats ? employeeStats.onTimeDays + employeeStats.lateDays + employeeStats.onLeaveDays + employeeStats.absentDays : 0} days
    </Text>
  </View>

  <View style={styles.chartContainer}>
    {employeeStats ? (
      <View style={styles.barsContainer}>
        {[
          { label: 'On Time', value: employeeStats.onTimeDays, color: '#10B981' },
          { label: 'Late', value: employeeStats.lateDays, color: '#F59E0B' },
          { label: 'On Leave', value: employeeStats.onLeaveDays, color: '#3B82F6' },
          { label: 'Absent', value: employeeStats.absentDays, color: '#EF4444' },
        ].map((item, index) => {
          const maxValue = Math.max(
            employeeStats.onTimeDays, 
            employeeStats.lateDays, 
            employeeStats.onLeaveDays, 
            employeeStats.absentDays,
            1 // Minimum to prevent division by zero
          );
          const barHeight = item.value > 0 ? Math.max((item.value / maxValue) * 140, 8) : 8;

          return (
            <View key={index} style={styles.barItem}>
              {/* Bar with rounded corners */}
              <View style={[styles.bar, { height: barHeight, backgroundColor: item.color }]} />
              
              {/* Label & Count */}
              <Text style={styles.barLabel}>{item.label}</Text>
              {item.value > 0 && <Text style={styles.barCount}>{item.value} days</Text>}
            </View>
          );
        })}
      </View>
    ) : (
      <View style={styles.loadingChart}>
        <ActivityIndicator size="small" color="#5B4BFF" />
        <Text style={styles.loadingChartText}>Loading monthly stats...</Text>
      </View>
    )}
  </View>
</View>


      </ScrollView>

      {/* Image Preview Modal */}
      <ImagePreviewModal
        visible={showImagePreview}
        imageUri={userData?.profilePhotoUrl || null}
        onClose={() => setShowImagePreview(false)}
      />

    </SafeAreaView>
  );
}

// ────────────────────────────── STYLES ──────────────────────────────
const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  blob: { position: 'absolute', top: -100, right: -100, width: 300, height: 300, borderRadius: 150, backgroundColor: '#5B4BFF10' },

  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 24, paddingTop: 20, marginBottom: 24 },
  userInfo: { flexDirection: 'row', alignItems: 'center' },
  avatar: { width: 50, height: 50, borderRadius: 25, marginRight: 12, borderWidth: 2, borderColor: '#FFF' },
  defaultAvatar: { 
    width: 50, 
    height: 50, 
    borderRadius: 25, 
    marginRight: 12, 
    borderWidth: 2, 
    borderColor: '#FFF',
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dateText: { fontSize: 13, color: '#64748B', marginBottom: 2 },
  greetingRow: { flexDirection: 'row', alignItems: 'center' },
  greetingText: { fontSize: 18, fontWeight: '700', color: '#0F172A', marginRight: 6 },
  bellButton: { 
    width: 44, 
    height: 44, 
    backgroundColor: '#FFF', 
    borderRadius: 14, 
    alignItems: 'center', 
    justifyContent: 'center', 
    shadowColor: '#000', 
    shadowOpacity: 0.05, 
    shadowRadius: 10, 
    elevation: 2,
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#EF4444',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: '#FFF',
  },
  notificationBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  tabContainer: { flexDirection: 'row', backgroundColor: '#FFF', marginHorizontal: 24, borderRadius: 16, padding: 6, marginBottom: 24, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 8, elevation: 2 },
  tabButton: { flex: 1, flexDirection: 'row', paddingVertical: 12, alignItems: 'center', justifyContent: 'center', borderRadius: 12 },
  activeTabButton: { backgroundColor: '#5B4BFF', shadowColor: '#5B4BFF', shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 },
  tabText: { fontSize: 14, fontWeight: '600', color: '#64748B' },
  activeTabText: { color: '#FFFFFF' },

  statusContainer: { flexDirection: 'row', paddingHorizontal: 24, marginBottom: 30, gap: 16 },
  timeInfoCard: { flex: 1.2, backgroundColor: '#FFF', borderRadius: 24, padding: 20, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 15, elevation: 5 },
  timeRow: { flexDirection: 'row', alignItems: 'center' },
  iconBox: { width: 36, height: 36, borderRadius: 10, backgroundColor: '#F1F5F9', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  timeLabel: { fontSize: 12, color: '#64748B', marginBottom: 2 },
  timeValue: { fontSize: 16, fontWeight: '700', color: '#0F172A' },

  actionContainer: { 
    flex: 0.8, 
    alignItems: 'center', 
    justifyContent: 'center', 
    minHeight: 120,
    position: 'relative',
  },
  glowRing: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    top: '50%',
    left: '50%',
    marginLeft: -70,
    marginTop: -70,
  },
  checkOutButton: { 
    width: 110, 
    height: 110, 
    borderRadius: 55, 
    alignItems: 'center', 
    justifyContent: 'center', 
    borderWidth: 4, 
    shadowOpacity: 0.5, 
    shadowRadius: 16, 
    elevation: 10,
  },
  checkOutText: { color: '#FFF', fontSize: 12, fontWeight: '600', marginTop: 8 },
  simpleButton: { 
    paddingHorizontal: 28, 
    paddingVertical: 16, 
    borderRadius: 30, 
    alignItems: 'center', 
    justifyContent: 'center', 
    minWidth: 110, 
    shadowOpacity: 0.5, 
    shadowRadius: 12, 
    elevation: 8,
  },
  simpleButtonText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
  btnRed: { backgroundColor: '#EF4444', borderColor: '#FEF2F2', shadowColor: '#EF4444' },
  btnBlue: { backgroundColor: '#5B4BFF', borderColor: '#E0E7FF', shadowColor: '#5B4BFF' },

  sectionHeader: { paddingHorizontal: 24, marginBottom: 16 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#0F172A' },
  sectionSubtitle: { fontSize: 13, color: '#64748B', marginTop: 4 },

  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 24, gap: 12 },
  statCard: { width: (width - 48 - 24) / 3, paddingVertical: 20, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  statTime: { fontSize: 16, fontWeight: '800', color: '#0F172A', marginBottom: 4 },
  statLabel: { fontSize: 11, color: '#64748B', textAlign: 'center' },

  // ──────── THIS MONTH CHART – CLEAN & PREMIUM ────────
// ──────── THIS MONTH CHART – PIXEL-PERFECT & RESPONSIVE ────────
chartSection: {
  marginTop: 32,
  paddingHorizontal: 24,
},

chartHeader: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'flex-end',
  marginBottom: 24,
},

chartTitle: {
  fontSize: 22,
  fontWeight: '800',
  color: '#0F172A',
},

chartSubtitle: {
  fontSize: 14,
  color: '#64748B',
  marginTop: 4,
},

totalDays: {
  fontSize: 13,
  color: '#64748B',
  fontWeight: '600',
  backgroundColor: '#F8FAFC',
  paddingHorizontal: 12,
  paddingVertical: 6,
  borderRadius: 20,
},

chartContainer: {
  backgroundColor: '#FFFFFF',
  borderRadius: 24,
  padding: 28,
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 10 },
  shadowOpacity: 0.08,
  shadowRadius: 20,
  elevation: 12,
},

barsContainer: {
  flexDirection: 'row',
  justifyContent: 'space-evenly',
  alignItems: 'flex-end',
  height: 200,
  paddingBottom: 12,
  gap: 8,
},

barItem: {
  alignItems: 'center',
  flex: 1,
  justifyContent: 'flex-end',
},

bar: {
  width: 28,
  borderTopLeftRadius: 14,
  borderTopRightRadius: 14,
  minHeight: 8,
},

barLabel: {
  fontSize: 12,
  color: '#64748B',
  fontWeight: '600',
  textAlign: 'center',
  marginTop: 12,
  marginBottom: 4,
},

barCount: {
  fontSize: 11,
  color: '#94A3B8',
  fontWeight: '500',
  textAlign: 'center',
},

loadingChart: {
  height: 200,
  justifyContent: 'center',
  alignItems: 'center',
},

loadingChartText: {
  marginTop: 12,
  fontSize: 14,
  color: '#94A3B8',
},
});