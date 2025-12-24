import { SnackbarService } from '../services/SnackbarService';
import axios from 'axios';

export interface APIError {
  message: string;
  status?: number;
  isNetworkError: boolean;
  isServerError: boolean;
  isTimeout: boolean;
}

export class ErrorHandler {
  /**
   * Parse and handle API errors consistently
   */
  static parseError(error: any): APIError {
    // Network error (no internet, DNS failure, etc.)

    if (error.message || !error.response) {
        return {
          message: error.message || 'An unexpected error occurred. Please try again.',
          isNetworkError: false,
          isServerError: false,
          isTimeout: false,
        };
    }

    if (error.message === 'Network Error' || !error.response) {
      return {
        message: 'No internet connection. Please check your network and try again.'  ,
        isNetworkError: true,
        isServerError: false,
        isTimeout: false,
      };
    }

    // Timeout error
    if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
      return {
        message: 'Request timed out. The server is taking too long to respond.',
        status: 408,
        isNetworkError: false,
        isServerError: true,
        isTimeout: true,
      };
    }

    // Server returned an error response
    if (error.response) {
      const status = error.response.status;
      const data = error.response.data;

      // Extract error message from various response formats
      const message = 
        data?.message || 
        data?.error || 
        data?.msg || 
        this.getDefaultMessageForStatus(status);

      return {
        message,
        status,
        isNetworkError: false,
        isServerError: status >= 500,
        isTimeout: false,
      };
    }

    // Unknown error
    return {
      message: error.message || 'An unexpected error occurred. Please try again.',
      isNetworkError: false,
      isServerError: false,
      isTimeout: false,
    };
  }

  /**
   * Get user-friendly message based on HTTP status code
   */
  static getDefaultMessageForStatus(status: number): string {
    switch (status) {
      case 400:
        return 'Invalid request. Please check your input.';
      case 401:
        return 'Session expired. Please login again.';
      case 403:
        return 'You don\'t have permission to perform this action.';
      case 404:
        return 'The requested resource was not found.';
      case 408:
        return 'Request timeout. Please try again.';
      case 429:
        return 'Too many requests. Please wait a moment and try again.';
      case 500:
        return 'Server error. Our team has been notified.';
      case 502:
        return 'Bad gateway. The server is temporarily unavailable.';
      case 503:
        return 'Service unavailable. Please try again later.';
      case 504:
        return 'Gateway timeout. The server is not responding.';
      default:
        if (status >= 500) {
          return 'Server error. Please try again later.';
        }
        return 'Something went wrong. Please try again.';
    }
  }

  /**
   * Show error message to user via Snackbar
   */
  static showError(error: any, customMessage?: string): void {
    const parsedError = this.parseError(error);
    const message = customMessage || parsedError.message;
    SnackbarService.showError(message);
  }

  /**
   * Handle error and return whether to retry
   */
  static shouldRetry(error: any): boolean {
    const parsedError = this.parseError(error);
    // Retry on network errors, timeouts, and server errors (5xx)
    return parsedError.isNetworkError || 
           parsedError.isTimeout || 
           parsedError.isServerError;
  }

  /**
   * Format error for logging
   */
  static logError(error: any, context?: string): void {
    // Error logged internally
  }
}

/**
 * Axios interceptor setup for global error handling
 */
export const setupAxiosInterceptors = () => {
  // Request interceptor
  axios.interceptors.request.use(
    (config) => {
      // Add timeout if not specified
      if (!config.timeout) {
        config.timeout = 30000; // 30 seconds default
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // Response interceptor
  axios.interceptors.response.use(
    (response) => response,
    (error) => {
      // Log all errors
      ErrorHandler.logError(error, error.config?.url);
      return Promise.reject(error);
    }
  );
};
