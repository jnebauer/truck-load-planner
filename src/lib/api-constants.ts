// Backend API Response Messages Constants
export const API_RESPONSE_MESSAGES = {
  SUCCESS: {
    ROLE_CREATED: 'Role created successfully',
    ROLE_UPDATED: 'Role updated successfully',
    ROLE_DELETED: 'Role deleted successfully',
    USER_CREATED: 'User created successfully',
    USER_UPDATED: 'User updated successfully',
    USER_DELETED: 'User deleted successfully',
    LOGIN_SUCCESS: 'Login successful',
    LOGOUT_SUCCESS: 'Logout successful',
    PASSWORD_RESET: 'Password reset successfully',
    EMAIL_SENT: 'Email sent successfully',
  },

  ERROR: {
    // Authentication Errors
    UNAUTHORIZED: 'Unauthorized access',
    INVALID_TOKEN: 'Invalid or expired token',
    TOKEN_REQUIRED: 'Authorization token is required',
    INVALID_CREDENTIALS: 'Invalid email or password',
    
    // Authorization Errors
    FORBIDDEN: 'Access forbidden',
    INSUFFICIENT_PERMISSIONS: 'Insufficient permissions',
    
    // Validation Errors
    VALIDATION_ERROR: 'Validation error',
    INVALID_DATA: 'Invalid data provided',
    MISSING_REQUIRED_FIELDS: 'Missing required fields',
    INVALID_EMAIL: 'Invalid email format',
    INVALID_PASSWORD: 'Invalid password format',
    PASSWORD_TOO_SHORT: 'Password must be at least 6 characters',
    
    // Resource Errors
    ROLE_NOT_FOUND: 'Role not found',
    USER_NOT_FOUND: 'User not found',
    RESOURCE_NOT_FOUND: 'Resource not found',
    DUPLICATE_ROLE: 'Role with this name already exists',
    DUPLICATE_USER: 'User with this email already exists',
    DUPLICATE_EMAIL: 'Email already exists',
    
    // Permission Errors
    INVALID_PERMISSIONS: 'Invalid permissions provided',
    PERMISSION_DENIED: 'Permission denied',
    
    // Server Errors
    SERVER_ERROR: 'Internal server error',
    DATABASE_ERROR: 'Database error',
    EMAIL_SEND_ERROR: 'Failed to send email',
    FILE_UPLOAD_ERROR: 'File upload failed',
    
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

// HTTP Status Codes
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

// Database Error Messages
export const DATABASE_MESSAGES = {
  CONNECTION_FAILED: 'Database connection failed',
  QUERY_FAILED: 'Database query failed',
  CONSTRAINT_VIOLATION: 'Database constraint violation',
  DUPLICATE_KEY: 'Duplicate key error',
  FOREIGN_KEY_VIOLATION: 'Foreign key constraint violation',
  NOT_NULL_VIOLATION: 'Not null constraint violation',
  UNIQUE_VIOLATION: 'Unique constraint violation',
} as const;

// Email Templates Constants
export const EMAIL_TEMPLATES = {
  USER_WELCOME: 'user-welcome',
  PASSWORD_RESET: 'password-reset',
  ROLE_ASSIGNED: 'role-assigned',
  PERMISSION_CHANGED: 'permission-changed',
} as const;

// Export all constants
const apiConstants = {
  API_RESPONSE_MESSAGES,
  HTTP_STATUS,
  DATABASE_MESSAGES,
  EMAIL_TEMPLATES,
};

export default apiConstants;
