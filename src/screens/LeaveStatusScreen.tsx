// src/screens/LeaveStatusScreen.tsx
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Dimensions,
  Modal,
  TouchableWithoutFeedback,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import { FlashList } from '@shopify/flash-list';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../App';
import {
  ArrowLeft,
  Calendar,
  Clock,
  FileText,
  CheckCircle,
  XCircle,
  AlertCircle,
  Trash2,
  Edit2,
  X,
} from 'lucide-react-native';
import { Alert } from 'react-native';
import { NavigationService } from '../services/NavigationService';
import { AttendanceAPI } from '../api/attendance';
import { LeaveRequest } from '../types';
import { SnackbarService } from '../services/SnackbarService';
import { StorageService } from '../services/StorageService';
import { ErrorHandler } from '../utils/errorHandler';
import ErrorState from '../components/ErrorState';
import EmptyState from '../components/EmptyState';

const { width } = Dimensions.get('window');

type FilterStatus = 'All' | 'Pending' | 'Approved' | 'Rejected';
type LeaveStatusNavigationProp = StackNavigationProp<RootStackParamList, 'LeaveStatus'>;

export default function LeaveStatusScreen() {
  const navigation = useNavigation<LeaveStatusNavigationProp>();
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [filteredLeaves, setFilteredLeaves] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState<FilterStatus>('All');
  const [error, setError] = useState<string | null>(null);
  const [errorType, setErrorType] = useState<'network' | 'server' | 'general'>('general');
  const [userId, setUserId] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedIdForDelete, setSelectedIdForDelete] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Load user data to get userId
  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const userData = await StorageService.getUserData();
      if (userData?._id) {
        setUserId(userData._id);
      } else {
        setError('User not logged in');
        setErrorType('general');
        setLoading(false);
      }
    } catch (error) {
      setError('Failed to load user data');
      setErrorType('general');
      setLoading(false);
    }
  };

  const loadLeaves = async (showLoader = true) => {
    try {
      if (!userId) {
        return;
      }

      if (showLoader) {
        setLoading(true);
        setError(null);
      }
      
      const response = await AttendanceAPI.getMyAllLeaves();
      
      if (response.isSuccess) {
        // Based on backend example: data is the array
        const leaveRecords = Array.isArray(response.data) ? response.data : [];
        setLeaves(leaveRecords);
        applyFilter(leaveRecords, activeFilter);
        setError(null);
      } else {
        const errorMsg = response.message || 'Failed to load leave requests';
        if (showLoader) {
          setError(errorMsg);
          setErrorType('server');
        } else {
          SnackbarService.showError(errorMsg);
        }
      }
    } catch (error) {
      const parsedError = ErrorHandler.parseError(error);
      
      if (showLoader) {
        setError(parsedError.message);
        setErrorType(parsedError.isNetworkError ? 'network' : parsedError.isServerError ? 'server' : 'general');
      } else {
        ErrorHandler.showError(error);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const applyFilter = (leaveList: LeaveRequest[], filter: FilterStatus) => {
    if (filter === 'All') {
      setFilteredLeaves(leaveList);
    } else {
      // Handle both lowercase and capitalized status values
      setFilteredLeaves(leaveList.filter(leave => 
        leave.status.toLowerCase() === filter.toLowerCase()
      ));
    }
  };

  const handleFilterChange = (filter: FilterStatus) => {
    setActiveFilter(filter);
    applyFilter(leaves, filter);
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadLeaves(false);
  }, [activeFilter, userId]);

  useEffect(() => {
    if (userId) {
      loadLeaves();
    }
  }, [userId]);

  const handleDelete = (leaveId: string) => {
    if (!leaveId) return;
    setSelectedIdForDelete(leaveId);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!selectedIdForDelete) return;
    
    try {
      setDeleting(true);
      const response = await AttendanceAPI.deleteLeave(selectedIdForDelete);
      if (response.isSuccess) {
        SnackbarService.showSuccess('Leave request deleted successfully');
        setShowDeleteModal(false);
        loadLeaves(false);
      } else {
        SnackbarService.showError(response.message || 'Failed to delete leave request');
      }
    } catch (error) {
      ErrorHandler.showError(error);
    } finally {
      setDeleting(false);
    }
  };

  const handleEdit = (item: LeaveRequest) => {
    // Navigate to LeaveRequest screen with data for editing
    navigation.navigate('LeaveRequest', { editLeave: item });
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
      });
    } catch {
      return dateString;
    }
  };

  const getStatusColor = (status: string) => {
    const lowerStatus = status.toLowerCase();
    switch (lowerStatus) {
      case 'approved':
        return '#10B981';
      case 'rejected':
        return '#EF4444';
      case 'pending':
        return '#F59E0B';
      default:
        return '#64748B';
    }
  };

  const getStatusIcon = (status: string) => {
    const lowerStatus = status.toLowerCase();
    switch (lowerStatus) {
      case 'approved':
        return <CheckCircle size={16} color="#10B981" />;
      case 'rejected':
        return <XCircle size={16} color="#EF4444" />;
      case 'pending':
        return <AlertCircle size={16} color="#F59E0B" />;
      default:
        return <Clock size={16} color="#64748B" />;
    }
  };

  const capitalizeStatus = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
  };

  const renderLeaveItem = ({ item }: { item: LeaveRequest }) => (
    <View style={styles.leaveCard}>
      <View style={styles.leaveHeader}>
        <View style={styles.leaveTypeContainer}>
          <FileText size={18} color="#5B4BFF" />
          <Text style={styles.leaveType}>{item.leaveType}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: `${getStatusColor(item.status)}15` }]}>
          {getStatusIcon(item.status)}
          <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
            {capitalizeStatus(item.status)}
          </Text>
        </View>
      </View>

      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <View style={styles.leaveDetails}>
          <View style={styles.dateRow}>
            <Calendar size={14} color="#64748B" />
            <Text style={styles.dateText}>
              {formatDate(item.startDate)} - {formatDate(item.endDate)}
            </Text>
          </View>
          <View style={styles.daysRow}>
            <Clock size={14} color="#64748B" />
            <Text style={styles.daysText}>{item.totalDays || 0} day{(item.totalDays || 0) > 1 ? 's' : ''}</Text>
          </View>
        </View>
      </View>

      {item.status.toUpperCase() === 'PENDING' && (
        <View style={styles.actionButtons}>
          <TouchableOpacity 
            style={[styles.actionButton, styles.editButton]}
            onPress={() => handleEdit(item)}
          >
            <Edit2 size={16} color="#5B4BFF" />
            <Text style={styles.editText}>Edit</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionButton, styles.deleteButton]}
            onPress={() => handleDelete(item._id || '')}
          >
            <Trash2 size={16} color="#EF4444" />
            <Text style={styles.deleteText}>Delete</Text>
          </TouchableOpacity>
        </View>
      )}

      {item.reason && (
        <View style={styles.reasonContainer}>
          <Text style={styles.reasonLabel}>Reason:</Text>
          <Text style={styles.reasonText} numberOfLines={2}>
            {item.reason}
          </Text>
        </View>
      )}

      <Text style={styles.submittedDate}>
        Submitted on {formatDate(item.createdAt || '')}
      </Text>
    </View>
  );

  const renderEmptyState = () => {
    if (loading) return null;
    
    return (
      <EmptyState
        message="No Leave Requests"
        description={
          activeFilter === 'All'
            ? "You haven't submitted any leave requests yet"
            : `No ${activeFilter.toLowerCase()} leave requests found`
        }
        icon="file"
      />
    );
  };

  if (loading) {
    return (
      <LinearGradient colors={['#E8ECFF', '#F5F7FF', '#FFFFFF']} style={styles.safeArea}>
        <SafeAreaView style={{flex: 1}} edges={['top']}>
          {/* Decorative Blobs */}
          <View style={styles.blob1} />
          <View style={styles.blob2} />

          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <ArrowLeft size={24} color="#0B1226" strokeWidth={2.5} />
            </TouchableOpacity>
            <View style={styles.headerCenter}>
              <Text style={styles.headerTitle}>Leave Status</Text>
            </View>
            <View style={styles.placeholder} />
          </View>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#5B4BFF" />
            <Text style={styles.loadingText}>Loading leave requests...</Text>
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  // Error state
  if (error && !loading) {
    return (
      <LinearGradient colors={['#E8ECFF', '#F5F7FF', '#FFFFFF']} style={styles.safeArea}>
        <SafeAreaView style={{flex: 1}} edges={['top']}>
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <ArrowLeft size={24} color="#0B1226" strokeWidth={2.5} />
            </TouchableOpacity>
            <View style={styles.headerCenter}>
              <Text style={styles.headerTitle}>Leave Status</Text>
            </View>
            <View style={styles.placeholder} />
          </View>
          <ErrorState
            message={error}
            type={errorType}
            onRetry={() => loadLeaves(true)}
          />
        </SafeAreaView>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={['#E8ECFF', '#F5F7FF', '#FFFFFF']} style={styles.safeArea}>
      <SafeAreaView style={{flex: 1}} edges={['top']}>
        {/* Decorative Blobs */}
        <View style={styles.blob1} />
        <View style={styles.blob2} />

        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <ArrowLeft size={24} color="#0B1226" strokeWidth={2.5} />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>Leave Status</Text>
          </View>
          <View style={styles.placeholder} />
        </View>

        {/* Filter Pills */}
        <View style={styles.filterContainer}>
          {(['All', 'Pending', 'Approved', 'Rejected'] as FilterStatus[]).map((filter) => (
            <TouchableOpacity
              key={filter}
              style={[
                styles.filterPill,
                activeFilter === filter && styles.filterPillActive,
              ]}
              onPress={() => handleFilterChange(filter)}
            >
              <Text
                style={[
                  styles.filterText,
                  activeFilter === filter && styles.filterTextActive,
                ]}
              >
                {filter}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Leave List */}
        <FlashList
          data={filteredLeaves}
          renderItem={renderLeaveItem}
          keyExtractor={(item, index) => item._id || index.toString()}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={renderEmptyState}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#5B4BFF']}
              tintColor="#5B4BFF"
            />
          }
        />

        {/* Delete Confirmation Modal */}
        <Modal visible={showDeleteModal} transparent animationType="fade">
          <TouchableWithoutFeedback onPress={() => !deleting && setShowDeleteModal(false)}>
            <View style={styles.modalOverlay}>
              <TouchableWithoutFeedback>
                <View style={styles.modalContent}>
                  <View style={styles.modalHeader}>
                    <View style={[styles.modalIconContainer, { backgroundColor: '#FEF2F2' }]}>
                      <Trash2 size={24} color="#EF4444" />
                    </View>
                    <TouchableOpacity 
                      onPress={() => setShowDeleteModal(false)}
                      disabled={deleting}
                    >
                      <X size={24} color="#64748B" />
                    </TouchableOpacity>
                  </View>

                  <Text style={styles.modalTitle}>Delete Request?</Text>
                  <Text style={styles.modalSubtitle}>
                    Are you sure you want to delete this leave request? This action cannot be undone.
                  </Text>

                  <View style={styles.modalButtons}>
                    <TouchableOpacity
                      style={styles.cancelBtn}
                      onPress={() => setShowDeleteModal(false)}
                      disabled={deleting}
                    >
                      <Text style={styles.cancelText}>Keep it</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.confirmBtn, { backgroundColor: '#EF4444' }]}
                      onPress={confirmDelete}
                      disabled={deleting}
                    >
                      {deleting ? (
                        <ActivityIndicator size="small" color="#FFF" />
                      ) : (
                        <Text style={styles.confirmText}>Yes, Delete</Text>
                      )}
                    </TouchableOpacity>
                  </View>
                </View>
              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
        </Modal>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 20,
    marginBottom: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  headerCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
    justifyContent: 'center',
    marginLeft: -40,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#0B1226',
  },
  placeholder: {
    width: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#64748B',
    fontWeight: '600',
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    marginBottom: 16,
    gap: 10,
  },
  filterPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  filterPillActive: {
    backgroundColor: '#5B4BFF',
    borderColor: '#5B4BFF',
  },
  filterText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
  },
  filterTextActive: {
    color: '#FFFFFF',
  },
  listContent: {
    paddingHorizontal: 24,
    paddingBottom: 20,
  },
  leaveCard: {
    backgroundColor: 'rgba(255,255,255,0.96)',
    borderRadius: 20,
    padding: 18,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 12,
  },
  leaveHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  leaveTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  leaveType: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
  },
  leaveDetails: {
    gap: 8,
    marginBottom: 12,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dateText: {
    fontSize: 14,
    color: '#64748B',
  },
  daysRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  daysText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
  },
  reasonContainer: {
    backgroundColor: '#F8FAFC',
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
  },
  reasonLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
    marginBottom: 4,
  },
  reasonText: {
    fontSize: 14,
    color: '#1E293B',
    lineHeight: 20,
  },
  submittedDate: {
    fontSize: 12,
    color: '#94A3B8',
    fontStyle: 'italic',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0B1226',
    marginTop: 20,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 15,
    color: '#64748B',
    textAlign: 'center',
    paddingHorizontal: 40,
    lineHeight: 22,
  },
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
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 4,
    marginBottom: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
  },
  editButton: {
    borderColor: '#E8ECFF',
    backgroundColor: '#F5F7FF',
  },
  deleteButton: {
    borderColor: '#FEE2E2',
    backgroundColor: '#FEF2F2',
  },
  editText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#5B4BFF',
  },
  deleteText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#EF4444',
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    padding: 24,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0B1226',
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 15,
    color: '#64748B',
    lineHeight: 22,
    marginBottom: 24,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
  },
  confirmBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: '#5B4BFF',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  cancelText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#64748B',
  },
  confirmText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
