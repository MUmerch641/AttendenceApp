import axios from 'axios';
import { Platform } from 'react-native';
import config from '../config/app.config';
import { StorageService } from '../services/StorageService';

/**
 * Attendance API
 * 
 * This file handles attendance, leave, and profile-related API calls.
 * 
 * NOTE: For notification-related APIs, use /src/api/notifications.ts
 */

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
      // Error getting token for request
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
      throw new Error('Please check your internet connection and try again.');
    }

    // Handle HTTP errors
    if (error.response.status >= 500) {
      throw new Error('Server is temporarily unavailable. Please try again later.');
    }

    // Handle authentication errors
    if (error.response.status === 401) {
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

export interface EmployeeSchedule {
  _id: string;
  scheduleName: string;
  timeIn: string;
  timeOut: string;
  timeInFlexibility: number;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
  __v?: number;
}

export interface EmployeeDetails {
  _id: string;
  fullName: string;
  guardianName: string;
  contactNumber: string;
  officialEmail: string;
  personalEmail: string;
  employeeId: string;
  emergencyContactNumber: string;
  position: string;
  profilePhotoUrl?: string;
  bankAccount: string;
  scheduleId: EmployeeSchedule;
  address: string;
  password: string;
  role: string;
  isActive: boolean;
  customSchedule: any[];
  createdAt: string;
  updatedAt: string;
  __v?: number;
}

export interface LeaveRequest {
  _id: string;
  empDocId: string | EmployeeDetails; // Can be string or populated object
  leaveType: string;
  leaves: number;
  startDate: string;
  endDate: string;
  reason: string;
  isRead?: boolean;
  status: 'pending' | 'approved' | 'rejected' | 'Pending' | 'Approved' | 'Rejected';
  createdAt: string;
  updatedAt: string;
  __v?: number;
}

export interface GetLeavesResponse extends ApiResponse {
  data: {
    leaves: LeaveRequest[];
    total: number;
  };
}

export interface Notification {
  _id: string;
  userId: string;
  title: string;
  message: string;
  type?: 'leave_approved' | 'leave_rejected' | 'leave_pending' | 'announcement' | 'reminder' | 'general';
  isRead: boolean;
  createdAt: string;
  updatedAt?: string;
  data?: any; // Additional data like leave details
}

// Removed GetNotificationsResponse - Use notifications.ts API instead

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

export interface EmployeeReportParams {
  year: number;
  month: number;
  empDocId: string;
  count?: number;
  pageNo?: number;
}

export interface EmployeeReportResponse extends ApiResponse {
  data: Array<{
    _id: string;
    fullName: string;
    officialEmail: string;
    position: string;
    attendance: Array<{
      _id: string;
      empId?: string;
      reason?: string;
      status?: 'present' | 'late' | 'absent';
      timeIn?: string;
      timeOut?: string;
      empDocId: string;
      createdAt: string;
      updatedAt?: string;
      __v?: number;
    }>;
  }>;
  totalCount: number;
}

export const AttendanceAPI = {
  create: async (payload: CreateAttendancePayload): Promise<ApiResponse> => {
    try {
      // Use apiClient instead of raw axios
      const res = await apiClient.post('/create', payload);
      return res.data;
    } catch (error: any) {
      throw error; // Throw it back to the screen to handle
    }
  },

  report: async (params: AttendanceReportParams): Promise<AttendanceReportResponse> => {
    try {
      // Use apiClient with query parameters
      const res = await apiClient.get('/report', { params });
      return res.data;
    } catch (error: any) {
      throw error; // Throw it back to the screen to handle
    }
  },

  employeeStats: async (params: EmployeeStatsParams): Promise<EmployeeStatsResponse> => {
    try {
      const res = await apiClient.get('/employeeStats', { params });
      return res.data;
    } catch (error: any) {
      throw error;
    }
  },

  reportsByEmployee: async (params: EmployeeReportParams): Promise<EmployeeReportResponse> => {
    const { empDocId, ...queryParams } = params;
    const endpoint = `/reportsByEmployId/${empDocId}`;

    try {
      const res = await apiClient.get(endpoint, { params: queryParams });
      return res.data;
    } catch (error: any) {
      throw error;
    }
  },  uploadProfilePic: async (imageAsset: any): Promise<ApiResponse> => {
    const userBaseUrl = `${API_DOMAIN}/attendance-api/user`;
    const url = `${userBaseUrl}/uploadProfilePic`;


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

      return response.data;

    } catch (error: any) {
      throw error;
    }
  },

  createLeave: async (payload: CreateLeavePayload): Promise<ApiResponse> => {
    const leaveBaseUrl = `${API_DOMAIN}/attendance-api/leave-management`;

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
      
      // Return properly formatted response
      return {
        isSuccess: true,
        message: res.data?.message || 'Leave request submitted successfully',
        data: res.data,
      };
    } catch (error: any) {
      // Return error as ApiResponse
      return {
        isSuccess: false,
        message: error.response?.data?.message || error.message || 'Failed to create leave request',
        data: error.response?.data,
      };
    }
  },

  getLeaves: async (params?: { status?: string; pageNo?: number; count?: number }): Promise<GetLeavesResponse> => {
    const leaveBaseUrl = `${API_DOMAIN}/attendance-api/leave-management`;
    
    try {
      const token = await StorageService.getAccessToken();
      const queryParams = new URLSearchParams();
      
      if (params?.status) queryParams.append('status', params.status);
      if (params?.pageNo) queryParams.append('pageNo', params.pageNo.toString());
      if (params?.count) queryParams.append('count', params.count.toString());
      
      const url = queryParams.toString() 
        ? `${leaveBaseUrl}/getLeaves?${queryParams.toString()}`
        : `${leaveBaseUrl}/getLeaves`;
      
      const res = await axios.get(url, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        timeout: 15000,
      });
      
      
      return {
        isSuccess: true,
        message: 'Leaves fetched successfully',
        data: {
          leaves: res.data?.data?.leaves || res.data?.leaves || [],
          total: res.data?.data?.total || res.data?.total || 0,
        },
      };
    } catch (error: any) {
      return {
        isSuccess: false,
        message: error.response?.data?.message || error.message || 'Failed to fetch leave requests',
        data: {
          leaves: [],
          total: 0,
        },
      };
    }
  },

  getAllLeavesByUserId: async (userId: string): Promise<GetLeavesResponse> => {
    const leaveBaseUrl = `${API_DOMAIN}/attendance-api/leave-management`;
    const endpoint = `${leaveBaseUrl}/getAllByUserId/${userId}`;

    try {
      const token = await StorageService.getAccessToken();
      
      if (!token) {
        throw new Error('Authentication required');
      }

      const res = await axios.get(endpoint, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        timeout: 15000,
      });
      
   
      // Handle the actual response format: data is an array directly
      const leaves = Array.isArray(res.data?.data) 
        ? res.data.data 
        : Array.isArray(res.data) 
        ? res.data 
        : [];
      
      const total = leaves.length;
      
      
      return {
        isSuccess: res.data?.isSuccess !== false, // Default to true if not specified
        message: res.data?.message || 'Leaves fetched successfully',
        data: {
          leaves: leaves,
          total: total,
        },
      };
    } catch (error: any) {
      return {
        isSuccess: false,
        message: error.response?.data?.message || error.message || 'Failed to fetch leave requests',
        data: {
          leaves: [],
          total: 0,
        },
      };
    }
  },

  // Alternative upload function using fetch (if axios fails)
  uploadProfilePicFetch: async (imageAsset: any): Promise<ApiResponse> => {
    const userBaseUrl = `${API_DOMAIN}/attendance-api/user`;
    const url = `${userBaseUrl}/uploadProfilePic`;

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

      return json;

    } catch (error: any) {
      throw error;
    }
  },
};

export default AttendanceAPI;