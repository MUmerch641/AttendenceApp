import axios from 'axios';
import config from '../config/app.config';

const API_BASE = config.API.BASE_URL.replace(/\/$/, '');
const AUTH_PATH = '/attendance-api/auth';
const AUTH_BASE = `${API_BASE}${AUTH_PATH}`;

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
  login: async (payload: LoginPayload) => {
    
    const url = `${AUTH_BASE}/login`;
    console.log('Login URL:', url);
    const res = await axios.post(url, payload);
    return res.data;
  },

  restPassword: async (payload: ResetPasswordPayload) => {
    const url = `${AUTH_BASE}/restPassword`;
    const res = await axios.post(url, payload);
    return res.data;
  },

  changePassword: async (payload: ChangePasswordPayload, token?: string) => {
    const url = `${AUTH_BASE}/changePassword`;
    const headers: any = {};
    if (token) headers.Authorization = `Bearer ${token}`;
    const res = await axios.post(url, payload, { headers });
    return res.data;
  },

  forget: async (payload: ForgetPayload) => {
    const url = `${AUTH_BASE}/forget`;
    const res = await axios.post(url, payload);
    return res.data;
  },

  verifyEmail: async (token: string) => {
    const url = `${AUTH_BASE}/verify-email`;
    const res = await axios.get(url, { params: { token } });
    return res.data;
  },

  verifyOtp: async (payload: VerifyOtpPayload) => {
    const url = `${AUTH_BASE}/verifyOtp`;
    const res = await axios.post(url, payload);
    return res.data;
  },
};

export default AuthAPI;
