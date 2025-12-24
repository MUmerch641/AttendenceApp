// src/utils/validation.ts
/**
 * Input Validation Utilities
 */

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

export const Validators = {
  /**
   * Validate email format
   */
  email: (email: string): ValidationResult => {
    if (!email || email.trim() === '') {
      return { isValid: false, error: 'Email is required' };
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return { isValid: false, error: 'Please enter a valid email address' };
    }

    return { isValid: true };
  },

  /**
   * Validate password strength
   */
  password: (password: string): ValidationResult => {
    if (!password || password.trim() === '') {
      return { isValid: false, error: 'Password is required' };
    }

    if (password.length < 6) {
      return { isValid: false, error: 'Password must be at least 6 characters long' };
    }

    return { isValid: true };
  },

  /**
   * Validate phone number
   */
  phone: (phone: string): ValidationResult => {
    if (!phone || phone.trim() === '') {
      return { isValid: false, error: 'Phone number is required' };
    }

    const phoneRegex = /^[0-9]{10,15}$/;
    if (!phoneRegex.test(phone.replace(/[\s-()]/g, ''))) {
      return { isValid: false, error: 'Please enter a valid phone number' };
    }

    return { isValid: true };
  },

  /**
   * Validate required field
   */
  required: (value: string, fieldName: string = 'This field'): ValidationResult => {
    if (!value || value.trim() === '') {
      return { isValid: false, error: `${fieldName} is required` };
    }

    return { isValid: true };
  },

  /**
   * Validate date range
   */
  dateRange: (startDate: Date, endDate: Date): ValidationResult => {
    if (startDate > endDate) {
      return { isValid: false, error: 'End date must be after start date' };
    }

    return { isValid: true };
  },

  /**
   * Validate number range
   */
  numberRange: (value: number, min: number, max: number, fieldName: string = 'Value'): ValidationResult => {
    if (value < min || value > max) {
      return { isValid: false, error: `${fieldName} must be between ${min} and ${max}` };
    }

    return { isValid: true };
  },

  /**
   * Sanitize input to prevent XSS
   */
  sanitize: (input: string): string => {
    return input
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');
  },
};

/**
 * Validate multiple fields at once
 */
export const validateForm = (
  fields: Array<{ value: string; validator: (value: string) => ValidationResult }>
): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  fields.forEach(({ value, validator }) => {
    const result = validator(value);
    if (!result.isValid && result.error) {
      errors.push(result.error);
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
  };
};
