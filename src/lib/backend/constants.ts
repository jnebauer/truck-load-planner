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
    INVENTORY_FETCHED: 'Inventory fetched successfully',
    PALLET_AVAILABLE: 'Pallet number is available',
    SKU_AVAILABLE: 'SKU is available',
    
    // Import
    IMPORT_COMPLETED: 'Import completed successfully',
    CSV_PARSED: 'CSV file parsed successfully',
    IMPORT_STARTED: 'Import process started',
    
    // Upload
    UPLOAD_SUCCESS: 'File uploaded successfully',
    IMAGE_UPLOADED: 'Image uploaded successfully',
    
    // Media / Photos
    PHOTO_DELETED: 'Photo deleted',
    MEDIA_ATTACHED: 'Media attached successfully',
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
    DUPLICATE_PALLET: 'Pallet number already exists',
    DUPLICATE_SKU: 'SKU already exists',
    INVENTORY_NOT_FOUND: 'Inventory not found',
    CLIENT_NOT_FOUND: 'Client not found',
    
    // Permission Errors
    INVALID_PERMISSIONS: 'Invalid permissions provided',
    APP_PERMISSION_REQUIRED: 'User must have at least one app permission',
    
    // Import Errors
    IMPORT_FAILED: 'Import failed',
    CSV_PARSE_ERROR: 'Failed to parse CSV file',
    CSV_EMPTY: 'CSV file is empty',
    CSV_INVALID_FORMAT: 'Invalid CSV file format',
    CSV_MISSING_HEADERS: 'CSV file missing required headers',
    IMPORT_VALIDATION_ERROR: 'Import validation failed',
    
    // Upload / File Errors
    NO_FILE_PROVIDED: 'No file provided',
    INVALID_FILE_TYPE: 'Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed',
    FILE_SIZE_TOO_LARGE: 'File size too large. Maximum size is 5MB',
    UPLOAD_FAILED: 'Failed to upload image',
    
    // Media / Photo Errors
    URL_TAG_REQUIRED: 'URL and tag are required',
    MEDIA_ID_REQUIRED: 'Media ID is required',
    MEDIA_NOT_FOUND: 'Media not found',
    PHOTO_DELETE_FAILED: 'Failed to delete photo',
    MEDIA_ATTACH_FAILED: 'Failed to attach media',
    
    // User / Client Specific Errors
    PASSWORD_REQUIRED_FOR_NEW_USER: 'Password is required when creating a new user',
    PASSWORD_REQUIRED_FOR_NEW_CLIENT: 'Password is required when creating a new client',
    CLIENT_ROLE_NOT_FOUND: 'Client role not found in database',
    CLIENTS_ROLE_NOT_FOUND: 'clients role not found in database. Please ensure "clients" role exists.',
    USER_CREATE_FAILED: 'Failed to create user',
    CLIENT_CREATE_FAILED: 'Failed to create client',
    APP_LIST_FETCH_FAILED: 'Failed to fetch application list',
    USER_IS_NOT_CLIENT: 'User is not a client',
    CANNOT_DELETE_ROLE_WITH_USERS: 'Cannot delete role that has users assigned to it',
    
    // Token / Session Errors
    RESET_TOKEN_INVALID: 'Invalid or expired reset token',
    RESET_TOKEN_EXPIRED: 'Reset token has expired. Please request a new password reset.',
    TOKEN_REQUIRED_PARAM: 'Token is required',
    USER_INACTIVE: 'User not found or inactive',
    PASSWORD_UPDATE_FAILED: 'Failed to update password',
    
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
    PALLET_AVAILABLE: API_RESPONSE_MESSAGES.SUCCESS.PALLET_AVAILABLE,
    SKU_AVAILABLE: API_RESPONSE_MESSAGES.SUCCESS.SKU_AVAILABLE,
    
    // Import
    IMPORT_COMPLETED: API_RESPONSE_MESSAGES.SUCCESS.IMPORT_COMPLETED + '!',
    CSV_PARSED: API_RESPONSE_MESSAGES.SUCCESS.CSV_PARSED + '!',
    IMPORT_STARTED: API_RESPONSE_MESSAGES.SUCCESS.IMPORT_STARTED + '!',
    
    // Upload / Media
    IMAGE_UPLOADED: API_RESPONSE_MESSAGES.SUCCESS.IMAGE_UPLOADED + '!',
    PHOTO_DELETED: API_RESPONSE_MESSAGES.SUCCESS.PHOTO_DELETED + '!',
    MEDIA_ATTACHED: API_RESPONSE_MESSAGES.SUCCESS.MEDIA_ATTACHED + '!',
    
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
    INVENTORY_CREATE_FAILED: 'Failed to check in inventory',
    INVENTORY_UPDATE_FAILED: 'Failed to update inventory',
    INVENTORY_DELETE_FAILED: 'Failed to delete inventory',
    INVENTORY_FETCH_FAILED: 'Failed to fetch inventory',
    DUPLICATE_PALLET: API_RESPONSE_MESSAGES.ERROR.DUPLICATE_PALLET,
    DUPLICATE_SKU: API_RESPONSE_MESSAGES.ERROR.DUPLICATE_SKU,
    INVENTORY_NOT_FOUND: API_RESPONSE_MESSAGES.ERROR.INVENTORY_NOT_FOUND,
    CLIENT_NOT_FOUND: API_RESPONSE_MESSAGES.ERROR.CLIENT_NOT_FOUND,
    PALLET_CHECK_FAILED: 'Failed to check pallet number',
    SKU_CHECK_FAILED: 'Failed to check SKU',
    
    // Import Errors
    IMPORT_FAILED: API_RESPONSE_MESSAGES.ERROR.IMPORT_FAILED,
    CSV_PARSE_ERROR: API_RESPONSE_MESSAGES.ERROR.CSV_PARSE_ERROR,
    CSV_EMPTY: API_RESPONSE_MESSAGES.ERROR.CSV_EMPTY,
    CSV_INVALID_FORMAT: API_RESPONSE_MESSAGES.ERROR.CSV_INVALID_FORMAT,
    CSV_MISSING_HEADERS: API_RESPONSE_MESSAGES.ERROR.CSV_MISSING_HEADERS,
    IMPORT_VALIDATION_ERROR: API_RESPONSE_MESSAGES.ERROR.IMPORT_VALIDATION_ERROR,
    
    // Upload / File Errors  
    NO_FILE_PROVIDED: API_RESPONSE_MESSAGES.ERROR.NO_FILE_PROVIDED,
    INVALID_FILE_TYPE: API_RESPONSE_MESSAGES.ERROR.INVALID_FILE_TYPE,
    FILE_SIZE_TOO_LARGE: API_RESPONSE_MESSAGES.ERROR.FILE_SIZE_TOO_LARGE,
    UPLOAD_FAILED: API_RESPONSE_MESSAGES.ERROR.UPLOAD_FAILED,
    
    // Media / Photo Errors
    URL_TAG_REQUIRED: API_RESPONSE_MESSAGES.ERROR.URL_TAG_REQUIRED,
    MEDIA_ID_REQUIRED: API_RESPONSE_MESSAGES.ERROR.MEDIA_ID_REQUIRED,
    MEDIA_NOT_FOUND: API_RESPONSE_MESSAGES.ERROR.MEDIA_NOT_FOUND,
    PHOTO_DELETE_FAILED: API_RESPONSE_MESSAGES.ERROR.PHOTO_DELETE_FAILED,
    MEDIA_ATTACH_FAILED: API_RESPONSE_MESSAGES.ERROR.MEDIA_ATTACH_FAILED,
    
    // User / Client Errors
    PASSWORD_REQUIRED_FOR_NEW_USER: API_RESPONSE_MESSAGES.ERROR.PASSWORD_REQUIRED_FOR_NEW_USER,
    PASSWORD_REQUIRED_FOR_NEW_CLIENT: API_RESPONSE_MESSAGES.ERROR.PASSWORD_REQUIRED_FOR_NEW_CLIENT,
    CLIENT_ROLE_NOT_FOUND: API_RESPONSE_MESSAGES.ERROR.CLIENT_ROLE_NOT_FOUND,
    CLIENTS_ROLE_NOT_FOUND: API_RESPONSE_MESSAGES.ERROR.CLIENTS_ROLE_NOT_FOUND,
    USER_CREATE_FAILED_API: API_RESPONSE_MESSAGES.ERROR.USER_CREATE_FAILED,
    CLIENT_CREATE_FAILED_API: API_RESPONSE_MESSAGES.ERROR.CLIENT_CREATE_FAILED,
    APP_LIST_FETCH_FAILED: API_RESPONSE_MESSAGES.ERROR.APP_LIST_FETCH_FAILED,
    USER_IS_NOT_CLIENT: API_RESPONSE_MESSAGES.ERROR.USER_IS_NOT_CLIENT,
    CANNOT_DELETE_ROLE_WITH_USERS: API_RESPONSE_MESSAGES.ERROR.CANNOT_DELETE_ROLE_WITH_USERS,
    
    // Token / Session Errors
    RESET_TOKEN_INVALID: API_RESPONSE_MESSAGES.ERROR.RESET_TOKEN_INVALID,
    RESET_TOKEN_EXPIRED: API_RESPONSE_MESSAGES.ERROR.RESET_TOKEN_EXPIRED,
    TOKEN_REQUIRED_PARAM: API_RESPONSE_MESSAGES.ERROR.TOKEN_REQUIRED_PARAM,
    USER_INACTIVE: API_RESPONSE_MESSAGES.ERROR.USER_INACTIVE,
    PASSWORD_UPDATE_FAILED: API_RESPONSE_MESSAGES.ERROR.PASSWORD_UPDATE_FAILED,
    
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
  
  // Inventory Form Validation
  CLIENT_REQUIRED: 'Please select a client',
  ITEM_LABEL_REQUIRED: 'Item label is required',
  ITEM_LABEL_MIN_LENGTH: 'Item label must be at least 2 characters',
  ITEM_LABEL_MAX_LENGTH: 'Item label must not exceed 200 characters',
  SKU_REQUIRED: 'SKU / Item Code is required',
  SKU_MIN_LENGTH: 'SKU must be at least 2 characters',
  SKU_MAX_LENGTH: 'SKU must not exceed 100 characters',
  LENGTH_REQUIRED: 'Length is required',
  LENGTH_INVALID: 'Length must be a valid number',
  LENGTH_MUST_BE_POSITIVE: 'Length must be greater than 0',
  WIDTH_REQUIRED: 'Width is required',
  WIDTH_INVALID: 'Width must be a valid number',
  WIDTH_MUST_BE_POSITIVE: 'Width must be greater than 0',
  HEIGHT_REQUIRED: 'Height is required',
  HEIGHT_INVALID: 'Height must be a valid number',
  HEIGHT_MUST_BE_POSITIVE: 'Height must be greater than 0',
  VOLUME_REQUIRED: 'Volume is required',
  VOLUME_INVALID: 'Volume must be a valid number',
  VOLUME_MUST_BE_POSITIVE: 'Volume must be greater than 0',
  WEIGHT_REQUIRED: 'Weight is required',
  WEIGHT_INVALID: 'Weight must be a valid number',
  WEIGHT_MUST_BE_POSITIVE: 'Weight must be greater than 0',
  TOP_LOAD_RATING_REQUIRED: 'Top Load Rating is required',
  TOP_LOAD_RATING_INVALID: 'Top Load Rating must be a valid number',
  TOP_LOAD_RATING_NEGATIVE: 'Top Load Rating must be greater than 0',
  PRIORITY_INVALID: 'Loading Priority must be a valid number',
  PRIORITY_MUST_BE_INTEGER: 'Loading Priority must be an integer',
  PRIORITY_MUST_BE_POSITIVE: 'Loading Priority must be greater than 0',
  QUANTITY_INVALID: 'Quantity must be a valid number',
  PALLET_NUMBER_REQUIRED: 'Pallet Number is required',
  PALLET_NUMBER_MIN_LENGTH: 'Pallet Number must be at least 2 characters',
  PALLET_NUMBER_MAX_LENGTH: 'Pallet Number must not exceed 100 characters',
  INVENTORY_DATE_REQUIRED: 'Inventory Date is required',
  INVENTORY_DATE_INVALID: 'Inventory Date must be a valid date',
  LOCATION_SITE_REQUIRED: 'Warehouse location is required',
  QUANTITY_MUST_BE_INTEGER: 'Quantity must be an integer',
  QUANTITY_MUST_BE_POSITIVE: 'Quantity must be greater than 0',
  
  // CSV Import Validation - Field-specific messages
  CSV_CLIENT_NAME_REQUIRED: 'Client Name is required',
  CSV_CLIENT_NAME_MIN_LENGTH: 'Client Name must be at least 2 characters',
  CSV_CLIENT_EMAIL_REQUIRED: 'Client Email is required',
  CSV_CLIENT_EMAIL_INVALID: 'Client Email must be a valid email address',
  CSV_ITEM_LABEL_REQUIRED: 'Item Label is required',
  CSV_SKU_REQUIRED: 'SKU / Item Code is required',
  CSV_PALLET_NUMBER_REQUIRED: 'Pallet Number is required',
  CSV_INVENTORY_DATE_REQUIRED: 'Inventory Date is required',
  CSV_INVENTORY_DATE_INVALID: 'Inventory Date must be a valid date (YYYY-MM-DD)',
  CSV_INVENTORY_DATE_PAST: 'Inventory Date cannot be in the past',
  CSV_LENGTH_REQUIRED: 'Length is required',
  CSV_LENGTH_INVALID: 'Length must be a valid number',
  CSV_LENGTH_MUST_BE_POSITIVE: 'Length must be greater than 0',
  CSV_WIDTH_REQUIRED: 'Width is required',
  CSV_WIDTH_INVALID: 'Width must be a valid number',
  CSV_WIDTH_MUST_BE_POSITIVE: 'Width must be greater than 0',
  CSV_HEIGHT_REQUIRED: 'Height is required',
  CSV_HEIGHT_INVALID: 'Height must be a valid number',
  CSV_HEIGHT_MUST_BE_POSITIVE: 'Height must be greater than 0',
  CSV_VOLUME_REQUIRED: 'Volume is required',
  CSV_VOLUME_INVALID: 'Volume must be a valid number',
  CSV_VOLUME_MUST_BE_POSITIVE: 'Volume must be greater than 0',
  CSV_WEIGHT_REQUIRED: 'Weight is required',
  CSV_WEIGHT_INVALID: 'Weight must be a valid number',
  CSV_WEIGHT_CANNOT_BE_NEGATIVE: 'Weight must be greater than 0',
  CSV_TOP_LOAD_RATING_REQUIRED: 'Top Load Rating is required',
  CSV_TOP_LOAD_RATING_INVALID: 'Top Load Rating must be a valid number',
  CSV_TOP_LOAD_RATING_CANNOT_BE_NEGATIVE: 'Top Load Rating must be greater than 0',
  CSV_LOADING_PRIORITY_INVALID: 'Loading Priority must be a valid number',
  CSV_LOADING_PRIORITY_MUST_BE_POSITIVE: 'Loading Priority must be greater than 0',
  CSV_QUANTITY_REQUIRED: 'Quantity is required',
  CSV_QUANTITY_INVALID: 'Quantity must be a valid number',
  CSV_QUANTITY_MUST_BE_POSITIVE: 'Quantity must be greater than 0',
  CSV_STACKABILITY_REQUIRED: 'Stackability is required',
  CSV_STACKABILITY_INVALID: 'Stackability must be one of: stackable, non_stackable, top_only, bottom_only',
  CSV_STATUS_REQUIRED: 'Status is required',
  CSV_STATUS_INVALID: 'Status must be one of: in_storage, reserved, on_truck, onsite, returned',
  CSV_LOCATION_SITE_REQUIRED: 'Warehouse location is required',
  
  // CSV Import Validation - General messages
  MISSING_FIELD: 'Missing',
  DUPLICATE_IN_CSV: 'Duplicate',
  ALREADY_EXISTS_IN_DB: 'already exists in database',
  CSV_PALLET_EXISTS_IN_DB: 'Pallet Number already exists',
  CSV_SKU_EXISTS_IN_DB: 'SKU already exist',
  CSV_PALLET_DUPLICATE_IN_CSV: 'Duplicate Pallet Number found in CSV',
  CSV_SKU_DUPLICATE_IN_CSV: 'Duplicate SKU found in CSV',
  NEGATIVE_VALUE: 'cannot be negative',
  INVALID_NUMBER: 'must be a valid number',
  INVALID_DATE: 'must be a valid date (YYYY-MM-DD)',
  INVALID_ADDRESS: 'must be a valid address',
  INVALID_OPTION: 'has invalid value',
  MUST_BE_TRUE_FALSE: 'must be TRUE or FALSE',
  MUST_BE_POSITIVE: 'must be a positive number',
  CHECKING_DATABASE: 'Checking Database...',
  VERIFYING_RECORDS: 'Please wait while we verify records in the system.',
  VALIDATION_PASSED: 'Validation Passed',
  VALIDATION_FAILED: 'Validation Failed',
  ALL_CHECKS_PASSED: 'All validation checks passed! Ready to import.',
  FIX_ERRORS_BEFORE_IMPORT: 'Please fix the validation errors highlighted in red before importing.',
  VALIDATION_ERRORS_FOUND: 'Validation Errors Found',
  ROWS_WITH_ERRORS: 'rows with errors',
  FIX_ERRORS_INSTRUCTION: 'Please fix validation errors before importing',
  START_IMPORT_PROCESS: 'Start import process',
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
