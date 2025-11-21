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
      console.error('Error saving tokens:', error);
      throw error;
    }
  },

  // Get access token
  getAccessToken: async (): Promise<string | null> => {
    try {
      return await AsyncStorage.getItem(config.AUTH.TOKEN_KEY);
    } catch (error) {
      console.error('Error getting access token:', error);
      return null;
    }
  },

  // Get refresh token
  getRefreshToken: async (): Promise<string | null> => {
    try {
      return await AsyncStorage.getItem(config.AUTH.REFRESH_TOKEN_KEY);
    } catch (error) {
      console.error('Error getting refresh token:', error);
      return null;
    }
  },

  // Save user data
  saveUserData: async (userData: UserData): Promise<void> => {
    try {
      await AsyncStorage.setItem('user_data', JSON.stringify(userData));
    } catch (error) {
      console.error('Error saving user data:', error);
      throw error;
    }
  },

  // Get user data
  getUserData: async (): Promise<UserData | null> => {
    try {
      const userData = await AsyncStorage.getItem('user_data');
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Error getting user data:', error);
      return null;
    }
  },

  // Check if user is logged in
  isLoggedIn: async (): Promise<boolean> => {
    try {
      const token = await StorageService.getAccessToken();
      return token !== null;
    } catch (error) {
      console.error('Error checking login status:', error);
      return false;
    }
  },

  // Clear all stored data (logout)
  clearAllData: async (): Promise<void> => {
    try {
      await AsyncStorage.multiRemove([
        config.AUTH.TOKEN_KEY,
        config.AUTH.REFRESH_TOKEN_KEY,
        'user_data'
      ]);
    } catch (error) {
      console.error('Error clearing data:', error);
      throw error;
    }
  },

  // Get user ID
  getUserId: async (): Promise<string | null> => {
    try {
      const userData = await StorageService.getUserData();
      return userData?._id || null;
    } catch (error) {
      console.error('Error getting user ID:', error);
      return null;
    }
  }
};

export default StorageService;