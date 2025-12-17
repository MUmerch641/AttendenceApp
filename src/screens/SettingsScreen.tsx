// src/screens/SettingsScreen.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  Alert,
  Modal,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import {
  Lock,
  FileText,
  Headphones,
  Shield,
  LogOut,
  ChevronRight,
  Eye,
  EyeOff,
  X,
} from 'lucide-react-native';
import { NavigationService } from '../services/NavigationService';
import { AuthAPI } from '../api/auth';
import { SnackbarService } from '../services/SnackbarService';
import { StorageService, UserData } from '../services/StorageService';
import ConfirmLogoutModal from '../components/ConfirmLogoutModal';

export default function SettingsScreen() {
  const [changePasswordModal, setChangePasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
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
  const handleLogout = async () => {
    // This function is now handled via the confirmation modal
    setShowLogoutModal(true);
  };

  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const performLogout = async () => {
    try {
      await StorageService.clearAllData();
      SnackbarService.showSuccess('Logged out successfully');
      NavigationService.navigate('Welcome');
    } catch (error) {
      console.error('Error during logout:', error);
      SnackbarService.showError('Error during logout');
    } finally {
      setShowLogoutModal(false);
    }
  };

  const handleChangePassword = async () => {
    // Validation
    if (!currentPassword || !newPassword || !confirmPassword) {
      SnackbarService.showError('Please fill in all fields');
      return;
    }

    if (newPassword !== confirmPassword) {
      SnackbarService.showError('New passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      SnackbarService.showError('New password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      const response = await AuthAPI.changePassword({ newPassword });

      if (response.isSuccess) {
        // Close modal first, then show success message
        setChangePasswordModal(false);
        setTimeout(() => {
          SnackbarService.showSuccess(response.message || 'Password changed successfully');
        }, 300); // Small delay to ensure modal is closed
        // Clear form
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        SnackbarService.showError(response.message || 'Failed to change password');
      }
    } catch (error: any) {
      console.error('Change password error:', error);
      SnackbarService.showError('Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#E8ECFF', '#F5F7FF', '#FFFFFF']}
        style={StyleSheet.absoluteFill}
      />

      {/* Floating Blobs */}
      <View style={styles.blobContainer}>
        <View style={styles.blob1} />
        <View style={styles.blob2} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            <Image
              source={{ uri: userData?.profilePhotoUrl || 'https://randomuser.me/api/portraits/men/86.jpg' }}
              style={styles.avatar}
            />
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.name}>{userData?.fullName || 'Staff Member'}</Text>
            <Text style={styles.email}>{userData?.officialEmail || 'staff@example.com'}</Text>
          </View>
        </View>

        {/* Settings List */}
        <View style={styles.settingsList}>
          {/* Password Change */}
          <TouchableOpacity style={styles.settingItem} onPress={() => setChangePasswordModal(true)}>
            <View style={styles.itemLeft}>
              <View style={styles.iconWrapper}>
                <Lock size={20} color="#5B4BFF" strokeWidth={2.2} />
              </View>
              <Text style={styles.itemText}>Password Change</Text>
            </View>
            <ChevronRight size={22} color="#94A3B8" />
          </TouchableOpacity>

          {/* Privacy Policy */}
          <TouchableOpacity style={styles.settingItem} onPress={() => NavigationService.navigate('PrivacyPolicy')}>
            <View style={styles.itemLeft}>
              <View style={styles.iconWrapper}>
                <Shield size={20} color="#5B4BFF" strokeWidth={2.2} />
              </View>
              <Text style={styles.itemText}>Privacy Policy</Text>
            </View>
            <ChevronRight size={22} color="#94A3B8" />
          </TouchableOpacity>

          {/* Support Policy */}
          <TouchableOpacity style={styles.settingItem} onPress={() => NavigationService.navigate('SupportPolicy')}>
            <View style={styles.itemLeft}>
              <View style={styles.iconWrapper}>
                <Headphones size={20} color="#5B4BFF" strokeWidth={2.2} />
              </View>
              <Text style={styles.itemText}>Support Policy</Text>
            </View>
            <ChevronRight size={22} color="#94A3B8" />
          </TouchableOpacity>

          {/* Terms & Conditions */}
          <TouchableOpacity style={styles.settingItem} onPress={() => NavigationService.navigate('TermsConditions')}>
            <View style={styles.itemLeft}>
              <View style={styles.iconWrapper}>
                <FileText size={20} color="#5B4BFF" strokeWidth={2.2} />
              </View>
              <Text style={styles.itemText}>Terms & Conditions</Text>
            </View>
            <ChevronRight size={22} color="#94A3B8" />
          </TouchableOpacity>
        </View>

          {/* Logout Button */}
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <LogOut size={20} color="#FFFFFF" strokeWidth={2.5} />
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>

        <ConfirmLogoutModal
          visible={showLogoutModal}
          onCancel={() => setShowLogoutModal(false)}
          onConfirm={performLogout}
        />

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Change Password Modal */}
      <Modal
        visible={changePasswordModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setChangePasswordModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Change Password</Text>
              <TouchableOpacity
                onPress={() => setChangePasswordModal(false)}
                style={styles.closeButton}
              >
                <X size={24} color="#64748B" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Current Password */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Current Password</Text>
                <View style={styles.inputContainer}>
                  <Lock size={20} color="#64748B" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Enter current password"
                    secureTextEntry={!showCurrentPassword}
                    value={currentPassword}
                    onChangeText={setCurrentPassword}
                    placeholderTextColor="#94A3B8"
                  />
                  <TouchableOpacity
                    onPress={() => setShowCurrentPassword(!showCurrentPassword)}
                    style={styles.eyeButton}
                  >
                    {showCurrentPassword ? (
                      <EyeOff size={20} color="#64748B" />
                    ) : (
                      <Eye size={20} color="#64748B" />
                    )}
                  </TouchableOpacity>
                </View>
              </View>

              {/* New Password */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>New Password</Text>
                <View style={styles.inputContainer}>
                  <Lock size={20} color="#64748B" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Enter new password"
                    secureTextEntry={!showNewPassword}
                    value={newPassword}
                    onChangeText={setNewPassword}
                    placeholderTextColor="#94A3B8"
                  />
                  <TouchableOpacity
                    onPress={() => setShowNewPassword(!showNewPassword)}
                    style={styles.eyeButton}
                  >
                    {showNewPassword ? (
                      <EyeOff size={20} color="#64748B" />
                    ) : (
                      <Eye size={20} color="#64748B" />
                    )}
                  </TouchableOpacity>
                </View>
              </View>

              {/* Confirm New Password */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Confirm New Password</Text>
                <View style={styles.inputContainer}>
                  <Lock size={20} color="#64748B" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Confirm new password"
                    secureTextEntry={!showConfirmPassword}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    placeholderTextColor="#94A3B8"
                  />
                  <TouchableOpacity
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                    style={styles.eyeButton}
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={20} color="#64748B" />
                    ) : (
                      <Eye size={20} color="#64748B" />
                    )}
                  </TouchableOpacity>
                </View>
              </View>

              {/* Action Buttons */}
              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={() => setChangePasswordModal(false)}
                  disabled={loading}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.modalButton, styles.confirmButton]}
                  onPress={handleChangePassword}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Text style={styles.confirmButtonText}>Change Password</Text>
                  )}
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

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

  profileHeader: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 24,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 4,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 15,
  },

  profileInfo: {
    alignItems: 'center',
  },
  name: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0B1226',
    marginBottom: 4,
  },
  email: {
    fontSize: 15,
    color: '#64748B',
    fontWeight: '500',
  },

  settingsList: {
    marginHorizontal: 24,
    backgroundColor: 'rgba(255,255,255,0.96)',
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 15,
  },

  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  iconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#5B4BFF12',
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0B1226',
  },

  logoutButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#5B4BFF',
    marginHorizontal: 24,
    marginTop: 32,
    paddingVertical: 18,
    borderRadius: 30,
    shadowColor: '#5B4BFF',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 18,
  },
  logoutText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingTop: 20,
    paddingHorizontal: 24,
    paddingBottom: 40,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0B1226',
  },
  closeButton: {
    padding: 8,
  },

  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0B1226',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 56,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#0B1226',
  },
  eyeButton: {
    padding: 4,
  },

  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 32,
  },
  modalButton: {
    flex: 1,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#F1F5F9',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#64748B',
  },
  confirmButton: {
    backgroundColor: '#5B4BFF',
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});