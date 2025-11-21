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
  ActivityIndicator // Added for loading state
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import {
  Bell, Clock, Coffee, LogOut, Fingerprint, Briefcase,
  CheckCircle, AlertCircle, Timer
} from 'lucide-react-native';
import { AttendanceService } from '../services/AttendanceService'; // Import the service
import { SnackbarService } from '../services/SnackbarService'; // Import snackbar service
import { StorageService, UserData } from '../services/StorageService'; // Import storage service
import { NavigationService } from '../services/NavigationService'; // Import navigation service
import { AttendanceAPI } from '../api/attendance'; // Import attendance API

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  // State to handle the top tabs (Check, Break, Leave)
  const [activeTab, setActiveTab] = useState<'Check' | 'Break' | 'Leave'>('Check');

  // --- NEW STATES ---
  const [isCheckedIn, setIsCheckedIn] = useState(false); // Tracks status
  const [loading, setLoading] = useState(false); // Tracks API loading
  const [checkInTime, setCheckInTime] = useState('--:--');
  const [workedTime, setWorkedTime] = useState('0h 0m');
  const [userData, setUserData] = useState<UserData | null>(null);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const data = await StorageService.getUserData();
      setUserData(data);
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  // Dummy data for the "Today Time Log" grid
  const timeLogs = [
    { label: 'Late In Time', time: '5h 21m', color: '#F1F5F9', icon: AlertCircle },
    { label: 'Early Check Out', time: '0h 0m', color: '#F1F5F9', icon: LogOut },
    { label: 'Break Time', time: '0h 11m', color: '#F1F5F9', icon: Coffee },
    { label: 'Worked Time', time: '0h 20m', color: '#E0E7FF', icon: Briefcase }, // Highlighted
    { label: 'Over Time', time: '0h 0m', color: '#F1F5F9', icon: Timer },
  ];

  // Function to Handle Tab Press
  const handleTabPress = (tab: 'Check' | 'Break' | 'Leave') => {
    if (tab === 'Leave') {
      NavigationService.navigate('LeaveRequest');
    } else {
      setActiveTab(tab);
    }
  };
  const handleAttendancePress = async () => {

    // 1. Check availability (Optional, good for debugging)
    const { available } = await AttendanceService.checkAvailability();
    if (!available) {
      SnackbarService.showError('Biometrics not available on this device');
      return;
    }

    // 2. Authenticate (Fingerprint Popup)
    const isAuthenticated = await AttendanceService.authenticateUser();

    if (isAuthenticated) {
      setLoading(true); // Start Spinner

      try {
        // 3. Get user data for employee ID
        const userData = await StorageService.getUserData();
        if (!userData) {
          SnackbarService.showError('User data not found. Please login again.');
          return;
        }

        // 4. Create attendance record
        const payload = {
          empId: userData.employeeId,
          reason: isCheckedIn ? 'CHECK_OUT' : 'CHECK_IN'
        };

        const response = await AttendanceAPI.create(payload);

        console.log('Backend Response:', response);

        // 5. Check response success
        if (response.isSuccess) {
          // Update UI based on success
          if (!isCheckedIn) {
            setIsCheckedIn(true);
            setCheckInTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
            SnackbarService.showSuccess(response.message || "Checked In Successfully!");
          } else {
            setIsCheckedIn(false);
            SnackbarService.showSuccess(response.message || "Checked Out Successfully!");
          }
        } else {
          SnackbarService.showError(response.message || "Failed to mark attendance");
        }

      } catch (error) {
        SnackbarService.showError("Failed to connect to server");
      } finally {
        setLoading(false); // Stop Spinner
      }
    } else {
      SnackbarService.showError("Biometric authentication failed");
    }
  };

  // Function to Handle Logout
  const handleLogout = async () => {
    try {
      await StorageService.clearAllData();
      SnackbarService.showSuccess('Logged out successfully');
      NavigationService.navigate('LoginScreen');
    } catch (error) {
      console.error('Error during logout:', error);
      SnackbarService.showError('Error during logout');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

      {/* Background Gradient */}
      <LinearGradient
        colors={['#E8ECFF', '#F5F7FF', '#FFFFFF']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      {/* Decorative Blob (Reused for consistency) */}
      <View style={styles.blob} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }} // Space for bottom tabs later
      >
        {/* --- HEADER SECTION --- */}
        <View style={styles.header}>
          <View style={styles.userInfo}>
            {/* Avatar Placeholder */}
            <Image
              source={{ uri: userData?.profilePhotoUrl || 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=400&auto=format&fit=crop&q=60' }}
              style={styles.avatar}
            />
            <View>
              <Text style={styles.dateText}>Thursday, 30 Oct 2025</Text>
              <View style={styles.greetingRow}>
                <Text style={styles.greetingText}>Good Noon</Text>
                <Text style={{ fontSize: 18 }}>🌤️</Text>
              </View>
            </View>
          </View>
          
          {/* Logout Button */}
          <TouchableOpacity style={styles.bellButton} onPress={handleLogout}>
            <LogOut size={24} color="#1E293B" />
          </TouchableOpacity>
        </View>

        {/* --- TOP TABS (Check | Break | Leave) --- */}
        <View style={styles.tabContainer}>
          {['Check', 'Break', 'Leave'].map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[styles.tabButton, activeTab === tab && styles.activeTabButton]}
              onPress={() => handleTabPress(tab as any)}
            >
              {tab === 'Check' && <CheckCircle size={18} color={activeTab === 'Check' ? '#FFF' : '#64748B'} style={{ marginRight: 6 }} />}
              {tab === 'Break' && <Coffee size={18} color={activeTab === 'Break' ? '#FFF' : '#64748B'} style={{ marginRight: 6 }} />}
              {tab === 'Leave' && <LogOut size={18} color={activeTab === 'Leave' ? '#FFF' : '#64748B'} style={{ marginRight: 6 }} />}
              
              <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
                {tab === 'Break' ? 'Break Time' : tab}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* --- MAIN STATUS SECTION (Clock & Fingerprint) --- */}
        <View style={styles.statusContainer}>
          {/* Left Side: Time Info */}
          <View style={styles.timeInfoCard}>
            <View style={styles.timeRow}>
              <View style={styles.iconBox}>
                <Clock size={20} color="#5B4BFF" />
              </View>
              <View>
                <Text style={styles.timeLabel}>Check In Time</Text>
                <Text style={styles.timeValue}>{checkInTime}</Text>
              </View>
            </View>

            <View style={[styles.timeRow, { marginTop: 20 }]}>
               <View style={styles.iconBox}>
                <Timer size={20} color="#5B4BFF" />
              </View>
              <View>
                <Text style={styles.timeLabel}>Working Time</Text>
                <Text style={styles.timeValue}>{workedTime}</Text>
              </View>
            </View>
          </View>

          {/* Right Side: Dynamic Fingerprint Button */}
          <View style={styles.actionCard}>
            <TouchableOpacity 
              style={[
                styles.checkOutButton, 
                // Change color based on status
                isCheckedIn ? styles.btnRed : styles.btnBlue 
              ]} 
              activeOpacity={0.8}
              onPress={handleAttendancePress}
              disabled={loading} // Disable while sending to backend
            >
              {loading ? (
                <ActivityIndicator size="small" color="#FFF" />
              ) : (
                <>
                  <Fingerprint size={40} color="#FFF" />
                  <Text style={styles.checkOutText}>
                    {isCheckedIn ? 'Check Out' : 'Check In'}
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* --- TODAY TIME LOG (Grid) --- */}
        <View style={styles.sectionHeader}>
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
        </View>
        
        {/* --- THIS MONTH CHART --- */}
        <View style={{ marginTop: 24, paddingHorizontal: 24 }}>
            <Text style={styles.sectionTitle}>This Month</Text>
            
            <View style={styles.chartCard}>
                <View style={styles.chartHeader}>
                   <Text style={styles.sectionSubtitle}>Weekly Attendance</Text>
                   <Text style={styles.workingDaysText}>Working Days: 3</Text>
                </View>

                <View style={styles.chartRow}>
                    {/* Custom Bar Chart Data */}
                    {[
                        { day: 'M', percent: 80 },
                        { day: 'T', percent: 60 },
                        { day: 'W', percent: 100 },
                        { day: 'T', percent: 40 },
                        { day: 'F', percent: 0 },
                        { day: 'S', percent: 0 },
                        { day: 'S', percent: 0 },
                    ].map((item, index) => (
                        <View key={index} style={styles.barContainer}>
                            <View style={styles.barTrack}>
                                <View style={[
                                    styles.barFill, 
                                    { height: `${item.percent}%` }, // Dynamic Height
                                    item.percent === 0 && { backgroundColor: 'transparent' } // Hide if 0
                                ]} />
                            </View>
                            <Text style={styles.dayLabel}>{item.day}</Text>
                        </View>
                    ))}
                </View>
            </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  
  // Background decoration
  blob: {
    position: 'absolute',
    top: -100,
    right: -100,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: '#5B4BFF10', // Very light purple
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 20,
    marginBottom: 24,
  },
  userInfo: { flexDirection: 'row', alignItems: 'center' },
  avatar: { width: 50, height: 50, borderRadius: 25, marginRight: 12, borderWidth: 2, borderColor: '#FFF' },
  dateText: { fontSize: 13, color: '#64748B', marginBottom: 2 },
  greetingRow: { flexDirection: 'row', alignItems: 'center' },
  greetingText: { fontSize: 18, fontWeight: '700', color: '#0F172A', marginRight: 6 },
  
  bellButton: {
    width: 44, height: 44, backgroundColor: '#FFF', borderRadius: 14,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, elevation: 2
  },
  notificationBadge: {
    position: 'absolute', top: 8, right: 8, width: 10, height: 10,
    backgroundColor: '#EF4444', borderRadius: 5, borderWidth: 1.5, borderColor: '#FFF',
    alignItems: 'center', justifyContent: 'center'
  },
  badgeText: { fontSize: 6, color: '#FFF', fontWeight: 'bold', display: 'none' }, // hidden for small dot style

  // Tabs
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    marginHorizontal: 24,
    borderRadius: 16,
    padding: 6,
    marginBottom: 24,
    shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 8, elevation: 2
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
  },
  activeTabButton: {
    backgroundColor: '#5B4BFF',
    shadowColor: '#5B4BFF', shadowOpacity: 0.3, shadowRadius: 8, elevation: 4
  },
  tabText: { fontSize: 14, fontWeight: '600', color: '#64748B' },
  activeTabText: { color: '#FFFFFF' },

  // Status Container (Left Info + Right Fingerprint)
  statusContainer: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    marginBottom: 30,
    gap: 16,
  },
  timeInfoCard: {
    flex: 1.2,
    backgroundColor: '#FFF',
    borderRadius: 24,
    padding: 20,
    justifyContent: 'center',
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 15, elevation: 5,
  },
  timeRow: { flexDirection: 'row', alignItems: 'center' },
  iconBox: {
    width: 36, height: 36, borderRadius: 10, backgroundColor: '#F1F5F9',
    alignItems: 'center', justifyContent: 'center', marginRight: 12
  },
  timeLabel: { fontSize: 12, color: '#64748B', marginBottom: 2 },
  timeValue: { fontSize: 16, fontWeight: '700', color: '#0F172A' },

  actionCard: {
    flex: 0.8,
    backgroundColor: '#FFF',
    borderRadius: 24,
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 15, elevation: 5,
  },
  checkOutButton: {
    width: 110, height: 110,
    borderRadius: 55,
    backgroundColor: '#EF4444', // Red color for Check Out
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: '#FEF2F2', // Light red border ring
    shadowColor: '#EF4444', shadowOpacity: 0.4, shadowRadius: 12, elevation: 8
  },
  checkOutText: { color: '#FFF', fontSize: 12, fontWeight: '600', marginTop: 8 },

  // Stats Section
  sectionHeader: { paddingHorizontal: 24, marginBottom: 16 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#0F172A' },
  sectionSubtitle: { fontSize: 13, color: '#64748B', marginTop: 4 },

  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 24,
    gap: 12,
  },
  statCard: {
    width: (width - 48 - 24) / 3, // Calculate width for 3 columns
    paddingVertical: 20,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statTime: { fontSize: 16, fontWeight: '800', color: '#0F172A', marginBottom: 4 },
  statLabel: { fontSize: 11, color: '#64748B', textAlign: 'center' },

  // Chart Section
  chartCard: {
    backgroundColor: '#FFF',
    borderRadius: 24,
    padding: 20,
    marginTop: 12,
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, elevation: 4,
  },
  chartHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20,
  },
  workingDaysText: { fontSize: 12, color: '#64748B', fontWeight: '500' },
  
  chartRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 120, // Fixed height for the bars area
  },
  barContainer: { alignItems: 'center', gap: 8 },
  barTrack: {
    width: 12,
    height: 100, // Max height
    backgroundColor: '#F1F5F9',
    borderRadius: 10,
    justifyContent: 'flex-end', // Grow from bottom
  },
  barFill: {
    width: '100%',
    borderRadius: 10,
    backgroundColor: '#5B4BFF',
  },
  dayLabel: { fontSize: 11, color: '#94A3B8', fontWeight: '500' },

  // Add these specific button styles
  btnRed: {
    backgroundColor: '#EF4444',
    borderColor: '#FEF2F2',
    shadowColor: '#EF4444',
  },
  btnBlue: {
    backgroundColor: '#5B4BFF',
    borderColor: '#E0E7FF',
    shadowColor: '#5B4BFF',
  },
});