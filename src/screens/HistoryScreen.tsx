// src/screens/HistoryScreen.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import { Calendar, Clock, User, AlertCircle, Search, Filter, X, ChevronLeft, ChevronRight } from 'lucide-react-native';
import { FlashList } from '@shopify/flash-list';
import { AttendanceAPI, EmployeeReportParams } from '../api/attendance';
import { SnackbarService } from '../services/SnackbarService';
import { StorageService } from '../services/StorageService';
import { ErrorHandler } from '../utils/errorHandler';
import ErrorState from '../components/ErrorState';
import EmptyState from '../components/EmptyState';

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
  empId?: string;
  reason?: string;
  status?: 'present' | 'late' | 'absent';
  timeIn?: string;
  timeOut?: string;
  createdAt: string;
  empDocId?: string;
  updatedAt?: string;
  __v?: number;
};

export default function HistoryScreen() {
  const [data, setData] = useState<AttendanceItem[]>([]);
  const [filteredData, setFilteredData] = useState<AttendanceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorType, setErrorType] = useState<'network' | 'server' | 'general'>('general');
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1);
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [totalCount, setTotalCount] = useState(0);
  const [empDocId, setEmpDocId] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  
  // Search & Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  
  const PAGE_SIZE = 20;

  // Fetch attendance history from API
  const fetchAttendanceHistory = async (page: number = 1, append: boolean = false) => {
    try {
      if (page === 1) {
        setLoading(true);
        setError(null);
      } else {
        setLoadingMore(true);
      }

      const userData = await StorageService.getUserData();
      if (!userData || !userData._id) {
        setError('User data not found. Please login again.');
        setErrorType('general');
        setLoading(false);
        setRefreshing(false);
        setLoadingMore(false);
        return;
      }

      const reportParams: EmployeeReportParams = {
        year: currentYear,
        month: currentMonth,
        empDocId: userData._id,
        count: PAGE_SIZE,
        pageNo: page,
      };

      const response = await AttendanceAPI.reportsByEmployee(reportParams);
      
      if (response.isSuccess) {
        let attendanceRecords: AttendanceItem[] = [];
        
        if (response.data && response.data.length > 0 && response.data[0].attendance) {
          attendanceRecords = response.data[0].attendance;
        }
        
        if (append) {
          setData(prev => [...prev, ...attendanceRecords]);
          setFilteredData(prev => [...prev, ...attendanceRecords]);
        } else {
          setData(attendanceRecords);
          setFilteredData(attendanceRecords);
        }
        
        setTotalCount(attendanceRecords.length || 0);
        setEmpDocId(userData._id);
        setHasMore(attendanceRecords.length === PAGE_SIZE);
        setError(null);
      } else {
        const errorMsg = response.message || 'Failed to load attendance data';
        if (!append) {
          setError(errorMsg);
          setErrorType('server');
          setData([]);
          setFilteredData([]);
        } else {
          SnackbarService.showError(errorMsg);
        }
        setTotalCount(0);
        setHasMore(false);
      }
    } catch (error: any) {
      const parsedError = ErrorHandler.parseError(error);
      
      if (!append) {
        setError(parsedError.message);
        setErrorType(parsedError.isNetworkError ? 'network' : parsedError.isServerError ? 'server' : 'general');
        setData([]);
        setFilteredData([]);
      } else {
        ErrorHandler.showError(error);
      }
      setTotalCount(0);
      setHasMore(false);
    } finally {
      setLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    setCurrentPage(1);
    setHasMore(true);
    fetchAttendanceHistory(1, false);
  }, [currentMonth, currentYear]);

  // Search & Filter logic
  useEffect(() => {
    let filtered = [...data];

    // Apply search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(item => 
        item.empId?.toLowerCase().includes(query) ||
        item.reason?.toLowerCase().includes(query) ||
        item.status?.toLowerCase().includes(query)
      );
    }

    // Apply status filter
    if (selectedStatus) {
      filtered = filtered.filter(item => item.status?.toLowerCase() === selectedStatus.toLowerCase());
    }

    setFilteredData(filtered);
  }, [searchQuery, selectedStatus, data]);

  const onRefresh = () => {
    setRefreshing(true);
    setCurrentPage(1);
    setHasMore(true);
    fetchAttendanceHistory(1, false);
  };

  const loadMore = () => {
    if (!loadingMore && hasMore && !loading) {
      const nextPage = currentPage + 1;
      setCurrentPage(nextPage);
      fetchAttendanceHistory(nextPage, true);
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSelectedStatus(null);
  };

  const getStatusColor = (status?: string) => {
    if (!status) return '#64748B'; // Default color for undefined/missing status
    
    switch (status.toLowerCase()) {
      case 'present': return '#10B981';
      case 'late': return '#F59E0B';
      case 'absent': return '#EF4444';
      default: return '#64748B';
    }
  };

  const getStatusBadge = (status?: string) => {
    const statusText = status || 'Unknown';
    const color = getStatusColor(status);
    return (
      <View style={[styles.statusBadge, { backgroundColor: color + '20', borderColor: color }]}>
        <Text style={[styles.statusText, { color }]}>{statusText.charAt(0).toUpperCase() + statusText.slice(1)}</Text>
      </View>
    );
  };

  const renderItem = ({ item }: { item: AttendanceItem }) => {
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
              <Text style={styles.empName}>My Attendance</Text>
              {item.empId && <Text style={styles.empId}>ID: {item.empId}</Text>}
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

        {item.reason && item.reason !== "N/A" && (
          <View style={styles.reasonContainer}>
            <AlertCircle size={16} color="#F59E0B" />
            <Text style={styles.reasonText}>Reason: {item.reason}</Text>
          </View>
        )}
      </View>
    );
  };

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

  // Error state
  if (error && !loading) {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient
          colors={['#E8ECFF', '#F5F7FF', '#FFFFFF']}
          style={StyleSheet.absoluteFill}
        />
        <ErrorState
          message={error}
          type={errorType}
          onRetry={() => {
            setCurrentPage(1);
            fetchAttendanceHistory(1, false);
          }}
        />
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
          <ChevronLeft size={24} color="#5B4BFF" strokeWidth={3} />
        </TouchableOpacity>
        
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>
            {formatDate(new Date(currentYear, currentMonth - 1), 'MMMM yyyy')}
          </Text>
          <Text style={styles.recordCount}>{filteredData.length} / {totalCount} Records</Text>
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
          <ChevronRight size={24} color="#5B4BFF" strokeWidth={3} />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Search size={20} color="#64748B" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by ID, reason, status..."
          placeholderTextColor="#94A3B8"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={clearSearch} style={styles.clearButton}>
            <X size={18} color="#64748B" />
          </TouchableOpacity>
        )}
      </View>

      {/* Filter Pills */}
      <View style={styles.filterContainer}>
        <Text style={styles.filterLabel}>Filter:</Text>
        <View style={styles.filterPills}>
          {['present', 'late', 'absent'].map((status) => (
            <TouchableOpacity
              key={status}
              style={[
                styles.filterPill,
                selectedStatus === status && styles.filterPillActive
              ]}
              onPress={() => setSelectedStatus(selectedStatus === status ? null : status)}
            >
              <Text style={[
                styles.filterPillText,
                selectedStatus === status && styles.filterPillTextActive
              ]}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        {(searchQuery || selectedStatus) && (
          <TouchableOpacity onPress={clearSearch} style={styles.clearAllButton}>
            <Text style={styles.clearAllText}>Clear</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* FlashList with Pagination */}
      <FlashList
        data={filteredData}
        keyExtractor={(item: AttendanceItem) => item._id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#5B4BFF']} />
        }
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          loadingMore ? (
            <View style={styles.loadingMore}>
              <ActivityIndicator size="small" color="#5B4BFF" />
              <Text style={styles.loadingMoreText}>Loading more...</Text>
            </View>
          ) : !hasMore && filteredData.length > 0 && filteredData.length >= PAGE_SIZE ? (
            <View style={styles.endMessage}>
              <Text style={styles.endMessageText}>• No more records •</Text>
            </View>
          ) : null
        }
        ListEmptyComponent={
          !loading ? (
            <EmptyState
              message="No attendance records found"
              description={
                searchQuery || selectedStatus
                  ? 'Try adjusting your filters'
                  : 'Records will appear once you mark attendance'
              }
              icon="calendar"
            />
          ) : null
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
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#5B4BFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
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
  emptySubtext: {
    marginTop: 8,
    fontSize: 14,
    color: '#CBD5E1',
    textAlign: 'center',
    paddingHorizontal: 40,
  },

  // Search & Filter Styles
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginBottom: 12,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#0F172A',
    padding: 0,
  },
  clearButton: {
    padding: 4,
  },

  filterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 12,
    gap: 12,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
  },
  filterPills: {
    flexDirection: 'row',
    gap: 8,
    flex: 1,
  },
  filterPill: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  filterPillActive: {
    backgroundColor: '#5B4BFF',
    borderColor: '#5B4BFF',
  },
  filterPillText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },
  filterPillTextActive: {
    color: '#FFFFFF',
  },
  clearAllButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  clearAllText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#EF4444',
  },

  // Pagination Styles
  loadingMore: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    gap: 12,
  },
  loadingMoreText: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
  },
  endMessage: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  endMessageText: {
    fontSize: 13,
    color: '#94A3B8',
    fontWeight: '500',
  },
});