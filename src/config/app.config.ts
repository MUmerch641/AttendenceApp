interface ConfigType {
  API: {
    BASE_URL: string;
  };
  AUTH: {
    TOKEN_KEY: string;
    REFRESH_TOKEN_KEY: string;
    TOKEN_EXPIRY_BUFFER: number;
  };
  BIOMETRICS: {
    PROMPT_MESSAGE: string;
    CANCEL_BUTTON_TEXT: string;
  };
  APP: {
    NAME: string;
    VERSION: string;
    ENVIRONMENT: string;
  };
  FEATURES: {
    BIOMETRIC_ATTENDANCE: boolean;
    OFFLINE_MODE: boolean;
  };
  UI: {
    THEME: {
      PRIMARY_COLOR: string;
      SECONDARY_COLOR: string;
      SUCCESS_COLOR: string;
      ERROR_COLOR: string;
      WARNING_COLOR: string;
    };
    ANIMATION_DURATION: number;
  };
}

const config: ConfigType = {
  API: {
    // BASE_URL: 'http://192.168.1.100:3000', // Local development
    // BASE_URL: 'https://staging.attendanceapp.com', // Staging
    BASE_URL: 'https://attendance.curelogics.org', // Production
  },
  AUTH: {
    TOKEN_KEY: 'auth_token',
    REFRESH_TOKEN_KEY: 'refresh_token',
    TOKEN_EXPIRY_BUFFER: 300000,
  },
  BIOMETRICS: {
    PROMPT_MESSAGE: 'Confirm Attendance',
    CANCEL_BUTTON_TEXT: 'Cancel',
  },
  APP: {
    NAME: 'Trusted HRM',
    VERSION: '1.0.0',
    ENVIRONMENT: __DEV__ ? 'development' : 'production',
  },
  FEATURES: {
    BIOMETRIC_ATTENDANCE: true,
    OFFLINE_MODE: false,
  },
  UI: {
    THEME: {
      PRIMARY_COLOR: '#5B4BFF',
      SECONDARY_COLOR: '#FF7A00',
      SUCCESS_COLOR: '#10B981',
      ERROR_COLOR: '#EF4444',
      WARNING_COLOR: '#F59E0B',
    },
    ANIMATION_DURATION: 300,
  },
};

export default config;
