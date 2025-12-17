// src/screens/LeaveRequestScreen.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  Alert,
  Modal,
  TouchableWithoutFeedback,
  ActivityIndicator,
} from 'react-native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';

// Format a Date object to YYYY-MM-DD (API-friendly)
function formatDate(d: Date) {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import {
  Calendar,
  User,
  ChevronDown,
  Check,
  AlertCircle,
  X,
} from 'lucide-react-native';
import { NavigationService } from '../services/NavigationService';
import { AttendanceAPI } from '../api/attendance';
import { StorageService } from '../services/StorageService';
import { SnackbarService } from '../services/SnackbarService';

export default function LeaveRequestScreen() {
  const [reason, setReason] = useState('');
  const [selectedLeaveType, setSelectedLeaveType] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [startDateObj, setStartDateObj] = useState<Date | undefined>(undefined);
  const [endDateObj, setEndDateObj] = useState<Date | undefined>(undefined);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showLeaveTypeModal, setShowLeaveTypeModal] = useState(false);
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [loading, setLoading] = useState(false);

  // Leave types
  const leaveTypes = [
    'annual leave',
    'sick leave',
    'casual leave',
    'maternity leave',
    'paternity leave',
    'emergency leave',
  ];

  const calculateLeaveDays = () => {
    // prefer Date objects if available
    if ((!startDate && !startDateObj) || (!endDate && !endDateObj)) return 0;
    const start = startDateObj ? startDateObj : new Date(startDate);
    const end = endDateObj ? endDateObj : new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  };

  const handleSubmit = () => {
    if (!selectedLeaveType) {
      SnackbarService.showError('Please select a leave type');
      return;
    }
    if (!startDate || !endDate) {
      SnackbarService.showError('Please select start and end dates');
      return;
    }
    if (!reason.trim()) {
      SnackbarService.showError('Reason is required');
      return;
    }
    setShowConfirmModal(true);
  };

  const confirmSubmit = async () => {
    setLoading(true);
    try {
      const userData = await StorageService.getUserData();
      if (!userData) {
        SnackbarService.showError('User data not found. Please login again.');
        return;
      }

      const leaveRequest = {
        empDocId: userData._id,
        leaveType: selectedLeaveType,
        leaves: calculateLeaveDays(),
        startDate: startDate,
        endDate: endDate,
        reason: reason.trim(),
        status: 'pending',
      };

      const response = await AttendanceAPI.createLeave(leaveRequest);

      if (response.isSuccess) {
        SnackbarService.showSuccess('Leave request submitted successfully!');
        NavigationService.goBack();
      } else {
        SnackbarService.showError(response.message || 'Failed to submit leave request');
      }
    } catch (error) {
      console.error('Leave submission error:', error);
      SnackbarService.showError('Failed to submit leave request');
    } finally {
      setLoading(false);
      setShowConfirmModal(false);
    }
  };

  const LeaveTypeModal = () => (
    <Modal visible={showLeaveTypeModal} transparent animationType="fade">
      <TouchableWithoutFeedback onPress={() => setShowLeaveTypeModal(false)}>
        <View style={styles.modalOverlay}>
          <TouchableWithoutFeedback>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Select Leave Type</Text>
                <TouchableOpacity onPress={() => setShowLeaveTypeModal(false)}>
                  <X size={24} color="#64748B" />
                </TouchableOpacity>
              </View>

              {leaveTypes.map((type) => (
                <TouchableOpacity
                  key={type}
                  style={styles.leaveTypeOption}
                  onPress={() => {
                    setSelectedLeaveType(type);
                    setShowLeaveTypeModal(false);
                  }}
                >
                  <Text style={styles.leaveTypeText}>{type.charAt(0).toUpperCase() + type.slice(1)}</Text>
                  {selectedLeaveType === type && <Check size={20} color="#5B4BFF" />}
                </TouchableOpacity>
              ))}
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={['#E8ECFF', '#F5F7FF', '#FFFFFF']} style={StyleSheet.absoluteFill} />

      {/* Blobs */}
      <View style={styles.blobContainer}>
        <View style={styles.blob1} />
        <View style={styles.blob2} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => NavigationService.goBack()}>
            <X size={24} color="#1E293B" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Apply for Leave</Text>
        </View>

        {/* Leave Type Section */}
        <View style={styles.section}>
          <View style={styles.labelRow}>
            <Text style={styles.label}>Leave Type</Text>
            <Text style={styles.required}>*</Text>
          </View>

          <TouchableOpacity style={styles.picker} onPress={() => setShowLeaveTypeModal(true)}>
            <Text style={selectedLeaveType ? styles.selectedText : styles.placeholderText}>
              {selectedLeaveType ? selectedLeaveType.charAt(0).toUpperCase() + selectedLeaveType.slice(1) : 'Select leave type'}
            </Text>
            <ChevronDown size={22} color="#64748B" />
          </TouchableOpacity>
        </View>

        {/* Date Selection */}
        <View style={styles.section}>
          <View style={styles.labelRow}>
            <Text style={styles.label}>Duration</Text>
            <Text style={styles.required}>*</Text>
          </View>

          <View style={styles.dateContainer}>
            <TouchableOpacity
              style={styles.dateField}
              onPress={() => setShowStartPicker(true)}
            >
              <Calendar size={20} color="#64748B" />
              <Text style={styles.dateInput}>
                {startDateObj ? formatDate(startDateObj) : 'Start Date'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.dateField}
              onPress={() => setShowEndPicker(true)}
            >
              <Calendar size={20} color="#64748B" />
              <Text style={styles.dateInput}>
                {endDateObj ? formatDate(endDateObj) : 'End Date'}
              </Text>
            </TouchableOpacity>

            {/* Native DateTimePickers (rendered when requested) */}
            {showStartPicker && (
              <DateTimePicker
                value={startDateObj ?? new Date()}
                mode="date"
                display="default"
                maximumDate={endDateObj ?? undefined}
                onChange={(event: DateTimePickerEvent, selectedDate?: Date | undefined) => {
                  setShowStartPicker(false);
                  // event.type can be 'set' or 'dismissed'
                  if (event.type === 'dismissed') return;
                  if (selectedDate) {
                    setStartDateObj(selectedDate);
                    setStartDate(formatDate(selectedDate));
                    // if end is before start, reset end
                    if (endDateObj && selectedDate > endDateObj) {
                      setEndDate('');
                      setEndDateObj(undefined);
                    }
                  }
                }}
              />
            )}

            {showEndPicker && (
              <DateTimePicker
                value={endDateObj ?? (startDateObj ?? new Date())}
                mode="date"
                display="default"
                minimumDate={startDateObj ?? undefined}
                onChange={(event: DateTimePickerEvent, selectedDate?: Date | undefined) => {
                  setShowEndPicker(false);
                  if (event.type === 'dismissed') return;
                  if (selectedDate) {
                    setEndDateObj(selectedDate);
                    setEndDate(formatDate(selectedDate));
                    // if start is after end, reset start
                    if (startDateObj && selectedDate < startDateObj) {
                      setStartDate('');
                      setStartDateObj(undefined);
                    }
                  }
                }}
              />
            )}
          </View>

          {startDate && endDate && (
            <View style={styles.daysInfo}>
              <Text style={styles.daysText}>Total Days: {calculateLeaveDays()}</Text>
            </View>
          )}
        </View>

        {/* Reason Section */}
        <View style={styles.section}>
          <View style={styles.labelRow}>
            <Text style={styles.label}>Reason</Text>
            <Text style={styles.required}>*</Text>
          </View>

          <View style={styles.textInputContainer}>
            <TextInput
              style={styles.textInput}
              placeholder="Describe your reason for leave..."
              placeholderTextColor="#94A3B8"
              multiline
              numberOfLines={4}
              maxLength={500}
              value={reason}
              onChangeText={setReason}
              textAlignVertical="top"
            />
            
          </View>
            <Text style={styles.charCount}>{reason.length}/500</Text>

          {reason.length > 10 && (
            <View style={styles.successBadge}>
              <Check size={18} color="#10B981" />
              <Text style={styles.successText}>Reason added</Text>
            </View>
          )}
        </View>

        {/* Submit Button */}
        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.submitText}>Submit Now</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Leave Type Modal */}
      <LeaveTypeModal />

      {/* Confirmation Modal */}
      <Modal visible={showConfirmModal} transparent animationType="fade">
        <TouchableWithoutFeedback onPress={() => setShowConfirmModal(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Confirm Leave Request</Text>
                <Text style={styles.modalSubtitle}>Please review your leave request details:</Text>

                <View style={styles.summary}>
                  <Text style={styles.summaryLabel}>Leave Type:</Text>
                  <Text style={styles.summaryValue}>{selectedLeaveType.charAt(0).toUpperCase() + selectedLeaveType.slice(1)}</Text>

                  <Text style={styles.summaryLabel}>From:</Text>
                  <Text style={styles.summaryValue}>{startDate}</Text>

                  <Text style={styles.summaryLabel}>To:</Text>
                  <Text style={styles.summaryValue}>{endDate}</Text>

                  <Text style={styles.summaryLabel}>Total Days:</Text>
                  <Text style={styles.summaryValue}>{calculateLeaveDays()}</Text>

                  <Text style={styles.summaryLabel}>Reason:</Text>
                  <Text style={styles.summaryValue}>{reason || 'Not provided'}</Text>
                </View>

                <View style={styles.managerNote}>
                  <AlertCircle size={18} color="#5B4BFF" />
                  <Text style={styles.managerText}>
                    This request will be sent to your manager for approval.
                  </Text>
                </View>

                <View style={styles.modalButtons}>
                  <TouchableOpacity
                    style={styles.cancelBtn}
                    onPress={() => setShowConfirmModal(false)}
                    disabled={loading}
                  >
                    <Text style={styles.cancelText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.confirmBtn, loading && styles.confirmBtnDisabled]}
                    onPress={confirmSubmit}
                    disabled={loading}
                  >
                    {loading ? (
                      <ActivityIndicator size="small" color="#FFF" />
                    ) : (
                      <Text style={styles.confirmText}>Confirm</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  blobContainer: { ...StyleSheet.absoluteFillObject, top: -120 },
  blob1: { position: 'absolute', top: 60, left: -100, width: 340, height: 340, borderRadius: 170, backgroundColor: '#5B4BFF18' },
  blob2: { position: 'absolute', top: 200, right: -120, width: 380, height: 380, borderRadius: 190, backgroundColor: '#FF7A0018' },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 24,
    marginTop: 20,
    marginBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  headerTitle: { fontSize: 28, fontWeight: '800', color: '#0B1226' },

  section: { marginHorizontal: 24, marginBottom: 28 },

  labelRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, gap: 4 },
  label: { fontSize: 18, fontWeight: '700', color: '#0B1226' },
  required: { fontSize: 20, color: '#EF4444', fontWeight: '700' },
  charCount: { fontSize: 14, color: '#64748B' },
  availableCount: { fontSize: 14, color: '#5B4BFF', fontWeight: '600', marginTop: 10 },

  picker: {
    backgroundColor: 'rgba(255,255,255,0.96)',
    borderRadius: 20,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 12,
  },
  selectedText: { fontSize: 16, color: '#0B1226', fontWeight: '600' },
  placeholderText: { color: '#94A3B8', fontSize: 16 },

  dateContainer: { gap: 12 },
  dateField: {
    backgroundColor: 'rgba(255,255,255,0.96)',
    borderRadius: 20,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 12,
  },
  dateInput: { flex: 1, fontSize: 16, color: '#0B1226' },

  daysInfo: {
    alignSelf: 'flex-start',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginTop: 12,
  },
  daysText: { color: '#5B4BFF', fontWeight: '600', fontSize: 14 },

  textInputContainer: {
    backgroundColor: 'rgba(255,255,255,0.96)',
    borderRadius: 20,
    padding: 16,
    minHeight: 120,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 12,
  },
  textInput: { fontSize: 16, color: '#0B1226', lineHeight: 24 },

  successBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
    alignSelf: 'flex-start',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#10B98130',
  },
  successText: { color: '#10B981', fontWeight: '600', fontSize: 14 },

  submitButton: {
    backgroundColor: '#5B4BFF',
    marginHorizontal: 24,
    paddingVertical: 20,
    borderRadius: 30,
    alignItems: 'center',
    marginTop: 20,
    shadowColor: '#5B4BFF',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 18,
  },
  submitText: { color: '#FFF', fontSize: 18, fontWeight: '700' },

  // Modal Styles
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContent: {
    backgroundColor: '#FFF',
    marginHorizontal: 32,
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 30,
    elevation: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: { fontSize: 22, fontWeight: '800', color: '#0B1226' },
  modalSubtitle: { fontSize: 15, color: '#64748B', marginBottom: 20 },
  summary: { width: '100%', gap: 10, marginBottom: 20 },
  summaryLabel: { fontSize: 15, color: '#64748B', fontWeight: '600' },
  summaryValue: { fontSize: 16, color: '#0B1226', fontWeight: '600', marginBottom: 6 },
  managerNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#EFF6FF',
    padding: 14,
    borderRadius: 16,
    marginBottom: 24,
  },
  managerText: { color: '#5B4BFF', fontSize: 14, fontWeight: '600' },
  modalButtons: { flexDirection: 'row', justifyContent: 'space-between', gap: 16 },
  cancelBtn: { flex: 1, paddingVertical: 16, borderRadius: 30, backgroundColor: '#F1F5F9', alignItems: 'center' },
  cancelText: { color: '#64748B', fontWeight: '700', fontSize: 16 },
  confirmBtn: { flex: 1, paddingVertical: 16, borderRadius: 30, backgroundColor: '#5B4BFF', alignItems: 'center' },
  confirmBtnDisabled: { opacity: 0.6 },
  confirmText: { color: '#FFF', fontWeight: '700', fontSize: 16 },

  // Leave Type Modal Styles
  leaveTypeOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  leaveTypeText: { fontSize: 16, color: '#0B1226', fontWeight: '600' },
});