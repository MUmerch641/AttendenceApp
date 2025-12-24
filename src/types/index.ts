// src/types/index.ts
/**
 * Centralized Type Definitions for the Attendance App
 */

import { LucideIcon } from 'lucide-react-native';

// ============= API Response Types =============
export interface ApiResponse<T = unknown> {
  isSuccess: boolean;
  message: string;
  data?: T;
  fileUrl?: string;
}

// ============= User & Auth Types =============
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
  customSchedule: CustomSchedule[];
  createdAt: string;
  updatedAt: string;
}

export interface CustomSchedule {
  day: string;
  startTime: string;
  endTime: string;
  isWorkingDay: boolean;
}

export interface TokenData {
  accessToken: string;
  refreshToken: string;
}

export interface LoginResponse {
  token: TokenData;
  userObject: UserData;
}

// ============= Attendance Types =============
export interface AttendanceRecord {
  _id: string;
  empId: string;
  empDocId: string;
  reason: string;
  status: 'present' | 'late' | 'absent';
  timeIn: string;
  timeOut?: string;
  createdAt: string;
  updatedAt?: string;
  __v?: number;
}

export interface AttendanceSession {
  isCheckedIn: boolean;
  checkInTime: string;
  checkInTimestamp: string | null;
  workedTime: string;
}

export interface EmployeeStats {
  employeeId: string;
  assignedSchedule: string;
  onTimeDays: number;
  lateDays: number;
  onLeaveDays: number;
  absentDays: number;
}

// ============= Leave Management Types =============
export interface LeaveRequest {
  empDocId: string;
  leaveType: string;
  leaves: number;
  startDate: string;
  endDate: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
}

// ============= Image Picker Types =============
export interface ImageAsset {
  uri: string;
  type?: string;
  fileName?: string;
  fileSize?: number;
  width?: number;
  height?: number;
}

// ============= Component Props Types =============
export interface IconProps {
  icon: LucideIcon;
  focused: boolean;
  label: string;
}

export interface InfoRowProps {
  icon: LucideIcon;
  label: string;
  value: string;
}

export interface ModalProps {
  visible: boolean;
  onClose: () => void;
}

// ============= Navigation Types =============
export type RootStackParamList = {
  Welcome: undefined;
  LoginScreen: undefined;
  Dashboard: undefined;
  LeaveRequest: undefined;
  PrivacyPolicy: undefined;
  SupportPolicy: undefined;
  TermsConditions: undefined;
};

export type TabParamList = {
  HomeTab: undefined;
  History: undefined;
  Settings: undefined;
  Profile: undefined;
};

// ============= Service Types =============
export interface BiometricResult {
  available: boolean;
  biometryType?: 'FaceID' | 'TouchID' | 'Biometrics';
}

export interface NetworkState {
  isConnected: boolean;
  isInternetReachable: boolean;
  type: string;
}

// ============= Error Types =============
export interface AppError extends Error {
  code?: string;
  statusCode?: number;
  isNetworkError?: boolean;
}

export interface ValidationError {
  field: string;
  message: string;
}
