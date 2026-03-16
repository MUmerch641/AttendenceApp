import axios from 'axios';
import config from '../config/app.config';
import { StorageService } from '../services/StorageService';
import { NavigationService } from '../services/NavigationService';
import { SnackbarService } from '../services/SnackbarService';

// Response type for API calls
export interface ApiResponse {
  isSuccess: boolean;
  message: string;
  data?: any;
}

export interface AttendanceRequest {
  _id: string;
  employeeId: string;
  organizationId: string;
  title: string;
  message: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  isRead: boolean;
  creationStatus: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAttendanceRequestPayload {
  employeeId: string;
  title: string;
  message: string;
}

// 1. Prepare the Base URL securely
const API_DOMAIN = config.API.BASE_URL.replace(/\/$/, '');
const BASE_URL = `${API_DOMAIN}/api/notification`;

// 2. Create Axios Instance
const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Add Request Interceptor for Authentication
apiClient.interceptors.request.use(
  async (config) => {
    try {
      const token = await StorageService.getAccessToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {}
    return config;
  },
  (error) => Promise.reject(error)
);

// Add Response Interceptor for Error Handling
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response && error.response.status === 401) {
      await StorageService.clearAllData();
      NavigationService.setAuthenticated(false);
      NavigationService.reset([{ name: 'LoginScreen' }]);
      SnackbarService.showError('Session expired. Please login again.');
    }
    return Promise.reject(error);
  }
);

export const AttendanceRequestsAPI = {
  getMyRequests: async (): Promise<ApiResponse> => {
    try {
      const res = await apiClient.get('/my-requests');
      return res.data;
    } catch (error: any) {
      throw error;
    }
  },

  createRequest: async (payload: CreateAttendanceRequestPayload): Promise<ApiResponse> => {
    try {
      const res = await apiClient.post('/create', payload);
      return res.data;
    } catch (error: any) {
      throw error;
    }
  },
};

export default AttendanceRequestsAPI;
