// All Constants - Backend & Frontend
// This file contains all constants including API responses, HTTP status codes, database messages, and UI messages
// Single source of truth for all messages in the application

// ============================================================================
// BACKEND API RESPONSE MESSAGES
// ============================================================================
export const API_RESPONSE_MESSAGES = {
  SUCCESS: {
    // Authentication
    LOGIN_SUCCESS: 'Login successful',
    LOGOUT_SUCCESS: 'Logout successful',
    PASSWORD_RESET: 'Password reset successfully',
    PASSWORD_CHANGED: 'Password changed successfully',
    EMAIL_SENT: 'Email sent successfully',
    
    // Roles
    ROLE_CREATED: 'Role created successfully',
    ROLE_UPDATED: 'Role updated successfully',
    ROLE_DELETED: 'Role deleted successfully',
    
    // Users
    USER_CREATED: 'User created successfully',
    USER_UPDATED: 'User updated successfully',
    PROFILE_UPDATED: 'Profile updated successfully',
    USER_DELETED: 'User deleted successfully',
    
    // Clients
    CLIENT_CREATED: 'Client created successfully',
    CLIENT_UPDATED: 'Client updated successfully',
    CLIENT_DELETED: 'Client deleted successfully',
    
    // Projects
    PROJECT_CREATED: 'Project created successfully',
    PROJECT_UPDATED: 'Project updated successfully',
    PROJECT_DELETED: 'Project deleted successfully',
    
    // Inventory
    INVENTORY_CHECKIN: 'Inventory checked in successfully',
    INVENTORY_UPDATED: 'Inventory updated successfully',
    INVENTORY_DELETED: 'Inventory deleted successfully',
    
    // Upload
    UPLOAD_SUCCESS: 'File uploaded successfully',
  },

  ERROR: {
    // Authentication Errors
    UNAUTHORIZED: 'Unauthorized access',
    INVALID_TOKEN: 'Invalid or expired token',
    TOKEN_REQUIRED: 'Authorization token is required',
    INVALID_CREDENTIALS: 'Wrong email or password',
    EMAIL_NOT_FOUND: 'Email not found',
    INCORRECT_PASSWORD: 'Wrong password',
    PASSWORD_CHANGE_FAILED: 'Failed to change password',
    ACCOUNT_INACTIVE: 'Account inactive',
    
    // Authorization Errors
    FORBIDDEN: 'Access forbidden',
    INSUFFICIENT_PERMISSIONS: 'Insufficient permissions',
    PERMISSION_DENIED: 'Permission denied',
    
    // Validation Errors
    VALIDATION_ERROR: 'Validation error',
    INVALID_DATA: 'Invalid data provided',
    MISSING_REQUIRED_FIELDS: 'Missing required fields',
    INVALID_EMAIL: 'Invalid email',
    INVALID_PASSWORD: 'Invalid password',
    PASSWORD_TOO_SHORT: 'Password too short',
    
    // Resource Errors
    ROLE_NOT_FOUND: 'Role not found',
    USER_NOT_FOUND: 'No account found with this email address',
    PROJECT_NOT_FOUND: 'Project not found',
    RESOURCE_NOT_FOUND: 'Resource not found',
    DUPLICATE_ROLE: 'Role with this name already exists',
    DUPLICATE_USER: 'User with this email already exists',
    DUPLICATE_EMAIL: 'Email already exists',
    DUPLICATE_PROJECT_CODE: 'Project with this code already exists',
    
    // Permission Errors
    INVALID_PERMISSIONS: 'Invalid permissions provided',
    APP_PERMISSION_REQUIRED: 'User must have at least one app permission',
    
    // Server Errors
    SERVER_ERROR: 'Internal server error',
    DATABASE_ERROR: 'Database error',
    EMAIL_SEND_ERROR: 'Failed to send email',
    FILE_UPLOAD_ERROR: 'File upload failed',
    FETCH_FAILED: 'Failed to fetch data',
    SAVE_FAILED: 'Failed to save',
    UPDATE_FAILED: 'Failed to update',
    DELETE_FAILED: 'Failed to delete',
    
    // Network Errors
    NETWORK_ERROR: 'Network error',
    TIMEOUT_ERROR: 'Request timeout',
    CONNECTION_ERROR: 'Connection error',
  },

  INFO: {
    PROCESSING: 'Processing request',
    LOADING: 'Loading data',
    SAVING: 'Saving data',
  },

  WARNING: {
    DEPRECATED_API: 'This API endpoint is deprecated',
    RATE_LIMIT_WARNING: 'Rate limit exceeded',
    MAINTENANCE_MODE: 'System is in maintenance mode',
  },
} as const;

// ============================================================================
// HTTP STATUS CODES
// ============================================================================
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
} as const;

// ============================================================================
// DATABASE ERROR MESSAGES
// ============================================================================
export const DATABASE_MESSAGES = {
  CONNECTION_FAILED: 'Database connection failed',
  QUERY_FAILED: 'Database query failed',
  CONSTRAINT_VIOLATION: 'Database constraint violation',
  DUPLICATE_KEY: 'Duplicate key error',
  FOREIGN_KEY_VIOLATION: 'Foreign key constraint violation',
  NOT_NULL_VIOLATION: 'Not null constraint violation',
  UNIQUE_VIOLATION: 'Unique constraint violation',
} as const;

