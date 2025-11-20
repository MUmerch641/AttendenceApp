import axios from 'axios';
import ReactNativeBiometrics from 'react-native-biometrics';
import config from '../config/app.config';

const rnBiometrics = new ReactNativeBiometrics();

// Use config for API URL
const API_URL = config.API.BASE_URL;

export const AttendanceService = {
  
  // 1. Check if Fingerprint is available on device
  checkAvailability: async () => {
    const { available, biometryType } = await rnBiometrics.isSensorAvailable();
    return { available, biometryType };
  },

  // 2. Prompt User for Fingerprint
  authenticateUser: async () => {
    try {
      const { success } = await rnBiometrics.simplePrompt({
        promptMessage: config.BIOMETRICS.PROMPT_MESSAGE,
        cancelButtonText: config.BIOMETRICS.CANCEL_BUTTON_TEXT,
      });
      return success;
    } catch (error) {
      console.error('Biometric failed', error);
      return false;
    }
  },

  // 3. Send Data to Backend
  markAttendance: async (userId: string, type: 'CHECK_IN' | 'CHECK_OUT') => {
    try {
      const payload = {
        userId: userId,
        type: type, // 'CHECK_IN' or 'CHECK_OUT'
        timestamp: new Date().toISOString(),
        // You can add location data here later
        // location: { lat: ..., long: ... } 
      };

      console.log('🚀 Sending to Backend:', payload);

      // UNCOMMENT THIS WHEN YOU HAVE A REAL SERVER
      // const response = await axios.post(`${API_URL}/mark`, payload);
      // return response.data;

      // FAKE SUCCESS RESPONSE (For testing UI)
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({ success: true, message: `${type} Successful`, data: payload });
        }, 1500); // Simulate network delay
      });

    } catch (error) {
      console.error('API Error', error);
      throw error;
    }
  }
};