// Toast Messages Constants
export const TOAST_MESSAGES = {
  // Success Messages
  SUCCESS: {
    ROLE_CREATED: 'Role created successfully!',
    ROLE_UPDATED: 'Role updated successfully!',
    USER_CREATED: 'User created successfully!',
    USER_UPDATED: 'User updated successfully!',
    LOGIN_SUCCESS: 'Login successful!',
    PASSWORD_RESET: 'Password reset successfully!',
    EMAIL_SENT: 'Email sent successfully!',
  },

  // Error Messages
  ERROR: {
    ROLE_CREATE_FAILED: 'Failed to create role',
    ROLE_UPDATE_FAILED: 'Failed to update role',
    ROLE_FETCH_FAILED: 'Failed to fetch roles',
    USER_CREATE_FAILED: 'Failed to create user',
    USER_UPDATE_FAILED: 'Failed to update user',
    USER_FETCH_FAILED: 'Failed to fetch users',
    LOGIN_FAILED: 'Login failed',
    VALIDATION_FAILED: 'Validation failed',
    SAVE_FAILED: 'Failed to save',
    NETWORK_ERROR: 'Network error occurred',
    UNAUTHORIZED: 'Unauthorized access',
    FORBIDDEN: 'Access forbidden',
    NOT_FOUND: 'Resource not found',
    SERVER_ERROR: 'Server error occurred',
  },

  // Info Messages
  INFO: {
    LOADING: 'Loading...',
    PROCESSING: 'Processing...',
    SAVING: 'Saving...',
  },

  // Warning Messages
  WARNING: {
    UNSAVED_CHANGES: 'You have unsaved changes',
    CONFIRM_DELETE: 'Are you sure you want to delete?',
    PERMISSION_DENIED: 'Permission denied',
  },
} as const;

// Toast Descriptions Constants
export const TOAST_DESCRIPTIONS = {
  SUCCESS: {
    ROLE_CREATED: (roleName: string) => `Role "${roleName}" has been created.`,
    ROLE_UPDATED: (roleName: string) => `Role "${roleName}" has been updated.`,
    USER_CREATED: (userName: string) => `User "${userName}" has been created.`,
    USER_UPDATED: (userName: string) => `User "${userName}" has been updated.`,
    EMAIL_SENT: (email: string) => `Email has been sent to ${email}.`,
  },

  ERROR: {
    ROLE_CREATE_FAILED: 'Please check the form and try again.',
    ROLE_UPDATE_FAILED: 'Please check the form and try again.',
    ROLE_FETCH_FAILED: 'Please try again later.',
    USER_CREATE_FAILED: 'Please check the form and try again.',
    USER_UPDATE_FAILED: 'Please check the form and try again.',
    USER_FETCH_FAILED: 'Please try again later.',
    VALIDATION_FAILED: 'Please check all required fields.',
    SAVE_FAILED: 'Please try again later.',
    NETWORK_ERROR: 'Please check your internet connection.',
    UNAUTHORIZED: 'Please login again.',
    FORBIDDEN: 'You do not have permission to perform this action.',
    NOT_FOUND: 'The requested resource was not found.',
    SERVER_ERROR: 'Please try again later or contact support.',
  },

  INFO: {
    LOADING: 'Please wait while we fetch the data.',
    PROCESSING: 'Please wait while we process your request.',
    SAVING: 'Please wait while we save your changes.',
  },

  WARNING: {
    UNSAVED_CHANGES: 'Your changes will be lost if you leave this page.',
    CONFIRM_DELETE: 'This action cannot be undone.',
    PERMISSION_DENIED: 'You need proper permissions to access this feature.',
  },
} as const;

// Form Validation Messages
export const VALIDATION_MESSAGES = {
  REQUIRED: 'This field is required',
  EMAIL_INVALID: 'Please enter a valid email address',
  PASSWORD_MIN_LENGTH: 'Password must be at least 6 characters',
  PASSWORD_MISMATCH: "Passwords don't match",
  NAME_MIN_LENGTH: 'Name must be at least 2 characters',
  NAME_MAX_LENGTH: 'Name must be less than 100 characters',
  PHONE_INVALID: 'Please enter a valid phone number',
  ROLE_REQUIRED: 'Please select a role',
  PERMISSION_REQUIRED: 'Please select at least one permission',
} as const;

// API Response Messages
export const API_MESSAGES = {
  SUCCESS: {
    ROLE_CREATED: 'Role created successfully',
    ROLE_UPDATED: 'Role updated successfully',
    USER_CREATED: 'User created successfully',
    USER_UPDATED: 'User updated successfully',
  },

  ERROR: {
    ROLE_NOT_FOUND: 'Role not found',
    USER_NOT_FOUND: 'User not found',
    INVALID_DATA: 'Invalid data provided',
    DUPLICATE_ROLE: 'Role with this name already exists',
    DUPLICATE_USER: 'User with this email already exists',
    INVALID_PERMISSIONS: 'Invalid permissions provided',
    UNAUTHORIZED: 'Unauthorized access',
    FORBIDDEN: 'Access forbidden',
    VALIDATION_ERROR: 'Validation error',
    SERVER_ERROR: 'Internal server error',
  },
} as const;

// Export all constants
const constants = {
  TOAST_MESSAGES,
  TOAST_DESCRIPTIONS,
  VALIDATION_MESSAGES,
  API_MESSAGES,
};

export default constants;