// ============================================================================
// EMAIL TEMPLATES CONSTANTS
// ============================================================================
export const EMAIL_TEMPLATES = {
  USER_WELCOME: 'user-welcome',
  PASSWORD_RESET: 'password-reset',
  ROLE_ASSIGNED: 'role-assigned',
  PERMISSION_CHANGED: 'permission-changed',
} as const;

// ============================================================================
// FRONTEND TOAST MESSAGES (using API_RESPONSE_MESSAGES as base)
// ============================================================================
export const TOAST_MESSAGES = {
  SUCCESS: {
    // Authentication
    LOGIN_SUCCESS: API_RESPONSE_MESSAGES.SUCCESS.LOGIN_SUCCESS + '!',
    LOGOUT_SUCCESS: API_RESPONSE_MESSAGES.SUCCESS.LOGOUT_SUCCESS + '!',
    PASSWORD_RESET: API_RESPONSE_MESSAGES.SUCCESS.PASSWORD_RESET + '!',
    PASSWORD_CHANGED: API_RESPONSE_MESSAGES.SUCCESS.PASSWORD_CHANGED + '!',
    EMAIL_SENT: API_RESPONSE_MESSAGES.SUCCESS.EMAIL_SENT + '!',
    
    // Roles
    ROLE_CREATED: API_RESPONSE_MESSAGES.SUCCESS.ROLE_CREATED + '!',
    ROLE_UPDATED: API_RESPONSE_MESSAGES.SUCCESS.ROLE_UPDATED + '!',
    ROLE_DELETED: API_RESPONSE_MESSAGES.SUCCESS.ROLE_DELETED + '!',
    
    // Users
    USER_CREATED: API_RESPONSE_MESSAGES.SUCCESS.USER_CREATED + '!',
    USER_UPDATED: API_RESPONSE_MESSAGES.SUCCESS.USER_UPDATED + '!',
    PROFILE_UPDATED: API_RESPONSE_MESSAGES.SUCCESS.PROFILE_UPDATED + '!',
    USER_DELETED: API_RESPONSE_MESSAGES.SUCCESS.USER_DELETED + '!',
    
    // Clients
    CLIENT_CREATED: API_RESPONSE_MESSAGES.SUCCESS.CLIENT_CREATED + '!',
    CLIENT_UPDATED: API_RESPONSE_MESSAGES.SUCCESS.CLIENT_UPDATED + '!',
    CLIENT_DELETED: API_RESPONSE_MESSAGES.SUCCESS.CLIENT_DELETED + '!',
    
    // Projects
    PROJECT_CREATED: API_RESPONSE_MESSAGES.SUCCESS.PROJECT_CREATED + '!',
    PROJECT_UPDATED: API_RESPONSE_MESSAGES.SUCCESS.PROJECT_UPDATED + '!',
    PROJECT_DELETED: API_RESPONSE_MESSAGES.SUCCESS.PROJECT_DELETED + '!',
    
    // Inventory
    INVENTORY_CHECKIN: API_RESPONSE_MESSAGES.SUCCESS.INVENTORY_CHECKIN + '!',
    INVENTORY_UPDATED: API_RESPONSE_MESSAGES.SUCCESS.INVENTORY_UPDATED + '!',
    INVENTORY_DELETED: API_RESPONSE_MESSAGES.SUCCESS.INVENTORY_DELETED + '!',
    
    // Generic
    CREATED: 'Created successfully!',
    UPDATED: 'Updated successfully!',
    DELETED: 'Deleted successfully!',
  },

  ERROR: {
    // Authentication Errors
    LOGIN_FAILED: 'Login failed',
    INVALID_CREDENTIALS: API_RESPONSE_MESSAGES.ERROR.INVALID_CREDENTIALS,
    EMAIL_NOT_FOUND: API_RESPONSE_MESSAGES.ERROR.EMAIL_NOT_FOUND,
    INCORRECT_PASSWORD: API_RESPONSE_MESSAGES.ERROR.INCORRECT_PASSWORD,
    PASSWORD_CHANGE_FAILED: API_RESPONSE_MESSAGES.ERROR.PASSWORD_CHANGE_FAILED,
    ACCOUNT_INACTIVE: API_RESPONSE_MESSAGES.ERROR.ACCOUNT_INACTIVE,
    UNAUTHORIZED: API_RESPONSE_MESSAGES.ERROR.UNAUTHORIZED,
    
    // Authorization Errors
    FORBIDDEN: API_RESPONSE_MESSAGES.ERROR.FORBIDDEN,
    PERMISSION_DENIED: API_RESPONSE_MESSAGES.ERROR.PERMISSION_DENIED,
    
    // Validation Errors
    VALIDATION_FAILED: API_RESPONSE_MESSAGES.ERROR.VALIDATION_ERROR,
    INVALID_EMAIL_FORMAT: API_RESPONSE_MESSAGES.ERROR.INVALID_EMAIL,
    PASSWORD_TOO_SHORT: API_RESPONSE_MESSAGES.ERROR.PASSWORD_TOO_SHORT,
    APP_PERMISSION_REQUIRED: 'Please select at least one app permission',
    
    // Resource Errors
    ROLE_NOT_FOUND: API_RESPONSE_MESSAGES.ERROR.ROLE_NOT_FOUND,
    USER_NOT_FOUND: API_RESPONSE_MESSAGES.ERROR.USER_NOT_FOUND,
    PROJECT_NOT_FOUND: API_RESPONSE_MESSAGES.ERROR.PROJECT_NOT_FOUND,
    NOT_FOUND: API_RESPONSE_MESSAGES.ERROR.RESOURCE_NOT_FOUND,
    DUPLICATE_PROJECT_CODE: API_RESPONSE_MESSAGES.ERROR.DUPLICATE_PROJECT_CODE,
    
    // Operation Errors
    ROLE_CREATE_FAILED: 'Failed to create role',
    ROLE_UPDATE_FAILED: 'Failed to update role',
    ROLE_DELETE_FAILED: 'Failed to delete role',
    ROLE_FETCH_FAILED: 'Failed to fetch roles',
    USER_CREATE_FAILED: 'Failed to create user',
    USER_UPDATE_FAILED: 'Failed to update user',
    USER_DELETE_FAILED: 'Failed to delete user',
    USER_FETCH_FAILED: 'Failed to fetch users',
    CLIENT_CREATE_FAILED: 'Failed to create client',
    CLIENT_UPDATE_FAILED: 'Failed to update client',
    CLIENT_DELETE_FAILED: 'Failed to delete client',
    CLIENT_FETCH_FAILED: 'Failed to fetch clients',
    PROJECT_CREATE_FAILED: 'Failed to create project',
    PROJECT_UPDATE_FAILED: 'Failed to update project',
    PROJECT_DELETE_FAILED: 'Failed to delete project',
    PROJECT_FETCH_FAILED: 'Failed to fetch projects',
    FETCH_FAILED: API_RESPONSE_MESSAGES.ERROR.FETCH_FAILED,
    SAVE_FAILED: API_RESPONSE_MESSAGES.ERROR.SAVE_FAILED,
    UPDATE_FAILED: API_RESPONSE_MESSAGES.ERROR.UPDATE_FAILED,
    DELETE_FAILED: API_RESPONSE_MESSAGES.ERROR.DELETE_FAILED,
    
    // Server Errors
    SERVER_ERROR: API_RESPONSE_MESSAGES.ERROR.SERVER_ERROR.replace('Internal ', '') + ' occurred',
    DATABASE_ERROR: API_RESPONSE_MESSAGES.ERROR.DATABASE_ERROR,
    
    // Network Errors
    NETWORK_ERROR: API_RESPONSE_MESSAGES.ERROR.NETWORK_ERROR + ' occurred',
    CONNECTION_ERROR: API_RESPONSE_MESSAGES.ERROR.CONNECTION_ERROR,
    TIMEOUT_ERROR: API_RESPONSE_MESSAGES.ERROR.TIMEOUT_ERROR,
  },

  INFO: {
    LOADING: 'Loading...',
    PROCESSING: 'Processing...',
    SAVING: 'Saving...',
  },

  WARNING: {
    UNSAVED_CHANGES: 'You have unsaved changes',
    CONFIRM_DELETE: 'Are you sure you want to delete?',
    PERMISSION_DENIED: API_RESPONSE_MESSAGES.ERROR.PERMISSION_DENIED,
  },
} as const;


