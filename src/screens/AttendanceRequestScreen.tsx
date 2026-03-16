import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Animated,
  Modal,
  TouchableWithoutFeedback,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../App';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import {
  ArrowLeft,
  Check,
  AlertCircle,
  History,
  Send,
  FileText,
  ChevronDown,
} from 'lucide-react-native';
import { StorageService } from '../services/StorageService';
import { SnackbarService } from '../services/SnackbarService';
import { AttendanceRequestsAPI } from '../api/attendanceRequests';
import { useSmoothBackHandler } from '../hooks/useSmoothBackHandler';

type AttendanceRequestNavigationProp = StackNavigationProp<RootStackParamList, 'AttendanceRequest'>;

export default function AttendanceRequestScreen() {
  const navigation = useNavigation<AttendanceRequestNavigationProp>();
  const [title, setTitle] = useState('attendance');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showTitleModal, setShowTitleModal] = useState(false);

  // Handle Android back button smoothly
  useSmoothBackHandler();

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const headerSlide = useRef(new Animated.Value(-30)).current;
  const formSlide1 = useRef(new Animated.Value(50)).current;
  const formSlide2 = useRef(new Animated.Value(50)).current;
  const buttonScale = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(headerSlide, {
        toValue: 0,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.timing(formSlide1, {
        toValue: 0,
        duration: 600,
        delay: 100,
        useNativeDriver: true,
      }),
      Animated.timing(formSlide2, {
        toValue: 0,
        duration: 600,
        delay: 200,
        useNativeDriver: true,
      }),
      Animated.spring(buttonScale, {
        toValue: 1,
        tension: 50,
        friction: 7,
        delay: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const titles = ['attendance', 'manual check-in', 'forgot to check-out', 'other'];

  const handleSubmit = () => {
    if (!title.trim()) {
      SnackbarService.showError('Title is required');
      return;
    }
    if (!message.trim()) {
      SnackbarService.showError('Message is required');
      return;
    }
    setShowConfirmModal(true);
  };

  const confirmSubmit = async () => {
    try {
      setLoading(true);
      const userData = await StorageService.getUserData();
      if (!userData) {
        SnackbarService.showError('User data not found. Please login again.');
        setLoading(false);
        setShowConfirmModal(false);
        return;
      }

      const payload = {
        employeeId: userData._id,
        title: title.trim(),
        message: message.trim(),
      };

      const response = await AttendanceRequestsAPI.createRequest(payload);

      if (response.isSuccess) {
        SnackbarService.showSuccess('Attendance request submitted successfully!');
        setLoading(false);
        setShowConfirmModal(false);
        
        // Navigate to status screen
        navigation.replace('AttendanceRequestStatus');
      } else {
        SnackbarService.showError(response.message || 'Failed to submit request');
        setLoading(false);
        setShowConfirmModal(false);
      }
    } catch (error) {
      console.error('Request submission error:', error);
      SnackbarService.showError('Failed to submit request');
      setLoading(false);
      setShowConfirmModal(false);
    }
  };

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
        <Animated.View style={[
          styles.header,
          {
            opacity: fadeAnim,
            transform: [{ translateY: headerSlide }],
          }
        ]}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <ArrowLeft size={24} color="#0B1226" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Attendance Request</Text>
          <TouchableOpacity 
            style={styles.statusButton} 
            onPress={() => navigation.navigate('AttendanceRequestStatus')}
            activeOpacity={0.7}
          >
            <History size={20} color="#5B4BFF" />
          </TouchableOpacity>
        </Animated.View>

        {/* Title Selection */}
        <Animated.View style={[
          styles.section,
          {
            opacity: fadeAnim,
            transform: [{ translateY: formSlide1 }],
          }
        ]}>
          <View style={styles.labelRow}>
            <Text style={styles.label}>Request Title</Text>
            <Text style={styles.required}>*</Text>
          </View>

          <TouchableOpacity style={styles.picker} onPress={() => setShowTitleModal(true)}>
            <Text style={styles.selectedText}>
              {title.charAt(0).toUpperCase() + title.slice(1)}
            </Text>
            <ChevronDown size={22} color="#64748B" />
          </TouchableOpacity>
        </Animated.View>

        {/* Message Section */}
        <Animated.View style={[
          styles.section,
          {
            opacity: fadeAnim,
            transform: [{ translateY: formSlide2 }],
          }
        ]}>
          <View style={styles.labelRow}>
            <Text style={styles.label}>Request Message</Text>
            <Text style={styles.required}>*</Text>
          </View>

          <View style={styles.textInputContainer}>
            <TextInput
              style={styles.textInput}
              placeholder="e.g., allowed to mark attendance for today"
              placeholderTextColor="#94A3B8"
              multiline
              numberOfLines={4}
              maxLength={500}
              value={message}
              onChangeText={setMessage}
              textAlignVertical="top"
            />
          </View>
          <Text style={styles.charCount}>{message.length}/500</Text>
        </Animated.View>

        {/* Submit Button */}
        <Animated.View style={{
          opacity: fadeAnim,
          transform: [{ scale: buttonScale }],
          marginTop: 20,
        }}>
          <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
            <Send size={20} color="#FFF" style={{ marginRight: 8 }} />
            <Text style={styles.submitText}>Submit Request</Text>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>

      {/* Title Modal */}
      <Modal visible={showTitleModal} transparent animationType="fade">
        <TouchableWithoutFeedback onPress={() => setShowTitleModal(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Select Title</Text>
                </View>
                {titles.map((t) => (
                  <TouchableOpacity
                    key={t}
                    style={styles.optionItem}
                    onPress={() => {
                      setTitle(t);
                      setShowTitleModal(false);
                    }}
                  >
                    <Text style={styles.optionText}>{t.charAt(0).toUpperCase() + t.slice(1)}</Text>
                    {title === t && <Check size={20} color="#5B4BFF" />}
                  </TouchableOpacity>
                ))}
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* Confirmation Modal */}
      <Modal visible={showConfirmModal} transparent animationType="fade">
        <TouchableWithoutFeedback onPress={() => setShowConfirmModal(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Confirm Submission</Text>
                <Text style={styles.modalSubtitle}>Are you sure you want to submit this attendance request?</Text>

                <View style={styles.summaryBox}>
                  <Text style={styles.summaryLabel}>Title</Text>
                  <Text style={styles.summaryValue}>{title}</Text>
                  
                  <Text style={styles.summaryLabel}>Message</Text>
                  <Text style={styles.summaryValue}>{message}</Text>
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
    justifyContent: 'space-between',
    marginHorizontal: 24,
    marginTop: 20,
    marginBottom: 30,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  headerTitle: { 
    fontSize: 22, 
    fontWeight: '800', 
    color: '#0B1226',
  },
  statusButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },

  section: { marginHorizontal: 24, marginBottom: 24 },
  labelRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, gap: 4 },
  label: { fontSize: 16, fontWeight: '700', color: '#0B1226' },
  required: { fontSize: 18, color: '#EF4444', fontWeight: '700' },

  picker: {
    backgroundColor: 'rgba(255,255,255,0.96)',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 8,
  },
  selectedText: { fontSize: 16, color: '#0B1226', fontWeight: '600' },

  textInputContainer: {
    backgroundColor: 'rgba(255,255,255,0.96)',
    borderRadius: 16,
    padding: 16,
    minHeight: 120,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 8,
  },
  textInput: { fontSize: 16, color: '#0B1226', lineHeight: 22 },
  charCount: { fontSize: 12, color: '#94A3B8', alignSelf: 'flex-end', marginTop: 8 },

  submitButton: {
    backgroundColor: '#5B4BFF',
    marginHorizontal: 24,
    paddingVertical: 18,
    borderRadius: 20,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#5B4BFF',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 15,
    elevation: 12,
  },
  submitText: { color: '#FFF', fontSize: 18, fontWeight: '700' },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContent: {
    backgroundColor: '#FFF',
    width: '85%',
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 15,
  },
  modalHeader: { marginBottom: 20 },
  modalTitle: { fontSize: 20, fontWeight: '800', color: '#0B1226' },
  modalSubtitle: { fontSize: 14, color: '#64748B', marginBottom: 20 },
  optionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  optionText: { fontSize: 16, color: '#0B1226', fontWeight: '600' },

  summaryBox: { backgroundColor: '#F8FAFC', padding: 16, borderRadius: 16, gap: 8, marginBottom: 24 },
  summaryLabel: { fontSize: 12, color: '#64748B', fontWeight: '700', textTransform: 'uppercase' },
  summaryValue: { fontSize: 15, color: '#0B1226', fontWeight: '600', marginBottom: 8 },

  modalButtons: { flexDirection: 'row', gap: 12 },
  cancelBtn: { flex: 1, paddingVertical: 14, borderRadius: 16, backgroundColor: '#F1F5F9', alignItems: 'center' },
  cancelText: { color: '#64748B', fontWeight: '700' },
  confirmBtn: { flex: 1, paddingVertical: 14, borderRadius: 16, backgroundColor: '#5B4BFF', alignItems: 'center' },
  confirmBtnDisabled: { opacity: 0.6 },
  confirmText: { color: '#FFF', fontWeight: '700' },
});
