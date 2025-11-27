// src/screens/HomeScreen.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  StatusBar,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import {
  Bell, Clock, Coffee, LogOut, Fingerprint, Briefcase,
  CheckCircle, AlertCircle, Timer
} from 'lucide-react-native';

import { AttendanceService } from '../services/AttendanceService';
import { SnackbarService } from '../services/SnackbarService';
import { StorageService, UserData } from '../services/StorageService';
import { NavigationService } from '../services/NavigationService';
import { AttendanceAPI } from '../api/attendance';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const [activeTab, setActiveTab] = useState<'Check' | 'Break' | 'Leave'>('Check');
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checkInTime, setCheckInTime] = useState('--:--');
  const [workedTime, setWorkedTime] = useState('0h 0m');
  const [checkInTimestamp, setCheckInTimestamp] = useState<Date | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [employeeStats, setEmployeeStats] = useState<{
    onTimeDays: number;
    lateDays: number;
    onLeaveDays: number;
    absentDays: number;
  } | null>(null);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const data = await StorageService.getUserData();
      console.log('Loaded User Data:', data);
      setUserData(data);
      if (data) await loadEmployeeStats(data._id);
    } catch (error) {
      console.error('Error loading user data:', error);
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
      console.error('Error loading employee stats:', error);
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
          setCheckInTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
          SnackbarService.showSuccess(response.message || "Checked In Successfully!");
        } else {
          setIsCheckedIn(false);
          if (checkInTimestamp) {
            const now = new Date();
            const diffMs = now.getTime() - checkInTimestamp.getTime();
            const hours = Math.floor(diffMs / (1000 * 60 * 60));
            const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
            setWorkedTime(`${hours}h ${minutes}m`);
            setCheckInTimestamp(null);
          }
          SnackbarService.showSuccess(response.message || "Checked Out Successfully!");
        }
      } else {
        SnackbarService.showError(response.message || "Failed to mark attendance");
      }
    } catch (error) {
      SnackbarService.showError("Failed to connect to server");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await StorageService.clearAllData();
    SnackbarService.showSuccess('Logged out successfully');
    NavigationService.reset([{ name: 'Welcome' }]);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      <LinearGradient colors={['#E8ECFF', '#F5F7FF', '#FFFFFF']} style={StyleSheet.absoluteFill} />
      <View style={styles.blob} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        {/* HEADER */}
        <View style={styles.header}>
          <View style={styles.userInfo}>
          
            <Image
              source={{ uri: userData?.profilePhotoUrl || 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=400' }}
              style={styles.avatar}
            />
            <View>
              <Text style={styles.dateText}>{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' })}</Text>
              <View style={styles.greetingRow}>
                <Text style={styles.greetingText}>Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 17 ? 'Afternoon' : 'Evening'}</Text>
                <Text style={{ fontSize: 18 }}>{userData?.fullName || 'User'}</Text>
              </View>
            </View>
          </View>
          <TouchableOpacity style={styles.bellButton} onPress={handleLogout}>
            <LogOut size={24} color="#1E293B" />
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

          <View style={styles.actionCard}>
            <TouchableOpacity
              style={[styles.checkOutButton, isCheckedIn ? styles.btnRed : styles.btnBlue]}
              activeOpacity={0.85}
              onPress={handleAttendancePress}
              disabled={loading}
            >
              {loading ? <ActivityIndicator size="small" color="#FFF" /> : <Fingerprint size={40} color="#FFF" />}
              <Text style={styles.checkOutText}>{isCheckedIn ? 'Check Out' : 'Check In'}</Text>
            </TouchableOpacity>
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
          { label: 'On Time', value: employeeStats.onTimeDays, color: '#10B981', bg: '#ECFDF5' },
          { label: 'Late', value: employeeStats.lateDays, color: '#F59E0B', bg: '#FFFBEB' },
          { label: 'On Leave', value: employeeStats.onLeaveDays, color: '#3B82F6', bg: '#EFF6FF' },
          { label: 'Absent', value: employeeStats.absentDays, color: '#EF4444', bg: '#FEF2F2' },
        ].map((item, index) => {
          const maxValue = Math.max(employeeStats.onTimeDays, employeeStats.lateDays, employeeStats.onLeaveDays, employeeStats.absentDays);
          const barHeight = maxValue > 0 ? (item.value / maxValue) * 120 : 0; // 120px max height for bars
          const showBadge = item.value > 0;

          return (
            <View key={index} style={styles.barItem}>
              {/* Bar Column */}
              <View style={styles.barColumn}>
                {/* Thin base line for zero values */}
                <View style={styles.baseLine} />
                
                {/* Main Bar */}
                <View style={[styles.bar, { height: barHeight, backgroundColor: item.color }]} />
                
             
              </View>

              {/* Label & Count */}
              <Text style={styles.barLabel}>{item.label}</Text>
              {showBadge && <Text style={styles.barCount}>{item.value} days</Text>}
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
  dateText: { fontSize: 13, color: '#64748B', marginBottom: 2 },
  greetingRow: { flexDirection: 'row', alignItems: 'center' },
  greetingText: { fontSize: 18, fontWeight: '700', color: '#0F172A', marginRight: 6 },
  bellButton: { width: 44, height: 44, backgroundColor: '#FFF', borderRadius: 14, alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, elevation: 2 },

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

  actionCard: { flex: 0.8, backgroundColor: '#FFF', borderRadius: 24, padding: 10, alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 15, elevation: 5 },
  checkOutButton: { width: 110, height: 110, borderRadius: 55, alignItems: 'center', justifyContent: 'center', borderWidth: 4, shadowOpacity: 0.4, shadowRadius: 12, elevation: 8 },
  checkOutText: { color: '#FFF', fontSize: 12, fontWeight: '600', marginTop: 8 },
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
  height: 160, // Perfect height for bars + labels
  paddingBottom: 8,
},

barItem: {
  alignItems: 'center',
  width: 60, // Fixed width per item for even spacing
},

barColumn: {
  height: 120, // Max bar height
  width: 32, // Thin column width
  justifyContent: 'flex-end',
  alignItems: 'center',
  position: 'relative',
},

baseLine: {
  height: 2,
  width: 20,
  backgroundColor: '#E2E8F0',
  borderRadius: 1,
},

bar: {
  width: 20,
  borderRadius: 10, // Rounded like screenshot
  minHeight: 2,
  marginTop: -1, // Overlap base line slightly
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.1,
  shadowRadius: 4,
  elevation: 3,
},

badge: {
  position: 'absolute',
  top: -32, // Position above bar
  width: 32,
  height: 32,
  borderRadius: 16,
  justifyContent: 'center',
  alignItems: 'center',
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.25,
  shadowRadius: 8,
  elevation: 8,
},

badgeText: {
  color: '#FFF',
  fontSize: 14,
  fontWeight: '800',
  textAlign: 'center',
},

barLabel: {
  marginTop: 12,
  fontSize: 12,
  color: '#64748B',
  fontWeight: '600',
  textAlign: 'center',
  width: 60,
},

barCount: {
  marginTop: 4,
  fontSize: 11,
  color: '#94A3B8',
  fontWeight: '500',
  textAlign: 'center',
},

loadingChart: {
  height: 160,
  justifyContent: 'center',
  alignItems: 'center',
},

loadingChartText: {
  marginTop: 12,
  fontSize: 14,
  color: '#94A3B8',
},
});