// ============================================================================
// FORM VALIDATION MESSAGES
// ============================================================================
export const VALIDATION_MESSAGES = {
  REQUIRED: 'This field is required',
  EMAIL_INVALID: 'Please enter a valid email address',
  PASSWORD_MIN_LENGTH: 'Password must be at least 6 characters',
  PASSWORD_MIN_LENGTH_8: 'Password must be at least 8 characters',
  PASSWORD_COMPLEXITY: 'Password must contain at least one uppercase letter, one lowercase letter, and one number',
  PASSWORD_MISMATCH: "Passwords don't match",
  PASSWORD_CONFIRM: 'Please confirm your password',
  NAME_MIN_LENGTH: 'Name must be at least 2 characters',
  NAME_MAX_LENGTH: 'Name must be less than 100 characters',
  PHONE_INVALID: 'Please enter a valid phone number',
  PHONE_NUMBERS_ONLY: 'Phone number must contain only numbers',
  ROLE_REQUIRED: 'Please select a role',
  PERMISSION_REQUIRED: 'Please select at least one permission',
  URL_INVALID: 'Please enter a valid URL',
} as const;

// ============================================================================
// EXPORT ALL CONSTANTS
// ============================================================================
const constants = {
  API_RESPONSE_MESSAGES,
  HTTP_STATUS,
  DATABASE_MESSAGES,
  EMAIL_TEMPLATES,
  TOAST_MESSAGES,
  VALIDATION_MESSAGES,
};

export default constants;
