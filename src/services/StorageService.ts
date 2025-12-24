import AsyncStorage from '@react-native-async-storage/async-storage';
import config from '../config/app.config';

export interface UserData {
  _id: string;
  employeeId: string;
  fullName: string;
  officialEmail: string;
  personalEmail: string;
  contactNumber: string;
  emergencyContactNumber: string;
  address: string;
  position: string;
  role: string;
  bankAccount: string;
  guardianName: string;
  profilePhotoUrl: string;
  isActive: boolean;
  scheduleId: string;
  customSchedule: any[];
  createdAt: string;
  updatedAt: string;
}

export interface TokenData {
  accessToken: string;
  refreshToken: string;
}

export const StorageService = {
  // Save authentication tokens
  saveTokens: async (tokens: TokenData): Promise<void> => {
    try {
      await AsyncStorage.setItem(config.AUTH.TOKEN_KEY, tokens.accessToken);
      await AsyncStorage.setItem(config.AUTH.REFRESH_TOKEN_KEY, tokens.refreshToken);
    } catch (error) {
      throw error;
    }
  },

  // Get access token
  getAccessToken: async (): Promise<string | null> => {
    try {
      return await AsyncStorage.getItem(config.AUTH.TOKEN_KEY);
    } catch (error) {
      return null;
    }
  },

  // Get refresh token
  getRefreshToken: async (): Promise<string | null> => {
    try {
      return await AsyncStorage.getItem(config.AUTH.REFRESH_TOKEN_KEY);
    } catch (error) {
      return null;
    }
  },

  // Save user data
  saveUserData: async (userData: UserData): Promise<void> => {
    try {
      await AsyncStorage.setItem('user_data', JSON.stringify(userData));
    } catch (error) {
      throw error;
    }
  },

  // Get user data
  getUserData: async (): Promise<UserData | null> => {
    try {
      const userData = await AsyncStorage.getItem('user_data');
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      return null;
    }
  },

  // Check if user is logged in
  isLoggedIn: async (): Promise<boolean> => {
    try {
      const token = await StorageService.getAccessToken();
      return token !== null;
    } catch (error) {
      return false;
    }
  },

  // Clear all stored data (logout)
  // NOTE: Does NOT clear 'has_seen_welcome' flag so welcome screen only shows on first install
  clearAllData: async (): Promise<void> => {
    try {
      await AsyncStorage.multiRemove([
        config.AUTH.TOKEN_KEY,
        config.AUTH.REFRESH_TOKEN_KEY,
        'user_data',
        'attendance_session',
        'fcm_token'
      ]);
    } catch (error) {
      throw error;
    }
  },

  // Get user ID
  getUserId: async (): Promise<string | null> => {
    try {
      const userData = await StorageService.getUserData();
      return userData?._id || null;
    } catch (error) {
      return null;
    }
  },

  // Save attendance session data
  saveAttendanceSession: async (data: {
    isCheckedIn: boolean;
    checkInTime: string;
    checkInTimestamp: string | null;
    workedTime: string;
  }): Promise<void> => {
    try {
      await AsyncStorage.setItem('attendance_session', JSON.stringify(data));
    } catch (error) {
      throw error;
    }
  },

  // Get attendance session data
  getAttendanceSession: async (): Promise<{
    isCheckedIn: boolean;
    checkInTime: string;
    checkInTimestamp: string | null;
    workedTime: string;
  } | null> => {
    try {
      const data = await AsyncStorage.getItem('attendance_session');
      return data ? JSON.parse(data) : null;
    } catch (error) {
      return null;
    }
  },

  // Clear attendance session data
  clearAttendanceSession: async (): Promise<void> => {
    try {
      await AsyncStorage.removeItem('attendance_session');
    } catch (error) {
      throw error;
    }
  },

  // Save FCM token
  saveFCMToken: async (token: string): Promise<void> => {
    try {
      await AsyncStorage.setItem('fcm_token', token);
    } catch (error) {
      throw error;
    }
  },

  // Get FCM token
  getFCMToken: async (): Promise<string | null> => {
    try {
      return await AsyncStorage.getItem('fcm_token');
    } catch (error) {
      return null;
    }
  },

  // Clear FCM token
  clearFCMToken: async (): Promise<void> => {
    try {
      await AsyncStorage.removeItem('fcm_token');
    } catch (error) {
      throw error;
    }
  },

  // Check if this is the first time the app is opened
  isFirstTimeUser: async (): Promise<boolean> => {
    try {
      const hasSeenWelcome = await AsyncStorage.getItem('has_seen_welcome');
      return hasSeenWelcome === null;
    } catch (error) {
      return true; // Default to showing welcome on error
    }
  },

  // Mark that the user has seen the welcome screen
  setWelcomeSeen: async (): Promise<void> => {
    try {
      await AsyncStorage.setItem('has_seen_welcome', 'true');
    } catch (error) {
      throw error;
    }
  },
};

export default StorageService;