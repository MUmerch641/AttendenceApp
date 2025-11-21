// src/screens/HistoryScreen.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import { Calendar, Clock, User, AlertCircle } from 'lucide-react-native';
import { AttendanceAPI, AttendanceReportParams } from '../api/attendance';
import { SnackbarService } from '../services/SnackbarService';

// Helper functions for date formatting (without date-fns)
const formatDate = (date: Date, format: string) => {
  const options: Intl.DateTimeFormatOptions = {};
  
  switch (format) {
    case 'MMMM yyyy':
      options.year = 'numeric';
      options.month = 'long';
      return date.toLocaleDateString('en-US', options);
    case 'dd MMM, yyyy':
      options.year = 'numeric';
      options.month = 'short';
      options.day = '2-digit';
      return date.toLocaleDateString('en-US', options);
    case 'hh:mm a':
      return date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit', 
        hour12: true 
      });
    default:
      return date.toLocaleDateString();
  }
};

type AttendanceItem = {
  _id: string;
  empId: string;
  reason: string;
  status: 'present' | 'late' | 'absent';
  timeIn: string;
  createdAt: string;
  empDocId?: string;
  updatedAt?: string;
  __v?: number;
};

type EmployeeData = {
  _id: string;
  fullName: string;
  officialEmail: string;
  position: string;
  attendance: AttendanceItem[];
};

