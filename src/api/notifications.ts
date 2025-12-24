import axios from 'axios';
import config from '../config/app.config';
import { StorageService } from '../services/StorageService';

// Response type for API calls
export interface ApiResponse {
  isSuccess: boolean;
  message: string;
  data?: any;
}

// Notification interface
export interface Notification {
  _id: string;
  userId: string;
  title: string;
  message?: string; // Our app uses 'message'
  notificationMessage?: string; // Backend returns 'notificationMessage'
  type?: string;
  isRead: boolean;
  createdAt: string;
  updatedAt?: string;
  data?: any;
}

export interface UnreadCountResponse {
  count: number;
}

// Prepare the Base URL
const API_DOMAIN = config.API.BASE_URL.replace(/\/$/, '');
const NOTIFICATIONS_PATH = '/attendance-api/notifications';

const BASE_URL = `${API_DOMAIN}${NOTIFICATIONS_PATH}`;

// Create an Axios Instance
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
    } catch (error) {
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add Response Interceptor for Error Handling
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.code === 'ECONNABORTED') {
    } else if (!error.response) {
    }
    return Promise.reject(error);
  }
);

/**
 * Notifications API
 */
export const NotificationsAPI = {
  /**
   * Get all notifications for a user
   * GET /attendance-api/notifications/user/{userId}
   */
  getUserNotifications: async (userId: string): Promise<ApiResponse> => {
    try {
      const response = await apiClient.get(`/user/${userId}`);

      // Map backend response to our format
      let notificationsList = response.data?.data || response.data || [];
      
      // Ensure it's an array
      if (!Array.isArray(notificationsList)) {
        notificationsList = [];
      }

      // Map notificationMessage to message for consistency
      notificationsList = notificationsList.map((notif: any) => ({
        ...notif,
        message: notif.notificationMessage || notif.message || '',
      }));

      const unreadCount = notificationsList.filter((n: Notification) => !n.isRead).length;

      if (notificationsList.length > 0) {
        notificationsList.slice(0, 3).forEach((notif: Notification, index: number) => {
       });
      }
      
    
      return {
        isSuccess: response.data?.isSuccess || true,
        message: response.data?.message || 'Notifications fetched successfully',
        data: notificationsList,
      };
    } catch (error: any) {

      return {
        isSuccess: false,
        message: error.response?.data?.message || 'Failed to fetch notifications',
        data: [],
      };
    }
  },

  /**
   * Mark a notification as read
   * PATCH /attendance-api/notifications/{id}/read/{userId}
   */
  markAsRead: async (notificationId: string, userId: string): Promise<ApiResponse> => {
    try {
      const response = await apiClient.patch(`/${notificationId}/read/${userId}`);

  
      return {
        isSuccess: response.data?.isSuccess || true,
        message: response.data?.message || 'Notification marked as read',
        data: response.data?.data,
      };
    } catch (error: any) {
      return {
        isSuccess: false,
        message: error.response?.data?.message || 'Failed to mark notification as read',
      };
    }
  },

  /**
   * Get unread notifications count
   * GET /attendance-api/notifications/unread-count/{userId}
   */
  getUnreadCount: async (userId: string): Promise<ApiResponse> => {
    try {
      const response = await apiClient.get(`/unread-count/${userId}`);

      // Backend returns { unreadCount: 2 } directly, not nested in data
      const unreadCount = response.data?.unreadCount || response.data?.data?.count || response.data?.count || 0;

      return {
        isSuccess: response.data?.isSuccess || true,
        message: response.data?.message || 'Unread count fetched successfully',
        data: {
          count: unreadCount,
        },
      };
    } catch (error: any) {

      return {
        isSuccess: false,
        message: error.response?.data?.message || 'Failed to fetch unread count',
        data: { count: 0 },
      };
    }
  },

  /**
   * Delete a notification
   * DELETE /attendance-api/notifications/{id}/user/{userId}
   */
  deleteNotification: async (notificationId: string, userId: string): Promise<ApiResponse> => {
    try {

      const response = await apiClient.delete(`/${notificationId}/user/${userId}`);


      return {
        isSuccess: response.data?.isSuccess || true,
        message: response.data?.message || 'Notification deleted successfully',
        data: response.data?.data,
      };
    } catch (error: any) {

      return {
        isSuccess: false,
        message: error.response?.data?.message || 'Failed to delete notification',
      };
    }
  },

  /**
   * Mark all notifications as read
   * Helper function to mark all unread notifications as read
   */
  markAllAsRead: async (userId: string, notifications: Notification[]): Promise<void> => {
    try {
      const unreadNotifications = notifications.filter(n => !n.isRead);

      if (unreadNotifications.length === 0) {
        return;
      }

      unreadNotifications.forEach((notif, index) => {
      });

      const promises = unreadNotifications.map(notification =>
        NotificationsAPI.markAsRead(notification._id, userId)
      );

      const results = await Promise.all(promises);
      
      const successCount = results.filter(r => r.isSuccess).length;
      const failCount = results.length - successCount;

    } catch (error) {
      throw error;
    }
  },
};

export default NotificationsAPI;
