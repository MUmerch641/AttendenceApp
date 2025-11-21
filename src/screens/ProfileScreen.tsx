// src/screens/ProfileScreen.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import {
  Mail,
  Phone,
  DollarSign,
  Calendar,
  UserCheck,
  Briefcase,
  Users,
  Clock,
  CreditCard,
  Heart,
  Droplet,
  Camera,
  Star,
  LogOut,
} from 'lucide-react-native';
import { StorageService, UserData } from '../services/StorageService';
import { NavigationService } from '../services/NavigationService';
import { SnackbarService } from '../services/SnackbarService';
import { AttendanceAPI } from '../api/attendance';
import { launchImageLibrary } from 'react-native-image-picker';

export default function ProfileScreen() {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const data = await StorageService.getUserData();
      setUserData(data);
    } catch (error) {
      console.error('Error loading user data:', error);
      SnackbarService.showError('Failed to load user data');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await StorageService.clearAllData();
      SnackbarService.showSuccess('Logged out successfully');
      NavigationService.navigate('Welcome');
    } catch (error) {
      console.error('Error during logout:', error);
      SnackbarService.showError('Error during logout');
    }
  };

  const handleImageChange = async () => {
    const options = {
      mediaType: 'photo' as const,
      includeBase64: false,
      maxHeight: 1024,
      maxWidth: 1024,
      quality: 0.8 as const,
    };

    launchImageLibrary(options, async (response) => {
      if (response.didCancel) {
        return;
      }

      if (response.errorMessage) {
        console.error('ImagePicker Error: ', response.errorMessage);
        SnackbarService.showError('Failed to select image');
        return;
      }

      if (response.assets && response.assets[0]) {
        const asset = response.assets[0];
        console.log('Selected image:', asset);

        try {
          setUploading(true);

          // Create form data for upload
          const formData = new FormData();
          formData.append('file', {
            uri: asset.uri,
            type: asset.type || 'image/jpeg',
            name: asset.fileName || `profile_${Date.now()}.jpg`,
          });

          // Upload the image
          const result = await AttendanceAPI.uploadProfilePic(formData);

          if (result.isSuccess) {
            SnackbarService.showSuccess('Profile picture updated successfully!');

            // Update local user data with new profile photo URL if returned
            if (result.data?.profilePhotoUrl) {
              const updatedUserData = { ...userData!, profilePhotoUrl: result.data.profilePhotoUrl };
              setUserData(updatedUserData);
              await StorageService.saveUserData(updatedUserData);
            }
          } else {
            SnackbarService.showError(result.message || 'Failed to upload profile picture');
          }
        } catch (error: any) {
          console.error('Upload error:', error);
          SnackbarService.showError('Failed to upload profile picture');
        } finally {
          setUploading(false);
        }
      }
    });
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#5B4BFF" />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </SafeAreaView>
    );
  }

  if (!userData) {
    return (
      <SafeAreaView style={[styles.container, styles.centerContent]}>
        <Text style={styles.errorText}>No user data found</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadUserData}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

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
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>My Profile</Text>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <LogOut size={24} color="#1E293B" />
          </TouchableOpacity>
        </View>

        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatarContainer}>
            <Image
              source={{ uri: userData.profilePhotoUrl || 'https://randomuser.me/api/portraits/men/32.jpg' }}
              style={styles.avatar}
            />
            <View style={styles.ratingBadge}>
              <Star size={14} color="#FFD700" fill="#FFD700" />
              <Text style={styles.ratingText}>75%</Text>
            </View>
          </View>

          <View style={styles.infoContainer}>
            <Text style={styles.name}>{userData.fullName}</Text>
            <Text style={styles.employeeId}>Employee ID : {userData.employeeId}</Text>

            <TouchableOpacity
              style={[styles.changeImageBtn, uploading && styles.changeImageBtnDisabled]}
              onPress={handleImageChange}
              disabled={uploading}
            >
              {uploading ? (
                <ActivityIndicator size="small" color="#FFF" />
              ) : (
                <Camera size={18} color="#FFF" />
              )}
              <Text style={styles.changeImageText}>
                {uploading ? 'Uploading...' : 'Image Change'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Professional Info */}
        <Text style={styles.sectionTitle}>Professional Info</Text>
        <View style={styles.infoCard}>
          <InfoRow icon={Mail} label="Official Email" value={userData.officialEmail} />
          <InfoRow icon={Mail} label="Personal Email" value={userData.personalEmail} />
          <InfoRow icon={Phone} label="Contact Number" value={userData.contactNumber} />
          <InfoRow icon={Phone} label="Emergency Contact" value={userData.emergencyContactNumber} />
          <InfoRow icon={Briefcase} label="Position" value={userData.position} />
          <InfoRow icon={UserCheck} label="Role" value={userData.role} />
          <InfoRow icon={Calendar} label="Joined Date" value={new Date(userData.createdAt).toLocaleDateString()} />
          <InfoRow icon={CreditCard} label="Bank Account" value={userData.bankAccount} />
          <InfoRow icon={Users} label="Guardian Name" value={userData.guardianName} />
          <InfoRow icon={UserCheck} label="Status" value={userData.isActive ? 'Active' : 'Inactive'} />
        </View>

        {/* Address Info */}
        <Text style={styles.sectionTitle}>Address</Text>
        <View style={styles.infoCard}>
          <InfoRow icon={Users} label="Address" value={userData.address} />
        </View>

        {/* Other Info */}
        <Text style={styles.sectionTitle}>Other Info</Text>
        <View style={styles.infoCard}>
          <InfoRow icon={Users} label="Schedule ID" value={userData.scheduleId} />
          <InfoRow icon={Calendar} label="Last Updated" value={new Date(userData.updatedAt).toLocaleDateString()} />
          <InfoRow icon={Clock} label="Custom Schedules" value={userData.customSchedule?.length > 0 ? `${userData.customSchedule.length} schedules` : 'No custom schedules'} />
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// Reusable Row Component
const InfoRow = ({ icon: Icon, label, value }: { icon: any; label: string; value: string }) => (
  <View style={styles.infoRow}>
    <View style={styles.iconLabel}>
      <Icon size={20} color="#64748B" />
      <Text style={styles.infoLabel}>{label} :</Text>
    </View>
    <Text style={styles.infoValue}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1 },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#64748B',
    fontWeight: '600',
  },
  errorText: {
    fontSize: 18,
    color: '#EF4444',
    fontWeight: '600',
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 16,
    backgroundColor: '#5B4BFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
  },
  retryText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },

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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 10,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#0B1226',
  },
  notificationBadge: {
    backgroundColor: '#FF7A00',
    width: 50,
    height: 36,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  badgeText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 15,
  },
  logoutButton: {
    width: 50,
    height: 36,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },

  profileCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.96)',
    marginHorizontal: 24,
    marginTop: 20,
    borderRadius: 24,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 18,
  },
  avatarContainer: { position: 'relative' },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
    borderColor: '#FFF',
  },
  ratingBadge: {
    position: 'absolute',
    bottom: 8,
    right: -8,
    backgroundColor: '#000',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
    gap: 4,
  },
  ratingText: { color: '#FFF', fontWeight: '700', fontSize: 12 },

  infoContainer: { marginLeft: 20, flex: 1 },
  name: { fontSize: 24, fontWeight: '800', color: '#0B1226' },
  employeeId: { fontSize: 14, color: '#64748B', marginTop: 4 },

  changeImageBtn: {
    flexDirection: 'row',
    backgroundColor: '#5B4BFF',
    alignSelf: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 30,
    marginTop: 12,
    gap: 8,
    alignItems: 'center',
  },
  changeImageBtnDisabled: {
    opacity: 0.6,
  },
  changeImageText: { color: '#FFF', fontWeight: '700', fontSize: 14 },

  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0B1226',
    marginLeft: 24,
    marginTop: 32,
    marginBottom: 12,
  },

  infoCard: {
    backgroundColor: 'rgba(255,255,255,0.96)',
    marginHorizontal: 24,
    borderRadius: 20,
    paddingVertical: 16,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 12,
  },

  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  iconLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  infoLabel: {
    fontSize: 15,
    color: '#334155',
    fontWeight: '600',
  },
  infoValue: {
    fontSize: 15,
    color: '#0B1226',
    fontWeight: '600',
    textAlign: 'right',
    flex: 1,
  },
});