import axios from 'axios';
import { Platform } from 'react-native';
import config from '../config/app.config';
import { StorageService } from '../services/StorageService';

// Response type for API calls
export interface ApiResponse {
  isSuccess: boolean;
  message: string;
  data?: any;
  fileUrl?: string; // For file upload responses
}

// 1. Prepare the Base URL securely
const API_DOMAIN = config.API.BASE_URL.replace(/\/$/, '');
const ATTENDANCE_PATH = '/attendance-api/attendance';

const BASE_URL = `${API_DOMAIN}${ATTENDANCE_PATH}`;

// 2. Create an Axios Instance (Best Practice)
const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 15000, 
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
      console.error('Error getting token for request:', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 2.6. Add Response Interceptor for Network Error Handling
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle network errors
    if (!error.response) {
      // Network error (no response received)
      console.error('Network Error:', error.message);
      throw new Error('Please check your internet connection and try again.');
    }

    // Handle HTTP errors
    if (error.response.status >= 500) {
      console.error('Server Error:', error.response.status);
      throw new Error('Server is temporarily unavailable. Please try again later.');
    }

    // Handle authentication errors
    if (error.response.status === 401) {
      console.error('Authentication Error');
      // Could trigger logout here if needed
    }

    return Promise.reject(error);
  }
);

// 3. Payload Interfaces
export interface CreateAttendancePayload {
  empId: string;
  reason: string;
}

export interface CreateLeavePayload {
  empDocId: string;
  leaveType: string;
  leaves: number;
  startDate: string;
  endDate: string;
  reason: string;
  status: string;
}

export interface AttendanceReportParams {
  year: number;
  month: number;
  count?: number;
  pageNo?: number;
}

export interface AttendanceReportResponse extends ApiResponse {
  data: Array<{
    _id: string;
    fullName: string;
    officialEmail: string;
    position: string;
    attendance: Array<{
      _id: string;
      empId: string;
      reason: string;
      status: 'present' | 'late' | 'absent';
      timeIn: string;
      empDocId: string;
      createdAt: string;
      updatedAt?: string;
      __v?: number;
    }>;
  }>;
  totalCount: number;
}

export interface EmployeeStatsParams {
  year: number;
  month: number;
  empDocId: string;
}

export interface EmployeeStatsResponse extends ApiResponse {
  data: {
    employeeId: string;
    assignedSchedule: string;
    onTimeDays: number;
    lateDays: number;
    onLeaveDays: number;
    absentDays: number;
  };
}

export const AttendanceAPI = {
  create: async (payload: CreateAttendancePayload): Promise<ApiResponse> => {
    console.log(`🚀 Creating attendance at: ${BASE_URL}/create`);
    console.log('📦 Payload:', payload);

    try {
      // Use apiClient instead of raw axios
      const res = await apiClient.post('/create', payload);
      return res.data;
    } catch (error: any) {
      console.error('❌ AttendanceAPI Error:', error.message);
      throw error; // Throw it back to the screen to handle
    }
  },

  report: async (params: AttendanceReportParams): Promise<AttendanceReportResponse> => {
    console.log(`🚀 Fetching attendance report from: ${BASE_URL}/report`);
    console.log('📦 Params:', params);

    try {
      // Use apiClient with query parameters
      const res = await apiClient.get('/report', { params });
      return res.data;
    } catch (error: any) {
      console.error('❌ AttendanceAPI Report Error:', error.message);
      throw error; // Throw it back to the screen to handle
    }
  },

  employeeStats: async (params: EmployeeStatsParams): Promise<EmployeeStatsResponse> => {
    console.log(`🚀 Fetching employee stats from: ${BASE_URL}/employeeStats`);
    console.log('📦 Params:', params);

    try {
      const res = await apiClient.get('/employeeStats', { params });
      return res.data;
    } catch (error: any) {
      console.error('❌ AttendanceAPI EmployeeStats Error:', error.message);
      throw error;
    }
  },

  uploadProfilePic: async (imageAsset: any): Promise<ApiResponse> => {
    const userBaseUrl = `${API_DOMAIN}/attendance-api/user`;
    const url = `${userBaseUrl}/uploadProfilePic`;

    console.log('� Preparing Upload to:', url);

    try {
      const token = await StorageService.getAccessToken();

      // 1. Create FormData
      const formData = new FormData();

      // 2. Append the file EXACTLY like this
      formData.append('file', {
        uri: Platform.OS === 'android'
          ? imageAsset.uri // Android often needs the direct URI
          : imageAsset.uri.replace('file://', ''), // iOS sometimes needs file:// removed
        type: imageAsset.type || 'image/jpeg', // Default if type is missing
        name: imageAsset.fileName || `profile_${Date.now()}.jpg`, // Name is MANDATORY
      } as any);

      console.log('📦 FormData Created. Sending...');

      // 3. Send Request with proper headers
      const response = await axios.post(url, formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
        transformRequest: (data, headers) => {
          // React Native Axios fix: prevents Axios from destroying FormData
          return data;
        },
        timeout: 30000, // Longer timeout for file uploads
      });

      console.log('✅ Upload Success:', response.data);
      return response.data;

    } catch (error: any) {
      console.error('❌ Upload Error Details:', error.message);
      if (error.response) {
        console.error('Server Response:', error.response.data);
      }
      throw error;
    }
  },

  createLeave: async (payload: CreateLeavePayload): Promise<ApiResponse> => {
    const leaveBaseUrl = `${API_DOMAIN}/attendance-api/leave-management`;
    console.log(`🚀 Creating leave request at: ${leaveBaseUrl}/create`);
    console.log('📦 Payload:', payload);

    try {
      const token = await StorageService.getAccessToken();
      const res = await axios.post(`${leaveBaseUrl}/create`, payload, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        timeout: 15000,
      });
      return res.data;
    } catch (error: any) {
      console.error('❌ Create Leave Error:', error.message);
      throw error;
    }
  },

  // Alternative upload function using fetch (if axios fails)
  uploadProfilePicFetch: async (imageAsset: any): Promise<ApiResponse> => {
    const userBaseUrl = `${API_DOMAIN}/attendance-api/user`;
    const url = `${userBaseUrl}/uploadProfilePic`;

    console.log('🚀 Preparing Fetch Upload to:', url);

    try {
      const token = await StorageService.getAccessToken();

      const formData = new FormData();
      formData.append('file', {
        uri: imageAsset.uri,
        type: imageAsset.type || 'image/jpeg',
        name: imageAsset.fileName || 'upload.jpg',
      } as any);

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          // Note: Do NOT set Content-Type for fetch, it sets boundary automatically
        },
        body: formData,
      });

      const json = await response.json();

      if (!response.ok) {
        throw new Error(JSON.stringify(json));
      }

      console.log('✅ Fetch Upload Success:', json);
      return json;

    } catch (error: any) {
      console.error('❌ Fetch Upload Error:', error);
      throw error;
    }
  },
};

export default AttendanceAPI;