export default function HistoryScreen() {
  const [data, setData] = useState<EmployeeData[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1); // JS months are 0-indexed
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [totalCount, setTotalCount] = useState(0);

  // Fetch attendance history from API
  const fetchAttendanceHistory = async (params?: Partial<AttendanceReportParams>) => {
    try {
      const reportParams: AttendanceReportParams = {
        year: currentYear,
        month: currentMonth,
        count: 50, // Default page size
        pageNo: 1,
        ...params
      };

      console.log('Fetching attendance report with params:', reportParams);
      const response = await AttendanceAPI.report(reportParams);

      if (response.isSuccess) {
        setData(response.data);
        setTotalCount(response.totalCount || 0);
        console.log('Attendance data loaded:', response.data.length, 'employees');
      } else {
        SnackbarService.showError(response.message || 'Failed to load attendance data');
        setData([]);
        setTotalCount(0);
      }
    } catch (error: any) {
      console.error('Error fetching attendance:', error);
      SnackbarService.showError('Failed to load attendance history');
      setData([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAttendanceHistory();
  }, [currentMonth, currentYear]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchAttendanceHistory();
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'present': return '#10B981';
      case 'late': return '#F59E0B';
      case 'absent': return '#EF4444';
      default: return '#64748B';
    }
  };

  const getStatusBadge = (status: string) => {
    const color = getStatusColor(status);
    return (
      <View style={[styles.statusBadge, { backgroundColor: color + '20', borderColor: color }]}>
        <Text style={[styles.statusText, { color }]}>{status.charAt(0).toUpperCase() + status.slice(1)}</Text>
      </View>
    );
  };

  const renderItem = ({ item }: { item: AttendanceItem & { fullName?: string; position?: string } }) => {
    const date = new Date(item.timeIn || item.createdAt);
    const timeIn = formatDate(date, 'hh:mm a');
    const dateStr = formatDate(date, 'dd MMM, yyyy');

    return (
      <View style={styles.attendanceCard}>
        <View style={styles.cardHeader}>
          <View style={styles.empInfo}>
            <View style={styles.avatarPlaceholder}>
              <User size={20} color="#64748B" />
            </View>
            <View>
              <Text style={styles.empName}>{item.fullName || 'Unknown'}</Text>
              <Text style={styles.empId}>ID: {item.empId}</Text>
            </View>
          </View>
          {getStatusBadge(item.status)}
        </View>

        <View style={styles.divider} />

        <View style={styles.detailsRow}>
          <View style={styles.detailItem}>
            <Calendar size={18} color="#64748B" />
            <Text style={styles.detailLabel}>Date</Text>
            <Text style={styles.detailValue}>{dateStr}</Text>
          </View>
          <View style={styles.detailItem}>
            <Clock size={18} color="#64748B" />
            <Text style={styles.detailLabel}>Time In</Text>
            <Text style={styles.detailValue}>{timeIn}</Text>
          </View>
        </View>

        {item.reason !== "N/A" && (
          <View style={styles.reasonContainer}>
            <AlertCircle size={16} color="#F59E0B" />
            <Text style={styles.reasonText}>Reason: {item.reason}</Text>
          </View>
        )}
      </View>
    );
  };

  const allAttendance = data.flatMap(emp => 
    emp.attendance.map(att => ({ 
      ...att, 
      fullName: emp.fullName, 
      position: emp.position 
    }))
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient colors={['#E8ECFF', '#F5F7FF', '#FFFFFF']} style={StyleSheet.absoluteFill} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#5B4BFF" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#E8ECFF', '#F5F7FF', '#FFFFFF']}
        style={StyleSheet.absoluteFill}
      />

      {/* Background Blobs */}
      <View style={styles.blobContainer}>
        <View style={styles.blob1} />
        <View style={styles.blob2} />
      </View>

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.monthNavButton}
          onPress={() => {
            if (currentMonth === 1) {
              setCurrentMonth(12);
              setCurrentYear(currentYear - 1);
            } else {
              setCurrentMonth(currentMonth - 1);
            }
          }}
        >
          <Text style={styles.navText}>‹</Text>
        </TouchableOpacity>
        
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>
            {formatDate(new Date(currentYear, currentMonth - 1), 'MMMM yyyy')}
          </Text>
          <Text style={styles.recordCount}>{totalCount} Records</Text>
        </View>
        
        <TouchableOpacity 
          style={styles.monthNavButton}
          onPress={() => {
            if (currentMonth === 12) {
              setCurrentMonth(1);
              setCurrentYear(currentYear + 1);
            } else {
              setCurrentMonth(currentMonth + 1);
            }
          }}
        >
          <Text style={styles.navText}>›</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={allAttendance}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#5B4BFF']} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Calendar size={64} color="#CBD5E1" />
            <Text style={styles.emptyText}>No attendance records found</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  blobContainer: { ...StyleSheet.absoluteFillObject, top: -120 },
  blob1: {
    position: 'absolute',
    top: 60,
    left: -100,
    width: 340,
    height: 340,
    borderRadius: 170,
    backgroundColor: '#5B4BFF18',
  },
  blob2: {
    position: 'absolute',
    top: 200,
    right: -120,
    width: 380,
    height: 380,
    borderRadius: 190,
    backgroundColor: '#FF7A0018',
  },

  header: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#0B1226',
  },
  recordCount: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '600',
  },
  monthNavButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(91, 75, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  navText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#5B4BFF',
  },

  listContainer: {
    paddingHorizontal: 24,
    paddingBottom: 100,
  },

  attendanceCard: {
    backgroundColor: 'rgba(255,255,255,0.96)',
    borderRadius: 20,
    padding: 18,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  empInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  empName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0B1226',
  },
  empId: {
    fontSize: 13,
    color: '#64748B',
  },

  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1.5,
  },
  statusText: {
    fontSize: 13,
    fontWeight: '700',
  },

  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 12,
  },

  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailItem: {
    alignItems: 'center',
    gap: 6,
  },
  detailLabel: {
    fontSize: 12,
    color: '#94A3B8',
  },
  detailValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0B1226',
  },

  reasonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
    padding: 10,
    backgroundColor: '#FFFBEB',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  reasonText: {
    fontSize: 14,
    color: '#92400E',
    fontWeight: '600',
  },

  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 100,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 18,
    color: '#94A3B8',
    fontWeight: '600',
  },
});