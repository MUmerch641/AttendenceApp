import axios from 'axios';
import config from '../config/app.config';
import { StorageService } from '../services/StorageService';

// Response type for API calls
export interface ApiResponse {
  isSuccess: boolean;
  message: string;
  data?: any;
}

// 1. Prepare the Base URL securely
// Removes trailing slash from config if it exists, then adds the API path
const API_DOMAIN = config.API.BASE_URL.replace(/\/$/, ''); 
const AUTH_PATH = '/attendance-api/auth'; 

// Final Base URL: https://attendance.curelogics.org/attendance-api/auth
const BASE_URL = `${API_DOMAIN}${AUTH_PATH}`;

// 2. Create an Axios Instance (Best Practice)
const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 15000, // 15 Seconds timeout (Important for slow networks)
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// 2.5. Add Request Interceptor for Authentication
apiClient.interceptors.request.use(
  async (config) => {
    try {
      const token = await StorageService.getAccessToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 3. Payload Interfaces
export interface LoginPayload {
  email: string;
  password: string;
}

export interface ResetPasswordPayload {
  newPassword: string;
  token: string;
}

export interface ChangePasswordPayload {
  newPassword: string;
}

export interface ForgetPayload {
  email: string;
}

export interface VerifyOtpPayload {
  token: string;
}

export const AuthAPI = {
  login: async (payload: LoginPayload): Promise<ApiResponse> => {
    
    try {
      // Use apiClient instead of raw axios
      const res = await apiClient.post('/login', payload);
      return res.data;
    } catch (error: any) {
      throw error; // Throw it back to the screen to handle
    }
  },

  restPassword: async (payload: ResetPasswordPayload): Promise<ApiResponse> => {
    const res = await apiClient.post('/restPassword', payload);
    return res.data;
  },

  changePassword: async (payload: ChangePasswordPayload, token?: string): Promise<ApiResponse> => {
    // We can override headers for specific requests
    const res = await apiClient.post('/changePassword', payload, {
      headers: { Authorization: token ? `Bearer ${token}` : '' },
    });
    return res.data;
  },

  forget: async (payload: ForgetPayload): Promise<ApiResponse> => {
    const res = await apiClient.post('/forget', payload);
    return res.data;
  },

  verifyEmail: async (token: string): Promise<ApiResponse> => {
    const res = await apiClient.get('/verify-email', { params: { token } });
    return res.data;
  },

  verifyOtp: async (payload: VerifyOtpPayload): Promise<ApiResponse> => {
    const res = await apiClient.post('/verifyOtp', payload);
    return res.data;
  },
};

export default AuthAPI;